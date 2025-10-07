'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Mail,
  Send,
  Eye,
  Save,
  FolderOpen,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Palette,
  Type,
  Image,
  Layout,
  Sparkles
} from 'lucide-react'
import { EmailTemplateManager } from '@/features/emails/email-template-manager'

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

interface EmailDesignerProps {
  className?: string
}

export function EmailDesigner({ className }: EmailDesignerProps) {
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    id: '',
    name: 'Mẫu email mới',
    subject: '',
    content: '',
    htmlContent: '',
    templateType: 'general',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    layout: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('design')
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  
  const { toast } = useToast()

  // Load templates from API
  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Lỗi khi tải templates:', error)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  // Generate HTML content from template data
  const generateHTMLContent = () => {
    const { subject, content, backgroundColor, textColor, layout } = currentTemplate
    
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: ${textColor};
            background-color: ${backgroundColor};
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .email-body {
            padding: 30px;
        }
        .email-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
        }
        .highlight {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        ${layout === 'modern' ? `
        .email-header {
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        }
        .email-container {
            border-radius: 15px;
        }
        ` : ''}
        ${layout === 'minimal' ? `
        .email-header {
            background: #2c3e50;
            padding: 20px;
        }
        .email-container {
            box-shadow: none;
            border: 1px solid #e9ecef;
        }
        ` : ''}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1 style="margin: 0; font-size: 28px;">${subject}</h1>
        </div>
        <div class="email-body">
            ${content.replace(/\n/g, '<br>')}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="btn">Xem chi tiết</a>
            </div>
        </div>
        <div class="email-footer">
            <p style="margin: 0;">© 2025 Project Manager. Tất cả quyền được bảo lưu.</p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
                Email này được gửi từ hệ thống quản lý dự án.
            </p>
        </div>
    </div>
</body>
</html>`
  }

  // Save current template
  const handleSaveTemplate = async () => {
    if (!currentTemplate.name.trim() || !currentTemplate.subject.trim()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng nhập tên và tiêu đề email",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const templateData = {
        ...currentTemplate,
        htmlContent: generateHTMLContent(),
        updatedAt: new Date().toISOString()
      }

      const url = currentTemplate.id ? `/api/email-templates/${currentTemplate.id}` : '/api/email-templates'
      const method = currentTemplate.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        const savedTemplate = await response.json()
        setCurrentTemplate(savedTemplate)
        await loadTemplates()
        
        toast({
          title: "Thành công",
          description: `Template "${savedTemplate.name}" đã được lưu`
        })
      } else {
        throw new Error('Lỗi khi lưu template')
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu template. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Send test email
  const handleSendTestEmail = async () => {
    if (!currentTemplate.subject.trim() || !currentTemplate.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề và nội dung email",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentTemplate.subject,
          htmlContent: generateHTMLContent(),
          templateData: currentTemplate
        })
      })

      if (response.ok) {
        toast({
          title: "Đã gửi email test",
          description: "Email đã được gửi đến địa chỉ test của bạn"
        })
      } else {
        throw new Error('Lỗi khi gửi email')
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi email test. Vui lòng thử lại.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Template types
  const templateTypes = [
    { value: 'general', label: 'Email chung', icon: Mail },
    { value: 'project', label: 'Dự án', icon: FolderOpen },
    { value: 'task', label: 'Nhiệm vụ', icon: Plus },
    { value: 'notification', label: 'Thông báo', icon: Sparkles }
  ]

  const layouts = [
    { value: 'default', label: 'Mặc định' },
    { value: 'modern', label: 'Hiện đại' },
    { value: 'minimal', label: 'Tối giản' }
  ]

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] ${className}`}>
      {/* Left Panel - Design Tools */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thiết Kế
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateManager(true)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design">Thiết kế</TabsTrigger>
                <TabsTrigger value="content">Nội dung</TabsTrigger>
                <TabsTrigger value="style">Kiểu dáng</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <div>
                  <Label>Tên template</Label>
                  <Input
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên template"
                  />
                </div>

                <div>
                  <Label>Loại email</Label>
                  <Select 
                    value={currentTemplate.templateType} 
                    onValueChange={(value) => setCurrentTemplate(prev => ({ ...prev, templateType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Layout</Label>
                  <Select 
                    value={currentTemplate.layout} 
                    onValueChange={(value) => setCurrentTemplate(prev => ({ ...prev, layout: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {layouts.map(layout => (
                        <SelectItem key={layout.value} value={layout.value}>
                          {layout.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label>Tiêu đề email</Label>
                  <Input
                    value={currentTemplate.subject}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Nhập tiêu đề email"
                  />
                </div>

                <div>
                  <Label>Nội dung</Label>
                  <Textarea
                    value={currentTemplate.content}
                    onChange={(e) => setCurrentTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Nhập nội dung email..."
                    rows={12}
                  />
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div>
                  <Label>Màu nền</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentTemplate.backgroundColor}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={currentTemplate.backgroundColor}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Màu chữ</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentTemplate.textColor}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={currentTemplate.textColor}
                      onChange={(e) => setCurrentTemplate(prev => ({ ...prev, textColor: e.target.value }))}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleSaveTemplate}
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu Template'}
              </Button>

              <Button
                onClick={handleSendTestEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi Email Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Xem Trước
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </Button>
              </div>
            </div>
            <CardDescription>
              Xem trước email sẽ hiển thị như thế nào cho người nhận
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-120px)]">
            <ScrollArea className="h-full rounded border">
              <div 
                className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'} min-h-full`}
                dangerouslySetInnerHTML={{ __html: generateHTMLContent() }}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <EmailTemplateManager
          templates={templates}
          onSelectTemplate={setCurrentTemplate}
          onClose={() => setShowTemplateManager(false)}
          onTemplatesChange={loadTemplates}
        />
      )}
    </div>
  )
}