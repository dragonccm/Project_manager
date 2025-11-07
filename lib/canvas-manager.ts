/**
 * Canvas Manager - Enhanced zoom, pan, and viewport management
 * Supports multiple pages, fit to screen, minimap
 */

export interface CanvasViewport {
  x: number
  y: number
  scale: number
  width: number
  height: number
}

export interface CanvasBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export interface Page {
  id: string
  name: string
  width: number
  height: number
  order: number
  thumbnail?: string
}

export class CanvasManager {
  private viewport: CanvasViewport
  private bounds: CanvasBounds | null = null
  private minZoom: number = 0.1
  private maxZoom: number = 5
  private zoomStep: number = 0.1
  private containerWidth: number
  private containerHeight: number
  private pages: Page[] = []
  private activePage: string | null = null

  constructor(
    containerWidth: number,
    containerHeight: number,
    initialScale: number = 1
  ) {
    this.containerWidth = containerWidth
    this.containerHeight = containerHeight
    this.viewport = {
      x: 0,
      y: 0,
      scale: initialScale,
      width: containerWidth,
      height: containerHeight
    }
  }

  // === ZOOM OPERATIONS ===

  /**
   * Zoom in by one step
   */
  zoomIn(center?: { x: number; y: number }): CanvasViewport {
    return this.setZoom(
      Math.min(this.viewport.scale + this.zoomStep, this.maxZoom),
      center
    )
  }

  /**
   * Zoom out by one step
   */
  zoomOut(center?: { x: number; y: number }): CanvasViewport {
    return this.setZoom(
      Math.max(this.viewport.scale - this.zoomStep, this.minZoom),
      center
    )
  }

