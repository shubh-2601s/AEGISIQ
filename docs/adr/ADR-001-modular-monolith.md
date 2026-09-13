# ADR-001: Modular Monolith Architecture for Java Backend

## Status
Accepted

## Date
2026-09-13

## Context
AegisIQ requires a backend architecture capable of handling security signal ingestion, deterministic rule analysis, risk evaluation, asset intelligence, attack graph traversal, incident lifecycle, and AI gateway communication. 

A common design temptation in modern distributed architectures is to prematurely decompose the system into fine-grained microservices (e.g., separate Auth service, Finding service, Risk service, Graph service, Audit service). However, microservices introduce severe distributed system operational complexity:
- Network latency and RPC serialization overhead across high-frequency security pipelines.
- Distributed transaction coordination (2PC / Sagas) for finding aggregation and audit logs.
- Complex local development requirements and fragile orchestration.
- Deployment overhead without a team large enough to justify independent service boundaries.

## Decision
We will build the primary AegisIQ backend as a **Modular Monolith** in Java 21 using Spring Boot 3.3.x.

The codebase will enforce strict module boundaries organized by business domain:
`auth`, `users`, `organizations`, `projects`, `repositories`, `scanning`, `findings`, `risk`, `assets`, `graph`, `incidents`, `securityevents`, `cloudsecurity`, `remediation`, `audit`, and `common`.

Cross-module communication will occur through clean Java service interfaces or in-process application events, completely avoiding unneeded network round-trips while preserving modular encapsulation.

## Alternatives Considered
1. **Full Microservices Architecture**:
   - *Pros*: Independent deployment cycles, horizontal scaling of specific services.
   - *Cons*: Network latency bottlenecks during scan finding correlation, distributed failure modes, complex data consistency requirements, excessive operational overhead for a unified security platform.
2. **Traditional Layered Monolith without Module Isolation**:
   - *Pros*: Rapid initial prototyping.
   - *Cons*: High risk of "big ball of mud" with circular dependencies between findings, risks, and assets, making future refactoring or extraction impossible.

## Consequences
### Positive
- **High Performance**: Zero network latency for inter-module operations (e.g., passing 10,000 scan findings to the risk engine).
- **Strong Consistency**: ACID transaction guarantees across findings, asset associations, and audit records.
- **Developer Ergonomics**: Seamless local execution, single-command testing, and unified debugging.
- **Future Extensibility**: Well-defined module interfaces allow any single module (such as the scan worker) to be extracted into a standalone service in the future if scale demands.

### Negative / Trade-offs
- Requires strict code discipline to prevent domain leakage and inappropriate direct repository access across module boundaries.
- All backend modules share the same application runtime and deployment cycle.
