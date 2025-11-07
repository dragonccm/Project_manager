'use client'

/**
 * Canvas Minimap Component
 * Hiển thị overview của canvas và viewport hiện tại
 */

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Shape } from '@/types/database'
import { CanvasManager } from '@/lib/canvas-manager'

interface MinimapProps {
  shapes: Shape[]
  canvasManager: CanvasManager
  canvasWidth: number
  canvasHeight: number
  onViewportChange: (x: number, y: number) => void
  minimapScale?: number
  className?: string
}

export default function Minimap({
  shapes,
  canvasManager,
  canvasWidth,
  canvasHeight,
  onViewportChange,
  minimapScale = 0.1,
  className = ''
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  // Render minimap
  useEffect(() => {
    if (!canvasRef.current || isCollapsed) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate minimap dimensions
    const minimapWidth = canvasWidth * minimapScale
    const minimapHeight = canvasHeight * minimapScale

    // Set canvas size
    canvas.width = minimapWidth
    canvas.height = minimapHeight

    // Draw background
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, minimapWidth, minimapHeight)

    // Draw grid (optional)
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 0.5
    const gridSize = 20 * minimapScale
    for (let x = 0; x < minimapWidth; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, minimapHeight)
      ctx.stroke()
    }
    for (let y = 0; y < minimapHeight; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(minimapWidth, y)
      ctx.stroke()
    }

    // Draw shapes
    shapes.forEach(shape => {
      const x = shape.x * minimapScale
      const y = shape.y * minimapScale
      const width = (shape.width || 0) * minimapScale
      const height = (shape.height || 0) * minimapScale

      ctx.fillStyle = (shape as any).fill || '#3b82f6'
      ctx.globalAlpha = 0.5

      switch (shape.type) {
        case 'rectangle':
          ctx.fillRect(x, y, width, height)
          break
        case 'circle':
          ctx.beginPath()
          ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'text':
        case 'image':
        case 'data-card':
          ctx.fillRect(x, y, width, height)
          break
        case 'line':
        case 'arrow':
          ctx.strokeStyle = (shape as any).stroke || '#3b82f6'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(
            (shape as any).endX * minimapScale,
            (shape as any).endY * minimapScale
          )
          ctx.stroke()
          break
      }

      ctx.globalAlpha = 1
    })

    // Draw viewport rectangle
    const viewport = canvasManager.getMinimapViewport(minimapScale)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.strokeRect(viewport.x, viewport.y, viewport.width, viewport.height)

    // Fill viewport with semi-transparent overlay
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height)

  }, [shapes, canvasManager, canvasWidth, canvasHeight, minimapScale, isCollapsed])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && e.type !== 'mousedown') return
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert minimap coordinates to canvas coordinates
    const canvasX = (x / minimapScale) - (canvasManager.getViewport().width / 2 / canvasManager.getViewport().scale)
    const canvasY = (y / minimapScale) - (canvasManager.getViewport().height / 2 / canvasManager.getViewport().scale)

    onViewportChange(
      -canvasX * canvasManager.getViewport().scale,
      -canvasY * canvasManager.getViewport().scale
    )
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (isCollapsed) {
    return (
      <Card className={`absolute bottom-4 right-4 p-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          title="Hiển thị minimap"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </Card>
    )
  }

  return (
    <Card className={`absolute bottom-4 right-4 p-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">Minimap</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          title="Ẩn minimap"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="border border-border cursor-move rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      />
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {canvasManager.getZoomPercentage()}%
      </div>
    </Card>
  )
}
