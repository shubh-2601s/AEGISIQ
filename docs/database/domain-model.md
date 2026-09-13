# AegisIQ Domain Model & Database Schema Specification

## 1. Relational Entity-Relationship Design

AegisIQ uses a normalized relational model in PostgreSQL 16 managed by Flyway migrations.

```
┌──────────────────────┐         ┌──────────────────────┐
│    organizations     │1       *│        users         │
├──────────────────────┼─────────┼──────────────────────┤
│ id (UUID, PK)        │         │ id (UUID, PK)        │
│ name (VARCHAR)       │         │ org_id (UUID, FK)    │
│ created_at           │         │ email (VARCHAR, UQ)  │
│ updated_at           │         │ password_hash        │
└──────────┬───────────┘         │ role (VARCHAR)       │
           │1                    │ status (VARCHAR)     │
           │                     └──────────┬───────────┘
           │*                               │1
┌──────────▼───────────┐                    │
│       projects       │                    │
├──────────────────────┤                    │
│ id (UUID, PK)        │                    │
│ org_id (UUID, FK)    │                    │
│ name (VARCHAR)       │                    │
│ description (TEXT)   │                    │
│ status (VARCHAR)     │                    │
└──────────┬───────────┘                    │
           │1                               │
           ├───────────────────────────────┐│
           │*                             *││
┌──────────▼───────────┐         ┌────────▼▼────────────┐
│     repositories     │         │      audit_logs      │
├──────────────────────┤         ├──────────────────────┤
│ id (UUID, PK)        │         │ id (UUID, PK)        │
│ project_id (UUID, FK)│         │ actor_user_id (FK)   │
│ name (VARCHAR)       │         │ action (VARCHAR)     │
│ source_type (VARCHAR)│         │ entity_type (VARCHAR)│
│ repo_url (VARCHAR)   │         │ entity_id (VARCHAR)  │
│ default_branch       │         │ details (JSONB)      │
└──────────┬───────────┘         │ created_at           │
           │1                    └──────────────────────┘
           │*
┌──────────▼───────────┐         ┌──────────────────────┐
│        scans         │1       *│        assets        │
├──────────────────────┼─────────┤──────────────────────┤
│ id (UUID, PK)        │         │ id (UUID, PK)        │
│ project_id (UUID, FK)│         │ project_id (UUID, FK)│
│ repo_id (UUID, FK)   │         │ name (VARCHAR)       │
│ status (VARCHAR)     │         │ type (VARCHAR)       │
│ started_at           │         │ criticality (VARCHAR)│
│ completed_at         │         │ exposure (VARCHAR)   │
│ files_scanned (INT)  │         │ environment (VARCHAR)│
│ findings_count (INT) │         └──────────┬───────────┘
└──────────┬───────────┘                    │1
           │1                               │
           │*                               │*
┌──────────▼───────────┐         ┌──────────▼───────────┐
│       findings       │*       *│     asset_edges      │
├──────────────────────┼─────────┤ (Security Graph)     │
│ id (UUID, PK)        │         ├──────────────────────┤
│ scan_id (UUID, FK)   │         │ id (UUID, PK)        │
│ project_id (UUID, FK)│         │ source_asset_id (FK) │
│ asset_id (UUID, FK)  │         │ target_asset_id (FK) │
│ rule_id (VARCHAR)    │         │ relationship_type    │
│ title (VARCHAR)      │         │ exposure_level       │
│ category (VARCHAR)   │         └──────────────────────┘
│ severity (VARCHAR)   │
│ confidence (VARCHAR) │         ┌──────────────────────┐
│ status (VARCHAR)     │         │      incidents       │
│ file_path (VARCHAR)  │         ├──────────────────────┤
│ line_number (INT)    │         │ id (UUID, PK)        │
│ evidence (TEXT)      │         │ project_id (UUID, FK)│
│ remediation (TEXT)   │         │ title (VARCHAR)      │
│ risk_score (DECIMAL) │         │ severity (VARCHAR)   │
└──────────┬───────────┘         │ status (VARCHAR)     │
           │1                    │ detection_source     │
           │*                    └──────────────────────┘
┌──────────▼───────────┐
│     remediations     │
├──────────────────────┤
│ id (UUID, PK)        │
│ finding_id (UUID, FK)│
│ proposed_patch (TEXT)│
│ status (VARCHAR)     │
│ approved_by (FK)     │
│ applied_at           │
└──────────────────────┘
```

---

## 2. Enumerations & Value Objects

### User Roles
- `USER`: Read-only access to assigned projects and findings.
- `SECURITY_ANALYST`: Trigger scans, investigate findings, update finding statuses, review/approve remediation proposals.
- `ADMIN`: Manage organizations, users, role assignments, system settings, and inspect audit logs.

### Scan Status
- `QUEUED`: Scan scheduled in worker queue.
- `RUNNING`: Ingestion and static analysis active.
- `COMPLETED`: Analysis complete, findings and risk scores committed.
- `FAILED`: Ingestion or analysis error encountered (details in `error_summary`).
- `CANCELLED`: Aborted by administrator.

### Finding Status
- `OPEN`: Newly discovered, active finding.
- `CONFIRMED`: Validated as genuine vulnerability by analyst.
- `FALSE_POSITIVE`: Audited and marked as non-vulnerable.
- `RESOLVED`: Remediated and verified via re-scan.
- `ACCEPTED_RISK`: Formally accepted as operational risk with documented rationale.

### Finding Severity
- `CRITICAL` (Weight: 1.0)
- `HIGH` (Weight: 0.8)
- `MEDIUM` (Weight: 0.5)
- `LOW` (Weight: 0.2)
- `INFORMATIONAL` (Weight: 0.05)

### Asset Types
- `APPLICATION`, `API`, `SERVER`, `DATABASE`, `CLOUD_RESOURCE`, `CREDENTIAL`, `ENDPOINT`, `REPOSITORY`.

### Asset Environments
- `DEVELOPMENT`, `STAGING`, `PRODUCTION`.