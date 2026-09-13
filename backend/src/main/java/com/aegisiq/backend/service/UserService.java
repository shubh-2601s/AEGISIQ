package com.aegisiq.backend.service;

import com.aegisiq.backend.entity.Role;
import com.aegisiq.backend.entity.User;
import com.aegisiq.backend.repository.RoleRepository;
import com.aegisiq.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(String username, String email, String password) {
        if (userRepository.findByUsername(username).isPresent() || userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Username or email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        Role userRole = roleRepository.findByName("USER").orElseThrow(() -> new IllegalStateException("Default role not found"));
        user.setRoles(Collections.singleton(userRole));

        return userRepository.save(user);
    }
}