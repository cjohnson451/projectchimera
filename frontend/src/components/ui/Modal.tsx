import React, { useEffect, useRef, HTMLAttributes, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import Button from './Button'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onClose?: () => void
  showCloseButton?: boolean
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between'
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      closeOnBackdrop = true,
      closeOnEscape = true,
      showCloseButton = true,
      title,
      description,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    const sizeClasses = {
      sm: 'modal-content-sm',
      md: 'modal-content-md',
      lg: 'modal-content-lg',
      xl: 'modal-content-xl',
      full: 'modal-content max-w-none w-full h-full m-0 rounded-none',
    }

    useEffect(() => {
      if (isOpen) {
        // Store the currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement
        
        // Focus the modal
        if (modalRef.current) {
          modalRef.current.focus()
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden'
      } else {
        // Restore focus to the previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
        
        // Restore body scroll
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, closeOnEscape, onClose])

    const handleBackdropClick = (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose()
      }
    }

    if (!isOpen) return null

    const modalContent = (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <div
            ref={modalRef}
            className={clsx('modal-content', sizeClasses[size], className)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            {...props}
          >
            {(title || description || showCloseButton) && (
              <ModalHeader
                title={title}
                description={description}
                onClose={onClose}
                showCloseButton={showCloseButton}
              />
            )}
            {children}
          </div>
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  }
)

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, description, onClose, showCloseButton = true, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('modal-header', className)} {...props}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-sm text-neutral-500 mt-1">
                {description}
              </p>
            )}
            {children}
          </div>
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 ml-4 -mr-2 -mt-2"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }
)

const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('modal-body', className)} {...props}>
        {children}
      </div>
    )
  }
)

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ align = 'right', children, className, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'modal-footer',
          'flex items-center gap-3',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Modal.displayName = 'Modal'
ModalHeader.displayName = 'ModalHeader'
ModalBody.displayName = 'ModalBody'
ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalBody, ModalFooter }
export default Modal
