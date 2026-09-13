package com.aegisiq.backend.findings.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "findings", indexes = {
    @Index(name = "idx_findings_scan_id", columnList = "scan_id"),
    @Index(name = "idx_findings_project_id", columnList = "project_id"),
    @Index(name = "idx_findings_severity", columnList = "severity")
})
public class Finding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "scan_id", nullable = false)
    private UUID scanId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "repository_id")
    private UUID repositoryId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "rule_id", nullable = false, length = 50)
    private String ruleId;

    @Column(name = "fingerprint", nullable = false, length = 255)
    private String fingerprint;

    @Column(name = "title", nullable = false, length = 512)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private FindingCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private FindingSeverity severity;

    @Column(name = "confidence", nullable = false, length = 20)
    private String confidence = "MEDIUM";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private FindingStatus status = FindingStatus.OPEN;

    @Column(name = "file_path", length = 1024)
    private String filePath;

    @Column(name = "line_number")
    private Integer lineNumber;

    @Column(name = "evidence", columnDefinition = "TEXT")
    private String evidence;

    @Column(name = "remediation", columnDefinition = "TEXT")
    private String remediation;

    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = Instant.now(); }

    // Getters and Setters
    public UUID getId() { return id; }
    public UUID getScanId() { return scanId; }
    public void setScanId(UUID scanId) { this.scanId = scanId; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public UUID getRepositoryId() { return repositoryId; }
    public void setRepositoryId(UUID repositoryId) { this.repositoryId = repositoryId; }
    public UUID getAssetId() { return assetId; }
    public void setAssetId(UUID assetId) { this.assetId = assetId; }
    public String getRuleId() { return ruleId; }
    public void setRuleId(String ruleId) { this.ruleId = ruleId; }
    public String getFingerprint() { return fingerprint; }
    public void setFingerprint(String fingerprint) { this.fingerprint = fingerprint; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FindingCategory getCategory() { return category; }
    public void setCategory(FindingCategory category) { this.category = category; }
    public FindingSeverity getSeverity() { return severity; }
    public void setSeverity(FindingSeverity severity) { this.severity = severity; }
    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }
    public FindingStatus getStatus() { return status; }
    public void setStatus(FindingStatus status) { this.status = status; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public Integer getLineNumber() { return lineNumber; }
    public void setLineNumber(Integer lineNumber) { this.lineNumber = lineNumber; }
    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    public String getRemediation() { return remediation; }
    public void setRemediation(String remediation) { this.remediation = remediation; }
    public BigDecimal getRiskScore() { return riskScore; }
    public void setRiskScore(BigDecimal riskScore) { this.riskScore = riskScore; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
