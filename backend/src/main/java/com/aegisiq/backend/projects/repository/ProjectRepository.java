package com.aegisiq.backend.projects.repository;

import com.aegisiq.backend.projects.domain.Project;
import com.aegisiq.backend.projects.domain.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    Page<Project> findAllByOrgId(UUID orgId, Pageable pageable);
    Optional<Project> findByIdAndOrgId(UUID id, UUID orgId);
    List<Project> findAllByOrgIdAndStatus(UUID orgId, ProjectStatus status);
    long countByOrgIdAndStatus(UUID orgId, ProjectStatus status);
}