  /**
   * Set zoom to specific level
   */
  setZoom(scale: number, center?: { x: number; y: number }): CanvasViewport {
    const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, scale))
    
    if (center) {
      // Zoom to specific point
      const oldScale = this.viewport.scale
      const scaleChange = newScale / oldScale

      // Calculate new position to keep center point fixed
      const newX = center.x - (center.x - this.viewport.x) * scaleChange
      const newY = center.y - (center.y - this.viewport.y) * scaleChange

      this.viewport = {
        ...this.viewport,
        x: newX,
        y: newY,
        scale: newScale
      }
    } else {
      // Zoom to viewport center
      const centerX = this.viewport.width / 2
      const centerY = this.viewport.height / 2
      return this.setZoom(newScale, { x: centerX, y: centerY })
    }

    return this.viewport
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom(): CanvasViewport {
    return this.setZoom(1, {
      x: this.viewport.width / 2,
      y: this.viewport.height / 2
    })
  }

  /**
   * Zoom to fit all content in viewport
   */
  fitToScreen(padding: number = 50): CanvasViewport {
    if (!this.bounds) {
      return this.viewport
    }

    const contentWidth = this.bounds.width
    const contentHeight = this.bounds.height
    const availableWidth = this.containerWidth - padding * 2
    const availableHeight = this.containerHeight - padding * 2

    // Calculate scale to fit
    const scaleX = availableWidth / contentWidth
    const scaleY = availableHeight / contentHeight
    const scale = Math.min(scaleX, scaleY, this.maxZoom)

    // Center the content
    const scaledWidth = contentWidth * scale
    const scaledHeight = contentHeight * scale
    const x = (this.containerWidth - scaledWidth) / 2 - this.bounds.minX * scale
    const y = (this.containerHeight - scaledHeight) / 2 - this.bounds.minY * scale

    this.viewport = {
      ...this.viewport,
      x,
      y,
      scale
    }

    return this.viewport
  }

  /**
   * Fit width of content to viewport
   */
  fitToWidth(padding: number = 50): CanvasViewport {
    if (!this.bounds) {
      return this.viewport
    }

    const contentWidth = this.bounds.width
    const availableWidth = this.containerWidth - padding * 2
    const scale = Math.min(availableWidth / contentWidth, this.maxZoom)

    const scaledWidth = contentWidth * scale
    const x = (this.containerWidth - scaledWidth) / 2 - this.bounds.minX * scale

    this.viewport = {
      ...this.viewport,
      x,
      scale
    }

    return this.viewport
  }

  /**
   * Zoom to specific area
   */
  zoomToArea(
    area: { x: number; y: number; width: number; height: number },
    padding: number = 20
  ): CanvasViewport {
    const scaleX = (this.containerWidth - padding * 2) / area.width
    const scaleY = (this.containerHeight - padding * 2) / area.height
    const scale = Math.min(scaleX, scaleY, this.maxZoom)

    const scaledWidth = area.width * scale
    const scaledHeight = area.height * scale
    const x = (this.containerWidth - scaledWidth) / 2 - area.x * scale
    const y = (this.containerHeight - scaledHeight) / 2 - area.y * scale

    this.viewport = {
      ...this.viewport,
      x,
      y,
      scale
    }

    return this.viewport
  }

  // === PAN OPERATIONS ===

  /**
   * Pan by delta
   */
  pan(deltaX: number, deltaY: number): CanvasViewport {
    this.viewport = {
      ...this.viewport,
      x: this.viewport.x + deltaX,
      y: this.viewport.y + deltaY
    }

    return this.viewport
  }

  /**
   * Set pan position
   */
  setPan(x: number, y: number): CanvasViewport {
    this.viewport = {
      ...this.viewport,
      x,
      y
    }

    return this.viewport
  }

  /**
   * Center viewport on point
   */
  centerOn(x: number, y: number): CanvasViewport {
    this.viewport = {
      ...this.viewport,
      x: this.viewport.width / 2 - x * this.viewport.scale,
      y: this.viewport.height / 2 - y * this.viewport.scale
    }

    return this.viewport
  }

  // === BOUNDS & PAGES ===

  /**
   * Update content bounds
   */
  updateBounds(bounds: CanvasBounds): void {
    this.bounds = bounds
  }

  /**
   * Calculate bounds from shapes
   */
  calculateBounds(shapes: Array<{ x: number; y: number; width?: number; height?: number }>): CanvasBounds {
    if (shapes.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: this.containerWidth,
        maxY: this.containerHeight,
        width: this.containerWidth,
        height: this.containerHeight
      }
    }

    const minX = Math.min(...shapes.map(s => s.x))
    const minY = Math.min(...shapes.map(s => s.y))
    const maxX = Math.max(...shapes.map(s => s.x + (s.width || 0)))
    const maxY = Math.max(...shapes.map(s => s.y + (s.height || 0)))

    const bounds = {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }

    this.bounds = bounds
    return bounds
  }

  /**
   * Add page
   */
  addPage(page: Omit<Page, 'order'>): Page {
    const newPage: Page = {
      ...page,
      order: this.pages.length
    }
    this.pages.push(newPage)
    
    if (!this.activePage) {
      this.activePage = newPage.id
    }
    
    return newPage
  }

  /**
   * Remove page
   */
  removePage(pageId: string): boolean {
    const index = this.pages.findIndex(p => p.id === pageId)
    if (index === -1) return false

    this.pages.splice(index, 1)
    
    // Re-order remaining pages
    this.pages.forEach((page, i) => {
      page.order = i
    })

    // Update active page if needed
    if (this.activePage === pageId) {
      this.activePage = this.pages[0]?.id || null
    }

    return true
  }

  /**
   * Set active page
   */
  setActivePage(pageId: string): boolean {
    const page = this.pages.find(p => p.id === pageId)
    if (!page) return false

    this.activePage = pageId
    return true
  }

  /**
   * Get active page
   */
  getActivePage(): Page | null {
    return this.pages.find(p => p.id === this.activePage) || null
  }

  /**
   * Get all pages
   */
  getPages(): Page[] {
    return [...this.pages].sort((a, b) => a.order - b.order)
  }

  /**
   * Reorder page
   */
  reorderPage(pageId: string, newOrder: number): boolean {
    const page = this.pages.find(p => p.id === pageId)
    if (!page) return false

    const oldOrder = page.order
    
    // Adjust other pages
    this.pages.forEach(p => {
      if (p.id === pageId) {
        p.order = newOrder
      } else if (oldOrder < newOrder) {
        if (p.order > oldOrder && p.order <= newOrder) {
          p.order--
        }
      } else {
        if (p.order >= newOrder && p.order < oldOrder) {
          p.order++
        }
      }
    })

    return true
  }

  // === VIEWPORT INFO ===

  /**
   * Get current viewport
   */
  getViewport(): CanvasViewport {
    return { ...this.viewport }
  }

  /**
   * Get zoom level as percentage
   */
  getZoomPercentage(): number {
    return Math.round(this.viewport.scale * 100)
  }

  /**
   * Check if point is visible in viewport
   */
  isPointVisible(x: number, y: number): boolean {
    const screenX = x * this.viewport.scale + this.viewport.x
    const screenY = y * this.viewport.scale + this.viewport.y

    return (
      screenX >= 0 &&
      screenX <= this.viewport.width &&
      screenY >= 0 &&
      screenY <= this.viewport.height
    )
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.viewport.x) / this.viewport.scale,
      y: (screenY - this.viewport.y) / this.viewport.scale
    }
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: canvasX * this.viewport.scale + this.viewport.x,
      y: canvasY * this.viewport.scale + this.viewport.y
    }
  }

  // === CONTAINER RESIZE ===

  /**
   * Update container size
   */
  updateContainerSize(width: number, height: number): void {
    this.containerWidth = width
    this.containerHeight = height
    this.viewport.width = width
    this.viewport.height = height
  }

  // === MINIMAP ===

  /**
   * Get minimap viewport bounds
   */
  getMinimapViewport(minimapScale: number = 0.1): {
    x: number
    y: number
    width: number
    height: number
  } {
    return {
      x: -this.viewport.x / this.viewport.scale * minimapScale,
      y: -this.viewport.y / this.viewport.scale * minimapScale,
      width: (this.viewport.width / this.viewport.scale) * minimapScale,
      height: (this.viewport.height / this.viewport.scale) * minimapScale
    }
  }

  // === UTILITY ===

  /**
   * Clone manager with current state
   */
  clone(): CanvasManager {
    const cloned = new CanvasManager(
      this.containerWidth,
      this.containerHeight,
      this.viewport.scale
    )
    cloned.viewport = { ...this.viewport }
    cloned.bounds = this.bounds ? { ...this.bounds } : null
    cloned.pages = this.pages.map(p => ({ ...p }))
    cloned.activePage = this.activePage
    return cloned
  }

  /**
   * Serialize to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      viewport: this.viewport,
      bounds: this.bounds,
      pages: this.pages,
      activePage: this.activePage
    })
  }

  /**
   * Restore from JSON
   */
  static fromJSON(json: string, containerWidth: number, containerHeight: number): CanvasManager {
    const data = JSON.parse(json)
    const manager = new CanvasManager(containerWidth, containerHeight)
    manager.viewport = data.viewport
    manager.bounds = data.bounds
    manager.pages = data.pages
    manager.activePage = data.activePage
    return manager
  }
}

// Export singleton-like factory
export function createCanvasManager(
  containerWidth: number,
  containerHeight: number,
  initialScale?: number
): CanvasManager {
  return new CanvasManager(containerWidth, containerHeight, initialScale)
}
