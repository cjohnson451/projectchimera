import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors - don't auto-redirect, let components handle it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log the error, don't auto-redirect
    if (error.response?.status === 401) {
      console.log('Unauthorized request - token may be invalid')
      // Don't automatically remove token or redirect
      // Let the useAuth hook handle token validation
    }
    return Promise.reject(error)
  }
)

export async function deleteMemo(memoId: number) {
  return api.delete(`/memos/${memoId}`)
}

export async function cleanupPendingMemos() {
  return api.post('/memos/cleanup-pending')
}

export async function deleteAccount() {
  return api.post('/auth/delete-account')
} 