package com.aegisiq.backend.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resourceType, String id) {
        super(resourceType + " not found with id: " + id);
    }
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
