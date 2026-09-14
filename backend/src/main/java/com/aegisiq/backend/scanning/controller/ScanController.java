package com.aegisiq.backend.scanning.controller;

import com.aegisiq.backend.scanning.domain.Scan;
import com.aegisiq.backend.scanning.dto.ScanResponse;
import com.aegisiq.backend.scanning.service.ScanService;
import com.aegisiq.backend.users.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/scans")
@Tag(name = "Scans", description = "Code scanning operations")
@SecurityRequirement(name = "Bearer Authentication")
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and scan a repository archive (.zip)")
    public ResponseEntity<ScanResponse> uploadAndScan(
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean isZipFilename = filename != null && filename.toLowerCase().endsWith(".zip");
        boolean isZipContentType = contentType != null && (contentType.contains("zip") || contentType.contains("octet-stream") || contentType.contains("compressed"));

        if (!isZipFilename && !isZipContentType) {
            throw new IllegalArgumentException("Only .zip archives are accepted for scanning.");
        }

        Scan scan = scanService.initiateUploadScan(projectId, file, currentUser);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ScanResponse.from(scan));
    }

    @GetMapping
    @Operation(summary = "List scans for a project")
    public ResponseEntity<Page<ScanResponse>> listScans(
            @PathVariable UUID projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        Page<ScanResponse> results = scanService.listScans(
                projectId, currentUser, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(ScanResponse::from);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{scanId}")
    @Operation(summary = "Get scan status and summary by ID")
    public ResponseEntity<ScanResponse> getScan(
            @PathVariable UUID projectId,
            @PathVariable UUID scanId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ScanResponse.from(scanService.getScan(projectId, scanId, currentUser)));
    }
}
