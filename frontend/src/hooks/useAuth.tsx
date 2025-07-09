import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  fund_name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fund_name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token')
    
    if (token) {
      // Validate token with backend
      api.get('/auth/me')
        .then(response => {
          setUser(response.data)
        })
        .catch((error) => {
          console.log('Token validation failed, removing token')
          // Token is invalid, remove it
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user data from backend
      const userResponse = await api.get('/auth/me')
      setUser(userResponse.data)
      
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed. Please check your credentials.')
      throw error
    }
  }

  const register = async (email: string, password: string, fund_name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, fund_name })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user data from backend
      const userResponse = await api.get('/auth/me')
      setUser(userResponse.data)
      
      toast.success('Registration successful!')
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed. Please try again.')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 