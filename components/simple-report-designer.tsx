"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { REPORT_FIELDS, API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

// Define available data fields for reports with types
const DATA_FIELDS = REPORT_FIELDS.map(field => ({
  ...field,
  type: field.id.includes('date') ? 'date' : 
        field.id.includes('time') ? 'number' : 
        field.id === 'completed' ? 'boolean' : 
        field.id === 'status' ? 'status' : 
        field.id === 'priority' ? 'priority' : 'text'
}))

interface SimpleReportDesignerProps {
  projects?: Array<{ id: string; name: string }>
  tasks?: Array<{ 
    id: string; 
    title: string; 
    description?: string; 
    projectId?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    created_at?: string;
    date?: string;
    estimated_time?: number;
    actual_time?: number;
    completed?: boolean;
  }>
}

export function SimpleReportDesigner({ projects = [], tasks = [] }: SimpleReportDesignerProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.REPORT_TEMPLATES)
      const result = await response.json()
      
      if (result.success) {
        setTemplates(result.data)
      } else {
        console.error('Failed to load templates:', result.error)
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading templates:', err)
      setError('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const addField = (fieldId: string) => {
    if (!selectedFields.includes(fieldId)) {
      setSelectedFields([...selectedFields, fieldId])
    }
  }

  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter(id => id !== fieldId))
  }

  const saveTemplate = async () => {
    if (!reportName.trim()) {
      setError("Report name is required")
      return
    }

    if (selectedFields.length === 0) {
      setError("Please select at least one field")
      return
    }

    setIsLoading(true)
    try {
      const templateData = {
        name: reportName,
        description: reportDescription,
        template_data: {
          fields: selectedFields,
          layout: "simple"
        },
        category: "custom",
        is_default: false
      }

      const response = await fetch('/api/report-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Template saved successfully')
        setTemplates([result.data, ...templates])
        setReportName("")
        setReportDescription("")
        setSelectedFields([])
        setError(null)
      } else {
        setError(result.error || "Failed to save template")
      }
    } catch (err) {
      console.error('Error saving template:', err)
      setError('Failed to save template')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePreview = () => {
    if (selectedFields.length === 0) return []
    
    return tasks.slice(0, 5).map(task => {
      const previewData: any = {}
      selectedFields.forEach(fieldId => {
        const field = DATA_FIELDS.find(f => f.id === fieldId)
        if (field) {
          previewData[field.label] = task[fieldId as keyof typeof task] || 'N/A'
        }
      })
      return previewData
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simple Report Designer</h1>
        <p className="text-muted-foreground">Create custom reports from your task data</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Available Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DATA_FIELDS.map(field => (
                <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <field.icon className="h-4 w-4" />
                    <span className="text-sm">{field.label}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant={selectedFields.includes(field.id) ? "secondary" : "outline"}
                    onClick={() => selectedFields.includes(field.id) ? removeField(field.id) : addField(field.id)}
                  >
                    {selectedFields.includes(field.id) ? "Remove" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Input
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description"
              />
            </div>

            <div className="space-y-2">
              <Label>Selected Fields ({selectedFields.length})</Label>
              <div className="flex flex-wrap gap-1">
                {selectedFields.map(fieldId => {
                  const field = DATA_FIELDS.find(f => f.id === fieldId)
                  return field ? (
                    <div key={fieldId} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-xs">
                      <field.icon className="h-3 w-3" />
                      {field.label}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => removeField(fieldId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null
                })}
              </div>
            </div>

            <Button 
              onClick={saveTemplate} 
              disabled={isLoading || !reportName.trim() || selectedFields.length === 0}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Template"}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFields.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Sample data preview:
                </div>
                {generatePreview().slice(0, 3).map((data, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs space-y-1">
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select fields to see preview</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Templates */}
      {templates.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Saved Templates ({templates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="border rounded p-4">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground">
                    Fields: {template.template_data?.fields?.length || 0}
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