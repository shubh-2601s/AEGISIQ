import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CyberBackground from './CyberBackground'
import {
  LayoutDashboard, FolderOpen, ShieldAlert, Activity,
  Shield, LogOut, Crosshair, Code2, Radio, Cloud, Boxes, Globe, Bot, Award, Zap, Terminal, Radio as RadioIcon
} from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* Dynamic Cyber Matrix Canvas */}
      <CyberBackground />

      <div className="app-shell cyber-scanline" style={{ position: 'relative', zIndex: 1, height: '100vh' }}>
        {/* Sidebar */}
      <aside className="sidebar" style={{ overflowY: 'auto', position: 'relative', zIndex: 10, background: 'rgba(5, 11, 20, 0.88)', backdropFilter: 'blur(16px)' }}>
        <div className="sidebar-logo">
          <div className="logo-icon pulse-cyan-glow" style={{ background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))' }}>
            <Shield size={18} color="#fff" />
          </div>
          <span className="logo-text" style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.4)' }}>AegisIQ SOC</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Platform</span>

          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} className="nav-icon" />
            Dashboard
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FolderOpen size={18} className="nav-icon" />
            Projects
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Intelligence & War Room</span>

          <NavLink to="/warroom" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Crosshair size={18} className="nav-icon" style={{ color: 'var(--critical)' }} />
            Attack War Room
          </NavLink>

          <NavLink to="/test-lab" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Code2 size={18} className="nav-icon" style={{ color: 'var(--accent-400)' }} />
            AI AST Test Lab
          </NavLink>

          <NavLink to="/threat-radar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Radio size={18} className="nav-icon" style={{ color: 'var(--primary-400)' }} />
            Threat Radar
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Cloud & Enterprise Modules</span>

          <NavLink to="/cloud-posture" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Cloud size={18} className="nav-icon" style={{ color: 'var(--accent-400)' }} />
            Cloud Posture (CSPM)
          </NavLink>

          <NavLink to="/supply-chain" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Boxes size={18} className="nav-icon" style={{ color: 'var(--info)' }} />
            Supply Chain & SBOM
          </NavLink>

          <NavLink to="/api-surface" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Globe size={18} className="nav-icon" style={{ color: 'var(--primary-400)' }} />
            API Security Surface
          </NavLink>

          <NavLink to="/ai-guardrails" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bot size={18} className="nav-icon" style={{ color: 'var(--critical)' }} />
            AI LLM Guardrails
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Governance & SOAR</span>

          <NavLink to="/compliance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Award size={18} className="nav-icon" style={{ color: 'var(--low)' }} />
            Compliance Benchmark
          </NavLink>

          <NavLink to="/playbooks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Zap size={18} className="nav-icon" style={{ color: 'var(--high)' }} />
            SOAR Response Playbooks
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Security Logs</span>

          <NavLink to="/findings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={18} className="nav-icon" />
            Findings
          </NavLink>

          <NavLink to="/scans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={18} className="nav-icon" />
            Scan History
          </NavLink>
        </nav>

        {/* User section at bottom */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
          <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 8, padding: '0.6rem 0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            marginBottom: '0.4rem', border: '1px solid rgba(0, 240, 255, 0.2)'
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cyber-cyan), var(--primary-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800, color: '#000'
            }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--cyber-cyan)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>

          <button className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={handleLogout}>
            <LogOut size={16} className="nav-icon" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Cyber Topbar Header with Ticker */}
      <header className="topbar" style={{ position: 'relative', zIndex: 10, background: 'rgba(5, 11, 20, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} className="cyber-ticker-text">
          <Terminal size={14} color="var(--cyber-cyan)" />
          <span>[SYSTEM_STATUS: AEGIS_SHIELD_ONLINE]</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>[THROUGHPUT: 82,400 AST TOKENS/SEC]</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ color: 'var(--cyber-green)' }}>[CYBER_DEFENSE: ACTIVE]</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="cyber-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyber-cyan)', animation: 'pulse-cyan 2s infinite' }} />
            DEFCON 1 MONITORING
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </main>
    </div>
  </div>
)
}
