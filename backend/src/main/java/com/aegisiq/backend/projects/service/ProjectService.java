package com.aegisiq.backend.projects.service;

import com.aegisiq.backend.common.exception.ResourceNotFoundException;
import com.aegisiq.backend.projects.domain.Project;
import com.aegisiq.backend.projects.dto.CreateProjectRequest;
import com.aegisiq.backend.projects.dto.ProjectResponse;
import com.aegisiq.backend.projects.repository.ProjectRepository;
import com.aegisiq.backend.users.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, User currentUser) {
        Project project = new Project();
        project.setOrgId(currentUser.getOrgId());
        project.setName(request.name());
        project.setDescription(request.description());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> listProjects(User currentUser, Pageable pageable) {
        return projectRepository.findAllByOrgId(currentUser.getOrgId(), pageable)
                .map(ProjectResponse::from);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId, User currentUser) {
        return ProjectResponse.from(fetchProjectForUser(projectId, currentUser));
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, CreateProjectRequest request, User currentUser) {
        Project project = fetchProjectForUser(projectId, currentUser);
        project.setName(request.name());
        project.setDescription(request.description());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(UUID projectId, User currentUser) {
        Project project = fetchProjectForUser(projectId, currentUser);
        projectRepository.delete(project);
    }

    /**
     * Fetches a project and enforces org-scoped access control.
     * SECURITY: Users can only access projects in their own organization.
     */
    private Project fetchProjectForUser(UUID projectId, User currentUser) {
        return projectRepository.findByIdAndOrgId(projectId, currentUser.getOrgId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }
}
