/**
 * Test Utilities & Helpers for A4 Editor
 * 
 * Features:
 * - Shape validation
 * - Performance monitoring
 * - Memory leak detection
 * - Bug fix helpers
 */

/**
 * Shape validation utilities
 */
export class ShapeValidator {
  /**
   * Validate shape rotation calculations
   */
  static validateRotation(shape: any, expectedRotation: number): boolean {
    const tolerance = 0.01
    const diff = Math.abs(shape.rotation - expectedRotation)
    if (diff > tolerance) {
      console.error(`Rotation mismatch: expected ${expectedRotation}, got ${shape.rotation}`)
      return false
    }
    return true
  }

  /**
   * Validate shape bounds after transformation
   */
  static validateBounds(shape: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (shape.x === undefined || isNaN(shape.x)) {
      errors.push('Invalid x coordinate')
    }
    if (shape.y === undefined || isNaN(shape.y)) {
      errors.push('Invalid y coordinate')
    }
    if (shape.width <= 0 || isNaN(shape.width)) {
      errors.push('Invalid width')
    }
    if (shape.height <= 0 || isNaN(shape.height)) {
      errors.push('Invalid height')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate grouped shapes maintain relative positions
   */
  static validateGroupedShapes(shapes: any[]): boolean {
    if (shapes.length < 2) return true

    const firstShape = shapes[0]
    const baseDistance = {
      x: shapes[1].x - firstShape.x,
      y: shapes[1].y - firstShape.y
    }

    for (let i = 2; i < shapes.length; i++) {
      const expectedX = firstShape.x + baseDistance.x * i
      const expectedY = firstShape.y + baseDistance.y * i
      const tolerance = 0.1

      if (
        Math.abs(shapes[i].x - expectedX) > tolerance ||
        Math.abs(shapes[i].y - expectedY) > tolerance
      ) {
        console.error(`Group position mismatch at index ${i}`)
        return false
      }
    }

    return true
  }

  /**
   * Fix rotation anchor point calculations
   */
  static fixRotationAnchor(shape: any, anchorX: number, anchorY: number, rotation: number) {
    // Convert rotation to radians
    const rad = (rotation * Math.PI) / 180

    // Calculate offset from anchor
    const dx = shape.x - anchorX
    const dy = shape.y - anchorY

    // Rotate offset
    const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad)
    const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad)

    // Calculate new position
    return {
      x: anchorX + rotatedX,
      y: anchorY + rotatedY,
      rotation: shape.rotation + rotation
    }
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  /**
   * Start timing an operation
   */
  start(label: string) {
    this.marks.set(label, performance.now())
  }

  /**
   * End timing and record duration
   */
  end(label: string): number {
    const startTime = this.marks.get(label)
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`)
      return 0
    }

    const duration = performance.now() - startTime
    this.marks.delete(label)

    // Record measure
    if (!this.measures.has(label)) {
      this.measures.set(label, [])
    }
    this.measures.get(label)!.push(duration)

    return duration
  }

  /**
   * Get statistics for a label
   */
  getStats(label: string) {
    const measures = this.measures.get(label) || []
    if (measures.length === 0) {
      return null
    }

    const sorted = [...measures].sort((a, b) => a - b)
    const sum = measures.reduce((a, b) => a + b, 0)

    return {
      count: measures.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / measures.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  /**
   * Log all statistics
   */
  logAll() {
    console.group('Performance Statistics')
    this.measures.forEach((_, label) => {
      const stats = this.getStats(label)
      if (stats) {
        console.log(`${label}:`, stats)
      }
    })
    console.groupEnd()
  }

  /**
   * Clear all measures
   */
  clear() {
    this.marks.clear()
    this.measures.clear()
  }

  /**
   * Check if operation is slow
   */
  isSlow(label: string, threshold: number = 16.67): boolean {
    const stats = this.getStats(label)
    return stats ? stats.avg > threshold : false
  }
}

/**
 * Memory leak detection utilities
 */
export class MemoryLeakDetector {
  private snapshots: Map<string, any> = new Map()
  private listenerCounts: Map<string, number> = new Map()

  /**
   * Take a memory snapshot
   */
  takeSnapshot(label: string) {
    if (typeof window === 'undefined') return

    const snapshot = {
      timestamp: Date.now(),
      // @ts-ignore - performance.memory is only in Chrome
      memory: (performance as any).memory ? {
        // @ts-ignore
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        // @ts-ignore
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null,
      listeners: this.countEventListeners()
    }

    this.snapshots.set(label, snapshot)
    return snapshot
  }

  /**
   * Compare two snapshots
   */
  compare(label1: string, label2: string) {
    const snap1 = this.snapshots.get(label1)
    const snap2 = this.snapshots.get(label2)

    if (!snap1 || !snap2) {
      console.warn('Snapshots not found')
      return null
    }

    const result: any = {
      timeDiff: snap2.timestamp - snap1.timestamp,
      listenerDiff: snap2.listeners - snap1.listeners
    }

    if (snap1.memory && snap2.memory) {
      result.memoryDiff = {
        used: snap2.memory.usedJSHeapSize - snap1.memory.usedJSHeapSize,
        total: snap2.memory.totalJSHeapSize - snap1.memory.totalJSHeapSize
      }
    }

    return result
  }

  /**
   * Count event listeners (approximate)
   */
  private countEventListeners(): number {
    if (typeof window === 'undefined') return 0

    let count = 0
    const proto = EventTarget.prototype as any
    
    // This is a rough estimate
    if (proto._addEventListener) {
      count = proto._addEventListener.length || 0
    }

    return count
  }

  /**
   * Detect potential memory leaks
   */
  detectLeaks(): string[] {
    const issues: string[] = []

    // Check listener count growth
    this.snapshots.forEach((snapshot, label) => {
      if (snapshot.listeners > 100) {
        issues.push(`High listener count in ${label}: ${snapshot.listeners}`)
      }
    })

    // Check memory growth
    const snapshots = Array.from(this.snapshots.values())
    if (snapshots.length >= 2) {
      const recent = snapshots.slice(-2)
      if (recent[0].memory && recent[1].memory) {
        const growth = recent[1].memory.usedJSHeapSize - recent[0].memory.usedJSHeapSize
        const growthMB = growth / (1024 * 1024)
        
        if (growthMB > 10) {
          issues.push(`Large memory growth: ${growthMB.toFixed(2)}MB`)
        }
      }
    }

    return issues
  }

  /**
   * Clear snapshots
   */
  clear() {
    this.snapshots.clear()
    this.listenerCounts.clear()
  }
}

/**
 * Bug fix helpers
 */
export class BugFixHelpers {
  /**
   * Fix multi-select offset calculation
   */
  static fixMultiSelectOffset(shapes: any[], dragDelta: { x: number; y: number }) {
    // Calculate the center of all selected shapes
    const bounds = this.calculateBounds(shapes)
    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2

    // Apply offset from center
    return shapes.map(shape => ({
      ...shape,
      x: shape.x + dragDelta.x,
      y: shape.y + dragDelta.y
    }))
  }

  /**
   * Calculate bounds of multiple shapes
   */
  static calculateBounds(shapes: any[]) {
    if (shapes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    shapes.forEach(shape => {
      const rotation = shape.rotation || 0
      
      if (rotation === 0) {
        // Simple case: no rotation
        minX = Math.min(minX, shape.x)
        minY = Math.min(minY, shape.y)
        maxX = Math.max(maxX, shape.x + shape.width)
        maxY = Math.max(maxY, shape.y + shape.height)
      } else {
        // Complex case: handle rotation
        const corners = this.getRotatedCorners(shape)
        corners.forEach(corner => {
          minX = Math.min(minX, corner.x)
          minY = Math.min(minY, corner.y)
          maxX = Math.max(maxX, corner.x)
          maxY = Math.max(maxY, corner.y)
        })
      }
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Get corners of a rotated shape
   */
  static getRotatedCorners(shape: any) {
    const { x, y, width, height, rotation = 0 } = shape
    const rad = (rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ]

    return corners.map(corner => ({
      x: x + corner.x * cos - corner.y * sin,
      y: y + corner.x * sin + corner.y * cos
    }))
  }

  /**
   * Sanitize shape data before saving
   */
  static sanitizeShape(shape: any) {
    return {
      ...shape,
      x: Number(shape.x) || 0,
      y: Number(shape.y) || 0,
      width: Math.max(1, Number(shape.width) || 1),
      height: Math.max(1, Number(shape.height) || 1),
      rotation: Number(shape.rotation) || 0,
      scaleX: Number(shape.scaleX) || 1,
      scaleY: Number(shape.scaleY) || 1,
      opacity: Math.max(0, Math.min(1, Number(shape.opacity) || 1))
    }
  }

  /**
   * Deep clone object (avoiding circular references)
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any
    }

    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as any
    }

    const cloned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone((obj as any)[key])
      }
    }

    return cloned
  }
}

/**
 * Debounce utility with TypeScript support
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle utility with TypeScript support
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Retry utility for async operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: boolean
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }

      const waitTime = backoff ? delay * attempt : delay
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw new Error('Max attempts reached')
}

/**
 * Global instances for easy access
 */
export const performanceMonitor = new PerformanceMonitor()
export const memoryLeakDetector = new MemoryLeakDetector()
