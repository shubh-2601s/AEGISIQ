import axios from 'axios'

const BASE_URL = '/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auth token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegisiq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aegisiq_token')
      localStorage.removeItem('aegisiq_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ---- Auth ----
export const authApi = {
  register: (data: { name: string; email: string; password: string; organizationName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
}

// ---- Projects ----
export const projectsApi = {
  list: (page = 0, size = 20) => api.get('/projects', { params: { page, size } }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string }) => api.post('/projects', data),
  update: (id: string, data: { name: string; description?: string }) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// ---- Scans ----
export const scansApi = {
  list: (projectId: string, page = 0) =>
    api.get(`/projects/${projectId}/scans`, { params: { page } }),
  get: (projectId: string, scanId: string) =>
    api.get(`/projects/${projectId}/scans/${scanId}`),
  upload: (projectId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/projects/${projectId}/scans`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ---- Findings ----
export const findingsApi = {
  list: (projectId: string, params?: {
    severity?: string; status?: string; category?: string; page?: number; size?: number
  }) => api.get(`/projects/${projectId}/findings`, { params }),
  get: (projectId: string, findingId: string) =>
    api.get(`/projects/${projectId}/findings/${findingId}`),
  summary: (projectId: string) =>
    api.get(`/projects/${projectId}/findings/summary`),
  updateStatus: (projectId: string, findingId: string, status: string) =>
    api.patch(`/projects/${projectId}/findings/${findingId}/status`, null, { params: { status } }),
}
