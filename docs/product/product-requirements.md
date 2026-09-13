# AegisIQ Product Requirements Document (PRD)

## 1. Product Vision & Core Mission

AegisIQ is an AI-powered security intelligence platform providing unified visibility, deterministic vulnerability detection, attack-path correlation, risk prioritization, and human-in-the-loop remediation across modern application repositories and infrastructure assets.

The platform explicitly avoids being a thin LLM wrapper or a standalone vulnerability scanner. AegisIQ enforces the authoritative principle: **Deterministic security engines are authoritative.** Large language models are leveraged strictly for contextual investigation, risk explanation, and remediation proposal generation over verified security telemetry.

---

## 2. The Core Security Loop

All capabilities within AegisIQ align directly to the continuous security lifecycle:

```
COLLECT ──▶ DETECT ──▶ CORRELATE ──▶ ASSESS RISK ──▶ PRIORITIZE
                                                            │
VERIFY ◀── RE-SCAN ◀── APPLY ◀── APPROVE ◀── REMEDIATE ◀────┴── EXPLAIN & INVESTIGATE
```

1. **COLLECT**: Ingest source code archives, cloud configurations, infrastructure assets, and runtime security events safely without executing untrusted code.
2. **DETECT**: Execute deterministic static security rules and configuration audits to discover verifiable vulnerabilities.
3. **CORRELATE**: Map vulnerabilities to infrastructure assets in a relational security graph, identifying reachable attack paths from Internet-exposed surfaces.
4. **ASSESS RISK**: Compute multi-factor risk scores via the AegisIQ Risk Model.
5. **PRIORITIZE**: Rank vulnerabilities across the organization by composite risk and attack-path severity.
6. **EXPLAIN & INVESTIGATE**: Enable security analysts to query an AI Security Analyst regarding root causes, reachability, and affected assets grounded strictly in verified findings.
7. **REMEDIATE**: Generate structured code patches and configuration fixes.
8. **APPROVE**: Enforce mandatory human approval prior to staging or applying remediation.
9. **APPLY & RE-SCAN**: Stage changes and trigger an automated verification scan.
10. **VERIFY**: Confirm vulnerability resolution and update the organization's security posture.

---

## 3. User Personas & Core Journeys

### 3.1. Security Analyst
- **Primary Goal**: Rapidly triage incoming vulnerabilities, trace attack paths from external surfaces to critical databases, investigate incidents, and approve remediation actions.
- **Key Actions**:
  - Review high-risk findings on the Security Dashboard.
  - Query the AI Analyst: *"Why is finding AIG-SQL-001 critical in our staging environment?"*
  - Review AI-generated patch proposals and approve valid fixes.

### 3.2. Software Developer
- **Primary Goal**: Understand why scanned code contains vulnerabilities and receive actionable, idiomatic fix proposals.
- **Key Actions**:
  - Inspect line-level evidence and remediation code snippets directly within the findings view.
  - Apply suggested patch and verify fix with a re-scan.

### 3.3. Security & Organization Administrator
- **Primary Goal**: Maintain multi-project security visibility, manage user roles, and audit sensitive actions.
- **Key Actions**:
  - Configure projects and repositories.
  - Review immutable audit logs for compliance.
  - Manage role-based permissions (`USER`, `SECURITY_ANALYST`, `ADMIN`).
