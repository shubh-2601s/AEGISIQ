package com.aegisiq.backend.scanning.service;

import com.aegisiq.backend.common.exception.ResourceNotFoundException;
import com.aegisiq.backend.findings.domain.Finding;
import com.aegisiq.backend.findings.repository.FindingRepository;
import com.aegisiq.backend.projects.repository.ProjectRepository;
import com.aegisiq.backend.scanning.domain.Scan;
import com.aegisiq.backend.scanning.domain.ScanStatus;
import com.aegisiq.backend.scanning.engine.SastEngine;
import com.aegisiq.backend.scanning.repository.ScanRepository;
import com.aegisiq.backend.users.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Scan orchestration service.
 *
 * SECURITY (Zero-Execution Policy — ADR-001):
 * - Uploaded archives are processed ENTIRELY in-memory (never to disk or temp)
 * - Files are NEVER compiled or executed
 * - Per-file and per-archive size limits enforced
 * - Path traversal in zip entries blocked by canonicalization
 */
@Service
public class ScanService {

    private static final Logger log = LoggerFactory.getLogger(ScanService.class);
    private static final Set<String> SCANNABLE_EXTENSIONS = Set.of(
        ".java", ".js", ".ts", ".jsx", ".tsx", ".py", ".php", ".cs",
        ".go", ".rb", ".kt", ".scala", ".c", ".cpp", ".h", ".rs",
        ".yml", ".yaml", ".json", ".xml", ".html", ".sh", ".env", ".conf", ".properties"
    );

    private final ScanRepository scanRepository;
    private final FindingRepository findingRepository;
    private final ProjectRepository projectRepository;
    private final SastEngine sastEngine;

    @Value("${aegisiq.scanning.max-archive-size-bytes:52428800}")
    private long maxArchiveBytes;

    @Value("${aegisiq.scanning.max-extracted-size-bytes:262144000}")
    private long maxExtractedBytes;

    @Value("${aegisiq.scanning.max-file-count:5000}")
    private int maxFileCount;

    @Value("${aegisiq.scanning.max-single-file-size-bytes:2097152}")
    private long maxSingleFileBytes;

    public ScanService(ScanRepository scanRepository, FindingRepository findingRepository,
                       ProjectRepository projectRepository, SastEngine sastEngine) {
        this.scanRepository = scanRepository;
        this.findingRepository = findingRepository;
        this.projectRepository = projectRepository;
        this.sastEngine = sastEngine;
    }

    /**
     * Initiates a scan by creating a QUEUED scan record, then executes asynchronously.
     */
    @Transactional
    public Scan initiateUploadScan(UUID projectId, MultipartFile file, User currentUser) {
        // Verify project belongs to user's org
        projectRepository.findByIdAndOrgId(projectId, currentUser.getOrgId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));

        if (file.getSize() > maxArchiveBytes) {
            throw new IllegalArgumentException("Archive exceeds maximum allowed size of " +
                    (maxArchiveBytes / 1024 / 1024) + "MB");
        }

        Scan scan = new Scan();
        scan.setProjectId(projectId);
        scan.setTriggeredBy(currentUser.getId());
        scan.setStatus(ScanStatus.QUEUED);
        scan = scanRepository.save(scan);

        // Launch async scan worker
        try {
            byte[] archiveBytes = file.getBytes();
            executeScan(scan.getId(), archiveBytes);
        } catch (IOException e) {
            markFailed(scan, "Failed to read uploaded archive: " + e.getMessage());
        }

