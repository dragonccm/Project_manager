"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  User, 
  Folder, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Users,
  FolderOpen,
  Star,
  StarOff,
  Download,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"
import { Account, Project } from "@/types/features"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'accounts' | 'projects' | 'combined'
  fields: string[]
  filters: any
  created_at: string
}

interface AccountsProjectsGridProps {
  accounts: Account[]
  projects: Project[]
  onAccountEdit?: (account: Account) => void
  onProjectEdit?: (project: Project) => void
  onAccountDelete?: (accountId: string) => void
  onProjectDelete?: (projectId: string) => void
}

export function AccountsProjectsGrid({
  accounts,
  projects,
  onAccountEdit,
  onProjectEdit,
  onAccountDelete,
  onProjectDelete
}: AccountsProjectsGridProps) {
  const { t } = useLanguage()
  
  // Display preferences
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'accounts' | 'projects' | 'reports'>('accounts')
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [accountFilter, setAccountFilter] = useState({
    status: "all",
    company: "all"
  })
  const [projectFilter, setProjectFilter] = useState({
    status: "all",
    priority: "all",
    account: "all"
  })
  
  // Report template states
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: "template-1",
      name: "Báo cáo Account tổng quan",
      description: "Hiển thị thông tin cơ bản của tất cả accounts",
      type: "accounts",
      fields: ["username", "email", "website", "company", "created_at"],
      filters: { status: "all" },
      created_at: new Date().toISOString()
    },
    {
      id: "template-2", 
      name: "Báo cáo Project đang hoạt động",
      description: "Danh sách các project đang thực hiện",
      type: "projects",
      fields: ["name", "status", "description", "domain", "created_at"],
      filters: { status: "active" },
      created_at: new Date().toISOString()
    }
  ])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    type: "accounts",
    fields: [],
    filters: {}
  })

  // Get unique companies and accounts for filters
  const uniqueCompanies = useMemo(() => {
    // Since database Account doesn't have company field, we'll use website domain as company
    const companies = accounts.map(acc => {
      try {
        const url = new URL(acc.website)
        return url.hostname.replace('www.', '')
      } catch {
        return acc.website || 'Unknown'
      }
    }).filter(Boolean)
    return [...new Set(companies)]
  }, [accounts])

  const uniqueAccounts = useMemo(() => {
    return accounts.map(acc => ({ id: acc.id.toString(), name: acc.username }))
  }, [accounts])

  // Filtered data
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const searchQuery_lower = searchQuery.toLowerCase()
      const company = account.website ? (()=> {
        try {
          const url = new URL(account.website)
          return url.hostname.replace('www.', '')
        } catch {
          return account.website
        }
      })() : ''
      
      const matchesSearch = account.username.toLowerCase().includes(searchQuery_lower) ||
                           (account.email && account.email.toLowerCase().includes(searchQuery_lower)) ||
                           account.website.toLowerCase().includes(searchQuery_lower) ||
                           company.toLowerCase().includes(searchQuery_lower)
      
      // For now, treat all accounts as active since DB doesn't have status field
      const matchesStatus = accountFilter.status === "all" || accountFilter.status === "active"
      const matchesCompany = accountFilter.company === "all" || company === accountFilter.company
      
      return matchesSearch && matchesStatus && matchesCompany
    })
  }, [accounts, searchQuery, accountFilter])

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = projectFilter.status === "all" || project.status === projectFilter.status
      // Database Project doesn't have priority field, so ignore priority filter for now
      const matchesPriority = projectFilter.priority === "all" || true
      // Database Project doesn't have account_id field, so ignore account filter for now  
      const matchesAccount = projectFilter.account === "all" || true
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAccount
    })
  }, [projects, searchQuery, projectFilter])

  // Template management functions
  const handleSaveTemplate = () => {
    if (!newTemplate.name) return
    
    const template: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name!,
      description: newTemplate.description || "",
      type: newTemplate.type as 'accounts' | 'projects' | 'combined',
      fields: newTemplate.fields || [],
      filters: newTemplate.filters || {},
      created_at: new Date().toISOString()
    }
    
    setReportTemplates(prev => [...prev, template])
    setShowTemplateForm(false)
    setNewTemplate({ name: "", description: "", type: "accounts", fields: [], filters: {} })
  }

  const handleDeleteTemplate = (templateId: string) => {
    setReportTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  const generateReport = (template: ReportTemplate, format: 'csv' | 'json') => {
    let data: any[] = []
    
    if (template.type === 'accounts') {
      data = filteredAccounts.map(account => {
        const reportData: any = {}
        const company = account.website ? (()=> {
          try {
            const url = new URL(account.website)
            return url.hostname.replace('www.', '')
          } catch {
            return account.website
          }
        })() : ''
        
        template.fields.forEach(field => {
          switch (field) {
            case 'username': reportData['Tên người dùng'] = account.username; break
            case 'email': reportData['Email'] = account.email || ''; break
            case 'website': reportData['Website'] = account.website; break
            case 'company': reportData['Công ty'] = company; break
            case 'notes': reportData['Ghi chú'] = account.notes || ''; break
            case 'created_at': reportData['Ngày tạo'] = getLocalDateString(new Date(account.created_at)); break
          }
        })
        return reportData
      })
    } else if (template.type === 'projects') {
      data = filteredProjects.map(project => {
        const reportData: any = {}
        template.fields.forEach(field => {
          switch (field) {
            case 'name': reportData['Tên dự án'] = project.name; break
            case 'description': reportData['Mô tả'] = project.description || ''; break
            case 'status': 
              const statusMap = { active: 'Đang thực hiện', paused: 'Tạm dừng', completed: 'Hoàn thành', cancelled: 'Đã hủy' }
              reportData['Trạng thái'] = statusMap[project.status] || project.status; break
            case 'domain': reportData['Domain'] = project.domain || ''; break
            case 'figma_link': reportData['Figma Link'] = project.figma_link || ''; break
            case 'created_at': reportData['Ngày tạo'] = getLocalDateString(new Date(project.created_at)); break
          }
        })
        return reportData
      })
    }

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {})
      let csv = headers.join(',') + '\n'
      data.forEach(row => {
        const values = headers.map(header => `"${row[header] || ''}"`)
        csv += values.join(',') + '\n'
      })
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name}_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const reportData = {
        template: template.name,
        generated_at: new Date().toISOString(),
        total_records: data.length,
        data: data
      }
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name}_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Render account card
  const renderAccountCard = (account: Account) => {
    const company = account.website ? (()=> {
      try {
        const url = new URL(account.website)
        return url.hostname.replace('www.', '')
      } catch {
        return account.website
      }
    })() : ''
    
    return (
      <Card key={account.id} className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{account.username}</CardTitle>
                <CardDescription className="text-sm">{account.email || account.website}</CardDescription>
              </div>
            </div>
            <Badge variant="default">
              Hoạt động
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{getLocalDateString(new Date(account.created_at))}</span>
            </div>
            {account.notes && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="line-clamp-1">{account.notes}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" onClick={() => onAccountEdit?.(account)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onAccountDelete?.(account.id.toString())}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render project card
  const renderProjectCard = (project: Project) => {
    const statusColors = {
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      paused: 'bg-yellow-500',
      cancelled: 'bg-red-500'
    }
    
    return (
      <Card key={project.id} className="group hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{project.name}</CardTitle>
                {project.domain && (
                  <CardDescription className="text-sm">{project.domain}</CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[project.status]}`} />
              <Badge variant="outline">
                {project.status === 'active' ? 'Đang thực hiện' : 
                 project.status === 'completed' ? 'Hoàn thành' :
                 project.status === 'paused' ? 'Tạm dừng' : 'Đã hủy'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{getLocalDateString(new Date(project.created_at))}</span>
            </div>
            {project.figma_link && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="line-clamp-1">Figma Design</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="outline" onClick={() => onProjectEdit?.(project)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onProjectDelete?.(project.id.toString())}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm accounts, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Accounts ({filteredAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Projects ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Báo cáo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Account Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={accountFilter.status}
                    onValueChange={(value) => setAccountFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Công ty</Label>
                  <Select
                    value={accountFilter.company}
                    onValueChange={(value) => setAccountFilter(prev => ({ ...prev, company: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {uniqueCompanies.map(company => (
                        <SelectItem key={company} value={company!}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map(renderAccountCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAccounts.map(renderAccountCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          {/* Project Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={projectFilter.status}
                    onValueChange={(value) => setProjectFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang thực hiện</SelectItem>
                      <SelectItem value="paused">Tạm dừng</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ưu tiên</Label>
                  <Select
                    value={projectFilter.priority}
                    onValueChange={(value) => setProjectFilter(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Khách hàng</Label>
                  <Select
                    value={projectFilter.account}
                    onValueChange={(value) => setProjectFilter(prev => ({ ...prev, account: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {uniqueAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(renderProjectCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(renderProjectCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Report Templates Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Templates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mẫu báo cáo có sẵn</CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowTemplateForm(!showTemplateForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo mẫu
                  </Button>
                </div>
                <CardDescription>
                  Chọn mẫu báo cáo để xuất dữ liệu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reportTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {template.type === 'accounts' ? 'Accounts' : 
                           template.type === 'projects' ? 'Projects' : 'Kết hợp'}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.fields.map(field => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateReport(template, 'csv')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateReport(template, 'json')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Create New Template Form */}
            {showTemplateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Tạo mẫu báo cáo mới</CardTitle>
                  <CardDescription>
                    Tùy chỉnh các trường dữ liệu và bộ lọc
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên mẫu</Label>
                    <Input
                      value={newTemplate.name || ""}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập tên mẫu báo cáo..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mô tả</Label>
                    <Input
                      value={newTemplate.description || ""}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả mẫu báo cáo..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Loại báo cáo</Label>
                    <Select
                      value={newTemplate.type || "accounts"}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accounts">Accounts</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="combined">Kết hợp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveTemplate}>
                      Lưu mẫu
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTemplateForm(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
