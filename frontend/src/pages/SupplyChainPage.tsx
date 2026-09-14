import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi, findingsApi } from '../lib/api'
import {
  Boxes, ShieldAlert, CheckCircle2, AlertTriangle, FileCheck, Search, Filter, ShieldCheck, Download, FolderOpen, Upload
} from 'lucide-react'

interface DependencyItem {
  id: string
  name: string
  version: string
  ecosystem: 'npm' | 'maven' | 'pypi'
  license: string
  licenseRisk: 'SAFE' | 'COPYLEFT_HIGH'
  cve?: string
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  status: 'Vulnerable' | 'Secure'
  directDep: boolean
}

const DEMO_DEPENDENCIES: DependencyItem[] = [
  {
    id: 'dep-1',
    name: 'org.apache.logging.log4j:log4j-core',
    version: '2.14.1',
    ecosystem: 'maven',
    license: 'Apache-2.0',
    licenseRisk: 'SAFE',
    cve: 'CVE-2021-44228 (Log4Shell)',
    severity: 'CRITICAL',
    status: 'Vulnerable',
    directDep: true
  },
  {
    id: 'dep-2',
    name: 'pyyaml',
    version: '5.3.1',
    ecosystem: 'pypi',
    license: 'MIT',
    licenseRisk: 'SAFE',
    cve: 'CVE-2020-14343 (Arbitrary Code Exec)',
    severity: 'HIGH',
    status: 'Vulnerable',
    directDep: true
  },
  {
    id: 'dep-3',
    name: 'gpl-util-library',
    version: '1.0.4',
    ecosystem: 'npm',
    license: 'GPL-3.0',
    licenseRisk: 'COPYLEFT_HIGH',
    status: 'Secure',
    directDep: false
  }
]

export default function SupplyChainPage() {
  const navigate = useNavigate()
  const [selectedProjectId, setSelectedProjectId] = useState<string>('SAMPLE')
  const [deps, setDeps] = useState<DependencyItem[]>(DEMO_DEPENDENCIES)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEco, setFilterEco] = useState<string>('ALL')

  // Fetch real projects from API
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

  // Update dependencies when project changes
  useEffect(() => {
    if (selectedProjectId === 'SAMPLE') {
      setDeps(DEMO_DEPENDENCIES)
    } else {
      const mapped = realFindings
        .filter((f: any) => f.category === 'DEPENDENCY' || f.ruleId?.includes('SCA') || f.filePath?.includes('pom.xml') || f.filePath?.includes('package.json') || f.filePath?.includes('requirements.txt'))
        .map((f: any, idx: number) => ({
          id: f.id || `dep-${idx}`,
          name: f.packageName || f.title || 'third-party-package',
          version: f.version || '1.0.0',
          ecosystem: (f.filePath?.includes('pom.xml') ? 'maven' : (f.filePath?.includes('requirements.txt') ? 'pypi' : 'npm')) as any,
          license: f.license || 'MIT',
          licenseRisk: f.license?.includes('GPL') ? 'COPYLEFT_HIGH' : 'SAFE',
          cve: f.cve || f.ruleId || 'CVE-2024-SCA',
          severity: f.severity || 'HIGH',
          status: (f.status === 'RESOLVED' ? 'Secure' : 'Vulnerable') as any,
          directDep: true
        }))
      setDeps(mapped)
    }
  }, [selectedProjectId, realFindings])

  const handleUpgrade = (id: string) => {
    setDeps(prev =>
      prev.map(item => item.id === id ? { ...item, status: 'Secure', cve: undefined, severity: undefined } : item)
    )
  }

  const filtered = deps.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.cve && d.cve.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesEco = filterEco === 'ALL' || d.ecosystem === filterEco
    return matchesSearch && matchesEco
  })

  const vulnCount = deps.filter(d => d.status === 'Vulnerable').length
  const copyleftCount = deps.filter(d => d.licenseRisk === 'COPYLEFT_HIGH').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header with Project Selector */}
      <div className="hud-panel cyber-glowing-border" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Boxes size={24} color="var(--info)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Software Supply Chain & SBOM Security (SCA)
              </h1>
              <span className="cyber-badge">
                {selectedProjectId === 'SAMPLE' ? 'TELEMETRY DEMO' : `PROJECT: ${selectedProjectObj?.name}`}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Automated Software Bill of Materials (SBOM) dependency graph and open-source license risk audit.
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

          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
            <Download size={14} /> Export CycloneDX SBOM
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="hud-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Tracked Dependencies</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)', marginTop: '0.2rem' }}>
            {deps.length} Libraries
          </div>
        </div>
        <div className="hud-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vulnerable Dependencies</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: vulnCount > 0 ? 'var(--critical)' : 'var(--low)', marginTop: '0.2rem' }}>
            {vulnCount} Vulnerable
          </div>
        </div>
        <div className="hud-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Copyleft License Risks</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: copyleftCount > 0 ? 'var(--high)' : 'var(--low)', marginTop: '0.2rem' }}>
            {copyleftCount} Flagged
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 10 }} />
          <input
            type="text"
            placeholder="Search packages or CVE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2rem', width: 260, fontSize: '0.82rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'npm', 'maven', 'pypi'].map(eco => (
            <button
              key={eco}
              onClick={() => setFilterEco(eco)}
              className={`btn ${filterEco === eco ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}
            >
              {eco.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dependency Table */}
      {selectedProjectId !== 'SAMPLE' && filtered.length === 0 ? (
        <div className="hud-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <CheckCircle2 size={48} color="var(--low)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-bright)' }}>
              No Vulnerable Dependencies Flagged for "{selectedProjectObj?.name}"
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: 480 }}>
              All third-party open-source packages in this project are verified clean and compliant!
            </p>
          </div>
          <button onClick={() => navigate(`/projects/${selectedProjectId}`)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))', color: '#000', fontWeight: 800, padding: '0.65rem 1.4rem' }}>
            <Upload size={16} style={{ marginRight: 6 }} /> Scan Dependencies
          </button>
        </div>
      ) : (
        <div className="hud-panel" style={{ padding: '1.25rem' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Ecosystem</th>
                <th>Version</th>
                <th>License</th>
                <th>Security Vulnerability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.directDep ? 'Direct Dependency' : 'Transitive Dependency'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                      {item.ecosystem}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{item.version}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: item.licenseRisk === 'COPYLEFT_HIGH' ? 'var(--high)' : 'var(--text-secondary)'
                    }}>
                      {item.license} {item.licenseRisk === 'COPYLEFT_HIGH' && '⚠️ (GPL Copyleft Risk)'}
                    </span>
                  </td>
                  <td>
                    {item.cve ? (
                      <span className={`badge ${item.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`} style={{ fontSize: '0.7rem' }}>
                        {item.cve}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--low)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={14} /> Clean / Verified
                      </span>
                    )}
                  </td>
                  <td>
                    {item.status === 'Vulnerable' ? (
                      <button
                        onClick={() => handleUpgrade(item.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      >
                        Upgrade Patch
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Up to date</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
