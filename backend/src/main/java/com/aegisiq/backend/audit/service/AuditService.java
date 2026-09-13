package com.aegisiq.backend.audit.service;

import com.aegisiq.backend.audit.domain.AuditLog;
import com.aegisiq.backend.audit.repository.AuditLogRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Audit service — writes append-only audit logs asynchronously.
 * Uses a NEW transaction to ensure audit events are persisted even
 * if the calling transaction is rolled back.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID actorId, String actorEmail, String action, String entityType, String entityId,
                    Map<String, Object> details, String result) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorId(actorId);
        auditLog.setActorEmail(actorEmail);
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setResult(result != null ? result : "SUCCESS");
        auditLogRepository.save(auditLog);
    }
}
