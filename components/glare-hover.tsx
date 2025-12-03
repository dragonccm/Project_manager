'use client'

import React, { useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface GlareHoverProps {
  children: React.ReactNode
  glareColor?: string
  glareOpacity?: number
  glareAngle?: number
  glareSize?: number
  transitionDuration?: number
  playOnce?: boolean
  className?: string
}

/**
 * GlareHover Component
 * 
 * Adds a smooth glare/shine effect that follows the mouse cursor on hover.
 * Perfect for cards, buttons, and interactive elements.
 * Automatically adapts to light/dark mode.
 * 
 * @param glareColor - Color of the glare effect (default: adapts to theme)
 * @param glareOpacity - Opacity of the glare (0-1, default: 0.3 light, 0.4 dark)
 * @param glareAngle - Rotation angle of the glare effect in degrees (default: -30)
 * @param glareSize - Size of the glare effect in pixels (default: 300)
 * @param transitionDuration - Animation duration in milliseconds (default: 800)
 * @param playOnce - Whether the effect should only play once (default: false)
 */
export function GlareHover({
  children,
  glareColor,
  glareOpacity,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false,
  className
}: GlareHoverProps) {
  const { theme, resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  // Determine theme-aware defaults
  const isDark = resolvedTheme === 'dark' || theme === 'dark'
  const defaultGlareColor = glareColor || (isDark ? '#ffffff' : '#ffffff')
  const defaultGlareOpacity = glareOpacity ?? (isDark ? 0.25 : 0.2)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playOnce && hasPlayed) return
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setGlarePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (playOnce && !hasPlayed) {
      setHasPlayed(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    }
    return `rgba(255, 255, 255, ${alpha})`
  }

  const glareStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    borderRadius: 'inherit',
    transition: `opacity ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    opacity: isHovered ? 1 : 0,
    zIndex: 1
  }

  const glareGradientStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${glareSize}px`,
    height: `${glareSize}px`,
    background: `radial-gradient(circle, ${hexToRgba(defaultGlareColor, defaultGlareOpacity)} 0%, transparent 70%)`,
    transform: `translate(-50%, -50%) rotate(${glareAngle}deg)`,
    left: `${glarePosition.x}%`,
    top: `${glarePosition.y}%`,
    transition: `left ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    willChange: 'left, top'
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative', className)}
      style={{ position: 'relative' }}
    >
      {/* Glare effect overlay */}
      <div style={glareStyle}>
        <div style={glareGradientStyle} />
      </div>
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}

export default GlareHover
