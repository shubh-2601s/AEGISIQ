package com.aegisiq.backend.projects.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 255, message = "Name must be 2-255 characters")
    String name,

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    String description
) {}
