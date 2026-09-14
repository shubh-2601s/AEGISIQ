package com.aegisiq.backend.findings.repository;

import com.aegisiq.backend.findings.domain.Finding;
import com.aegisiq.backend.findings.domain.FindingCategory;
import com.aegisiq.backend.findings.domain.FindingSeverity;
import com.aegisiq.backend.findings.domain.FindingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FindingRepository extends JpaRepository<Finding, UUID> {

    Page<Finding> findAllByProjectId(UUID projectId, Pageable pageable);

    Page<Finding> findAllByProjectIdAndSeverity(UUID projectId, FindingSeverity severity, Pageable pageable);

    Page<Finding> findAllByProjectIdAndStatus(UUID projectId, FindingStatus status, Pageable pageable);

    Page<Finding> findAllByProjectIdAndCategory(UUID projectId, FindingCategory category, Pageable pageable);

    Page<Finding> findAllByScanId(UUID scanId, Pageable pageable);

    Optional<Finding> findByFingerprintAndProjectId(String fingerprint, UUID projectId);

    long countByProjectIdAndSeverity(UUID projectId, FindingSeverity severity);

    long countByProjectIdAndStatus(UUID projectId, FindingStatus status);

    @Query("SELECT MAX(f.riskScore) FROM Finding f WHERE f.projectId = :projectId AND f.status = 'OPEN'")
    Optional<java.math.BigDecimal> findMaxRiskScoreByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT f FROM Finding f WHERE f.projectId = :projectId AND " +
           "(:severity IS NULL OR f.severity = :severity) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:category IS NULL OR f.category = :category)")
    Page<Finding> findFiltered(@Param("projectId") UUID projectId,
                               @Param("severity") FindingSeverity severity,
                               @Param("status") FindingStatus status,
                               @Param("category") FindingCategory category,
                               Pageable pageable);
}
