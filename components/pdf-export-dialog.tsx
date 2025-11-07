'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { FileDown, Loader2 } from 'lucide-react'
import {
  PDFExportManager,
  Page,
  ExportOptions,
  ExportMetadata
} from '@/lib/pdf-export-manager'

interface PDFExportDialogProps {
  pages: Page[]
  trigger?: React.ReactNode
}

/**
 * PDFExportDialog - Dialog UI cho PDF export
 * 
 * Features:
 * - Page selection
 * - Format selection (A4, Letter, etc.)
 * - Orientation selection
 * - Quality settings
 * - Metadata input
 * - Watermark option
 * - Progress bar
 * - Export preview
 */
export default function PDFExportDialog({ pages, trigger }: PDFExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Export options
  const [filename, setFilename] = useState('document')
  const [format, setFormat] = useState<'a4' | 'letter' | 'a3'>('a4')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [quality, setQuality] = useState(95)
  const [selectedPages, setSelectedPages] = useState<string[]>(pages.map(p => p.id))
  
  // Metadata
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  
  // Watermark
  const [includeWatermark, setIncludeWatermark] = useState(false)
  const [watermarkText, setWatermarkText] = useState('DRAFT')

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    setProgress(0)

    try {
      const exportManager = new PDFExportManager()
      
      // Filter selected pages
      const pagesToExport = pages.filter(p => selectedPages.includes(p.id))

      // Build export options
      const options: ExportOptions = {
        format,
        orientation,
        quality: quality / 100,
        onProgress: (prog) => setProgress(prog)
      }

      if (includeWatermark && watermarkText) {
        options.watermark = {
          text: watermarkText,
          opacity: 0.1,
          fontSize: 48
        }
      }

      // Build metadata
      let metadata: ExportMetadata | undefined
      if (includeMetadata) {
        metadata = {
          title: title || filename,
          author,
          creator: 'A4 Designer',
          createdAt: new Date()
        }
      }

      // Export
      await exportManager.exportAndDownload(
        pagesToExport,
        filename,
        options,
        metadata
      )

      // Success
      setOpen(false)
      setProgress(0)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Toggle page selection
  const togglePage = (pageId: string) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    )
  }

  // Select all pages
  const selectAllPages = () => {
    setSelectedPages(pages.map(p => p.id))
  }

  // Deselect all pages
  const deselectAllPages = () => {
    setSelectedPages([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
          <DialogDescription>
            Configure export settings and download your document as PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="document"
            />
          </div>

          {/* Page Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Pages to Export</Label>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllPages}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllPages}
                >
                  Deselect All
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={page.id}
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={() => togglePage(page.id)}
                  />
                  <label
                    htmlFor={page.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {page.name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedPages.length} of {pages.length} pages selected
            </p>
          </div>

          {/* Format & Orientation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Page Format</Label>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="letter">US Letter (216 × 279 mm)</SelectItem>
                  <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={orientation}
                onValueChange={(v: any) => setOrientation(v)}
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Export Quality</Label>
              <span className="text-sm text-muted-foreground">{quality}%</span>
            </div>
            <input
              type="range"
              id="quality"
              min="50"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher quality means larger file size
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
              />
              <Label htmlFor="metadata">Include document metadata</Label>
            </div>

            {includeMetadata && (
              <div className="ml-6 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author" className="text-sm">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Watermark */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="watermark"
                checked={includeWatermark}
                onCheckedChange={(checked) => setIncludeWatermark(checked as boolean)}
              />
              <Label htmlFor="watermark">Add watermark</Label>
            </div>

            {includeWatermark && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="watermarkText" className="text-sm">
                  Watermark Text
                </Label>
                <Input
                  id="watermarkText"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="DRAFT"
                  className="h-8"
                />
              </div>
            )}
          </div>

          {/* Progress */}
          {exporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Exporting...</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || selectedPages.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
