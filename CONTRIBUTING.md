# Contributing to AegisIQ

Thank you for your interest in contributing to **AegisIQ — AI-Powered Security Intelligence Platform**.

AegisIQ is built to enterprise security and software engineering standards. Every contribution must adhere to strict principles regarding software architecture, defensive security ethics, automated testing, and deterministic analysis.

---

## 1. Core Architectural Tenet

**Deterministic security engines are authoritative.**
The LLM is **never** the source of truth for whether a vulnerability exists. Vulnerability discovery, classification, and scoring are driven by deterministic rules and normalized algorithms. The AI service provides contextual investigation, explanation, summarization, and remediation assistance over validated findings.

---

## 2. Defensive Security Ethics

AegisIQ is strictly a defensive security platform:
- Security testing must use controlled test environments and authorized fixtures.
- Contributions that implement offensive capabilities, credential harvesting, unauthorized persistence, exploitation tools, or automated payload execution against arbitrary targets are strictly prohibited.
- Scanned repositories must always be treated as untrusted input. Never compile, execute, or invoke scripts from analyzed codebases.

---

## 3. Development Workflow & Milestones

Development follows an incremental, milestone-based approach (M0 → M10).
Before introducing changes:
1. Verify that your change maps directly to the active milestone.
2. Maintain clean separation between modules:
   - `backend/`: Java 21, Spring Boot Modular Monolith (domain, service, repository, controller).
   - `frontend/`: React, TypeScript, Vite, dark-mode security operations design.
   - `ai-service/`: Python 3.12, FastAPI, Pydantic, swappable LLM abstractions.
   - `security-engine/`: Deterministic static rules and parser abstractions.
   - `security-test-lab/`: Controlled vulnerable and safe fixtures with automated TP/TN/FP/FN verification.
3. Write automated unit and integration tests alongside every feature or rule.

---

## 4. Git & Commit Conventions

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard with clear scopes:

```text
feat(auth): implement JWT authentication with refresh rotation
feat(scanner): add SQL injection detection rule
feat(risk): implement AegisIQ risk model calculation
feat(ai): add security analyst gateway client
test(scanner): add SQL injection regression fixtures
docs(architecture): document AI trust boundary
fix(engine): prevent Zip Slip during untrusted archive extraction
```

Avoid mega-commits containing unrelated changes across modules.

---

## 5. Coding Standards

### Backend (Java)
- Java 21, Spring Boot 3.3.x.
- Adhere to the Google Java Style Guide.
- Use constructor injection; avoid field-level `@Autowired`.
- Controllers must remain thin DTO orchestrators; all business logic belongs in the service layer.
- Use immutable records or DTOs for data transfer; never expose entity models directly via REST APIs.
- Parameterize all database queries; rely on Flyway migrations for schema evolution.

### Frontend (TypeScript / React)
- Strict TypeScript (`noImplicitAny`, strict null checks).
- Component-driven architecture using Vanilla CSS modules or design tokens.
- Maintain a dark-first, high-density, professional Security Operations Center (SOC) aesthetic.
- Handle all visual states explicitly: Loading, Error, Empty, and Populated.

### AI Service (Python)
- Python 3.12, PEP 8 compliance, formatted with `ruff` or `black`.
- Strict typing with Pydantic v2 models.
- Treat all repository content, logs, and user prompts as untrusted data; enforce prompt-injection boundaries.
- Support offline mock providers for automated regression and CI environments.

---

## 6. Testing & Quality Gate

Every Pull Request must satisfy:
1. **Unit Tests**: Pass with no regressions (`mvn test`, `pytest`, `npm test`).
2. **Security Detection Benchmark**: Security rules must maintain verified precision and recall against fixtures in `security-test-lab/`.
3. **AI Groundedness**: AI prompts and context builders must pass prompt injection resilience and groundedness tests.
4. **Zero Hardcoded Secrets**: Scanned by pre-commit hooks and static analyzers.
5. **No Stack Traces**: Public API errors must return structured error DTOs without revealing internal implementation details.

---

## 7. Reporting Security Vulnerabilities

If you discover a security vulnerability within AegisIQ itself, please report it privately to `security@aegisiq.internal` or open a private security advisory on GitHub rather than filing a public issue.
