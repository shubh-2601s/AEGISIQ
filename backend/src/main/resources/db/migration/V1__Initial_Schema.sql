-- =============================================================
-- AegisIQ V1 — Complete Platform Schema
-- Managed by Flyway. Do NOT modify Hibernate ddl-auto.
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUMERATIONS (as VARCHARs for Flyway/Hibernate portability)
-- =============================================================

-- =============================================================
-- ORGANIZATIONS
-- =============================================================
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_name ON organizations(name);

-- =============================================================
-- USERS
-- =============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID REFERENCES organizations(id) ON DELETE SET NULL,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'USER',
    status        VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('USER', 'SECURITY_ANALYST', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org_id ON users(org_id);

-- =============================================================
-- ORGANIZATION MEMBERS (many-to-many user ↔ org membership)
-- =============================================================
CREATE TABLE organization_members (
    org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at  TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (org_id, user_id)
);

-- =============================================================
-- PROJECTS
-- =============================================================
CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    risk_score  DECIMAL(5,2) DEFAULT 0.00,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT chk_projects_status CHECK (status IN ('ACTIVE', 'ARCHIVED', 'INACTIVE'))
);

CREATE INDEX idx_projects_org_id ON projects(org_id);
CREATE INDEX idx_projects_status ON projects(status);

-- =============================================================
-- REPOSITORIES
-- =============================================================
CREATE TABLE repositories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    source_type     VARCHAR(50)  NOT NULL DEFAULT 'LOCAL_UPLOAD',
    repository_url  VARCHAR(1024),
    default_branch  VARCHAR(255) DEFAULT 'main',
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT chk_repos_source CHECK (source_type IN ('LOCAL_UPLOAD', 'GIT_REPOSITORY'))
);

CREATE INDEX idx_repositories_project_id ON repositories(project_id);

-- =============================================================
-- SCANS
-- =============================================================
CREATE TABLE scans (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repository_id  UUID REFERENCES repositories(id) ON DELETE SET NULL,
    triggered_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'QUEUED',
    started_at     TIMESTAMP,
    completed_at   TIMESTAMP,
    files_scanned  INTEGER DEFAULT 0,
    findings_count INTEGER DEFAULT 0,
    error_summary  TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_scans_status CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_scans_project_id ON scans(project_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

-- =============================================================
-- ASSETS
-- =============================================================
CREATE TABLE assets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    criticality  VARCHAR(50)  NOT NULL DEFAULT 'MEDIUM',
    exposure     VARCHAR(50)  NOT NULL DEFAULT 'INTERNAL',
    environment  VARCHAR(50)  NOT NULL DEFAULT 'PRODUCTION',
    metadata     JSONB,
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_assets_type CHECK (type IN ('APPLICATION','API','SERVER','DATABASE','CLOUD_RESOURCE','USER_ACCOUNT','CREDENTIAL','ENDPOINT','REPOSITORY')),
    CONSTRAINT chk_assets_criticality CHECK (criticality IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    CONSTRAINT chk_assets_exposure CHECK (exposure IN ('INTERNET_FACING','INTERNAL','PRIVATE')),
    CONSTRAINT chk_assets_environment CHECK (environment IN ('PRODUCTION','STAGING','DEVELOPMENT'))
);

CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_criticality ON assets(criticality);

-- =============================================================
-- ASSET RELATIONSHIPS (Security Graph Edges)
-- =============================================================
CREATE TABLE asset_relationships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_asset_id     UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    target_asset_id     UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    relationship_type   VARCHAR(50) NOT NULL,
    exposure_level      VARCHAR(50) DEFAULT 'INTERNAL',
    metadata            JSONB,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_asset_relationship UNIQUE (source_asset_id, target_asset_id, relationship_type),
    CONSTRAINT chk_ar_type CHECK (relationship_type IN ('EXPOSES','CALLS','DEPENDS_ON','CONNECTS_TO','AFFECTS','AUTHENTICATES_TO','STORES_DATA_IN'))
);

CREATE INDEX idx_asset_rel_source ON asset_relationships(source_asset_id);
CREATE INDEX idx_asset_rel_target ON asset_relationships(target_asset_id);

-- =============================================================
-- FINDINGS
-- =============================================================
CREATE TABLE findings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id          UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repository_id    UUID REFERENCES repositories(id) ON DELETE SET NULL,
    asset_id         UUID REFERENCES assets(id) ON DELETE SET NULL,
    rule_id          VARCHAR(50) NOT NULL,
    fingerprint      VARCHAR(255) NOT NULL,
    title            VARCHAR(512) NOT NULL,
    description      TEXT NOT NULL,
    category         VARCHAR(50) NOT NULL,
    severity         VARCHAR(20) NOT NULL,
    confidence       VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status           VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    file_path        VARCHAR(1024),
    line_number      INTEGER,
    evidence         TEXT,
    remediation      TEXT,
    risk_score       DECIMAL(5,2) DEFAULT 0.00,
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_findings_category CHECK (category IN ('SQL_INJECTION','XSS','COMMAND_INJECTION','PATH_TRAVERSAL','HARDCODED_SECRET','INSECURE_AUTH','DANGEROUS_API','DEPENDENCY_VULNERABILITY','MISCONFIGURATION')),
    CONSTRAINT chk_findings_severity CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL')),
    CONSTRAINT chk_findings_confidence CHECK (confidence IN ('HIGH','MEDIUM','LOW')),
    CONSTRAINT chk_findings_status CHECK (status IN ('OPEN','CONFIRMED','FALSE_POSITIVE','RESOLVED','ACCEPTED_RISK'))
);

