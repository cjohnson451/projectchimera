import React, { Component, ErrorInfo, ReactNode } from 'react'
import { clsx } from 'clsx'
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react'
import Button from './Button'
import Card, { CardHeader, CardBody, CardFooter } from './Card'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  showReportButton?: boolean
  onReport?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
  isolate?: boolean
  level?: 'page' | 'section' | 'component'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
  showDetails: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || []
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      )

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
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
        eventId: null,
        showDetails: false,
      })
    }, 100)
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReport = () => {
    const { onReport } = this.props
    const { error, errorInfo } = this.state

    if (onReport && error && errorInfo) {
      onReport(error, errorInfo)
    }
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }))
  }

  render() {
    const { 
      children, 
      fallback, 
      showDetails = false, 
      showReportButton = false,
      isolate = false,
      level = 'component'
    } = this.props
    const { hasError, error, errorInfo, eventId } = this.state

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Different layouts based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <Card className="text-center">
                <CardBody className="py-12">
                  <div className="w-16 h-16 mx-auto mb-6 text-bear-500">
                    <AlertTriangle className="w-full h-full" />
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                    Something went wrong
                  </h1>
                  <p className="text-neutral-600 mb-8">
                    We're sorry, but something unexpected happened. Our team has been notified.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={this.handleRetry}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      fullWidth
                    >
                      Try again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={this.handleGoHome}
                      leftIcon={<Home className="w-4 h-4" />}
                      fullWidth
                    >
                      Go to dashboard
                    </Button>
                  </div>
                  {(showDetails || showReportButton) && (
                    <div className="mt-8 pt-6 border-t border-neutral-200">
                      {showDetails && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.toggleDetails}
                          leftIcon={
                            this.state.showDetails ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          }
                        >
                          {this.state.showDetails ? 'Hide' : 'Show'} details
                        </Button>
                      )}
                      {showReportButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.handleReport}
                          leftIcon={<Bug className="w-4 h-4" />}
                          className="ml-2"
                        >
                          Report issue
                        </Button>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
              {this.state.showDetails && (
                <Card className="mt-4">
                  <CardHeader title="Error Details" />
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">
                          Error ID
                        </h4>
                        <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono">
                          {eventId}
                        </code>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-900 mb-2">
                          Error Message
                        </h4>
                        <code className="text-xs bg-bear-50 text-bear-800 px-2 py-1 rounded font-mono block">
                          {error.message}
                        </code>
                      </div>
                      {errorInfo && (
                        <div>
                          <h4 className="text-sm font-medium text-neutral-900 mb-2">
                            Component Stack
                          </h4>
                          <pre className="text-xs bg-neutral-100 p-3 rounded font-mono overflow-x-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )
      }

      if (level === 'section') {
        return (
          <Card className="border-bear-200 bg-bear-50">
            <CardBody className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 text-bear-500">
                <AlertTriangle className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Section Error
              </h3>
              <p className="text-neutral-600 mb-6">
                This section encountered an error and couldn't load properly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={this.handleRetry}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Retry
                </Button>
                {showReportButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleReport}
                    leftIcon={<Bug className="w-4 h-4" />}
                  >
                    Report
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        )
      }

      // Component level error (default)
      return (
        <div 
          className={clsx(
            'border border-bear-200 bg-bear-50 rounded-lg p-4',
            isolate && 'isolate'
          )}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-bear-500" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-bear-800 mb-1">
                Component Error
              </h4>
              <p className="text-sm text-bear-700 mb-3">
                This component encountered an error: {error.message}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                  className="text-bear-700 border-bear-300 hover:bg-bear-100"
                >
                  Retry
                </Button>
                {showDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    leftIcon={
                      this.state.showDetails ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    }
                    className="text-bear-700 hover:bg-bear-100"
                  >
                    Details
                  </Button>
                )}
              </div>
              {this.state.showDetails && (
                <div className="mt-4 pt-4 border-t border-bear-200">
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-bear-800 mb-1">
                        Error ID
                      </h5>
                      <code className="text-xs bg-white px-2 py-1 rounded font-mono">
                        {eventId}
                      </code>
                    </div>
                    {errorInfo && (
                      <div>
                        <h5 className="text-xs font-medium text-bear-800 mb-1">
                          Stack Trace
                        </h5>
                        <pre className="text-xs bg-white p-2 rounded font-mono overflow-x-auto max-h-32 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for error boundary functionality in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // In a real app, you might want to send this to an error reporting service
    console.error('Error caught by error handler:', error, errorInfo)
    
    // You could also trigger a toast notification here
    // toast.error(`An error occurred: ${error.message}`)
  }
}

ErrorBoundary.displayName = 'ErrorBoundary'

export default ErrorBoundary
