'use client'

import React, { useState, useEffect } from 'react'
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

/**
 * useMediaQuery - Hook to detect screen size
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

/**
 * Breakpoints
 */
export const Breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)'
}

/**
 * ResponsivePanel - Panel that collapses on mobile
 */
export function ResponsivePanel({
  side = 'left',
  children,
  title,
  defaultOpen = true,
  className = ''
}: {
  side?: 'left' | 'right'
  children: React.ReactNode
  title?: string
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isMobile = !useMediaQuery(Breakpoints.md)

  const toggleOpen = () => setOpen(!open)

  // Desktop: Collapsible sidebar
  if (!isMobile) {
    return (
      <div className={`relative flex ${side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Panel Content */}
        <div
          className={`
            transition-all duration-300 ease-in-out border-r bg-card
            ${open ? 'w-80' : 'w-0'}
            ${className}
          `}
          style={{
            overflow: open ? 'visible' : 'hidden'
          }}
        >
          {title && open && (
            <div className="border-b px-4 py-3 font-semibold">
              {title}
            </div>
          )}
          <div className={open ? 'p-4' : ''}>
            {open && children}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleOpen}
          className={`
            absolute top-2 z-10
            ${side === 'left' ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'}
          `}
          aria-label={open ? 'Close panel' : 'Open panel'}
        >
          {side === 'left' ? (
            open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />
          ) : (
            open ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  // Mobile: Sheet (drawer)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-2 left-2 z-40"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="w-80 p-0">
        {title && (
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="p-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * ResponsiveGrid - Grid that adapts to screen size
 */
export function ResponsiveGrid({
  children,
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  gap = 4,
  className = ''
}: {
  children: React.ReactNode
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}) {
  const columnClasses = [
    columns.sm && `grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={`grid ${columnClasses} gap-${gap} ${className}`}>
      {children}
    </div>
  )
}

/**
 * MobileToolbar - Floating toolbar for mobile
 */
export function MobileToolbar({
  children,
  position = 'bottom'
}: {
  children: React.ReactNode
  position?: 'top' | 'bottom'
}) {
  const isMobile = !useMediaQuery(Breakpoints.md)

  if (!isMobile) return <>{children}</>

  return (
    <div
      className={`
        fixed left-0 right-0 z-30 
        flex items-center justify-around gap-2
        border-t bg-card p-2 shadow-lg
        ${position === 'bottom' ? 'bottom-0' : 'top-0 border-b border-t-0'}
      `}
    >
      {children}
    </div>
  )
}

/**
 * TouchFriendlyButton - Larger buttons for mobile
 */
export function TouchFriendlyButton({
  children,
  onClick,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
  [key: string]: any
}) {
  const isMobile = !useMediaQuery(Breakpoints.md)

  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`
        ${isMobile ? 'h-12 min-w-12' : 'h-9'}
        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  )
}

/**
 * AdaptiveLayout - Layout that changes based on screen size
 */
export function AdaptiveLayout({
  sidebar,
  main,
  rightPanel
}: {
  sidebar?: React.ReactNode
  main: React.ReactNode
  rightPanel?: React.ReactNode
}) {
  const isMobile = !useMediaQuery(Breakpoints.md)
  const isLarge = useMediaQuery(Breakpoints.lg)

  if (isMobile) {
    // Mobile: Stack vertically, sidebars as sheets
    return (
      <div className="flex flex-col h-screen">
        {main}
      </div>
    )
  }

  if (!isLarge && rightPanel) {
    // Medium screens: Only show one sidebar
    return (
      <div className="flex h-screen">
        {sidebar && <div className="w-64 border-r">{sidebar}</div>}
        <div className="flex-1">{main}</div>
      </div>
    )
  }

  // Large screens: Show all panels
  return (
    <div className="flex h-screen">
      {sidebar && <div className="w-64 border-r">{sidebar}</div>}
      <div className="flex-1">{main}</div>
      {rightPanel && <div className="w-80 border-l">{rightPanel}</div>}
    </div>
  )
}

/**
 * MobileDrawer - Bottom drawer for mobile
 */
export function MobileDrawer({
  trigger,
  children,
  title
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        {title && (
          <SheetHeader className="border-b pb-3 mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="overflow-y-auto h-[calc(80vh-80px)]">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
