# AegisIQ Docker Strategy & Deployment Architecture

## 1. Container Architecture Overview

AegisIQ provides full Docker Compose orchestration for local development and production-like deployment:

```
┌─────────────────────────────────────────────────────────────┐
│                   Docker Compose Network                    │
│                                                             │
│   ┌───────────────┐                  ┌──────────────────┐   │
│   │   frontend    │ ──── HTTP ─────▶ │     backend      │   │
│   │ (Port 5173)   │                  │   (Port 8080)    │   │
│   └───────────────┘                  └─────────┬────────┘   │
│                                                │            │
│                       ┌────────────────────────┼────────┐   │
│                       │ JDBC                   │ HTTP   │   │
│                       ▼                        ▼        │   │
│               ┌───────────────┐      ┌──────────────────┐   │
│               │   postgres    │      │    ai-service    │   │
│               │ (Port 5432)   │      │   (Port 8000)    │   │
│               └───────────────┘      └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Service Definitions

### 2.1. PostgreSQL Service (`postgres`)
- **Image**: `postgres:16-alpine`
- **Volume**: `postgres_data:/var/lib/postgresql/data` (persistent state)
- **Healthcheck**: Evaluates `pg_isready -U aegisiq_user -d aegisiq` every 5 seconds.
- **Port**: Exposed to host on 5432 for development access.

### 2.2. Backend Service (`backend`)
- **Base Image**: Multi-stage build using `maven:3.9-eclipse-temurin-21` (build stage) and `eclipse-temurin:21-jre-alpine` (runtime stage).
- **Security Hardening**:
  - Executes as unprivileged user (`appuser`, UID 10001).
  - Read-only root filesystem with dedicated temporary scratch volume.
- **Dependencies**: Depends on `postgres` healthy condition.

### 2.3. AI Service (`ai-service`)
- **Base Image**: Multi-stage build using `python:3.12-slim`.
- **Security Hardening**:
  - Non-root user execution (`aiuser`, UID 10002).
  - No access to host Docker socket or file mounts.
- **Port**: 8000 (accessible internally by backend).

### 2.4. Frontend Service (`frontend`)
- **Base Image**: Multi-stage build using `node:22-alpine` (build stage) and `nginx:1.27-alpine` (runtime stage).
- **Configuration**: Nginx reverse proxy routing `/api/v1/` to backend and serving pre-built SPA bundle with security headers (CSP, X-Frame-Options, HSTS).
- **Port**: 5173.

---

## 3. Best Practices & Production Hygiene

1. **Zero Secret Hardcoding**: Secrets and tokens (`JWT_SECRET`, database passwords, API keys) are sourced strictly through `.env` and environment variables.
2. **Deterministic Multi-Stage Builds**: Build tooling (compilers, npm, pip) is stripped from final production container images to minimize attack surface and image size.
3. **Healthchecks & Graceful Shutdown**: Every service implements health endpoints enabling Docker orchestrators to route traffic only to ready containers.