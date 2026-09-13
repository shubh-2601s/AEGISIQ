package com.aegisiq.backend.projects.controller;

import com.aegisiq.backend.projects.dto.CreateProjectRequest;
import com.aegisiq.backend.projects.dto.ProjectResponse;
import com.aegisiq.backend.projects.service.ProjectService;
import com.aegisiq.backend.users.domain.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projects", description = "Project management")
@SecurityRequirement(name = "Bearer Authentication")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request, currentUser));
    }

    @GetMapping
    @Operation(summary = "List all projects in the organization")
    public ResponseEntity<Page<ProjectResponse>> listProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {
        Page<ProjectResponse> results = projectService.listProjects(
                currentUser, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{projectId}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProject(projectId, currentUser));
    }

    @PutMapping("/{projectId}")
    @Operation(summary = "Update a project")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.updateProject(projectId, request, currentUser));
    }

    @DeleteMapping("/{projectId}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal User currentUser) {
        projectService.deleteProject(projectId, currentUser);
        return ResponseEntity.noContent().build();
    }
}
