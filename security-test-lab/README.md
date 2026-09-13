# AegisIQ Security Test Lab

## Purpose
The `security-test-lab/` is an isolated, controlled benchmark suite containing paired vulnerable and safe code fixtures used to evaluate the precision, recall, and false-positive rates of AegisIQ security rules.

## Directory Structure
```text
security-test-lab/
├── vulnerable-app/            # Intentionally vulnerable code patterns (True Positives)
│   ├── sql/                   # String concatenation in queries
│   ├── command/               # Unsafe ProcessBuilder invocations
│   ├── path/                  # Direct file path resolution without normalization
│   ├── xss/                   # Unescaped reflection
│   ├── secrets/               # Hardcoded test API tokens
│   └── auth/                  # Weak hashing (MD5/SHA1)
├── safe-app/                  # Safe idiomatic counterparts (True Negatives)
│   ├── sql/                   # Parameterized queries & PreparedStatement
│   ├── command/               # Whitelisted argument execution
│   ├── path/                  # Normalized path resolution with boundary check
│   ├── xss/                   # Encoded outputs
│   ├── secrets/               # Environment-based secret loading
│   └── auth/                  # BCrypt password hashing
├── cloud-fixtures/            # Declarative cloud config files (S3, IAM, Security Groups)
├── network-events/            # Simulated security event telemetry logs
├── ai-adversarial-tests/      # Source files containing prompt-injection payloads
└── expected-results/          # Expected JSON finding matrices for benchmark evaluation
```

## Formal Evaluation Metrics
- **True Positive (TP)**: Vulnerability correctly flagged in `vulnerable-app`.
- **True Negative (TN)**: Safe pattern in `safe-app` correctly evaluated with 0 findings.
- **False Positive (FP)**: Safe code in `safe-app` mistakenly flagged as vulnerable.
- **False Negative (FN)**: Vulnerable pattern in `vulnerable-app` missed by the engine.

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}, \quad \text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}, \quad F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$
