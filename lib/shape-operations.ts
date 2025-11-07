/**
 * Shape Operations Manager - Mirror, Flip, Duplicate, Layer Ordering
 * 
 * Features:
 * - Mirror horizontal/vertical
 * - Flip shapes
 * - Duplicate with offset
 * - Layer ordering (bring to front/back, forward/backward)
 * - Group operations
 */

export interface Shape {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  type: string
  zIndex?: number
  [key: string]: any
}

export interface DuplicateOptions {
  offsetX?: number
  offsetY?: number
  count?: number
  spacing?: number
}

export class ShapeOperations {
  private shapes: Shape[] = []

  constructor(shapes: Shape[] = []) {
    this.shapes = shapes
  }

  /**
   * Update shapes list
   */
  setShapes(shapes: Shape[]) {
    this.shapes = shapes
  }

  /**
   * Get shapes list
   */
  getShapes(): Shape[] {
    return this.shapes
  }

  /**
   * Mirror shape horizontally
   */
  mirrorHorizontal(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const width = shape.width || 100

    // Create mirrored shape
    const mirrored = {
      ...shape,
      scaleX: -(shape.scaleX || 1),
      x: shape.x + width
    }

    return mirrored
  }

  /**
   * Mirror multiple shapes horizontally
   */
  mirrorHorizontalMultiple(shapeIds: string[]): Shape[] {
    const mirrored: Shape[] = []

    shapeIds.forEach(id => {
      const result = this.mirrorHorizontal(id)
      if (result) {
        mirrored.push(result)
      }
    })

    return mirrored
  }

  /**
   * Mirror shape vertically
   */
  mirrorVertical(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const height = shape.height || 100

    // Create mirrored shape
    const mirrored = {
      ...shape,
      scaleY: -(shape.scaleY || 1),
      y: shape.y + height
    }

    return mirrored
  }

  /**
   * Mirror multiple shapes vertically
   */
  mirrorVerticalMultiple(shapeIds: string[]): Shape[] {
    const mirrored: Shape[] = []

    shapeIds.forEach(id => {
      const result = this.mirrorVertical(id)
      if (result) {
        mirrored.push(result)
      }
    })

    return mirrored
  }

  /**
   * Flip shape horizontally (in place)
   */
  flipHorizontal(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    // Flip by inverting scaleX
    return {
      ...shape,
      scaleX: -(shape.scaleX || 1)
    }
  }

  /**
   * Flip shape vertically (in place)
   */
  flipVertical(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    // Flip by inverting scaleY
    return {
      ...shape,
      scaleY: -(shape.scaleY || 1)
    }
  }

  /**
   * Flip multiple shapes horizontally
   */
  flipHorizontalMultiple(shapeIds: string[]): Shape[] {
    const flipped: Shape[] = []

    shapeIds.forEach(id => {
      const result = this.flipHorizontal(id)
      if (result) {
        flipped.push(result)
      }
    })

    return flipped
  }

  /**
   * Flip multiple shapes vertically
   */
  flipVerticalMultiple(shapeIds: string[]): Shape[] {
    const flipped: Shape[] = []

    shapeIds.forEach(id => {
      const result = this.flipVertical(id)
      if (result) {
        flipped.push(result)
      }
    })

    return flipped
  }

  /**
   * Duplicate shape with offset
   */
  duplicate(shapeId: string, options: DuplicateOptions = {}): Shape[] {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return []

    const {
      offsetX = 20,
      offsetY = 20,
      count = 1,
      spacing = 1
    } = options

    const duplicates: Shape[] = []

    for (let i = 0; i < count; i++) {
      const multiplier = (i + 1) * spacing
      const duplicate = {
        ...shape,
        id: `${shape.id}-copy-${Date.now()}-${i}`,
        x: shape.x + offsetX * multiplier,
        y: shape.y + offsetY * multiplier
      }
      duplicates.push(duplicate)
    }

    return duplicates
  }

  /**
   * Duplicate multiple shapes
   */
  duplicateMultiple(shapeIds: string[], options: DuplicateOptions = {}): Shape[] {
    const allDuplicates: Shape[] = []

    shapeIds.forEach(id => {
      const duplicates = this.duplicate(id, options)
      allDuplicates.push(...duplicates)
    })

    return allDuplicates
  }

  /**
   * Get max Z-index
   */
  private getMaxZIndex(): number {
    return this.shapes.reduce((max, shape) => {
      return Math.max(max, shape.zIndex || 0)
    }, 0)
  }

  /**
   * Get min Z-index
   */
  private getMinZIndex(): number {
    return this.shapes.reduce((min, shape) => {
      return Math.min(min, shape.zIndex || 0)
    }, 0)
  }

