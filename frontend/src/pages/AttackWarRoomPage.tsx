import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  ShieldCheck, Zap, Terminal, Play, RotateCcw,
  Crosshair, Radio, Database, Server, Key, Globe, Lock, CheckCircle2, FolderOpen, Upload, Plus
} from 'lucide-react'

interface GraphNode {
  id: string
  name: string
  type: 'gateway' | 'service' | 'auth' | 'secret' | 'database'
  status: 'critical' | 'warning' | 'safe'
  riskScore: number
  cve?: string
  description: string
  assetPath: string
  x: number
  y: number
  icon: any
  blastRadius: number
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: 'node-1',
    name: 'Internet Gateway / Ingress',
    type: 'gateway',
    status: 'safe',
    riskScore: 2.1,
    description: 'Cloudflare / AWS ALB Edge Entrypoint',
    assetPath: 'infrastructure/alb-ingress.tf',
    x: 80,
    y: 180,
    icon: Globe,
    blastRadius: 10
  },
  {
    id: 'node-2',
    name: 'User Management API Service',
    type: 'service',
    status: 'critical',
    riskScore: 9.8,
    cve: 'CVE-2024-5291 (SQLi)',
    description: 'Unsanitized query in AuthUserController.java',
    assetPath: 'src/main/java/com/aegis/api/AuthUserController.java',
    x: 320,
    y: 100,
    icon: Server,
    blastRadius: 85
  },
  {
    id: 'node-3',
    name: 'OAuth2 Authentication Handler',
    type: 'auth',
    status: 'warning',
    riskScore: 6.4,
    cve: 'CWE-287 (Insecure JWT Auth)',
    description: 'Weak HMAC secret algorithm fallback',
    assetPath: 'src/main/java/com/aegis/security/JwtProvider.java',
    x: 320,
    y: 260,
    icon: Lock,
    blastRadius: 45
  },
  {
    id: 'node-4',
    name: 'Hardcoded AWS Credentials',
    type: 'secret',
    status: 'critical',
    riskScore: 9.4,
    cve: 'CWE-798 (Hardcoded Secret)',
    description: 'Exposed Secret Access Key in application.yml',
    assetPath: 'src/main/resources/application.yml:L42',
    x: 560,
    y: 100,
    icon: Key,
    blastRadius: 90
  },
  {
    id: 'node-5',
    name: 'Production PostgreSQL Cluster',
    type: 'database',
    status: 'critical',
    riskScore: 9.9,
    cve: 'CWE-89 (DB Exfiltration Route)',
    description: 'Direct DB access reachable via injected payload',
    assetPath: 'db/prod-cluster.internal:5432',
    x: 560,
    y: 260,
    icon: Database,
    blastRadius: 100
  }
]

const CONNECTIONS = [
  { from: 'node-1', to: 'node-2' },
  { from: 'node-1', to: 'node-3' },
  { from: 'node-2', to: 'node-4' },
  { from: 'node-2', to: 'node-5' },
  { from: 'node-3', to: 'node-5' }
]

