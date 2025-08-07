import React, { FormHTMLAttributes, forwardRef, createContext, useContext } from 'react'
import { clsx } from 'clsx'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  layout?: 'vertical' | 'horizontal' | 'inline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  name?: string
  required?: boolean
  error?: string
  help?: string
  validateStatus?: 'success' | 'warning' | 'error' | 'validating'
  labelCol?: { span?: number; offset?: number }
  wrapperCol?: { span?: number; offset?: number }
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  colon?: boolean
}

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string
  help?: string
  validateStatus?: 'success' | 'warning' | 'error' | 'validating'
}

interface FormContextValue {
  layout: 'vertical' | 'horizontal' | 'inline'
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
}

const FormContext = createContext<FormContextValue>({
  layout: 'vertical',
  size: 'md',
  disabled: false,
})

const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      layout = 'vertical',
      size = 'md',
      disabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const contextValue: FormContextValue = {
      layout,
      size,
      disabled,
    }

    return (
      <FormContext.Provider value={contextValue}>
        <form
          ref={ref}
          className={clsx(
            'space-y-6',
            layout === 'inline' && 'flex flex-wrap items-end gap-4 space-y-0',
            className
          )}
          {...props}
        >
          {children}
        </form>
      </FormContext.Provider>
    )
  }
)

const FormItem = forwardRef<HTMLDivElement, FormItemProps>(
  (
    {
      label,
      name,
      required = false,
      error,
      help,
      validateStatus,
      labelCol,
      wrapperCol,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { layout, size } = useContext(FormContext)
    
    const hasError = error || validateStatus === 'error'
    const hasSuccess = validateStatus === 'success'
    const hasWarning = validateStatus === 'warning'
    const isValidating = validateStatus === 'validating'

    const sizeClasses = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3',
    }

    if (layout === 'horizontal') {
      return (
        <div
          ref={ref}
          className={clsx('grid grid-cols-12 gap-4 items-start', sizeClasses[size], className)}
          {...props}
        >
          {label && (
            <div className={clsx('col-span-3', labelCol?.span && `col-span-${labelCol.span}`)}>
              <FormLabel
                htmlFor={name}
                required={required}
                className="pt-2"
              >
                {label}
              </FormLabel>
            </div>
          )}
          <div className={clsx('col-span-9', wrapperCol?.span && `col-span-${wrapperCol.span}`)}>
            <FormControl
              error={error}
              help={help}
              validateStatus={validateStatus}
            >
              {children}
            </FormControl>
          </div>
        </div>
      )
    }

    if (layout === 'inline') {
      return (
        <div
          ref={ref}
          className={clsx('flex flex-col', className)}
          {...props}
        >
          {label && (
            <FormLabel
              htmlFor={name}
              required={required}
              className="mb-1"
            >
              {label}
            </FormLabel>
          )}
          <FormControl
            error={error}
            help={help}
            validateStatus={validateStatus}
          >
            {children}
          </FormControl>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={clsx('form-group', sizeClasses[size], className)}
        {...props}
      >
        {label && (
          <FormLabel
            htmlFor={name}
            required={required}
          >
            {label}
          </FormLabel>
        )}
        <FormControl
          error={error}
          help={help}
          validateStatus={validateStatus}
        >
          {children}
        </FormControl>
      </div>
    )
  }
)

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ required = false, colon = false, children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={clsx(
          'form-label',
          required && 'form-label-required',
          className
        )}
        {...props}
      >
        {children}
        {colon && ':'}
      </label>
    )
  }
)

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ error, help, validateStatus, children, className, ...props }, ref) => {
    const hasError = error || validateStatus === 'error'
    const hasSuccess = validateStatus === 'success'
    const hasWarning = validateStatus === 'warning'
    const isValidating = validateStatus === 'validating'

    return (
      <div ref={ref} className={clsx('relative', className)} {...props}>
        {children}
        
        {/* Validation icon */}
        {(hasError || hasSuccess || hasWarning || isValidating) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {hasError && (
              <AlertCircle className="w-4 h-4 text-bear-500" aria-hidden="true" />
            )}
            {hasSuccess && (
              <CheckCircle2 className="w-4 h-4 text-bull-500" aria-hidden="true" />
            )}
            {hasWarning && (
              <AlertCircle className="w-4 h-4 text-risk-500" aria-hidden="true" />
            )}
            {isValidating && (
              <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="form-error flex items-center gap-1 mt-1" role="alert">
            <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Help text */}
        {help && !error && (
          <div className="form-help flex items-center gap-1 mt-1">
            <Info className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            {help}
          </div>
        )}
      </div>
    )
  }
)

// Input component that integrates with Form
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, className, ...props }, ref) => {
    const { disabled } = useContext(FormContext)

    return (
      <input
        ref={ref}
        className={clsx(
          'form-input',
          error && 'form-input-error',
          success && 'form-input-success',
          className
        )}
        disabled={disabled || props.disabled}
        {...props}
      />
    )
  }
)

// Textarea component that integrates with Form
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
  autoResize?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, success, autoResize = false, className, ...props }, ref) => {
    const { disabled } = useContext(FormContext)

    return (
      <textarea
        ref={ref}
        className={clsx(
          'form-textarea',
          error && 'form-input-error',
          success && 'form-input-success',
          autoResize && 'resize-none',
          className
        )}
        disabled={disabled || props.disabled}
        {...props}
      />
    )
  }
)

// Select component that integrates with Form
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
  placeholder?: string
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, success, placeholder, options, children, className, ...props }, ref) => {
    const { disabled } = useContext(FormContext)

    return (
      <select
        ref={ref}
        className={clsx(
          'form-select',
          error && 'form-input-error',
          success && 'form-input-success',
          className
        )}
        disabled={disabled || props.disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
        {children}
      </select>
    )
  }
)

// Checkbox component that integrates with Form
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  success?: boolean
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, success, className, ...props }, ref) => {
    const { disabled } = useContext(FormContext)

    if (label) {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={clsx('form-checkbox', className)}
            disabled={disabled || props.disabled}
            {...props}
          />
          <span className="text-sm text-neutral-700">{label}</span>
        </label>
      )
    }

    return (
      <input
        ref={ref}
        type="checkbox"
        className={clsx('form-checkbox', className)}
        disabled={disabled || props.disabled}
        {...props}
      />
    )
  }
)

// Radio component that integrates with Form
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: boolean
  success?: boolean
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, success, className, ...props }, ref) => {
    const { disabled } = useContext(FormContext)

    if (label) {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="radio"
            className={clsx('form-radio', className)}
            disabled={disabled || props.disabled}
            {...props}
          />
          <span className="text-sm text-neutral-700">{label}</span>
        </label>
      )
    }

    return (
      <input
        ref={ref}
        type="radio"
        className={clsx('form-radio', className)}
        disabled={disabled || props.disabled}
        {...props}
      />
    )
  }
)

Form.displayName = 'Form'
FormItem.displayName = 'FormItem'
FormLabel.displayName = 'FormLabel'
FormControl.displayName = 'FormControl'
Input.displayName = 'Input'
Textarea.displayName = 'Textarea'
Select.displayName = 'Select'
Checkbox.displayName = 'Checkbox'
Radio.displayName = 'Radio'

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
}

export default Form
