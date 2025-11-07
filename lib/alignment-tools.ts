/**
 * Advanced Alignment & Distribution Tools
 * Smart guides, alignment helpers, distribution tools
 */

import { Shape } from '@/types/database'

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal'
  position: number
  shapes: string[] // IDs of shapes aligned to this guide
}

export interface SmartGuide {
  type: 'center' | 'edge' | 'spacing'
  orientation: 'vertical' | 'horizontal'
  position: number
  referenceShapes: string[]
}

export class AlignmentManager {
  private guides: AlignmentGuide[] = []
  private smartGuidesEnabled: boolean = true
  private snapTolerance: number = 5

  constructor(snapTolerance: number = 5) {
    this.snapTolerance = snapTolerance
  }

  // Enable/disable smart guides
  setSmartGuidesEnabled(enabled: boolean) {
    this.smartGuidesEnabled = enabled
  }

  // Align shapes to left edge
  alignLeft(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const minX = Math.min(...shapes.map(s => s.x))
    return shapes.map(shape => ({
      ...shape,
      x: minX
    }))
  }

  // Align shapes to right edge
  alignRight(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const maxRight = Math.max(...shapes.map(s => s.x + (s.width || 0)))
    return shapes.map(shape => ({
      ...shape,
      x: maxRight - (shape.width || 0)
    }))
  }

  // Align shapes to top edge
  alignTop(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const minY = Math.min(...shapes.map(s => s.y))
    return shapes.map(shape => ({
      ...shape,
      y: minY
    }))
  }

  // Align shapes to bottom edge
  alignBottom(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const maxBottom = Math.max(...shapes.map(s => s.y + (s.height || 0)))
    return shapes.map(shape => ({
      ...shape,
      y: maxBottom - (shape.height || 0)
    }))
  }

  // Align shapes to horizontal center
  alignCenterHorizontal(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const bounds = this.getBounds(shapes)
    const centerY = bounds.y + bounds.height / 2

    return shapes.map(shape => ({
      ...shape,
      y: centerY - (shape.height || 0) / 2
    }))
  }

  // Align shapes to vertical center
  alignCenterVertical(shapes: Shape[]): Shape[] {
    if (shapes.length < 2) return shapes

    const bounds = this.getBounds(shapes)
    const centerX = bounds.x + bounds.width / 2

    return shapes.map(shape => ({
      ...shape,
      x: centerX - (shape.width || 0) / 2
    }))
  }

  // Distribute shapes horizontally with equal spacing
  distributeHorizontally(shapes: Shape[]): Shape[] {
    if (shapes.length < 3) return shapes

    const sorted = [...shapes].sort((a, b) => a.x - b.x)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    
    const totalWidth = sorted.reduce((sum, s) => sum + (s.width || 0), 0)
    const availableSpace = (last.x + (last.width || 0)) - first.x - totalWidth
    const spacing = availableSpace / (sorted.length - 1)

    let currentX = first.x + (first.width || 0) + spacing

    return sorted.map((shape, index) => {
      if (index === 0 || index === sorted.length - 1) {
        return shape
      }
      
      const newShape = { ...shape, x: currentX }
      currentX += (shape.width || 0) + spacing
      return newShape
    })
  }

  // Distribute shapes vertically with equal spacing
  distributeVertically(shapes: Shape[]): Shape[] {
    if (shapes.length < 3) return shapes

    const sorted = [...shapes].sort((a, b) => a.y - b.y)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    
    const totalHeight = sorted.reduce((sum, s) => sum + (s.height || 0), 0)
    const availableSpace = (last.y + (last.height || 0)) - first.y - totalHeight
    const spacing = availableSpace / (sorted.length - 1)

    let currentY = first.y + (first.height || 0) + spacing

    return sorted.map((shape, index) => {
      if (index === 0 || index === sorted.length - 1) {
        return shape
      }
      
      const newShape = { ...shape, y: currentY }
      currentY += (shape.height || 0) + spacing
      return newShape
    })
  }

  // Make shapes same width
  makeSameWidth(shapes: Shape[], referenceIndex: number = 0): Shape[] {
    if (shapes.length < 2) return shapes

    const referenceWidth = shapes[referenceIndex].width

    return shapes.map(shape => ({
      ...shape,
      width: referenceWidth
    }))
  }

  // Make shapes same height
  makeSameHeight(shapes: Shape[], referenceIndex: number = 0): Shape[] {
    if (shapes.length < 2) return shapes

    const referenceHeight = shapes[referenceIndex].height

    return shapes.map(shape => ({
      ...shape,
      height: referenceHeight
    }))
  }

  // Make shapes same size
  makeSameSize(shapes: Shape[], referenceIndex: number = 0): Shape[] {
    if (shapes.length < 2) return shapes

    const reference = shapes[referenceIndex]

    return shapes.map(shape => ({
      ...shape,
      width: reference.width,
      height: reference.height
    }))
  }

