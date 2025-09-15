"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { REPORT_FIELDS } from "@/lib/constants"
import { ReportTemplate, FieldLayout } from "@/types/database"
import { FileText, Calendar, User, Tag, CheckCircle2, AlertTriangle, Clock } from "lucide-react"

interface ReportViewerProps {
  template: ReportTemplate
  data: Array<{
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
}

export function ReportViewer({ template, data }: ReportViewerProps) {
  const { template_data } = template

  // Render custom layout if available
  const renderCustomLayout = () => {
    if (!template_data.fieldLayout || template_data.fieldLayout.length === 0) {
      return renderTableLayout()
    }

    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground mb-4">
          Custom Layout View - {data.length} records
        </div>
        
        {data.map((record, recordIndex) => (
          <Card key={record.id || recordIndex} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Record {recordIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative bg-gray-50 rounded-lg p-4"
                style={{ minHeight: '300px' }}
              >
                {(template_data.fieldLayout || []).map((layout: FieldLayout) => {
                  const field = REPORT_FIELDS.find(f => f.id === layout.id)
                  if (!field) return null
                  
                  const value = (record as any)[layout.id] || 'N/A'
                  
                  return (
                    <div
                      key={layout.id}
                      className="absolute bg-white border border-gray-200 rounded-md shadow-sm p-2"
                      style={{
                        left: layout.x,
                        top: layout.y,
                        width: layout.width,
                        height: layout.height,
                        minWidth: '120px',
                        minHeight: '40px'
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <field.icon className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600 truncate">
                          {field.label}:
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate" title={String(value)}>
                        {String(value)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Render default table layout
  const renderTableLayout = () => {
    if (!template_data.fields || template_data.fields.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No fields configured for this template
        </div>
      )
    }

    const headers = template_data.fields.map(fieldId => {
      const field = REPORT_FIELDS.find(f => f.id === fieldId)
      return field?.label || fieldId
    })

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Table View - {data.length} records
        </div>
        
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
              {data.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-gray-50">
                  {template_data.fields.map(fieldId => {
                    const field = REPORT_FIELDS.find(f => f.id === fieldId)
                    const value = (record as any)[fieldId] || 'N/A'
                    
                    return (
                      <td key={fieldId} className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center gap-2">
                          {field && <field.icon className="h-3 w-3 text-gray-500" />}
                          <span>{String(value)}</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {template.name}
          </CardTitle>
          {template.description && (
            <p className="text-muted-foreground">{template.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Layout: {template_data.layout === 'custom' ? 'Custom Design' : 'Table View'}</span>
            <span>Fields: {template_data.fields?.length || 0}</span>
            <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <Card>
        <CardContent className="pt-6">
          {template_data.layout === 'custom' && template_data.fieldLayout?.length
            ? renderCustomLayout()
            : renderTableLayout()
          }
        </CardContent>
      </Card>
    </div>
  )
}