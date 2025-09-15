"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Copy, Mail, RefreshCw, Plus, User, Search, Grid3X3, List, ExternalLink, Calendar, Trash2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"
import { generateStrongPassword } from "@/lib/password-generator"
// Mobile utilities and components
import {
  getMobileButtonClasses,
  getMobileCardClasses,
  responsiveFlex,
  responsiveGrids,
  responsiveSpacing,
  responsiveText
} from "@/lib/mobile-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  MobileForm,
  MobileFieldset,
  MobileInput,
  MobileSelect,
  MobileFormActions,
  MobileSubmitButton
} from "@/components/ui/mobile-form"

interface Account {
  id: string
  projectId: string
  username: string
  password: string
  email: string
  website: string
  notes: string
  createdAt: string
}

interface AccountManagerProps {
  projects: any[]
  accounts: any[]
  onAddAccount: (accountData: any) => Promise<any>
  onDeleteAccount: (id: string) => Promise<any>
}

export function AccountManager({
  projects,
  accounts,
  onAddAccount,
  onDeleteAccount
}: AccountManagerProps) {
  // ...existing code...
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [showForm, setShowForm] = useState(false)

  // Grid view states
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    projectId: "",
    username: "",
    password: "",
    email: "",
    website: "",
    notes: "",
  })
  const { t } = useLanguage()

  // Filter accounts by search and project
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.notes?.toLowerCase().includes(searchQuery.toLowerCase())

    const accountProjectId = account.projectId || account.project_id
    const matchesProject = projectFilter === 'all' || accountProjectId === projectFilter

    return matchesSearch && matchesProject
  })

  // Vietnamese UI text
  const vietnameseText = {
    accounts: 'Tài Khoản',
    search: 'Tìm kiếm tài khoản...',
    project: 'Dự án',
    all: 'Tất cả',
    viewMode: 'Chế độ xem',
    listView: 'Danh sách',
    gridView: 'Lưới',
    view: 'Xem',
    edit: 'Sửa',
    delete: 'Xóa',
    noResults: 'Không tìm thấy tài khoản nào',
    website: 'Trang web',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    email: 'Email',
    notes: 'Ghi chú',
    actions: 'Thao tác',
    created: 'Tạo ngày'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

  // Validate required fields
    if (!formData.projectId || formData.projectId.trim() === "") {
      alert("Dự án là bắt buộc.")
      return
    }
    if (!formData.username || formData.username.trim() === "") {
      alert("Tên đăng nhập là bắt buộc.")
      return
    }
    if (!formData.password || formData.password.trim() === "") {
      alert("Mật khẩu là bắt buộc.")
      return
    }
    if (!formData.website || formData.website.trim() === "") {
      alert("Website là bắt buộc.")
      return
    }

    try {
      await onAddAccount({
        project_id: formData.projectId,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        website: formData.website,
        notes: formData.notes,
      })

      setFormData({
        projectId: "",
        username: "",
        password: "",
        email: "",
        website: "",
        notes: "",
      })
      setShowForm(false)
    } catch (error) {
      console.error("Error saving account:", error)
      alert("Error saving account. Please try again.")
    }
  }
