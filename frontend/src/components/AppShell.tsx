import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, FolderOpen, ShieldAlert, Activity,
  Shield, LogOut, User
} from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={18} color="#fff" />
          </div>
          <span className="logo-text">AegisIQ</span>
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

          <span className="nav-section-label" style={{ marginTop: '0.5rem' }}>Security</span>

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
            marginBottom: '0.4rem'
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff'
            }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: '0.82rem', overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>

          <button className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none',
                                               cursor: 'pointer' }} onClick={handleLogout}>
            <LogOut size={16} className="nav-icon" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          AI-Powered Security Intelligence
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            padding: '0.3rem 0.75rem',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid var(--border-default)',
            borderRadius: 100,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--primary-400)',
            display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--low)',
                         animation: 'pulse-glow 2s infinite' }} />
            Engine Online
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
