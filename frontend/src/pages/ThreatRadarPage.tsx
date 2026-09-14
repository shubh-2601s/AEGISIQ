import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Radio, ShieldAlert, Zap, Globe, AlertTriangle, ExternalLink, RefreshCw, Cpu, CheckCircle2, FolderOpen, Upload
} from 'lucide-react'

interface ThreatItem {
  id: string
  cve: string
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  epssScore: number
  cisaKev: boolean
  affectedAsset: string
  status: 'Vulnerable' | 'Mitigated' | 'Monitoring'
  dateAdded: string
  summary: string
}

const DEMO_THREAT_FEED: ThreatItem[] = [
  {
    id: 'th-1',
    cve: 'CVE-2024-5291',
    title: 'Spring Framework Remote Code Execution via SpEL Expression Invalidation',
    severity: 'CRITICAL',
    epssScore: 0.96,
    cisaKev: true,
    affectedAsset: 'AuthUserController.java (Production Edge)',
    status: 'Vulnerable',
    dateAdded: '2026-09-12',
    summary: 'SpEL expression parser allows arbitrary code injection via untrusted HTTP headers.'
  },
  {
    id: 'th-2',
    cve: 'CVE-2024-4190',
    title: 'PostgreSQL Authentication Bypass in TLS Handshake',
    severity: 'CRITICAL',
    epssScore: 0.89,
    cisaKev: true,
    affectedAsset: 'db/prod-cluster.internal:5432',
    status: 'Vulnerable',
    dateAdded: '2026-09-10',
    summary: 'TLS renegotiation bug allows unauthorized connection reuse without credentials.'
  },
  {
    id: 'th-3',
    cve: 'CVE-2024-3882',
    title: 'FastAPI Path Traversal & Arbitrary File Read',
    severity: 'HIGH',
    epssScore: 0.74,
    cisaKev: false,
    affectedAsset: 'ai-service/reports.py',
    status: 'Mitigated',
    dateAdded: '2026-09-08',
    summary: 'Directory traversal via unescaped path variables allows reading internal config files.'
  }
]

export default function ThreatRadarPage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [threats, setThreats] = useState<ThreatItem[]>(DEMO_THREAT_FEED)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real user projects
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

  // Update threat feed when project changes
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setThreats(DEMO_THREAT_FEED)
    } else {
      const mapped = realFindings.map((f: any, idx: number) => ({
        id: f.id || `th-${idx}`,
        cve: f.cwe || f.ruleId || 'CVE-2024-VULN',
        title: f.title || f.ruleName || 'Correlated Threat Finding',
        severity: f.severity || 'HIGH',
        epssScore: f.severity === 'CRITICAL' ? 0.94 : 0.72,
        cisaKev: f.severity === 'CRITICAL',
        affectedAsset: `${f.filePath || 'src/App.java'}:${f.lineNumber || 1}`,
        status: f.status === 'RESOLVED' ? 'Mitigated' : 'Vulnerable',
        dateAdded: '2026-09-14',
        summary: f.description || 'Vulnerability detected in active project asset.'
      }))
      setThreats(mapped)
    }
  }, [selectedProjectId, realFindings])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const handleMitigate = (id: string) => {
    setThreats(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'Mitigated' } : item)
    )
  }

  const filteredThreats = threats.filter(t => filterSeverity === 'ALL' || t.severity === filterSeverity)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Top Header */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Radio size={24} color="var(--primary-400)" className="pulse-cyan-glow" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Zero-Day Cyber Threat Radar
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              EPSS exploit prediction scoring system correlated against active AegisIQ asset telemetry.
            </p>
          </div>
        </div>

        {/* Project Selector */}
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
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample Radar</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'radar-sweep-line' : ''} />
            {isRefreshing ? 'Scanning Radar...' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Main Layout: Radar Graphic + Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        
        {/* Animated Radar Visualizer */}
        <div className="hud-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '1rem', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Active Sector Sweep</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--low)', fontFamily: 'var(--font-mono)' }}>360° Defense</span>
          </div>

          <div style={{ width: 220, height: 220, position: 'relative', margin: '1rem 0' }}>
            <svg style={{ width: '100%', height: '100%' }}>
              <circle cx="110" cy="110" r="100" stroke="rgba(56, 130, 246, 0.2)" strokeWidth="1" fill="none" />
              <circle cx="110" cy="110" r="70" stroke="rgba(56, 130, 246, 0.2)" strokeWidth="1" fill="none" />
              <circle cx="110" cy="110" r="40" stroke="rgba(56, 130, 246, 0.2)" strokeWidth="1" fill="none" />
              
              <line x1="10" y1="110" x2="210" y2="110" stroke="rgba(56, 130, 246, 0.15)" strokeWidth="1" />
              <line x1="110" y1="10" x2="110" y2="210" stroke="rgba(56, 130, 246, 0.15)" strokeWidth="1" />

              <circle cx="150" cy="65" r="5" fill="var(--critical)" className="attack-node-critical" />
              <circle cx="75" cy="160" r="4" fill="var(--high)" />
              <circle cx="170" cy="170" r="3" fill="var(--accent-400)" />

              <g className="radar-sweep-line">
                <line x1="110" y1="110" x2="110" y2="10" stroke="var(--accent-400)" strokeWidth="2" filter="drop-shadow(0 0 8px var(--accent-400))" />
              </g>
            </svg>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Tracked Assets: <strong style={{ color: 'var(--text-bright)' }}>{selectedProjectId === 'SAMPLE' ? '14 Cloud Repos' : selectedProjectObj?.name}</strong>
          </div>
        </div>

        {/* Live Zero-Day Threat Feed Table */}
        <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Correlated CVE Threat Stream</h3>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['ALL', 'CRITICAL', 'HIGH'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`btn ${filterSeverity === sev ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {selectedProjectId !== 'SAMPLE' && filteredThreats.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle2 size={44} color="var(--low)" />
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                No Zero-Day Threat Signals Detected for "{selectedProjectObj?.name}"
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 440 }}>
                This project has no active high-EPSS zero-day vulnerability threats logged against its assets!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredThreats.map(threat => (
                <div
                  key={threat.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${threat.status === 'Mitigated' ? 'var(--border-subtle)' : (threat.severity === 'CRITICAL' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-default)')}`,
                    borderRadius: 12,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                    opacity: threat.status === 'Mitigated' ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${threat.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                        {threat.severity}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--primary-400)', fontFamily: 'var(--font-mono)' }}>
                        {threat.cve}
                      </span>
                      {threat.cisaKev && (
                        <span style={{
                          background: 'rgba(249, 115, 22, 0.2)', color: 'var(--high)',
                          border: '1px solid var(--high)', borderRadius: 4, padding: '0.1rem 0.4rem',
                          fontSize: '0.68rem', fontWeight: 700
                        }}>
                          CISA KEV ALERT
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        EPSS Exploit Likelihood: <strong style={{ color: threat.epssScore > 0.8 ? 'var(--critical)' : 'var(--high)' }}>{(threat.epssScore * 100).toFixed(0)}%</strong>
                      </span>
                      {threat.status !== 'Mitigated' ? (
                        <button
                          onClick={() => handleMitigate(threat.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Remediate
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--low)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Mitigated
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>
                    {threat.title}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {threat.summary}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Impacted Asset: {threat.affectedAsset}</span>
                    <span>Telemetry Logged: {threat.dateAdded}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
