# ADR-002: Java Backend and Python AI Service Boundary

## Status
Accepted

## Date
2026-09-13

## Context
AegisIQ requires both high-throughput deterministic data processing (parsing codebases, relational entity storage, risk computation, RBAC) and modern AI/LLM integration (context synthesis, prompt orchestration, RAG, embeddings, evaluation).

Java is exceptionally well-suited for enterprise system foundations, static analysis, type-safe business logic, and concurrent data pipelines. However, the machine learning and LLM ecosystem (LangChain, LlamaIndex, LiteLLM, Pytest evals, HuggingFace, tokenizers) is overwhelmingly centered on Python.

Attempting to run LLM orchestrations natively in Java (e.g., via nascent Java LLM libraries) severely limits tooling flexibility, evaluation frameworks, and provider adaptability. Conversely, building the entire backend in Python compromises concurrency, memory predictability for large repo parsing, and enterprise transactional safety.

## Decision
We establish a clean process and network boundary between:
1. **The Primary Java Backend (Spring Boot)**: Acts as the authoritative core platform, owning the relational database, identity, scan execution, risk calculation, audit logs, and client APIs.
2. **The AI Service (Python FastAPI)**: Operates as an internal, stateless microservice dedicated to prompt construction, LLM provider abstraction, RAG retrieval, and AI evaluation.

### Interface & Communication Rules:
- The Java backend communicates with the Python AI service over an internal HTTP/REST interface (`POST /internal/ai/analyze`, `POST /internal/ai/remediate`).
- Communication is authenticated using an internal pre-shared service key (`INTERNAL_SERVICE_API_KEY`) and protected from public exposure.
- Requests pass structured, pre-validated context from Java (findings, asset details, risk score, attack paths).
- The Python AI service has **no direct access** to the PostgreSQL database, file system, or external execution tools.
- Timeouts, retry policies with exponential backoff, and circuit breakers are enforced on the Java client side.

## Alternatives Considered
1. **Single Monolith in Java using LangChain4j**:
   - *Pros*: Single runtime environment.
   - *Cons*: Limited Python AI ecosystem access, restricted evaluation frameworks, slower support for emerging LLM paradigms.
2. **Single Monolith in Python (FastAPI/Django)**:
   - *Pros*: Single language for both backend and AI.
   - *Cons*: Inferior enterprise modular monolith patterns, weaker type safety at scale, lower performance for heavy in-memory AST and repository parsing.

## Consequences
### Positive
- Best-of-breed technology selection: Java 21 for authoritative security platform engineering, Python 3.12 for AI engineering.
- Enforced security boundary: The AI model is physically decoupled from database read/write access.
- Swappable AI implementations and independent deterministic evaluation suites in Python.

### Negative / Trade-offs
- Introduces an HTTP network hop between backend and AI service.
- Requires running two services (Java Spring Boot and Python FastAPI) in development and deployment environments.
