import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'white'
  className?: string
  text?: string
  centered?: boolean
}

export interface LoadingOverlayProps extends LoadingSpinnerProps {
  show: boolean
  children?: React.ReactNode
}

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text,
  centered = false
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    default: 'text-gray-600',
    primary: 'text-primary-600',
    white: 'text-white'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const content = (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
        aria-hidden="true"
      />
      {text && (
        <span className={cn(
          'font-medium',
          textSizeClasses[size],
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  children,
  ...spinnerProps
}) => {
  if (!show) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children && (
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <LoadingSpinner {...spinnerProps} />
      </div>
    </div>
  )
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3'
  }

  const animationDelays = ['0ms', '150ms', '300ms']

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {animationDelays.map((delay, index) => (
        <div
          key={index}
          className={cn(
            'bg-gray-400 rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: delay,
            animationDuration: '1s',
            animationIterationCount: 'infinite'
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loading components
export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-12',
    circular: 'rounded-full'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={{
              width: index === lines - 1 ? '75%' : width,
              height
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// Card skeleton for loading states
const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('card p-6 space-y-4', className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton lines={3} />
      <div className="flex space-x-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  )
}

// Table skeleton for loading states
const TableSkeleton: React.FC<{ 
  rows?: number
  columns?: number
  className?: string 
}> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} width="100%" height={20} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="100%" height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}

LoadingSpinner.displayName = 'LoadingSpinner'
LoadingOverlay.displayName = 'LoadingOverlay'
LoadingDots.displayName = 'LoadingDots'
Skeleton.displayName = 'Skeleton'
CardSkeleton.displayName = 'CardSkeleton'
TableSkeleton.displayName = 'TableSkeleton'

export { 
  LoadingSpinner, 
  LoadingOverlay, 
  LoadingDots, 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton 
}
