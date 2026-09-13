package com.aegisiq.backend.scanning.engine;

import com.aegisiq.backend.findings.domain.FindingCategory;
import com.aegisiq.backend.findings.domain.FindingSeverity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Registry of all deterministic SAST detection rules.
 *
 * Rules use precompiled regex patterns for performance.
 * DESIGN: Rules are intentionally conservative (high confidence) to minimize false positives.
 * Use CASE_INSENSITIVE mode where the language is case-insensitive (SQL, HTML).
 */
@Component
public class ScanRuleRegistry {

    private final List<ScanRule> rules;

    public ScanRuleRegistry() {
        this.rules = buildRules();
    }

    public List<ScanRule> getRules() {
        return rules;
    }

    private List<ScanRule> buildRules() {
        return List.of(

            // ============================================================
            // SQL INJECTION
            // ============================================================
            new ScanRule(
                "SQLI-001",
                "SQL Injection via String Concatenation",
                "SQL query constructed by directly concatenating user input. Attackers can manipulate the query structure.",
                FindingCategory.SQL_INJECTION,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("(executeQuery|executeUpdate|execute|prepareStatement)\\s*\\(\\s*[\"'].*\\+\\s*(?:request|req|param|input|user|name|id|query|str)"),
                "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.",
                new String[]{".java", ".js", ".ts", ".py", ".php", ".cs"}
            ),

            new ScanRule(
                "SQLI-002",
                "Dynamic SQL with Format/Template Strings",
                "SQL constructed using string formatting with variables. Vulnerable to SQL injection if variables contain user input.",
                FindingCategory.SQL_INJECTION,
                FindingSeverity.HIGH,
                "MEDIUM",
                Pattern.compile("(String\\.format|f\"|f'|sprintf|%s|%d).*?(SELECT|INSERT|UPDATE|DELETE|WHERE|FROM)", Pattern.CASE_INSENSITIVE),
                "Replace with parameterized queries. If dynamic SQL is required, use an ORM query builder.",
                new String[]{".java", ".py", ".php", ".js"}
            ),

            // ============================================================
            // COMMAND INJECTION
            // ============================================================
            new ScanRule(
                "CMDI-001",
                "OS Command Injection — Runtime Exec with User Input",
                "Application invokes OS commands using Runtime.exec(), subprocess, or similar with data that may originate from user input.",
                FindingCategory.COMMAND_INJECTION,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("Runtime\\.getRuntime\\(\\)\\.exec\\s*\\(|ProcessBuilder\\s*\\(.*(?:request|req|param|input|user|cmd|command|query)"),
                "Never pass user-controlled data to OS commands. Use allowlists for any command arguments. Consider alternative APIs.",
                new String[]{".java"}
            ),

            new ScanRule(
                "CMDI-002",
                "Shell Command Execution (Python)",
                "Use of os.system, subprocess with shell=True, or similar. Dangerous if input is user-controlled.",
                FindingCategory.COMMAND_INJECTION,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("(os\\.system|subprocess\\.call|subprocess\\.run|subprocess\\.Popen).*shell\\s*=\\s*True"),
                "Use shell=False and pass arguments as a list. Never pass user input to shell=True commands.",
                new String[]{".py"}
            ),

            // ============================================================
            // PATH TRAVERSAL
            // ============================================================
            new ScanRule(
                "PATH-001",
                "Path Traversal — Unvalidated File Path Construction",
                "File path constructed from user input without validation. Attackers can read arbitrary files using ../ sequences.",
                FindingCategory.PATH_TRAVERSAL,
                FindingSeverity.HIGH,
                "HIGH",
                Pattern.compile("new\\s+File\\s*\\(.*(?:request|req|param|input|getParameter|getHeader|path|filename)"),
                "Validate all file paths: normalize with toRealPath(), check that the canonical path starts with the expected base directory.",
                new String[]{".java"}
            ),

            // ============================================================
            // HARDCODED SECRETS
            // ============================================================
            new ScanRule(
                "SEC-001",
                "Hardcoded Password in Source Code",
                "A password or secret appears to be hardcoded directly in source code. This will be committed to version control.",
                FindingCategory.HARDCODED_SECRET,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("(?i)(password|passwd|pwd|secret|api_key|apikey|api-key)\\s*=\\s*[\"'][^\"'\\s]{4,}[\"']"),
                "Move all secrets to environment variables, a secrets manager (Vault, AWS Secrets Manager), or a CI/CD secrets store. Never commit credentials.",
                null
            ),

            new ScanRule(
                "SEC-002",
                "Hardcoded AWS Credentials",
                "AWS access key or secret key hardcoded in source code.",
                FindingCategory.HARDCODED_SECRET,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("(?:AKIA|AGPA|AIPA|ANPA|ANVA|ASIA)[0-9A-Z]{16}"),
                "Rotate the exposed credentials immediately. Use IAM roles, instance profiles, or AWS Secrets Manager.",
                null
            ),

            new ScanRule(
                "SEC-003",
                "Generic API Token / Bearer Secret",
                "A generic token or bearer secret pattern detected in source. May indicate a hardcoded credential.",
                FindingCategory.HARDCODED_SECRET,
                FindingSeverity.HIGH,
                "MEDIUM",
                Pattern.compile("(?i)(token|bearer|authorization)\\s*[:=]\\s*[\"'][a-zA-Z0-9+/=._-]{20,}[\"']"),
                "Move tokens to environment variables. Rotate the token if already committed.",
                null
            ),

            new ScanRule(
                "SEC-004",
                "Private Key Material Detected",
                "Possible RSA, EC, or OpenSSH private key material found in source code.",
                FindingCategory.HARDCODED_SECRET,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----"),
                "Remove private keys from version control immediately. Rotate the key pair. Use a secrets manager.",
                null
            ),

            // ============================================================
            // INSECURE AUTHENTICATION
            // ============================================================
            new ScanRule(
                "AUTH-001",
                "Weak Hashing Algorithm — MD5",
                "MD5 is cryptographically broken and must not be used for password hashing or security-sensitive digests.",
                FindingCategory.INSECURE_AUTH,
                FindingSeverity.HIGH,
                "HIGH",
                Pattern.compile("MessageDigest\\.getInstance\\s*\\(\\s*[\"']MD5[\"']\\s*\\)"),
                "Use bcrypt, argon2id, or PBKDF2 for passwords. Use SHA-256 or SHA-3 for non-password digests.",
                new String[]{".java"}
            ),

            new ScanRule(
                "AUTH-002",
                "Weak Hashing Algorithm — SHA-1",
                "SHA-1 is deprecated for security-sensitive applications due to known collision attacks.",
                FindingCategory.INSECURE_AUTH,
                FindingSeverity.MEDIUM,
                "HIGH",
                Pattern.compile("MessageDigest\\.getInstance\\s*\\(\\s*[\"']SHA-1[\"']\\s*\\)"),
                "Use SHA-256 or higher. For password hashing, use bcrypt or argon2id.",
                new String[]{".java"}
            ),

            new ScanRule(
                "AUTH-003",
                "JWT Algorithm: None",
                "The JWT 'none' algorithm disables signature verification, allowing token forgery.",
                FindingCategory.INSECURE_AUTH,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("(?i)[\"']alg[\"']\\s*:\\s*[\"']none[\"']"),
                "Always specify a strong signing algorithm (RS256, ES256, HS256). Explicitly reject 'none' algorithm in your JWT library.",
                null
            ),

            // ============================================================
            // DANGEROUS API USAGE
            // ============================================================
            new ScanRule(
                "API-001",
                "Unsafe Deserialization — Java ObjectInputStream",
                "Java ObjectInputStream can execute arbitrary code when deserializing malicious data from untrusted sources.",
                FindingCategory.DANGEROUS_API,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("new\\s+ObjectInputStream\\s*\\("),
                "Avoid Java native deserialization. Use JSON/Protobuf with a schema. If unavoidable, use ValidatingObjectInputStream.",
                new String[]{".java"}
            ),

            new ScanRule(
                "API-002",
                "Reflection-Based Method Invocation with User Input",
                "Use of reflection to invoke methods with data that may be user-controlled can lead to arbitrary code execution.",
                FindingCategory.DANGEROUS_API,
                FindingSeverity.HIGH,
                "MEDIUM",
                Pattern.compile("Method\\.invoke\\s*\\(.*(?:request|req|param|input|getParameter)"),
                "Validate and allowlist any class/method names before using reflection. Prefer direct method calls.",
                new String[]{".java"}
            ),

            new ScanRule(
                "API-003",
                "eval() Usage Detected",
                "Use of eval() can allow arbitrary code execution when passed untrusted input.",
                FindingCategory.DANGEROUS_API,
                FindingSeverity.CRITICAL,
                "HIGH",
                Pattern.compile("\\beval\\s*\\("),
                "Eliminate eval() usage. Use JSON.parse() for JSON, or restructure logic to avoid dynamic evaluation.",
                new String[]{".js", ".ts"}
            ),

            // ============================================================
            // XSS
            // ============================================================
            new ScanRule(
                "XSS-001",
                "Cross-Site Scripting (XSS) — innerHTML Assignment",
                "Assigning to innerHTML with unescaped data can allow execution of attacker-supplied scripts.",
                FindingCategory.XSS,
                FindingSeverity.HIGH,
                "HIGH",
                Pattern.compile("\\.innerHTML\\s*=\\s*(?!\\s*[\"']<)"),
                "Use textContent for text data. Use a sanitization library (DOMPurify) if HTML rendering is required.",
                new String[]{".js", ".ts", ".jsx", ".tsx", ".html"}
            ),

            new ScanRule(
                "XSS-002",
                "React dangerouslySetInnerHTML Usage",
                "dangerouslySetInnerHTML bypasses React's XSS protections. May allow script injection if content is user-controlled.",
                FindingCategory.XSS,
                FindingSeverity.HIGH,
                "MEDIUM",
                Pattern.compile("dangerouslySetInnerHTML"),
                "Sanitize HTML with DOMPurify before rendering. Audit all usages to ensure content is server-controlled.",
                new String[]{".jsx", ".tsx", ".js", ".ts"}
            ),

            // ============================================================
            // MISCONFIGURATION
            // ============================================================
            new ScanRule(
                "CFG-001",
                "CORS Wildcard Origin Allowed",
                "CORS configured to allow all origins (*). In production, this permits any website to make cross-origin requests.",
                FindingCategory.MISCONFIGURATION,
                FindingSeverity.HIGH,
                "HIGH",
                Pattern.compile("(?i)(allowedOrigins|Access-Control-Allow-Origin|cors).*\\*"),
                "Restrict CORS to specific trusted origins. Never use '*' in production with allowCredentials.",
                null
            ),

            new ScanRule(
                "CFG-002",
                "Disabled SSL/TLS Verification",
                "SSL certificate verification is explicitly disabled, making the application vulnerable to MITM attacks.",
                FindingCategory.MISCONFIGURATION,
                FindingSeverity.HIGH,
                "HIGH",
                Pattern.compile("(?i)(verify\\s*=\\s*False|setSSLSocketFactory|trustAllCerts|hostnameVerifier.*ALLOW_ALL|NoopHostnameVerifier)"),
                "Never disable certificate verification. Fix the certificate issue at its root cause instead.",
                null
            ),

            new ScanRule(
                "CFG-003",
                "Spring Security CSRF Disabled",
                "CSRF protection is explicitly disabled. APIs should use token-based CSRF protection or same-origin enforcement.",
                FindingCategory.MISCONFIGURATION,
                FindingSeverity.MEDIUM,
                "HIGH",
                Pattern.compile("csrf\\(\\s*\\)\\s*\\.\\s*disable\\(\\)|csrf\\.disable\\(\\)"),
                "Enable CSRF protection for stateful web applications. For stateless REST APIs, ensure JWT-only authentication is enforced.",
                new String[]{".java"}
            )
        );
    }
}
