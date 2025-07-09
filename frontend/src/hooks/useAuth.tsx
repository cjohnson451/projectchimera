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
      // For MVP, we'll just check if token exists
      // In production, you'd validate the token with the backend
      setUser({
        id: 1,
        email: 'demo@fund.com',
        fund_name: 'Demo Fund'
      })
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // For MVP, we'll use demo user data
      setUser({
        id: 1,
        email,
        fund_name: 'Demo Fund'
      })
      
      toast.success('Login successful!')
    } catch (error) {
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
      
      setUser({
        id: 1,
        email,
        fund_name
      })
      
      toast.success('Registration successful!')
    } catch (error) {
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