import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
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
