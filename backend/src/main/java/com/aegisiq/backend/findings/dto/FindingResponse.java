package com.aegisiq.backend.findings.dto;

import com.aegisiq.backend.findings.domain.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FindingResponse(
    UUID id,
    UUID scanId,
    UUID projectId,
    String ruleId,
    String title,
    String description,
    String category,
    String severity,
    String confidence,
    String status,
    String filePath,
    Integer lineNumber,
    String evidence,
    String remediation,
    BigDecimal riskScore,
    Instant createdAt,
    Instant updatedAt
) {
    public static FindingResponse from(Finding f) {
        return new FindingResponse(
            f.getId(), f.getScanId(), f.getProjectId(),
            f.getRuleId(), f.getTitle(), f.getDescription(),
            f.getCategory().name(), f.getSeverity().name(),
            f.getConfidence(), f.getStatus().name(),
            f.getFilePath(), f.getLineNumber(),
            f.getEvidence(), f.getRemediation(),
            f.getRiskScore(), f.getCreatedAt(), f.getUpdatedAt()
        );
    }
}
