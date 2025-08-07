import React from 'react'
import { cn } from '../../lib/utils'
import { 
  FileX, 
  Search, 
  Database, 
  TrendingUp, 
  BarChart3, 
  FileText,
  AlertCircle,
  Inbox,
  Users,
  Settings
} from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'search' | 'error' | 'success'
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-6'
    }
  }

  const variantClasses = {
    default: 'text-gray-400',
    search: 'text-gray-400',
    error: 'text-bear-400',
    success: 'text-bull-400'
  }

  return (
    <div className={cn(
      'empty-state text-center',
      sizeClasses[size].container,
      className
    )}>
      <div className={cn('flex flex-col items-center', sizeClasses[size].spacing)}>
        {icon && (
          <div className={cn(
            'empty-state-icon mx-auto mb-4',
            sizeClasses[size].icon,
            variantClasses[variant]
          )}>
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className={cn(
            'empty-state-title font-medium text-gray-900',
            sizeClasses[size].title
          )}>
            {title}
          </h3>
          
          {description && (
            <p className={cn(
              'empty-state-description text-gray-500 max-w-sm mx-auto',
              sizeClasses[size].description
            )}>
              {description}
            </p>
          )}
        </div>

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Predefined empty state components for common scenarios
const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'No data available',
  ...props
}) => (
  <EmptyState
    icon={<Database />}
    title={title}
    {...props}
  />
)

const NoSearchResultsEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'variant'> & { 
  title?: string
  searchTerm?: string 
}> = ({
  title,
  searchTerm,
  description,
  ...props
}) => (
  <EmptyState
    icon={<Search />}
    title={title || 'No results found'}
    description={description || (searchTerm ? `No results found for "${searchTerm}"` : 'Try adjusting your search criteria')}
    variant="search"
    {...props}
  />
)

const NoMemosEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'No investment memos yet',
  description = 'Start by generating your first investment memo for a stock in your watchlist.',
  ...props
}) => (
  <EmptyState
    icon={<FileText />}
    title={title}
    description={description}
    {...props}
  />
)

const NoWatchlistEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'Your watchlist is empty',
  description = 'Add stocks to your watchlist to start tracking and analyzing them.',
  ...props
}) => (
  <EmptyState
    icon={<TrendingUp />}
    title={title}
    description={description}
    {...props}
  />
)

const NoPortfolioEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'No portfolio data',
  description = 'Your portfolio will appear here once you start making investments.',
  ...props
}) => (
  <EmptyState
    icon={<BarChart3 />}
    title={title}
    description={description}
    {...props}
  />
)

const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'variant'> & { 
  title?: string
  error?: Error | string
}> = ({
  title = 'Something went wrong',
  error,
  description,
  ...props
}) => (
  <EmptyState
    icon={<AlertCircle />}
    title={title}
    description={description || (typeof error === 'string' ? error : error?.message) || 'An unexpected error occurred. Please try again.'}
    variant="error"
    {...props}
  />
)

const InboxEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'All caught up!',
  description = 'No new notifications or updates at the moment.',
  ...props
}) => (
  <EmptyState
    icon={<Inbox />}
    title={title}
    description={description}
    variant="success"
    {...props}
  />
)

const NoUsersEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'No users found',
  description = 'Invite team members to collaborate on investment analysis.',
  ...props
}) => (
  <EmptyState
    icon={<Users />}
    title={title}
    description={description}
    {...props}
  />
)

const ConfigurationEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title'> & { title?: string }> = ({
  title = 'Configuration needed',
  description = 'Complete your setup to start using all features.',
  ...props
}) => (
  <EmptyState
    icon={<Settings />}
    title={title}
    description={description}
    {...props}
  />
)

const FileNotFoundEmptyState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'variant'> & { title?: string }> = ({
  title = 'File not found',
  description = 'The file you're looking for doesn't exist or has been moved.',
  ...props
}) => (
  <EmptyState
    icon={<FileX />}
    title={title}
    description={description}
    variant="error"
    {...props}
  />
)

EmptyState.displayName = 'EmptyState'
NoDataEmptyState.displayName = 'NoDataEmptyState'
NoSearchResultsEmptyState.displayName = 'NoSearchResultsEmptyState'
NoMemosEmptyState.displayName = 'NoMemosEmptyState'
NoWatchlistEmptyState.displayName = 'NoWatchlistEmptyState'
NoPortfolioEmptyState.displayName = 'NoPortfolioEmptyState'
ErrorEmptyState.displayName = 'ErrorEmptyState'
InboxEmptyState.displayName = 'InboxEmptyState'
NoUsersEmptyState.displayName = 'NoUsersEmptyState'
ConfigurationEmptyState.displayName = 'ConfigurationEmptyState'
FileNotFoundEmptyState.displayName = 'FileNotFoundEmptyState'

export {
  EmptyState,
  NoDataEmptyState,
  NoSearchResultsEmptyState,
  NoMemosEmptyState,
  NoWatchlistEmptyState,
  NoPortfolioEmptyState,
  ErrorEmptyState,
  InboxEmptyState,
  NoUsersEmptyState,
  ConfigurationEmptyState,
  FileNotFoundEmptyState
}
