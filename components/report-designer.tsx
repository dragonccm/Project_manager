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
import {
  Plus,
  Trash2,
  FileText,
  Save,
  Download,
  Eye,
} from "lucide-react"
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
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [savedTemplates, setSavedTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

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
    }
  }

  const removeField = (fieldId: string) => {
    setSelectedFields(prev => prev.filter(id => id !== fieldId))
  }

  const clearAll = () => {
    setSelectedFields([])
    setTemplateName("")
    setTemplateDescription("")
    setError(null)
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
          layout: "table",
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
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {/* <Eye className="h-4 w-4 mr-2" /> */}
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

      {/* Preview Section */}
      {showPreview && selectedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
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
                <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                    Fields: {template.template_data?.fields?.length || 0}
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}