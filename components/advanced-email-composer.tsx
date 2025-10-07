'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mail, 
  Send, 
  Eye, 
  RefreshCw, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  User,
  Palette,
  FileText,
  Building,
  Sparkles,
  Layout,
  Key
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createAdvancedEmailTemplate, reportEmailTemplate, backgroundOptions, layoutOptions } from '@/lib/advanced-email-templates'

interface EmailComposerSheetProps {
  trigger?: React.ReactNode
  /** Optional initial email type to pre-select */
  initialEmailType?: string
  /** Controlled open state */
  isOpen?: boolean
  /** Controlled close handler */
  onClose?: () => void
  /** Context data to pre-populate */
  contextData?: any
}

const templateDesigns = [
  { id: 'modern', name: 'Hiện Đại', icon: Sparkles, description: 'Thiết kế gradient đẹp mắt' },
  { id: 'corporate', name: 'Công Ty', icon: Building, description: 'Phong cách chuyên nghiệp' },
  { id: 'minimal', name: 'Tối Giản', icon: FileText, description: 'Đơn giản và tinh tế' },
  { id: 'colorful', name: 'Nhiều Màu', icon: Palette, description: 'Sống động và bắt mắt' },
]

const emailTypes = [
  { id: 'projectUpdate', name: 'Cập Nhật Dự Án', icon: FolderOpen, description: 'Thông báo về tiến độ dự án' },
  { id: 'taskNotification', name: 'Thông Báo Nhiệm Vụ', icon: CheckSquare, description: 'Nhiệm vụ mới hoặc hoàn thành' },
  { id: 'accountCredentials', name: 'Chia Sẻ Thông Tin Đăng Nhập', icon: Key, description: 'Gửi thông tin đăng nhập website/tài khoản' },
  { id: 'accountUpdate', name: 'Cập Nhật Tài Khoản', icon: User, description: 'Thông tin tài khoản thay đổi' },
  { id: 'systemNotification', name: 'Thông Báo Hệ Thống', icon: Users, description: 'Thông báo chung từ hệ thống' },
  { id: 'reportEmail', name: 'Gửi Báo Cáo', icon: FileText, description: 'Gửi báo cáo dự án và thống kê' },
]

