# AegisIQ — AI-Powered Security Intelligence Platform

AegisIQ is a unified security intelligence platform that collects security signals from source code repositories, cloud configurations, infrastructure assets, and runtime events; detects vulnerabilities using deterministic security engines; correlates findings into graph-based attack paths; prioritizes risks; and empowers security analysts with an AI-driven investigation, contextual reasoning, and remediation workflow.

---

## Why AegisIQ

Modern engineering and security teams face fragmented tooling: static analysis tools emit noisy, disconnected alerts; cloud posture engines lack application context; and security analysts waste hours manually piecing together attack paths while LLM wrappers hallucinate false vulnerabilities.

AegisIQ bridges this gap through a single authoritative principle: **Deterministic security engines are authoritative.** 
The platform never uses probabilistic LLMs to guess whether a vulnerability exists. Instead, AegisIQ executes deterministic static and configuration engines to discover verifiable findings, maps them against an asset-centric attack graph, computes an objective risk score, and then equips the analyst with an AI Security Analyst grounded strictly in verified security telemetry.

```
Source Code / Cloud Config / Telemetry
                │
                ▼
Deterministic Security Engines (authoritative)
                │
                ▼
       Structured Findings
                │
                ▼
        AegisIQ Risk Engine
                │
                ▼
     Asset & Attack Graph (Relational)
                │
                ▼
   AI Security Analyst Context Gateway
                │
                ▼
FastAPI AI Service (LLM / RAG / Grounded Reasoning)
                │
                ▼
Investigation, Explanation, & Remediation (Human Approval Required)
```

---

## Features

- **Authoritative Application Security Engine**: Modular AST/pattern-based static analysis detecting SQL Injection, Cross-Site Scripting (XSS), Command Injection, Path Traversal, Hardcoded Secrets, and Insecure Authentication without executing untrusted code.
- **Deterministic AegisIQ Risk Engine**: Explicit, multi-factor risk model combining severity, exploitability, asset exposure, environment criticality, detection confidence, and downstream attack-path impact.
- **Relational Security Graph**: Maps topological relationships between Internet entry points, exposed APIs, backend services, credentials, and databases to discover viable attack chains.
- **AI Security Analyst (FastAPI + RAG)**: Provides interactive vulnerability investigation, developer-focused remediation guidance, attack-path summaries, and posture queries grounded in validated findings.
- **Safe Untrusted Repository Handling**: Built-in defenses against Zip Slip, directory traversal, oversized archives, and execution exploits when analyzing untrusted codebases.
- **Human-in-the-Loop Remediation**: Generates structured patch proposals, configuration changes, and verification scans with mandatory analyst approval before state transition.
- **Immutable Audit Logging**: Traceable data lineage for every scan, finding update, and remediation action.

---

## Architecture

AegisIQ is designed as a high-performance **Modular Monolith** for core business operations paired with a specialized **AI Gateway Service**:

```
┌─────────────────────────────────────────────────────────────┐
│                 React + TypeScript Frontend                 │
│         (Security Operations Center / Dark Interface)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Java 21 / Spring Boot Backend                   │
│  ┌─────────────────────────┬─────────────────────────────┐  │
│  │ Authentication & RBAC   │ Organizations & Projects    │  │
│  ├─────────────────────────┼─────────────────────────────┤  │
│  │ Safe Scanner Ingestion  │ Security Engine & Rules     │  │
│  ├─────────────────────────┼─────────────────────────────┤  │
│  │ AegisIQ Risk Engine     │ Relational Security Graph   │  │
│  ├─────────────────────────┼─────────────────────────────┤  │
│  │ Threat Detection & Logs │ Remediation Lifecycle       │  │
│  └─────────────────────────┴─────────────────────────────┘  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │ Internal REST
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      PostgreSQL Database     │ │   Python 3.12 AI Service   │
│  - Authoritative Findings    │ │  - FastAPI Microservice    │
│  - Relational Attack Graph   │ │  - Swappable LLM Providers │
│  - Flyway Versioned Schema   │ │  - Prompt Injection Defense│
│  - Immutable Audit Records   │ │  - Deterministic Eval Suite│
└──────────────────────────────┘ └────────────────────────────┘
```

For detailed architectural justifications, consult our Architecture Decision Records in [`docs/adr/`](docs/adr/):
- [ADR-001: Modular Monolith Architecture](docs/adr/ADR-001-modular-monolith.md)
- [ADR-002: Java Backend and Python AI Service Boundary](docs/adr/ADR-002-backend-ai-boundary.md)
- [ADR-003: PostgreSQL as Authoritative Source of Truth](docs/adr/ADR-003-postgresql-source-of-truth.md)
- [ADR-004: Deterministic Security Engine over LLM Detection](docs/adr/ADR-004-deterministic-detection.md)
- [ADR-005: Relational Security Graph Representation](docs/adr/ADR-005-security-graph-representation.md)
- [ADR-006: AI Trust Boundaries & Prompt-Injection Defense](docs/adr/ADR-006-ai-trust-boundary.md)
- [ADR-007: Safe Untrusted Repository Processing](docs/adr/ADR-007-untrusted-repo-processing.md)