  /**
   * Bring shape to front
   */
  bringToFront(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const maxZIndex = this.getMaxZIndex()

    return {
      ...shape,
      zIndex: maxZIndex + 1
    }
  }

  /**
   * Bring multiple shapes to front
   */
  bringToFrontMultiple(shapeIds: string[]): Shape[] {
    const updated: Shape[] = []
    let maxZIndex = this.getMaxZIndex()

    shapeIds.forEach(id => {
      const shape = this.shapes.find(s => s.id === id)
      if (shape) {
        maxZIndex++
        updated.push({
          ...shape,
          zIndex: maxZIndex
        })
      }
    })

    return updated
  }

  /**
   * Send shape to back
   */
  sendToBack(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const minZIndex = this.getMinZIndex()

    return {
      ...shape,
      zIndex: minZIndex - 1
    }
  }

  /**
   * Send multiple shapes to back
   */
  sendToBackMultiple(shapeIds: string[]): Shape[] {
    const updated: Shape[] = []
    let minZIndex = this.getMinZIndex()

    shapeIds.forEach(id => {
      const shape = this.shapes.find(s => s.id === id)
      if (shape) {
        minZIndex--
        updated.push({
          ...shape,
          zIndex: minZIndex
        })
      }
    })

    return updated
  }

  /**
   * Bring shape forward (one level)
   */
  bringForward(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const currentZ = shape.zIndex || 0

    // Find next higher Z-index
    const nextHigherZ = this.shapes
      .map(s => s.zIndex || 0)
      .filter(z => z > currentZ)
      .sort((a, b) => a - b)[0]

    if (nextHigherZ === undefined) {
      // Already at top
      return shape
    }

    // Swap Z-indexes
    return {
      ...shape,
      zIndex: nextHigherZ
    }
  }

  /**
   * Send shape backward (one level)
   */
  sendBackward(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    const currentZ = shape.zIndex || 0

    // Find next lower Z-index
    const nextLowerZ = this.shapes
      .map(s => s.zIndex || 0)
      .filter(z => z < currentZ)
      .sort((a, b) => b - a)[0]

    if (nextLowerZ === undefined) {
      // Already at bottom
      return shape
    }

    // Swap Z-indexes
    return {
      ...shape,
      zIndex: nextLowerZ
    }
  }

  /**
   * Rotate shape by degrees
   */
  rotate(shapeId: string, degrees: number): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    return {
      ...shape,
      rotation: ((shape.rotation || 0) + degrees) % 360
    }
  }

  /**
   * Rotate multiple shapes
   */
  rotateMultiple(shapeIds: string[], degrees: number): Shape[] {
    const rotated: Shape[] = []

    shapeIds.forEach(id => {
      const result = this.rotate(id, degrees)
      if (result) {
        rotated.push(result)
      }
    })

    return rotated
  }

  /**
   * Reset rotation to 0
   */
  resetRotation(shapeId: string): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    return {
      ...shape,
      rotation: 0
    }
  }

  /**
   * Scale shape
   */
  scale(shapeId: string, scaleX: number, scaleY?: number): Shape | null {
    const shape = this.shapes.find(s => s.id === shapeId)
    if (!shape) return null

    return {
      ...shape,
      scaleX: scaleX,
      scaleY: scaleY !== undefined ? scaleY : scaleX
    }
  }

  /**
   * Delete shape
   */
  delete(shapeId: string): boolean {
    const index = this.shapes.findIndex(s => s.id === shapeId)
    if (index === -1) return false

    this.shapes.splice(index, 1)
    return true
  }

  /**
   * Delete multiple shapes
   */
  deleteMultiple(shapeIds: string[]): number {
    let deleted = 0

    shapeIds.forEach(id => {
      if (this.delete(id)) {
        deleted++
      }
    })

    return deleted
  }

  /**
   * Copy shape data to clipboard
   */
  copy(shapeIds: string[]): Shape[] {
    return this.shapes.filter(s => shapeIds.includes(s.id))
  }

  /**
   * Paste shapes from clipboard
   */
  paste(shapes: Shape[], offsetX = 20, offsetY = 20): Shape[] {
    const pasted: Shape[] = []

    shapes.forEach(shape => {
      const newShape = {
        ...shape,
        id: `${shape.id}-paste-${Date.now()}`,
        x: shape.x + offsetX,
        y: shape.y + offsetY
      }
      pasted.push(newShape)
      this.shapes.push(newShape)
    })

    return pasted
  }
}

/**
 * Create a new ShapeOperations instance
 */
export function createShapeOperations(shapes: Shape[] = []): ShapeOperations {
  return new ShapeOperations(shapes)
}
