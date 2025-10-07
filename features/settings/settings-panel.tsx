"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Palette, Globe, Bell, Download, Upload, ImageIcon, Grid, Waves, Zap } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "next-themes"

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
  const [mounted, setMounted] = useState(false)
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

  const [backgroundSettings, setBackgroundSettings] = useState({
    type: "solid", // solid, gradient, pattern, image
    solidColor: "#ffffff",
    gradientStart: "#ffffff",
    gradientEnd: "#f8f9fa",
    gradientDirection: "to-br", // to-r, to-br, to-b, to-bl, to-l, to-tl, to-t, to-tr
    pattern: "none", // none, dots, grid, waves, diagonal
    patternOpacity: 0.1,
    imageUrl: "",
    imageOpacity: 0.8,
    blur: false,
  })

  const backgroundPresets = [
    { name: "Trắng tinh khiết", type: "solid", solidColor: "#ffffff" },
    { name: "Xám nhẹ", type: "solid", solidColor: "#f8f9fa" },
    { name: "Xanh nền", type: "solid", solidColor: "#f0f9ff" },
    { name: "Gradient Xanh", type: "gradient", gradientStart: "#ffffff", gradientEnd: "#e0f2fe", gradientDirection: "to-br" },
    { name: "Gradient Tím", type: "gradient", gradientStart: "#ffffff", gradientEnd: "#f3e8ff", gradientDirection: "to-br" },
    { name: "Gradient Cam", type: "gradient", gradientStart: "#ffffff", gradientEnd: "#fff7ed", gradientDirection: "to-br" },
    { name: "Chấm tròn", type: "pattern", pattern: "dots", solidColor: "#ffffff", patternOpacity: 0.1 },
    { name: "Lưới", type: "pattern", pattern: "grid", solidColor: "#ffffff", patternOpacity: 0.1 },
    { name: "Sóng", type: "pattern", pattern: "waves", solidColor: "#ffffff", patternOpacity: 0.1 },
  ]

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-apply background when settings change (only when mounted)
  useEffect(() => {
    if (mounted) {
      applyBackgroundTheme()
    }
  }, [backgroundSettings, mounted])

  // Listen for theme changes and reapply patterns if needed
  useEffect(() => {
    if (!mounted) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Theme changed, reapply background if using patterns
          if (backgroundSettings.type === 'pattern') {
            setTimeout(() => applyBackgroundTheme(), 100)
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [backgroundSettings, mounted])

  // Load background settings from localStorage on mount
  useEffect(() => {
    if (!mounted) return
    
    const savedSettings = localStorage.getItem('backgroundSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setBackgroundSettings(parsed)
      } catch (error) {
        console.error('Failed to load background settings:', error)
      }
    }
  }, [mounted])

  // Save background settings to localStorage when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings))
    }
  }, [backgroundSettings, mounted])

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
        backgroundSettings,
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
          if (data.settings.backgroundSettings) setBackgroundSettings(data.settings.backgroundSettings)
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

  const applyBackgroundTheme = () => {
    if (!mounted) return
    
    const body = document.body
    
    // Reset all background styles
    body.style.background = ""
    body.style.backgroundImage = ""
    body.className = body.className.replace(/bg-\w+(-\w+)*/g, "")
    
    switch (backgroundSettings.type) {
      case "solid":
        body.style.backgroundColor = backgroundSettings.solidColor
        break
        
      case "gradient":
        const gradientDirection = backgroundSettings.gradientDirection.replace("to-", "")
        body.style.background = `linear-gradient(${gradientDirection}, ${backgroundSettings.gradientStart}, ${backgroundSettings.gradientEnd})`
        break
        
      case "pattern":
        body.style.backgroundColor = backgroundSettings.solidColor
        applyPatternBackground(backgroundSettings.pattern, backgroundSettings.patternOpacity)
        break
        
      case "image":
        if (backgroundSettings.imageUrl) {
          body.style.background = `url(${backgroundSettings.imageUrl})`
          body.style.backgroundSize = "cover"
          body.style.backgroundPosition = "center"
          body.style.backgroundAttachment = "fixed"
          
          if (backgroundSettings.blur) {
            const overlay = document.querySelector('.background-overlay') as HTMLElement
            if (overlay) {
              overlay.style.backdropFilter = "blur(10px)"
            }
          }
        }
        break
    }
  }

  const applyPatternBackground = (pattern: string, opacity: number) => {
    if (!mounted) return
    
    const body = document.body
    const size = "20px"
    
    // Check if dark theme is active
    const isDark = document.documentElement.classList.contains('dark')
    const color = isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`
    
    switch (pattern) {
      case "dots":
        body.style.backgroundImage = `radial-gradient(circle at 2px 2px, ${color} 1px, transparent 0)`
        body.style.backgroundSize = `${size} ${size}`
        break
        
      case "grid":
        body.style.backgroundImage = `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `
        body.style.backgroundSize = `${size} ${size}`
        break
        
      case "waves":
        const fillColor = isDark ? 'ffffff' : '000000'
        body.style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${fillColor}' fill-opacity='${opacity}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        break
        
      case "diagonal":
        body.style.backgroundImage = `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 20px)`
        break
    }
  }

  const applyPreset = (preset: any) => {
    setBackgroundSettings({
      ...backgroundSettings,
      ...preset
    })
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

        {/* Background Themes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Tùy chỉnh nền giao diện
            </CardTitle>
            <CardDescription>Chọn kiểu nền, màu sắc, và hiệu ứng cho giao diện</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Background Type Selection */}
            <div className="space-y-3">
              <Label>Loại nền</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={backgroundSettings.type === "solid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundSettings({ ...backgroundSettings, type: "solid" })}
                  className="justify-start"
                >
                  <div className="w-4 h-4 bg-current rounded mr-2"></div>
                  Màu đơn
                </Button>
                <Button
                  variant={backgroundSettings.type === "gradient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundSettings({ ...backgroundSettings, type: "gradient" })}
                  className="justify-start"
                >
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded mr-2"></div>
                  Gradient
                </Button>
                <Button
                  variant={backgroundSettings.type === "pattern" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundSettings({ ...backgroundSettings, type: "pattern" })}
                  className="justify-start"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Họa tiết
                </Button>
                <Button
                  variant={backgroundSettings.type === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundSettings({ ...backgroundSettings, type: "image" })}
                  className="justify-start"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Hình ảnh
                </Button>
              </div>
            </div>

            {/* Preset Backgrounds */}
            <div className="space-y-3">
              <Label>Nền có sẵn</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {backgroundPresets.map((preset, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full h-16 p-2 relative overflow-hidden"
                      onClick={() => applyPreset(preset)}
                    >
                      <div 
                        className="absolute inset-1 rounded"
                        style={{
                          background: preset.type === "solid" 
                            ? preset.solidColor
                            : preset.type === "gradient"
                            ? `linear-gradient(${preset.gradientDirection?.replace("to-", "") || "to bottom right"}, ${preset.gradientStart}, ${preset.gradientEnd})`
                            : preset.solidColor,
                          ...(preset.pattern && preset.pattern !== "none" && {
                            backgroundImage: preset.pattern === "dots" 
                              ? `radial-gradient(circle at 2px 2px, rgba(0,0,0,${preset.patternOpacity || 0.1}) 1px, transparent 0)`
                              : preset.pattern === "grid"
                              ? `linear-gradient(rgba(0,0,0,${preset.patternOpacity || 0.1}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,${preset.patternOpacity || 0.1}) 1px, transparent 1px)`
                              : undefined,
                            backgroundSize: "10px 10px"
                          })
                        }}
                      />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground truncate">{preset.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Settings based on type */}
            {backgroundSettings.type === "solid" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="solid-color">Màu nền</Label>
                  <Input
                    id="solid-color"
                    type="color"
                    value={backgroundSettings.solidColor}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, solidColor: e.target.value })}
                  />
                </div>
              </div>
            )}

            {backgroundSettings.type === "gradient" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradient-start">Màu bắt đầu</Label>
                    <Input
                      id="gradient-start"
                      type="color"
                      value={backgroundSettings.gradientStart}
                      onChange={(e) => setBackgroundSettings({ ...backgroundSettings, gradientStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradient-end">Màu kết thúc</Label>
                    <Input
                      id="gradient-end"
                      type="color"
                      value={backgroundSettings.gradientEnd}
                      onChange={(e) => setBackgroundSettings({ ...backgroundSettings, gradientEnd: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradient-direction">Hướng gradient</Label>
                  <Select 
                    value={backgroundSettings.gradientDirection} 
                    onValueChange={(value) => setBackgroundSettings({ ...backgroundSettings, gradientDirection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-r">Ngang (→)</SelectItem>
                      <SelectItem value="to-br">Chéo phải (↘)</SelectItem>
                      <SelectItem value="to-b">Dọc (↓)</SelectItem>
                      <SelectItem value="to-bl">Chéo trái (↙)</SelectItem>
                      <SelectItem value="to-l">Ngang ngược (←)</SelectItem>
                      <SelectItem value="to-tl">Chéo trái trên (↖)</SelectItem>
                      <SelectItem value="to-t">Dọc ngược (↑)</SelectItem>
                      <SelectItem value="to-tr">Chéo phải trên (↗)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {backgroundSettings.type === "pattern" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern-bg-color">Màu nền</Label>
                  <Input
                    id="pattern-bg-color"
                    type="color"
                    value={backgroundSettings.solidColor}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, solidColor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loại họa tiết</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant={backgroundSettings.pattern === "dots" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundSettings({ ...backgroundSettings, pattern: "dots" })}
                    >
                      Chấm tròn
                    </Button>
                    <Button
                      variant={backgroundSettings.pattern === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundSettings({ ...backgroundSettings, pattern: "grid" })}
                    >
                      <Grid className="w-4 h-4 mr-1" />
                      Lưới
                    </Button>
                    <Button
                      variant={backgroundSettings.pattern === "waves" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundSettings({ ...backgroundSettings, pattern: "waves" })}
                    >
                      <Waves className="w-4 h-4 mr-1" />
                      Sóng
                    </Button>
                    <Button
                      variant={backgroundSettings.pattern === "diagonal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBackgroundSettings({ ...backgroundSettings, pattern: "diagonal" })}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Chéo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern-opacity">Độ đậm họa tiết: {Math.round(backgroundSettings.patternOpacity * 100)}%</Label>
                  <Input
                    id="pattern-opacity"
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={backgroundSettings.patternOpacity}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, patternOpacity: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            )}

            {backgroundSettings.type === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL hình ảnh</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={backgroundSettings.imageUrl}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-opacity">Độ trong suốt: {Math.round(backgroundSettings.imageOpacity * 100)}%</Label>
                  <Input
                    id="image-opacity"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={backgroundSettings.imageOpacity}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, imageOpacity: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="blur-background"
                    checked={backgroundSettings.blur}
                    onCheckedChange={(checked) => setBackgroundSettings({ ...backgroundSettings, blur: checked })}
                  />
                  <Label htmlFor="blur-background">Làm mờ nền</Label>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button onClick={applyBackgroundTheme} className="w-full" size="lg">
              <ImageIcon className="w-4 h-4 mr-2" />
              Áp dụng nền giao diện
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