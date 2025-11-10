"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLocalDateString } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ExternalLink, Eye, Grid3X3, List, Search, Download, Calendar, Users, Mail, Share2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { LazyLoadList } from "@/components/ui/lazy-load"
import AdvancedEmailComposer from "@/components/advanced-email-composer"
import { ShareModal } from "@/features/share/ShareModal"
import styled from 'styled-components';

interface Project {
  id: string
  name: string
  domain: string
  figmaLink: string
  description: string
  status: string
  accounts: any[]
  createdAt: string
}

interface ProjectFormProps {
  projects: any[]
  onAddProject: (projectData: any) => Promise<any>
  onEditProject: (id: string, projectData: any) => Promise<any>
  onDeleteProject: (id: string) => Promise<any>
}

export function ProjectForm({
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject
}: ProjectFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false) // New state to control form visibility
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [showProjectDetails, setShowProjectDetails] = useState(false)

  // Grid view states
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedProjectForShare, setSelectedProjectForShare] = useState<Project | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    figmaLink: "",
    description: "",
    status: "active",
  })
  const { t } = useLanguage()
  // Remove useDatabase since functions are passed via props
  // const { addProject, editProject, removeProject } = useDatabase()

  // Filter projects based on search and status
  const filteredProjects = (projects || []).filter(project => {
    if (!project) return false

    const name = project.name || ''
    const description = project.description || ''
    const domain = project.domain || ''
    const query = searchQuery.toLowerCase()

    const matchesSearch = name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      domain.toLowerCase().includes(query)

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Vietnamese text
  const vietnameseText = {
    projects: 'Dự Án',
    search: 'Tìm kiếm dự án...',
    status: 'Trạng thái',
    all: 'Tất cả',
    active: 'Đang hoạt động',
    paused: 'Tạm dừng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy', viewMode: 'Chế độ xem',
    listView: 'Danh sách',
    gridView: 'Lưới',
    view: 'Xem',
    edit: 'Sửa',
    delete: 'Xóa',
    noResults: 'Không tìm thấy dự án nào'
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Kiểm tra bắt buộc trường name
      if (!formData.name || formData.name.trim() === "") {
        alert("Tên dự án là bắt buộc.")
        return
      }
      // Map form data to match API expectations
      const apiProjectData = {
        name: formData.name,
        domain: formData.domain,
        figma_link: formData.figmaLink, // Map figmaLink to figma_link
        description: formData.description,
        status: formData.status,
      }

      if (isEditing && editingProject) {
        await onEditProject(editingProject.id, apiProjectData)
      } else {
        await onAddProject(apiProjectData)
      }

      setFormData({ name: "", domain: "", figmaLink: "", description: "", status: "active" })
      setIsEditing(false)
      setEditingProject(null)
      setShowForm(false) // Hide form after submit
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Error saving project. Please try again.")
    }
  }

  const handleEdit = (project: Project) => {
    setFormData({
      name: project.name,
      domain: project.domain,
      figmaLink: project.figmaLink,
      description: project.description,
      status: project.status,
    })
    setEditingProject(project)
    setIsEditing(true)
    setShowForm(true) // Show form when editing
  }

  const handleViewDetails = (project: Project) => {
    setViewingProject(project)
    setShowProjectDetails(true)
  }

  const handleDelete = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await onDeleteProject(projectId)
      } catch (error) {
        console.error("Error deleting project:", error)
        alert("Error deleting project. Please try again.")
      }
    }
  }
  return (
    <div className="space-y-6">
      {/* Enhanced Header with Vietnamese Grid Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{vietnameseText.projects}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredProjects.length} dự án
            </p>
          </div>
          <Button
            onClick={() => {
              setIsEditing(false)
              setEditingProject(null)
              setFormData({ name: "", domain: "", figmaLink: "", description: "", status: "active" })
              setShowForm(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("newProject")}
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative px-6">
            <Search className="ml-3 absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={vietnameseText.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={vietnameseText.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{vietnameseText.all}</SelectItem>
                <SelectItem value="active">{vietnameseText.active}</SelectItem>
                <SelectItem value="paused">{vietnameseText.paused}</SelectItem>
                <SelectItem value="completed">{vietnameseText.completed}</SelectItem>
                <SelectItem value="cancelled">{vietnameseText.cancelled}</SelectItem>
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
        <StyledWrapper>
          <div className="brutalist-card">
            <div className="brutalist-card__header">
              <div className="brutalist-card__icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <div className="brutalist-card__alert">Warning</div>
            </div>
            <div className="brutalist-card__message">
              This is a brutalist card with a very angry button. Proceed with caution,
              you've been warned.
            </div>
            <div className="brutalist-card__actions">
              <a className="brutalist-card__button brutalist-card__button--mark" href="#">Mark as Read</a>
              <a className="brutalist-card__button brutalist-card__button--read" href="#">Okay</a>
            </div>
          </div>
        </StyledWrapper>
        {/* Form Card - Conditionally render based on showForm */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? t("editProject") : t("addNewProject")}</CardTitle>
              <CardDescription>{t("fillProjectDetails")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("projectName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("enterProjectName")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">{t("domain")}</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="figmaLink">{t("figmaLink")}</Label>
                  <Input
                    id="figmaLink"
                    value={formData.figmaLink}
                    onChange={(e) => setFormData({ ...formData, figmaLink: e.target.value })}
                    placeholder="https://figma.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("projectDescription")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("status")}</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="paused">{t("paused")}</SelectItem>
                      <SelectItem value="completed">{t("completed")}</SelectItem>
                      <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {isEditing ? t("updateProject") : t("createProject")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}        {/* Projects Display with Grid/List Toggle */}
        {viewMode === 'list' ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("existingProjects")}</CardTitle>
              <CardDescription>{t("manageYourProjects")}</CardDescription>
            </CardHeader>
            <CardContent>
              <LazyLoadList
                items={filteredProjects}
                batchSize={6}
                getItemKey={(project) => project.id || project._id || `project-${project.name}`}
                renderItem={(project, index) => (
                  <div key={project.id || `project-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description || 'Chưa có mô tả'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {project.status === 'active' ? vietnameseText.active :
                              project.status === 'completed' ? vietnameseText.completed :
                                project.status === 'paused' ? vietnameseText.paused :
                                  vietnameseText.cancelled}
                          </Badge>
                          {project.domain && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={project.domain} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProjectForShare(project)
                            setShareModalOpen(true)
                          }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(project)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AdvancedEmailComposer
                          initialEmailType="projectUpdate"
                          contextData={project}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Mail className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                emptyMessage={searchQuery || statusFilter !== 'all' ? vietnameseText.noResults : 'Chưa có dự án nào'}
                loadingText="Đang tải thêm dự án..."
                noMoreText="Đã hiển thị tất cả dự án"
              />
            </CardContent>
          </Card>
        ) : (
          /* Vietnamese Grid View */
          <div className="space-y-4">
            <LazyLoadList
              items={filteredProjects}
              batchSize={8}
              getItemKey={(project) => project.id || project._id || `project-${project.name}`}
              renderItem={(project, index) => (
                <Card key={project.id || `card-project-${index}`} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={project.status === 'active' ? 'default' :
                              project.status === 'completed' ? 'secondary' :
                                project.status === 'paused' ? 'outline' : 'destructive'}
                            className="text-xs"
                          >
                            {project.status === 'active' ? vietnameseText.active :
                              project.status === 'completed' ? vietnameseText.completed :
                                project.status === 'paused' ? vietnameseText.paused :
                                  vietnameseText.cancelled}
                          </Badge>
                          {project.accounts && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {project.accounts.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {project.description || 'Chưa có mô tả'}
                      </p>
                      {/* Domain */}
                      {project.domain && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          <a
                            href={project.domain}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate"
                          >
                            {project.domain.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}

                      {/* Figma Link */}
                      {project.figmaLink && (
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.332 8.668a3.333 3.333 0 0 0 0-6.663H8.668a3.333 3.333 0 0 0 0 6.663 3.333 3.333 0 0 0 0 6.665 3.333 3.333 0 1 0 3.332 3.332V8.668h3.332z" />
                            <circle cx="15.332" cy="12.001" r="3.332" />
                          </svg>
                          <a
                            href={project.figmaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:underline truncate"
                          >
                            Figma Design
                          </a>
                        </div>
                      )}

                      {/* Created Date */}
                      {project.createdAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {getLocalDateString(new Date(project.createdAt))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProjectForShare(project)
                              setShareModalOpen(true)
                            }}
                            className="text-xs px-2 h-7 text-blue-500 hover:text-blue-600"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(project)}
                            className="text-xs px-2 h-7"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {vietnameseText.view}
                          </Button>
                          <AdvancedEmailComposer
                            initialEmailType="projectUpdate"
                            contextData={project}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 h-7 text-blue-600 hover:text-blue-700"
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Button>
                            }
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(project)}
                            className="text-xs px-2 h-7"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
                            className="text-xs px-2 h-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              emptyMessage={searchQuery || statusFilter !== 'all' ? vietnameseText.noResults : 'Chưa có dự án nào'}
              loadingText="Đang tải thêm dự án..."
              noMoreText="Đã hiển thị tất cả dự án"
            />

            {/* Empty State for Grid when no lazy loading visible */}
            {filteredProjects.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Grid3X3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || statusFilter !== 'all' ? vietnameseText.noResults : 'Chưa có dự án nào'}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {searchQuery || statusFilter !== 'all' ?
                      'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn' :
                      'Tạo dự án đầu tiên để bắt đầu quản lý công việc của bạn'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Project Details Dialog */}
      <Dialog open={showProjectDetails} onOpenChange={setShowProjectDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết dự án</DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về dự án
            </DialogDescription>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tên dự án</Label>
                  <p className="text-sm text-muted-foreground mt-1">{viewingProject.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{viewingProject.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Domain</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingProject.domain ? (
                      <a
                        href={viewingProject.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {viewingProject.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "Chưa có domain"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Figma Link</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingProject.figmaLink ? (
                      <a
                        href={viewingProject.figmaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Xem thiết kế
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "Chưa có thiết kế"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {viewingProject.description || "Chưa có mô tả"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Ngày tạo</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingProject.createdAt ?
                      getLocalDateString(new Date(viewingProject.createdAt)) :
                      "Không xác định"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Số lượng tài khoản</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {viewingProject.accounts?.length || 0} tài khoản
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      {selectedProjectForShare && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="project"
          resourceId={selectedProjectForShare.id || ''}
          resourceName={selectedProjectForShare.name || 'Untitled Project'}
        />
      )}
    </div>
  )
}
const StyledWrapper = styled.div`
  .brutalist-card {
    width: 320px;
    border: none;
    background-color: hsl(var(--card));
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    font-family: "Arial", sans-serif;
  }

  .brutalist-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    border: none;
    padding-bottom: 1rem;
  }

  .brutalist-card__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsl(var(--foreground));
    padding: 0.5rem;
  }

  .brutalist-card__icon svg {
    height: 1.5rem;
    width: 1.5rem;
    fill: hsl(var(--card));
  }

  .brutalist-card__alert {
    font-weight: 600;
    color: hsl(var(--foreground));
    font-size: 1.5rem;
    ;
  }

  .brutalist-card__message {
    margin-top: 1rem;
    color: hsl(var(--foreground));
    font-size: 0.9rem;
    line-height: 1.4;
    border: none;
    padding-bottom: 1rem;
    font-weight: 600;
  }

  .brutalist-card__actions {
    margin-top: 1rem;
  }

  .brutalist-card__button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
    ;
    border: none;
    background-color: hsl(var(--card));
    color: hsl(var(--foreground));
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    text-decoration: none;
    margin-bottom: 1rem;
  }

  .brutalist-card__button--read {
    background-color: hsl(var(--foreground));
    color: hsl(var(--card));
  }

  .brutalist-card__button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: all 0.6s;
  }

  .brutalist-card__button:hover::before {
    left: 100%;
  }

  .brutalist-card__button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .brutalist-card__button--mark:hover {
    background-color: #296fbb;
    border-color: #296fbb;
    color: hsl(var(--card));
    box-shadow: 7px 7px 0 #004280;
  }

  .brutalist-card__button--read:hover {
    background-color: #ff0000;
    border-color: #ff0000;
    color: hsl(var(--card));
    box-shadow: 7px 7px 0 #800000;
  }

  .brutalist-card__button:active {
    transform: translate(5px, 5px);
    box-shadow: none;
  }`;
