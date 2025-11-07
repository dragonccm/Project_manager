'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useA4Templates } from '@/hooks/use-a4-templates'
import { A4Template } from '@/types/database'
import { Layout, Plus, FileText, ExternalLink, Link as LinkIcon, Unlink } from 'lucide-react'

interface A4TemplateSelectorProps {
  linkedTemplateId?: string
  onTemplateLink?: (templateId: string) => void
  onTemplateUnlink?: () => void
  entityType?: 'note' | 'mail' | 'task' | 'project' | 'account'
  entityId?: string
}

export function A4TemplateSelector({
  linkedTemplateId,
  onTemplateLink,
  onTemplateUnlink,
  entityType = 'note',
  entityId,
}: A4TemplateSelectorProps) {
  const { toast } = useToast()
  const { templates, loading, fetchTemplates, linkEntity, unlinkEntity } = useA4Templates()
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<A4Template | null>(null)
  const [linkedTemplate, setLinkedTemplate] = useState<A4Template | null>(null)

  // Load templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Load linked template if ID is provided
  useEffect(() => {
    if (linkedTemplateId && templates.length > 0) {
      const template = templates.find(t => t._id === linkedTemplateId)
      setLinkedTemplate(template || null)
    } else {
      setLinkedTemplate(null)
    }
  }, [linkedTemplateId, templates])

  const handleLinkTemplate = async (template: A4Template) => {
    if (!entityId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng lưu note trước khi liên kết template',
        variant: 'destructive',
      })
      return
    }

    try {
      await linkEntity(template._id!, entityType, entityId)
      setLinkedTemplate(template)
      setShowTemplateDialog(false)
      onTemplateLink?.(template._id!)

      toast({
        title: 'Thành công',
        description: `Đã liên kết template "${template.name}"`,
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể liên kết template',
        variant: 'destructive',
      })
    }
  }

  const handleUnlinkTemplate = async () => {
    if (!linkedTemplate?._id || !entityId) return

    try {
      await unlinkEntity(linkedTemplate._id, entityId)
      setLinkedTemplate(null)
      onTemplateUnlink?.()

      toast({
        title: 'Thành công',
        description: 'Đã hủy liên kết template',
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể hủy liên kết template',
        variant: 'destructive',
      })
    }
  }

  const handleOpenInEditor = () => {
    if (linkedTemplate?._id) {
      window.open(`/a4-editor?id=${linkedTemplate._id}`, '_blank')
    }
  }

  const handleCreateNew = () => {
    window.open('/a4-editor', '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Linked template display */}
      {linkedTemplate ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Template A4 đã liên kết</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {linkedTemplate.shapes.length} shapes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{linkedTemplate.name}</p>
                {linkedTemplate.description && (
                  <p className="text-sm text-muted-foreground">{linkedTemplate.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenInEditor}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Mở trong Editor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowTemplateDialog(true)}
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  Đổi Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnlinkTemplate}
                  className="flex items-center gap-1 text-destructive"
                >
                  <Unlink className="h-3 w-3" />
                  Hủy liên kết
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* No template linked */
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Layout className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Chưa có template A4 nào được liên kết</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowTemplateDialog(true)}
                  disabled={!entityId}
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  Chọn Template có sẵn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateNew}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Tạo Template mới
                </Button>
              </div>
              {!entityId && (
                <p className="text-xs text-muted-foreground">
                  Vui lòng lưu note trước khi liên kết template
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template selection dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn Template A4</DialogTitle>
            <DialogDescription>
              Chọn một template để liên kết với {entityType} này
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Đang tải templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có template nào</p>
                <Button size="sm" onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tạo Template mới
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?._id === template._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm line-clamp-2">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.shapes.length}
                        </Badge>
                      </div>
                      {template.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.category && (
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {template.tags?.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => selectedTemplate && handleLinkTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              Liên kết Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
