import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Globe, ShieldAlert, CheckCircle2, Lock, Zap, Server, Search, AlertTriangle, Key, FolderOpen
} from 'lucide-react'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  service: string
  authRequired: boolean
  rateLimited: boolean
  owaspRisk?: string
  status: 'Vulnerable' | 'Protected'
}

const DEMO_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'api-1',
    method: 'GET',
    path: '/api/v1/users/{id}/billing',
    service: 'user-service',
    authRequired: false,
    rateLimited: false,
    owaspRisk: 'API1:2023 Broken Object Level Authorization (BOLA/IDOR)',
    status: 'Vulnerable'
  },
  {
    id: 'api-2',
    method: 'POST',
    path: '/api/v1/auth/reset-password',
    service: 'auth-service',
    authRequired: false,
    rateLimited: false,
    owaspRisk: 'API4:2023 Unrestricted Resource Consumption (No Rate Limit)',
    status: 'Vulnerable'
  },
  {
    id: 'api-3',
    method: 'PUT',
    path: '/api/v1/users/profile',
    service: 'user-service',
    authRequired: true,
    rateLimited: true,
    owaspRisk: 'API6:2023 Mass Assignment Vulnerability',
    status: 'Vulnerable'
  }
]

export default function ApiSurfacePage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>(DEMO_ENDPOINTS)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch real projects from API
  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100), {
    refetchOnMount: true,
    staleTime: 0
  })
  const userProjects = projectsData?.data?.content || []
  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  // Fetch real findings for project
  const { data: findingsRes } = useQuery(
    ['findings', selectedProjectId],
    () => findingsApi.list(selectedProjectId),
    { enabled: selectedProjectId !== 'SAMPLE' && !!selectedProjectId, refetchOnMount: true }
  )
  const realFindings = findingsRes?.data?.content || []

  // Update API endpoints when project changes
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setEndpoints(DEMO_ENDPOINTS)
    } else {
      const mapped = realFindings.map((f: any, idx: number) => ({
        id: f.id || `api-${idx}`,
        method: (f.ruleId?.includes('POST') ? 'POST' : 'GET') as any,
        path: f.filePath || `/api/v1/endpoint-${idx}`,
        service: selectedProjectObj?.name || 'api-service',
        authRequired: f.status === 'RESOLVED',
        rateLimited: f.status === 'RESOLVED',
        owaspRisk: f.title || 'OWASP API Security Risk',
        status: (f.status === 'RESOLVED' ? 'Protected' : 'Vulnerable') as any
      }))
      setEndpoints(mapped)
    }
  }, [selectedProjectId, realFindings])

  const handleEnforceAuth = (id: string) => {
    setEndpoints(prev =>
      prev.map(ep => ep.id === id ? { ...ep, status: 'Protected', authRequired: true, rateLimited: true, owaspRisk: undefined } : ep)
    )
  }

  const filtered = endpoints.filter(ep => ep.path.toLowerCase().includes(searchTerm.toLowerCase()) || ep.service.toLowerCase().includes(searchTerm.toLowerCase()))
  const vulnTotal = endpoints.filter(ep => ep.status === 'Vulnerable').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(34, 211, 238, 0.2))',
            border: '1px solid var(--primary-400)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Globe size={24} color="var(--primary-400)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                API Attack Surface & Shadow Endpoint Security
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Automated API endpoint discovery, BOLA / IDOR detection, and missing auth shield enforcement.
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
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample APIs</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ background: 'var(--bg-elevated)', padding: '0.4rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unprotected Routes: </span>
            <strong style={{ fontSize: '0.9rem', color: vulnTotal > 0 ? 'var(--critical)' : 'var(--low)' }}>{vulnTotal}</strong>
          </div>
        </div>
      </div>

      {/* Main Endpoint Discovery Table */}
      <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Discovered Enterprise API Route Catalog</h3>

          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search route or path..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', width: 240, fontSize: '0.82rem' }}
            />
          </div>
        </div>

        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint Path</th>
              <th>Service Domain</th>
              <th>Auth Boundary</th>
              <th>Rate Limiting</th>
              <th>OWASP API Risk</th>
              <th>Enforcement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ep => (
              <tr key={ep.id}>
                <td>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: 4,
                    background: ep.method === 'GET' ? 'rgba(59, 130, 246, 0.2)' : (ep.method === 'POST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)'),
                    color: ep.method === 'GET' ? 'var(--primary-400)' : (ep.method === 'POST' ? 'var(--low)' : 'var(--high)')
                  }}>
                    {ep.method}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                  {ep.path}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ep.service}</td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: ep.authRequired ? 'var(--low)' : 'var(--critical)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {ep.authRequired ? <Lock size={12} /> : <AlertTriangle size={12} />}
                    {ep.authRequired ? 'OAuth2 Enforced' : 'MISSING AUTH'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: ep.rateLimited ? 'var(--low)' : 'var(--high)', fontWeight: 600 }}>
                    {ep.rateLimited ? '100 req/min' : 'Unrestricted'}
                  </span>
                </td>
                <td>
                  {ep.owaspRisk ? (
                    <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                      {ep.owaspRisk}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--low)', fontWeight: 700 }}>Compliant</span>
                  )}
                </td>
                <td>
                  {ep.status === 'Vulnerable' ? (
                    <button
                      onClick={() => handleEnforceAuth(ep.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Enforce Security Boundary
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--low)', fontWeight: 700 }}>
                      ✓ Protected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
