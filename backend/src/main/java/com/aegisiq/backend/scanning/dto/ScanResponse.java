package com.aegisiq.backend.scanning.dto;

import com.aegisiq.backend.scanning.domain.Scan;
import com.aegisiq.backend.scanning.domain.ScanStatus;

import java.time.Instant;
import java.util.UUID;

public record ScanResponse(
    UUID id,
    UUID projectId,
    UUID repositoryId,
    UUID triggeredBy,
    ScanStatus status,
    Instant startedAt,
    Instant completedAt,
    int filesScanned,
    int findingsCount,
    String errorSummary,
    Instant createdAt
) {
    public static ScanResponse from(Scan scan) {
        return new ScanResponse(
            scan.getId(),
            scan.getProjectId(),
            scan.getRepositoryId(),
            scan.getTriggeredBy(),
            scan.getStatus(),
            scan.getStartedAt(),
            scan.getCompletedAt(),
            scan.getFilesScanned(),
            scan.getFindingsCount(),
            scan.getErrorSummary(),
            scan.getCreatedAt()
        );
    }
}
