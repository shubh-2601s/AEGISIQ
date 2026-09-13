import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { findingsApi } from '../lib/api'
import { ShieldAlert, FileCode2, ChevronDown, ChevronRight } from 'lucide-react'

const SEVERITY_CLASSES: Record<string, string> = {
  CRITICAL: 'badge-critical',
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
  INFORMATIONAL: 'badge-informational',
}

const STATUS_CLASSES: Record<string, string> = {
  OPEN: 'badge-open',
  CONFIRMED: 'badge-confirmed',
  RESOLVED: 'badge-resolved',
  FALSE_POSITIVE: 'badge-false-positive',
  ACCEPTED_RISK: 'badge-false-positive',
}

interface Props { projectId: string }

function FindingRow({ finding, projectId }: { finding: any; projectId: string }) {
  const [expanded, setExpanded] = useState(false)
  const queryClient = useQueryClient()

  const statusMutation = useMutation(
    (status: string) => findingsApi.updateStatus(projectId, finding.id, status),
    { onSuccess: () => queryClient.invalidateQueries(['findings', projectId]) }
  )

  return (
    <>
      <tr onClick={() => setExpanded(!expanded)}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> :
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                           color: 'var(--text-muted)' }}>
              {finding.ruleId}
            </span>
          </div>
          <div style={{ fontWeight: 500, marginTop: '0.15rem' }}>{finding.title}</div>
        </td>
        <td>
          <span className={`badge ${SEVERITY_CLASSES[finding.severity] || 'badge-low'}`}>
            {finding.severity}
          </span>
        </td>
        <td>
          <span className={`badge ${STATUS_CLASSES[finding.status] || ''}`}>
            {finding.status.replace('_', ' ')}
          </span>
        </td>
        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {finding.filePath ? (
            <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {finding.filePath}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
            </div>
          ) : '—'}
        </td>
        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          {parseFloat(finding.riskScore).toFixed(1)}
        </td>
        <td onClick={e => e.stopPropagation()}>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            value={finding.status}
            onChange={e => statusMutation.mutate(e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ACCEPTED_RISK">Accepted Risk</option>
          </select>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: '1rem 1.5rem', background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
                              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                  Description
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {finding.description}
                </p>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
                              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                  Remediation
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {finding.remediation}
                </p>
              </div>
              {finding.evidence && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    Evidence
                  </div>
                  <div className="code-snippet">{finding.evidence}</div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function FindingsTable({ projectId }: Props) {
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery(
    ['findings', projectId, severity, status, page],
    () => findingsApi.list(projectId, {
      severity: severity || undefined,
      status: status || undefined,
      page,
      size: 20,
    }),
    { keepPreviousData: true }
  )

  const findings = data?.data?.content || []
  const totalPages = data?.data?.totalPages || 0
  const total = data?.data?.totalElements || 0

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <select
          className="form-input"
          style={{ width: 'auto', fontSize: '0.85rem' }}
          value={severity}
          onChange={e => { setSeverity(e.target.value); setPage(0) }}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFORMATIONAL">Informational</option>
        </select>

        <select
          className="form-input"
          style={{ width: 'auto', fontSize: '0.85rem' }}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(0) }}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FALSE_POSITIVE">False Positive</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ACCEPTED_RISK">Accepted Risk</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center' }}>
          {total} finding{total !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state"><span className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : findings.length === 0 ? (
        <div className="empty-state">
          <div style={{ opacity: 0.3 }}><ShieldAlert size={44} /></div>
          <div className="empty-state-title">No findings</div>
          <div className="empty-state-text">
            {severity || status ? 'No findings match these filters.' : 'Run a scan to discover security issues.'}
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Finding</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Risk</th>
                  <th>Triage</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f: any) => (
                  <FindingRow key={f.id} finding={f} projectId={projectId} />
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
