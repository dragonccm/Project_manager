'use client'

import { useState, useEffect, useCallback } from 'react'
import { A4Template, CreateA4TemplateInput, UpdateA4TemplateInput } from '@/types/database'

export function useA4Templates() {
  const [templates, setTemplates] = useState<A4Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all templates
  const fetchTemplates = useCallback(async (filters?: {
    category?: string
    isPublic?: boolean
    isTemplate?: boolean
    tag?: string
    entityType?: string
    entityId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.isPublic !== undefined) params.append('isPublic', String(filters.isPublic))
      if (filters?.isTemplate !== undefined) params.append('isTemplate', String(filters.isTemplate))
      if (filters?.tag) params.append('tag', filters.tag)
      if (filters?.entityType) params.append('entityType', filters.entityType)
      if (filters?.entityId) params.append('entityId', filters.entityId)
      
      const response = await fetch(`/api/a4-templates?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch templates')
      }
      
      const data = await response.json()
      setTemplates(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single template
  const fetchTemplate = useCallback(async (id: string): Promise<A4Template | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/a4-templates?id=${id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch template')
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error fetching template:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Create template
  const createTemplate = useCallback(async (templateData: CreateA4TemplateInput): Promise<A4Template | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/a4-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create template')
      }
      
      const newTemplate = await response.json()
      setTemplates(prev => [newTemplate, ...prev])
      return newTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error creating template:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: UpdateA4TemplateInput): Promise<A4Template | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/a4-templates?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update template')
      }
      
      const updatedTemplate = await response.json()
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t))
      return updatedTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error updating template:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/a4-templates?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete template')
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error deleting template:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Clone template
  const cloneTemplate = useCallback(async (id: string, newName?: string): Promise<A4Template | null> => {
    try {
      const template = await fetchTemplate(id)
      if (!template) return null
      
      const clonedData: CreateA4TemplateInput = {
        name: newName || `${template.name} (Copy)`,
        description: template.description,
        canvasSettings: template.canvasSettings,
        shapes: template.shapes,
        linkedEntities: [],
        category: template.category,
        tags: template.tags,
        isPublic: false,
        isTemplate: false
      }
      
      return await createTemplate(clonedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error cloning template:', err)
      return null
    }
  }, [fetchTemplate, createTemplate])

  // Link entity to template
  const linkEntity = useCallback(async (
    templateId: string, 
    entityType: 'note' | 'mail' | 'account' | 'project' | 'task',
    entityId: string,
    linkType: 'embedded' | 'referenced' | 'attached' = 'referenced'
  ): Promise<boolean> => {
    try {
      const template = await fetchTemplate(templateId)
      if (!template) return false
      
      const linkedEntities = [...template.linkedEntities, {
        entityType,
        entityId,
        linkType,
        metadata: {}
      }]
      
      const updated = await updateTemplate(templateId, { linkedEntities })
      return !!updated
    } catch (err) {
      console.error('Error linking entity:', err)
      return false
    }
  }, [fetchTemplate, updateTemplate])

  // Unlink entity from template
  const unlinkEntity = useCallback(async (
    templateId: string, 
    entityId: string
  ): Promise<boolean> => {
    try {
      const template = await fetchTemplate(templateId)
      if (!template) return false
      
      const linkedEntities = template.linkedEntities.filter(e => e.entityId !== entityId)
      
      const updated = await updateTemplate(templateId, { linkedEntities })
      return !!updated
    } catch (err) {
      console.error('Error unlinking entity:', err)
      return false
    }
  }, [fetchTemplate, updateTemplate])

  // Share template with user
  const shareTemplate = useCallback(async (
    templateId: string,
    userId: string,
    permission: 'view' | 'edit' | 'admin' = 'view'
  ): Promise<boolean> => {
    try {
      const template = await fetchTemplate(templateId)
      if (!template) return false
      
      const sharedWith = [
        ...template.sharedWith.filter(s => s.userId !== userId),
        {
          userId,
          permission,
          sharedAt: new Date()
        }
      ]
      
      const updated = await updateTemplate(templateId, { sharedWith })
      return !!updated
    } catch (err) {
      console.error('Error sharing template:', err)
      return false
    }
  }, [fetchTemplate, updateTemplate])

  // Initial fetch
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    linkEntity,
    unlinkEntity,
    shareTemplate,
  }
}
