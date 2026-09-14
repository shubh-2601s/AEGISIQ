import { useState } from 'react'
import { useQuery } from 'react-query'
import { projectsApi } from '../lib/api'
import {
  Zap, Play, CheckCircle2, ShieldAlert, Terminal, RefreshCw, Layers, ArrowRight, Bell, Lock, Key, FolderOpen
} from 'lucide-react'

interface Playbook {
  id: string
  name: string
  trigger: string
  status: 'ACTIVE' | 'PAUSED'
  actions: string[]
  lastExecuted: string
  executionCount: number
}

const DEMO_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-1',
    name: 'Auto-Revoke Hardcoded AWS Credentials',
    trigger: 'Finding Severity == CRITICAL & Rule == CWE-798 (Hardcoded Secret)',
    status: 'ACTIVE',
    actions: [
      'Revoke AWS IAM Secret Key via AWS API',
      'Rotate DB Password in Secrets Manager',
      'Dispatch PagerDuty Incident Alert to On-Call SecOps'
    ],
    lastExecuted: '2026-09-14 11:20:00',
    executionCount: 14
  },
  {
    id: 'pb-2',
    name: 'Isolate Vulnerable K8s Pod Blast Radius',
    trigger: 'Attack Topology Node Status == CRITICAL & RiskScore > 9.0',
    status: 'ACTIVE',
    actions: [
      'Apply Kubernetes NetworkPolicy to block egress traffic',
      'Trigger Aegis AST Auto-Fix Git Patch PR',
      'Post Security War Room Alert in Slack #sec-ops'
    ],
    lastExecuted: '2026-09-13 14:45:10',
    executionCount: 29
  }
]

export default function PlaybooksPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [playbooks] = useState<Playbook[]>(DEMO_PLAYBOOKS)
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook>(DEMO_PLAYBOOKS[0])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLogs, setExecutionLogs] = useState<string[]>([])

  // Fetch real projects from API
  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100), {
    refetchOnMount: true,
    staleTime: 0
  })
  const userProjects = projectsData?.data?.content || []
  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  const handleTestPlaybook = () => {
    setIsExecuting(true)
    setExecutionLogs([`[0.00s] Trigger fired for project: ${selectedProjectId === 'SAMPLE' ? 'Global Fleet' : selectedProjectObj?.name}`])

    selectedPlaybook.actions.forEach((action, idx) => {
      setTimeout(() => {
        setExecutionLogs(prev => [...prev, `[${((idx + 1) * 0.4).toFixed(2)}s] EXECUTION SUCCESS: ${action}`])
        if (idx === selectedPlaybook.actions.length - 1) {
          setTimeout(() => {
            setExecutionLogs(prev => [...prev, `[${((idx + 2) * 0.4).toFixed(2)}s] PLAYBOOK COMPLETED (Status 0)`])
            setIsExecuting(false)
          }, 300)
        }
      }, (idx + 1) * 500)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(244, 63, 94, 0.2))',
            border: '1px solid var(--high)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={24} color="var(--high)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Automated Incident Response & SOAR Playbooks
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Automated trigger-action workflows for instant containment, secret revocation, and incident triage.
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
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample Fleet</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Playbook Catalog (Left) + Pipeline Builder & Test Console (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '1.5rem' }}>
        <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Active Orchestration Playbooks</h3>

          {playbooks.map(pb => (
            <div
              key={pb.id}
              onClick={() => {
                setSelectedPlaybook(pb)
                setExecutionLogs([])
              }}
              style={{
                background: selectedPlaybook.id === pb.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-elevated)',
                border: `1px solid ${selectedPlaybook.id === pb.id ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                borderRadius: 12,
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-bright)' }}>{pb.name}</div>
                <span className="badge badge-low">{pb.status}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                TRIGGER: {pb.trigger}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Executions: <strong>{pb.executionCount}</strong> | Last Run: {pb.lastExecuted}
              </div>
            </div>
          ))}
        </div>

        {/* Playbook Pipeline Inspector & Dry-Run Console */}
        <div className="hud-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-bright)' }}>{selectedPlaybook.name}</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
              Pipeline Actions Sequence ({selectedPlaybook.actions.length} Steps)
            </div>
          </div>

          {/* Action Pipeline Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {selectedPlaybook.actions.map((act, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 8,
                  padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem'
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff'
                }}>
                  {idx + 1}
                </div>
                <span style={{ flex: 1, color: 'var(--text-primary)' }}>{act}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleTestPlaybook}
            disabled={isExecuting}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, var(--high), var(--critical))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem', fontWeight: 700
            }}
          >
            {isExecuting ? <RefreshCw size={16} className="radar-sweep-line" /> : <Play size={16} />}
            {isExecuting ? 'Executing SOAR Playbook...' : 'Test Playbook Execution (Dry Run)'}
          </button>

          {/* Console Output Log */}
          {executionLogs.length > 0 && (
            <div className="test-lab-code-area" style={{ padding: '0.75rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              {executionLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('SUCCESS') ? '#86efac' : 'var(--text-bright)', marginBottom: '0.2rem' }}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
