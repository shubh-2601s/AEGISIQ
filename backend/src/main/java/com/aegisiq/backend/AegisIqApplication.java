package com.aegisiq.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AegisIqApplication {
    public static void main(String[] args) {
        SpringApplication.run(AegisIqApplication.class, args);
    }
}