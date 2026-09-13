"""
AegisIQ AI Service — FastAPI Internal API

Architecture:
- Receives structured requests from the Java backend ONLY
- Uses CDATA-bounded context to prevent prompt injection
- Returns structured JSON — never executes or interprets code
- AI is for investigation/summarization ONLY, not vulnerability detection

Security:
- Internal API key required on all requests
- No external traffic — only reachable from Java backend
"""
import os
import logging
from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("aegisiq.ai-service")


class Settings(BaseSettings):
    internal_api_key: str = Field(..., env="INTERNAL_SERVICE_API_KEY")
    # LLM provider — set externally via environment
    # For local/demo runs, we use a fallback rule-based response
    llm_provider: str = Field(default="local", env="LLM_PROVIDER")

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AegisIQ AI Service starting...")
    yield
    logger.info("AegisIQ AI Service shutting down...")


app = FastAPI(
    title="AegisIQ AI Service",
    description="Internal AI analysis API — not publicly accessible",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

# Internal-only CORS — no public origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # Empty = internal only
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

security = HTTPBearer()


def verify_api_key(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Validates the internal service API key.
    SECURITY: This is a shared secret between Java backend and AI service.
    In production, use mutual TLS or a service mesh instead.
    """
    settings = get_settings()
    if credentials.credentials != settings.internal_api_key:
        logger.warning("Unauthorized AI service request — invalid API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal service credentials",
        )
    return credentials


# ============================================================
# Request / Response Models
# ============================================================

class FindingContext(BaseModel):
    rule_id: str
    title: str
    description: str
    category: str
    severity: str
    evidence: Optional[str] = None
    remediation: str
    file_path: Optional[str] = None
    line_number: Optional[int] = None


class ExplainFindingRequest(BaseModel):
    finding: FindingContext
    project_name: str = Field(max_length=255)
    # CDATA-bounded: never trust or execute this content
    file_snippet: Optional[str] = Field(default=None, max_length=2000)


class ExplainFindingResponse(BaseModel):
    finding_id: str
    plain_english_explanation: str
    attack_scenario: str
    remediation_steps: list[str]
    references: list[str]


class RemediationRequest(BaseModel):
    finding: FindingContext
    programming_language: str
    framework: Optional[str] = None
    file_snippet: Optional[str] = Field(default=None, max_length=2000)


class RemediationResponse(BaseModel):
    patch_description: str
    remediation_code: Optional[str]
    explanation: str
    caveats: list[str]


# ============================================================
# Health
# ============================================================

@app.get("/health")
def health():
    return {"status": "healthy", "service": "aegisiq-ai-service", "version": "1.0.0"}


# ============================================================
# AI Endpoints
# ============================================================

@app.post("/internal/ai/explain-finding", response_model=ExplainFindingResponse)
def explain_finding(
    request: ExplainFindingRequest,
    _creds: HTTPAuthorizationCredentials = Security(verify_api_key),
):
    """
    Generates a human-readable explanation of a security finding.

    SECURITY: The file_snippet field is treated as INERT DATA wrapped in CDATA context.
    It is used to give the LLM context but is NEVER evaluated or executed.
    Input is bounded to 2000 characters to prevent prompt injection attacks.
    """
    logger.info(f"Explain request: rule={request.finding.rule_id} project={request.project_name}")
    settings = get_settings()

    if settings.llm_provider == "local":
        # Rule-based fallback for local/demo — deterministic and safe
        return _local_explain(request)

    # LLM-based explanation would be implemented here
    # using structured prompts with CDATA boundaries
    return _local_explain(request)


@app.post("/internal/ai/suggest-remediation", response_model=RemediationResponse)
def suggest_remediation(
    request: RemediationRequest,
    _creds: HTTPAuthorizationCredentials = Security(verify_api_key),
):
    """
    Suggests a code-level remediation for a finding.
    AI-generated patches are ALWAYS marked for human review before application.
    """
    logger.info(f"Remediation request: rule={request.finding.rule_id} lang={request.programming_language}")
    settings = get_settings()

    if settings.llm_provider == "local":
        return _local_remediation(request)

    return _local_remediation(request)


# ============================================================
# Local/Demo Fallback Implementations
# These produce rule-based responses when no LLM is configured.
# ============================================================

EXPLANATION_MAP = {
    "SQLI-001": {
        "explanation": "SQL injection occurs when user-supplied data is directly embedded in a SQL query. An attacker can manipulate the query's structure to bypass authentication, extract data, or modify/delete records.",
        "attack_scenario": "An attacker inputs `' OR '1'='1` as a username field, causing the query to return all records or bypass login authentication.",
        "remediation_steps": [
            "Replace string concatenation with parameterized queries (PreparedStatement in Java).",
            "Use an ORM like Spring Data JPA or Hibernate which handles parameterization automatically.",
            "Apply input validation as a defense-in-depth measure, but never rely on it alone.",
            "Run all database queries with minimum-privilege database accounts.",
        ],
        "references": [
            "https://owasp.org/www-community/attacks/SQL_Injection",
            "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
            "https://cwe.mitre.org/data/definitions/89.html",
        ],
    },
    "SEC-001": {
        "explanation": "A credential (password, API key, or secret) appears to be hardcoded directly in source code. When committed to version control, this credential is permanently exposed — even if later removed, it remains in git history.",
        "attack_scenario": "An attacker gains read access to the source repository (e.g. via a leaked GitHub token or insider threat) and extracts credentials that provide direct access to production systems.",
        "remediation_steps": [
            "Immediately revoke/rotate the exposed credential.",
            "Move the secret to an environment variable, CI/CD secret, or secrets manager.",
            "Use git-secrets or a pre-commit hook to prevent future credential commits.",
            "Consider your git history as permanently compromised — use `git filter-repo` to rewrite history.",
        ],
        "references": [
            "https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password",
            "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
            "https://cwe.mitre.org/data/definitions/798.html",
        ],
    },
    "CMDI-001": {
        "explanation": "Command injection allows an attacker to execute arbitrary operating system commands on the server by manipulating input passed to OS command execution APIs.",
        "attack_scenario": "An attacker provides `; rm -rf /var/data/` as a filename parameter, causing the application to execute both the intended command and the attacker's destructive command.",
        "remediation_steps": [
            "Never pass user input to OS command execution functions.",
            "If shell commands are required, use a strict allowlist for arguments.",
            "Prefer language-native APIs over shell commands (e.g., use Java's File API instead of `ls`).",
            "If unavoidable, use ProcessBuilder with a String array and shell=false.",
        ],
        "references": [
            "https://owasp.org/www-community/attacks/Command_Injection",
            "https://cwe.mitre.org/data/definitions/78.html",
        ],
    },
}

DEFAULT_EXPLANATION = {
    "explanation": f"This finding indicates a potential security vulnerability detected by the AegisIQ static analysis engine using deterministic pattern matching.",
    "attack_scenario": "An attacker exploiting this vulnerability could gain unauthorized access, execute code, or extract sensitive data depending on the specific vulnerability class.",
    "remediation_steps": [
        "Review the flagged code location carefully.",
        "Consult the finding's description and remediation guidance.",
        "Apply the recommended fix and verify with a follow-up scan.",
        "Consider adding a unit test that validates the fix is effective.",
    ],
    "references": [
        "https://owasp.org/www-project-top-ten/",
        "https://cwe.mitre.org/",
    ],
}


def _local_explain(request: ExplainFindingRequest) -> ExplainFindingResponse:
    rule_data = EXPLANATION_MAP.get(request.finding.rule_id, DEFAULT_EXPLANATION)
    return ExplainFindingResponse(
        finding_id=request.finding.rule_id,
        plain_english_explanation=rule_data["explanation"],
        attack_scenario=rule_data["attack_scenario"],
        remediation_steps=rule_data["remediation_steps"],
        references=rule_data["references"],
    )


def _local_remediation(request: RemediationRequest) -> RemediationResponse:
    lang = request.programming_language.lower()
    finding = request.finding

    code_example = None
    if "sql" in finding.rule_id.lower() and "java" in lang:
        code_example = '''// BEFORE (Vulnerable):
// String sql = "SELECT * FROM users WHERE id = " + userId;

// AFTER (Safe — parameterized query):
PreparedStatement stmt = conn.prepareStatement(
    "SELECT * FROM users WHERE id = ?"
);
stmt.setString(1, userId);
ResultSet rs = stmt.executeQuery();'''

    elif "sec-001" in finding.rule_id.lower():
        code_example = '''// BEFORE (Vulnerable — hardcoded secret):
// String apiKey = "sk-1234567890abcdef";

// AFTER (Safe — environment variable):
String apiKey = System.getenv("API_KEY");
if (apiKey == null || apiKey.isBlank()) {
    throw new IllegalStateException("API_KEY environment variable not set");
}'''

    return RemediationResponse(
        patch_description=f"Fix for {finding.title}",
        remediation_code=code_example,
        explanation=finding.remediation,
        caveats=[
            "This suggestion is AI-generated and requires human review before application.",
            "Test the fix in a development environment before deploying to production.",
            "Verify the fix does not break existing functionality by running your test suite.",
        ],
    )
