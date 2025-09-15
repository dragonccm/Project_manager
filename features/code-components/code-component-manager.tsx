"use client"

import { useState, useMemo, useCallback } from "react"
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useApi } from "@/hooks/use-api"
import { CodeComponent } from "@/types/database"

// Define CreateCodeComponentInput locally to match component expectations
interface CreateCodeComponentInput {
  name: string
  description?: string
  component_type: "element" | "section" | "template" | "widget" | "global"
  content_type?: "code" | "text" | "link" | "file" | "webpage" | "mixed"
  code?: string
  content?: object
  props?: object
  dependencies?: string[]
  tags?: string[]
  preview_image?: string
  category?: string // For backward compatibility
  code_json?: object
  elementor_data?: object
  project_id?: string
}

// Utility functions for safe JSON handling
const safeStringify = (obj: any, spaces = 2) => {
  return JSON.stringify(obj, (key, value) => 
    value instanceof Date ? value.toISOString() : value, 
    spaces
  );
};

const safeParse = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
};

export function CodeComponentManager() {
  const { projects } = useApi()
  
  // Mock code component operations until they're implemented in useApi
  const codeComponents: CodeComponent[] = []
  const addCodeComponent = async (data: CreateCodeComponentInput) => {
    console.log('addCodeComponent not implemented yet', data)
    return {} as CodeComponent
  }
  const editCodeComponent = async (id: string, data: Partial<CreateCodeComponentInput>) => {
    console.log('editCodeComponent not implemented yet', id, data)
  }
  const removeCodeComponent = async (id: string) => {
    console.log('removeCodeComponent not implemented yet', id)
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<CodeComponent | null>(null)
  const [previewComponent, setPreviewComponent] = useState<CodeComponent | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateCodeComponentInput>({
    name: "",
    description: "",
    component_type: "element",
    tags: [],
    code_json: {},
    elementor_data: {},
    project_id: "1",
  })
  const categories = ["element", "section", "template", "widget", "global"] as const

  // Clipboard helper function
  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        alert(successMessage)
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
          alert(successMessage)
        } catch (err) {
          console.error('Failed to copy text: ', err)
          alert('Không thể sao chép. Vui lòng sao chép thủ công.')
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
      alert('Không thể sao chép. Vui lòng sao chép thủ công.')
    }
  }

  // Filter components with performance optimization using useMemo
  const filteredComponents = useMemo(() => {
    return codeComponents.filter((component) => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || component.component_type === categoryFilter
      const matchesProject = projectFilter === "all" // project_id not available in current schema
      
      return matchesSearch && matchesCategory && matchesProject
    })
  }, [codeComponents, searchTerm, categoryFilter, projectFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingComponent) {
        await editCodeComponent(editingComponent.id.toString(), formData)
        setEditingComponent(null)
      } else {
        await addCodeComponent(formData)
        setIsCreateDialogOpen(false)
      }
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        component_type: "element",
        tags: [],
        code: "",
        content: {},
        project_id: "1",
      })
    } catch (error) {
      console.error("Error saving component:", error)
    }
  }
  const handleEdit = useCallback((component: CodeComponent) => {
    setFormData({
      name: component.name,
      description: component.description || "",
      component_type: component.component_type,
      tags: component.tags || [],
      code: component.code || "",
      content: component.content || {},
      project_id: "",
    })
    setEditingComponent(component)
  }, [])

  const handleDelete = useCallback(async (component: CodeComponent) => {
    if (confirm(`Are you sure you want to delete "${component.name}"?`)) {
      await removeCodeComponent(component.id.toString())
    }
  }, [removeCodeComponent])
  const handleTagsChange = useCallback((value: string) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }, [])

  const exportComponent = useCallback((component: CodeComponent) => {
    const exportData = {
      name: component.name,
      description: component.description,
      component_type: component.component_type,
      tags: component.tags,
      code: component.code,
      content: component.content,
    }
    
    const blob = new Blob([safeStringify(exportData, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${component.name.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])
  
  // Export for direct Elementor import
  const exportForElementor = useCallback((component: CodeComponent) => {
    const elementorData = {
      version: "0.4",
      title: component.name,
      type: component.component_type === "section" ? "section" : "widget",
      content: (component.content as any)?.elements || [component.content]
    }
    
    const blob = new Blob([safeStringify(elementorData, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `elementor_${component.name.replace(/\s+/g, "_")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const importComponent = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = safeParse(e.target?.result as string)
        if (!imported) {
          throw new Error("Failed to parse JSON")
        }
        
        // Check if it's an Elementor export file
        if (imported.version && imported.content) {
          // Convert Elementor format to our format
          setFormData({
            name: imported.title || "Imported Component",
            description: `Imported from Elementor (${imported.type})`,
            component_type: imported.type === "section" ? "section" : "element",
            tags: ["imported", "elementor"],
            code: "",
            content: imported.content[0] || imported.content,
            project_id: formData.project_id,
          })
        } else {
          // Regular component format
          setFormData({
            ...imported,
            project_id: formData.project_id, // Keep current project
          })
        }
        setIsCreateDialogOpen(true)
        alert("✅ Component imported successfully!")
      } catch (error) {
        console.error("Error importing component:", error)
        alert("❌ Error importing component. Please check the file format.")
      }    }
    reader.readAsText(file)
  }, [formData.project_id, setIsCreateDialogOpen])

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex items-center justify-between">        <div>
          <h2 className="text-3xl font-bold tracking-tight">Code Components</h2>
          <p className="text-muted-foreground">
            Quản lý các component WordPress Elementor có thể tái sử dụng
          </p>
        </div><div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importComponent}
            className="hidden"
            id="import-component"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("import-component")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Nhập từ file JSON
          </Button><Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">              <DialogHeader>
                <DialogTitle>Thêm Component mới</DialogTitle>
                <div className="flex gap-2 pt-2 pb-2 border-b">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        try {
                          const imported = safeParse(event.target?.result as string)
                          if (!imported) {
                            throw new Error("Failed to parse JSON")
                          }
                          
                          // Check if it's an Elementor export file
                          if (imported.version && imported.content) {
                            // Convert Elementor format to our format
                            setFormData({
                              name: imported.title || "Imported Component",
                              description: `Imported from Elementor (${imported.type})`,
                              component_type: imported.type === "section" ? "section" : "element",
                              tags: ["imported", "elementor"],
                              code: "",
                              content: imported.content[0] || imported.content,
                              project_id: formData.project_id,
                            })
                            alert("✅ File Elementor đã được import thành công!")
                          } else {
                            // Regular component format
                            setFormData({
                              name: imported.name || "",
                              description: imported.description || "",
                              component_type: imported.category || "element",
                              tags: imported.tags || [],
                              code: imported.code_json || "",
                              content: imported.elementor_data || {},
                              project_id: formData.project_id,
                            })
                            alert("✅ File JSON đã được tải thành công!")
                          }
                        } catch (error) {
                          alert("❌ Lỗi đọc file JSON. Vui lòng kiểm tra định dạng file.")
                        }
                      }
                      reader.readAsText(file)
                      // Reset input để có thể chọn lại file
                      e.target.value = ""
                    }}
                    className="hidden"
                    id="json-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("json-upload")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    📁 Tải file JSON lên
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        name: "",
                        description: "",
                        component_type: "element",
                        tags: [],
                        code: "",
                        content: {},
                        project_id: "1",
                      })
                    }}
                    className="text-xs"
                  >
                    🗑️ Xóa form
                  </Button>
                  <div className="text-xs text-muted-foreground self-center">
                    💡 Tip: Tải file JSON để tự động điền form
                  </div>
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên component *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Loại *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Dự án</Label>
                    <Select
                      value={formData.project_id?.toString()}
                      onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                    <Input
                      id="tags"
                      value={formData.tags?.join(", ") || ""}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="button, header, hero"
                    />
                  </div>
                </div>
                
                {/* Row 2: Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Mô tả ngắn gọn về component này..."
                  />
                </div>
                  {/* Row 3: JSON Data - Side by side với chiều cao nhỏ hơn */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="code_json">Code JSON *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, code_json: {} })}
                        className="h-6 px-2 text-xs"
                      >
                        Xóa
                      </Button>
                    </div>                    <Textarea
                      id="code_json"
                      value={safeStringify(formData.code_json, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, code_json: safeParse(e.target.value) || {} })
                        } catch (error) {
                          // Invalid JSON, keep the string for editing
                        }
                      }}
                      rows={6}
                      placeholder='Ví dụ: {"type": "section", "settings": {...}}'
                      required
                      className="font-mono text-xs resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dán JSON code hoặc tải file JSON ở trên
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="elementor_data">Elementor Data *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, elementor_data: {} })}
                        className="h-6 px-2 text-xs"
                      >
                        Xóa
                      </Button>
                    </div>                    <Textarea
                      id="elementor_data"
                      value={safeStringify(formData.elementor_data, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, elementor_data: safeParse(e.target.value) || {} })
                        } catch (error) {
                          // Invalid JSON, keep the string for editing
                        }
                      }}
                      rows={6}
                      placeholder='Ví dụ: {"id": "widget-1", "elType": "widget", ...}'
                      required
                      className="font-mono text-xs resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dán Elementor data hoặc tải file JSON ở trên
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">
                    Thêm Component
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => (
          <Card key={component.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </div>
                <Badge variant="secondary">{component.component_type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {component.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Project: N/A
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewComponent(component)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(component)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportComponent(component)}
                      title="Export JSON"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportForElementor(component)}
                      title="Export for Elementor"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                    >
                      📦
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(component)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {codeComponents.length === 0 
              ? "No code components yet. Create your first component!"
              : "No components match your filters."
            }
          </p>
        </div>
      )}      {/* Edit Dialog */}
      <Dialog open={!!editingComponent} onOpenChange={() => setEditingComponent(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Component</DialogTitle>            <div className="flex gap-2 pt-2 pb-2 border-b">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    try {
                      const imported = safeParse(event.target?.result as string)
                      if (!imported) {
                        throw new Error("Failed to parse JSON")
                      }
                      setFormData({
                        name: imported.name || formData.name,
                        description: imported.description || formData.description,
                        component_type: imported.category || formData.component_type,
                        tags: imported.tags || formData.tags,
                        code: imported.code_json || formData.code,
                        content: imported.elementor_data || formData.content,
                        project_id: formData.project_id,
                      })
                      alert("✅ File JSON đã được cập nhật!")
                    } catch (error) {
                      alert("❌ Lỗi đọc file JSON. Vui lòng kiểm tra định dạng file.")
                    }
                  }
                  reader.readAsText(file)
                  e.target.value = ""
                }}
                className="hidden"
                id="json-upload-edit"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("json-upload-edit")?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                📁 Cập nhật từ file JSON              </Button>
              <div className="text-xs text-muted-foreground self-center">
                💡 Tip: Tải file JSON để cập nhật nội dung
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên component *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Loại *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project">Dự án</Label>
                <Select
                  value={formData.project_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="button, header, hero"
                />
              </div>
            </div>
            
            {/* Row 2: Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Mô tả ngắn gọn về component này..."
              />
            </div>
              {/* Row 3: JSON Data - Side by side với chiều cao nhỏ hơn */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-code-json">Code JSON *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, code_json: {} })}
                    className="h-6 px-2 text-xs"
                  >
                    Xóa
                  </Button>
                </div>                <Textarea
                  id="edit-code-json"
                  value={safeStringify(formData.code_json, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, code_json: safeParse(e.target.value) || {} })
                    } catch (error) {
                      // Invalid JSON, keep the string for editing
                    }
                  }}
                  rows={6}
                  placeholder='Ví dụ: {"type": "section", "settings": {...}}'
                  required
                  className="font-mono text-xs resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Dán JSON code hoặc tải file JSON ở trên
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-elementor-data">Elementor Data *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, elementor_data: {} })}
                    className="h-6 px-2 text-xs"
                  >
                    Xóa
                  </Button>
                </div>                <Textarea
                  id="edit-elementor-data"
                  value={safeStringify(formData.elementor_data, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({ ...formData, elementor_data: safeParse(e.target.value) || {} })
                    } catch (error) {
                      // Invalid JSON, keep the string for editing
                    }
                  }}
                  rows={6}
                  placeholder='Ví dụ: {"id": "widget-1", "elType": "widget", ...}'
                  required
                  className="font-mono text-xs resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Dán Elementor data hoặc tải file JSON ở trên
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingComponent(null)}>
                Hủy
              </Button>
              <Button type="submit">
                Cập nhật Component
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>      {/* Preview Dialog */}
      <Dialog open={!!previewComponent} onOpenChange={() => setPreviewComponent(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước: {previewComponent?.name}</DialogTitle>
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <Badge variant="outline">{previewComponent?.component_type}</Badge>
              <span>•</span>
              <span>Dự án: N/A</span>
              {previewComponent?.tags && previewComponent.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-1">
                    {previewComponent.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </DialogHeader>
          {previewComponent && (
            <div className="space-y-4">
              {/* Description */}
              {previewComponent.description && (
                <div>
                  <h4 className="font-semibold mb-2">Mô tả</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {previewComponent.description}
                  </p>
                </div>
              )}
              
              {/* JSON Data Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Code JSON</h4>                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(safeStringify(previewComponent.code, 2), "JSON đã được sao chép!")}
                    >
                      Sao chép
                    </Button>
                  </div>                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-80 font-mono">
                    {safeStringify(previewComponent.code, 2)}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Elementor Data</h4>                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(safeStringify(previewComponent.content, 2), "Elementor data đã được sao chép!")}
                    >
                      Sao chép
                    </Button>
                  </div>                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-80 font-mono">
                    {safeStringify(previewComponent.content, 2)}
                  </pre>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => exportComponent(previewComponent)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải về JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleEdit(previewComponent)
                    setPreviewComponent(null)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
