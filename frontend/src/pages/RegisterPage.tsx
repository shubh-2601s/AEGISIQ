import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Password must include uppercase, lowercase, and a number.')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password, orgName || undefined)
      navigate('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 460 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Shield size={22} color="#fff" />
          </div>
          <span className="auth-logo-name">AegisIQ</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start securing your codebase with AI-powered intelligence</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Jane Smith"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Min. 8 chars, uppercase, digit"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="orgName">Organization name <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <input
              id="orgName"
              type="text"
              className="form-input"
              placeholder="Acme Security Team"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
            />
          </div>

          {error && (
            <div className="form-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
