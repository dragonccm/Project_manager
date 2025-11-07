/**
 * PDF Export Manager - Multi-page PDF export với jsPDF
 * 
 * Features:
 * - Export single/multiple pages
 * - Custom page sizes (A4, Letter, etc.)
 * - High quality rendering
 * - Progress tracking
 * - Watermark support
 * - Metadata support
 */

import jsPDF from 'jspdf'

export interface Page {
  id: string
  name: string
  width: number
  height: number
  shapes: any[]
}

export interface ExportOptions {
  format?: 'a4' | 'letter' | 'a3' | 'custom'
  orientation?: 'portrait' | 'landscape'
  quality?: number // 0-1
  scale?: number
  includeMetadata?: boolean
  watermark?: {
    text: string
    opacity?: number
    fontSize?: number
  }
  onProgress?: (progress: number) => void
}

export interface ExportMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string
  creator?: string
  createdAt?: Date
}

export class PDFExportManager {
  private pdf: jsPDF | null = null
  private currentPage = 0
  private totalPages = 0

  /**
   * Export single page to PDF
   */
  async exportPage(
    page: Page,
    options: ExportOptions = {},
    metadata?: ExportMetadata
  ): Promise<Blob> {
    return this.exportPages([page], options, metadata)
  }

  /**
   * Export multiple pages to PDF
   */
  async exportPages(
    pages: Page[],
    options: ExportOptions = {},
    metadata?: ExportMetadata
  ): Promise<Blob> {
    const {
      format = 'a4',
      orientation = 'portrait',
      quality = 0.95,
      scale = 2,
      includeMetadata = true,
      watermark,
      onProgress
    } = options

    this.totalPages = pages.length
    this.currentPage = 0

    // Initialize PDF
    const pageSize = this.getPageSize(format, orientation)
    this.pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: format === 'custom' ? [pageSize.width, pageSize.height] : format,
      compress: true
    })

    // Add metadata
    if (includeMetadata && metadata) {
      this.addMetadata(metadata)
    }

    // Export each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      
      // Add new page (except for first page)
      if (i > 0) {
        this.pdf.addPage()
      }

      // Render page to canvas
      const canvas = await this.renderPageToCanvas(page, pageSize, scale)

      // Add canvas to PDF
      const imgData = canvas.toDataURL('image/jpeg', quality)
      this.pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pageSize.width,
        pageSize.height,
        undefined,
        'FAST'
      )

      // Add watermark if specified
      if (watermark) {
        this.addWatermark(watermark, pageSize)
      }

      // Update progress
      this.currentPage = i + 1
      if (onProgress) {
        onProgress((this.currentPage / this.totalPages) * 100)
      }
    }

    // Generate blob
    const blob = this.pdf.output('blob')
    
    // Cleanup
    this.pdf = null

    return blob
  }

  /**
   * Export and download PDF
   */
  async exportAndDownload(
    pages: Page[],
    filename: string,
    options: ExportOptions = {},
    metadata?: ExportMetadata
  ): Promise<void> {
    const blob = await this.exportPages(pages, options, metadata)
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get page size in mm
   */
  private getPageSize(
    format: string,
    orientation: 'portrait' | 'landscape'
  ): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      a4: { width: 210, height: 297 },
      letter: { width: 216, height: 279 },
      a3: { width: 297, height: 420 },
      a5: { width: 148, height: 210 }
    }

    let size = sizes[format] || sizes.a4

    if (orientation === 'landscape') {
      size = { width: size.height, height: size.width }
    }

    return size
  }

  /**
   * Render page to canvas
   */
  private async renderPageToCanvas(
    page: Page,
    pageSize: { width: number; height: number },
    scale: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // Calculate canvas size (mm to pixels)
    const mmToPx = 3.7795275591 // 1mm = 3.78 pixels at 96 DPI
    canvas.width = pageSize.width * mmToPx * scale
    canvas.height = pageSize.height * mmToPx * scale

    // Fill white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Scale context
    ctx.scale(scale, scale)

    // Calculate scale factor from page to canvas
    const scaleX = (pageSize.width * mmToPx) / page.width
    const scaleY = (pageSize.height * mmToPx) / page.height
    const scaleFactor = Math.min(scaleX, scaleY)

    ctx.scale(scaleFactor, scaleFactor)

    // Render shapes
    for (const shape of page.shapes) {
      await this.renderShape(ctx, shape)
    }

    return canvas
  }

  /**
   * Render individual shape
   */
  private async renderShape(ctx: CanvasRenderingContext2D, shape: any) {
    ctx.save()

    // Apply transformations
    ctx.translate(shape.x || 0, shape.y || 0)
    if (shape.rotation) {
      ctx.rotate((shape.rotation * Math.PI) / 180)
    }
    if (shape.scaleX || shape.scaleY) {
      ctx.scale(shape.scaleX || 1, shape.scaleY || 1)
    }

    // Render based on shape type
    switch (shape.type) {
      case 'rect':
        this.renderRect(ctx, shape)
        break
      case 'circle':
        this.renderCircle(ctx, shape)
        break
      case 'text':
        this.renderText(ctx, shape)
        break
      case 'image':
        await this.renderImage(ctx, shape)
        break
      case 'path':
        this.renderPath(ctx, shape)
        break
      default:
        // Default rectangle
        this.renderRect(ctx, shape)
    }

    ctx.restore()
  }

  /**
   * Render rectangle
   */
  private renderRect(ctx: CanvasRenderingContext2D, shape: any) {
    const width = shape.width || 100
    const height = shape.height || 100

    // Fill
    if (shape.fill) {
      ctx.fillStyle = shape.fill
      ctx.fillRect(0, 0, width, height)
    }

    // Stroke
    if (shape.stroke) {
      ctx.strokeStyle = shape.stroke
      ctx.lineWidth = shape.strokeWidth || 1
      ctx.strokeRect(0, 0, width, height)
    }
  }

  /**
   * Render circle
   */
  private renderCircle(ctx: CanvasRenderingContext2D, shape: any) {
    const radius = shape.radius || 50

    ctx.beginPath()
    ctx.arc(radius, radius, radius, 0, Math.PI * 2)

    // Fill
    if (shape.fill) {
      ctx.fillStyle = shape.fill
      ctx.fill()
    }

    // Stroke
    if (shape.stroke) {
      ctx.strokeStyle = shape.stroke
      ctx.lineWidth = shape.strokeWidth || 1
      ctx.stroke()
    }
  }

  /**
   * Render text
   */
  private renderText(ctx: CanvasRenderingContext2D, shape: any) {
    const text = shape.text || ''
    const fontSize = shape.fontSize || 16
    const fontFamily = shape.fontFamily || 'Arial'

    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = shape.fill || '#000000'
    ctx.textBaseline = 'top'

    if (shape.align === 'center') {
      ctx.textAlign = 'center'
    } else if (shape.align === 'right') {
      ctx.textAlign = 'right'
    } else {
      ctx.textAlign = 'left'
    }

    ctx.fillText(text, 0, 0)
  }

  /**
   * Render image
   */
  private async renderImage(ctx: CanvasRenderingContext2D, shape: any) {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const width = shape.width || img.width
        const height = shape.height || img.height
        ctx.drawImage(img, 0, 0, width, height)
        resolve()
      }

      img.onerror = () => {
        console.error('Failed to load image:', shape.src)
        resolve()
      }

      img.src = shape.src
    })
  }

  /**
   * Render path
   */
  private renderPath(ctx: CanvasRenderingContext2D, shape: any) {
    if (!shape.path) return

    ctx.beginPath()

    const path = new Path2D(shape.path)
    
    // Fill
    if (shape.fill) {
      ctx.fillStyle = shape.fill
      ctx.fill(path)
    }

    // Stroke
    if (shape.stroke) {
      ctx.strokeStyle = shape.stroke
      ctx.lineWidth = shape.strokeWidth || 1
      ctx.stroke(path)
    }
  }

  /**
   * Add metadata to PDF
   */
  private addMetadata(metadata: ExportMetadata) {
    if (!this.pdf) return

    const props: any = {}

    if (metadata.title) props.title = metadata.title
    if (metadata.author) props.author = metadata.author
    if (metadata.subject) props.subject = metadata.subject
    if (metadata.keywords) props.keywords = metadata.keywords
    if (metadata.creator) props.creator = metadata.creator

    this.pdf.setProperties(props)
  }

  /**
   * Add watermark to current page
   */
  private addWatermark(
    watermark: { text: string; opacity?: number; fontSize?: number },
    pageSize: { width: number; height: number }
  ) {
    if (!this.pdf) return

    const { text, opacity = 0.1, fontSize = 48 } = watermark

    this.pdf.saveGraphicsState()
    this.pdf.setGState(new jsPDF.GState({ opacity }))
    this.pdf.setFontSize(fontSize)
    this.pdf.setTextColor(200, 200, 200)

    // Center text
    const textWidth = this.pdf.getTextWidth(text)
    const x = (pageSize.width - textWidth) / 2
    const y = pageSize.height / 2

    // Rotate 45 degrees
    this.pdf.text(text, x, y, { angle: 45 })

    this.pdf.restoreGraphicsState()
  }

  /**
   * Get export progress
   */
  getProgress(): number {
    if (this.totalPages === 0) return 0
    return (this.currentPage / this.totalPages) * 100
  }
}

/**
 * Create a new PDFExportManager instance
 */
export function createPDFExportManager(): PDFExportManager {
  return new PDFExportManager()
}
