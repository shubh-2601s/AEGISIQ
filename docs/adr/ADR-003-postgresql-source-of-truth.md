# ADR-003: PostgreSQL as the Authoritative Source of Truth

## Status
Accepted

## Date
2026-09-13

## Context
AegisIQ manages mission-critical security artifacts: user identities, organization tenancies, repository metadata, vulnerability findings, risk evaluations, asset inventories, topological relationships, and audit ledgers.

Security data demands rigorous integrity, auditability, ACID transactional consistency, and strict referential integrity. Vulnerabilities must be reliably linked to specific scans and repositories, and audit logs must guarantee persistent write-ahead durability.

Teams often consider document databases (MongoDB) or graph databases (Neo4j) early on to store flexible JSON schemas or graph edges. However, document stores compromise transactional guarantees and referential constraints, while dedicated graph databases introduce additional operational overhead and separate consistency models.

## Decision
We select **PostgreSQL 16** as the authoritative, unified source of truth for the AegisIQ platform.

Database rules:
- **Schema Management via Flyway**: All database changes must be versioned via forward-only Flyway migration scripts (`V1__...sql`, `V2__...sql`). Hibernate `ddl-auto` is strictly disabled (`none`) to prevent automatic or uninspected schema mutations in production.
- **Relational Integrity**: Foreign keys, composite indexes, unique constraints, and check constraints will be enforced at the database level.
- **Selective JSONB Usage**: Relational tables will model core entities (users, projects, scans, findings, assets, incidents, audit logs). JSONB columns are reserved strictly for arbitrary or vendor-specific metadata (e.g., rule-specific evidence payloads, cloud configuration blobs).
- **UUID Identifiers**: Entities use UUIDs (or collision-resistant identifiers) to prevent enumeration and sequential IDOR attacks.

## Alternatives Considered
1. **Document Store (MongoDB / DocumentDB)**:
   - *Pros*: Schema flexibility for heterogeneous finding structures.
   - *Cons*: Weak relational consistency, no declarative multi-table foreign keys, complex audit trail guarantees.
2. **Dedicated Graph Database (Neo4j)**:
   - *Pros*: Native Cypher queries for deep graph traversal.
   - *Cons*: Additional stateful service to operate, distributed consistency synchronization needed between primary database and graph database. PostgreSQL recursive CTEs and relational join tables easily satisfy AegisIQ's topological query needs.

## Consequences
### Positive
- Strict ACID transactions guarantee that scans, findings, and audit logs are recorded reliably.
- Battle-tested performance, indexing (B-tree, GIN for JSONB), and relational modeling.
- Deterministic migrations reproducible across CI/CD, local development, and production environments.

### Negative / Trade-offs
- Schema changes require authoring explicit SQL migrations.
- Deep graph traversal beyond 4-5 hops requires optimized recursive CTE queries or indexed edge tables.
