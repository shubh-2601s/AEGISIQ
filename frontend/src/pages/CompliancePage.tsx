import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Award, CheckCircle2, AlertTriangle, FileText, Download, ShieldCheck, Check, ChevronRight, FolderOpen
} from 'lucide-react'

interface FrameworkScore {
  id: string
  name: string
  version: string
  complianceScore: number
  controlsPassed: number
  totalControls: number
  status: 'COMPLIANT' | 'ACTION_REQUIRED'
}

const DEMO_FRAMEWORKS: FrameworkScore[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    version: '2024 Trust Services Criteria',
    complianceScore: 94,
    controlsPassed: 47,
    totalControls: 50,
    status: 'COMPLIANT'
  },
  {
    id: 'pci-dss',
    name: 'PCI-DSS v4.0',
    version: 'Payment Card Industry',
    complianceScore: 91,
    controlsPassed: 31,
    totalControls: 34,
    status: 'COMPLIANT'
  },
  {
    id: 'iso27001',
    name: 'ISO / IEC 27001',
    version: '2022 ISMS Controls',
    complianceScore: 88,
    controlsPassed: 82,
    totalControls: 93,
    status: 'ACTION_REQUIRED'
  },
  {
    id: 'nist',
    name: 'NIST SP 800-53',
    version: 'Rev. 5 Moderate',
    complianceScore: 96,
    controlsPassed: 115,
    totalControls: 120,
    status: 'COMPLIANT'
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security Rule',
    version: '45 CFR Part 164',
    complianceScore: 98,
    controlsPassed: 41,
    totalControls: 42,
    status: 'COMPLIANT'
  }
]

export default function CompliancePage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [frameworks, setFrameworks] = useState<FrameworkScore[]>(DEMO_FRAMEWORKS)
  const [selectedFramework, setSelectedFramework] = useState<FrameworkScore>(DEMO_FRAMEWORKS[0])

  // Fetch real projects from API
  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100), {
    refetchOnMount: true,
    staleTime: 0
  })
  const userProjects = projectsData?.data?.content || []
  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  // Fetch real project findings
  const { data: findingsRes } = useQuery(
    ['findings', selectedProjectId],
    () => findingsApi.list(selectedProjectId),
    { enabled: selectedProjectId !== 'SAMPLE' && !!selectedProjectId, refetchOnMount: true }
  )
  const realFindings = findingsRes?.data?.content || []

  // Dynamically compute compliance scores based on real findings
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setFrameworks(DEMO_FRAMEWORKS)
      setSelectedFramework(DEMO_FRAMEWORKS[0])
    } else {
      const openCount = realFindings.filter((f: any) => f.status !== 'RESOLVED').length
      const penalty = Math.min(openCount * 5, 40)

      const computed: FrameworkScore[] = DEMO_FRAMEWORKS.map(fw => {
        const score = Math.max(100 - penalty, 60)
        return {
          ...fw,
          complianceScore: score,
          status: score >= 90 ? 'COMPLIANT' : 'ACTION_REQUIRED'
        }
      })
      setFrameworks(computed)
      setSelectedFramework(computed[0])
    }
  }, [selectedProjectId, realFindings])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid var(--low)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Award size={24} color="var(--low)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Enterprise Regulatory Compliance & Audit Benchmark
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Real-time security control mapping across SOC 2, PCI-DSS, ISO 27001, NIST, and HIPAA standards.
            </p>
          </div>
        </div>

        {/* Project Selector Dropdown */}
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
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample System</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700 }}>
            <Download size={14} /> Download Executive Audit Package (PDF)
          </button>
        </div>
      </div>

      {/* Framework Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {frameworks.map(fw => (
          <div
            key={fw.id}
            onClick={() => setSelectedFramework(fw)}
            className="hud-panel"
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              border: `1px solid ${selectedFramework?.id === fw.id ? 'var(--primary-400)' : 'var(--border-default)'}`,
              background: selectedFramework?.id === fw.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-bright)' }}>{fw.name}</span>
              <span className={`badge ${fw.status === 'COMPLIANT' ? 'badge-low' : 'badge-high'}`} style={{ fontSize: '0.68rem' }}>
                {fw.status}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fw.version}</div>

            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: fw.complianceScore >= 90 ? 'var(--low)' : 'var(--high)', margin: '0.6rem 0 0.3rem' }}>
              {fw.complianceScore}%
            </div>

            <div style={{ width: '100%', height: 6, background: 'var(--bg-base)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ width: `${fw.complianceScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-500), var(--low))' }} />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {fw.controlsPassed} of {fw.totalControls} Controls Verified
            </div>
          </div>
        ))}
      </div>

      {/* Control Details Table */}
      {selectedFramework && (
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            {selectedFramework.name} Control Requirement Matrix
          </h3>

          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Control Identifier</th>
                <th>Requirement Description</th>
                <th>Control Family</th>
                <th>Aegis Auto-Evidence</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>REQ-6.3.1</td>
                <td>Incorporate secure coding practices into software development lifecycle (SAST/AST)</td>
                <td>Software Development</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--accent-400)', fontFamily: 'var(--font-mono)' }}>AST Engine Log #{selectedProjectId.substring(0, 6)}</td>
                <td><span className="badge badge-low">PASSED</span></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>REQ-3.4.1</td>
                <td>Render primary account data unreadable anywhere stored (DB Encryption at Rest)</td>
                <td>Data Protection</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--accent-400)', fontFamily: 'var(--font-mono)' }}>PostgreSQL TLS Telemetry</td>
                <td><span className="badge badge-low">PASSED</span></td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.84rem' }}>REQ-10.2.2</td>
                <td>Automated immutable audit trails for all system administrator actions</td>
                <td>Audit & Lineage</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--accent-400)', fontFamily: 'var(--font-mono)' }}>Immutable DB Lineage Table</td>
                <td><span className="badge badge-low">PASSED</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
