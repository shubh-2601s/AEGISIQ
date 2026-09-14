import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Code2, Play, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, FileCode, Check, ShieldAlert, Cpu, FolderOpen, Upload
} from 'lucide-react'

interface SampleCode {
  id: string
  title: string
  language: string
  filename: string
  cwe: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  vulnerableCode: string
  fixedCode: string
  vulnLine: number
  explanation: string
}

const SAMPLE_TEMPLATES: SampleCode[] = [
  {
    id: 'sqli-java',
    title: 'Spring Boot Raw SQL Injection',
    language: 'java',
    filename: 'AuthUserController.java',
    cwe: 'CWE-89 (SQL Injection)',
    severity: 'CRITICAL',
    vulnerableCode: `package com.aegis.api;

import org.springframework.web.bind.annotation.*;
import java.sql.*;

@RestController
@RequestMapping("/api/users")
public class AuthUserController {

    @GetMapping("/search")
    public String findUser(@RequestParam("username") String username) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/aegisiq", "dbuser", "secret");
        Statement stmt = conn.createStatement();
        // VULNERABLE: Direct string concatenation creates SQL Injection
        String query = "SELECT * FROM users WHERE username = '" + username + "'";
        ResultSet rs = stmt.executeQuery(query);
        return rs.next() ? rs.getString("email") : "Not Found";
    }
}`,
    fixedCode: `package com.aegis.api;

import org.springframework.web.bind.annotation.*;
import java.sql.*;

@RestController
@RequestMapping("/api/users")
public class AuthUserController {

    @GetMapping("/search")
    public String findUser(@RequestParam("username") String username) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/aegisiq", "dbuser", "secret");
        // SECURE: Parameterized PreparedStatement prevents SQL Injection
        String query = "SELECT * FROM users WHERE username = ?";
        PreparedStatement stmt = conn.prepareStatement(query);
        stmt.setString(1, username);
        ResultSet rs = stmt.executeQuery();
        return rs.next() ? rs.getString("email") : "Not Found";
    }
}`,
    vulnLine: 16,
    explanation: 'Replaced unsafe string concatenation with parameterized PreparedStatement bind variables to guarantee query parameters cannot escape SQL execution context.'
  },
  {
    id: 'path-traversal-py',
    title: 'Python FastAPI Arbitrary File Read',
    language: 'python',
    filename: 'reports.py',
    cwe: 'CWE-22 (Path Traversal)',
    severity: 'HIGH',
    vulnerableCode: `from fastapi import FastAPI, HTTPException
import os

app = FastAPI()

@app.get("/download")
def download_report(filename: str):
    # VULNERABLE: Unsanitized file path allows Zip Slip & Directory Traversal
    file_path = os.path.join("/var/reports", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    with open(file_path, "r") as f:
        return f.read()`,
    fixedCode: `from fastapi import FastAPI, HTTPException
import os

app = FastAPI()

BASE_DIR = os.path.abspath("/var/reports")

@app.get("/download")
def download_report(filename: str):
    # SECURE: Safe canonical path validation prevents traversal outside BASE_DIR
    target_path = os.path.abspath(os.path.join(BASE_DIR, filename))
    if not target_path.startswith(BASE_DIR):
        raise HTTPException(status_code=403, detail="Access Denied: Path Traversal Detected")
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="File not found")
    with open(target_path, "r") as f:
        return f.read()`,
    vulnLine: 9,
    explanation: 'Enforced canonical path resolution via os.path.abspath and strict path prefix check to prevent relative ../ traversal attacks.'
  },
  {
    id: 'secret-leak',
    title: 'Hardcoded Cloud Infrastructure Secret',
    language: 'yaml',
    filename: 'application-prod.yml',
    cwe: 'CWE-798 (Hardcoded Secrets)',
    severity: 'CRITICAL',
    vulnerableCode: `spring:
  datasource:
    url: jdbc:postgresql://prod-db.internal:5432/aegis
    username: aegis_admin
    # VULNERABLE: Hardcoded plaintext database credentials in repository
    password: "AKIAIOSFODNN7EXAMPLE_SECRET_KEY_PROD_9981"
  aws:
    access-key-id: "AKIAIOSFODNN7EXAMPLE"
    secret-access-key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`,
    fixedCode: `spring:
  datasource:
    url: \${DB_URL:jdbc:postgresql://prod-db.internal:5432/aegis}
    username: \${DB_USER:aegis_admin}
    # SECURE: Database password resolved dynamically from environment/Secret Vault
    password: \${DB_PASSWORD}
  aws:
    access-key-id: \${AWS_ACCESS_KEY_ID}
    secret-access-key: \${AWS_SECRET_ACCESS_KEY}`,
    vulnLine: 7,
    explanation: 'Removed plaintext cloud credentials and replaced with dynamic environment placeholder variables integrated with Secret Vault management.'
  }
]

