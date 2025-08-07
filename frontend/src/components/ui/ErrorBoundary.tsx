import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './Button'
import { Card, CardBody } from './Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Generate a unique event ID for this error
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      error,
      errorInfo,
      eventId
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to external error reporting service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack
    //       }
    //     }
    //   })
    // }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys?.[index] !== key
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      })
    }, 100)
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  copyErrorDetails = () => {
    const { error, errorInfo, eventId } = this.state
    const errorDetails = {
      eventId,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      errorInfo: {
        componentStack: errorInfo?.componentStack
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        // Could show a toast notification here
        console.log('Error details copied to clipboard')
      })
      .catch(err => {
        console.error('Failed to copy error details:', err)
      })
  }

  render() {
    const { hasError, error, errorInfo, eventId } = this.state
    const { children, fallback, showDetails = false } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-lg w-full">
            <CardBody className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-bear-100 p-3">
                  <AlertTriangle className="h-8 w-8 text-bear-600" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Something went wrong
                </h1>
                <p className="text-gray-600">
                  We're sorry, but something unexpected happened. Please try again.
                </p>
                {eventId && (
                  <p className="text-xs text-gray-500 font-mono">
                    Error ID: {eventId}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  leftIcon={<Home className="h-4 w-4" />}
                >
                  Go Home
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
              </div>

              {showDetails && error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2">
                    <Bug className="h-4 w-4" />
                    Show Error Details
                  </summary>
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="space-y-2">
                      <div>
                        <strong>Error:</strong> {error.name}
                      </div>
                      <div>
                        <strong>Message:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={this.copyErrorDetails}
                        className="text-xs"
                      >
                        Copy Error Details
                      </Button>
                    </div>
                  </div>
                </details>
              )}
            </CardBody>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Simple error boundary for specific components
export const SimpleErrorBoundary: React.FC<{
  children: ReactNode
  fallback?: ReactNode
  message?: string
}> = ({ children, fallback, message = 'Something went wrong' }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bear-100 mb-4">
              <AlertTriangle className="w-6 h-6 text-bear-600" />
            </div>
            <p className="text-gray-600">{message}</p>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Async error boundary for handling async errors
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode
  onError?: (error: Error) => void
}> = ({ children, onError }) => {
  const { captureError } = useErrorHandler()

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      captureError(new Error(event.reason))
      onError?.(new Error(event.reason))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [captureError, onError])

  return <>{children}</>
}

ErrorBoundary.displayName = 'ErrorBoundary'
SimpleErrorBoundary.displayName = 'SimpleErrorBoundary'
AsyncErrorBoundary.displayName = 'AsyncErrorBoundary'

export { ErrorBoundary }
