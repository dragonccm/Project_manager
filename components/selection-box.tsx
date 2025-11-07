'use client'

import React from 'react'
import { SelectionBox as SelectionBoxType } from '@/lib/selection-manager'

interface SelectionBoxProps {
  selectionBox: SelectionBoxType | null
  canvasScale?: number
  canvasOffsetX?: number
  canvasOffsetY?: number
}

/**
 * SelectionBox - Hiển thị lasso selection box
 * 
 * Features:
 * - Render selection rectangle
 * - Dashed border animation
 * - Semi-transparent fill
 * - Scales with canvas zoom
 */
export default function SelectionBox({ 
  selectionBox,
  canvasScale = 1,
  canvasOffsetX = 0,
  canvasOffsetY = 0
}: SelectionBoxProps) {
  if (!selectionBox) return null

  const { startX, startY, endX, endY } = selectionBox

  // Calculate normalized rectangle
  const x = Math.min(startX, endX) * canvasScale + canvasOffsetX
  const y = Math.min(startY, endY) * canvasScale + canvasOffsetY
  const width = Math.abs(endX - startX) * canvasScale
  const height = Math.abs(endY - startY) * canvasScale

  return (
    <div
      className="pointer-events-none absolute border-2 border-blue-500 border-dashed bg-blue-500/10"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        animation: 'selection-dash 0.5s linear infinite'
      }}
    >
      <style jsx>{`
        @keyframes selection-dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </div>
  )
}