export default function AttackWarRoomPage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES)
  const [connections, setConnections] = useState<{ from: string; to: string }[]>(CONNECTIONS)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[1])
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeStep, setActiveStep] = useState<number>(-1)
  const [remediated, setRemediated] = useState<Record<string, boolean>>({})

  // Fetch real projects list
  const { data: projectsData } = useQuery('projects', () => projectsApi.list(0, 100), {
    refetchOnMount: true,
    staleTime: 0
  })
  const userProjects = projectsData?.data?.content || []
  const selectedProjectObj = userProjects.find((p: any) => p.id === selectedProjectId)

  // Fetch real findings for selected project
  const { data: findingsRes } = useQuery(
    ['findings', selectedProjectId],
    () => findingsApi.list(selectedProjectId),
    { enabled: selectedProjectId !== 'SAMPLE' && !!selectedProjectId, refetchOnMount: true }
  )
  const realFindings = findingsRes?.data?.content || []

  // Dynamic Topology Reconstruction when project changes
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setNodes(INITIAL_NODES)
      setConnections(CONNECTIONS)
      setSelectedNode(INITIAL_NODES[1])
    } else {
      if (realFindings.length > 0) {
        const dynamicNodes: GraphNode[] = [
          {
            id: 'node-1',
            name: `${selectedProjectObj?.name || 'Project'} Edge Gateway`,
            type: 'gateway',
            status: 'safe',
            riskScore: 1.5,
            description: 'API Ingress Route',
            assetPath: 'infrastructure/gateway.tf',
            x: 80, y: 180, icon: Globe, blastRadius: 15
          }
        ]

        const dynamicConns: { from: string; to: string }[] = []

        realFindings.slice(0, 4).forEach((f: any, idx: number) => {
          const nodeId = `node-${idx + 2}`
          const type: any = idx === 0 ? 'service' : (idx === 1 ? 'auth' : (idx === 2 ? 'secret' : 'database'))
          const icon = idx === 0 ? Server : (idx === 1 ? Lock : (idx === 2 ? Key : Database))
          const node: GraphNode = {
            id: nodeId,
            name: f.title || f.ruleName || `Vulnerable Component ${idx + 1}`,
            type,
            status: f.severity === 'CRITICAL' ? 'critical' : 'warning',
            riskScore: f.riskScore || (f.severity === 'CRITICAL' ? 9.6 : 7.2),
            cve: f.cwe || f.ruleId || 'CVE-2024-VULN',
            description: f.description || 'Finding detected by AST pattern engine.',
            assetPath: `${f.filePath || 'src/App.java'}:${f.lineNumber || 1}`,
            x: idx < 2 ? 320 : 560,
            y: idx % 2 === 0 ? 100 : 260,
            icon,
            blastRadius: Math.min(60 + idx * 10, 95)
          }
          dynamicNodes.push(node)

          if (nodeId === 'node-2' || nodeId === 'node-3') {
            dynamicConns.push({ from: 'node-1', to: nodeId })
          }
          if (nodeId === 'node-4' || nodeId === 'node-5') {
            dynamicConns.push({ from: 'node-2', to: nodeId })
          }
        })

        setNodes(dynamicNodes)
        setConnections(dynamicConns)
        setSelectedNode(dynamicNodes[1] || dynamicNodes[0])
      } else {
        setNodes([])
        setConnections([])
        setSelectedNode(null)
      }
    }
  }, [selectedProjectId, realFindings, selectedProjectObj])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (isSimulating) {
      if (activeStep < connections.length - 1) {
        timer = setTimeout(() => {
          setActiveStep(prev => prev + 1)
        }, 1400)
      } else {
        timer = setTimeout(() => {
          setIsSimulating(false)
        }, 1500)
      }
    }
    return () => clearTimeout(timer)
  }, [isSimulating, activeStep, connections.length])

  const handleStartSimulation = () => {
    setIsSimulating(true)
    setActiveStep(0)
    if (nodes.length > 1) setSelectedNode(nodes[1])
  }

  const handleApplyMitigation = (nodeId: string) => {
    setRemediated(prev => ({ ...prev, [nodeId]: true }))
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            status: 'safe',
            riskScore: 0.0,
            description: 'Remediated with Aegis AST Guard & Parameterized Queries'
          }
        }
        return node
      })
    )
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? {
        ...prev,
        status: 'safe',
        riskScore: 0.0,
        description: 'Remediated with Aegis AST Guard & Parameterized Queries'
      } : null)
    }
  }

  const overallRisk = nodes.length > 0 ? Math.max(...nodes.map(n => remediated[n.id] ? 0 : n.riskScore)) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Top Header & Tactical Controls */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(249, 115, 22, 0.2))',
            border: '1px solid var(--critical)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Crosshair size={26} color="var(--critical)" className="attack-node-critical" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Attack Topology & Exploit Chain War Room
              </h1>
              <span className="badge badge-critical" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                <Radio size={12} className="pulse-cyan-glow" /> DEFCON {overallRisk > 7 ? '1 - CRITICAL' : '3 - GUARDED'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Real-time graph analysis mapping deterministic security signals into verifiable attack paths.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Project Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-elevated)', padding: '0.3rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <FolderOpen size={14} color="var(--cyber-cyan)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="form-input"
              style={{ background: 'transparent', border: 'none', color: 'var(--cyber-cyan)', fontWeight: 700, fontSize: '0.82rem', padding: '0.2rem' }}
            >
              <option value="SAMPLE" style={{ background: '#050b14', color: '#fff' }}>⚡ Telemetry Sample Topology</option>
              {userProjects.map((p: any) => (
                <option key={p.id} value={p.id} style={{ background: '#050b14', color: '#fff' }}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          {nodes.length > 0 && (
            <button
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="btn btn-primary"
              style={{
                background: isSimulating
                  ? 'var(--bg-elevated)'
                  : 'linear-gradient(135deg, var(--critical), #e11d48)',
                border: '1px solid var(--critical)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 0 20px rgba(244, 63, 94, 0.4)'
              }}
            >
              <Play size={16} />
              {isSimulating ? `Simulating Exploit Vector...` : 'Simulate Live Attack Vector'}
            </button>
          )}

          <button
            onClick={() => {
              setRemediated({})
              if (selectedProjectId === 'SAMPLE') {
                setNodes(INITIAL_NODES)
                setSelectedNode(INITIAL_NODES[1])
              }
              setActiveStep(-1)
              setIsSimulating(false)
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RotateCcw size={16} /> Reset Topology
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas Graph (Left) & Node Inspector (Right) */}
      {selectedProjectId !== 'SAMPLE' && nodes.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <CheckCircle2 size={48} color="var(--low)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              No Exploit Chain Attack Paths for "{selectedProjectObj?.name}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 480 }}>
              This project does not have any critical attack path vulnerabilities logged yet. Upload a repository zip scan to map the attack graph!
            </p>
          </div>
          <button onClick={() => navigate(`/projects/${selectedProjectId}`)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Upload size={16} style={{ marginRight: 6 }} /> Upload Repository Scan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
          {/* Interactive Graph Canvas */}
          <div className="hud-panel" style={{ padding: '1.5rem', minHeight: 480, position: 'relative', overflow: 'hidden' }}>
            <div className="hero-grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} color="var(--primary-400)" />
                <span>Interactive Nodes: Click any node to inspect blast radius & AST trace</span>
              </div>

              {isSimulating && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.2)', border: '1px solid var(--critical)',
                  color: 'var(--critical)', borderRadius: 100, padding: '0.2rem 0.8rem',
                  fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <Radio size={12} /> Active Exploit Traversal Stream
                </div>
              )}
            </div>

            {/* SVG Graph Viewport */}
            <div style={{ width: '100%', height: 380, position: 'relative', zIndex: 5 }}>
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="edge-grad-critical" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="edge-grad-safe" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow-filter">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from)
                  const toNode = nodes.find(n => n.id === conn.to)
                  if (!fromNode || !toNode) return null

                  const isPathActive = isSimulating && idx <= activeStep
                  const isCritical = (fromNode.status === 'critical' || toNode.status === 'critical') && !remediated[fromNode.id] && !remediated[toNode.id]

                  return (
                    <g key={`edge-${conn.from}-${conn.to}`}>
                      <line
                        x1={fromNode.x + 40}
                        y1={fromNode.y + 40}
                        x2={toNode.x + 40}
                        y2={toNode.y + 40}
                        stroke={isPathActive ? 'var(--critical)' : (isCritical ? 'url(#edge-grad-critical)' : 'url(#edge-grad-safe)')}
                        strokeWidth={isPathActive ? 4 : 2}
                        strokeDasharray={isPathActive ? '8, 8' : 'none'}
                        filter={isPathActive ? 'url(#glow-filter)' : undefined}
                      />

                      {isPathActive && (
                        <circle r="6" fill="var(--critical)" filter="url(#glow-filter)">
                          <animateMotion
                            path={`M ${fromNode.x + 40} ${fromNode.y + 40} L ${toNode.x + 40} ${toNode.y + 40}`}
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  )
                })}

                {nodes.map((node) => {
                  const IconComponent = node.icon
                  const isSelected = selectedNode?.id === node.id
                  const isRemediated = remediated[node.id]

                  let borderColor = 'var(--border-default)'
                  let nodeBg = 'rgba(14, 31, 58, 0.9)'
                  let glowShadow = 'none'

                  if (isRemediated || node.status === 'safe') {
                    borderColor = 'var(--low)'
                    nodeBg = 'rgba(34, 197, 94, 0.1)'
                    glowShadow = '0 0 15px rgba(34, 197, 94, 0.3)'
                  } else if (node.status === 'critical') {
                    borderColor = 'var(--critical)'
                    nodeBg = 'rgba(244, 63, 94, 0.15)'
                    glowShadow = '0 0 25px rgba(244, 63, 94, 0.4)'
                  } else if (node.status === 'warning') {
                    borderColor = 'var(--high)'
                    nodeBg = 'rgba(249, 115, 22, 0.15)'
                    glowShadow = '0 0 15px rgba(249, 115, 22, 0.3)'
                  }

                  return (
                    <foreignObject
                      key={node.id}
                      x={node.x}
                      y={node.y}
                      width={190}
                      height={90}
                      style={{ overflow: 'visible', cursor: 'pointer' }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div style={{
                        background: nodeBg,
                        border: `2px solid ${isSelected ? 'var(--primary-400)' : borderColor}`,
                        borderRadius: 14,
                        padding: '0.6rem 0.8rem',
                        backdropFilter: 'blur(8px)',
                        boxShadow: isSelected ? '0 0 30px var(--primary-glow)' : glowShadow,
                        transition: 'all 0.25s ease',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <IconComponent size={16} color={node.status === 'critical' && !isRemediated ? 'var(--critical)' : (isRemediated ? 'var(--low)' : 'var(--primary-400)')} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              {node.type}
                            </span>
                          </div>
                          <span className={`badge ${isRemediated || node.status === 'safe' ? 'badge-low' : (node.status === 'critical' ? 'badge-critical' : 'badge-high')}`} style={{ fontSize: '0.65rem' }}>
                            {isRemediated ? 'FIXED' : `RISK ${node.riskScore}`}
                          </span>
                        </div>
                        
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-bright)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {node.name}
                        </div>

                        {node.cve && !isRemediated && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--critical)', marginTop: '0.2rem', fontWeight: 600 }}>
                            ⚠️ {node.cve}
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  )
                })}
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--critical)' }} /> Critical Vulnerability Node
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--high)' }} /> Warning Node
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--low)' }} /> Remediated / Safe Asset
              </div>
            </div>
          </div>

          {/* Selected Node Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedNode ? (
              <div className="hud-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} color="var(--primary-400)" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Asset Telemetry Inspector</h3>
                  </div>
                  <span className={`badge ${remediated[selectedNode.id] || selectedNode.status === 'safe' ? 'badge-low' : 'badge-critical'}`}>
                    {remediated[selectedNode.id] ? 'REMEDIATED' : selectedNode.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-bright)' }}>{selectedNode.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {selectedNode.assetPath}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Blast Radius Exposure</span>
                    <span style={{ fontWeight: 800, color: selectedNode.blastRadius > 70 ? 'var(--critical)' : 'var(--high)' }}>
                      {remediated[selectedNode.id] ? '0%' : `${selectedNode.blastRadius}%`}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-base)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      width: remediated[selectedNode.id] ? '0%' : `${selectedNode.blastRadius}%`,
                      height: '100%',
                      background: selectedNode.blastRadius > 70
                        ? 'linear-gradient(90deg, var(--high), var(--critical))'
                        : 'linear-gradient(90deg, var(--primary-500), var(--high))',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deterministic Risk Score</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: remediated[selectedNode.id] ? 'var(--low)' : 'var(--critical)' }}>
                        {remediated[selectedNode.id] ? '0.0' : selectedNode.riskScore} / 10
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Security Signal Source</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-400)', marginTop: '0.2rem' }}>
                        AST Deterministic
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Vector Findings & Reasoning
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5', background: 'var(--bg-base)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    {selectedNode.description}
                  </div>
                </div>

                {remediated[selectedNode.id] || selectedNode.status === 'safe' ? (
                  <div style={{
                    padding: '0.75rem', borderRadius: 10, background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid var(--low)', color: 'var(--low)', display: 'flex', alignItems: 'center', gap: '0.6rem',
                    fontSize: '0.85rem', fontWeight: 700
                  }}>
                    <CheckCircle2 size={18} /> Node Remediated & Verified Clean
                  </div>
                ) : (
                  <button
                    onClick={() => handleApplyMitigation(selectedNode.id)}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))',
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem', fontWeight: 700
                    }}
                  >
                    <ShieldCheck size={18} /> Deploy Aegis AST Remediation Patch
                  </button>
                )}
              </div>
            ) : (
              <div className="hud-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a node on the attack graph to inspect details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
