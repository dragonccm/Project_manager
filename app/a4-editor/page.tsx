'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import A4Editor from '@/features/a4-editor/a4-editor'
import { useA4Templates } from '@/hooks/use-a4-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, FolderOpen, Trash2, Copy, Settings } from 'lucide-react'
import { A4Template } from '@/types/database'

function A4EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const {
    templates,
    loading,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
  } = useA4Templates()

  const [currentTemplate, setCurrentTemplate] = useState<A4Template | null>(null)
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [isEditorMode, setIsEditorMode] = useState(false)

  // Load template from URL param
  useEffect(() => {
    const templateId = searchParams?.get('id')
    if (templateId) {
      loadTemplate(templateId)
    }
  }, [searchParams])

  const loadTemplate = async (id: string) => {
    const template = await fetchTemplate(id)
    if (template) {
      setCurrentTemplate(template)
      setIsEditorMode(true)
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      })
    }
  }

  const handleCreateNewTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a template name',
        variant: 'destructive',
      })
      return
    }

    const newTemplate = await createTemplate({
      name: newTemplateName,
      description: newTemplateDescription,
      canvasSettings: {
        mode: 'a4',
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff',
        gridEnabled: true,
        gridSize: 20,
        gridColor: '#e0e0e0',
        snapToGrid: true,
        snapTolerance: 5,
        padding: 40,
        autoExpand: false,
      },
      shapes: [],
      linkedEntities: [],
      category: 'custom',
      tags: [],
      isPublic: false,
      isTemplate: false,
    })

    if (newTemplate) {
      setCurrentTemplate(newTemplate)
      setIsEditorMode(true)
      setShowNewTemplateDialog(false)
      setNewTemplateName('')
      setNewTemplateDescription('')
      router.push(`/a4-editor?id=${newTemplate.id}`)
      toast({
        title: 'Success',
        description: 'Template created successfully',
      })
    }
  }

  const handleSaveTemplate = async (templateData: any) => {
    if (!currentTemplate) return

    const updated = await updateTemplate(currentTemplate.id, {
      canvasSettings: templateData.canvasSettings,
      shapes: templateData.shapes,
      changeDescription: 'Manual save',
    })

    if (updated) {
      setCurrentTemplate(updated)
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const success = await deleteTemplate(id)
      if (success) {
        if (currentTemplate?.id === id) {
          setCurrentTemplate(null)
          setIsEditorMode(false)
          router.push('/a4-editor')
        }
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        })
      }
    }
  }

  const handleCloneTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return

    const cloned = await cloneTemplate(id, `${template.name} (Copy)`)
    if (cloned) {
      toast({
        title: 'Success',
        description: 'Template cloned successfully',
      })
    }
  }

  const handleOpenTemplate = (template: A4Template) => {
    setCurrentTemplate(template)
    setIsEditorMode(true)
    setShowTemplatesDialog(false)
    router.push(`/a4-editor?id=${template.id}`)
  }

  const handleBackToGallery = () => {
    setIsEditorMode(false)
    setCurrentTemplate(null)
    router.push('/a4-editor')
  }

  if (isEditorMode && currentTemplate) {
    return (
      <A4Editor
        templateId={currentTemplate.id}
        onSave={handleSaveTemplate}
        initialData={{
          canvasSettings: currentTemplate.canvasSettings,
          shapes: currentTemplate.shapes,
        }}
      />
    )
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A4 Document Designer</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage professional A4 document templates with drag-and-drop design
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewTemplateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first template to get started
            </p>
            <Button onClick={() => setShowNewTemplateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleOpenTemplate(template)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {template.name}
                </CardTitle>
                <CardDescription>
                  {template.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {template.shapes.length} shapes
                  </span>
                  <span className="text-muted-foreground">
                    v{template.version}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCloneTemplate(template.id)
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTemplate(template.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Enter a name and description for your new A4 template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="My Template"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="Describe your template..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function A4EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading A4 Editor...</p>
        </div>
      </div>
    }>
      <A4EditorContent />
    </Suspense>
  )
}
