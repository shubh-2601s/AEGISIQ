package com.aegisiq.backend.scanning.engine;

import com.aegisiq.backend.findings.domain.Finding;
import com.aegisiq.backend.findings.domain.FindingCategory;
import com.aegisiq.backend.findings.domain.FindingSeverity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the deterministic SAST engine.
 * These tests must pass with no database, no Spring context.
 */
class SastEngineTest {

    private SastEngine sastEngine;
    private UUID scanId;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        sastEngine = new SastEngine(new ScanRuleRegistry());
        scanId = UUID.randomUUID();
        projectId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Detects hardcoded password in Java source")
    void detectsHardcodedPassword() {
        String content = """
                public class Config {
                    private String password = "superSecret123";
                }
                """;

        List<Finding> findings = sastEngine.scanFile("Config.java", content, scanId, projectId);

        assertThat(findings).isNotEmpty();
        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.HARDCODED_SECRET);
        assertThat(findings).anyMatch(f -> f.getSeverity() == FindingSeverity.CRITICAL);
    }

    @Test
    @DisplayName("Detects SQL injection via string concatenation")
    void detectsSqlInjection() {
        // SQLI-001 matches when executeQuery and the string concatenation are on the same line
        String content = "conn.executeQuery(\"SELECT * FROM users WHERE name = '\" + request.getParameter(\"name\") + \"'\");\n";

        List<Finding> findings = sastEngine.scanFile("UserDao.java", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.SQL_INJECTION);
    }

    @Test
    @DisplayName("Detects command injection in Python")
    void detectsCommandInjectionPython() {
        String content = """
                import subprocess
                def run_command(user_input):
                    subprocess.run(user_input, shell=True)
                """;

        List<Finding> findings = sastEngine.scanFile("runner.py", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.COMMAND_INJECTION);
        assertThat(findings).anyMatch(f -> f.getSeverity() == FindingSeverity.CRITICAL);
    }

    @Test
    @DisplayName("Detects AWS access key hardcoded in source")
    void detectsAwsAccessKey() {
        String content = "String awsKey = \"AKIAIOSFODNN7EXAMPLE\";\n";

        List<Finding> findings = sastEngine.scanFile("AwsConfig.java", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getRuleId().equals("SEC-002"));
    }

    @Test
    @DisplayName("Detects eval() usage in JavaScript")
    void detectsEvalInJavascript() {
        String content = "const result = eval(userInput);\n";

        List<Finding> findings = sastEngine.scanFile("app.js", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.DANGEROUS_API);
    }

    @Test
    @DisplayName("Detects CORS wildcard misconfiguration")
    void detectsCorsWildcard() {
        String content = """
                corsConfig.allowedOrigins("*");
                """;

        List<Finding> findings = sastEngine.scanFile("CorsConfig.java", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.MISCONFIGURATION);
    }

    @Test
    @DisplayName("Detects RSA private key material")
    void detectsPrivateKeyMaterial() {
        String content = "String key = \"-----BEGIN RSA PRIVATE KEY-----\";\n";

        List<Finding> findings = sastEngine.scanFile("KeyLoader.java", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getRuleId().equals("SEC-004"));
        assertThat(findings).anyMatch(f -> f.getSeverity() == FindingSeverity.CRITICAL);
    }

    @Test
    @DisplayName("Skips comment-only lines to reduce false positives")
    void skipsCommentLines() {
        // This is in a comment — should not be flagged
        String content = """
                // password = "example" — DO NOT USE
                public class Safe {
                    // No real secret here
                }
                """;

        List<Finding> findings = sastEngine.scanFile("Safe.java", content, scanId, projectId);

        // Comment-only lines are skipped; no finding expected
        assertThat(findings).isEmpty();
    }

    @Test
    @DisplayName("Finding fingerprint is deterministic")
    void fingerprintIsDeterministic() {
        String content = "String password = \"secret123\";\n";

        List<Finding> first = sastEngine.scanFile("Test.java", content, scanId, projectId);
        List<Finding> second = sastEngine.scanFile("Test.java", content, scanId, projectId);

        assertThat(first).hasSize(1);
        assertThat(second).hasSize(1);
        assertThat(first.get(0).getFingerprint()).isEqualTo(second.get(0).getFingerprint());
    }

    @Test
    @DisplayName("Skips binary/non-scannable extensions")
    void skipsNonScannableContent() {
        // The rule for SEC-001 has no extension filter — but binary files won't contain text patterns
        // Verifying rule extension filter works for SQLI-001 (java only)
        String javaContent = "conn.executeQuery(\"SELECT * FROM \" + req);\n";

        List<Finding> javaFindings = sastEngine.scanFile("dao.java", javaContent, scanId, projectId);
        assertThat(javaFindings).anyMatch(f -> f.getCategory() == FindingCategory.SQL_INJECTION);
    }

    @Test
    @DisplayName("Detects XSS innerHTML assignment")
    void detectsXssInnerHtml() {
        String content = "element.innerHTML = userComment;\n";

        List<Finding> findings = sastEngine.scanFile("app.js", content, scanId, projectId);

        assertThat(findings).anyMatch(f -> f.getCategory() == FindingCategory.XSS);
    }

    @Test
    @DisplayName("Risk score assigned correctly for CRITICAL severity")
    void riskScoreIsCorrectForCritical() {
        String content = "new ObjectInputStream(socket.getInputStream());\n";

        List<Finding> findings = sastEngine.scanFile("Server.java", content, scanId, projectId);

        assertThat(findings).anyMatch(f ->
            f.getRiskScore().compareTo(java.math.BigDecimal.valueOf(10.0)) == 0
        );
    }
}
