import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Shield, Zap, Cpu, GitBranch, ArrowRight, CheckCircle2,
  Lock, Terminal, Play, Server, Layers, ChevronDown,
  Sparkles, RefreshCw, FileText, Activity, Compass
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'stream' | 'sast' | 'graph' | 'ai'>('sast')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleLaunch = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Sticky Navigation Header */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-blue)'
          }}>
            <Shield size={22} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="glow-gradient-text">
              AegisIQ
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              SECURITY INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Features</a>
          <a href="#demo" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Live Demo</a>
          <a href="#architecture" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Architecture</a>
          <a href="#faq" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>FAQ</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={handleLaunch}>
              <Activity size={16} />
              Go to SOC Dashboard ({user?.name})
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Get Started
                <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-grid-bg" style={{
        position: 'relative',
        padding: '5rem 2rem 4rem',
        maxWidth: 1200,
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Pulsing Status Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 1rem', borderRadius: 100,
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-400)',
          marginBottom: '1.75rem'
        }} className="pulse-cyan-glow">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-400)' }} />
          Zero-Execution Security Intelligence Platform · Version 2.4.0
        </div>

        {/* Dynamic Headline */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: 900,
          marginBottom: '1.25rem'
        }}>
          Autonomous Security Intelligence Powered by <span className="glow-gradient-text">Deterministic SAST &amp; AI Reasoning</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: 720,
          lineHeight: 1.6,
          marginBottom: '2.5rem'
        }}>
          AegisIQ processes code archives entirely in-memory with zero disk persistence, correlates findings onto relational attack graphs, and delivers context-grounded AI remediations.
        </p>

        {/* Hero Action CTAs */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }} onClick={handleLaunch}>
            <Zap size={18} />
            {isAuthenticated ? 'Open SOC Dashboard' : 'Launch Platform Free'}
          </button>

          <a href="#demo" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}>
            <Play size={16} />
            Explore Live Playground
          </a>
        </div>

        {/* Live Key Metrics Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem',
          width: '100%', maxWidth: 900, background: 'var(--bg-glass)',
          border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem', backdropFilter: 'blur(12px)'
        }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-400)', fontFamily: 'var(--font-mono)' }}>100%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deterministic Engine</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-400)', fontFamily: 'var(--font-mono)' }}>0 Bytes</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disk Persistence</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>&lt; 500ms</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scan Latency</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--info)', fontFamily: 'var(--font-mono)' }}>0</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Hallucinated Vulnerabilities</div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Playground Section */}
      <section id="demo" style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            Interactive Technology Preview
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Experience the AegisIQ Security Pipeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Click the stages below to test how in-memory detection, attack graphing, and AI patch generation interact.
          </p>
        </div>

        {/* Interactive Demo Container */}
        <div className="interactive-demo-card">
          {/* Tab Headers */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('stream')}
              style={{
                padding: '1rem 1.5rem', background: activeTab === 'stream' ? 'var(--bg-card)' : 'transparent',
                border: 'none', borderBottom: activeTab === 'stream' ? '2px solid var(--accent-400)' : '2px solid transparent',
                color: activeTab === 'stream' ? 'var(--accent-400)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Cpu size={16} /> 1. Archive Stream Ingestion
            </button>
            <button
              onClick={() => setActiveTab('sast')}
              style={{
                padding: '1rem 1.5rem', background: activeTab === 'sast' ? 'var(--bg-card)' : 'transparent',
                border: 'none', borderBottom: activeTab === 'sast' ? '2px solid var(--accent-400)' : '2px solid transparent',
                color: activeTab === 'sast' ? 'var(--accent-400)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Terminal size={16} /> 2. Deterministic SAST Engine
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              style={{
                padding: '1rem 1.5rem', background: activeTab === 'graph' ? 'var(--bg-card)' : 'transparent',
                border: 'none', borderBottom: activeTab === 'graph' ? '2px solid var(--accent-400)' : '2px solid transparent',
                color: activeTab === 'graph' ? 'var(--accent-400)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <GitBranch size={16} /> 3. Relational Attack Graph
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              style={{
                padding: '1rem 1.5rem', background: activeTab === 'ai' ? 'var(--bg-card)' : 'transparent',
                border: 'none', borderBottom: activeTab === 'ai' ? '2px solid var(--accent-400)' : '2px solid transparent',
                color: activeTab === 'ai' ? 'var(--accent-400)' : 'var(--text-muted)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Sparkles size={16} /> 4. AI Patch &amp; Remediation
            </button>
          </div>

          {/* Tab Content Panels */}
          <div style={{ padding: '2rem' }}>
            {activeTab === 'stream' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.1rem' }}>
                    Zero-Execution ZipInputStream Stream Buffer
                  </div>
                  <span className="badge badge-low">ADR-007 Enforced</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Untrusted code archives are streamed into volatile RAM using Java 21 bounded buffers. Path normalization blocks Zip Slip (`../`), and zero bytes are written to disk.
                </p>
                <div className="code-snippet">
{`[IN-MEMORY INGESTION BUFFER]
> Ingesting repository.zip (1,147 KB)
> Canonicalizing ZIP entry paths...
> Scannable extensions identified: [.py, .java, .tsx, .env]
> Memory usage: 4.2MB RAM (0% disk footprint)
> Sandboxed execution check: PASSED (Zero-Execution Policy Active)`}
                </div>
              </div>
            )}

            {activeTab === 'sast' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.1rem' }}>
                    Pattern-Based Static Analysis Output
                  </div>
                  <span className="badge badge-critical">1 Critical Finding</span>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: '#fb7185' }}>SEC-001: Hardcoded AWS Access Key</span>
                      <span className="badge badge-critical">Risk Score: 10.0</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Location: deepfake detector/app.py:11
                    </div>
                    <div className="code-snippet" style={{ marginTop: '0.5rem', background: 'rgba(244,63,94,0.06)' }}>
{`10: # AWS Cloud Client Config
11: AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE_SECRET_TOKEN"  <-- CRITICAL PATTERN MATCH`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.1rem' }}>
                    Relational Security &amp; Attack Path Topology
                  </div>
                  <span className="badge badge-high">Path Reachable</span>
                </div>
                <div style={{
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem'
                }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <Server size={20} style={{ color: 'var(--accent-400)', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Public Internet</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>0.0.0.0/0</div>
                  </div>
                  <ArrowRight size={20} style={{ color: 'var(--primary-400)' }} />
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <GitBranch size={20} style={{ color: 'var(--primary-400)', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>POST /api/v1/auth/login</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Unauthenticated Endpoint</div>
                  </div>
                  <ArrowRight size={20} style={{ color: 'var(--critical)' }} />
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: 'rgba(244,63,94,0.15)', borderRadius: 8, border: '1px solid rgba(244,63,94,0.3)' }}>
                    <Shield size={20} style={{ color: '#fb7185', marginBottom: '0.25rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185' }}>Hardcoded Secrets</div>
                    <div style={{ fontSize: '0.65rem', color: '#fb7185' }}>Risk Score: 10.0</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: '1.1rem' }}>
                    FastAPI AI Security Analyst — Remediation Proposal
                  </div>
                  <span className="badge badge-low">Human Approval Required</span>
                </div>
                <div className="code-snippet" style={{ marginBottom: '1rem' }}>
                  <div className="diff-remove">- 11: AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE_SECRET_TOKEN"</div>
                  <div className="diff-add">+ 11: AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")</div>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  🤖 <strong>AI Explanation:</strong> Hardcoded credentials in source code allow anyone with repository read access to escalate privileges to AWS S3 storage buckets. The patch retrieves secrets securely from environment variables at runtime.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            Enterprise Security Capabilities
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Engineered for High-Trust Security Operations
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(59,130,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)',
              marginBottom: '1rem', border: '1px solid var(--border-default)'
            }}>
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Zero-Execution In-Memory SAST
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Scans repository archives in RAM using Java 21 streams. Bounded execution buffers eliminate Zip Slip traversal and prevent malicious build scripts from executing on your servers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(6,182,212,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-400)',
              marginBottom: '1rem', border: '1px solid rgba(6,182,212,0.3)'
            }}>
              <GitBranch size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Relational Attack Path Graph
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Maps dependencies and endpoint exposures into topological attack trees. Distinguish between internal code smells and publicly reachable, exploitable zero-days.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(167,139,250,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)',
              marginBottom: '1rem', border: '1px solid rgba(167,139,250,0.3)'
            }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Context-Grounded AI Analyst
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              FastAPI microservice trained on strict prompt-injection defenses (ADR-006). Delivers grounded root-cause explanations and automated PR code diff proposals.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(234,179,8,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medium)',
              marginBottom: '1rem', border: '1px solid rgba(234,179,8,0.3)'
            }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Multi-Factor Risk Engine
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Replaces static alert counts with objective, severity-weighted composite risk scores (`0.0 - 10.0`) so security teams triage high-impact risks first.
            </p>
          </div>

          {/* Card 5 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--low)',
              marginBottom: '1rem', border: '1px solid rgba(34,197,94,0.3)'
            }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Human-in-the-Loop Approval
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              AI never modifies repositories without analyst verification. Review proposed code patches, approve state changes, and trigger automated re-scan verification.
            </p>
          </div>

          {/* Card 6 */}
          <div className="feature-glow-card">
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'rgba(244,63,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--critical)',
              marginBottom: '1rem', border: '1px solid rgba(244,63,94,0.3)'
            }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
              Modular Monolith Architecture
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Java 21 Spring Boot + Supabase PostgreSQL managed pooler (ADR-001). High operational simplicity, zero microservice sprawl, and strict organization multi-tenancy.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Flow Section */}
      <section id="architecture" style={{ padding: '4rem 2rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
            System Data Flow
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)', marginBottom: '2.5rem' }}>
            From Ingestion to Automated Remediation
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-400)', marginBottom: '0.5rem' }}>STEP 1</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Zip Stream Ingestion</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                In-memory byte buffer validation &amp; Zip Slip check.
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-400)', marginBottom: '0.5rem' }}>STEP 2</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Pattern SAST Engine</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Deterministic AST scanning for SQLi, XSS, &amp; Credentials.
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--info)', marginBottom: '0.5rem' }}>STEP 3</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Supabase Persistence</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Persists structured findings &amp; updates composite risk scores.
              </div>
            </div>

            <div className="card" style={{ textAlign: 'left', position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--low)', marginBottom: '0.5rem' }}>STEP 4</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>AI Patch Proposal</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                FastAPI microservice generates verifiable remediation code diffs.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" style={{ padding: '4rem 2rem', maxWidth: 850, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-bright)' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: "Are my uploaded .zip source files saved anywhere?",
              a: "No. Uploaded archives are streamed directly in RAM using Java 21 ZipInputStream buffers. Once pattern matching completes, the memory buffer is immediately released to the Garbage Collector. Zero bytes are written to server disk or database."
            },
            {
              q: "How does AegisIQ prevent AI hallucinations?",
              a: "By enforcing Architecture Decision Record ADR-004 ('Deterministic Security Engines are Authoritative'). The AI model is never asked whether a bug exists. Detection is 100% rule-matched by Spring Boot; the AI service receives validated JSON payloads strictly for explanation and patch generation."
            },
            {
              q: "What file types and programming languages are supported?",
              a: "AegisIQ scans Java (.java), TypeScript/JavaScript (.ts, .js, .tsx, .jsx), Python (.py), Go (.go), Ruby (.rb), C/C++ (.c, .cpp), PHP (.php), Kotlin (.kt), Rust (.rs), as well as configuration files (.env, .properties, .yaml, .json)."
            },
            {
              q: "How is the Risk Score calculated?",
              a: "Each finding receives a severity weight (Critical: 10.0, High: 7.5, Medium: 5.0, Low: 2.5). The project risk score evaluates active OPEN vulnerabilities to compute the composite maximum risk level across your topology."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-bright)' }}>
                <span>{item.q}</span>
                <ChevronDown size={18} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
              </div>
              {openFaq === idx && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }} className="fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)',
        padding: '3rem 2rem 2rem', marginTop: '4rem'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <Shield size={20} style={{ color: 'var(--primary-400)' }} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-bright)' }}>AegisIQ</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.5 }}>
              Unified AI-Powered Security Intelligence Platform with Zero-Execution SAST &amp; Relational Attack Graphs.
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Architecture Decision Records
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span>ADR-001 Modular Monolith</span>
              <span>ADR-004 Deterministic Security</span>
              <span>ADR-005 Relational Attack Graph</span>
              <span>ADR-007 Safe Repo Processing</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Platform Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--low)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--low)' }} />
              Supabase PostgreSQL Pooler Active
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--low)', marginTop: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--low)' }} />
              Spring Boot Backend 8080 Active
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          © 2026 AegisIQ Security Systems. All rights reserved. Zero-Execution &amp; In-Memory Scanner Policy Active.
        </div>
      </footer>
    </div>
  )
}
