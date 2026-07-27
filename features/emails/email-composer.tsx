"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, TestTube, Settings, Loader2, CheckCircle, XCircle, RefreshCw, Eye } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useEmail } from "@/hooks/use-email"

interface EmailComposerProps {
  projects: any[]
  tasks?: any[]
  accounts?: any[]
}

export function EmailComposer({ projects, tasks = [], accounts = [] }: EmailComposerProps) {
  const { t } = useLanguage()
  const { 
    status,
    sendEmail,
    testConnection, 
    sendTaskCreatedEmail, 
    sendTaskCompletedEmail, 
    sendProjectUpdateEmail, 
    sendCustomEmail 
  } = useEmail()

  // Debug: Log tasks để kiểm tra

  const [emailData, setEmailData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    content: "",
    emailType: "custom" as "task_created" | "task_completed" | "project_update" | "custom",
  })
  
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean | null
    loading: boolean
  }>({
    connected: null,
    loading: false
  })

  const [selectedTask, setSelectedTask] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [activeTab, setActiveTab] = useState("compose")

  const handleConnectionTest = async () => {
    setConnectionStatus({ ...connectionStatus, loading: true })
    try {
      await testConnection()
      setConnectionStatus({ connected: true, loading: false })
    } catch (err) {
      setConnectionStatus({ connected: false, loading: false })
    }
  }

  const handleSendEmail = async () => {
    try {
      const { to, cc, bcc, subject, content, emailType } = emailData
      
      if (!to || !subject || !content) {
        alert("Vui lòng điền đầy đủ thông tin email")
        return
      }

      switch (emailType) {
        case "task_created":
          if (!selectedTask) {
            alert("Vui lòng chọn task")
            return
          }
          const task = tasks.find(t => t.id === selectedTask)
          if (!task) {
            alert("Task không tìm thấy")
            return
          }
          await sendTaskCreatedEmail({
            taskTitle: task.title,
            taskDescription: task.description,
            projectName: projects.find(p => p.id === task.projectId)?.name || "",
            priority: task.priority,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo
          }, to)
          break
        
        case "task_completed":
          if (!selectedTask) {
            alert("Vui lòng chọn task")
            return
          }
          const completedTask = tasks.find(t => t.id === selectedTask)
          if (!completedTask) {
            alert("Task không tìm thấy")
            return
          }
          await sendTaskCompletedEmail({
            taskTitle: completedTask.title,
            taskDescription: completedTask.description,
            projectName: projects.find(p => p.id === completedTask.projectId)?.name || "",
            priority: completedTask.priority,
            dueDate: completedTask.dueDate
          }, to)
          break
          
        case "project_update":
          if (!selectedProject) {
            alert("Vui lòng chọn project")
            return
          }
          const project = projects.find(p => p.id === selectedProject)
          if (!project) {
            alert("Project không tìm thấy")
            return
          }
          await sendProjectUpdateEmail({
            projectName: project.name,
            updateType: "updated" as const,
            description: content,
            progress: project.progress || 0
          }, to)
          break
          
        case "custom":
        default:
          await sendCustomEmail({
            subject: subject,
            html: content,
            text: content
          }, to)
          break
      }

      // Clear form on success
      setEmailData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        content: "",
        emailType: "custom",
      })
      setSelectedTask("")
      setSelectedProject("")
      
    } catch (err) {
      console.error("Error sending email:", err)
    }
  }

  const getEmailTypeOptions = () => [
    { value: "custom", label: "📧 Email Tùy Chỉnh Cá Nhân" },
    { value: "task_created", label: "🆕 Thông Báo Nhiệm Vụ Mới Được Tạo" },
    { value: "task_completed", label: "✅ Thông Báo Nhiệm Vụ Đã Hoàn Thành" },
    { value: "project_update", label: "📊 Cập Nhật Tiến Độ Dự Án" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Soạn Thảo và Gửi Email</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleConnectionTest}
            disabled={connectionStatus.loading}
          >
            {connectionStatus.loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Kiểm Tra Kết Nối SMTP
          </Button>
          {connectionStatus.connected === true && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("connectedStatus")}
            </Badge>
          )}
          {connectionStatus.connected === false && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {t("disconnectedStatus")}
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {status.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}

      {status.success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{status.success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Soạn Thảo Email</TabsTrigger>
          <TabsTrigger value="settings">Cấu Hình SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Soạn Thảo Email
              </CardTitle>
              <CardDescription>
                Soạn thảo và gửi email thông báo sử dụng máy chủ SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="emailType">Loại Thông Báo Email</Label>
                <Select
                  value={emailData.emailType}
                  onValueChange={(value: any) => setEmailData({ ...emailData, emailType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại email thông báo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getEmailTypeOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task Selection for task-related emails */}
              {(emailData.emailType === "task_created" || emailData.emailType === "task_completed") && (
                <div className="space-y-2">
                  <Label htmlFor="selectedTask">Chọn Nhiệm Vụ ({tasks.length} nhiệm vụ có sẵn)</Label>
                  {tasks.length === 0 && (
                    <Alert>
                      <AlertDescription>
                        Không có nhiệm vụ nào. Hãy tạo nhiệm vụ trong mục "Quản Lý Nhiệm Vụ Hàng Ngày" trước.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder={tasks.length > 0 ? "Chọn nhiệm vụ..." : "Không có nhiệm vụ nào"} />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title} - {projects.find(p => p.id === task.projectId)?.name || 'Không thuộc dự án nào'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Project Selection for project updates */}
              {emailData.emailType === "project_update" && (
                <div className="space-y-2">
                  <Label htmlFor="selectedProject">Chọn Dự Án</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dự án cần cập nhật..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} - {project.domain || 'Chưa có tên miền'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Recipients */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">Gửi Đến (Email Chính) *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    placeholder="nguoidung@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc">Sao Chép (CC)</Label>
                  <Input
                    id="cc"
                    type="email"
                    value={emailData.cc}
                    onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                    placeholder="quanly@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bcc">Sao Chép Ẩn (BCC)</Label>
                  <Input
                    id="bcc"
                    type="email"
                    value={emailData.bcc}
                    onChange={(e) => setEmailData({ ...emailData, bcc: e.target.value })}
                    placeholder="banthan@example.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Chủ Đề Email *</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Nhập tiêu đề email tại đây..."
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Nội Dung Email *</Label>
                <Textarea
                  id="content"
                  value={emailData.content}
                  onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                  placeholder="Nhập nội dung chi tiết của email tại đây..."
                  rows={8}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendEmail} 
                  className="flex-1"
                  disabled={status.loading || !emailData.to || !emailData.subject || !emailData.content}
                >
                  {status.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang Gửi Email...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi Email Ngay
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailData({
                      to: "",
                      cc: "",
                      bcc: "",
                      subject: "",
                      content: "",
                      emailType: "custom",
                    })
                    setSelectedTask("")
                    setSelectedProject("")
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm Mới Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cấu Hình Máy Chủ SMTP
              </CardTitle>
              <CardDescription>
                Thiết lập thông tin máy chủ email để gửi thông báo tự động
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Các Biến Môi Trường Cần Thiết:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div>SMTP_HOST=smtp.mailersend.net</div>
                  <div>SMTP_PORT=587</div>
                  <div>SMTP_USER=ten_dang_nhap_cua_ban</div>
                  <div>SMTP_PASS=mat_khau_ung_dung_cua_ban</div>
                  <div>SMTP_FROM=email_cua_ban@domain.com</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">Hướng Dẫn Cấu Hình MailerSend:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Đăng ký tài khoản tại trang web mailersend.com</li>
                  <li>2. Tạo API token trong mục Settings → API Tokens</li>
                  <li>3. Thêm tên miền và xác thực tên miền của bạn</li>
                  <li>4. Sử dụng API token làm SMTP_PASS trong file .env</li>
                  <li>5. Khởi động lại ứng dụng sau khi cập nhật file .env</li>
                </ol>
              </div>

              <Button
                variant="outline"
                onClick={handleConnectionTest}
                disabled={connectionStatus.loading}
                className="w-full"
              >
                {connectionStatus.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Kiểm Tra Kết Nối Máy Chủ SMTP
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
