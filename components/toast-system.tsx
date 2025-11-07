'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

/**
 * ToastProvider - Provider cho toast notifications
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration || 5000
    }

    setToasts(prev => [...prev, newToast])

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, description?: string) => {
    showToast({ type: 'success', title, description })
  }, [showToast])

  const error = useCallback((title: string, description?: string) => {
    showToast({ type: 'error', title, description })
  }, [showToast])

  const warning = useCallback((title: string, description?: string) => {
    showToast({ type: 'warning', title, description })
  }, [showToast])

  const info = useCallback((title: string, description?: string) => {
    showToast({ type: 'info', title, description })
  }, [showToast])

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * useToast - Hook to access toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * ToastContainer - Container for toast notifications
 */
function ToastContainer({
  toasts,
  onRemove
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

/**
 * ToastItem - Individual toast notification
 */
function ToastItem({
  toast,
  onRemove
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 rounded-lg border p-4 shadow-lg
        ${getColorClasses()}
        animate-in slide-in-from-right-full duration-300
      `}
    >
      {getIcon()}
      
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-xs font-medium underline underline-offset-2 hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
