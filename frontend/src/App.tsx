import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import AttackWarRoomPage from './pages/AttackWarRoomPage'
import TestLabPage from './pages/TestLabPage'
import ThreatRadarPage from './pages/ThreatRadarPage'
import FindingsPage from './pages/FindingsPage'
import ScansPage from './pages/ScansPage'
import CloudPosturePage from './pages/CloudPosturePage'
import SupplyChainPage from './pages/SupplyChainPage'
import ApiSurfacePage from './pages/ApiSurfacePage'
import AiGuardrailsPage from './pages/AiGuardrailsPage'
import CompliancePage from './pages/CompliancePage'
import PlaybooksPage from './pages/PlaybooksPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppShell><DashboardPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <AppShell><ProjectsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <AppShell><ProjectDetailPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/warroom" element={
        <ProtectedRoute>
          <AppShell><AttackWarRoomPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/test-lab" element={
        <ProtectedRoute>
          <AppShell><TestLabPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/threat-radar" element={
        <ProtectedRoute>
          <AppShell><ThreatRadarPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/cloud-posture" element={
        <ProtectedRoute>
          <AppShell><CloudPosturePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/supply-chain" element={
        <ProtectedRoute>
          <AppShell><SupplyChainPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/api-surface" element={
        <ProtectedRoute>
          <AppShell><ApiSurfacePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/ai-guardrails" element={
        <ProtectedRoute>
          <AppShell><AiGuardrailsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/compliance" element={
        <ProtectedRoute>
          <AppShell><CompliancePage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/playbooks" element={
        <ProtectedRoute>
          <AppShell><PlaybooksPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/findings" element={
        <ProtectedRoute>
          <AppShell><FindingsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/scans" element={
        <ProtectedRoute>
          <AppShell><ScansPage /></AppShell>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
