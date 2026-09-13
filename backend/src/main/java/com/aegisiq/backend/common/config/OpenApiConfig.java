package com.aegisiq.backend.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
    info = @Info(
        title = "AegisIQ API",
        version = "1.0",
        description = "AegisIQ — AI-Powered Security Intelligence Platform. " +
                      "All endpoints require JWT Bearer authentication unless marked as public.",
        contact = @Contact(name = "AegisIQ Security", email = "security@aegisiq.io"),
        license = @License(name = "Proprietary")
    ),
    servers = {
        @Server(url = "/", description = "Current Environment")
    }
)
@SecurityScheme(
    name = "Bearer Authentication",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
@Configuration
public class OpenApiConfig {}
