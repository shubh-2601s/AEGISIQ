package com.aegisiq.backend.findings.service;

import com.aegisiq.backend.common.exception.ResourceNotFoundException;
import com.aegisiq.backend.findings.domain.*;
import com.aegisiq.backend.findings.dto.FindingResponse;
import com.aegisiq.backend.findings.repository.FindingRepository;
import com.aegisiq.backend.projects.repository.ProjectRepository;
import com.aegisiq.backend.users.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class FindingService {

    private final FindingRepository findingRepository;
    private final ProjectRepository projectRepository;

    public FindingService(FindingRepository findingRepository, ProjectRepository projectRepository) {
        this.findingRepository = findingRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public Page<FindingResponse> listFindings(UUID projectId, String severity, String status,
                                              String category, User currentUser, Pageable pageable) {
        verifyProjectAccess(projectId, currentUser);

        FindingSeverity sev = severity != null ? FindingSeverity.valueOf(severity.toUpperCase()) : null;
        FindingStatus stat = status != null ? FindingStatus.valueOf(status.toUpperCase()) : null;
        FindingCategory cat = category != null ? FindingCategory.valueOf(category.toUpperCase()) : null;

        return findingRepository.findFiltered(projectId, sev, stat, cat, pageable)
                .map(FindingResponse::from);
    }

    @Transactional(readOnly = true)
    public FindingResponse getFinding(UUID projectId, UUID findingId, User currentUser) {
        verifyProjectAccess(projectId, currentUser);
        Finding f = findingRepository.findById(findingId)
                .filter(finding -> finding.getProjectId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Finding", findingId.toString()));
        return FindingResponse.from(f);
    }

    @Transactional
    public FindingResponse updateFindingStatus(UUID projectId, UUID findingId, String newStatus, User currentUser) {
        verifyProjectAccess(projectId, currentUser);
        Finding f = findingRepository.findById(findingId)
                .filter(finding -> finding.getProjectId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Finding", findingId.toString()));

        f.setStatus(FindingStatus.valueOf(newStatus.toUpperCase()));
        return FindingResponse.from(findingRepository.save(f));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getProjectFindingSummary(UUID projectId, User currentUser) {
        verifyProjectAccess(projectId, currentUser);
        return Map.of(
            "CRITICAL", findingRepository.countByProjectIdAndSeverity(projectId, FindingSeverity.CRITICAL),
            "HIGH", findingRepository.countByProjectIdAndSeverity(projectId, FindingSeverity.HIGH),
            "MEDIUM", findingRepository.countByProjectIdAndSeverity(projectId, FindingSeverity.MEDIUM),
            "LOW", findingRepository.countByProjectIdAndSeverity(projectId, FindingSeverity.LOW),
            "OPEN", findingRepository.countByProjectIdAndStatus(projectId, FindingStatus.OPEN),
            "RESOLVED", findingRepository.countByProjectIdAndStatus(projectId, FindingStatus.RESOLVED)
        );
    }

    private void verifyProjectAccess(UUID projectId, User user) {
        projectRepository.findByIdAndOrgId(projectId, user.getOrgId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }
}
