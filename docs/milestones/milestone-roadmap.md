# AegisIQ Milestone Roadmap

The AegisIQ engineering lifecycle is strictly sequenced across 11 milestones (M0 through M10):

---

### M0 — Product Foundation *(CURRENT)*
- [x] Canonical repository layout (`frontend/`, `backend/`, `ai-service/`, `security-engine/`, `security-test-lab/`, `docs/`, `docker/`).
- [x] Comprehensive root governance: `README.md`, `LICENSE`, `CONTRIBUTING.md`, `.env.example`, `.gitignore`.
- [x] Architecture Decision Records (`docs/adr/ADR-001` through `ADR-007`).
- [x] System Architecture specification and data flows (`docs/architecture/system-architecture.md`).
- [x] STRIDE Threat Model & trust boundaries (`docs/security/threat-model.md`).
- [x] Testing Strategy with detection benchmarks & AI evaluation (`docs/testing/testing-strategy.md`).
- [x] Domain model and relational schema documentation (`docs/database/domain-model.md`).
- [x] Docker and containerization strategy (`docs/infrastructure/docker-strategy.md`).
- [x] Multi-stage Dockerfiles and `docker-compose.yml`.
- [x] Git repository initialization and baseline commit.

---

### M1 — Platform Foundation
- [ ] Java 21 Spring Boot 3.3.x Modular Monolith setup with Maven wrapper.
- [ ] PostgreSQL Flyway migrations (`V1__...sql`) with UUIDs, foreign keys, and indexes.
- [ ] Authentication, BCrypt password hashing, stateless JWT issuance and verification.
- [ ] Authoritative Role-Based Access Control (`USER`, `SECURITY_ANALYST`, `ADMIN`) and tenancy validation (anti-IDOR).
- [ ] Core domain modules: Users, Organizations, Projects, Repositories.
- [ ] Immutable Audit Logging system (`audit_logs`).
- [ ] Standardized REST API response envelopes and centralized exception handling (`GlobalExceptionHandler`).
- [ ] Spring Boot Actuator health and readiness endpoints.
- [ ] React + TypeScript + Vite frontend shell: dark-mode SOC theme, JWT state management, login/registration, protected routes, navigation shell.
- [ ] Backend and frontend automated tests.

---

### M2 — Application Security Engine & Test Lab
- [ ] Untrusted repository ingestion pipeline with Zip Slip defense and bounded extraction.
- [ ] Modular static analysis framework (`SecurityRule` interface, rule metadata, structured findings).
- [ ] Core deterministic security rules:
  1. SQL Injection (`AIG-SQL-001`)
  2. Cross-Site Scripting (`AIG-XSS-001`)
  3. Command Injection (`AIG-CMD-001`)
  4. Path Traversal (`AIG-PATH-001`)
  5. Hardcoded Secrets (`AIG-SEC-001`)
  6. Insecure Authentication (`AIG-AUTH-001`)
  7. Dangerous API Usage (`AIG-API-001`)
- [ ] Finding deduplication and authoritative database persistence.
- [ ] Dedicated `security-test-lab/` with intentionally vulnerable and safe fixtures.
- [ ] Automated benchmark suite calculating TP, TN, FP, FN, Precision, Recall, and F1.

---

### M3 — Risk Intelligence
- [ ] Implementation of the deterministic AegisIQ Risk Model:
  $$\text{RiskScore} = f(\text{SeverityWeight}, \text{Exploitability}, \text{Exposure}, \text{AssetCriticality}, \text{Confidence}, \text{AttackPathImpact})$$
- [ ] Normalized risk scoring (0.0 - 10.0 scale).
- [ ] Prioritization service ranking findings by composite risk.
- [ ] Risk APIs (`/api/v1/projects/{id}/risk`, `/api/v1/findings/prioritized`).
- [ ] Risk dashboard widgets displaying overall risk posture, severity breakdowns, and trends.

---

### M4 — Security Graph & Asset Intelligence
- [ ] Asset entity management (Applications, APIs, Servers, Databases, Cloud Resources, Credentials).
- [ ] Asset criticality and exposure classifications (`DEVELOPMENT`, `STAGING`, `PRODUCTION`).
- [ ] Relational graph service in PostgreSQL (`asset_edges` table with adjacency model).
- [ ] Attack-path discovery algorithm traversing paths from Internet entry points to critical assets.
- [ ] Downstream attack-path impact weighting integrated into the AegisIQ Risk Model.
- [ ] Attack graph explorer UI visualizing nodes, edges, and active attack paths.

---

### M5 — AI Security Analyst Service
- [ ] Python 3.12 FastAPI standalone service.
- [ ] Swappable LLM provider abstraction (Mock, OpenAI, Anthropic, Ollama).
- [ ] Authenticated Java ↔ Python internal REST gateway (`POST /internal/ai/analyze`).
- [ ] Structured context packaging passing verified findings, assets, risk scores, and attack paths.
- [ ] Prompt-injection defense: XML/CDATA context bounding, non-executable data instructions.
- [ ] Structured AI response contracts: Facts, Inferences, Recommendations, Uncertainty.
- [ ] Deterministic evaluation test suite measuring groundedness and injection resilience.
- [ ] Interactive AI Security Analyst chat interface in React.

---

### M6 — Cloud Security
- [ ] Cloud resource model and declarative configuration ingestion.
- [ ] Controlled cloud configuration fixtures (AWS/Azure/GCP IAM policies, S3 bucket policies, Security Groups).
- [ ] Deterministic cloud security audit rules:
  - Publicly accessible storage buckets.
  - Insecure security groups (open ports 22, 3389, 0.0.0.0/0).
  - Excessive / wildcard IAM permissions (`*:*`).
  - Unencrypted storage volumes.
- [ ] Provider adapter architecture enabling future live cloud API integrations.

---

### M7 — Threat Detection & Incident Lifecycle
- [ ] Security event ingestion endpoint (`POST /api/v1/security-events`).
- [ ] Deterministic threat detection correlation rules:
  - Brute-force authentication bursts (multiple failed logins in short window).
  - Privilege escalation anomalies (rare privileged operations from unapproved origins).
- [ ] Incident management lifecycle entity (`OPEN`, `INVESTIGATING`, `CONTAINED`, `RESOLVED`, `CLOSED`).
- [ ] Linkage between incidents, findings, assets, and event logs.
- [ ] Incident timeline and investigation workspace in React.

---

### M8 — Remediation Engine
- [ ] Structured remediation proposal generation (code patches, configuration fixes).
- [ ] Human-in-the-loop approval workflow: mandatory analyst confirmation before patch application.
- [ ] Automated verification re-scan workflow confirming vulnerability resolution.
- [ ] Remediation lifecycle state machine and audit record creation.

---

### M9 — Production Engineering
- [ ] Automated CI/CD workflow (.github/workflows/ci.yml).
- [ ] Observability: Spring Boot Actuator metrics, healthchecks, correlation IDs across requests.
- [ ] Security hardening: Content Security Policy, rate limiting, non-root containers.
- [ ] OpenAPI / Swagger API documentation generation.
- [ ] Load and performance baselines.

---

### M10 — Portfolio Release
- [ ] Final portfolio-grade README with architecture diagrams and feature walkthroughs.
- [ ] Seed/demo data script loading realistic projects, repositories, assets, findings, and incidents.
- [ ] Recorded end-to-end demo flow.
- [ ] Comprehensive verification report summarizing all test results and benchmarks.