---

## Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router, Vanilla CSS | Type-safe, fast build cycles, dark-first SOC ergonomics without CSS framework bloat |
| **Backend** | Java 21, Spring Boot 3.3.x, Spring Security, Spring Data JPA | Enterprise-grade reliability, strict type safety, modular monolith architecture |
| **Database** | PostgreSQL 16, Flyway | Authoritative relational data store, ACID transactions, versioned migrations |
| **AI Service** | Python 3.12, FastAPI, Pydantic v2 | Industry-standard AI ecosystem with modular LLM provider abstractions |
| **Infrastructure** | Docker, Docker Compose | Reproducible multi-container local and production deployment |
| **Testing** | JUnit 5, Mockito, Pytest, Playwright, Security Test Lab | Comprehensive testing pyramid across unit, integration, detection, and AI evaluation |

---

## Security Architecture

AegisIQ treats security as an engineering discipline throughout its implementation:
- **Defense in Depth**: Zero trust between untrusted uploaded artifacts and the server. Uploaded archives are inspected using bounded streams and strict path normalization to eliminate Zip Slip (`../`) vulnerabilities.
- **Strict Role-Based Access Control (RBAC)**: Enforced authoritative checks (`USER`, `SECURITY_ANALYST`, `ADMIN`) across all REST endpoints with organization-level tenancy to prevent Insecure Direct Object References (IDOR).
- **Hardened Data Persistence**: Parameterized JPA/Hibernate queries, strict foreign key constraints, and Flyway-managed schema migrations prevent SQL injection and schema drift.
- **Audit Logging**: Immutable event ledger logging all authentication attempts, scan triggers, finding updates, and remediation decisions with actor attribution.

---

## AI Architecture

The AI subsystem operates within explicit security and architectural boundaries:
- **Context Grounding**: The AI service never accesses raw database connections or external tools with write permissions. It receives pre-filtered, structured JSON payloads containing verified findings, affected assets, and computed risk scores.
- **Prompt-Injection Defense**: Untrusted code snippets, commit messages, and user comments are isolated in bounded XML/JSON data blocks with clear system-level instructions instructing the model to treat content purely as data.
- **Response Structure**: Responses adhere to strict schemas separating **Facts** (verified by engines), **Inferences** (AI analysis), **Recommendations** (remediation guidance), and **Uncertainty**.

---

## Getting Started

### Prerequisites
- **Java**: OpenJDK 21 or higher
- **Node.js**: v20+ and npm
- **Python**: 3.11 or 3.12
- **Docker & Docker Compose**: Optional for containerized orchestration
- **PostgreSQL**: Optional for local execution (defaults to PostgreSQL, supports H2 test profile)

### Environment Configuration
Copy the provided environment template and configure your local settings:
```bash
cp .env.example .env
```

---

## Running Locally

### Option 1: Containerized (Docker Compose)
To start the complete platform including PostgreSQL, Backend, Frontend, and AI Service:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api/v1`
- AI Service: `http://localhost:8000/docs`

### Option 2: Local Development Mode

#### 1. Start AI Service
```bash
cd ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

#### 2. Start Backend
```bash
cd backend
mvn clean spring-boot:run
```

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Running Tests

AegisIQ enforces an exhaustive testing strategy across all system layers:

### Backend Unit & Integration Tests
```bash
cd backend
mvn clean test
```

### AI Service Tests & Prompt-Injection Evals
```bash
cd ai-service
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Security Test Lab

AegisIQ includes a dedicated security test laboratory located in [`security-test-lab/`](security-test-lab/) featuring intentionally vulnerable and safe test fixtures:
- **True Positives**: Vulnerable code patterns (e.g., dynamic SQL concatenation, unsanitized OS command inputs, raw path concatenation, unencrypted tokens).
- **True Negatives**: Safe, idiomatic implementations (e.g., parameterized queries, whitelisted process execution, path resolution against canonical roots).

The test lab continuously validates security rule precision and recall:
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

---

## Example Workflow

