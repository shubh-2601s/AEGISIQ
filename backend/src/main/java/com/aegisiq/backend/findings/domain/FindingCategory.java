package com.aegisiq.backend.findings.domain;

public enum FindingCategory {
    SQL_INJECTION,
    XSS,
    COMMAND_INJECTION,
    PATH_TRAVERSAL,
    HARDCODED_SECRET,
    INSECURE_AUTH,
    DANGEROUS_API,
    DEPENDENCY_VULNERABILITY,
    MISCONFIGURATION
}
