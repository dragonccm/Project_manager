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
import { Mail, Plus, Trash2, TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useEmail } from "@/hooks/use-email"

interface EmailSettingsProps {
  onSettingsChange?: (settings: EmailNotificationSettings) => void
}

interface EmailNotificationSettings {
  enabled: boolean
  recipients: string[]
  notifyOnTaskCreated: boolean
  notifyOnTaskCompleted: boolean
  notifyOnProjectUpdate: boolean
  dailyReportEnabled: boolean
  dailyReportTime: string
}

export function EmailSettings({ onSettingsChange }: EmailSettingsProps) {
  const { status, testConnection, sendCustomEmail } = useEmail()
  
  const [settings, setSettings] = useState<EmailNotificationSettings>({
    enabled: false,
    recipients: [],
    notifyOnTaskCreated: true,
    notifyOnTaskCompleted: true,
    notifyOnProjectUpdate: true,
    dailyReportEnabled: false,
    dailyReportTime: "09:00"
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
        <h1 className="text-3xl font-bold">Email Settings</h1>
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
            Test Connection
          </Button>
          {connectionStatus.tested && (
            <Badge variant={connectionStatus.connected ? "default" : "destructive"}>
              {connectionStatus.connected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Cấu hình thông báo email tự động
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bật thông báo email</Label>
                <p className="text-sm text-muted-foreground">
                  Gửi email tự động khi có sự kiện quan trọng
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
              <Label className="text-base font-medium">Loại thông báo</Label>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="taskCreated" className="font-normal">
                  Task được tạo mới
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
                  Task được hoàn thành
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
                  Cập nhật dự án
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

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dailyReport" className="font-normal">
                    Báo cáo hàng ngày
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Gửi tự động vào {settings.dailyReportTime}
                  </p>
                </div>
                <Switch
                  id="dailyReport"
                  checked={settings.dailyReportEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, dailyReportEnabled: checked })
                  }
                  disabled={!settings.enabled}
                />
              </div>

              {settings.dailyReportEnabled && (
                <div className="ml-4">
                  <Label htmlFor="reportTime">Thời gian gửi</Label>
                  <Input
                    id="reportTime"
                    type="time"
                    value={settings.dailyReportTime}
                    onChange={(e) => 
                      setSettings({ ...settings, dailyReportTime: e.target.value })
                    }
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipients Management */}
        <Card>
          <CardHeader>
            <CardTitle>Người nhận email</CardTitle>
            <CardDescription>
              Quản lý danh sách người nhận thông báo email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Recipient */}
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddRecipient()}
              />
              <Button onClick={handleAddRecipient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Recipients List */}
            <div className="space-y-2">
              {settings.recipients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có người nhận nào
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
              Gửi email test
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SMTP Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cấu hình SMTP</CardTitle>
          <CardDescription>
            Cấu hình SMTP server để gửi email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Biến môi trường cần thiết (file .env):</h4>
            <div className="space-y-1 text-sm font-mono">
              <div>SMTP_HOST=smtp.mailersend.net</div>
              <div>SMTP_PORT=587</div>
              <div>SMTP_USER=your_username</div>
              <div>SMTP_PASS=your_password</div>
              <div>SMTP_FROM=your_email@domain.com</div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900">Hướng dẫn cấu hình MailerSend:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Đăng ký tài khoản tại <strong>mailersend.com</strong></li>
              <li>2. Tạo API token trong Settings → API Tokens</li>
              <li>3. Thêm domain và verify domain của bạn</li>
              <li>4. Sử dụng API token làm SMTP_PASS</li>
              <li>5. Restart ứng dụng sau khi cập nhật .env</li>
            </ol>
          </div>
        </CardContent>
      </Card>    </div>
  )
}
