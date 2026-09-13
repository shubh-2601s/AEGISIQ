package com.aegisiq.backend.projects.dto;

import com.aegisiq.backend.projects.domain.Project;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProjectResponse(
    UUID id,
    UUID orgId,
    String name,
    String description,
    String status,
    BigDecimal riskScore,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getOrgId(),
            project.getName(),
            project.getDescription(),
            project.getStatus().name(),
            project.getRiskScore(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }
}
