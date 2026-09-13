# ADR-004: Deterministic Security Engines over LLM Vulnerability Detection

## Status
Accepted

## Date
2026-09-13

## Context
A major trend in modern AI tooling is attempting to feed raw source code directly to Large Language Models (LLMs) and asking: *"Does this code contain security vulnerabilities?"*

In practice, this approach fails fundamental security engineering standards:
- **Non-Deterministic**: The same source file fed to an LLM at different temperatures, context positions, or time stamps will yield inconsistent findings, violating auditability.
- **High Hallucination Rate**: LLMs routinely fabricate non-existent CVEs, misidentify safe code as critical vulnerabilities, or overlook obvious syntax-level injection patterns.
- **Context Window and Cost Prohibitions**: Analyzing multi-gigabyte codebases by piping millions of tokens into external LLMs is financially unsustainable, slow, and exposes customer IP.
- **Lack of Verifiable Grounding**: LLMs cannot trace syntactic AST nodes to concrete language grammar rules.

## Decision
In AegisIQ: **Deterministic security engines are authoritative.**

The primary vulnerability detection, categorization, and rule evaluation must be executed exclusively by deterministic static security engines and configuration parsers.
1. The static security engine implements rule-based AST and lexical pattern matching implementing a formal `SecurityRule` interface.
2. Every finding emitted must contain verifiable evidence: file path, line number, matched snippet, rule ID, and confidence level.
3. The LLM is **strictly prohibited** from acting as the primary vulnerability detection mechanism.
4. The AI subsystem is deployed downstream, only after findings have been deterministically identified and recorded. The AI is used exclusively for:
   - Explaining vulnerabilities in plain language to developers.
   - Synthesizing cross-asset contextual impact.
   - Explaining complex attack paths.
   - Generating contextual remediation patch proposals.
   - Natural language queries across already verified security data.

## Alternatives Considered
1. **Direct LLM Source Code Scanning**:
   - *Pros*: Quick to prototype, broad language coverage without custom parsers.
   - *Cons*: Prohibitive false-positive and false-negative rates, severe hallucination risk, non-reproducible scans, high token latency and cost.
2. **Hybrid Where LLM Overrides Rule Engine**:
   - *Pros*: LLM could theoretically filter rule false positives.
   - *Cons*: Introduces probabilistic suppression of genuine security findings; non-auditable compliance failure.

## Consequences
### Positive
- **100% Deterministic Scans**: The same codebase scanned twice produces identical findings, severity scores, and line mappings.
- **Zero Hallucinated Findings**: Every finding is backed by explicit code evidence and identifiable rule IDs (e.g., `AIG-SQL-001`).
- **High Scan Throughput**: Local AST/regex parsing processes thousands of lines of code per second without token billing or cloud latency.
- **Defensible Security**: Interviewers, auditors, and customers can trace every finding to an auditable rule.

### Negative / Trade-offs
- Writing static analysis rules requires intentional parser engineering and syntax modeling.
- Language coverage must be expanded rule-by-rule rather than relying on an LLM's general knowledge.
