'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

interface AdvancedThemeSwitcherProps {
  defaultTheme?: Theme
  onThemeChange?: (theme: Theme) => void
  showLabel?: boolean
}

/**
 * AdvancedThemeSwitcher - Theme switcher với light/dark/system modes
 * 
 * Features:
 * - Light/Dark/System modes
 * - Persistent storage
 * - System preference detection
 * - Smooth transitions
 * - Dropdown menu
 * - Tooltip support
 * - Icon indicators
 */
export default function AdvancedThemeSwitcher({
  defaultTheme = 'system',
  onThemeChange,
  showLabel = false
}: AdvancedThemeSwitcherProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Load theme from storage
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored)
    }
  }, [])

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark')

    // Determine actual theme
    let actualTheme: 'light' | 'dark' = 'light'
    
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      actualTheme = theme
    }

    setResolvedTheme(actualTheme)
    root.classList.add(actualTheme)

    // Store theme
    localStorage.setItem('theme', theme)

    // Notify parent
    onThemeChange?.(theme)
  }, [theme, onThemeChange])

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light')
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // Get icon for current theme
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  // Get label for current theme
  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
    }
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={showLabel ? 'default' : 'icon'}>
                {getThemeIcon()}
                {showLabel && <span className="ml-2">{getThemeLabel()}</span>}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change theme</p>
            <p className="text-xs text-muted-foreground">
              Current: {getThemeLabel()} ({resolvedTheme})
            </p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
            {theme === 'light' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
            {theme === 'dark' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>System</span>
            {theme === 'system' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}

/**
 * Custom hook for theme management
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)

    // Determine resolved theme
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      setResolvedTheme('dark')
    } else {
      setResolvedTheme('light')
    }
  }, [])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    const root = document.documentElement
    root.classList.remove('light', 'dark')

    let actualTheme: 'light' | 'dark' = 'light'
    if (newTheme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      actualTheme = newTheme
    }

    setResolvedTheme(actualTheme)
    root.classList.add(actualTheme)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: changeTheme
  }
}
