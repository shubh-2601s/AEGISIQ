# ADR-005: Relational Representation of the Security Graph

## Status
Accepted

## Date
2026-09-13

## Context
Vulnerabilities do not exist in isolation. A SQL Injection vulnerability in an internal administrative reporting microservice represents a very different risk posture than the exact same vulnerability exposed directly on an unauthenticated Internet-facing login endpoint.

AegisIQ requires a graph-like representation of entities and their relationships:
`Internet` → `Public API / Route` → `Application Asset` → `Vulnerability Finding` → `Credential / Secret` → `Database Asset`.

Introducing a dedicated graph database (such as Neo4j, Amazon Neptune, or TigerGraph) adds substantial infrastructure complexity:
- Additional container/server processes to manage, monitor, and scale.
- Distributed synchronization challenges between PostgreSQL (primary source of truth) and the graph database.
- Lack of unified transactional boundaries across relational entities and graph edges.

## Decision
We represent the Security Graph relationally inside **PostgreSQL** using a normalized **Adjacency / Node-Edge Model** abstracted behind a dedicated Java `GraphService` interface.

### Data Model Design:
- `assets`: Represents physical or logical nodes (Application, API, Database, Host, Cloud Resource, Credential).
- `asset_edges`: Represents directed relationships (`source_asset_id`, `target_asset_id`, `relationship_type`, `exposure_level`, `metadata`).
- Relationships include: `EXPOSES`, `CONNECTS_TO`, `CONTAINS_VULNERABILITY`, `ACCESSES_DATA`, `AUTHENTICATES_WITH`.
- Finding and Asset links: Explicit foreign key linkage `findings.asset_id -> assets.id`.

### Traversal Implementation:
- Attack paths (e.g., finding paths from Internet-exposed entry points to critical databases) are computed using PostgreSQL Recursive Common Table Expressions (CTEs) or in-memory depth-first search (DFS/BFS) for scoped project subgraphs.
- The `GraphService` Java interface completely encapsulates graph traversal and serialization, enabling seamless migration to a dedicated graph engine in the future if graph depth and scale justify it.

## Alternatives Considered
1. **Dedicated Graph Database (Neo4j)**:
   - *Pros*: Native Cypher query syntax, visual browser.
   - *Cons*: Heavy operational overhead, memory consumption, lack of ACID transactions spanning relational findings and graph edges.
2. **Denormalized JSON Graph Blobs**:
   - *Pros*: Easy to store in a single column.
   - *Cons*: Inefficient querying, no referential integrity when assets or findings are deleted or updated.

## Consequences
### Positive
- Zero additional infrastructure services; runs entirely within existing PostgreSQL deployment.
- Strict referential integrity: deleting an asset automatically cascades or cleans up connected edges.
- Full transactional guarantees when committing scan results, asset discoveries, and graph edges.
- Clean abstraction allows future plug-and-play replacement without refactoring consumers.

### Negative / Trade-offs
- Deep graph analytics across tens of hops require careful SQL CTE index optimization.
- Graph visualization queries must transform relational edge lists into node-link DTOs for the frontend.
