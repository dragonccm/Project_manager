"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Link, FileText, Code, Image, Tag, Bookmark, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeComponent } from "@/types/database"
import { API_ENDPOINTS } from "@/lib/constants"

// Note types
const NOTE_TYPES = [
  { id: "text", label: "Text Note", icon: FileText, description: "Simple text notes" },
  { id: "code", label: "Code Snippet", icon: Code, description: "Code snippets with syntax" },
  { id: "link", label: "Link Collection", icon: Link, description: "Useful links and bookmarks" },
  { id: "mixed", label: "Mixed Content", icon: Bookmark, description: "Combined text, links, and code" }
]

const NOTE_CATEGORIES = [
  { id: "note", label: "📝 Note", color: "bg-blue-50 text-blue-700" },
  { id: "snippet", label: "💻 Code", color: "bg-green-50 text-green-700" },
  { id: "bookmark", label: "🔗 Link", color: "bg-purple-50 text-purple-700" },
  { id: "idea", label: "💡 Idea", color: "bg-yellow-50 text-yellow-700" },
  { id: "todo", label: "✅ Todo", color: "bg-orange-50 text-orange-700" },
  { id: "reference", label: "📚 Reference", color: "bg-indigo-50 text-indigo-700" }
]

interface CreateNoteInput {
  name: string
  description?: string
  component_type: string
  content_type: "text" | "code" | "link" | "mixed" | "file" | "webpage"
  content?: {
    text?: string
    links?: Array<{ url: string; title: string; description?: string }>
    code?: Array<{ language: string; code: string; title?: string }>
    files?: Array<{ url: string; name: string; type: string }>
  }
  tags?: string[]
  project_id?: string
}

const safeStringify = (obj: any, spaces = 2) => {
  try {
    return JSON.stringify(obj, (key, value) => 
      value instanceof Date ? value.toISOString() : value, 
      spaces
    );
  } catch (error) {
    return "{}";
  }
};

const safeParse = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return {};
  }
};

