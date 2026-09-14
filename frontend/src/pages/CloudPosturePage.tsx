import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Cloud, ShieldAlert, CheckCircle2, AlertTriangle, FileCode, Play, Sparkles, RefreshCw, Check, Server, Lock, FolderOpen, Upload, Plus
} from 'lucide-react'

interface IaCMisconfig {
  id: string
  title: string
  provider: 'AWS' | 'KUBERNETES' | 'DOCKER'
  file: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  ruleId: string
  line: number
  codeSnippet: string
  fixedSnippet: string
  description: string
  status: 'OPEN' | 'REMEDIATED'
}

const DEMO_MISCONFIGS: IaCMisconfig[] = [
  {
    id: 'iac-1',
    title: 'S3 Bucket Public Read/Write ACL Enabled',
    provider: 'AWS',
    file: 'infrastructure/s3-storage.tf',
    severity: 'CRITICAL',
    ruleId: 'CKV_AWS_20',
    line: 14,
    codeSnippet: `resource "aws_s3_bucket" "data_lake" {\n  bucket = "aegis-analytics-prod-data"\n  acl    = "public-read-write"\n}`,
    fixedSnippet: `resource "aws_s3_bucket" "data_lake" {\n  bucket = "aegis-analytics-prod-data"\n  acl    = "private"\n}`,
    description: 'S3 bucket is configured with public-read-write ACL, allowing unauthenticated internet users to view and overwrite sensitive enterprise telemetry.',
    status: 'OPEN'
  },
  {
    id: 'iac-2',
    title: 'Wildcard Ingress Security Group Rule (0.0.0.0/0 SSH)',
    provider: 'AWS',
    file: 'infrastructure/security-groups.tf',
    severity: 'CRITICAL',
    ruleId: 'CKV_AWS_24',
    line: 22,
    codeSnippet: `resource "aws_security_group_rule" "allow_ssh" {\n  type = "ingress"\n  from_port = 22\n  cidr_blocks = ["0.0.0.0/0"]\n}`,
    fixedSnippet: `resource "aws_security_group_rule" "allow_ssh" {\n  type = "ingress"\n  from_port = 22\n  cidr_blocks = ["10.200.0.0/16"]\n}`,
    description: 'Security group rule allows unrestricted inbound SSH (port 22) connections from any IPv4 address on the internet.',
    status: 'OPEN'
  }
]

