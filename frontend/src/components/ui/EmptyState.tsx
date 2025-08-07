import React, { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { 
  FileX, 
  Search, 
  Database, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  FileText,
  Users,
  Settings,
  Inbox
} from 'lucide-react'
import Button from './Button'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode | 'default' | 'search' | 'data' | 'error' | 'add' | 'refresh' | 'chart' | 'memo' | 'users' | 'settings' | 'inbox'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    icon?: React.ReactNode
  }
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'minimal' | 'bordered'
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon = 'default',
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        container: 'py-8',
        icon: 'w-8 h-8',
        title: 'text-base',
        description: 'text-sm',
        spacing: 'space-y-3',
      },
      md: {
        container: 'py-12',
        icon: 'w-12 h-12',
        title: 'text-lg',
        description: 'text-base',
        spacing: 'space-y-4',
      },
      lg: {
        container: 'py-16',
        icon: 'w-16 h-16',
        title: 'text-xl',
        description: 'text-lg',
        spacing: 'space-y-6',
      },
    }

    const variantClasses = {
      default: '',
      minimal: 'bg-transparent',
      bordered: 'border-2 border-dashed border-neutral-300 rounded-lg',
    }

    const getIcon = () => {
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement, {
          className: clsx('empty-state-icon', sizeClasses[size].icon),
        })
      }

      const iconMap = {
        default: FileX,
        search: Search,
        data: Database,
        error: AlertCircle,
        add: Plus,
        refresh: RefreshCw,
        chart: BarChart3,
        memo: FileText,
        users: Users,
        settings: Settings,
        inbox: Inbox,
      }

      const IconComponent = iconMap[icon as keyof typeof iconMap] || FileX

      return (
        <IconComponent 
          className={clsx('empty-state-icon', sizeClasses[size].icon)}
          aria-hidden="true"
        />
      )
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'empty-state',
          sizeClasses[size].container,
          sizeClasses[size].spacing,
          variantClasses[variant],
          className
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        {getIcon()}
        
        <div className="text-center max-w-md mx-auto">
          <h3 className={clsx('empty-state-title', sizeClasses[size].title)}>
            {title}
          </h3>
          
          {description && (
            <p className={clsx('empty-state-description', sizeClasses[size].description)}>
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                leftIcon={action.icon}
                className="min-w-[120px]"
              >
                {action.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                leftIcon={secondaryAction.icon}
                className="min-w-[120px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)

// Specialized empty state components for common use cases
export interface NoDataProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  dataType?: string
}

export const NoData = forwardRef<HTMLDivElement, NoDataProps>(
  ({ title, dataType = 'data', description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon="data"
        title={title || `No ${dataType} found`}
        description={description || `There is no ${dataType} to display at the moment.`}
        {...props}
      />
    )
  }
)

export interface NoSearchResultsProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  searchTerm?: string
  onClearSearch?: () => void
}

export const NoSearchResults = forwardRef<HTMLDivElement, NoSearchResultsProps>(
  ({ title, searchTerm, onClearSearch, description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon="search"
        title={title || 'No results found'}
        description={
          description || 
          (searchTerm 
            ? `No results found for "${searchTerm}". Try adjusting your search terms.`
            : 'No results found. Try adjusting your search terms.'
          )
        }
        action={onClearSearch ? {
          label: 'Clear search',
          onClick: onClearSearch,
          variant: 'outline',
        } : undefined}
        {...props}
      />
    )
  }
)

export interface ErrorStateProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  error?: Error | string
  onRetry?: () => void
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title, error, onRetry, description, ...props }, ref) => {
    const errorMessage = error instanceof Error ? error.message : error

    return (
      <EmptyState
        ref={ref}
        icon="error"
        title={title || 'Something went wrong'}
        description={
          description || 
          errorMessage || 
          'An unexpected error occurred. Please try again.'
        }
        action={onRetry ? {
          label: 'Try again',
          onClick: onRetry,
          variant: 'primary',
          icon: <RefreshCw className="w-4 h-4" />,
        } : undefined}
        {...props}
      />
    )
  }
)

export interface LoadingStateProps extends Omit<EmptyStateProps, 'icon' | 'title' | 'action' | 'secondaryAction'> {
  title?: string
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ title, description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon={
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin" />
        }
        title={title || 'Loading...'}
        description={description || 'Please wait while we fetch your data.'}
        {...props}
      />
    )
  }
)

// Financial-specific empty states
export interface NoMemosProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  onCreateMemo?: () => void
}

export const NoMemos = forwardRef<HTMLDivElement, NoMemosProps>(
  ({ title, onCreateMemo, description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon="memo"
        title={title || 'No investment memos'}
        description={
          description || 
          'You haven\'t created any investment memos yet. Start by analyzing a stock from your watchlist.'
        }
        action={onCreateMemo ? {
          label: 'Create memo',
          onClick: onCreateMemo,
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
        } : undefined}
        {...props}
      />
    )
  }
)

export interface NoWatchlistProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  onAddStock?: () => void
}

export const NoWatchlist = forwardRef<HTMLDivElement, NoWatchlistProps>(
  ({ title, onAddStock, description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon="chart"
        title={title || 'No stocks in watchlist'}
        description={
          description || 
          'Your watchlist is empty. Add stocks you want to monitor and analyze.'
        }
        action={onAddStock ? {
          label: 'Add stock',
          onClick: onAddStock,
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
        } : undefined}
        {...props}
      />
    )
  }
)

export interface NoPortfolioProps extends Omit<EmptyStateProps, 'icon' | 'title'> {
  title?: string
  onCreatePortfolio?: () => void
}

export const NoPortfolio = forwardRef<HTMLDivElement, NoPortfolioProps>(
  ({ title, onCreatePortfolio, description, ...props }, ref) => {
    return (
      <EmptyState
        ref={ref}
        icon={<TrendingUp className="w-12 h-12" />}
        title={title || 'No portfolio data'}
        description={
          description || 
          'Start building your portfolio by adding positions and tracking performance.'
        }
        action={onCreatePortfolio ? {
          label: 'Create portfolio',
          onClick: onCreatePortfolio,
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
        } : undefined}
        {...props}
      />
    )
  }
)

EmptyState.displayName = 'EmptyState'
NoData.displayName = 'NoData'
NoSearchResults.displayName = 'NoSearchResults'
ErrorState.displayName = 'ErrorState'
LoadingState.displayName = 'LoadingState'
NoMemos.displayName = 'NoMemos'
NoWatchlist.displayName = 'NoWatchlist'
NoPortfolio.displayName = 'NoPortfolio'

export {
  EmptyState,
  NoData,
  NoSearchResults,
  ErrorState,
  LoadingState,
  NoMemos,
  NoWatchlist,
  NoPortfolio,
}

export default EmptyState
