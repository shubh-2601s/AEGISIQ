# AegisIQ Core Backend

## Architecture
The backend is built as a **Modular Monolith** in Java 21 using Spring Boot 3.3.x.

## Module Structure (`com.aegisiq.backend`)
- `auth/`: Authentication, JWT issuance, Spring Security configuration, and filters.
- `users/`: User management, RBAC (`USER`, `SECURITY_ANALYST`, `ADMIN`), organization tenancy.
- `projects/`: Projects and repository metadata.
- `scanning/`: Safe archive ingestion, Zip Slip defense, scan task orchestration.
- `findings/`: Authoritative vulnerability findings ledger, status transitions, deduplication.
- `risk/`: Deterministic multi-factor AegisIQ Risk Model calculation.
- `assets/`: Asset inventory, environment classifications (`DEVELOPMENT`, `STAGING`, `PRODUCTION`).
- `graph/`: Relational Security Graph (PostgreSQL adjacency model and attack path traversal).
- `incidents/`: Security event ingestion and incident correlation.
- `remediation/`: Remediation proposal lifecycle with human-in-the-loop approval gates.
- `audit/`: Append-only immutable audit logging.
- `common/`: Standardized REST response envelopes, exception handling, and value objects.

## Running Locally
```bash
mvn clean spring-boot:run
```

## Running Tests
```bash
mvn clean test
```
