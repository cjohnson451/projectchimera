import React, { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring'
  color?: 'primary' | 'bull' | 'bear' | 'neutral' | 'white'
  text?: string
  overlay?: boolean
  fullScreen?: boolean
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (
    {
      size = 'md',
      variant = 'spinner',
      color = 'primary',
      text,
      overlay = false,
      fullScreen = false,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    }

    const colorClasses = {
      primary: 'text-primary-600',
      bull: 'text-bull-600',
      bear: 'text-bear-600',
      neutral: 'text-neutral-600',
      white: 'text-white',
    }

    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }

    const renderSpinner = () => {
      switch (variant) {
        case 'spinner':
          return (
            <div
              className={clsx(
                'loading-spinner border-2 border-current border-r-transparent',
                sizeClasses[size],
                colorClasses[color]
              )}
              role="status"
              aria-label="Loading"
            />
          )

        case 'dots':
          return (
            <div className={clsx('loading-dots', colorClasses[color])} role="status" aria-label="Loading">
              <div className={clsx('rounded-full', size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
              <div className={clsx('rounded-full', size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
              <div className={clsx('rounded-full', size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            </div>
          )

        case 'pulse':
          return (
            <div
              className={clsx(
                'rounded-full animate-pulse',
                sizeClasses[size],
                color === 'primary' && 'bg-primary-600',
                color === 'bull' && 'bg-bull-600',
                color === 'bear' && 'bg-bear-600',
                color === 'neutral' && 'bg-neutral-600',
                color === 'white' && 'bg-white'
              )}
              role="status"
              aria-label="Loading"
            />
          )

        case 'bars':
          return (
            <div className={clsx('flex items-end gap-1', colorClasses[color])} role="status" aria-label="Loading">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'bg-current animate-pulse',
                    size === 'xs' ? 'w-0.5 h-2' : size === 'sm' ? 'w-0.5 h-3' : size === 'md' ? 'w-1 h-4' : size === 'lg' ? 'w-1 h-5' : 'w-1.5 h-6'
                  )}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )

        case 'ring':
          return (
            <div
              className={clsx(
                'border-4 border-current border-t-transparent rounded-full animate-spin',
                sizeClasses[size],
                colorClasses[color]
              )}
              role="status"
              aria-label="Loading"
            />
          )

        default:
          return null
      }
    }

    const content = (
      <div
        ref={ref}
        className={clsx(
          'flex flex-col items-center justify-center gap-3',
          overlay && 'absolute inset-0 bg-white/80 backdrop-blur-sm z-50',
          fullScreen && 'fixed inset-0 bg-white/90 backdrop-blur-sm z-50',
          className
        )}
        {...props}
      >
        {renderSpinner()}
        {text && (
          <div className={clsx('font-medium', textSizeClasses[size], colorClasses[color])}>
            {text}
          </div>
        )}
        <span className="sr-only">Loading content, please wait...</span>
      </div>
    )

    return content
  }
)

// Skeleton loading component for content placeholders
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rectangular' | 'circular'
  animation?: 'pulse' | 'wave' | 'none'
  lines?: number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      width,
      height,
      variant = 'text',
      animation = 'pulse',
      lines = 1,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'bg-neutral-200'
    
    const variantClasses = {
      text: 'rounded',
      rectangular: 'rounded-lg',
      circular: 'rounded-full',
    }

    const animationClasses = {
      pulse: 'animate-pulse',
      wave: 'loading-shimmer',
      none: '',
    }

    const defaultSizes = {
      text: { width: '100%', height: '1rem' },
      rectangular: { width: '100%', height: '8rem' },
      circular: { width: '3rem', height: '3rem' },
    }

    const finalWidth = width || defaultSizes[variant].width
    const finalHeight = height || defaultSizes[variant].height

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={clsx('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                i === lines - 1 && 'w-3/4' // Last line is shorter
              )}
              style={{
                width: i === lines - 1 ? '75%' : finalWidth,
                height: finalHeight,
                ...style,
              }}
              role="status"
              aria-label="Loading content"
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        style={{
          width: finalWidth,
          height: finalHeight,
          ...style,
        }}
        role="status"
        aria-label="Loading content"
        {...props}
      />
    )
  }
)

// Loading overlay component for wrapping content
export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  loading: boolean
  spinner?: LoadingSpinnerProps
  children: React.ReactNode
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ loading, spinner = {}, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('relative', className)} {...props}>
        {children}
        {loading && (
          <LoadingSpinner
            overlay
            text="Loading..."
            {...spinner}
          />
        )}
      </div>
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'
Skeleton.displayName = 'Skeleton'
LoadingOverlay.displayName = 'LoadingOverlay'

export default LoadingSpinner
