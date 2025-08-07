import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md focus:ring-primary-500',
      secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md focus:ring-primary-500',
      success: 'bg-bull-600 hover:bg-bull-700 active:bg-bull-800 text-white shadow-sm hover:shadow-md focus:ring-bull-500',
      danger: 'bg-bear-600 hover:bg-bear-700 active:bg-bear-800 text-white shadow-sm hover:shadow-md focus:ring-bear-500',
      ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700 focus:ring-gray-500',
      outline: 'bg-transparent hover:bg-primary-50 active:bg-primary-100 text-primary-700 border border-primary-300 focus:ring-primary-500'
    }
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    }

    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        ref={ref}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 
            className={cn(
              'animate-spin',
              size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : size === 'xl' ? 'h-6 w-6' : 'h-4 w-4',
              (leftIcon || children) && 'mr-2'
            )}
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span 
            className={cn(
              'flex items-center',
              children && 'mr-2'
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        {children}
        {!loading && rightIcon && (
          <span 
            className={cn(
              'flex items-center',
              children && 'ml-2'
            )}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