  // Get smart guides when dragging a shape
  getSmartGuides(
    draggedShape: Shape,
    allShapes: Shape[],
    excludeIds: string[] = []
  ): SmartGuide[] {
    if (!this.smartGuidesEnabled) return []

    const guides: SmartGuide[] = []
    const otherShapes = allShapes.filter(s => 
      s.id !== draggedShape.id && !excludeIds.includes(s.id)
    )

    // Check alignment with other shapes
    for (const other of otherShapes) {
      // Vertical center alignment
      const draggedCenterY = draggedShape.y + (draggedShape.height || 0) / 2
      const otherCenterY = other.y + (other.height || 0) / 2
      if (Math.abs(draggedCenterY - otherCenterY) < this.snapTolerance) {
        guides.push({
          type: 'center',
          orientation: 'horizontal',
          position: otherCenterY,
          referenceShapes: [other.id]
        })
      }

      // Horizontal center alignment
      const draggedCenterX = draggedShape.x + (draggedShape.width || 0) / 2
      const otherCenterX = other.x + (other.width || 0) / 2
      if (Math.abs(draggedCenterX - otherCenterX) < this.snapTolerance) {
        guides.push({
          type: 'center',
          orientation: 'vertical',
          position: otherCenterX,
          referenceShapes: [other.id]
        })
      }

      // Left edge alignment
      if (Math.abs(draggedShape.x - other.x) < this.snapTolerance) {
        guides.push({
          type: 'edge',
          orientation: 'vertical',
          position: other.x,
          referenceShapes: [other.id]
        })
      }

      // Right edge alignment
      const draggedRight = draggedShape.x + (draggedShape.width || 0)
      const otherRight = other.x + (other.width || 0)
      if (Math.abs(draggedRight - otherRight) < this.snapTolerance) {
        guides.push({
          type: 'edge',
          orientation: 'vertical',
          position: otherRight,
          referenceShapes: [other.id]
        })
      }

      // Top edge alignment
      if (Math.abs(draggedShape.y - other.y) < this.snapTolerance) {
        guides.push({
          type: 'edge',
          orientation: 'horizontal',
          position: other.y,
          referenceShapes: [other.id]
        })
      }

      // Bottom edge alignment
      const draggedBottom = draggedShape.y + (draggedShape.height || 0)
      const otherBottom = other.y + (other.height || 0)
      if (Math.abs(draggedBottom - otherBottom) < this.snapTolerance) {
        guides.push({
          type: 'edge',
          orientation: 'horizontal',
          position: otherBottom,
          referenceShapes: [other.id]
        })
      }

      // Equal spacing detection
      this.detectEqualSpacing(draggedShape, other, otherShapes, guides)
    }

    return guides
  }

  // Snap shape to smart guides
  snapToGuides(shape: Shape, guides: SmartGuide[]): Shape {
    let snappedShape = { ...shape }

    for (const guide of guides) {
      if (guide.orientation === 'vertical') {
        if (guide.type === 'center') {
          snappedShape.x = guide.position - (snappedShape.width || 0) / 2
        } else if (guide.type === 'edge') {
          // Snap to left edge by default
          snappedShape.x = guide.position
        }
      } else if (guide.orientation === 'horizontal') {
        if (guide.type === 'center') {
          snappedShape.y = guide.position - (snappedShape.height || 0) / 2
        } else if (guide.type === 'edge') {
          // Snap to top edge by default
          snappedShape.y = guide.position
        }
      }
    }

    return snappedShape
  }

  // Get bounding box of multiple shapes
  private getBounds(shapes: Shape[]): { x: number; y: number; width: number; height: number } {
    const minX = Math.min(...shapes.map(s => s.x))
    const minY = Math.min(...shapes.map(s => s.y))
    const maxX = Math.max(...shapes.map(s => s.x + (s.width || 0)))
    const maxY = Math.max(...shapes.map(s => s.y + (s.height || 0)))

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  // Detect equal spacing between shapes
  private detectEqualSpacing(
    draggedShape: Shape,
    referenceShape: Shape,
    otherShapes: Shape[],
    guides: SmartGuide[]
  ) {
    // Check horizontal spacing
    const draggedRight = draggedShape.x + (draggedShape.width || 0)
    const refLeft = referenceShape.x
    const horizontalGap = refLeft - draggedRight

    for (const other of otherShapes) {
      if (other.id === referenceShape.id) continue
      
      const otherRight = other.x + (other.width || 0)
      const refLeft2 = referenceShape.x
      const otherGap = refLeft2 - otherRight

      if (Math.abs(horizontalGap - otherGap) < this.snapTolerance) {
        guides.push({
          type: 'spacing',
          orientation: 'vertical',
          position: draggedRight + horizontalGap / 2,
          referenceShapes: [referenceShape.id, other.id]
        })
      }
    }

    // Check vertical spacing
    const draggedBottom = draggedShape.y + (draggedShape.height || 0)
    const refTop = referenceShape.y
    const verticalGap = refTop - draggedBottom

    for (const other of otherShapes) {
      if (other.id === referenceShape.id) continue
      
      const otherBottom = other.y + (other.height || 0)
      const refTop2 = referenceShape.y
      const otherGap = refTop2 - otherBottom

      if (Math.abs(verticalGap - otherGap) < this.snapTolerance) {
        guides.push({
          type: 'spacing',
          orientation: 'horizontal',
          position: draggedBottom + verticalGap / 2,
          referenceShapes: [referenceShape.id, other.id]
        })
      }
    }
  }
}

// Export singleton instance
export const alignmentManager = new AlignmentManager()
