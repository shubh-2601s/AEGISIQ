package com.aegisiq.backend.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Centralized exception handler.
 * SECURITY: Never exposes stack traces, SQL, or internal paths.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, WebRequest req) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ApiError error = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "VALIDATION_ERROR",
                "Validation failed. Check the 'errors' field for details.",
                req.getDescription(false),
                fieldErrors
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(simpleError(404, "NOT_FOUND", ex.getMessage(), req));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(simpleError(401, "AUTHENTICATION_FAILED", "Invalid email or password.", req));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(simpleError(403, "ACCESS_DENIED", "You do not have permission to perform this action.", req));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleDuplicate(DuplicateResourceException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(simpleError(409, "CONFLICT", ex.getMessage(), req));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArg(IllegalArgumentException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(simpleError(400, "BAD_REQUEST", ex.getMessage(), req));
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaTypeNotSupported(org.springframework.web.HttpMediaTypeNotSupportedException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(simpleError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type is not supported. Please upload a valid .zip file.", req));
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxUploadSizeExceeded(org.springframework.web.multipart.MaxUploadSizeExceededException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(simpleError(413, "PAYLOAD_TOO_LARGE", "Uploaded archive exceeds maximum permitted size of 50MB.", req));
    }

    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class)
    public ResponseEntity<ApiError> handleMultipartError(org.springframework.web.multipart.MultipartException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(simpleError(400, "MULTIPART_ERROR", "Failed to parse uploaded archive: " + ex.getMessage(), req));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleJsonParseError(org.springframework.http.converter.HttpMessageNotReadableException ex, WebRequest req) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(simpleError(400, "INVALID_JSON", "Malformed request payload.", req));
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAll(Exception ex, WebRequest req) {
        log.error("Unhandled exception at {}: {}", req.getDescription(false), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(simpleError(500, "INTERNAL_SERVER_ERROR",
                        "An unexpected error occurred. Please contact support.", req));
    }

    private ApiError simpleError(int status, String code, String message, WebRequest req) {
        return new ApiError(status, code, message, req.getDescription(false), null);
    }

    // DTO
    public record ApiError(
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            Instant timestamp,
            int status,
            String code,
            String message,
            String path,
            String requestId,
            Map<String, String> errors
    ) {
        public ApiError(int status, String code, String message, String path, Map<String, String> errors) {
            this(Instant.now(), status, code, message, path, UUID.randomUUID().toString().substring(0, 8), errors);
        }
    }
}
