"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Plus, 
  Trash2,
  Settings,
  Palette 
} from "lucide-react"
import { useEmail } from "@/hooks/use-email"
import { EmailDesigner } from "./email-designer"

interface EmailSettingsProps {
  onSettingsChange?: (settings: EmailNotificationSettings) => void
}

interface EmailNotificationSettings {
  enabled: boolean
  recipients: string[]
  notifyOnTaskCreated: boolean
  notifyOnTaskCompleted: boolean
  notifyOnProjectUpdate: boolean
}

export function EmailSettings({ onSettingsChange }: EmailSettingsProps) {
  const { status, testConnection, sendCustomEmail } = useEmail()
  
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    enabled: false,
    recipients: [],
    notifyOnTaskCreated: true,
    notifyOnTaskCompleted: true,
    notifyOnProjectUpdate: true,
  })

  const [newRecipient, setNewRecipient] = useState("")
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean
    connected: boolean | null
    loading: boolean
  }>({
    tested: false,
    connected: null,
    loading: false
  })
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("emailNotificationSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      onSettingsChange?.(parsed)
    }
  }, []) // Remove onSettingsChange dependency to prevent infinite re-renders

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("emailNotificationSettings", JSON.stringify(settings))
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  const handleConnectionTest = async () => {
    setConnectionStatus({ ...connectionStatus, loading: true })
    try {
      await testConnection()
      setConnectionStatus({ tested: true, connected: true, loading: false })
    } catch (err) {
      setConnectionStatus({ tested: true, connected: false, loading: false })
    }
  }

  const handleAddRecipient = () => {
    if (newRecipient && !settings.recipients.includes(newRecipient)) {
      setSettings({
        ...settings,
        recipients: [...settings.recipients, newRecipient]
      })
      setNewRecipient("")
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setSettings({
      ...settings,
      recipients: settings.recipients.filter(r => r !== email)
    })
  }

  const handleSendTestEmail = async () => {
    if (settings.recipients.length === 0) {
      alert("Vui lòng thêm ít nhất một người nhận")
      return
    }

    try {
      await sendCustomEmail({
        subject: "🧪 Test Email - Project Manager System",
        html: `
          <h2>Email Test Thành Công!</h2>
          <p>Đây là email test từ hệ thống Project Manager.</p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</p>
          <p>Nếu bạn nhận được email này, nghĩa là cấu hình SMTP đã hoạt động đúng.</p>
        `,
        text: `Email Test Thành Công! Thời gian: ${new Date().toLocaleString("vi-VN")}`
      }, settings.recipients)
      alert("Email test đã được gửi thành công!")
    } catch (error) {
      console.error("Error sending test email:", error)
      alert("Lỗi khi gửi email test. Vui lòng kiểm tra cấu hình SMTP.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cài Đặt Hệ Thống Email</h1>
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
          {connectionStatus.tested && (
            <Badge variant={connectionStatus.connected ? "default" : "destructive"}>
              {connectionStatus.connected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Đã Kết Nối
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Chưa Kết Nối
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alert */}
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

      {/* Main Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cấu Hình Email
          </TabsTrigger>
          <TabsTrigger value="designer" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thiết Kế Email
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Thông Báo Email Tự Động
                </CardTitle>
                <CardDescription>
                  Cấu hình thông báo email tự động cho các sự kiện trong dự án
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bật Thông Báo Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi email tự động khi có sự kiện quan trọng xảy ra
                    </p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                  />
                </div>

                <Separator />

                {/* Notification Types */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Các Loại Thông Báo</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taskCreated" className="font-normal">
                      Nhiệm Vụ Được Tạo Mới
                    </Label>
                    <Switch
                      id="taskCreated"
                      checked={settings.notifyOnTaskCreated}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, notifyOnTaskCreated: checked })
                      }
                      disabled={!settings.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="taskCompleted" className="font-normal">
                      Nhiệm Vụ Được Hoàn Thành
                    </Label>
                    <Switch
                      id="taskCompleted"
                      checked={settings.notifyOnTaskCompleted}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, notifyOnTaskCompleted: checked })
                      }
                      disabled={!settings.enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="projectUpdate" className="font-normal">
                      Cập Nhật Tiến Độ Dự Án
                    </Label>
                    <Switch
                      id="projectUpdate"
                      checked={settings.notifyOnProjectUpdate}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, notifyOnProjectUpdate: checked })
                      }
                      disabled={!settings.enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipients Management */}
            <Card>
              <CardHeader>
                <CardTitle>Quản Lý Người Nhận Email</CardTitle>
                <CardDescription>
                  Quản lý danh sách người nhận thông báo email tự động
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Recipient */}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="nhapvao@example.com"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
                  />
                  <Button onClick={handleAddRecipient} size="sm">
                    <Plus className="h-4 w-4" />
                    Thêm
                  </Button>
                </div>

                {/* Recipients List */}
                <div className="space-y-2">
                  {settings.recipients.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có người nhận nào được thêm vào danh sách
                    </p>
                  ) : (
                    settings.recipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecipient(email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {/* Test Email */}
                <Separator />
                <Button
                  onClick={handleSendTestEmail}
                  variant="outline"
                  className="w-full"
                  disabled={settings.recipients.length === 0 || status.loading}
                >
                  {status.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Gửi Email Kiểm Tra
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SMTP Configuration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng Dẫn Cấu Hình SMTP</CardTitle>
              <CardDescription>
                Cấu hình máy chủ SMTP để gửi email thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Biến Môi Trường Cần Thiết (file .env):</h4>
                <div className="space-y-1 text-sm font-mono">
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
                  <li>1. Đăng ký tài khoản tại trang web <strong>mailersend.com</strong></li>
                  <li>2. Tạo API token trong mục Settings → API Tokens</li>
                  <li>3. Thêm tên miền và xác thực tên miền của bạn</li>
                  <li>4. Sử dụng API token làm SMTP_PASS trong file .env</li>
                  <li>5. Khởi động lại ứng dụng sau khi cập nhật file .env</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Designer Tab */}
        <TabsContent value="designer">
          <EmailDesigner />
        </TabsContent>
      </Tabs>
    </div>
  )
}
