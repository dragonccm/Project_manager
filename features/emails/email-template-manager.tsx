'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Mail,
  FolderOpen,
  Sparkles,
  FileText
} from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  htmlContent: string
  templateType: string
  backgroundColor: string
  textColor: string
  layout: string
  createdAt: string
  updatedAt: string
}

interface EmailTemplateManagerProps {
  templates: EmailTemplate[]
  onSelectTemplate: (template: EmailTemplate) => void
  onClose: () => void
  onTemplatesChange: () => void
}

export function EmailTemplateManager({ 
  templates, 
  onSelectTemplate, 
  onClose, 
  onTemplatesChange 
}: EmailTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  
  const { toast } = useToast()

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || template.templateType === selectedType
    
    return matchesSearch && matchesType
  })

  // Template type icons
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return FolderOpen
      case 'task': return Plus
      case 'notification': return Sparkles
      default: return Mail
    }
  }

  // Template type labels
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Dự án'
      case 'task': return 'Nhiệm vụ'
      case 'notification': return 'Thông báo'
      case 'general': return 'Email chung'
      default: return type
    }
  }

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa template này?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/email-templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await onTemplatesChange()
        toast({
          title: "Đã xóa",
          description: "Template đã được xóa thành công"
        })
      } else {
        throw new Error('Lỗi khi xóa template')
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa template. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Duplicate template
  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    setIsLoading(true)
    try {
      const duplicatedTemplate = {
        ...template,
        id: '',
        name: `${template.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedTemplate)
      })

      if (response.ok) {
        await onTemplatesChange()
        toast({
          title: "Đã sao chép",
          description: "Template đã được sao chép thành công"
        })
      } else {
        throw new Error('Lỗi khi sao chép template')
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast({
        title: "Lỗi",
        description: "Không thể sao chép template. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Export template
  const handleExportTemplate = (template: EmailTemplate) => {
    const dataStr = JSON.stringify(template, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Create new template
  const handleCreateNew = () => {
    const newTemplate: EmailTemplate = {
      id: '',
      name: 'Template mới',
      subject: '',
      content: '',
      htmlContent: '',
      templateType: 'general',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      layout: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    onSelectTemplate(newTemplate)
    onClose()
  }

  const templateTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'general', label: 'Email chung' },
    { value: 'project', label: 'Dự án' },
    { value: 'task', label: 'Nhiệm vụ' },
    { value: 'notification', label: 'Thông báo' }
  ]

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Quản Lý Email Templates
          </DialogTitle>
          <DialogDescription>
            Chọn template có sẵn hoặc tạo template mới
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 py-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {templateTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <ScrollArea className="flex-1 pr-4">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'Không tìm thấy template' : 'Chưa có template nào'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' 
                  : 'Tạo template đầu tiên để bắt đầu thiết kế email'
                }
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Template Mới
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => {
                const TypeIcon = getTypeIcon(template.templateType)
                
                return (
                  <Card key={template.id} className="group hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="truncate">
                            {template.subject || 'Chưa có tiêu đề'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2 flex-shrink-0">
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {getTypeLabel(template.templateType)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.content || 'Chưa có nội dung'}
                        </p>
                        
                        <div className="text-xs text-muted-foreground">
                          Cập nhật: {new Date(template.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                        
                        <div className="flex gap-1 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              onSelectTemplate(template)
                              onClose()
                            }}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Chỉnh sửa
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateTemplate(template)}
                            disabled={isLoading}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportTemplate(template)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}