export function NotesManager() {
  // State management
  const [notes, setNotes] = useState<CodeComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CodeComponent | null>(null)
  const [previewNote, setPreviewNote] = useState<CodeComponent | null>(null)

  // Form state for creating/editing notes
  const [formData, setFormData] = useState<CreateNoteInput>({
    name: "",
    description: "",
    component_type: "note",
    content_type: "text",
    content: {
      text: "",
      links: [],
      code: [],
      files: []
    },
    tags: [],
    project_id: ""
  })

  // Load notes from API
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.NOTES, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setNotes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Filtered notes with enhanced search
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = !searchTerm || 
        note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.content as any)?.text?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || note.component_type === categoryFilter
      const matchesType = typeFilter === "all" || note.content_type === typeFilter
      const matchesTag = tagFilter === "all" || note.tags?.includes(tagFilter)
      
      return matchesSearch && matchesCategory && matchesType && matchesTag
    })
  }, [notes, searchTerm, categoryFilter, typeFilter, tagFilter])

  // Get all unique tags for filter
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    notes.forEach(note => {
      note.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [notes])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingNote ? 'PUT' : 'POST'
      const url = editingNote 
        ? `${API_ENDPOINTS.NOTES}/${editingNote.id}`
        : API_ENDPOINTS.NOTES

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadNotes()
        setIsCreateDialogOpen(false)
        setEditingNote(null)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      component_type: "note",
      content_type: "text",
      content: {
        text: "",
        links: [],
        code: [],
        files: []
      },
      tags: [],
      project_id: ""
    })
  }

  const handleEdit = useCallback((note: CodeComponent) => {
    setFormData({
      name: note.name,
      description: note.description || "",
      component_type: note.component_type,
      content_type: note.content_type as any,
      content: note.content || { text: "", links: [], code: [], files: [] },
      tags: note.tags || [],
      project_id: (note as any).project_id || ""
    })
    setEditingNote(note)
  }, [])

  const handleDelete = useCallback(async (note: CodeComponent) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ghi chú "${note.name}"?`)) {
      try {
        const response = await fetch(`${API_ENDPOINTS.NOTES}/${note.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (response.ok) {
          await loadNotes()
        }
      } catch (error) {
        console.error("Error deleting note:", error)
      }
    }
  }, [loadNotes])

  const handleTagsChange = useCallback((value: string) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }, [])

  // Add link to content
  const addLink = () => {
    const content = formData.content || {}
    const links = content.links || []
    setFormData(prev => ({
      ...prev,
      content: {
        ...content,
        links: [...links, { url: "", title: "", description: "" }]
      }
    }))
  }

  // Remove link from content
  const removeLink = (index: number) => {
    const content = formData.content || {}
    const links = content.links || []
    setFormData(prev => ({
      ...prev,
      content: {
        ...content,
        links: links.filter((_, i) => i !== index)
      }
    }))
  }

  // Add code snippet to content
  const addCodeSnippet = () => {
    const content = formData.content || {}
    const code = content.code || []
    setFormData(prev => ({
      ...prev,
      content: {
        ...content,
        code: [...code, { language: "javascript", code: "", title: "" }]
      }
    }))
  }

  // Remove code snippet from content
  const removeCodeSnippet = (index: number) => {
    const content = formData.content || {}
    const code = content.code || []
    setFormData(prev => ({
      ...prev,
      content: {
        ...content,
        code: code.filter((_, i) => i !== index)
      }
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Đã sao chép!")
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải ghi chú...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            📝 Quản lý ghi chú
          </h2>
          <p className="text-muted-foreground mt-1">
            Lưu trữ và quản lý các ghi chú, đoạn code, links và ý tưởng của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="mr-2 h-5 w-5" />
                Tạo ghi chú mới
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-[900px] lg:max-w-[1000px] overflow-y-auto p-0">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
                  <SheetTitle className="text-xl font-semibold">✨ Tạo ghi chú mới</SheetTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tạo và lưu trữ các thông tin quan trọng của bạn
                  </p>
                </SheetHeader>
              
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="h-full">
                    <div className="space-y-6">
                      {/* Header Information Card */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          📝 Thông tin cơ bản
                        </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Tên ghi chú <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nhập tên cho ghi chú của bạn..."
                            className="h-10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tags" className="text-sm font-medium">
                            Tags <span className="text-xs text-muted-foreground">(phân cách bằng dấu phẩy)</span>
                          </Label>
                          <Input
                            id="tags"
                            value={formData.tags?.join(", ") || ""}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            placeholder="react, javascript, tutorial"
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium">
                            Loại ghi chú <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.component_type}
                            onValueChange={(value: any) => setFormData({ ...formData, component_type: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Chọn loại ghi chú" />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${cat.color}`}>
                                      {cat.label}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content_type" className="text-sm font-medium">
                            Kiểu nội dung <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.content_type}
                            onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Chọn kiểu nội dung" />
                            </SelectTrigger>
                            <SelectContent>
                              {NOTE_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="h-4 w-4" />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{type.label}</span>
                                      <span className="text-xs text-muted-foreground">{type.description}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                          Mô tả
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          placeholder="Mô tả ngắn gọn về nội dung ghi chú này..."
                          className="resize-none"
                        />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-background rounded-lg border">
                      <div className="p-4 border-b bg-muted/20">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          📄 Nội dung ghi chú
                        </h3>
                      </div>
                      
                      <Tabs defaultValue="text" className="w-full">
                        <TabsList className="w-full h-12 p-1 bg-muted/30 mx-4 mt-4 mb-0">
                          <TabsTrigger value="text" className="flex-1 h-10">
                            <FileText className="mr-2 h-4 w-4" />
                            <div className="hidden sm:block">Văn bản</div>
                          </TabsTrigger>
                          <TabsTrigger value="links" className="flex-1 h-10">
                            <Link className="mr-2 h-4 w-4" />
                            <div className="hidden sm:block">Liên kết</div>
                          </TabsTrigger>
                          <TabsTrigger value="code" className="flex-1 h-10">
                            <Code className="mr-2 h-4 w-4" />
                            <div className="hidden sm:block">Mã nguồn</div>
                          </TabsTrigger>
                          <TabsTrigger value="files" className="flex-1 h-10">
                            <Image className="mr-2 h-4 w-4" />
                            <div className="hidden sm:block">Tệp tin</div>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="p-4 space-y-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Nội dung văn bản
                            </Label>
                            <Textarea
                              value={formData.content?.text || ""}
                              onChange={(e) => setFormData({
                                ...formData,
                                content: { ...formData.content, text: e.target.value }
                              })}
                              rows={8}
                              placeholder="Nhập nội dung văn bản của bạn..."
                              className="resize-none font-mono text-sm"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="links" className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Danh sách liên kết
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLink}>
                              <Plus className="mr-2 h-4 w-4" />
                              Thêm liên kết
                            </Button>
                          </div>
                          
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {formData.content?.links?.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Link className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Chưa có liên kết nào</p>
                                <p className="text-sm">Click "Thêm liên kết" để bắt đầu</p>
                              </div>
                            )}
                            
                            {formData.content?.links?.map((link, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">Liên kết {index + 1}</span>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeLink(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  <Input
                                    placeholder="🔗 URL (https://...)"
                                    value={link.url}
                                    onChange={(e) => {
                                      const newLinks = [...(formData.content?.links || [])]
                                      newLinks[index] = { ...link, url: e.target.value }
                                      setFormData({
                                        ...formData,
                                        content: { ...formData.content, links: newLinks }
                                      })
                                    }}
                                    className="font-mono text-sm"
                                  />
                                  <Input
                                    placeholder="📝 Tiêu đề"
                                    value={link.title}
                                    onChange={(e) => {
                                      const newLinks = [...(formData.content?.links || [])]
                                      newLinks[index] = { ...link, title: e.target.value }
                                      setFormData({
                                        ...formData,
                                        content: { ...formData.content, links: newLinks }
                                      })
                                    }}
                                  />
                                  <Input
                                    placeholder="💭 Mô tả (tuỳ chọn)"
                                    value={link.description}
                                    onChange={(e) => {
                                      const newLinks = [...(formData.content?.links || [])]
                                      newLinks[index] = { ...link, description: e.target.value }
                                      setFormData({
                                        ...formData,
                                        content: { ...formData.content, links: newLinks }
                                      })
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="code" className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              Đoạn mã nguồn
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addCodeSnippet}>
                              <Plus className="mr-2 h-4 w-4" />
                              Thêm code
                            </Button>
                          </div>
                          
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {formData.content?.code?.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Chưa có đoạn code nào</p>
                                <p className="text-sm">Click "Thêm code" để bắt đầu</p>
                              </div>
                            )}
                            
                            {formData.content?.code?.map((snippet, index) => (
                              <div key={index} className="border rounded-lg bg-muted/20">
                                <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                                  <span className="font-medium text-sm">Đoạn code {index + 1}</span>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeCodeSnippet(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input
                                      placeholder="📝 Tiêu đề (tuỳ chọn)"
                                      value={snippet.title}
                                      onChange={(e) => {
                                        const newCode = [...(formData.content?.code || [])]
                                        newCode[index] = { ...snippet, title: e.target.value }
                                        setFormData({
                                          ...formData,
                                          content: { ...formData.content, code: newCode }
                                        })
                                      }}
                                    />
                                    <Select
                                      value={snippet.language}
                                      onValueChange={(value) => {
                                        const newCode = [...(formData.content?.code || [])]
                                        newCode[index] = { ...snippet, language: value }
                                        setFormData({
                                          ...formData,
                                          content: { ...formData.content, code: newCode }
                                        })
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Ngôn ngữ" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="css">CSS</SelectItem>
                                        <SelectItem value="php">PHP</SelectItem>
                                        <SelectItem value="sql">SQL</SelectItem>
                                        <SelectItem value="json">JSON</SelectItem>
                                        <SelectItem value="bash">Bash</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Textarea
                                    placeholder="Nhập code của bạn..."
                                    value={snippet.code}
                                    onChange={(e) => {
                                      const newCode = [...(formData.content?.code || [])]
                                      newCode[index] = { ...snippet, code: e.target.value }
                                      setFormData({
                                        ...formData,
                                        content: { ...formData.content, code: newCode }
                                      })
                                    }}
                                    rows={6}
                                    className="font-mono text-sm resize-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="files" className="p-4">
                          <div className="text-center py-12 text-muted-foreground">
                            <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="font-medium mb-2">Upload tệp tin & hình ảnh</h3>
                            <p className="text-sm">Tính năng này sẽ được thêm trong phiên bản tương lai</p>
                            <div className="mt-4 p-4 bg-muted/20 rounded-lg text-left">
                              <p className="text-xs">
                                <strong>Kế hoạch:</strong> Hỗ trợ upload và lưu trữ:
                              </p>
                              <ul className="text-xs mt-2 space-y-1 ml-4">
                                <li>• Hình ảnh (PNG, JPG, GIF)</li>
                                <li>• Tài liệu (PDF, DOC, TXT)</li>
                                <li>• File code và cấu hình</li>
                                <li>• Liên kết đến các tệp tin bên ngoài</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t bg-background px-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        resetForm()
                      }}
                      className="min-w-20"
                    >
                      Hủy
                    </Button>
                    <Button type="submit" className="min-w-24">
                      <Plus className="mr-2 h-4 w-4" />
                      Lưu ghi chú
                    </Button>
                  </div>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="🔍 Tìm kiếm ghi chú, tags, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Loại ghi chú" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Tất cả loại
                  </div>
                </SelectItem>
                {NOTE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-10">
                <SelectValue placeholder="Nội dung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Tất cả kiểu
                  </div>
                </SelectItem>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {allTags.length > 0 && (
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tất cả tags
                    </div>
                  </SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3" />
                        #{tag}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* Filter Summary */}
        {(searchTerm || categoryFilter !== "all" || typeFilter !== "all" || tagFilter !== "all") && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị {filteredNotes.length} / {notes.length} ghi chú</span>
              {(categoryFilter !== "all" || typeFilter !== "all" || tagFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setCategoryFilter("all")
                    setTypeFilter("all") 
                    setTagFilter("all")
                    setSearchTerm("")
                  }}
                  className="h-6 px-2"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const categoryConfig = NOTE_CATEGORIES.find(c => c.id === note.component_type)
          const typeConfig = NOTE_TYPES.find(t => t.id === note.content_type)
          
          return (
            <Card key={note.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {typeConfig && <typeConfig.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                      <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {note.name}
                      </CardTitle>
                    </div>
                    {note.description && (
                      <CardDescription className="text-sm line-clamp-2">
                        {note.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${categoryConfig?.color} flex-shrink-0 text-xs`}
                  >
                    {categoryConfig?.label || note.component_type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                          #{tag}
                        </Badge>
                      ))}
                      {note.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{note.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Content preview */}
                  <div className="bg-muted/20 rounded-md p-3 min-h-16">
                    {note.content_type === "text" && (
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {(note.content as any)?.text ? (
                          <div className="whitespace-pre-wrap">
                            {(note.content as any).text.substring(0, 120)}
                            {(note.content as any).text.length > 120 && "..."}
                          </div>
                        ) : (
                          <span className="italic">Không có nội dung văn bản</span>
                        )}
                      </div>
                    )}
                    
                    {note.content_type === "link" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link className="h-4 w-4" />
                          <span className="font-medium">
                            {(note.content as any)?.links?.length || 0} liên kết
                          </span>
                        </div>
                        {(note.content as any)?.links?.[0] && (
                          <div className="text-xs text-muted-foreground truncate">
                            🔗 {(note.content as any).links[0].title || (note.content as any).links[0].url}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {note.content_type === "code" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Code className="h-4 w-4" />
                          <span className="font-medium">
                            {(note.content as any)?.code?.length || 0} đoạn code
                          </span>
                        </div>
                        {(note.content as any)?.code?.[0] && (
                          <div className="text-xs text-muted-foreground">
                            📝 {(note.content as any).code[0].language}: {(note.content as any).code[0].title || "Untitled"}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {note.content_type === "mixed" && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground font-medium">
                          📦 Nội dung hỗn hợp
                        </div>
                        <div className="text-xs space-y-1">
                          {(note.content as any)?.text && (
                            <div>📝 Có văn bản</div>
                          )}
                          {(note.content as any)?.links?.length > 0 && (
                            <div>🔗 {(note.content as any).links.length} liên kết</div>
                          )}
                          {(note.content as any)?.code?.length > 0 && (
                            <div>💻 {(note.content as any).code.length} đoạn code</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewNote(note)}
                        className="h-8 px-2 hover:bg-primary/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Xem</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(note)}
                        className="h-8 px-2 hover:bg-blue-500/10"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Sửa</span>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(note)}
                      className="h-8 px-2 hover:bg-destructive/10 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">Xóa</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center">
            <div className="text-4xl">📝</div>
          </div>
          {notes.length === 0 ? (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Chào mừng đến với Ghi chú!</h3>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Tạo ghi chú đầu tiên của bạn để bắt đầu lưu trữ ý tưởng, đoạn code, liên kết và thông tin quan trọng.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="lg"
                  className="shadow-md hover:shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Tạo ghi chú đầu tiên
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Không tìm thấy ghi chú</h3>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Không có ghi chú nào khớp với bộ lọc hiện tại. Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc.
              </p>
              <div className="pt-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setCategoryFilter("all")
                    setTypeFilter("all") 
                    setTagFilter("all")
                    setSearchTerm("")
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Sheet */}
      <Sheet open={!!previewNote} onOpenChange={() => setPreviewNote(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[800px] lg:max-w-[900px] overflow-y-auto p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
              <SheetTitle className="flex items-center gap-2 text-xl">
                {previewNote && NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon && 
                  (() => {
                    const Icon = NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon!
                  return <Icon className="h-5 w-5" />
                })()
              }
              {previewNote?.name}
            </SheetTitle>
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mt-2">
              <Badge variant="outline" className="bg-muted/50">
                {NOTE_CATEGORIES.find(c => c.id === previewNote?.component_type)?.label || previewNote?.component_type}
              </Badge>
              <span>•</span>
              <Badge variant="outline" className="bg-muted/50">
                {NOTE_TYPES.find(t => t.id === previewNote?.content_type)?.label || previewNote?.content_type}
              </Badge>
              {previewNote?.tags && previewNote.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex flex-wrap gap-1">
                    {previewNote.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-primary/10">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
              {previewNote && (
              <div className="space-y-6">
                {/* Description */}
                {previewNote.description && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Mô tả
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {previewNote.description}
                    </p>
                  </div>
                )}

                {/* Content based on type */}
                <div className="space-y-6">
                  {previewNote.content_type === "text" && (previewNote.content as any)?.text && (
                    <div className="bg-background border rounded-lg">
                      <div className="bg-muted/20 px-4 py-3 border-b">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Nội dung văn bản
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                          {(previewNote.content as any).text}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewNote.content_type === "link" && (previewNote.content as any)?.links && (
                    <div className="bg-background border rounded-lg">
                      <div className="bg-muted/20 px-4 py-3 border-b">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          Danh sách liên kết ({(previewNote.content as any).links.length})
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid gap-4">
                          {(previewNote.content as any).links.map((link: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-primary hover:underline flex items-center gap-1"
                                    >
                                      {link.title || link.url}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(link.url)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {link.description && (
                                    <p className="text-sm text-muted-foreground">{link.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded break-all">
                                    {link.url}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewNote.content_type === "code" && (previewNote.content as any)?.code && (
                    <div className="bg-background border rounded-lg">
                      <div className="bg-muted/20 px-4 py-3 border-b">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Đoạn mã nguồn ({(previewNote.content as any).code.length})
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="space-y-6">
                          {(previewNote.content as any).code.map((snippet: any, index: number) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
                                <div className="flex items-center gap-3">
                                  <Code className="h-4 w-4" />
                                  <div>
                                    <span className="font-medium">{snippet.title || `Đoạn code ${index + 1}`}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {snippet.language}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(snippet.code)}
                                  className="h-8 px-2"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Sao chép
                                </Button>
                              </div>
                              <div className="relative">
                                <pre className="p-4 text-sm font-mono overflow-x-auto bg-muted/10 leading-relaxed">
                                  {snippet.code}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {previewNote.content_type === "mixed" && (
                    <div className="space-y-4">
                      {(previewNote.content as any)?.text && (
                        <div className="bg-background border rounded-lg">
                          <div className="bg-muted/20 px-4 py-3 border-b">
                            <h4 className="font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Văn bản
                            </h4>
                          </div>
                          <div className="p-4">
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                              {(previewNote.content as any).text}
                            </div>
                          </div>
                        </div>
                      )}

                      {(previewNote.content as any)?.links && (previewNote.content as any).links.length > 0 && (
                        <div className="bg-background border rounded-lg">
                          <div className="bg-muted/20 px-4 py-3 border-b">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Link className="h-4 w-4" />
                              Liên kết ({(previewNote.content as any).links.length})
                            </h4>
                          </div>
                          <div className="p-4">
                            <div className="grid gap-3">
                              {(previewNote.content as any).links.map((link: any, index: number) => (
                                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <a 
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary hover:underline truncate"
                                  >
                                    {link.title || link.url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {(previewNote.content as any)?.code && (previewNote.content as any).code.length > 0 && (
                        <div className="bg-background border rounded-lg">
                          <div className="bg-muted/20 px-4 py-3 border-b">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              Mã nguồn ({(previewNote.content as any).code.length})
                            </h4>
                          </div>
                          <div className="p-4 space-y-4">
                            {(previewNote.content as any).code.map((snippet: any, index: number) => (
                              <div key={index} className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/20 px-3 py-2 border-b flex items-center justify-between">
                                  <span className="text-sm font-medium">{snippet.title || `Code ${index + 1}`}</span>
                                  <Badge variant="outline" className="text-xs">{snippet.language}</Badge>
                                </div>
                                <pre className="p-3 text-sm font-mono overflow-x-auto">
                                  {snippet.code}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t bg-background">
            <Button
              variant="outline"
              onClick={() => {
                if (previewNote) handleEdit(previewNote)
                setPreviewNote(null)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewNote(null)}
            >
              Đóng
            </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[900px] lg:max-w-[1000px] overflow-y-auto p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
              <SheetTitle className="text-xl font-semibold">✏️ Chỉnh sửa ghi chú</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật thông tin và nội dung cho ghi chú của bạn
              </p>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="h-full">
                <div className="space-y-6">
                  {/* Same form content as create dialog - simplified JSON editor for edit mode */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    📝 Thông tin cơ bản
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-sm font-medium">
                        Tên ghi chú <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên cho ghi chú của bạn..."
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-tags" className="text-sm font-medium">
                        Tags <span className="text-xs text-muted-foreground">(phân cách bằng dấu phẩy)</span>
                      </Label>
                      <Input
                        id="edit-tags"
                        value={formData.tags?.join(", ") || ""}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        placeholder="react, javascript, tutorial"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category" className="text-sm font-medium">
                        Loại ghi chú <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.component_type}
                        onValueChange={(value: any) => setFormData({ ...formData, component_type: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn loại ghi chú" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${cat.color}`}>
                                  {cat.label}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-content_type" className="text-sm font-medium">
                        Kiểu nội dung <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn kiểu nội dung" />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTE_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{type.label}</span>
                                  <span className="text-xs text-muted-foreground">{type.description}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm font-medium">
                      Mô tả
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Mô tả ngắn gọn về nội dung ghi chú này..."
                      className="resize-none"
                    />
                  </div>
                </div>

                {/* Content editing - JSON editor for advanced editing */}
                <div className="bg-background rounded-lg border">
                  <div className="p-4 border-b bg-muted/20">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📄 Nội dung ghi chú (JSON Editor)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chỉnh sửa trực tiếp JSON content hoặc dùng giao diện tạo mới để chỉnh sửa dễ dàng hơn
                    </p>
                  </div>
                  
                  <div className="p-4">
                    <Label className="text-sm font-medium block mb-2">Nội dung JSON</Label>
                    <Textarea
                      value={safeStringify(formData.content, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, content: safeParse(e.target.value) })
                        } catch (error) {
                          // Invalid JSON, keep the string for editing
                        }
                      }}
                      rows={12}
                      className="font-mono text-xs resize-none"
                      placeholder="JSON content của ghi chú..."
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> Đóng dialog này và tạo ghi chú mới để sử dụng giao diện chỉnh sửa trực quan
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t bg-background px-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingNote(null)
                    resetForm()
                  }}
                  className="min-w-20"
                >
                  Hủy
                </Button>
                <Button type="submit" className="min-w-24">
                  <Edit className="mr-2 h-4 w-4" />
                  Cập nhật ghi chú
                </Button>
              </div>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}