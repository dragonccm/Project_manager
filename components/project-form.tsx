"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useDatabase } from "@/hooks/use-database"

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
  onEditProject: (id: number, projectData: any) => Promise<any>
  onDeleteProject: (id: number) => Promise<any>
}

export function ProjectForm({ 
  projects, 
  onAddProject, 
  onEditProject, 
  onDeleteProject 
}: ProjectFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isEditing && editingProject) {
        await onEditProject(Number(editingProject.id), formData)
      } else {
        await onAddProject(formData)
      }

      setFormData({ name: "", domain: "", figmaLink: "", description: "", status: "active" })
      setIsEditing(false)
      setEditingProject(null)
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
  }

  const handleDelete = async (projectId: number) => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("projectManagement")}</h1>
        <Button
          onClick={() => {
            setIsEditing(false)
            setEditingProject(null)
            setFormData({ name: "", domain: "", figmaLink: "", description: "", status: "active" })
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("newProject")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
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

              <Button type="submit" className="w-full">
                {isEditing ? t("updateProject") : t("createProject")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("existingProjects")}</CardTitle>
            <CardDescription>{t("manageYourProjects")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{project.status}</Badge>
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
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(Number(project.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">{t("noProjectsYet")}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
