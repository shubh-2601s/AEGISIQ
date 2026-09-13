# AegisIQ AI Security Analyst Service

## Overview
A Python 3.12 FastAPI microservice that provides grounded contextual investigation, vulnerability explanation, attack-path summaries, and remediation proposals.

## Architectural Tenets
- **Grounded Context**: Operates strictly on structured JSON payloads received from the Java backend.
- **Prompt-Injection Defense**: Untrusted code evidence is demarcated using strict CDATA XML tags and labeled as non-executable data.
- **Separation of Concerns**: Output schemas strictly distinguish Facts, Inferences, Recommendations, and Uncertainty.
- **Zero Write Authority**: Possesses no direct database write access or autonomous command execution privileges.

## Running Locally
```bash
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

## Running Evaluation Suite
```bash
pytest tests/ -v
```
