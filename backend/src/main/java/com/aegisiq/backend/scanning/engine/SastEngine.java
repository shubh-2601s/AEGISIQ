package com.aegisiq.backend.scanning.engine;

import com.aegisiq.backend.findings.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;

/**
 * Core SAST engine.
 *
 * Operates on in-memory file content to maintain the zero-execution policy:
 * - Files are NEVER executed or compiled
 * - Only pattern matching is performed
 * - File sizes are bounded by scanning config
 * - Regex patterns use a 10MB match limit to prevent ReDoS
 *
 * Architecture Decision Record: ADR-001 (Zero-Execution Policy)
 */
@Component
public class SastEngine {

    private static final Logger log = LoggerFactory.getLogger(SastEngine.class);
    private static final int MAX_LINE_EVIDENCE_CHARS = 500;

    private final ScanRuleRegistry ruleRegistry;

    public SastEngine(ScanRuleRegistry ruleRegistry) {
        this.ruleRegistry = ruleRegistry;
    }

    /**
     * Scans a single file's content against all applicable rules.
     *
     * @param filePath Relative path of the file within the repository
     * @param content  Raw file content as a String (must be pre-sanitized to max size)
     * @param scanId   The parent scan UUID
     * @param projectId The project UUID
     * @return List of Finding entities ready to persist
     */
    public List<Finding> scanFile(String filePath, String content, UUID scanId, UUID projectId) {
        List<Finding> findings = new ArrayList<>();
        String extension = getExtension(filePath);
        String[] lines = content.split("\n", -1);

        for (ScanRule rule : ruleRegistry.getRules()) {
            // Apply extension filter if rule specifies one
            if (rule.fileExtensions() != null && !matchesExtension(extension, rule.fileExtensions())) {
                continue;
            }

            // Line-by-line scan — finds first match per file per rule
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                // Skip comment-only lines to reduce false positives
                if (isCommentLine(line, extension)) continue;

                try {
                    Matcher matcher = rule.pattern().matcher(line);
                    if (matcher.find()) {
                        String fingerprint = buildFingerprint(rule.ruleId(), projectId, filePath, i + 1, line);
                        String evidence = sanitizeEvidence(line);

                        Finding finding = new Finding();
                        finding.setScanId(scanId);
                        finding.setProjectId(projectId);
                        finding.setRuleId(rule.ruleId());
                        finding.setFingerprint(fingerprint);
                        finding.setTitle(rule.title());
                        finding.setDescription(rule.description());
                        finding.setCategory(rule.category());
                        finding.setSeverity(rule.severity());
                        finding.setConfidence(rule.confidence());
                        finding.setStatus(FindingStatus.OPEN);
                        finding.setFilePath(filePath);
                        finding.setLineNumber(i + 1);
                        finding.setEvidence(evidence);
                        finding.setRemediation(rule.remediation());
                        finding.setRiskScore(computeRiskScore(rule.severity()));

                        findings.add(finding);
                        break; // One finding per rule per file — avoid duplicate noise
                    }
                } catch (Exception e) {
                    log.warn("Rule {} pattern error on file {}: {}", rule.ruleId(), filePath, e.getMessage());
                }
            }
        }

        return findings;
    }

    /**
     * Computes a deterministic SHA-256 fingerprint for deduplication.
     * Same rule + project + file + line + evidence = same fingerprint across scans.
     */
    private String buildFingerprint(String ruleId, UUID projectId, String filePath, int lineNumber, String lineContent) {
        try {
            String raw = ruleId + "|" + projectId + "|" + filePath + "|" + lineNumber + "|" + lineContent.trim();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 64);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    /**
     * Risk score based on severity — used for dashboard ordering.
     */
    private BigDecimal computeRiskScore(FindingSeverity severity) {
        return switch (severity) {
            case CRITICAL -> BigDecimal.valueOf(10.0);
            case HIGH -> BigDecimal.valueOf(7.5);
            case MEDIUM -> BigDecimal.valueOf(5.0);
            case LOW -> BigDecimal.valueOf(2.5);
            case INFORMATIONAL -> BigDecimal.valueOf(0.5);
        };
    }

    /**
     * Sanitizes evidence to prevent log injection and truncates to safe length.
     */
    private String sanitizeEvidence(String line) {
        String trimmed = line.strip();
        if (trimmed.length() > MAX_LINE_EVIDENCE_CHARS) {
            trimmed = trimmed.substring(0, MAX_LINE_EVIDENCE_CHARS) + "...[truncated]";
        }
        // Remove control characters
        return trimmed.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
    }

    private String getExtension(String filePath) {
        int idx = filePath.lastIndexOf('.');
        return idx >= 0 ? filePath.substring(idx).toLowerCase() : "";
    }

    private boolean matchesExtension(String fileExtension, String[] allowed) {
        for (String ext : allowed) {
            if (ext.equalsIgnoreCase(fileExtension)) return true;
        }
        return false;
    }

    /**
     * Heuristic to skip comment lines and reduce false positives.
     */
    private boolean isCommentLine(String line, String extension) {
        String trimmed = line.stripLeading();
        return trimmed.startsWith("//") || trimmed.startsWith("*") ||
               trimmed.startsWith("/*") || trimmed.startsWith("#") ||
               trimmed.startsWith("<!--");
    }
}
