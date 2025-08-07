import React, { ReactNode, useState } from 'react'
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
  ChevronRight as ChevronRightIcon
} from 'lucide-react'
import { clsx } from 'clsx'
import Button from './ui/Button'
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

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ name: 'Dashboard', href: '/' }]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Find the navigation item for this path
      const allItems = navigationSections.flatMap(section => section.items)
      const navItem = allItems.find(item => item.href === currentPath)
      
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath })
      } else {
        // Fallback for dynamic routes
        const formattedName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        breadcrumbs.push({ name: formattedName, href: currentPath })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const toggleSectionCollapse = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results or trigger search
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  // Mobile sidebar component
  const MobileSidebar = () => (
    <div className={clsx(
      'fixed inset-0 z-50 lg:hidden',
      sidebarOpen ? 'block' : 'hidden'
    )}>
      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white shadow-2xl">
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-neutral-900">Project Chimera</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.name}>
                <h3 className="nav-section-title">{section.name}</h3>
                <div className="nav-section">
                  {section.items.map((item) => {
                    const isActive = isActiveRoute(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={clsx(
                          'nav-link',
                          isActive ? 'nav-link-active' : 'nav-link-inactive'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="badge badge-primary text-xs">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Mobile user section */}
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {user?.fund_name}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
              fullWidth
              className="justify-start"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Desktop sidebar component
  const DesktopSidebar = () => (
    <div className={clsx(
      'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300',
      sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
    )}>
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-neutral-200">
        {/* Desktop header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-neutral-900">Project Chimera</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="flex flex-1 flex-col px-4">
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.name}>
                {!sidebarCollapsed && (
                  <button
                    onClick={() => toggleSectionCollapse(section.name)}
                    className="nav-section-title w-full flex items-center justify-between hover:text-neutral-700 transition-colors"
                  >
                    <span>{section.name}</span>
                    <ChevronRightIcon className={clsx(
                      'w-3 h-3 transition-transform',
                      collapsedSections[section.name] ? '' : 'rotate-90'
                    )} />
                  </button>
                )}
                <div className={clsx(
                  'nav-section',
                  sidebarCollapsed ? '' : collapsedSections[section.name] ? 'hidden' : ''
                )}>
                  {section.items.map((item) => {
                    const isActive = isActiveRoute(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={clsx(
                          'nav-link group relative',
                          isActive ? 'nav-link-active' : 'nav-link-inactive',
                          sidebarCollapsed && 'justify-center'
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <item.icon className="w-5 h-5" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <span className="badge badge-primary text-xs">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {sidebarCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Desktop user section */}
        {!sidebarCollapsed && (
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user?.fund_name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
              fullWidth
              className="justify-start"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <MobileSidebar />
      <DesktopSidebar />

      {/* Main content */}
      <div className={clsx(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Breadcrumbs */}
              <nav className="hidden sm:flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    {index > 0 && (
                      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
                    )}
                    <Link
                      to={crumb.href}
                      className={clsx(
                        'hover:text-primary-600 transition-colors',
                        index === breadcrumbs.length - 1
                          ? 'text-neutral-900 font-medium'
                          : 'text-neutral-500'
                      )}
                    >
                      {crumb.name}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Center section - Search */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search memos, stocks, reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 pr-4 py-2 w-full text-sm"
                />
              </form>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2"
                onClick={() => {/* Handle notifications */}}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-bear-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>

              {/* Help */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => {/* Handle help */}}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* User menu */}
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-neutral-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.fund_name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user?.email}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
