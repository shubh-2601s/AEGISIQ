package com.aegisiq.backend.auth.service;

import com.aegisiq.backend.audit.service.AuditService;
import com.aegisiq.backend.auth.dto.AuthResponse;
import com.aegisiq.backend.auth.dto.LoginRequest;
import com.aegisiq.backend.auth.dto.RegisterRequest;
import com.aegisiq.backend.auth.jwt.JwtTokenProvider;
import com.aegisiq.backend.common.exception.DuplicateResourceException;
import com.aegisiq.backend.organizations.domain.Organization;
import com.aegisiq.backend.organizations.repository.OrganizationRepository;
import com.aegisiq.backend.users.domain.User;
import com.aegisiq.backend.users.domain.UserRole;
import com.aegisiq.backend.users.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Authentication service.
 * SECURITY:
 * - Passwords hashed with BCrypt(12)
 * - JWT secret from environment only
 * - Same error for invalid email and invalid password (prevent user enumeration)
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }

        // Create a default organization for the new user
        Organization org = new Organization();
        org.setName(request.organizationName() != null ? request.organizationName() : request.name() + "'s Organization");
        org = organizationRepository.save(org);

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.SECURITY_ANALYST); // First user is analyst by default
        user.setOrgId(org.getId());
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        auditService.log(user.getId(), user.getEmail(), "REGISTER", "USER", user.getId().toString(), null, null);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), user.getOrgId());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            auditService.log(null, request.email(), "LOGIN_FAILED", "USER", null, null, "FAILURE");
            throw new BadCredentialsException("Invalid credentials");
        }

        if (user.getStatus() != com.aegisiq.backend.users.domain.UserStatus.ACTIVE) {
            throw new BadCredentialsException("Account is not active.");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        auditService.log(user.getId(), user.getEmail(), "LOGIN", "USER", user.getId().toString(), null, null);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name(), user.getOrgId());
    }
}
