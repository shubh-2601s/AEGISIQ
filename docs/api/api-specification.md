# AegisIQ REST API Specification

## Base URL
All public REST API endpoints are versioned under the `/api/v1/` prefix:
```text
http://localhost:8080/api/v1
```

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
- **Description**: Registers a new user account.
- **Request Body**:
  ```json
  {
    "email": "analyst@aegisiq.io",
    "password": "SecurePassword123!",
    "name": "Jane Analyst",
    "organizationName": "Acme Security"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f73b88-5c4d-44a6-9ec2-6780c10b7f01",
      "email": "analyst@aegisiq.io",
      "name": "Jane Analyst",
      "role": "SECURITY_ANALYST"
    }
  }
  ```

### `POST /api/v1/auth/login`
- **Description**: Authenticates user and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "analyst@aegisiq.io",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`): Same authentication token envelope.

### `GET /api/v1/users/me`
- **Description**: Returns authenticated caller's profile.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Projects & Repositories Endpoints

### `GET /api/v1/projects`
- **Description**: Lists all projects for caller's organization.

### `POST /api/v1/projects`
- **Description**: Creates a new security project.

### `GET /api/v1/projects/{id}`
- **Description**: Retrieves single project by UUID.

### `POST /api/v1/projects/{id}/repositories`
- **Description**: Attaches a repository to a project.

---

## 3. Scans & Findings Endpoints

### `POST /api/v1/projects/{id}/scans`
- **Description**: Triggers a new security scan (multipart upload for ZIP archives).
- **Response** (`202 Accepted`):
  ```json
  {
    "scanId": "8f3b23d1-d254-46b0-bf88-12ce526f25ab",
    "status": "QUEUED",
    "startedAt": "2026-09-13T20:00:00Z"
  }
  ```

### `GET /api/v1/scans/{id}`
- **Description**: Retrieves status, files scanned count, and error summary for a scan.

### `GET /api/v1/findings`
- **Description**: Retrieves paginated findings with filters (`projectId`, `severity`, `status`, `category`).

### `GET /api/v1/findings/{id}`
- **Description**: Retrieves full finding details including line-level evidence and remediation guidance.

### `PATCH /api/v1/findings/{id}/status`
- **Description**: Updates finding status (`CONFIRMED`, `FALSE_POSITIVE`, `RESOLVED`, `ACCEPTED_RISK`).

---

## 4. Risk & Security Graph Endpoints

### `GET /api/v1/projects/{id}/risk`
- **Description**: Returns overall project risk posture and breakdown.

### `GET /api/v1/projects/{id}/graph`
- **Description**: Returns asset nodes and directed edges for attack-path visualization.

### `GET /api/v1/projects/{id}/attack-paths`
- **Description**: Returns calculated attack chains from Internet entry points to critical crown jewels.

---

## 5. AI Security Analyst Endpoints

### `POST /api/v1/ai/query`
- **Description**: Analyst natural-language query regarding project security posture or specific finding.
- **Request Body**:
  ```json
  {
    "projectId": "a3f5a91b-3ef1-4cf4-9c02-d922bb0b5402",
    "findingId": "d9817ea4-4f01-4475-a083-d588523ca081",
    "question": "Explain how an attacker can reach this SQL injection from the public internet."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "summary": "This finding in UserDao.java is exposed via the public /api/v1/login endpoint.",
    "facts": [
      "Finding ID: d9817ea4-4f01-4475-a083-d588523ca081",
      "Rule: AIG-SQL-001",
      "Asset: Production User Database"
    ],
    "inference": "Because the login controller lacks input sanitation, user credentials can be extracted.",
    "recommendations": [
      "Use Spring Data JPA parameterized queries in UserDao.java:42"
    ],
    "uncertainty": "Web Application Firewall (WAF) filtering was not evaluated."
  }
  ```

---

## 6. Remediation Endpoints

### `POST /api/v1/findings/{id}/remediate`
- **Description**: Generates an AI-assisted remediation patch proposal.

### `POST /api/v1/remediations/{id}/approve`
- **Description**: Human-in-the-loop analyst approval to accept remediation proposal.

---

## 7. Standard Error Response Envelope

All API errors return consistent, sanitized JSON DTOs:
```json
{
  "timestamp": "2026-09-13T20:15:00.123Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request parameters provided.",
  "path": "/api/v1/auth/register",
  "requestId": "req-98f7e21a"
}
```
No internal stack traces or database schema internals are ever exposed.
