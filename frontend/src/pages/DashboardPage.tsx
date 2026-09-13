import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi } from '../lib/api'
import {
  ShieldAlert, Activity, FolderOpen, GitBranch,
  TrendingDown, Zap, Clock
} from 'lucide-react'

// Simple sparkline-like bar
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2,
                    transition: 'width 0.6s ease', boxShadow: `0 0 6px ${color}` }} />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100))
  const projects = projectsData?.data?.content || []

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Security Overview</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong> — here's your platform intelligence summary.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>
          <FolderOpen size={16} />
          New Project
        </button>
      </div>

      {/* Top Metrics */}
      <div className="metric-grid">
        <div className="metric-card critical">
          <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={13} style={{ color: 'var(--critical)' }} />
            Critical Findings
          </div>
          <div className="metric-value" style={{ color: 'var(--critical)' }}>
            {projects.reduce((acc: number) => acc, 0)}
          </div>
          <div className="metric-delta">Across all active projects</div>
          <div style={{ marginTop: '0.75rem' }}>
            <MiniBar value={3} max={10} color="var(--critical)" />
          </div>
        </div>

        <div className="metric-card high">
          <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={13} style={{ color: 'var(--high)' }} />
            Active Projects
          </div>
          <div className="metric-value" style={{ color: 'var(--text-bright)' }}>
            {projects.length}
          </div>
          <div className="metric-delta">Under continuous monitoring</div>
          <div style={{ marginTop: '0.75rem' }}>
            <MiniBar value={projects.length} max={20} color="var(--high)" />
          </div>
        </div>

        <div className="metric-card medium">
          <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={13} style={{ color: 'var(--accent-400)' }} />
            Total Scans Run
          </div>
          <div className="metric-value" style={{ color: 'var(--text-bright)' }}>0</div>
          <div className="metric-delta">Since account creation</div>
          <div style={{ marginTop: '0.75rem' }}>
            <MiniBar value={0} max={100} color="var(--accent-400)" />
          </div>
        </div>

        <div className="metric-card low">
          <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={13} style={{ color: 'var(--low)' }} />
            Resolved Today
          </div>
          <div className="metric-value" style={{ color: 'var(--low)' }}>0</div>
          <div className="metric-delta">Vulnerabilities closed</div>
          <div style={{ marginTop: '0.75rem' }}>
            <MiniBar value={0} max={10} color="var(--low)" />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} style={{ color: 'var(--primary-400)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Active Projects</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
              View All
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShieldAlert size={48} />
              </div>
              <div className="empty-state-title">No projects yet</div>
              <div className="empty-state-text">
                Create a project to begin scanning your codebase for security vulnerabilities.
              </div>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}
                      onClick={() => navigate('/projects/new')}>
                Create First Project
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((p: any) => (
                    <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                          }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{p.name}</div>
                            {p.description && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 300 }}
                                   className="truncate">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${p.status.toLowerCase() === 'active' ? 'low' : 'false-positive'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                          {parseFloat(p.riskScore).toFixed(1)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm"
                                onClick={e => { e.stopPropagation(); navigate(`/projects/${p.id}`) }}>
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border-default)'
            }}>
              <GitBranch size={20} style={{ color: 'var(--primary-400)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Upload & Scan</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Upload a .zip archive for instant security analysis
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects')}>
                Start Scan
              </button>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(6,182,212,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(6,182,212,0.25)'
            }}>
              <ShieldAlert size={20} style={{ color: 'var(--accent-400)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Review Findings</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Triage and resolve open security vulnerabilities
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
                View Findings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
