'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * LoadingSpinner - Simple spinner component
 */
export function LoadingSpinner({ 
  size = 'default',
  className = ''
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  )
}

/**
 * LoadingOverlay - Full-screen loading overlay
 */
export function LoadingOverlay({
  visible,
  message = 'Loading...',
  transparent = false
}: {
  visible: boolean
  message?: string
  transparent?: boolean
}) {
  if (!visible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-background/50' : 'bg-background/80'
      } backdrop-blur-sm`}
    >
      <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * LoadingButton - Button với loading state
 */
export function LoadingButton({
  loading,
  children,
  disabled,
  ...props
}: {
  loading: boolean
  children: React.ReactNode
  disabled?: boolean
  [key: string]: any
}) {
  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 ${props.className || ''}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}

/**
 * SkeletonLine - Skeleton loading line
 */
export function SkeletonLine({
  width = '100%',
  height = '1rem',
  className = ''
}: {
  width?: string | number
  height?: string | number
  className?: string
}) {
  return (
    <div
      className={`animate-pulse rounded bg-muted ${className}`}
      style={{ width, height }}
    />
  )
}

/**
 * SkeletonCard - Skeleton loading card
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <SkeletonLine height="1.5rem" width="60%" />
      <SkeletonLine height="1rem" width="80%" />
      <SkeletonLine height="1rem" width="70%" />
      <div className="flex gap-2 mt-4">
        <SkeletonLine height="2rem" width="5rem" />
        <SkeletonLine height="2rem" width="5rem" />
      </div>
    </div>
  )
}

/**
 * SkeletonTable - Skeleton loading table
 */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        <SkeletonLine width="30%" height="1rem" />
        <SkeletonLine width="25%" height="1rem" />
        <SkeletonLine width="20%" height="1rem" />
        <SkeletonLine width="25%" height="1rem" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <SkeletonLine width="30%" height="1rem" />
          <SkeletonLine width="25%" height="1rem" />
          <SkeletonLine width="20%" height="1rem" />
          <SkeletonLine width="25%" height="1rem" />
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonGrid - Skeleton loading grid
 */
export function SkeletonGrid({ 
  cols = 3, 
  rows = 3 
}: { 
  cols?: number
  rows?: number 
}) {
  return (
    <div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * LoadingState - Comprehensive loading component
 */
export function LoadingState({
  type = 'spinner',
  message,
  fullScreen = false
}: {
  type?: 'spinner' | 'skeleton-card' | 'skeleton-table' | 'skeleton-grid'
  message?: string
  fullScreen?: boolean
}) {
  const content = (() => {
    switch (type) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-4 py-12">
            <LoadingSpinner size="lg" />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        )
      case 'skeleton-card':
        return <SkeletonCard />
      case 'skeleton-table':
        return <SkeletonTable />
      case 'skeleton-grid':
        return <SkeletonGrid />
      default:
        return <LoadingSpinner />
    }
  })()

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        {content}
      </div>
    )
  }

  return content
}

/**
 * ProgressBar - Linear progress bar
 */
export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  animated = true,
  className = ''
}: {
  value: number
  max?: number
  showLabel?: boolean
  animated?: boolean
  className?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full bg-primary transition-all ${
            animated ? 'duration-300 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * CircularProgress - Circular progress indicator
 */
export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  className = ''
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  className?: string
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * PulseLoader - Animated pulse loader
 */
export function PulseLoader({ 
  count = 3,
  size = 'default'
}: { 
  count?: number
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    default: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} rounded-full bg-primary animate-pulse`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

/**
 * InlineLoader - Small inline loader
 */
export function InlineLoader({ 
  text = 'Loading...',
  size = 'sm'
}: {
  text?: string
  size?: 'sm' | 'default'
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <LoadingSpinner size={size} />
      <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{text}</span>
    </div>
  )
}