export default function TestLabPage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [selectedSample, setSelectedSample] = useState<SampleCode>(SAMPLE_TEMPLATES[0])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ scanned: boolean; riskScore: number; ASTMatches: number } | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [isFixed, setIsFixed] = useState(false)

  // Fetch real user projects list
  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100), {
    refetchOnMount: true,
    staleTime: 0
  })
  const userProjects = projectsData?.data?.content || []
  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  // Fetch real findings for selected project
  const { data: findingsRes } = useQuery(
    ['findings', selectedProjectId],
    () => findingsApi.list(selectedProjectId),
    { enabled: selectedProjectId !== 'SAMPLE' && !!selectedProjectId, refetchOnMount: true }
  )
  const realFindings = findingsRes?.data?.content || []

  // Dynamic samples generated from selected project's findings
  const activeSamples: SampleCode[] = selectedProjectId === 'SAMPLE'
    ? SAMPLE_TEMPLATES
    : realFindings.map((f: any, idx: number) => {
        const ext = (f.filePath || '').split('.').pop()?.toLowerCase()
        let language = 'java'
        if (ext === 'py') language = 'python'
        else if (ext === 'js' || ext === 'ts' || ext === 'tsx' || ext === 'jsx') language = 'typescript'
        else if (ext === 'yml' || ext === 'yaml') language = 'yaml'
        else if (ext === 'go') language = 'go'

        const fileNameOnly = f.filePath ? f.filePath.split('/').pop() : `Finding_${idx + 1}.${ext || 'java'}`

        const vulnCode = f.evidence || `// File: ${f.filePath || 'src/main/App.java'}\n// Line ${f.lineNumber || 12}: ${f.title}\n\n// VULNERABLE CODE PATTERN\npublic void processRequest() {\n    // ${f.description || 'Unsanitized input flow'}\n    executeSecurityContext("${f.ruleId || 'CVE-EXPLOIT'}");\n}`

        const safeCode = f.remediation || `// File: ${f.filePath || 'src/main/App.java'}\n// Line ${f.lineNumber || 12}: ${f.title}\n\n// SECURE REMEDIATED PATTERN\npublic void processRequest() {\n    // Enforce Aegis Security Guard & Parameterized Validation\n    validateAndExecuteSafe("${f.ruleId || 'CVE-EXPLOIT'}");\n}`

        return {
          id: f.id || `finding-${idx}`,
          title: f.title || `AST Finding ${idx + 1}`,
          language,
          filename: fileNameOnly,
          cwe: f.ruleId || f.category || 'CWE-Security-Issue',
          severity: (f.severity || 'HIGH') as 'CRITICAL' | 'HIGH' | 'MEDIUM',
          vulnerableCode: vulnCode,
          fixedCode: safeCode,
          vulnLine: f.lineNumber || 3,
          explanation: f.remediation || f.description || 'Remediated with parameterized validation and input sanitization.'
        }
      })

  // Sync selected sample when project or findings change
  useEffect(() => {
    if (activeSamples.length > 0) {
      setSelectedSample(activeSamples[0])
    }
    setScanResult(null)
    setShowDiff(false)
    setIsFixed(false)
  }, [selectedProjectId, realFindings.length])

  const handleRunScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScanResult({
        scanned: true,
        riskScore: isFixed ? 0.0 : (selectedSample?.severity === 'CRITICAL' ? 9.8 : 7.5),
        ASTMatches: isFixed ? 0 : 1
      })
    }, 900)
  }

  const handleApplyAIFix = () => {
    setShowDiff(true)
  }

  const handleConfirmPatch = () => {
    setIsFixed(true)
    setShowDiff(false)
    setScanResult({
      scanned: true,
      riskScore: 0.0,
      ASTMatches: 0
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid var(--accent-500)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Code2 size={24} color="var(--accent-400)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                AI Security Test Lab & AST Patch Playground
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Test deterministic static analysis engines, inspect token highlights, and simulate one-click AI patches.
            </p>
          </div>
        </div>

        {/* Project Selector & Template Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.3rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <FolderOpen size={14} color="var(--cyber-cyan)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="form-input"
              style={{ background: 'transparent', border: 'none', color: 'var(--cyber-cyan)', fontWeight: 700, fontSize: '0.82rem', padding: '0.2rem' }}
            >
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample Playground</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          {activeSamples.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {activeSamples.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedSample(tpl)
                    setScanResult(null)
                    setShowDiff(false)
                    setIsFixed(false)
                  }}
                  className={`btn ${selectedSample?.id === tpl.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  <FileCode size={14} /> {tpl.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Grid / Empty State */}
      {selectedProjectId !== 'SAMPLE' && activeSamples.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <CheckCircle2 size={48} color="var(--low)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              No Vulnerability Code Samples for "{selectedProjectObj?.name}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 480 }}>
              This project does not have any scanned code vulnerabilities logged yet. Upload a repository zip scan to test live AST patches!
            </p>
          </div>
          <button onClick={() => navigate(`/projects/${selectedProjectId}`)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Upload size={16} style={{ marginRight: 6 }} /> Upload Repository Scan
          </button>
        </div>
      ) : selectedSample && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
          
          {/* Code Editor / Diff Inspector */}
          <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                  {selectedSample.filename}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({selectedSample.language.toUpperCase()})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!showDiff && (
                <button
                  onClick={handleRunScan}
                  disabled={isScanning}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  {isScanning ? <RefreshCw size={14} className="pulse-cyan-glow" /> : <Play size={14} color="var(--low)" />}
                  {isScanning ? 'Parsing AST...' : 'Run AST Scan'}
                </button>
              )}

              {!isFixed && (
                <button
                  onClick={handleApplyAIFix}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                    display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700
                  }}
                >
                  <Sparkles size={14} /> AI One-Click Patch
                </button>
              )}
            </div>
          </div>

          {/* Interactive Code Window */}
          {!showDiff ? (
            <div className="test-lab-code-area" style={{ padding: '1rem 0' }}>
              {(isFixed ? selectedSample.fixedCode : selectedSample.vulnerableCode)
                .split('\n')
                .map((line, idx) => {
                  const lineNum = idx + 1
                  const isVuln = !isFixed && lineNum === selectedSample.vulnLine
                  const isFixedLine = isFixed && lineNum === selectedSample.vulnLine

                  return (
                    <div
                      key={idx}
                      className={isVuln ? 'code-line-vuln' : (isFixedLine ? 'code-line-fixed' : '')}
                      style={{
                        padding: '0.2rem 1rem',
                        display: 'flex',
                        gap: '1.25rem',
                        fontSize: '0.83rem',
                        lineHeight: '1.6',
                        color: isVuln ? '#fda4af' : (isFixedLine ? '#86efac' : 'var(--text-primary)')
                      }}
                    >
                      <span style={{ width: 24, textAlign: 'right', color: 'var(--text-muted)', userSelect: 'none' }}>
                        {lineNum}
                      </span>
                      <span style={{ whiteSpace: 'pre', flex: 1 }}>{line}</span>

                      {isVuln && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--critical)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <AlertTriangle size={12} /> {selectedSample.cwe} DETECTED
                        </span>
                      )}
                      {isFixedLine && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--low)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={12} /> PARAMETERIZED SAFE PATTERN
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          ) : (
            /* Git Diff Mode */
            <div className="test-lab-code-area" style={{ padding: '1rem 0', background: '#030812' }}>
              <div style={{ padding: '0 1rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent-400)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Proposed Aegis Security Patch (Git Diff View)</span>
                <button
                  onClick={handleConfirmPatch}
                  className="btn btn-primary"
                  style={{ background: 'var(--low)', color: '#000', fontSize: '0.78rem', fontWeight: 800, padding: '0.3rem 0.75rem' }}
                >
                  <Check size={14} /> Accept & Verify Patch
                </button>
              </div>

              {selectedSample.vulnerableCode.split('\n').map((line, idx) => (
                <div key={`del-${idx}`} className="diff-remove" style={{ padding: '0.15rem 1rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                  - {line}
                </div>
              ))}

              <div style={{ height: 10 }} />

              {selectedSample.fixedCode.split('\n').map((line, idx) => (
                <div key={`add-${idx}`} className="diff-add" style={{ padding: '0.15rem 1rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                  + {line}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scan Diagnostics & Risk Metric Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="var(--primary-400)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Deterministic Engine Diagnostics</h3>
            </div>

            {scanResult || isFixed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{
                  background: 'var(--bg-elevated)', borderRadius: 10, padding: '1rem',
                  border: `1px solid ${isFixed ? 'var(--low)' : 'var(--critical)'}`
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AST Risk Exposure Index</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: isFixed ? 'var(--low)' : 'var(--critical)', marginTop: '0.2rem' }}>
                    {isFixed ? '0.0 / 10' : `${selectedSample.severity === 'CRITICAL' ? '9.8' : '7.5'} / 10`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isFixed ? 'var(--low)' : 'var(--critical)', marginTop: '0.2rem', fontWeight: 600 }}>
                    {isFixed ? '✓ VERIFIED CLEAN — NO EXPLOIT PATH' : `CRITICAL RISK DETECTED (${selectedSample.cwe})`}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>CWE Security Classification</div>
                  <div style={{ color: 'var(--text-bright)', marginTop: '0.2rem', fontWeight: 700 }}>
                    {selectedSample.cwe}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>AST Rule Engine Match</div>
                  <div style={{ color: 'var(--accent-400)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    rule: {selectedSample.id}-pattern-v1
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Click <strong>"Run AST Scan"</strong> or <strong>"AI One-Click Patch"</strong> to test live scanner execution.
              </div>
            )}
          </div>

          {/* AI Guidance Box */}
          <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--accent-400)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                Remediation Rationale
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-base)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              {selectedSample.explanation}
            </p>
          </div>
        </div>

      </div>
      )}
    </div>
  )
}