        return scan;
    }

    @Async
    @Transactional
    public void executeScan(UUID scanId, byte[] archiveBytes) {
        Scan scan = scanRepository.findById(scanId).orElseThrow();
        scan.setStatus(ScanStatus.RUNNING);
        scan.setStartedAt(Instant.now());
        scanRepository.save(scan);

        int filesScanned = 0;
        int findingsCount = 0;
        long totalExtracted = 0;

        try (ZipInputStream zipIn = new ZipInputStream(new ByteArrayInputStream(archiveBytes))) {
            ZipEntry entry;
            while ((entry = zipIn.getNextEntry()) != null) {
                if (filesScanned >= maxFileCount) break;
                if (entry.isDirectory()) { zipIn.closeEntry(); continue; }

                String entryName = sanitizeZipEntryPath(entry.getName());
                if (entryName == null) { zipIn.closeEntry(); continue; }

                String extension = getExtension(entryName).toLowerCase();
                if (!SCANNABLE_EXTENSIONS.contains(extension)) { zipIn.closeEntry(); continue; }

                // Read with size limit enforcement
                byte[] fileBytes = readLimited(zipIn, maxSingleFileBytes);
                totalExtracted += fileBytes.length;

                if (totalExtracted > maxExtractedBytes) {
                    log.warn("Scan {} exceeded total extraction limit. Stopping.", scanId);
                    break;
                }

                String content = new String(fileBytes, StandardCharsets.UTF_8);
                List<Finding> findings = sastEngine.scanFile(entryName, content, scan.getId(), scan.getProjectId());

                for (Finding finding : findings) {
                    try {
                        findingRepository.save(finding);
                        findingsCount++;
                    } catch (DataIntegrityViolationException e) {
                        // Fingerprint already exists — deduplicated, skip
                        log.debug("Deduplicated finding: {} in {}", finding.getRuleId(), entryName);
                    }
                }

                filesScanned++;
                zipIn.closeEntry();
            }

            scan.setStatus(ScanStatus.COMPLETED);
            scan.setCompletedAt(Instant.now());
            scan.setFilesScanned(filesScanned);
            scan.setFindingsCount(findingsCount);
            scanRepository.save(scan);

            // Update project overall risk score from max open finding risk score
            java.math.BigDecimal maxRisk = findingRepository.findMaxRiskScoreByProjectId(scan.getProjectId())
                    .orElse(java.math.BigDecimal.ZERO);
            projectRepository.findById(scan.getProjectId()).ifPresent(p -> {
                p.setRiskScore(maxRisk);
                projectRepository.save(p);
            });

            log.info("Scan {} completed: {} files, {} findings, project risk score: {}", scanId, filesScanned, findingsCount, maxRisk);

        } catch (Exception e) {
            log.error("Scan {} failed: {}", scanId, e.getMessage(), e);
            markFailed(scan, "Scan failed: " + e.getClass().getSimpleName());
        }
    }

    @Transactional(readOnly = true)
    public Page<Scan> listScans(UUID projectId, User currentUser, Pageable pageable) {
        verifyProjectAccess(projectId, currentUser);
        return scanRepository.findAllByProjectId(projectId, pageable);
    }

    @Transactional(readOnly = true)
    public Scan getScan(UUID projectId, UUID scanId, User currentUser) {
        verifyProjectAccess(projectId, currentUser);
        return scanRepository.findByIdAndProjectId(scanId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Scan", scanId.toString()));
    }

    // --- Private helpers ---

    private void markFailed(Scan scan, String reason) {
        scan.setStatus(ScanStatus.FAILED);
        scan.setCompletedAt(Instant.now());
        scan.setErrorSummary(reason);
        scanRepository.save(scan);
    }

    private void verifyProjectAccess(UUID projectId, User user) {
        projectRepository.findByIdAndOrgId(projectId, user.getOrgId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }

    /**
     * Prevents Zip Slip: validates that the entry name doesn't escape the base directory.
     * Returns null if the path is unsafe.
     */
    private String sanitizeZipEntryPath(String entryName) {
        if (entryName == null || entryName.isBlank()) return null;
        // Normalize separator
        String normalized = entryName.replace("\\", "/");
        // Reject any path traversal attempts
        if (normalized.contains("../") || normalized.startsWith("/") || normalized.contains("..\\")) {
            log.warn("Zip Slip attempt detected — rejected entry: {}", entryName);
            return null;
        }
        return normalized;
    }

    private byte[] readLimited(InputStream in, long maxBytes) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        byte[] chunk = new byte[8192];
        long totalRead = 0;
        int n;
        while ((n = in.read(chunk)) != -1) {
            totalRead += n;
            if (totalRead > maxBytes) {
                throw new IOException("File exceeds maximum allowed size");
            }
            buffer.write(chunk, 0, n);
        }
        return buffer.toByteArray();
    }

    private String getExtension(String name) {
        int idx = name.lastIndexOf('.');
        return idx >= 0 ? name.substring(idx) : "";
    }
}
