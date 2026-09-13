# AegisIQ System Architecture Specification

## 1. System Overview

AegisIQ is an AI-powered security intelligence platform designed to deliver deterministic, auditable vulnerability detection and risk intelligence. The system combines an enterprise Java 21 Spring Boot modular monolith with a specialized Python 3.12 AI microservice and a React + TypeScript security operations frontend.

---

## 2. Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          User Presentation Layer                            │
│                       React + TypeScript (Vite)                             │
│  ┌───────────────────────┬───────────────────────┬───────────────────────┐  │
│  │ Security Dashboard    │ Finding Explorer      │ Asset & Attack Graph  │  │
│  ├───────────────────────┼───────────────────────┼───────────────────────┤  │
│  │ AI Analyst Chat       │ Incident Management   │ Project Management    │  │
│  └───────────────────────┴───────────────────────┴───────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / JSON (REST API /api/v1/)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     AegisIQ Core Engine (Java 21 Monolith)                  │
│                                                                             │
│  ┌─────────────────────────┐   ┌────────────────────────┐                   │
│  │ Authentication & RBAC   │   │ Organizations/Projects │                   │
│  │ - JWT tokens & filters  │   │ - Tenancy & metadata   │                   │
│  └────────────┬────────────┘   └───────────┬────────────┘                   │
│               │                            │                                │
│  ┌────────────▼────────────┐   ┌───────────▼────────────┐                   │
│  │ Safe Archive Ingestor   │   │ Threat Event Ingestor  │                   │
│  │ - Zip Slip protection   │   │ - Auth failures        │                   │
│  │ - Bounded decompression │   │ - API anomalies        │                   │
│  └────────────┬────────────┘   └───────────┬────────────┘                   │
│               │                            │                                │
│  ┌────────────▼────────────┐   ┌───────────▼────────────┐                   │
│  │ Static Rule Engine      │   │ Incident Correlation   │                   │
│  │ - SQLi, XSS, Cmd, Path  │   │ - Event clustering     │                   │
│  │ - Secrets, Auth, APIs   │   │ - Incident state engine│                   │
│  └────────────┬────────────┘   └───────────┬────────────┘                   │
│               │                            │                                │
│  ┌────────────▼────────────────────────────▼────────────┐                   │
│  │               Authoritative Finding Ledger           │                   │
│  │               - Lineage, status, evidence            │                   │
│  └────────────────────────────┬─────────────────────────┘                   │
│                               │                                             │
│  ┌────────────────────────────▼─────────────────────────┐                   │
│  │                  AegisIQ Risk Engine                 │                   │
│  │ - Deterministic multi-factor scoring formula         │                   │
│  └────────────────────────────┬─────────────────────────┘                   │
│                               │                                             │
│  ┌────────────────────────────▼─────────────────────────┐                   │
│  │                Relational Security Graph             │                   │
│  │ - Asset topology, exposure, attack-path discovery    │                   │
│  └────────────────────────────┬─────────────────────────┘                   │
│                               │                                             │
│  ┌────────────────────────────▼─────────────────────────┐                   │
│  │                 AI Gateway Client                    │                   │
│  │ - Context packaging, trust boundaries, HTTP client   │                   │
│  └────────────────────────────┬─────────────────────────┘                   │
└───────────────────────────────┼─────────────────────────────────────────────┘
                │               │ Internal REST /internal/ai/analyze
                ▼               ▼
┌──────────────────────────────┐ ┌──────────────────────────────────────────┐
│      PostgreSQL 16           │ │        AI Service (Python 3.12)          │
│  - Normalized Tables         │ │  - FastAPI Application                   │
│  - Foreign Key Constraints   │ │  - Untrusted Data Bounding (<context>)   │
│  - B-tree & GIN Indexes      │ │  - Modular LLM Provider Layer            │
│  - Immutable Audit Records   │ │    (Mock / OpenAI / Anthropic / Ollama)  │
│  - Flyway Versioned Schema   │ │  - Structured Fact/Inference Output      │
└──────────────────────────────┘ └──────────────────────────────────────────┘
```

---

## 3. End-to-End Data Flow

```
[1. Upload Code Archive] 
       │
       ▼
[2. Archive Ingestion Shield] 
       │ Verifies canonical paths (Anti-Zip-Slip) & size limits (Anti-Zip-Bomb)
       ▼
[3. File Filter & Lexer]
       │ Discards binaries/symlinks; feeds source files to Rule Registry
       ▼
[4. Deterministic Static Engine]
       │ Evaluates rules: SQLi, XSS, Command Injection, Path Traversal, Secrets
       ▼
[5. Finding Normalization & Deduplication]
       │ Computes deterministic finding hash (rule + path + line + evidence)
       ▼
[6. Asset Mapping & Security Graph]
       │ Associates finding with application asset; traverses attack paths
       ▼
[7. AegisIQ Risk Model]
       │ Computes deterministic risk score: Severity x Exploitability x Exposure...
       ▼
[8. Database Transaction Commit]
       │ Atomically stores Findings, Graph Edges, and Audit Log in PostgreSQL
       ▼
[9. Analyst AI Investigation]
       │ Packages verified finding + asset + risk context into bounded JSON
       ▼
[10. FastAPI AI Service]
       │ Evaluates context with LLM; separates Facts, Inferences, Recommendations
       ▼
[11. Human Approval & Re-scan]
       │ Analyst inspects AI patch proposal; approves fix; triggers verification scan
```

---

## 4. Module Boundaries (Java Modular Monolith)

The Java backend (`com.aegisiq.backend`) strictly maintains isolated package boundaries:

1. **`auth`**: Handles user authentication, BCrypt password hashing, JWT generation/validation, Spring Security filters, and security context.
2. **`users`**: Manages user profiles, role assignments, and organizational tenancy.
3. **`projects`**: Project configuration, repository tracking, and target branch configurations.
4. **`scanning`**: Upload handling, archive extraction safety guards, scan orchestration, worker executors, and scan status state transitions.
5. **`findings`**: Authoritative vulnerability finding model, finding status transitions (`OPEN`, `CONFIRMED`, `FALSE_POSITIVE`, `RESOLVED`, `ACCEPTED_RISK`), deduplication logic.
6. **`risk`**: Dedicated deterministic scoring engine implementing the AegisIQ Risk Model.
7. **`assets`**: Asset inventory (Application, API, Host, Database, Cloud Resource, Credential), criticality, and environment flags (`DEVELOPMENT`, `STAGING`, `PRODUCTION`).
8. **`graph`**: Relational topological model, directed edge definitions (`EXPOSES`, `CONNECTS_TO`, `CONTAINS_VULNERABILITY`), recursive CTE attack-path traversal.
9. **`incidents`**: Security event ingestion, deterministic correlation rules, incident lifecycle state machine.
10. **`remediation`**: Remediation proposals, human-in-the-loop approval gates, patch generation, re-scan verification triggers.
11. **`audit`**: Append-only audit logger capturing security-relevant state transitions with actor attribution.
12. **`common`**: Shared value objects, standard REST response DTOs, global exception handlers, and pagination helpers.
