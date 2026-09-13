package com.aegisiq.backend.scanning.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scans", indexes = {
    @Index(name = "idx_scans_project_id", columnList = "project_id"),
    @Index(name = "idx_scans_status", columnList = "status")
})
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "repository_id")
    private UUID repositoryId;

    @Column(name = "triggered_by")
    private UUID triggeredBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ScanStatus status = ScanStatus.QUEUED;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "files_scanned")
    private int filesScanned = 0;

    @Column(name = "findings_count")
    private int findingsCount = 0;

    @Column(name = "error_summary", columnDefinition = "TEXT")
    private String errorSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public UUID getRepositoryId() { return repositoryId; }
    public void setRepositoryId(UUID repositoryId) { this.repositoryId = repositoryId; }
    public UUID getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(UUID triggeredBy) { this.triggeredBy = triggeredBy; }
    public ScanStatus getStatus() { return status; }
    public void setStatus(ScanStatus status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public int getFilesScanned() { return filesScanned; }
    public void setFilesScanned(int filesScanned) { this.filesScanned = filesScanned; }
    public int getFindingsCount() { return findingsCount; }
    public void setFindingsCount(int findingsCount) { this.findingsCount = findingsCount; }
    public String getErrorSummary() { return errorSummary; }
    public void setErrorSummary(String errorSummary) { this.errorSummary = errorSummary; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
