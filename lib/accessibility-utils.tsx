/**
 * Accessibility Utilities & Components
 * 
 * Features:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - Skip links
 * - Announcement region
 */

import React, { useEffect, useRef } from 'react'

/**
 * SkipToContent - Skip navigation link for keyboard users
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
    >
      Skip to content
    </a>
  )
}

/**
 * VisuallyHidden - Hide content visually but keep it for screen readers
 */
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

/**
 * LiveRegion - Announce dynamic content to screen readers
 */
export function LiveRegion({
  message,
  politeness = 'polite',
  clearAfter = 5000
}: {
  message: string
  politeness?: 'polite' | 'assertive' | 'off'
  clearAfter?: number
}) {
  const [content, setContent] = React.useState(message)

  useEffect(() => {
    setContent(message)
    
    if (clearAfter && message) {
      const timer = setTimeout(() => setContent(''), clearAfter)
      return () => clearTimeout(timer)
    }
  }, [message, clearAfter])

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {content}
    </div>
  )
}

/**
 * FocusTrap - Trap focus within a component (for modals, dialogs)
 */
export function FocusTrap({
  children,
  active = true
}: {
  children: React.ReactNode
  active?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0]
    lastFocusableRef.current = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstFocusableRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return <div ref={containerRef}>{children}</div>
}

/**
 * KeyboardShortcutHint - Show keyboard shortcut hint
 */
export function KeyboardShortcutHint({
  keys,
  description
}: {
  keys: string[]
  description: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <React.Fragment key={key}>
            {i > 0 && <span>+</span>}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * AccessibleButton - Button với proper ARIA attributes
 */
export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescription,
  disabled = false,
  loading = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  ariaLabel?: string
  ariaDescription?: string
  disabled?: boolean
  loading?: boolean
  [key: string]: any
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `desc-${ariaLabel}` : undefined}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {children}
      {ariaDescription && (
        <VisuallyHidden id={`desc-${ariaLabel}`}>
          {ariaDescription}
        </VisuallyHidden>
      )}
    </button>
  )
}

/**
 * AccessibleDialog - Dialog với proper ARIA
 */
export function AccessibleDialog({
  open,
  onClose,
  title,
  description,
  children
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <FocusTrap active={open}>
        <div
          ref={dialogRef}
          className="relative rounded-lg border bg-card p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="dialog-title" className="text-lg font-semibold mb-2">
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </FocusTrap>
    </div>
  )
}

/**
 * useKeyboardNavigation - Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  options: {
    loop?: boolean
    orientation?: 'horizontal' | 'vertical'
  } = {}
) {
  const { loop = true, orientation = 'vertical' } = options
  const [focusedIndex, setFocusedIndex] = React.useState(0)

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const keys = orientation === 'vertical' 
        ? ['ArrowUp', 'ArrowDown']
        : ['ArrowLeft', 'ArrowRight']

      if (!keys.includes(e.key)) return

      e.preventDefault()

      const isNext = orientation === 'vertical' 
        ? e.key === 'ArrowDown'
        : e.key === 'ArrowRight'

      setFocusedIndex(prev => {
        let next = isNext ? prev + 1 : prev - 1

        if (loop) {
          if (next < 0) next = itemCount - 1
          if (next >= itemCount) next = 0
        } else {
          if (next < 0) next = 0
          if (next >= itemCount) next = itemCount - 1
        }

        return next
      })

      if (e.key === 'Enter' || e.key === ' ') {
        onSelect(focusedIndex)
      }
    },
    [itemCount, onSelect, focusedIndex, loop, orientation]
  )

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  }
}

/**
 * announceToScreenReader - Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', politeness)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * CSS class for screen reader only content
 */
export const srOnlyClass = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`
