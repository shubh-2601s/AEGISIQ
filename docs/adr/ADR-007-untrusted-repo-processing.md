# ADR-007: Secure Untrusted Repository Processing

## Status
Accepted

## Date
2026-09-13

## Context
A core capability of AegisIQ is scanning uploaded source code repositories and archives. By definition, **code repositories submitted for security analysis must be treated as completely untrusted input**.

A malicious actor or an attacker with access to a scanned repository could attempt severe exploits during file ingestion and analysis:
- **Zip Slip (Path Traversal)**: Archive files containing paths with directory traversal sequences (e.g., `../../../../etc/passwd` or `../../app/config.properties`) designed to overwrite system files upon unzipping.
- **Zip Bomb (Decompression Bomb)**: High-compression archives (e.g., 42.zip) that expand into gigabytes or terabytes of data, causing CPU starvation and disk exhaustion (Denial of Service).
- **Malicious Symbolic Links**: Symlinks pointing to host filesystem paths (`/etc/shadow`, `C:\Windows\System32`) to read host files during scanner traversal.
- **Arbitrary Code Execution via Build Scripts**: Running build tools (`mvn compile`, `npm install`, `gradle build`, `pip install`) that execute arbitrary setup scripts (`postinstall`, custom plugins) contained within the scanned repository.

## Decision
We enforce strict defensive controls for all repository ingestion and processing:

1. **Zero Execution Policy**:
   - AegisIQ **never** compiles, executes, runs binaries, or invokes build/package installation scripts from scanned repositories.
   - Analysis is strictly performed via static file reading, Lexer/AST parsing, and regular expression evaluation.

2. **Zip Slip Prevention & Canonical Path Verification**:
   - All archive extraction logic (ZIP, TAR) verifies the canonical destination path of every entry before writing to disk:
     ```java
     Path targetFile = targetDir.resolve(entry.getName()).normalize();
     if (!targetFile.startsWith(targetDir)) {
         throw new SecurityException("Zip Slip detected: " + entry.getName());
     }
     ```

3. **Resource Exhaustion Limits**:
   - Maximum archive upload size: 50 MB.
   - Maximum uncompressed extraction size: 250 MB.
   - Maximum compression ratio: 10:1 (rejects decompression bombs).
   - Maximum file count: 5,000 files per repository.
   - Maximum single file size for static analysis: 2 MB (skips minified or binary blobs).

4. **Symlink and File Type Rejection**:
   - Symbolic links and hard links are prohibited during extraction and immediately discarded.
   - Executable binaries, native libraries (`.dll`, `.so`, `.exe`), and system devices are filtered and ignored.

5. **Isolated Ephemeral Sandboxing**:
   - Extracted repositories are stored in an isolated temporary directory scoped by unique scan UUIDs and securely purged upon scan completion.

## Alternatives Considered
1. **Dynamic Sandboxed Execution (Running Code in MicroVMs/Containers)**:
   - *Pros*: Could capture runtime behaviors and dynamic dependencies.
   - *Cons*: Immense infrastructure overhead, container breakout risks, non-deterministic execution times, complex networking isolation.
2. **Naive In-Memory ZIP Processing without Size Limits**:
   - *Pros*: Avoids local disk writes.
   - *Cons*: Extreme vulnerability to Out-Of-Memory (OOM) Denial of Service crashes via Zip bombs.

## Consequences
### Positive
- Immune to Zip Slip, Zip Bomb, and symlink exfiltration vulnerabilities.
- Guaranteed safety against malicious build scripts and repository execution.
- Deterministic, bounded resource consumption per scan.

### Negative / Trade-offs
- Static analysis cannot execute dynamic test cases or build-time bytecode weaving.
- Files exceeding size or depth thresholds must be safely bypassed with an audit notice.
