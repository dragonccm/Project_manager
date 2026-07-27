"use client"

import { useLanguage } from "@/hooks/use-language"
import React, { useState, useEffect } from 'react'
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
import { FileText, Plus, Copy, Trash2 } from 'lucide-react'
import { A4Template } from '@/types/database'

export function A4EditorManager() {
  const { t } = useLanguage()
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
    const templateId = searchParams?.get('templateId')
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
      // Update URL without full navigation
      const url = new URL(window.location.href)
      url.searchParams.set('templateId', newTemplate.id)
      window.history.pushState({}, '', url.toString())
      
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
          handleBackToGallery()
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
    // Update URL without full navigation
    const url = new URL(window.location.href)
    url.searchParams.set('templateId', template.id)
    window.history.pushState({}, '', url.toString())
  }

  const handleBackToGallery = () => {
    setIsEditorMode(false)
    setCurrentTemplate(null)
    // Clear URL param
    const url = new URL(window.location.href)
    url.searchParams.delete('templateId')
    window.history.pushState({}, '', url.toString())
  }

  if (isEditorMode && currentTemplate) {
    return (
      <div className="h-full min-h-0 flex flex-col bg-background">
          {/* Thanh tiêu đề mảnh, sát header — không dùng margin để editor bên
              dưới còn lại đúng phần chiều cao thừa */}
          <div className="flex items-center gap-2 border-b px-3 py-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={handleBackToGallery}>
              ← {t("backToGallery")}
            </Button>
            <h2 className="text-base font-semibold truncate">{currentTemplate.name}</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
             <A4Editor
                templateId={currentTemplate.id}
                onSave={handleSaveTemplate}
                initialData={{
                  canvasSettings: currentTemplate.canvasSettings,
                  shapes: currentTemplate.shapes,
                }}
              />
          </div>
      </div>
    )
  }

  return (
    // Tab này chạy full-bleed nên <main> không còn padding — tự thêm ở đây,
    // và cho phép cuộn riêng phần thư viện mẫu.
    <div className="h-full overflow-auto space-y-6 animate-fade-in p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between glass p-6 rounded-xl border border-white/20">
        <div>
          <h1 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{t("a4DesignerTitle")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("a4DesignerSubtitle")}
          </p>
        </div>
        <Button onClick={() => setShowNewTemplateDialog(true)} className="shadow-glow-primary transition-all hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          {t("newTemplate")}
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">{t("loadingTemplates")}</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-20 glass rounded-xl border-dashed border-2 border-muted-foreground/20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">{t("noTemplatesYet")}</h3>
            <p className="text-muted-foreground mb-6">{t("createFirstTemplate")}</p>
            <Button onClick={() => setShowNewTemplateDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t("createTemplateAction")}
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <Card
              key={template.id}
              className="glass-card cursor-pointer group border-black/5 dark:border-white/10"
              onClick={() => handleOpenTemplate(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="truncate">{template.name}</span>
                  </div>
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {template.description || t("noDescriptionProvided")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  <span>{template.shapes.length} {t("elementsCount")}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCloneTemplate(template.id)
                      }}
                      title={t("duplicate")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTemplate(template.id)
                      }}
                      title={t("delete")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>{t("createNewTemplate")}</DialogTitle>
            <DialogDescription>
              {t("newTemplateDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t("templateName")}</Label>
              <Input
                id="name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={t("templateNamePlaceholder")}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label htmlFor="description">{t("descriptionOptional")}</Label>
              <Textarea
                id="description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder={t("describeTemplate")}
                rows={3}
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateNewTemplate} className="shadow-glow-primary">
              {t("createTemplateAction")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