// ...existing code...

  const autoFillFromWebsite = async () => {
    if (formData.website && formData.username) {
      try {
        const url = new URL(formData.website)
        const domain = url.hostname.replace("www.", "")
        const password = generateStrongPassword()

        setFormData({
          ...formData,
          password,
          email: formData.email || `${formData.username}@${domain}`,
        })
      } catch (error) {
        console.error("Invalid URL")
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    console.log('🔄 Attempting to copy:', text)

    if (!text || text.trim() === '') {
      alert('❌ Không có nội dung để sao chép!')
      return
    }

    try {
      // Check clipboard permissions
      const hasPermission = await navigator.permissions?.query?.({ name: 'clipboard-write' as PermissionName })
      console.log('📋 Clipboard permission:', hasPermission?.state)

      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        console.log('🚀 Using modern clipboard API')
        await navigator.clipboard.writeText(text)
        console.log('✅ Successfully copied with modern API')

        // Show temporary success message
        const originalAlert = window.alert
        window.alert = () => { } // Suppress alert temporarily

        // Create a temporary notification
        const notification = document.createElement('div')
        notification.innerHTML = `✅ Đã sao chép: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          z-index: 9999;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease-out;
        `

        document.body.appendChild(notification)

        setTimeout(() => {
          notification.style.animation = 'slideOut 0.3s ease-in'
          setTimeout(() => {
            document.body.removeChild(notification)
            window.alert = originalAlert
          }, 300)
        }, 2000)

      } else {
        console.log('🔄 Using fallback clipboard method')
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.cssText = `
          position: fixed;
          left: -9999px;
          top: -9999px;
          opacity: 0;
          pointer-events: none;
        `
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          const success = document.execCommand('copy')
          console.log('📋 execCommand result:', success)

          if (success) {
            alert(`✅ Đã sao chép: "${text}"`)
          } else {
            throw new Error('execCommand returned false')
          }
        } catch (err) {
          console.error('❌ execCommand failed:', err)
          // Show copy dialog as last resort
          prompt('Không thể tự động sao chép. Vui lòng copy thủ công:', text)
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error('💥 Copy operation failed:', err)
      // Show copy dialog as fallback
      prompt('Không thể tự động sao chép. Vui lòng copy thủ công:', text)
    }
  }

  const sendEmailWithCredentials = (account: Account) => {
    const subject = `Account Credentials for ${account.website}`
    const body = `Username: ${account.username}\nPassword: ${account.password}\nWebsite: ${account.website}`
    const mailtoLink = `mailto:${account.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Vietnamese Grid Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{vietnameseText.accounts}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAccounts.length} tài khoản
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({ projectId: "", username: "", password: "", email: "", website: "", notes: "" })
              setShowForm(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("addNewAccount")}
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={vietnameseText.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* Project Filter */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={vietnameseText.project} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{vietnameseText.all}</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

  <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        {/* Form Card - Conditionally render based on showForm */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t("addNewAccount")}</CardTitle>
              <CardDescription>{t("createAccountForProject")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">{t("project")}</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectProject")} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t("website")}</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder={t("enterUsername")}
                      required
                    />
                    <Button type="button" variant="outline" onClick={autoFillFromWebsite}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t("enterPassword")}
                      required
                    />
                    <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, password: generateStrongPassword() })}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t("additionalNotes")}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("createAccount")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Accounts Display */}
  <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("savedAccounts")}</CardTitle>
              <CardDescription>{t("manageYourAccounts")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Conditional rendering based on view mode */}
              {viewMode === 'list' ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredAccounts.map((account) => {
                    const accountProjectId = account.projectId || account.project_id
                    const project = projects.find((p) => p.id == accountProjectId)
                    return (
                      <div key={account.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{account.website}</h3>
                            <Badge variant="outline">{project?.name || "Unknown Project"}</Badge>
                          </div>
                          <div className="flex gap-1">
                            {account.email && (
                              <Button variant="ghost" size="sm" onClick={() => sendEmailWithCredentials(account)} title="Send email">
                                <Mail className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAccount(account.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete account"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("username")}:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{account.username}</span>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.username)} title="Copy username" className="copy-button">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">{t("password")}:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono">{showPasswords[account.id] ? account.password : "••••••••"}</span>
                              <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(account.id)} title="Toggle password visibility">
                                {showPasswords[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.password)} title="Copy password" className="copy-button">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {account.email && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t("email")}:</span>
                              <span className="font-mono">{account.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {filteredAccounts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery || projectFilter !== 'all' ? vietnameseText.noResults : t("noAccountsYet")}
                    </div>
                  )}
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAccounts.map((account) => {
                    const project = projects.find((p) => p.id == account.projectId)
                    return (
                      <Card key={account.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium truncate">
                                {account.website}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {project?.name || "Unknown Project"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteAccount(account.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete account"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">{vietnameseText.username}:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-medium">{account.username}</span>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.username)} title="Copy username" className="h-4 w-4 p-0 copy-button">
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">{vietnameseText.password}:</span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono">
                                  {showPasswords[account.id] ? account.password : "••••••••"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePasswordVisibility(account.id)}
                                  className="h-4 w-4 p-0"
                                  title="Toggle password visibility"
                                >
                                  {showPasswords[account.id] ? <EyeOff className="h-2 w-2" /> : <Eye className="h-2 w-2" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.password)} title="Copy password" className="h-4 w-4 p-0">
                                  <Copy className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                            {account.email && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{vietnameseText.email}:</span>
                                <span className="font-mono truncate text-right max-w-[120px]">{account.email}</span>
                              </div>
                            )}
                            { (account.createdAt || account.created_at) && (
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{vietnameseText.created}:</span>
                                <span className="text-right">{getLocalDateString(account.createdAt || account.created_at)}</span>
                              </div>
                            )}
                            {account.website && (
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => window.open(account.website, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {vietnameseText.website}
                                </Button>
                              </div>
                            )}
                            {account.email && (
                              <div className="mt-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => sendEmailWithCredentials(account)}
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Gửi Email
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  {filteredAccounts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      {searchQuery || projectFilter !== 'all' ? vietnameseText.noResults : t("noAccountsYet")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
