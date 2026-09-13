package com.aegisiq.backend.findings.controller;

import com.aegisiq.backend.findings.dto.FindingResponse;
import com.aegisiq.backend.findings.service.FindingService;
import com.aegisiq.backend.users.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/findings")
@Tag(name = "Findings", description = "Security findings management")
@SecurityRequirement(name = "Bearer Authentication")
public class FindingController {

    private final FindingService findingService;

    public FindingController(FindingService findingService) {
        this.findingService = findingService;
    }

    @GetMapping
    @Operation(summary = "List findings for a project with optional filters")
    public ResponseEntity<Page<FindingResponse>> listFindings(
            @PathVariable UUID projectId,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        Page<FindingResponse> results = findingService.listFindings(
                projectId, severity, status, category, currentUser,
                PageRequest.of(page, size, Sort.by("riskScore").descending()));
        return ResponseEntity.ok(results);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get finding severity and status counts for dashboard")
    public ResponseEntity<Map<String, Long>> getSummary(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(findingService.getProjectFindingSummary(projectId, currentUser));
    }

    @GetMapping("/{findingId}")
    @Operation(summary = "Get a specific finding by ID")
    public ResponseEntity<FindingResponse> getFinding(
            @PathVariable UUID projectId,
            @PathVariable UUID findingId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(findingService.getFinding(projectId, findingId, currentUser));
    }

    @PatchMapping("/{findingId}/status")
    @Operation(summary = "Update a finding's triage status")
    public ResponseEntity<FindingResponse> updateStatus(
            @PathVariable UUID projectId,
            @PathVariable UUID findingId,
            @RequestParam String status,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(findingService.updateFindingStatus(projectId, findingId, status, currentUser));
    }
}
