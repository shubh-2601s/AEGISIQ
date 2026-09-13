package com.aegisiq.backend.auth;

import com.aegisiq.backend.auth.dto.LoginRequest;
import com.aegisiq.backend.auth.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Register: new user returns 201 with JWT token")
    void registerNewUser() throws Exception {
        var request = new RegisterRequest("Test User", "testuser@aegisiq.io", "SecurePass1!", "Test Org");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("testuser@aegisiq.io"))
                .andExpect(jsonPath("$.role").exists());
    }

    @Test
    @DisplayName("Register: duplicate email returns 409 Conflict")
    void registerDuplicateEmail() throws Exception {
        var request = new RegisterRequest("Dup User", "dupuser@aegisiq.io", "SecurePass1!", null);

        // Register first time
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Register second time — must conflict
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Login: valid credentials return 200 with JWT")
    void loginWithValidCredentials() throws Exception {
        var reg = new RegisterRequest("Login User", "loginuser@aegisiq.io", "SecurePass1!", "Login Org");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        var login = new LoginRequest("loginuser@aegisiq.io", "SecurePass1!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("Login: invalid password returns 401 Unauthorized")
    void loginWithInvalidPassword() throws Exception {
        var reg = new RegisterRequest("BadPwd User", "badpwd@aegisiq.io", "SecurePass1!", "Org");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated());

        var login = new LoginRequest("badpwd@aegisiq.io", "WrongPassword!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Register: weak password returns 400 with validation error")
    void registerWeakPassword() throws Exception {
        var request = new RegisterRequest("Weak", "weak@aegisiq.io", "weak", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Register: invalid email returns 400")
    void registerInvalidEmail() throws Exception {
        var request = new RegisterRequest("User", "not-an-email", "SecurePass1!", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
