# AegisIQ Security Principles & Engineering Standards

## 1. Core Philosophy

AegisIQ adheres to a zero-trust, defense-in-depth philosophy across every component:

1. **Deterministic Security Engines are Authoritative**:
   - Probabilistic models are never the primary source of truth for vulnerability existence.
   - Every security finding must be grounded in deterministic rules, syntax patterns, or configuration audits.

2. **Scanned Repositories are Untrusted Input**:
   - Never compile, execute, or invoke scripts from analyzed codebases.
   - Enforce bounded extraction, size limits, and strict canonical path normalization.

3. **Explicit Trust Boundaries for AI Components**:
   - Decouple AI services from direct database or system tool execution.
   - Enclose untrusted evidence within explicit CDATA tags and label context as non-executable data.

4. **Human-in-the-Loop Remediation**:
   - AI remediation recommendations are proposals. Consequential changes require explicit human analyst approval before staging or applying.

---

## 2. Authentication & Authorization Standards

- **Cryptographic Hashing**: Passwords must be hashed using BCrypt with a minimum cost factor of 12. Plaintext passwords must never touch logs, storage, or external APIs.
- **Stateless Tokens**: JWTs signed with HMAC-SHA256 using an environment-sourced secret with high entropy (≥ 256 bits).
- **Authoritative Backend RBAC**: Every endpoint must validate user role (`USER`, `SECURITY_ANALYST`, `ADMIN`) and organizational tenancy at the service layer.
- **Anti-IDOR Policy**: Direct object references (e.g., project ID, scan ID, finding ID) must be validated against the caller's organizational membership.

---

## 3. Data Storage & Query Hygiene

- **Strict Parameterization**: Dynamic string concatenation in SQL or JPQL queries is strictly banned.
- **Managed Migrations**: Schema alterations must be executed through versioned Flyway migration files. Automatic Hibernate DDL generation is prohibited in production.
- **Referential Integrity**: Use foreign keys, cascade constraints, and unique indices to prevent orphaned security records.

---

## 4. Logging & Error Hygiene

- **Sensitive Data Redaction**: Passwords, JWT secrets, private keys, authorization tokens, and credentials must never be written to application logs.
- **Structured Error Responses**: Internal stack traces, database schema details, or server fingerprints must be caught by global handlers and replaced with sanitized error DTOs containing opaque tracking IDs.
- **Immutable Audit Logging**: Security-relevant actions (logins, scan executions, finding state transitions, remediation approvals) are permanently captured with user identity, timestamp, and action metadata.