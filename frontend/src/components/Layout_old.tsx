import React, { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  BarChart3, 
  List, 
  FileText, 
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Home,
  TrendingUp,
  PieChart,
  Settings,
  User,
  HelpCircle,
  Shield,
  Activity,
  Target,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react'
import { clsx } from 'clsx'
import Button from './ui/Button'
import { deleteAccount } from '../lib/api'
import toast from 'react-hot-toast'

interface LayoutProps {
  children: ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  description?: string
}

interface NavigationSection {
  name: string
  items: NavigationItem[]
  collapsible?: boolean
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount, setNotificationCount] = useState(3) // Mock notification count
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Navigation structure with sections
  const navigationSections: NavigationSection[] = [
    {
      name: 'Dashboard',
      items: [
        { name: 'Overview', href: '/', icon: Home, description: 'Main dashboard overview' },
        { name: 'Analytics', href: '/analytics', icon: Activity, description: 'Advanced analytics' },
      ]
    },
    {
      name: 'Analysis',
      items: [
        { name: 'Investment Memos', href: '/memos', icon: FileText, badge: 5, description: 'AI-generated investment analysis' },
        { name: 'Watchlist', href: '/watchlist', icon: List, description: 'Monitored securities' },
        { name: 'Portfolio', href: '/portfolio', icon: PieChart, description: 'Portfolio management' },
      ]
    },
    {
      name: 'Tools',
      items: [
        { name: 'Reports', href: '/reports', icon: BookOpen, description: 'Generate and manage reports' },
        { name: 'Risk Assessment', href: '/risk', icon: Shield, description: 'Risk analysis tools' },
      ]
    },
    {
      name: 'Settings',
      items: [
        { name: 'Preferences', href: '/settings', icon: Settings, description: 'User preferences' },
        { name: 'Account', href: '/account', icon: User, description: 'Account management' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Project Chimera</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Project Chimera</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm text-gray-700">{user?.fund_name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <LogOut size={16} />
                  Logout
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
                    try {
                      await deleteAccount();
                      toast.success('Account deleted');
                      logout();
                      window.location.href = '/login';
                    } catch (err) {
                      toast.error('Failed to delete account');
                    }
                  }}
                  className="flex items-center gap-x-2 text-sm text-danger-700 hover:text-danger-900 border border-danger-300 rounded px-2 py-1 ml-2"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 
