// Hook for managing report templates with MongoDB integration
import { useState, useEffect, useCallback } from 'react'
import { ReportTemplate } from '@/types/database'

export function useReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates from database on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/report-templates')
      const result = await response.json()
      
      if (result.success) {
        setTemplates(result.data)
      } else {
        throw new Error(result.error || 'Failed to load templates')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates'
      setError(errorMessage)
      console.error('Error loading templates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTemplate = useCallback(async (templateData: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/report-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTemplates(prev => [result.data, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create template')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTemplate = useCallback(async (id: string, updates: Partial<ReportTemplate>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/report-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTemplates(prev => prev.map(template => 
          template.id === id ? result.data : template
        ))
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update template')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/report-templates?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTemplates(prev => prev.filter(template => template.id !== id))
      } else {
        throw new Error(result.error || 'Failed to delete template')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template'
      setError(errorMessage)
      console.error('Error deleting template:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}