The standard AegisIQ operational loop proceeds as follows:
1. **Ingest & Scan**: Security analyst creates a project and triggers a scan against a repository archive.
2. **Deterministic Detection**: Security engine parses source files, identifies a critical SQL injection pattern in `UserDao.java`, and records evidence.
3. **Graph Correlation**: The graph service correlates the finding to the public-facing `/api/v1/auth/login` endpoint, discovering a direct path from the public Internet to the production database.
4. **Risk Scoring**: AegisIQ Risk Engine scores the finding at 9.4/10 due to public exposure and database criticality.
5. **AI Investigation**: Analyst selects the finding and asks: *"Explain how this finding can be exploited in our current topology."* The AI responds with grounded topological context.
6. **Remediation & Approval**: AI proposes a parameterized JPA query patch. The analyst reviews and approves the proposal.
7. **Verification Scan**: AegisIQ triggers an automated re-scan, confirming resolution and updating the project posture.

---

## Screenshots

*(Screenshots and architecture walkthroughs will be provided upon completion of Frontend Milestone M1.)*

---

## Project Structure

```text
aegisiq/
├── frontend/                  # React + TypeScript Vite application
│   ├── src/                   # Components, pages, hooks, state, services
│   ├── public/                # Static assets
│   ├── tests/                 # Component and UI unit tests
│   └── package.json
├── backend/                   # Java 21 Spring Boot Modular Monolith
│   ├── src/
│   │   ├── main/java/com/aegisiq/backend/
│   │   │   ├── auth/          # Authentication, JWT, RBAC
│   │   │   ├── users/         # User and organization management
│   │   │   ├── projects/      # Projects and repository metadata
│   │   │   ├── scanning/      # Safe repo ingestion & scanner orchestration
│   │   │   ├── findings/      # Authoritative finding repository
│   │   │   ├── risk/          # AegisIQ Risk Engine implementation
│   │   │   ├── assets/        # Asset intelligence & classification
│   │   │   ├── graph/         # Attack-path analysis & topology
│   │   │   ├── incidents/     # Security incidents & event correlation
│   │   │   ├── remediation/   # Proposal lifecycle & approval gates
│   │   │   ├── audit/         # Immutable audit records
│   │   │   └── common/        # Shared DTOs, exceptions, error handling
│   │   └── main/resources/    # Application properties, Flyway migrations
│   └── pom.xml
├── ai-service/                # Python 3.12 FastAPI microservice
│   ├── app/                   # API routes, LLM provider abstraction, RAG
│   ├── tests/                 # Groundedness & adversarial prompt-injection tests
│   └── requirements.txt
├── security-engine/           # Reusable rule definitions, parser contracts
├── security-test-lab/         # Controlled vulnerable and safe code fixtures
├── docs/                      # Engineering, security, and architecture docs
│   ├── adr/                   # Architecture Decision Records (ADR-001 - ADR-007)
│   ├── architecture/          # High-level architecture and data flows
│   ├── security/              # Threat model and security principles
│   ├── testing/               # Multi-tier testing strategy
│   ├── database/              # Schema designs and domain models
│   ├── infrastructure/        # Containerization and deployment strategy
│   ├── api/                   # REST API specifications
│   └── product/               # Product requirements and workflow specs
├── docker/                    # Multi-stage Dockerfiles
├── docker-compose.yml         # Container orchestration configuration
├── .env.example               # Environment variable template
├── .gitignore
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

## Limitations

- **AST Depth**: Static security analysis uses pattern-based semantic rule matching. Dynamic taint tracking across complex inter-procedural call chains is planned for future engine iterations.
- **Cloud Auditing**: Cloud security configuration analysis runs against controlled configuration fixtures and declarative policies; live cloud provider API synchronization is architected via adapter interfaces.
- **Offline LLM Performance**: When running with local/mock LLM providers, investigation responses are rule-synthesized rather than dynamically reasoned.

---

## Roadmap

- [x] **M0: Product Foundation** (Architecture, ADRs 001-007, Threat Model, Governance, Docker)
- [ ] **M1: Platform Foundation** (Modular Monolith Backend, Flyway, JWT/RBAC, React Shell)
- [ ] **M2: Application Security Engine** (Static Rule Engine, Security Test Lab, TP/TN Benchmarks)
- [ ] **M3: Risk Intelligence** (Deterministic AegisIQ Risk Model & Prioritization)
- [ ] **M4: Security Graph** (Asset Intelligence, Topology, Attack Paths)
- [ ] **M5: AI Security Analyst** (FastAPI Service, RAG, Prompt Injection Defenses, Analyst Chat)
- [ ] **M6: Cloud Security** (Configuration Auditing, Fixtures, Adapter Architecture)
- [ ] **M7: Threat Detection** (Event Ingestion, Deterministic Correlation, Incidents)
- [ ] **M8: Remediation Engine** (Proposals, Human Approval Gates, Re-scan Verification)
- [ ] **M9: Production Engineering** (CI/CD Pipeline, Observability, Container Hardening)
- [ ] **M10: Portfolio Release** (Comprehensive Demo, Verification Reports, Final Package)

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on code style, commit conventions, and our defensive security contribution guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.