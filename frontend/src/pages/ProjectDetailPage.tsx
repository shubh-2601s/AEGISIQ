import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { projectsApi, findingsApi, scansApi } from '../lib/api'
import { ArrowLeft, ShieldAlert, GitBranch, Activity } from 'lucide-react'
import ScanUpload from '../components/ScanUpload'
import FindingsTable from '../components/FindingsTable'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const { data: projectData, isLoading: pLoading } = useQuery(
    ['project', projectId], () => projectsApi.get(projectId!)
  )
  const { data: scansData } = useQuery(
    ['scans', projectId], () => scansApi.list(projectId!), { refetchInterval: 5000 }
  )
  const { data: summaryData } = useQuery(
    ['findingsSummary', projectId], () => findingsApi.summary(projectId!)
  )

  const project = projectData?.data
  const scans = scansData?.data?.content || []
  const summary = summaryData?.data || {}

  if (pLoading) {
    return (
      <div className="empty-state">
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-icon btn-secondary" onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">{project?.name || 'Project'}</h1>
            <p className="page-subtitle">{project?.description || 'Security scanning project'}</p>
          </div>
        </div>
        <span className={`badge ${project?.status === 'ACTIVE' ? 'badge-low' : 'badge-false-positive'}`}>
          {project?.status}
        </span>
      </div>

      {/* Severity Summary */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPEN', 'RESOLVED'].map(key => (
          <div key={key} className={`metric-card ${key.toLowerCase()}`}>
            <div className="metric-label">{key}</div>
            <div className="metric-value" style={{
              fontSize: '1.6rem',
              color: key === 'CRITICAL' ? 'var(--critical)' :
                     key === 'HIGH' ? 'var(--high)' :
                     key === 'MEDIUM' ? 'var(--medium)' :
                     key === 'LOW' ? 'var(--low)' :
                     key === 'RESOLVED' ? '#34d399' : 'var(--primary-400)'
            }}>
              {summary[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Layout: Scan Upload + Recent Scans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={18} style={{ color: 'var(--primary-400)' }} />
            <h2 style={{ fontWeight: 600 }}>Upload &amp; Scan</h2>
          </div>
          <ScanUpload projectId={projectId!} />
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: 'var(--accent-400)' }} />
            <h2 style={{ fontWeight: 600 }}>Recent Scans</h2>
          </div>
          {scans.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div style={{ opacity: 0.3 }}><Activity size={36} /></div>
              <div className="empty-state-title" style={{ fontSize: '0.9rem' }}>No scans yet</div>
              <div className="empty-state-text" style={{ fontSize: '0.8rem' }}>
                Upload an archive to run your first scan.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {scans.slice(0, 6).map((scan: any) => (
                <div key={scan.id} style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8, padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`scan-status-badge status-${scan.status.toLowerCase()}`}>
                        {scan.status === 'RUNNING' && <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />}
                        {scan.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {scan.filesScanned} files • {scan.findingsCount} findings
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(scan.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Findings */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} style={{ color: 'var(--critical)' }} />
          <h2 style={{ fontWeight: 600 }}>Security Findings</h2>
        </div>
        <FindingsTable projectId={projectId!} />
      </div>
    </div>
  )
}
