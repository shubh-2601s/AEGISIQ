package com.aegisiq.backend.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    String name,

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "Password must contain at least one uppercase, one lowercase, and one digit")
    String password,

    @Size(max = 255, message = "Organization name must be at most 255 characters")
    String organizationName
) {}
