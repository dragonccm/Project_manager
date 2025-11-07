"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { DocumentItem, DocumentItemStyle, DocumentItemContent } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Grid, Move, Square, Type, Image as ImageIcon, Maximize2, ZoomIn, ZoomOut, Save } from 'lucide-react'

// Constants
const MM_TO_PX = 3.7795275591 // 1mm = 3.78 pixels at 96 DPI
const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

interface DocumentCanvasProps {
  items: DocumentItem[]
  canvasWidth?: number // in mm
  canvasHeight?: number // in mm
  gridSize?: number // in mm
  gridEnabled?: boolean
  snapToGrid?: boolean
  onItemsChange: (items: DocumentItem[]) => void
  onItemSelect?: (itemId: string | null) => void
  onSave?: () => void
  readOnly?: boolean
}

export function DocumentCanvas({
  items,
  canvasWidth = A4_WIDTH_MM,
  canvasHeight = A4_HEIGHT_MM,
  gridSize = 5,
  gridEnabled = true,
  snapToGrid = true,
  onItemsChange,
  onItemSelect,
  onSave,
  readOnly = false
}: DocumentCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(gridEnabled)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [draggingItem, setDraggingItem] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  // Notify parent when selection changes
  useEffect(() => {
    if (onItemSelect) {
      onItemSelect(selectedItemId)
    }
  }, [selectedItemId, onItemSelect])

  // Convert mm to pixels for display
  const canvasWidthPx = canvasWidth * MM_TO_PX * zoom
  const canvasHeightPx = canvasHeight * MM_TO_PX * zoom

  // Snap to grid function
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid || !gridSize) return value
    return Math.round(value / gridSize) * gridSize
  }, [snapToGrid, gridSize])

  // Handle item drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    if (readOnly) return
    e.stopPropagation()
    
    const item = items.find(i => i.id === itemId)
    if (!item || item.locked) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const offsetX = e.clientX - rect.left - (item.x_mm * MM_TO_PX * zoom)
    const offsetY = e.clientY - rect.top - (item.y_mm * MM_TO_PX * zoom)

    setDraggingItem({ id: itemId, offsetX, offsetY })
    setSelectedItemId(itemId)
  }, [items, zoom, readOnly])

  // Handle item drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingItem || readOnly) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const xPx = e.clientX - rect.left - draggingItem.offsetX
    const yPx = e.clientY - rect.top - draggingItem.offsetY

    // Convert pixels to mm
    let xMm = xPx / (MM_TO_PX * zoom)
    let yMm = yPx / (MM_TO_PX * zoom)

    // Apply snap to grid
    if (snapToGrid) {
      xMm = snapToGridValue(xMm)
      yMm = snapToGridValue(yMm)
    }

    // Constrain to canvas
    xMm = Math.max(0, Math.min(xMm, canvasWidth))
    yMm = Math.max(0, Math.min(yMm, canvasHeight))

    // Update item position
    const updatedItems = items.map(item =>
      item.id === draggingItem.id
        ? { ...item, x_mm: xMm, y_mm: yMm }
        : item
    )
    onItemsChange(updatedItems)
  }, [draggingItem, items, zoom, canvasWidth, canvasHeight, snapToGrid, snapToGridValue, onItemsChange, readOnly])

  // Handle item drag end
  const handleMouseUp = useCallback(() => {
    setDraggingItem(null)
  }, [])

  // Add event listeners
  useEffect(() => {
    if (draggingItem) {
      window.addEventListener('mouseup', handleMouseUp)
      return () => window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingItem, handleMouseUp])

  // Render grid
  const renderGrid = () => {
    if (!showGrid || !gridSize) return null

    const gridLines: React.ReactElement[] = []
    const gridSizePx = gridSize * MM_TO_PX * zoom

    // Vertical lines
    for (let x = 0; x <= canvasWidthPx; x += gridSizePx) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeightPx}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      )
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeightPx; y += gridSizePx) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidthPx}
          y2={y}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      )
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: canvasWidthPx,
          height: canvasHeightPx,
          pointerEvents: 'none'
        }}
      >
        {gridLines}
      </svg>
    )
  }

  // Render document item
  const renderItem = (item: DocumentItem) => {
    const xPx = item.x_mm * MM_TO_PX * zoom
    const yPx = item.y_mm * MM_TO_PX * zoom
    const widthPx = item.width_mm * MM_TO_PX * zoom
    const heightPx = item.height_mm * MM_TO_PX * zoom

    const isSelected = selectedItemId === item.id

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: xPx,
      top: yPx,
      width: widthPx,
      height: heightPx,
      zIndex: item.z_index,
      transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined,
      cursor: readOnly ? 'default' : (item.locked ? 'not-allowed' : 'move'),
      border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
      boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : undefined,
      opacity: item.style.opacity ?? 1,
      backgroundColor: item.style.background_color,
      borderRadius: item.style.border_radius ? `${item.style.border_radius}px` : undefined,
      padding: `${(item.style.padding_top_mm ?? 0) * MM_TO_PX * zoom}px ${(item.style.padding_right_mm ?? 0) * MM_TO_PX * zoom}px ${(item.style.padding_bottom_mm ?? 0) * MM_TO_PX * zoom}px ${(item.style.padding_left_mm ?? 0) * MM_TO_PX * zoom}px`
    }

    // Apply border styling
    if (item.style.border_width) {
      baseStyle.borderWidth = item.style.border_width
      baseStyle.borderColor = item.style.border_color
      baseStyle.borderStyle = item.style.border_style ?? 'solid'
    }

    // Apply shadow
    if (item.style.shadow) {
      const shadow = item.style.shadow
      baseStyle.boxShadow = `${shadow.offset_x_mm * MM_TO_PX * zoom}px ${shadow.offset_y_mm * MM_TO_PX * zoom}px ${shadow.blur_mm * MM_TO_PX * zoom}px ${shadow.color}`
    }

    let content: React.ReactNode = null

    switch (item.type) {
      case 'title':
      case 'text':
        const textStyle: React.CSSProperties = {
          fontFamily: item.style.font_family ?? 'Arial',
          fontSize: `${(item.style.font_size_pt ?? 12) * zoom}pt`,
          fontWeight: item.style.font_weight ?? 'normal',
          fontStyle: item.style.font_style ?? 'normal',
          textAlign: item.style.text_align ?? 'left',
          color: item.style.text_color ?? '#000000',
          lineHeight: item.style.line_height ?? 1.5,
          letterSpacing: item.style.letter_spacing ? `${item.style.letter_spacing}px` : undefined,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          wordWrap: 'break-word'
        }
        content = (
          <div style={textStyle}>
            {item.content.text || (item.type === 'title' ? 'Title' : 'Text')}
          </div>
        )
        break

      case 'image':
        content = item.content.image_url ? (
          <img
            src={item.content.image_url}
            alt={item.content.image_alt || 'Document image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: item.content.preserve_aspect ? 'contain' : 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            color: '#999'
          }}>
            <ImageIcon className="w-8 h-8" />
          </div>
        )
        break

      case 'shape':
        const shapeStyle: React.CSSProperties = {
          width: '100%',
          height: '100%',
          backgroundColor: item.content.fill_color ?? 'transparent'
        }
        
        if (item.content.shape_type === 'rectangle') {
          content = <div style={shapeStyle} />
        } else if (item.content.shape_type === 'circle') {
          content = <div style={{ ...shapeStyle, borderRadius: '50%' }} />
        } else {
          content = <div style={shapeStyle} />
        }
        break

      case 'tag':
        content = (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e0f2fe',
            border: '2px solid #0ea5e9',
            borderRadius: '4px',
            fontSize: `${12 * zoom}pt`,
            color: '#0369a1',
            fontWeight: 500
          }}>
            🏷️ {item.content.tag_label || 'Tag'}
          </div>
        )
        break
    }

    return (
      <div
        key={item.id}
        style={baseStyle}
        onMouseDown={(e) => handleMouseDown(e, item.id)}
        onClick={() => !readOnly && setSelectedItemId(item.id)}
      >
        {content}
        {isSelected && !readOnly && !item.locked && (
          <div
            style={{
              position: 'absolute',
              right: -4,
              bottom: -4,
              width: 8,
              height: 8,
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              cursor: 'nwse-resize'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant={showGrid ? 'default' : 'outline'}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          
          <div className="flex items-center gap-1 border-l pl-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(1)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1" />

          {onSave && (
            <Button size="sm" onClick={onSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}

          <div className="text-xs text-muted-foreground">
            {canvasWidth} × {canvasHeight} mm
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-4 overflow-auto">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-xl mx-auto"
          style={{
            width: canvasWidthPx,
            height: canvasHeightPx
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {renderGrid()}
          {items
            .sort((a, b) => a.z_index - b.z_index)
            .map(renderItem)}
        </div>
      </Card>

      {/* Info Panel */}
      {selectedItemId && (
        <Card className="p-3">
          <div className="text-sm space-y-1">
            <div className="font-medium">Selected Item</div>
            {(() => {
              const item = items.find(i => i.id === selectedItemId)
              if (!item) return null
              return (
                <div className="text-muted-foreground space-y-0.5">
                  <div>Position: {item.x_mm.toFixed(1)} × {item.y_mm.toFixed(1)} mm</div>
                  <div>Size: {item.width_mm.toFixed(1)} × {item.height_mm.toFixed(1)} mm</div>
                  <div>Type: {item.type}</div>
                </div>
              )
            })()}
          </div>
        </Card>
      )}
    </div>
  )
}
