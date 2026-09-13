package com.aegisiq.backend.scanning.engine;

import com.aegisiq.backend.findings.domain.FindingCategory;
import com.aegisiq.backend.findings.domain.FindingSeverity;

import java.util.regex.Pattern;

/**
 * A single deterministic detection rule.
 * These are PURELY regex-based — no LLM involved in detection.
 *
 * Architecture Decision Record: ADR-003
 * "Deterministic security engines are authoritative.
 *  LLMs are for investigation/summarization only."
 */
public record ScanRule(
        String ruleId,
        String title,
        String description,
        FindingCategory category,
        FindingSeverity severity,
        String confidence,
        Pattern pattern,
        String remediation,
        String[] fileExtensions  // null = all files
) {}
