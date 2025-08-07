import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bell
} from 'lucide-react'
import Button from './Button'

export interface ToastProps {
  id: string
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'bull' | 'bear' | 'neutral'
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showCloseButton?: boolean
  icon?: React.ReactNode
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
  className?: string
}

// Toast context for managing toasts globally
interface ToastContextValue {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

// Toast component
const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  persistent = false,
  action,
  onClose,
  showCloseButton = true,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, persistent])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose?.()
    }, 300) // Match animation duration
  }

  const getIcon = () => {
    if (icon) return icon

    const iconMap = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      bull: <TrendingUp className="w-5 h-5" />,
      bear: <TrendingDown className="w-5 h-5" />,
      neutral: <DollarSign className="w-5 h-5" />,
    }

    return iconMap[type]
  }

  const getTypeClasses = () => {
    const typeClasses = {
      success: 'bg-bull-50 border-bull-200 text-bull-800',
      error: 'bg-bear-50 border-bear-200 text-bear-800',
      warning: 'bg-risk-50 border-risk-200 text-risk-800',
      info: 'bg-primary-50 border-primary-200 text-primary-800',
      bull: 'bg-bull-50 border-bull-200 text-bull-800',
      bear: 'bg-bear-50 border-bear-200 text-bear-800',
      neutral: 'bg-neutral-50 border-neutral-200 text-neutral-800',
    }

    return typeClasses[type]
  }

  const getIconColor = () => {
    const iconColors = {
      success: 'text-bull-500',
      error: 'text-bear-500',
      warning: 'text-risk-500',
      info: 'text-primary-500',
      bull: 'text-bull-500',
      bear: 'text-bear-500',
      neutral: 'text-neutral-500',
    }

    return iconColors[type]
  }

  return (
    <div
      className={clsx(
        'toast-item relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out',
        getTypeClasses(),
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className={clsx('flex-shrink-0 mt-0.5', getIconColor())}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1">
            {title}
          </div>
        )}
        <div className="text-sm">
          {message}
        </div>
        {action && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className={clsx(
                'text-xs px-2 py-1 h-auto',
                type === 'success' && 'text-bull-700 hover:bg-bull-100',
                type === 'error' && 'text-bear-700 hover:bg-bear-100',
                type === 'warning' && 'text-risk-700 hover:bg-risk-100',
                type === 'info' && 'text-primary-700 hover:bg-primary-100',
                type === 'bull' && 'text-bull-700 hover:bg-bull-100',
                type === 'bear' && 'text-bear-700 hover:bg-bear-100',
                type === 'neutral' && 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {/* Close button */}
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className={clsx(
            'flex-shrink-0 -mr-1 -mt-1 p-1 h-auto',
            type === 'success' && 'text-bull-500 hover:bg-bull-100',
            type === 'error' && 'text-bear-500 hover:bg-bear-100',
            type === 'warning' && 'text-risk-500 hover:bg-risk-100',
            type === 'info' && 'text-primary-500 hover:bg-primary-100',
            type === 'bull' && 'text-bull-500 hover:bg-bull-100',
            type === 'bear' && 'text-bear-500 hover:bg-bear-100',
            type === 'neutral' && 'text-neutral-500 hover:bg-neutral-100'
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* Progress bar for timed toasts */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-bull-500',
              type === 'error' && 'bg-bear-500',
              type === 'warning' && 'bg-risk-500',
              type === 'info' && 'bg-primary-500',
              type === 'bull' && 'bg-bull-500',
              type === 'bear' && 'bg-bear-500',
              type === 'neutral' && 'bg-neutral-500'
            )}
            style={{
              width: '100%',
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast container component
const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  className,
}) => {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error('ToastContainer must be used within a ToastProvider')
  }

  const { toasts, removeToast } = context

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  }

  const visibleToasts = toasts.slice(0, maxToasts)

  if (visibleToasts.length === 0) return null

  return createPortal(
    <div
      className={clsx(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position],
        className
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>,
    document.body
  )
}

// Toast provider component
interface ToastProviderProps {
  children: React.ReactNode
  defaultPosition?: ToastContainerProps['position']
  maxToasts?: number
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastProps = { ...toast, id }
    
    setToasts(prev => [newToast, ...prev])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearToasts = () => {
    setToasts([])
  }

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={defaultPosition} maxToasts={maxToasts} />
    </ToastContext.Provider>
  )
}

// Hook for using toasts
export const useToast = () => {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast, removeToast, clearToasts } = context

  // Convenience methods for different toast types
  const toast = {
    success: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'success' }),
    
    error: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'error' }),
    
    warning: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'warning' }),
    
    info: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'info' }),
    
    bull: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'bull' }),
    
    bear: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'bear' }),
    
    neutral: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'type' | 'message'>>) =>
      addToast({ ...options, message, type: 'neutral' }),

    // Financial-specific toast methods
    priceAlert: (ticker: string, price: number, change: number) => {
      const isPositive = change >= 0
      return addToast({
        title: `${ticker} Price Alert`,
        message: `$${price.toFixed(2)} (${isPositive ? '+' : ''}${change.toFixed(2)}%)`,
        type: isPositive ? 'bull' : 'bear',
        icon: isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
        duration: 8000,
      })
    },

    memoUpdate: (ticker: string, status: 'approved' | 'rejected' | 'generated') => {
      const statusConfig = {
        approved: { type: 'success' as const, message: 'Investment memo approved' },
        rejected: { type: 'error' as const, message: 'Investment memo rejected' },
        generated: { type: 'info' as const, message: 'Investment memo generated' },
      }
      
      const config = statusConfig[status]
      return addToast({
        title: `${ticker} Memo ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: config.message,
        type: config.type,
        duration: 6000,
      })
    },

    notification: (title: string, message: string) =>
      addToast({
        title,
        message,
        type: 'info',
        icon: <Bell className="w-5 h-5" />,
        duration: 7000,
      }),
  }

  return {
    toast,
    addToast,
    removeToast,
    clearToasts,
  }
}

// Integration with react-hot-toast for backward compatibility
export const createToastIntegration = () => {
  let toastContext: ToastContextValue | null = null

  const setToastContext = (context: ToastContextValue) => {
    toastContext = context
  }

  const hotToastIntegration = {
    success: (message: string) => toastContext?.addToast({ message, type: 'success' }),
    error: (message: string) => toastContext?.addToast({ message, type: 'error' }),
    loading: (message: string) => toastContext?.addToast({ message, type: 'info', persistent: true }),
    dismiss: (id?: string) => id ? toastContext?.removeToast(id) : toastContext?.clearToasts(),
  }

  return { setToastContext, hotToastIntegration }
}

Toast.displayName = 'Toast'
ToastContainer.displayName = 'ToastContainer'
ToastProvider.displayName = 'ToastProvider'

export { Toast, ToastContainer }
export default Toast
