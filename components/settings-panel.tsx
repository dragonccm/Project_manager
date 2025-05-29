"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Palette, Globe, Bell, Download, Upload } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"

interface SettingsPanelProps {
  projects: any[]
  accounts: any[]
  tasks: any[]
  feedbacks: any[]
  onImportData: (data: any) => Promise<void>
}

export function SettingsPanel({ 
  projects, 
  accounts, 
  tasks, 
  feedbacks, 
  onImportData 
}: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    feedback: true,
    tasks: true,
  })
  const [customColors, setCustomColors] = useState({
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
  })

  const exportData = () => {
    const data = {
      projects,
      accounts,
      tasks,
      feedbacks,
      settings: {
        language,
        theme,
        notifications,
        customColors,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `project_manager_backup_${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Use the prop function to handle data import
        await onImportData(data)

        if (data.settings) {
          if (data.settings.language) setLanguage(data.settings.language)
          if (data.settings.theme) setTheme(data.settings.theme)
          if (data.settings.notifications) setNotifications(data.settings.notifications)
          if (data.settings.customColors) setCustomColors(data.settings.customColors)
        }

        alert(t("dataImportedSuccessfully"))
        window.location.reload()
      } catch (error) {
        alert(t("errorImportingData"))
      }
    }
    reader.readAsText(file)
  }

  const applyCustomTheme = () => {
    const root = document.documentElement
    root.style.setProperty("--primary", customColors.primary)
    root.style.setProperty("--secondary", customColors.secondary)
    root.style.setProperty("--accent", customColors.accent)
    root.style.setProperty("--background", customColors.background)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("languageAndTheme")}
            </CardTitle>
            <CardDescription>{t("customizeAppearance")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("language")}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">{t("theme")}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("light")}</SelectItem>
                  <SelectItem value="dark">{t("dark")}</SelectItem>
                  <SelectItem value="system">{t("system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Custom Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("customColors")}
            </CardTitle>
            <CardDescription>{t("personalizeColors")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">{t("primaryColor")}</Label>
                <Input
                  id="primary"
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary">{t("secondaryColor")}</Label>
                <Input
                  id="secondary"
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent">{t("accentColor")}</Label>
                <Input
                  id="accent"
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">{t("backgroundColor")}</Label>
                <Input
                  id="background"
                  type="color"
                  value={customColors.background}
                  onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={applyCustomTheme} className="w-full">
              {t("applyColors")}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>{t("manageNotificationSettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">{t("emailNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("receiveEmailUpdates")}</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desktop-notifications">{t("desktopNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("showDesktopAlerts")}</p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={notifications.desktop}
                onCheckedChange={(checked) => setNotifications({ ...notifications, desktop: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="feedback-notifications">{t("feedbackNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("notifyNewFeedback")}</p>
              </div>
              <Switch
                id="feedback-notifications"
                checked={notifications.feedback}
                onCheckedChange={(checked) => setNotifications({ ...notifications, feedback: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="task-notifications">{t("taskNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("remindTaskDeadlines")}</p>
              </div>
              <Switch
                id="task-notifications"
                checked={notifications.tasks}
                onCheckedChange={(checked) => setNotifications({ ...notifications, tasks: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dataManagement")}</CardTitle>
            <CardDescription>{t("backupAndRestore")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {t("exportData")}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="import-file">{t("importData")}</Label>
              <Input id="import-file" type="file" accept=".json" onChange={importData} />
            </div>

            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {t("importFromFile")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
