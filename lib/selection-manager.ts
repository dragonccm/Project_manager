/**
 * Selection Manager - Quản lý multi-select và lasso selection
 * 
 * Features:
 * - Lasso selection với mouse drag
 * - Multi-select với Shift/Ctrl click
 * - Select all / Deselect all
 * - Selection box rendering
 * - Hit testing cho shapes
 * - Bounding box calculation
 */

export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface Shape {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  type: string
  // ... other shape properties
}

export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
}

export class SelectionManager {
  private selectedIds: Set<string> = new Set()
  private shapes: Shape[] = []
  private selectionBox: SelectionBox | null = null
  private isSelecting = false

  constructor(shapes: Shape[] = []) {
    this.shapes = shapes
  }

  /**
   * Update shapes list
   */
  setShapes(shapes: Shape[]) {
    this.shapes = shapes
    // Remove selected IDs that no longer exist
    const shapeIds = new Set(shapes.map(s => s.id))
    this.selectedIds.forEach(id => {
      if (!shapeIds.has(id)) {
        this.selectedIds.delete(id)
      }
    })
  }

  /**
   * Start lasso selection
   */
  startSelection(x: number, y: number) {
    this.isSelecting = true
    this.selectionBox = {
      startX: x,
      startY: y,
      endX: x,
      endY: y
    }
  }

  /**
   * Update lasso selection
   */
  updateSelection(x: number, y: number) {
    if (!this.isSelecting || !this.selectionBox) return

    this.selectionBox.endX = x
    this.selectionBox.endY = y
  }

  /**
   * End lasso selection
   */
  endSelection(addToSelection = false): string[] {
    if (!this.isSelecting || !this.selectionBox) return []

    const box = this.getNormalizedSelectionBox()
    if (!box) {
      this.isSelecting = false
      this.selectionBox = null
      return []
    }

    // Find shapes in selection box
    const shapesInBox = this.shapes.filter(shape => 
      this.isShapeInBox(shape, box)
    )

    if (!addToSelection) {
      this.selectedIds.clear()
    }

    shapesInBox.forEach(shape => {
      this.selectedIds.add(shape.id)
    })

    this.isSelecting = false
    this.selectionBox = null

    return Array.from(this.selectedIds)
  }

  /**
   * Cancel selection
   */
  cancelSelection() {
    this.isSelecting = false
    this.selectionBox = null
  }

  /**
   * Get normalized selection box (x, y, width, height)
   */
  getNormalizedSelectionBox(): Rectangle | null {
    if (!this.selectionBox) return null

    const { startX, startY, endX, endY } = this.selectionBox
    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const width = Math.abs(endX - startX)
    const height = Math.abs(endY - startY)

    return { x, y, width, height }
  }

  /**
   * Check if shape is in selection box
   */
  private isShapeInBox(shape: Shape, box: Rectangle): boolean {
    const shapeWidth = shape.width || 100
    const shapeHeight = shape.height || 100

    // Get shape bounds considering rotation
    const shapeBounds = this.getShapeBounds(shape)

    // Check if box overlaps with shape bounds
    return !(
      shapeBounds.x + shapeBounds.width < box.x ||
      shapeBounds.x > box.x + box.width ||
      shapeBounds.y + shapeBounds.height < box.y ||
      shapeBounds.y > box.y + box.height
    )
  }

  /**
   * Get shape bounding box considering rotation
   */
  private getShapeBounds(shape: Shape): Rectangle {
    const width = shape.width || 100
    const height = shape.height || 100
    const rotation = shape.rotation || 0

    if (rotation === 0) {
      return {
        x: shape.x,
        y: shape.y,
        width,
        height
      }
    }

    // Calculate rotated bounding box
    const rad = (rotation * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))

    const rotatedWidth = width * cos + height * sin
    const rotatedHeight = width * sin + height * cos

    return {
      x: shape.x - (rotatedWidth - width) / 2,
      y: shape.y - (rotatedHeight - height) / 2,
      width: rotatedWidth,
      height: rotatedHeight
    }
  }

  /**
   * Select shape (single or add to selection)
   */
  selectShape(id: string, addToSelection = false) {
    if (!addToSelection) {
      this.selectedIds.clear()
    }
    this.selectedIds.add(id)
    return Array.from(this.selectedIds)
  }

  /**
   * Deselect shape
   */
  deselectShape(id: string) {
    this.selectedIds.delete(id)
    return Array.from(this.selectedIds)
  }

  /**
   * Toggle shape selection
   */
  toggleShape(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id)
    } else {
      this.selectedIds.add(id)
    }
    return Array.from(this.selectedIds)
  }

  /**
   * Select all shapes
   */
  selectAll() {
    this.selectedIds.clear()
    this.shapes.forEach(shape => {
      this.selectedIds.add(shape.id)
    })
    return Array.from(this.selectedIds)
  }

  /**
   * Deselect all shapes
   */
  deselectAll() {
    this.selectedIds.clear()
    return []
  }

  /**
   * Get selected shape IDs
   */
  getSelectedIds(): string[] {
    return Array.from(this.selectedIds)
  }

  /**
   * Get selected shapes
   */
  getSelectedShapes(): Shape[] {
    return this.shapes.filter(shape => this.selectedIds.has(shape.id))
  }

  /**
   * Check if shape is selected
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id)
  }

  /**
   * Get selection count
   */
  getSelectionCount(): number {
    return this.selectedIds.size
  }

  /**
   * Get selection bounds (bounding box of all selected shapes)
   */
  getSelectionBounds(): Rectangle | null {
    const selectedShapes = this.getSelectedShapes()
    if (selectedShapes.length === 0) return null

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    selectedShapes.forEach(shape => {
      const bounds = this.getShapeBounds(shape)
      minX = Math.min(minX, bounds.x)
      minY = Math.min(minY, bounds.y)
      maxX = Math.max(maxX, bounds.x + bounds.width)
      maxY = Math.max(maxY, bounds.y + bounds.height)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Check if currently selecting (lasso active)
   */
  isActivelySelecting(): boolean {
    return this.isSelecting
  }

  /**
   * Get current selection box
   */
  getSelectionBox(): SelectionBox | null {
    return this.selectionBox
  }

  /**
   * Hit test - check if point is inside shape
   */
  hitTest(x: number, y: number): string | null {
    // Test from top to bottom (reverse order for Z-index)
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i]
      const bounds = this.getShapeBounds(shape)

      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        return shape.id
      }
    }

    return null
  }

  /**
   * Select shapes at point (for click selection)
   */
  selectAtPoint(x: number, y: number, addToSelection = false): string[] {
    const hitId = this.hitTest(x, y)
    
    if (!hitId) {
      if (!addToSelection) {
        this.deselectAll()
      }
      return Array.from(this.selectedIds)
    }

    if (addToSelection) {
      this.toggleShape(hitId)
    } else {
      this.selectShape(hitId, false)
    }

    return Array.from(this.selectedIds)
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      selectedIds: Array.from(this.selectedIds),
      isSelecting: this.isSelecting,
      selectionBox: this.selectionBox
    }
  }

  /**
   * Restore from JSON
   */
  fromJSON(data: any) {
    this.selectedIds = new Set(data.selectedIds || [])
    this.isSelecting = data.isSelecting || false
    this.selectionBox = data.selectionBox || null
  }
}

/**
 * Create a new SelectionManager instance
 */
export function createSelectionManager(shapes: Shape[] = []): SelectionManager {
  return new SelectionManager(shapes)
}
