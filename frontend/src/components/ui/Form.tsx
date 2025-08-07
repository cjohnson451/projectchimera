import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
  placeholder?: string
}

export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface FormHelpProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface PasswordInputProps extends Omit<FormInputProps, 'type'> {
  showToggle?: boolean
}

const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-6', className)}
        {...props}
      />
    )
  }
)

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('form-group space-y-2', className)}
        {...props}
      />
    )
  }
)

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'form-label block text-sm font-medium text-gray-700',
          required && 'form-label-required',
          className
        )}
        {...props}
      >
        {children}
      </label>
    )
  }
)

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, success, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">
              {leftIcon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input-field w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors duration-200',
            error 
              ? 'input-field-error border-bear-300 focus:ring-bear-500 focus:border-transparent'
              : success
              ? 'input-field-success border-bull-300 focus:ring-bull-500 focus:border-transparent'
              : 'border-gray-300 focus:ring-primary-500 focus:border-transparent',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={cn(
              'text-sm',
              error ? 'text-bear-400' : success ? 'text-bull-400' : 'text-gray-400'
            )}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
    )
  }
)

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, success, resize = 'vertical', ...props }, ref) => {
    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

    return (
      <textarea
        ref={ref}
        className={cn(
          'input-field w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors duration-200',
          error 
            ? 'input-field-error border-bear-300 focus:ring-bear-500 focus:border-transparent'
            : success
            ? 'input-field-success border-bull-300 focus:ring-bull-500 focus:border-transparent'
            : 'border-gray-300 focus:ring-primary-500 focus:border-transparent',
          resizeClasses[resize],
          className
        )}
        {...props}
      />
    )
  }
)

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, success, placeholder, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'input-field w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-200',
          error 
            ? 'input-field-error border-bear-300 focus:ring-bear-500 focus:border-transparent'
            : success
            ? 'input-field-success border-bull-300 focus:ring-bull-500 focus:border-transparent'
            : 'border-gray-300 focus:ring-primary-500 focus:border-transparent',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    )
  }
)

const FormError = forwardRef<HTMLDivElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null

    return (
      <div
        ref={ref}
        className={cn('form-error flex items-center text-sm text-bear-600 mt-1', className)}
        role="alert"
        {...props}
      >
        <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
        {children}
      </div>
    )
  }
)

const FormHelp = forwardRef<HTMLDivElement, FormHelpProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null

    return (
      <div
        ref={ref}
        className={cn('form-help text-sm text-gray-500 mt-1', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const FormSuccess = forwardRef<HTMLDivElement, FormErrorProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null

    return (
      <div
        ref={ref}
        className={cn('flex items-center text-sm text-bull-600 mt-1', className)}
        {...props}
      >
        <CheckCircle2 className="h-4 w-4 mr-1 flex-shrink-0" />
        {children}
      </div>
    )
  }
)

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <FormInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          showToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none pointer-events-auto"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : undefined
        }
        {...props}
      />
    )
  }
)

// Checkbox component
export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: boolean
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500',
              error && 'border-bear-300 text-bear-600 focus:ring-bear-500',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label className="font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

// Radio component
export interface FormRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: boolean
}

const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={cn(
              'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500',
              error && 'border-bear-300 text-bear-600 focus:ring-bear-500',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label className="font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Form.displayName = 'Form'
FormGroup.displayName = 'FormGroup'
FormLabel.displayName = 'FormLabel'
FormInput.displayName = 'FormInput'
FormTextarea.displayName = 'FormTextarea'
FormSelect.displayName = 'FormSelect'
FormError.displayName = 'FormError'
FormHelp.displayName = 'FormHelp'
FormSuccess.displayName = 'FormSuccess'
PasswordInput.displayName = 'PasswordInput'
FormCheckbox.displayName = 'FormCheckbox'
FormRadio.displayName = 'FormRadio'

export {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
  FormHelp,
  FormSuccess,
  PasswordInput,
  FormCheckbox,
  FormRadio
}
