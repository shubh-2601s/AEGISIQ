import React, { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../lib/api'

interface AuthUser {
  userId: string
  email: string
  name: string
  role: string
  organizationId: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, orgName?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('aegisiq_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('aegisiq_token')
  )

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    const data = res.data
    setToken(data.token)
    setUser({ userId: data.userId, email: data.email, name: data.name, role: data.role, organizationId: data.organizationId })
    localStorage.setItem('aegisiq_token', data.token)
    localStorage.setItem('aegisiq_user', JSON.stringify(data))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, orgName?: string) => {
    const res = await authApi.register({ name, email, password, organizationName: orgName })
    const data = res.data
    setToken(data.token)
    setUser({ userId: data.userId, email: data.email, name: data.name, role: data.role, organizationId: data.organizationId })
    localStorage.setItem('aegisiq_token', data.token)
    localStorage.setItem('aegisiq_user', JSON.stringify(data))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('aegisiq_token')
    localStorage.removeItem('aegisiq_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
