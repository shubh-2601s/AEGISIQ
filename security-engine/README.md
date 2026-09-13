# AegisIQ Static Security Rule Engine

## Overview
The `security-engine` module houses the deterministic static security rules, AST parser adapters, and vulnerability matchers.

## Architectural Mandate
- **Deterministic Rules Only**: Rules must be 100% reproducible. The same input code must always generate the exact same findings, severity, and line-level evidence.
- **Common Interface**: Every rule implements the `SecurityRule` contract:
  ```java
  public interface SecurityRule {
      String getRuleId();
      String getName();
      VulnerabilityCategory getCategory();
      Severity getSeverity();
      double getDefaultConfidence();
      String getDescription();
      String getRemediation();
      List<FindingMatch> analyze(SourceFileContext context);
  }
  ```

## Core Security Rules
1. `AIG-SQL-001`: Potential SQL Injection (Unparameterized dynamic concatenation in JDBC/JPQL).
2. `AIG-XSS-001`: Cross-Site Scripting (Unescaped user input rendered directly to response/HTML).
3. `AIG-CMD-001`: Command Injection (Unsanitized arguments passed to `Runtime.getRuntime().exec` or `ProcessBuilder`).
4. `AIG-PATH-001`: Path Traversal (File operations without canonical path boundary verification).
5. `AIG-SEC-001`: Hardcoded Secrets (Embedded AWS keys, private keys, high-entropy tokens).
6. `AIG-AUTH-001`: Insecure Authentication (Weak password hashing algorithms like MD5/SHA-1, missing CSRF).
7. `AIG-API-001`: Dangerous API Usage (Insecure deserialization, disabled SSL verification).