export default function AdvancedEmailComposer({ trigger, initialEmailType, isOpen: controlledOpen, onClose: controlledOnClose, contextData }: EmailComposerSheetProps) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  
  // Use controlled state if provided, otherwise internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnClose ? (value: boolean) => {
    if (!value) controlledOnClose()
  } : setInternalOpen
  
  // Form data
  const [selectedEmailType, setSelectedEmailType] = useState<string>(initialEmailType || '')
  const [selectedDesign, setSelectedDesign] = useState<'modern' | 'corporate' | 'minimal' | 'colorful'>('modern')
  const [selectedBackground, setSelectedBackground] = useState<'gradient' | 'solid' | 'pattern' | 'image'>('gradient')
  const [selectedLayout, setSelectedLayout] = useState<'classic' | 'modern' | 'card-based' | 'split'>('modern')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [selectedData, setSelectedData] = useState<any>(null)
  
  // Data from APIs
  const [projects, setProjects] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  
  // Preview
  const [emailPreview, setEmailPreview] = useState<string>('')

  // Load data when sheet opens or when contextData changes
  useEffect(() => {
    if (open) {
      // Reset form when opening, preserving initialEmailType
      if (initialEmailType) {
        setSelectedEmailType(initialEmailType)
      }
      // Set context data if provided
      if (contextData) {
        setSelectedData(contextData)
        // Auto-fill recipient email if available
        if (contextData.email) {
          setRecipientEmail(contextData.email)
        }
      }
      loadData()
    }
  }, [open, initialEmailType, contextData])

  const loadData = async () => {
    setLoading(true)
    try {
      const [projectsRes, accountsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/accounts'),
        fetch('/api/tasks')
      ])

      if (projectsRes.ok) setProjects(await projectsRes.json())
      if (accountsRes.ok) setAccounts(await accountsRes.json())
      if (tasksRes.ok) setTasks(await tasksRes.json())
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
        variant: 'destructive'
      })
    }
    setLoading(false)
  }

  const getEmailTitle = (type: string, data: any): string => {
    switch (type) {
      case 'projectUpdate':
        return `Cập nhật dự án: ${data.name}`
      case 'taskNotification':
        return `Thông báo nhiệm vụ: ${data.title}`
      case 'accountCredentials':
        return `Thông tin đăng nhập: ${data.website}`
      case 'accountUpdate':
        return `Cập nhật tài khoản: ${data.username}`
      case 'reportEmail':
        return `Báo cáo ${data.reportType || 'Hệ thống'}`
      default:
        return 'Thông báo từ Project Manager'
    }
  }

  const getDefaultMessage = (type: string, data: any): string => {
    switch (type) {
      case 'projectUpdate':
        return `Dự án "${data.name}" đã có những cập nhật mới. Vui lòng xem chi tiết bên dưới.`
      case 'taskNotification':
        return `Nhiệm vụ "${data.title}" đã được ${data.status === 'completed' ? 'hoàn thành' : 'cập nhật'}. Xem thông tin chi tiết.`
      case 'accountCredentials':
        return `Đây là thông tin đăng nhập cho website ${data.website} thuộc dự án ${data.projectName}. Vui lòng giữ bí mật và sử dụng cẩn thận.`
      case 'accountUpdate':
        return `Tài khoản của ${data.username} đã được cập nhật. Kiểm tra thông tin mới nhất.`
      case 'reportEmail':
        return `Báo cáo ${data.reportType || 'hệ thống'} được tạo tự động từ Project Manager.`
      default:
        return 'Đây là thông báo từ hệ thống Project Manager.'
    }
  }

  const getEmailDetails = (type: string, data: any): Record<string, string> => {
    switch (type) {
      case 'projectUpdate':
        return {
          'Tên dự án': data.name,
          'Mô tả': data.description || 'Không có mô tả',
          'Trạng thái': data.status || 'Đang hoạt động',
          'Domain': data.domain || 'Chưa cập nhật',
          'Figma': data.figma_link || 'Chưa có link',
          'Ngày tạo': data.created_at ? new Date(data.created_at).toLocaleDateString('vi-VN') : 'N/A'
        }
      case 'taskNotification':
        return {
          'Tiêu đề': data.title,
          'Mô tả': data.description || 'Không có mô tả',
          'Độ ưu tiên': data.priority || 'Trung bình',
          'Trạng thái': data.status || 'Mới',
          'Dự án': data.project?.name || 'Không xác định',
          'Hạn chót': data.due_date ? new Date(data.due_date).toLocaleDateString('vi-VN') : 'Không có'
        }
      case 'accountCredentials':
        return {
          'Website': data.website,
          'Tên đăng nhập': data.username,
          'Mật khẩu': data.password,
          'Email tài khoản': data.email || 'Không có',
          'Dự án': data.projectName,
          'Ghi chú': 'Vui lòng bảo mật thông tin này và không chia sẻ với người khác'
        }
      case 'accountUpdate':
        return {
          'Username': data.username,
          'Email': data.email,
          'Họ tên': data.full_name || 'Chưa cập nhật',
          'Vai trò': data.role || 'User',
          'Trạng thái': data.status || 'Hoạt động'
        }
      case 'reportEmail':
        return {
          'Loại báo cáo': data.reportType || 'Tổng quan',
          'Ngày tạo': new Date().toLocaleDateString('vi-VN'),
          'Tổng dự án': data.stats?.totalProjects?.toString() || '0',
          'Tổng nhiệm vụ': data.stats?.totalTasks?.toString() || '0',
          'Ghi chú': data.customMessage || 'Báo cáo tự động'
        }
      default:
        return {}
    }
  }

  const generatePreview = () => {
    const emailData = selectedData || contextData
    if (!selectedEmailType || !emailData) return

    let templateData = { 
      companyName: "Project Manager",
      logoUrl: "/logo.png",
      recipientName: emailData.recipientName || emailData.full_name || emailData.username || "Người nhận",
      content: {
        title: getEmailTitle(selectedEmailType, emailData),
        message: customMessage || getDefaultMessage(selectedEmailType, emailData),
        details: getEmailDetails(selectedEmailType, emailData)
      },
      footer: {
        websiteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000"
      }
    }

    try {
      let template
      if (selectedEmailType === 'reportEmail') {
        template = reportEmailTemplate(emailData, {
          style: selectedDesign,
          background: selectedBackground,
          layout: selectedLayout
        })
      } else {
        template = {
          html: createAdvancedEmailTemplate(templateData, {
            style: selectedDesign,
            background: selectedBackground,
            layout: selectedLayout
          }),
          subject: getEmailTitle(selectedEmailType, emailData)
        }
      }
      setEmailPreview(template.html)
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo bản xem trước',
        variant: 'destructive'
      })
    }
  }

  const handleSendEmail = async () => {
    const emailData = selectedData || contextData
    if (!recipientEmail || !selectedEmailType || !emailData) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ thông tin gửi email',
        variant: 'destructive'
      })
      return
    }

    setSending(true)
    try {
      let templateData = { 
        companyName: "Project Manager",
        logoUrl: "/logo.png",
        recipientName: emailData.recipientName || emailData.full_name || emailData.username || "Người nhận",
        content: {
          title: getEmailTitle(selectedEmailType, emailData),
          message: customMessage || getDefaultMessage(selectedEmailType, emailData),
          details: getEmailDetails(selectedEmailType, emailData)
        },
        footer: {
          websiteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000"
        }
      }

      // Create the template
      let template
      if (selectedEmailType === 'reportEmail') {
        template = reportEmailTemplate(emailData, {
          style: selectedDesign,
          background: selectedBackground,
          layout: selectedLayout
        })
      } else {
        template = {
          html: createAdvancedEmailTemplate(templateData, {
            style: selectedDesign,
            background: selectedBackground,
            layout: selectedLayout
          }),
          subject: customSubject || getEmailTitle(selectedEmailType, emailData),
          text: `Email từ Project Manager: ${getEmailTitle(selectedEmailType, emailData)}`
        }
      }
      
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'custom',
          data: {
            subject: customSubject || template.subject,
            html: template.html,
            text: template.text
          },
          recipients: recipientEmail
        })
      })

      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Email đã được gửi thành công!',
        })
        setOpen(false)
        resetForm()
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi email. Vui lòng thử lại.',
        variant: 'destructive'
      })
    }
    setSending(false)
  }

  const resetForm = () => {
    setSelectedEmailType(initialEmailType || '')
    setSelectedDesign('modern')
    setSelectedBackground('gradient')
    setSelectedLayout('modern')
    setRecipientEmail('')
    setCustomSubject('')
    setCustomMessage('')
    setSelectedData(null)
    setEmailPreview('')
  }

  const getDataOptions = () => {
    switch (selectedEmailType) {
      case 'projectUpdate':
        return projects.map((p: any) => ({ id: p._id, name: p.name, data: p }))
      case 'accountCredentials':
        return accounts.map((a: any) => ({ id: a._id || a.id, name: `${a.website} (${a.username})`, data: a }))
      case 'accountUpdate':
        return accounts.map((a: any) => ({ id: a._id, name: `${a.username} (${a.email})`, data: a }))
      case 'taskNotification':
        return tasks.map((t: any) => ({ id: t._id, name: t.title, data: t }))
      case 'reportEmail':
        return [
          { id: 'project_summary', name: 'Báo cáo tổng quan dự án', data: { reportType: 'Tổng Quan Dự Án', stats: { totalProjects: projects.length, totalTasks: tasks.length } } },
          { id: 'task_report', name: 'Báo cáo nhiệm vụ', data: { reportType: 'Báo Cáo Nhiệm Vụ', stats: { totalProjects: projects.length, totalTasks: tasks.length } } },
          { id: 'user_activity', name: 'Báo cáo hoạt động user', data: { reportType: 'Hoạt Động Người Dùng', stats: { totalProjects: projects.length, totalTasks: tasks.length } } }
        ]
      case 'systemNotification':
        return [{ id: 'system', name: 'Thông báo hệ thống', data: { title: 'Thông báo hệ thống', message: customMessage || 'Thông báo từ hệ thống Project Manager' } }]
      default:
        return []
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Mail className="w-4 h-4" />
              Soạn Email
            </Button>
          )}
        </SheetTrigger>
      )}
      <SheetContent className="w-full sm:max-w-5xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Soạn Email Với Template Nâng Cao
          </SheetTitle>
          <SheetDescription>
            Chọn template đẹp, tùy chỉnh thiết kế và gửi email chuyên nghiệp
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <Tabs defaultValue="compose" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Soạn Email</TabsTrigger>
              <TabsTrigger value="preview" disabled={!emailPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Xem Trước
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
              {/* Email Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Chọn Loại Email</CardTitle>
                  <CardDescription>Chọn loại email bạn muốn gửi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {emailTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <Card
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedEmailType === type.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedEmailType(type.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <h4 className="font-medium text-sm">{type.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Design Template Selection */}
              {selectedEmailType && (
                <Card>
                  <CardHeader>
                    <CardTitle>2. Chọn Kiểu Thiết Kế</CardTitle>
                    <CardDescription>Chọn phong cách template email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {templateDesigns.map(design => {
                        const Icon = design.icon
                        return (
                          <Card
                            key={design.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedDesign === design.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                            }`}
                            onClick={() => setSelectedDesign(design.id as any)}
                          >
                            <CardContent className="p-3 text-center">
                              <Icon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                              <h4 className="font-medium text-sm">{design.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{design.description}</p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Background Selection */}
              {selectedEmailType && (
                <Card>
                  <CardHeader>
                    <CardTitle>3. Chọn Nền Email</CardTitle>
                    <CardDescription>Chọn kiểu nền cho email của bạn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {backgroundOptions.map(bg => (
                        <Card
                          key={bg.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedBackground === bg.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                          }`}
                          onClick={() => setSelectedBackground(bg.id as any)}
                        >
                          <CardContent className="p-3 text-center">
                            <div 
                              className="w-12 h-12 mx-auto mb-2 rounded border border-gray-200"
                              style={{ background: bg.preview, backgroundSize: '20px 20px' }}
                            />
                            <h4 className="font-medium text-sm">{bg.name}</h4>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Layout Selection */}
              {selectedEmailType && (
                <Card>
                  <CardHeader>
                    <CardTitle>4. Chọn Bố Cục</CardTitle>
                    <CardDescription>Chọn cách sắp xếp thông tin trong email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {layoutOptions.map(layout => (
                        <Card
                          key={layout.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedLayout === layout.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                          }`}
                          onClick={() => setSelectedLayout(layout.id as any)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Layout className="w-5 h-5 text-orange-600 mt-1" />
                              <div>
                                <h4 className="font-medium text-sm">{layout.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">{layout.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Selection - Only show if no contextData provided */}
              {selectedEmailType && !contextData && (
                <Card>
                  <CardHeader>
                    <CardTitle>5. Chọn Dữ Liệu</CardTitle>
                    <CardDescription>Chọn dữ liệu để điền vào template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang tải dữ liệu...
                      </div>
                    ) : (
                      <Select onValueChange={(value) => {
                        const option = getDataOptions().find(o => o.id === value)
                        setSelectedData(option?.data || null)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn dữ liệu để gửi" />
                        </SelectTrigger>
                        <SelectContent>
                          {getDataOptions().map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {(selectedData || contextData) && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium mb-2">Dữ liệu đã chọn:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(selectedData || contextData || {}).slice(0, 6).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium w-20 truncate">{key}:</span>
                              <span className="text-gray-600 truncate">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Email Compose Form */}
              {(selectedData || contextData) && (
                <Card>
                  <CardHeader>
                    <CardTitle>6. Thông Tin Email</CardTitle>
                    <CardDescription>Điền thông tin chi tiết email</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Người Nhận *</Label>
                      <Input
                        id="recipient"
                        type="email"
                        placeholder="Nhập email người nhận"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Tiêu Đề Email (Tùy chọn)</Label>
                      <Input
                        id="subject"
                        placeholder="Để trống sẽ dùng tiêu đề mặc định của template"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tin Nhắn Tùy Chỉnh (Tùy chọn)</Label>
                      <Textarea
                        id="message"
                        placeholder="Thêm tin nhắn tùy chỉnh..."
                        rows={3}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={generatePreview} variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Xem Trước
                      </Button>
                      <Button onClick={handleSendEmail} disabled={sending} className="gap-2">
                        {sending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {sending ? 'Đang Gửi...' : 'Gửi Email'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preview">
              {emailPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bản Xem Trước Email</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      Xem trước email với thiết kế đã chọn
                      <Badge variant="secondary">{templateDesigns.find(d => d.id === selectedDesign)?.name}</Badge>
                      <Badge variant="outline">{backgroundOptions.find(b => b.id === selectedBackground)?.name}</Badge>
                      <Badge variant="outline">{layoutOptions.find(l => l.id === selectedLayout)?.name}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full border rounded-md p-4">
                      <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AdvancedEmailComposer }