-- Deduplication index: same rule + project + repo + file + line = same finding
CREATE UNIQUE INDEX idx_findings_fingerprint_project ON findings(fingerprint, project_id);
CREATE INDEX idx_findings_scan_id ON findings(scan_id);
CREATE INDEX idx_findings_project_id ON findings(project_id);
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_findings_category ON findings(category);
CREATE INDEX idx_findings_risk_score ON findings(risk_score DESC);

-- =============================================================
-- SECURITY EVENTS
-- =============================================================
CREATE TABLE security_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    event_type  VARCHAR(50) NOT NULL,
    actor       VARCHAR(255),
    source_ip   VARCHAR(64),
    asset_id    UUID REFERENCES assets(id) ON DELETE SET NULL,
    metadata    JSONB,
    occurred_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_se_type CHECK (event_type IN ('FAILED_LOGIN','SUCCESSFUL_LOGIN','SUSPICIOUS_API_REQUEST','NETWORK_ACTIVITY','PRIVILEGE_CHANGE','CREDENTIAL_USE','UNUSUAL_ACCESS'))
);

CREATE INDEX idx_se_project_id ON security_events(project_id);
CREATE INDEX idx_se_event_type ON security_events(event_type);
CREATE INDEX idx_se_actor ON security_events(actor);
CREATE INDEX idx_se_occurred_at ON security_events(occurred_at DESC);

-- =============================================================
-- INCIDENTS
-- =============================================================
CREATE TABLE incidents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title            VARCHAR(512) NOT NULL,
    description      TEXT,
    severity         VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status           VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    detection_source VARCHAR(100),
    created_at       TIMESTAMP NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_incidents_severity CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
    CONSTRAINT chk_incidents_status CHECK (status IN ('OPEN','INVESTIGATING','CONTAINED','RESOLVED','CLOSED'))
);

CREATE INDEX idx_incidents_project_id ON incidents(project_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- Incident ↔ Finding links
CREATE TABLE incident_findings (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    finding_id  UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, finding_id)
);

-- Incident ↔ Event links
CREATE TABLE incident_events (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_id    UUID NOT NULL REFERENCES security_events(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, event_id)
);

-- =============================================================
-- REMEDIATIONS
-- =============================================================
CREATE TABLE remediations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id      UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(512) NOT NULL,
    description     TEXT,
    patch_content   TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
    proposed_by     VARCHAR(50) NOT NULL DEFAULT 'AI_ANALYST',
    approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at     TIMESTAMP,
    applied_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_remediations_status CHECK (status IN ('PROPOSED','APPROVED','REJECTED','APPLIED','VERIFIED'))
);

CREATE INDEX idx_remediations_finding_id ON remediations(finding_id);
CREATE INDEX idx_remediations_project_id ON remediations(project_id);
CREATE INDEX idx_remediations_status ON remediations(status);

-- =============================================================
-- AUDIT LOGS (Append-only — no UPDATE, no DELETE via API)
-- =============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   VARCHAR(255),
    details     JSONB,
    source_ip   VARCHAR(64),
    result      VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_audit_result CHECK (result IN ('SUCCESS','FAILURE','ERROR'))
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);