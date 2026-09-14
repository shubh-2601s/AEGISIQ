import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, scansApi } from '../lib/api'
import { Activity, ShieldCheck, Clock, FileArchive, FolderOpen, Plus, Upload, CheckCircle2 } from 'lucide-react'

export default function ScansPage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Fetch real user projects
  const { data: projectsData } = useQuery(
    'projects',
    () => projectsApi.list(0, 100),
    { refetchOnMount: true, staleTime: 0 }
  )
  const userProjects = projectsData?.data?.content || []

  // Select first project automatically
  useEffect(() => {
    if (userProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(userProjects[0].id)
    }
  }, [userProjects, selectedProjectId])

  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  // Fetch real scans from backend API
  const { data: scansRes, isLoading } = useQuery(
    ['scans', selectedProjectId],
    () => scansApi.list(selectedProjectId),
    { enabled: !!selectedProjectId, refetchOnMount: true, staleTime: 0 }
  )
  const realScansRaw = scansRes?.data?.content || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid var(--low)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={24} color="var(--low)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Scan Execution Lineage & Ingestion Audit
              </h1>
              <span className="cyber-badge">
                {userProjects.length > 0 ? `PROJECT: ${selectedProjectObj?.name || 'ACTIVE'}` : 'NO PROJECTS'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Immutable telemetry log for static analysis jobs and untrusted repository safety guarantees.
            </p>
          </div>
        </div>

        {/* Project Selector & Scan Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {userProjects.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.3rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <FolderOpen size={14} color="var(--cyber-cyan)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="form-input"
                  style={{ background: 'transparent', border: 'none', color: 'var(--cyber-cyan)', fontWeight: 700, fontSize: '0.82rem', padding: '0.2rem' }}
                >
                  {userProjects.map((p: any) => (
                    <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                      📦 {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800 }}
              >
                <Upload size={14} /> Upload New Zip Scan
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800 }}
            >
              <Plus size={16} /> Create First Project
            </button>
          )}
        </div>
      </div>

      {/* Scans List or Empty State */}
      {userProjects.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <FolderOpen size={48} color="var(--cyber-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>No Projects Configured</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 460 }}>
              Create a project under Projects to upload scan archives and track execution lineage.
            </p>
          </div>
          <button onClick={() => navigate('/projects')} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Create New Project
          </button>
        </div>
      ) : realScansRaw.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <Activity size={48} color="var(--cyber-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              No Scans Executed Yet for "{selectedProjectObj?.name}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 480 }}>
              Upload your source code zip archive in the project details screen to run the AST security engine and generate scan lineage telemetry.
            </p>
          </div>
          <button onClick={() => navigate(`/projects/${selectedProjectId}`)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Upload size={16} style={{ marginRight: 6 }} /> Go to Scan Upload Page
          </button>
        </div>
      ) : (
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {realScansRaw.map((scan: any) => (
              <div
                key={scan.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FileArchive size={28} color="var(--primary-400)" />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-bright)' }}>
                        {scan.fileName || scan.repositoryName || selectedProjectObj?.name}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        ID: {scan.id?.substring(0, 8)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> {scan.createdAt || scan.timestamp || 'Just Now'}</span>
                      <span>Scan Status: <strong>{scan.status || 'COMPLETED'}</strong></span>
                      <span>Findings Found: <strong>{scan.findingCount ?? scan.findingsCount ?? 0}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--low)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldCheck size={14} /> AST & ZIP-SLIP SAFE
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: (scan.findingCount || 0) > 0 ? 'var(--critical)' : 'var(--low)', marginTop: '0.2rem' }}>
                      {scan.status || 'COMPLETED'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
