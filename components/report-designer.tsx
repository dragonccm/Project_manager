"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { REPORT_FIELDS, API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"
import { ShareModal } from "@/features/share/ShareModal"
import {
  Plus,
  Trash2,
  FileText,
  Save,
  Download,
  Eye,
  GripVertical,
  LayoutGrid,
  Share2,
} from "lucide-react"
interface FieldLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface ReportDesignerProps {
  projects?: Array<{ id: string; name: string }>
  tasks?: Array<{ 
    id: string
    title: string
    description?: string
    project?: string
    status?: string
    priority?: string
    assignee?: string
    created_date?: string
    due_date?: string
    estimated_time?: number
    actual_time?: number
    completed?: boolean
  }>
  onTemplateCreated?: (template: any) => void
}

export function ReportDesigner({ 
  projects = [], 
  tasks = [], 
  onTemplateCreated 
}: ReportDesignerProps) {
  // State management - keep it simple
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [fieldLayout, setFieldLayout] = useState<FieldLayout[]>([])
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showLayoutDesigner, setShowLayoutDesigner] = useState(false)
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedTemplateForShare, setSelectedTemplateForShare] = useState<any | null>(null)

  // Load saved templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.REPORT_TEMPLATES, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setSavedTemplates(result.data)
        }
      } else if (response.status === 401) {
        console.log('Authentication required for report templates')
      }
    } catch (err) {
      console.log('Could not load templates:', err)
      // Don't show error to user, just continue without saved templates
    }
  }

  const addField = (fieldId: string) => {
    if (!selectedFields.includes(fieldId)) {
      setSelectedFields(prev => [...prev, fieldId])
      
      // Add default layout for new field
      const newLayout: FieldLayout = {
        id: fieldId,
        x: 0,
        y: fieldLayout.length,
        width: 200,
        height: 40
      }
      setFieldLayout(prev => [...prev, newLayout])
    }
  }

  const removeField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(id => id !== fieldId))
    setFieldLayout(prev => prev.filter(layout => layout.id !== fieldId))
  }

  const clearAll = () => {
    setSelectedFields([])
    setFieldLayout([])
    setTemplateName("")
    setTemplateDescription("")
    setError(null)
  }

  const updateFieldLayout = (fieldId: string, x: number, y: number) => {
    setFieldLayout(prev => prev.map(layout => 
      layout.id === fieldId 
        ? { ...layout, x, y }
        : layout
    ))
  }

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (!draggedField || !isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Snap to grid
    const gridSize = 20
    const snappedX = Math.round(x / gridSize) * gridSize
    const snappedY = Math.round(y / gridSize) * gridSize
    
    // Get default dimensions for the field
    const defaultWidth = 200
    const defaultHeight = 40
    
    // Update preview position
    setDragPreview({
      x: snappedX,
      y: snappedY,
      width: defaultWidth,
      height: defaultHeight
    })
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only hide preview if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedField || !dragPreview) return
    
    updateFieldLayout(draggedField, dragPreview.x, dragPreview.y)
    setDraggedField(null)
    setDragPreview(null)
    setIsDragging(false)
  }

  const handleDragEnd = () => {
    setDraggedField(null)
    setDragPreview(null)
    setIsDragging(false)
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError("Please enter a template name")
      return
    }

    if (selectedFields.length === 0) {
      setError("Please select at least one field")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        template_data: {
          fields: selectedFields,
          layout: showLayoutDesigner ? "custom" : "table",
          fieldLayout: fieldLayout,
          created_at: new Date().toISOString()
        },
        category: "custom",
        is_default: false
      }

      const response = await fetch(API_ENDPOINTS.REPORT_TEMPLATES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSavedTemplates(prev => [result.data, ...prev])
          onTemplateCreated?.(result.data)
          clearAll()
          alert(`Template "${templateName}" saved successfully!`)
        } else {
          setError(result.error || "Failed to save template")
        }
      } else if (response.status === 401) {
        setError("Please login to save templates")
      } else {
        setError("Failed to save template. Please try again.")
      }
    } catch (err) {
      setError("Network error. Please check your connection.")
      console.error('Save template error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePreview = () => {
    if (selectedFields.length === 0 || tasks.length === 0) return null

    return tasks.slice(0, 5).map((task, index) => {
      const row: Record<string, any> = { id: index }
      selectedFields.forEach(fieldId => {
        const field = REPORT_FIELDS.find(f => f.id === fieldId)
        if (field) {
          row[field.label] = task[fieldId as keyof typeof task] || 'N/A'
        }
      })
      return row
    })
  }

  const renderCustomPreview = () => {
    if (fieldLayout.length === 0) return null
    
    const previewData = generatePreview()
    if (!previewData || previewData.length === 0) return null

    return (
      <div className="space-y-4">
        {previewData.slice(0, 2).map((row, rowIndex) => (
          <div key={rowIndex} className="relative border rounded-lg p-4 bg-gray-50" style={{ minHeight: '200px' }}>
            <div className="text-xs text-gray-500 mb-2">Record {rowIndex + 1}</div>
            {fieldLayout.map(layout => {
              const field = REPORT_FIELDS.find(f => f.id === layout.id)
              if (!field) return null
              
              const value = (row as any)[field.label] || 'N/A'
              
              return (
                <div
                  key={layout.id}
                  className="absolute bg-white border border-gray-200 rounded px-2 py-1 shadow-sm"
                  style={{
                    left: layout.x,
                    top: layout.y + 30,
                    width: layout.width,
                    height: layout.height,
                    minWidth: '120px'
                  }}
                >
                  <div className="text-xs text-gray-500 truncate">{field.label}:</div>
                  <div className="text-sm font-medium truncate" title={String(value)}>{String(value)}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  const exportToCsv = () => {
    const previewData = generatePreview()
    if (!previewData || previewData.length === 0) {
      alert("No data to export")
      return
    }

    const headers = selectedFields.map(fieldId => {
      const field = REPORT_FIELDS.find(f => f.id === fieldId)
      return field?.label || fieldId
    })

    const csvContent = [
      headers.join(','),
      ...previewData.map(row => 
        headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName || 'report'}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Designer</h2>
          <p className="text-muted-foreground">Create custom reports from your data</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLayoutDesigner(!showLayoutDesigner)}
            disabled={selectedFields.length === 0}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            {showLayoutDesigner ? 'Hide Layout' : 'Layout Designer'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Select Fields ({selectedFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {REPORT_FIELDS.map(field => {
                const IconComponent = field.icon
                const isSelected = selectedFields.includes(field.id)
                
                return (
                  <div 
                    key={field.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-primary/5 border-primary/20' : 'border-gray-200'
                    }`}
                    onClick={() => isSelected ? removeField(field.id) : addField(field.id)}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{field.label}</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isSelected ? 'Added' : 'Add'}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {selectedFields.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Selected Fields:</span>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedFields.map(fieldId => {
                    const field = REPORT_FIELDS.find(f => f.id === fieldId)
                    return field ? (
                      <Badge key={fieldId} variant="secondary" className="text-xs">
                        {field.label}
                        <button
                          className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeField(fieldId)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Template Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="template-desc">Description</Label>
              <Textarea
                id="template-desc"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1"
                rows={3}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                onClick={saveTemplate} 
                disabled={isLoading || !templateName.trim() || selectedFields.length === 0}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Template"}
              </Button>
              
              {selectedFields.length > 0 && (
                <Button variant="outline" onClick={exportToCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Designer */}
      {showLayoutDesigner && selectedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Layout Designer - Drag Fields to Design Report Layout
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag the field tags below to arrange them in your desired report layout. 
              {isDragging && dragPreview && (
                <span className="font-medium text-blue-600">
                  {" "}Position: ({dragPreview.x}, {dragPreview.y})
                </span>
              )}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Field Tags for Dragging */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Available Fields:</h4>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  {selectedFields.map(fieldId => {
                    const field = REPORT_FIELDS.find(f => f.id === fieldId)
                    if (!field) return null
                    
                    return (
                      <div
                        key={fieldId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, fieldId)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-move hover:shadow-md transition-shadow ${
                          draggedField === fieldId && isDragging ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <field.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{field.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Drop Zone for Layout Design */}
              <div>
                <h4 className="text-sm font-medium mb-2">Report Layout Preview:</h4>
                <div 
                  className="relative w-full h-96 bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ 
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Grid Coordinates Helper */}
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white bg-opacity-80 px-2 py-1 rounded">
                    Grid: 20px × 20px
                    {dragPreview && isDragging && (
                      <div className="text-blue-600 font-medium">
                        Position: ({dragPreview.x}, {dragPreview.y})
                      </div>
                    )}
                  </div>
                  {/* Drag Preview - Ghost/Shadow */}
                  {dragPreview && isDragging && (
                    <div
                      className="absolute border-2 border-black border-dashed bg-black bg-opacity-20 rounded-md pointer-events-none z-10"
                      style={{
                        left: dragPreview.x,
                        top: dragPreview.y,
                        width: dragPreview.width,
                        height: dragPreview.height,
                        minWidth: '120px'
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-10 rounded-md">
                        <div className="absolute top-1 left-1 text-xs text-white font-medium bg-black bg-opacity-60 px-1 rounded">
                          Drop here
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Field Layouts */}
                  {fieldLayout.map(layout => {
                    const field = REPORT_FIELDS.find(f => f.id === layout.id)
                    if (!field) return null
                    
                    return (
                      <div
                        key={layout.id}
                        className={`absolute bg-blue-100 border border-blue-300 rounded-md px-2 py-1 cursor-move flex items-center gap-1 hover:bg-blue-200 transition-colors ${
                          draggedField === layout.id && isDragging ? 'opacity-50' : ''
                        }`}
                        style={{
                          left: layout.x,
                          top: layout.y,
                          width: layout.width,
                          height: layout.height,
                          minWidth: '120px'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, layout.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <field.icon className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800 truncate">
                          {field.label}
                        </span>
                        <button
                          className="ml-auto text-red-500 hover:text-red-700 p-1"
                          onClick={() => removeField(layout.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })}
                  
                  {fieldLayout.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <LayoutGrid className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Drag field tags here to design your report layout</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Layout Controls */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFieldLayout([])}
                  disabled={fieldLayout.length === 0}
                >
                  Clear Layout
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Auto arrange in grid
                    const updatedLayout = selectedFields.map((fieldId, index) => ({
                      id: fieldId,
                      x: (index % 3) * 220,
                      y: Math.floor(index / 3) * 50,
                      width: 200,
                      height: 40
                    }))
                    setFieldLayout(updatedLayout)
                  }}
                >
                  Auto Arrange
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {showPreview && selectedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Preview {showLayoutDesigner && fieldLayout.length > 0 ? '(Custom Layout)' : '(Table View)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Show custom layout preview if layout designer is active and has fields positioned
              if (showLayoutDesigner && fieldLayout.length > 0) {
                return renderCustomPreview()
              }

              // Default table view
              const previewData = generatePreview()
              if (!previewData || previewData.length === 0) {
                return <p className="text-muted-foreground">No data available for preview</p>
              }

              const headers = selectedFields.map(fieldId => {
                const field = REPORT_FIELDS.find(f => f.id === fieldId)
                return field?.label || fieldId
              })

              return (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        {headers.map(header => (
                          <th key={header} className="border border-gray-300 px-3 py-2 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {headers.map(header => (
                            <td key={header} className="border border-gray-300 px-3 py-2">
                              {String((row as any)[header] || '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Saved Templates */}
      {savedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates ({savedTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedTemplates.map(template => (
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  
                  {template.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Fields: {template.template_data?.fields?.length || 0} | 
                    Layout: {template.template_data?.layout === 'custom' ? 'Custom Design' : 'Table View'}
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {new Date(template.created_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplateForShare(template)
                        setShareModalOpen(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-600 h-7 px-2"
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Modal */}
      {selectedTemplateForShare && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="report"
          resourceId={selectedTemplateForShare.id || selectedTemplateForShare._id || ''}
          resourceName={selectedTemplateForShare.name || 'Untitled Report'}
        />
      )}
    </div>
  )
}