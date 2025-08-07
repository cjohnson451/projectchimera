// UI Component Library Index
// This file exports all UI components for easy importing throughout the application

// Button components
export { default as Button } from './Button'
export type { ButtonProps } from './Button'

// Card components
export { 
  default as Card, 
  Card as CardComponent,
  CardHeader, 
  CardBody, 
  CardFooter 
} from './Card'
export type { 
  CardProps, 
  CardHeaderProps, 
  CardBodyProps, 
  CardFooterProps 
} from './Card'

// Modal components
export { 
  default as Modal,
  Modal as ModalComponent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from './Modal'
export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps
} from './Modal'

// Table components
export { default as Table } from './Table'
export type { TableProps, Column } from './Table'

// Form components
export {
  default as Form,
  Form as FormComponent,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio
} from './Form'
export type {
  FormProps,
  FormItemProps,
  FormLabelProps,
  FormControlProps,
  InputProps,
  TextareaProps,
  SelectProps,
  CheckboxProps,
  RadioProps
} from './Form'

// Loading components
export { 
  default as LoadingSpinner,
  Skeleton,
  LoadingOverlay
} from './LoadingSpinner'
export type {
  LoadingSpinnerProps,
  SkeletonProps,
  LoadingOverlayProps
} from './LoadingSpinner'

// Empty state components
export {
  default as EmptyState,
  EmptyState as EmptyStateComponent,
  NoData,
  NoSearchResults,
  ErrorState,
  LoadingState,
  NoMemos,
  NoWatchlist,
  NoPortfolio
} from './EmptyState'
export type {
  EmptyStateProps,
  NoDataProps,
  NoSearchResultsProps,
  ErrorStateProps,
  LoadingStateProps,
  NoMemosProps,
  NoWatchlistProps,
  NoPortfolioProps
} from './EmptyState'

// Error boundary components
export { 
  default as ErrorBoundary,
  withErrorBoundary,
  useErrorHandler
} from './ErrorBoundary'
export type { ErrorBoundaryProps } from './ErrorBoundary'

// Toast components
export {
  default as Toast,
  Toast as ToastComponent,
  ToastContainer,
  ToastProvider,
  useToast,
  createToastIntegration
} from './Toast'
export type {
  ToastProps,
  ToastContainerProps
} from './Toast'

// Re-export commonly used types for convenience
export type {
  // Common HTML element props
  ButtonHTMLAttributes,
  HTMLAttributes,
  FormHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  LabelHTMLAttributes,
} from 'react'

// Utility type for component variants
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'
export type FinancialVariant = 'bull' | 'bear' | 'neutral' | 'risk'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type ValidationStatus = 'success' | 'warning' | 'error' | 'validating'

// Common component props interface
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Financial data display utilities
export interface FinancialDataProps {
  value: number
  previousValue?: number
  format?: 'currency' | 'percentage' | 'number'
  precision?: number
  showChange?: boolean
  showTrend?: boolean
}

// Theme configuration
export interface ThemeConfig {
  colors: {
    primary: string
    bull: string
    bear: string
    neutral: string
    risk: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// Component library metadata
export const UI_LIBRARY_VERSION = '1.0.0'
export const UI_LIBRARY_NAME = 'Project Chimera UI'

// Default theme configuration
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#3b82f6',
    bull: '#10b981',
    bear: '#ef4444',
    neutral: '#64748b',
    risk: '#f59e0b',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
}

// Component usage examples and documentation
export const COMPONENT_EXAMPLES = {
  Button: `
    <Button variant="primary" size="md" loading={false}>
      Click me
    </Button>
  `,
  Card: `
    <Card>
      <CardHeader title="Card Title" subtitle="Card subtitle" />
      <CardBody>Card content goes here</CardBody>
      <CardFooter>Card footer</CardFooter>
    </Card>
  `,
  Modal: `
    <Modal isOpen={true} onClose={() => {}}>
      <ModalHeader title="Modal Title" />
      <ModalBody>Modal content</ModalBody>
      <ModalFooter>Modal actions</ModalFooter>
    </Modal>
  `,
  Table: `
    <Table
      columns={[
        { key: 'name', title: 'Name', sortable: true },
        { key: 'value', title: 'Value', align: 'right' }
      ]}
      data={[{ name: 'Item 1', value: 100 }]}
    />
  `,
  Form: `
    <Form>
      <FormItem label="Email" required>
        <Input type="email" placeholder="Enter email" />
      </FormItem>
    </Form>
  `,
}

// Accessibility guidelines
export const ACCESSIBILITY_GUIDELINES = {
  'Use semantic HTML': 'All components use appropriate HTML elements and ARIA attributes',
  'Keyboard navigation': 'All interactive components support keyboard navigation',
  'Screen reader support': 'Components include proper labels and descriptions',
  'Color contrast': 'All color combinations meet WCAG 2.1 AA standards',
  'Focus management': 'Focus is properly managed in modals and complex components',
}

// Performance considerations
export const PERFORMANCE_NOTES = {
  'Lazy loading': 'Components can be imported individually to reduce bundle size',
  'Memoization': 'Complex components use React.memo where appropriate',
  'Bundle splitting': 'Each component is in its own file for optimal tree shaking',
  'CSS optimization': 'Tailwind CSS purges unused styles in production',
}
