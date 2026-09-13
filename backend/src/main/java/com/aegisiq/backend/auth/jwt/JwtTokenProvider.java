package com.aegisiq.backend.auth.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT token provider for AegisIQ.
 * Signing secret is ALWAYS sourced from environment variables.
 * Never hardcoded.
 */
@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${aegisiq.jwt.secret}") String secret,
            @Value("${aegisiq.jwt.expiration-ms}") long expirationMs) {
        // Ensure key is at minimum 256 bits (32 bytes) for HS256
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits (32 chars). Configure JWT_SECRET env var.");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(UUID userId, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            validateAndGetClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getClass().getSimpleName());
            return false;
        }
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(validateAndGetClaims(token).getSubject());
    }

    public String getRoleFromToken(String token) {
        return validateAndGetClaims(token).get("role", String.class);
    }
}