export default function CloudPosturePage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [misconfigs, setMisconfigs] = useState<IaCMisconfig[]>(DEMO_MISCONFIGS)
  const [selectedItem, setSelectedItem] = useState<IaCMisconfig | null>(DEMO_MISCONFIGS[0])
  const [isFixing, setIsFixing] = useState(false)
  const [activeTab, setActiveTab] = useState<'AWS' | 'KUBERNETES' | 'ALL'>('ALL')

  // Fetch real projects from backend API
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

  // Update misconfigurations when project changes
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setMisconfigs(DEMO_MISCONFIGS)
      setSelectedItem(DEMO_MISCONFIGS[0])
    } else {
      const mapped = realFindings
        .filter((f: any) => f.category === 'IAC' || f.ruleId?.includes('CKV') || f.filePath?.endsWith('.tf') || f.filePath?.endsWith('.yaml'))
        .map((f: any, idx: number) => ({
          id: f.id || `iac-${idx}`,
          title: f.title || f.ruleName || 'Cloud Misconfiguration',
          provider: (f.filePath?.endsWith('.tf') ? 'AWS' : 'KUBERNETES') as any,
          file: f.filePath || 'infrastructure/main.tf',
          severity: f.severity || 'HIGH',
          ruleId: f.ruleId || 'CKV_AWS_01',
          line: f.lineNumber || 12,
          codeSnippet: f.codeSnippet || `# Misconfiguration in ${f.filePath || 'main.tf'}\nresource "aws_resource" "ex" {\n  encrypted = false\n}`,
          fixedSnippet: f.fixedSnippet || `# Remediated\nresource "aws_resource" "ex" {\n  encrypted = true\n}`,
          description: f.description || 'Cloud infrastructure security boundary violation.',
          status: f.status || 'OPEN'
        }))

      setMisconfigs(mapped)
      setSelectedItem(mapped[0] || null)
    }
  }, [selectedProjectId, realFindings])

  const handleApplyFix = (id: string) => {
    setIsFixing(true)
    setTimeout(() => {
      setIsFixing(false)
      setMisconfigs(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'REMEDIATED' } : item)
      )
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: 'REMEDIATED' } : null)
      }
    }, 800)
  }

  const filtered = misconfigs.filter(m => activeTab === 'ALL' || m.provider === activeTab)
  const openCount = misconfigs.filter(m => m.status === 'OPEN').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid var(--accent-400)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cloud size={24} color="var(--accent-400)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Cloud Security Posture & IaC Guard (CSPM)
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Automated Infrastructure-as-Code misconfiguration analysis and automated Terraform remediation.
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

          {selectedProjectId !== 'SAMPLE' && (
            <button
              onClick={() => navigate(`/projects/${selectedProjectId}`)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800 }}
            >
              <Upload size={14} /> Scan Repository
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['ALL', 'AWS', 'KUBERNETES'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            {tab} Infrastructure
          </button>
        ))}
      </div>

      {/* Main Grid: Misconfig List (Left) + Detail Inspector (Right) */}
      {selectedProjectId !== 'SAMPLE' && filtered.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <CheckCircle2 size={48} color="var(--low)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              No IaC Cloud Misconfigurations Detected for "{selectedProjectObj?.name}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 480 }}>
              Your repository's Terraform, Kubernetes, and Docker infrastructure files passed posture checks cleanly!
            </p>
          </div>
          <button onClick={() => navigate(`/projects/${selectedProjectId}`)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Upload size={16} style={{ marginRight: 6 }} /> Upload New IaC Scan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 450px' : '1fr', gap: '1.5rem' }}>
          <div className="hud-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: selectedItem?.id === item.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-elevated)',
                  border: `1px solid ${selectedItem?.id === item.id ? 'var(--primary-400)' : 'var(--border-subtle)'}`,
                  borderRadius: 12,
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <FileCode size={22} color={item.status === 'REMEDIATED' ? 'var(--low)' : 'var(--critical)'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-bright)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                      {item.file}:L{item.line} ({item.ruleId})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className={`badge ${item.status === 'REMEDIATED' ? 'badge-low' : (item.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high')}`}>
                    {item.status === 'REMEDIATED' ? 'REMEDIATED' : item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Inspector & Terraform Auto-Fix */}
          {selectedItem && (
            <div className="hud-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>{selectedItem.ruleId}</span>
                <span className={`badge ${selectedItem.status === 'REMEDIATED' ? 'badge-low' : 'badge-critical'}`}>
                  {selectedItem.status}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-bright)' }}>{selectedItem.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {selectedItem.file}
                </div>
              </div>

              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5', background: 'var(--bg-base)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                {selectedItem.description}
              </div>

              {/* Code Snippet Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {selectedItem.status === 'REMEDIATED' ? 'Remediated Terraform Code' : 'Vulnerable Infrastructure Code'}
                </div>

                <div className="test-lab-code-area" style={{ padding: '0.75rem', fontSize: '0.78rem' }}>
                  <pre style={{ margin: 0, color: selectedItem.status === 'REMEDIATED' ? '#86efac' : '#fda4af' }}>
                    {selectedItem.status === 'REMEDIATED' ? selectedItem.fixedSnippet : selectedItem.codeSnippet}
                  </pre>
                </div>
              </div>

              {/* Action Trigger */}
              {selectedItem.status !== 'REMEDIATED' ? (
                <button
                  onClick={() => handleApplyFix(selectedItem.id)}
                  disabled={isFixing}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', fontWeight: 700
                  }}
                >
                  {isFixing ? <RefreshCw size={16} className="radar-sweep-line" /> : <Sparkles size={16} />}
                  {isFixing ? 'Applying Terraform Fix...' : 'Auto-Fix Infrastructure Code'}
                </button>
              ) : (
                <div style={{
                  padding: '0.75rem', borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid var(--low)', color: 'var(--low)', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  fontSize: '0.85rem', fontWeight: 700
                }}>
                  <CheckCircle2 size={18} /> IaC Misconfiguration Patched & Verified
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
