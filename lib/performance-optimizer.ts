/**
 * Performance Optimization Utilities
 * 
 * Features:
 * - Virtual rendering for large datasets
 * - Memoization helpers
 * - Lazy loading
 * - Render optimization
 */

import React from 'react'

/**
 * Virtual rendering for large shape lists
 */
export class VirtualRenderer {
  private viewport: { width: number; height: number; x: number; y: number }
  private padding: number

  constructor(viewport: { width: number; height: number; x: number; y: number }, padding = 100) {
    this.viewport = viewport
    this.padding = padding
  }

  /**
   * Update viewport (call when canvas pans/zooms)
   */
  updateViewport(viewport: { width: number; height: number; x: number; y: number }) {
    this.viewport = viewport
  }

  /**
   * Check if shape is visible in viewport
   */
  isVisible(shape: any): boolean {
    const bounds = this.getShapeBounds(shape)
    
    // Add padding to viewport
    const viewMinX = this.viewport.x - this.padding
    const viewMinY = this.viewport.y - this.padding
    const viewMaxX = this.viewport.x + this.viewport.width + this.padding
    const viewMaxY = this.viewport.y + this.viewport.height + this.padding

    // Check intersection
    return !(
      bounds.maxX < viewMinX ||
      bounds.minX > viewMaxX ||
      bounds.maxY < viewMinY ||
      bounds.minY > viewMaxY
    )
  }

  /**
   * Filter visible shapes
   */
  filterVisible(shapes: any[]): any[] {
    return shapes.filter(shape => this.isVisible(shape))
  }

  /**
   * Get shape bounds (considering rotation)
   */
  private getShapeBounds(shape: any) {
    const { x, y, width, height, rotation = 0 } = shape

    if (rotation === 0) {
      return {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height
      }
    }

    // Calculate rotated bounds
    const rad = (rotation * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))
    
    const rotatedWidth = width * cos + height * sin
    const rotatedHeight = width * sin + height * cos

    return {
      minX: x,
      minY: y,
      maxX: x + rotatedWidth,
      maxY: y + rotatedHeight
    }
  }

  /**
   * Get statistics
   */
  getStats(totalShapes: number, visibleShapes: number) {
    const culled = totalShapes - visibleShapes
    const culledPercent = ((culled / totalShapes) * 100).toFixed(1)
    
    return {
      total: totalShapes,
      visible: visibleShapes,
      culled,
      culledPercent: `${culledPercent}%`
    }
  }
}

/**
 * Memoization helper with custom equality
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Memoization with LRU cache (limited size)
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * Lazy loading with intersection observer
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null
  private callbacks = new Map<Element, () => void>()

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window === 'undefined') return

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback()
            this.unobserve(entry.target)
          }
        }
      })
    }, {
      rootMargin: '50px',
      ...options
    })
  }

  /**
   * Observe an element
   */
  observe(element: Element, callback: () => void) {
    if (!this.observer) return

    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  /**
   * Stop observing an element
   */
  unobserve(element: Element) {
    if (!this.observer) return

    this.observer.unobserve(element)
    this.callbacks.delete(element)
  }

  /**
   * Disconnect observer
   */
  disconnect() {
    if (!this.observer) return

    this.observer.disconnect()
    this.callbacks.clear()
  }
}

/**
 * React hooks for optimization
 */

/**
 * useMemoCompare - Memoize with custom comparison
 */
export function useMemoCompare<T>(
  value: T,
  compare: (prev: T | undefined, next: T) => boolean
): T {
  const ref = React.useRef<T>()

  if (!ref.current || !compare(ref.current, value)) {
    ref.current = value
  }

  return ref.current
}

/**
 * useDebounce - Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useThrottle - Throttled value
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastRan = React.useRef(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * useVirtualScroll - Virtual scrolling hook
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0)

  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }
  }
}

/**
 * Batch operations for better performance
 */
export class BatchProcessor {
  private queue: Array<() => void> = []
  private processing = false
  private batchSize: number
  private frameDelay: number

  constructor(batchSize = 50, frameDelay = 1) {
    this.batchSize = batchSize
    this.frameDelay = frameDelay
  }

  /**
   * Add operation to queue
   */
  add(operation: () => void) {
    this.queue.push(operation)
    if (!this.processing) {
      this.process()
    }
  }

  /**
   * Process batch
   */
  private async process() {
    this.processing = true

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)
      
      // Execute batch
      batch.forEach(op => op())

      // Wait for next frame
      if (this.queue.length > 0) {
        await this.waitFrames(this.frameDelay)
      }
    }

    this.processing = false
  }

  /**
   * Wait for animation frames
   */
  private waitFrames(count: number): Promise<void> {
    return new Promise(resolve => {
      let remaining = count
      const waitFrame = () => {
        remaining--
        if (remaining <= 0) {
          resolve()
        } else {
          requestAnimationFrame(waitFrame)
        }
      }
      requestAnimationFrame(waitFrame)
    })
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = []
  }

  /**
   * Get queue length
   */
  get queueLength(): number {
    return this.queue.length
  }
}

/**
 * Request animation frame helper
 */
export class RAFScheduler {
  private tasks = new Set<() => void>()
  private rafId: number | null = null

  /**
   * Schedule a task
   */
  schedule(task: () => void) {
    this.tasks.add(task)
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush())
    }
  }

  /**
   * Flush all tasks
   */
  private flush() {
    const tasks = Array.from(this.tasks)
    this.tasks.clear()
    this.rafId = null

    tasks.forEach(task => {
      try {
        task()
      } catch (error) {
        console.error('RAF task error:', error)
      }
    })
  }

  /**
   * Cancel all tasks
   */
  cancel() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.tasks.clear()
  }
}

/**
 * Image preloader
 */
export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>()
  private loading = new Map<string, Promise<HTMLImageElement>>()

  /**
   * Preload an image
   */
  async load(url: string): Promise<HTMLImageElement> {
    // Check cache
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    // Check if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url)!
    }

    // Start loading
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.cache.set(url, img)
        this.loading.delete(url)
        resolve(img)
      }
      img.onerror = () => {
        this.loading.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }
      img.src = url
    })

    this.loading.set(url, promise)
    return promise
  }

  /**
   * Preload multiple images
   */
  async loadMultiple(urls: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(urls.map(url => this.load(url)))
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Get cached image
   */
  get(url: string): HTMLImageElement | undefined {
    return this.cache.get(url)
  }
}

/**
 * Global instances
 */
export const imagePreloader = new ImagePreloader()
export const rafScheduler = new RAFScheduler()
export const batchProcessor = new BatchProcessor()
