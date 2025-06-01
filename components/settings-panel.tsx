"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  onImportData: (data: any) => Promise<void>
}

export function SettingsPanel({ 
  projects, 
  accounts, 
  tasks, 
  onImportData 
}: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    tasks: true,
  })
  const [customColors, setCustomColors] = useState({
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#ffffff",
  })

  // Load saved custom colors on mount
  useEffect(() => {
    const savedColors = localStorage.getItem("customColors")
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors)
        setCustomColors(parsedColors)
        // Auto-apply saved colors
        const root = document.documentElement
        const hexToHsl = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16) / 255
          const g = parseInt(hex.slice(3, 5), 16) / 255
          const b = parseInt(hex.slice(5, 7), 16) / 255
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          let h = 0, s = 0, l = (max + min) / 2
          if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break
              case g: h = (b - r) / d + 2; break
              case b: h = (r - g) / d + 4; break
            }
            h /= 6
          }
          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
        }
        root.style.setProperty("--primary", hexToHsl(parsedColors.primary))
        root.style.setProperty("--secondary", hexToHsl(parsedColors.secondary))
        root.style.setProperty("--accent", hexToHsl(parsedColors.accent))
        root.style.setProperty("--background", hexToHsl(parsedColors.background))
      } catch (error) {
        console.error("Error loading custom colors:", error)
      }
    }
  }, [])

  const exportData = () => {
    const data = {
      projects,
      accounts,
      tasks,
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
    
    // Convert hex colors to HSL values
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    }
    
    // Apply custom colors as CSS variables
    root.style.setProperty("--primary", hexToHsl(customColors.primary))
    root.style.setProperty("--secondary", hexToHsl(customColors.secondary))
    root.style.setProperty("--accent", hexToHsl(customColors.accent))
    root.style.setProperty("--background", hexToHsl(customColors.background))
    
    // Save to localStorage
    localStorage.setItem("customColors", JSON.stringify(customColors))
    
    // Show success message
    alert(t("colorsAppliedSuccessfully") || "Colors applied successfully!")
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
                <div className="flex gap-2">
                  <Input
                    id="primary"
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary">{t("secondaryColor")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent">{t("accentColor")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent"
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={customColors.accent}
                    onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">{t("backgroundColor")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={customColors.background}
                    onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={customColors.background}
                    onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="grid grid-cols-4 gap-2">
                <div
                  className="h-12 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: customColors.primary, color: '#fff' }}
                >
                  Primary
                </div>
                <div
                  className="h-12 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: customColors.secondary, color: '#fff' }}
                >
                  Secondary
                </div>
                <div
                  className="h-12 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: customColors.accent, color: '#fff' }}
                >
                  Accent
                </div>
                <div
                  className="h-12 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: customColors.background, color: '#000' }}
                >
                  Background
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={applyCustomTheme} className="flex-1">
                {t("applyColors")}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const defaultColors = {
                    primary: "#3b82f6",
                    secondary: "#64748b", 
                    accent: "#f59e0b",
                    background: "#ffffff"
                  }
                  setCustomColors(defaultColors)
                }}
              >
                Reset
              </Button>
            </div>
            
            {/* Preset Themes */}
            <div className="space-y-2">
              <Label>Preset Themes</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomColors({
                    primary: "#3b82f6", // Blue
                    secondary: "#64748b", // Slate
                    accent: "#f59e0b", // Amber
                    background: "#ffffff" // White
                  })}
                >
                  🔵 Default Blue
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomColors({
                    primary: "#10b981", // Emerald
                    secondary: "#6b7280", // Gray
                    accent: "#f59e0b", // Amber
                    background: "#ffffff" // White
                  })}
                >
                  🟢 Green Nature
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomColors({
                    primary: "#8b5cf6", // Violet
                    secondary: "#64748b", // Slate
                    accent: "#ec4899", // Pink
                    background: "#ffffff" // White
                  })}
                >
                  🟣 Purple Royal
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomColors({
                    primary: "#ef4444", // Red
                    secondary: "#64748b", // Slate
                    accent: "#f97316", // Orange
                    background: "#ffffff" // White
                  })}
                >
                  🔴 Red Energy
                </Button>
              </div>
            </div>
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
