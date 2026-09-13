package com.aegisiq.backend.scanning.repository;

import com.aegisiq.backend.scanning.domain.Scan;
import com.aegisiq.backend.scanning.domain.ScanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScanRepository extends JpaRepository<Scan, UUID> {
    Page<Scan> findAllByProjectId(UUID projectId, Pageable pageable);
    Optional<Scan> findByIdAndProjectId(UUID id, UUID projectId);
    long countByProjectIdAndStatus(UUID projectId, ScanStatus status);
}
