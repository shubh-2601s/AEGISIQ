import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../lib/api'
import { FolderOpen, Plus, Trash2, X, AlertCircle } from 'lucide-react'

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation(
    (data: { name: string; description?: string }) => projectsApi.create(data),
    {
      onSuccess: (res: any) => {
        queryClient.invalidateQueries('projects')
        onClose()
        if (res?.data?.id) {
          onCreated(res.data.id)
        }
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Failed to create project')
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required'); return }
    mutation.mutate({ name: name.trim(), description: description.trim() || undefined })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="card fade-in" style={{ width: 480, maxWidth: '95vw' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Create New Project</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Payment Service API"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              className="form-input"
              placeholder="What does this project do?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {error && (
            <div className="form-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isLoading}>
              {mutation.isLoading ? <span className="spinner" /> : <><Plus size={16} /> Create Project</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery('projects', () => projectsApi.list(0, 50), {
    refetchOnMount: true,
    staleTime: 0,
  })
  const projects = data?.data?.content || []

  const deleteMutation = useMutation(
    (id: string) => projectsApi.delete(id),
    { onSuccess: () => queryClient.invalidateQueries('projects') }
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your security scanning projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New Project
        </button>
      </div>

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={id => navigate(`/projects/${id}`)} />}

      {isLoading ? (
        <div className="empty-state">
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><FolderOpen size={52} /></div>
          <div className="empty-state-title">No projects yet</div>
          <div className="empty-state-text">
            Create a project to organize and scan your repositories for security vulnerabilities.
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}
                  onClick={() => setShowModal(true)}>
            Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((p: any) => (
            <div key={p.id} className="card"
                 style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                 onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                    boxShadow: 'var(--shadow-glow-blue)'
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                      {p.description || 'No description'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${p.status === 'ACTIVE' ? 'badge-low' : 'badge-false-positive'}`}>
                      {p.status}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Risk: {parseFloat(p.riskScore).toFixed(1)}
                    </div>
                  </div>
                  <button
                    className="btn btn-icon btn-danger"
                    onClick={e => {
                      e.stopPropagation()
                      if (confirm(`Delete project "${p.name}"?`)) deleteMutation.mutate(p.id)
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
