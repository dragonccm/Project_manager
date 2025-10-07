"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2, Link, FileText, Code, Image, Tag, Bookmark, Copy, ExternalLink, Check, LinkIcon, X, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CodeComponent } from "@/types/database"
import { API_ENDPOINTS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { ShareModal } from "@/features/share/ShareModal"

// Note types and categories moved inside component to use t() function

// Utility functions for enhanced UX
const formatCode = (code: string, language?: string) => {
  if (!code) return code
  
  // Basic formatting for common languages
  try {
    if (language === 'json' || code.trim().startsWith('{') || code.trim().startsWith('[')) {
      return JSON.stringify(JSON.parse(code), null, 2)
    }
  } catch (e) {
    // Not valid JSON, return as is
  }
  
  return code
}

const detectUrls = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

const makeLinksClickable = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 underline inline-flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          {part}
        </a>
      )
    }
    return part
  })
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

interface NotesManagerProps {}

export function NotesManager({}: NotesManagerProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  
  // Note types (simplified for CodeComponent compatibility)
  const NOTE_TYPES = [
    { id: "text", label: t('textNote'), icon: FileText, description: t('simpleTextNotes') },
    { id: "code", label: t('codeSnippet'), icon: Code, description: t('codeSnippetsWithSyntax') },
    { id: "link", label: t('linkBookmark'), icon: Link, description: t('urlBookmarksAndLinks') },
    { id: "file", label: t('fileNote'), icon: Image, description: t('fileBasedNotes') },
    { id: "webpage", label: t('webpage'), icon: ExternalLink, description: t('webpageReferences') },
    { id: "mixed", label: t('mixedContent'), icon: Bookmark, description: t('mixedContentNotes') }
  ]

  // Note categories (match CodeComponent types)
  const NOTE_CATEGORIES = [
    { id: "element", label: t('element'), description: t('uiElementsAndComponents') },
    { id: "section", label: t('section'), description: t('pageSectionsAndLayouts') }, 
    { id: "template", label: t('template'), description: t('fullPageTemplates') },
    { id: "widget", label: t('widget'), description: t('interactiveWidgets') },
    { id: "global", label: t('global'), description: t('globalComponentsAndNotes') }
  ]
  
  // State
  const [notes, setNotes] = useState<CodeComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form states (simplified to match CodeComponent)
  const [formData, setFormData] = useState({
    name: '',
    component_type: 'global' as CodeComponent['component_type'],
    content_type: 'text' as CodeComponent['content_type'],
    description: '',
    code: '',
    tags: [] as string[]
  })
  
  // Image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  
  // Sheet states (renamed from Dialog)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CodeComponent | null>(null)
  const [previewNote, setPreviewNote] = useState<CodeComponent | null>(null)
  
  // Share states
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedNoteForShare, setSelectedNoteForShare] = useState<CodeComponent | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [tagInput, setTagInput] = useState('')

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.NOTES)
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách ghi chú')
      }
      
      const data = await response.json()
      setNotes(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      console.error('Error loading notes:', err)
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Tên ghi chú không được để trống')
      return
    }
    
    try {
      let imageUploadUrl = ''
      
      // Handle image upload if selected
      if (selectedImage) {
        const formDataUpload = new FormData()
        formDataUpload.append('image', selectedImage)
        
        // Upload to your image upload endpoint (you may need to create this)
        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataUpload,
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          imageUploadUrl = uploadResult.url
        } else {
          console.warn('Image upload failed, continuing without image')
        }
      } else if (imageUrl) {
        imageUploadUrl = imageUrl
      }
      
      // Prepare note data
      const noteData = {
        ...formData,
        preview_image: imageUploadUrl || undefined
      }

      const method = editingNote ? 'PUT' : 'POST'
      const url = editingNote 
        ? `${API_ENDPOINTS.NOTES}/${editingNote.id}`
        : API_ENDPOINTS.NOTES

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        throw new Error('Không thể lưu ghi chú')
      }

      const savedNote = await response.json()
      
      if (editingNote) {
        setNotes(prev => prev.map(note => 
          note.id === editingNote.id ? savedNote : note
        ))
        setEditingNote(null)
      } else {
        setNotes(prev => [savedNote, ...prev])
        setIsCreateSheetOpen(false)
      }
      
      resetForm()
      setError(null)
      
      toast({
        title: `✅ ${t('success')}!`,
        description: editingNote ? t('noteUpdated') : t('noteCreated'),
        duration: 2000,
      })
      
    } catch (err) {
      console.error('Error saving note:', err)
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      component_type: 'global',
      content_type: 'text',
      description: '',
      code: '',
      tags: []
    })
    setTagInput('')
    setSelectedImage(null)
    setImagePreview(null)
    setImageUrl('')
  }

  // Handle edit
  const handleEdit = (note: CodeComponent) => {
    setEditingNote(note)
    setFormData({
      name: note.name || '',
      component_type: note.component_type || 'global',
      content_type: note.content_type || 'text',
      description: note.description || '',
      code: note.code || '',
      tags: Array.isArray(note.tags) ? note.tags : []
    })
    
    // Load image if exists (check preview_image or other image field)
    if (note.preview_image) {
      setImageUrl(note.preview_image)
      setImagePreview(note.preview_image)
      setSelectedImage(null)
    } else {
      setImageUrl('')
      setImagePreview(null)
      setSelectedImage(null)
    }
  }

  // Handle delete
  const handleDelete = async (noteId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      return
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.NOTES}/${noteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Không thể xóa ghi chú')
      }

      setNotes(prev => prev.filter(note => note.id !== noteId))
      setError(null)
      toast({
        title: `✅ ${t('success')}!`,
        description: t('noteDeleted'),
        duration: 2000,
      })
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err instanceof Error ? err.message : t('error'))
      toast({
        title: `❌ ${t('error')}`,
        description: err instanceof Error ? err.message : t('error'),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Handle copy content
  const handleCopy = async (content: string, noteType: string) => {
    let textToCopy = content
    
    // Format code before copying
    if (noteType === 'code') {
      textToCopy = formatCode(content, 'javascript') // Default to JS formatting
    }
    
    const success = await copyToClipboard(textToCopy)
    
    if (success) {
      toast({
        title: `📋 ${t('contentCopied')}!`,
        description: noteType === 'code' ? t('codeCopiedAndFormatted') : t('contentCopied'),
        duration: 2000,
      })
    } else {
      toast({
        title: `❌ ${t('error')}`,
        description: t('contentCopied'),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
    setTagInput('')
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "❌ File quá lớn",
          description: "Vui lòng chọn ảnh nhỏ hơn 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "❌ File không hợp lệ",
          description: "Vui lòng chọn file ảnh",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageUrl('')
  }

  // Handle image URL input
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    if (url) {
      setSelectedImage(null)
      setImagePreview(url)
    }
  }

  // Get content text for display
  const getContentText = (note: CodeComponent) => {
    if (typeof note.content === 'string') return note.content
    if (note.content?.text) return note.content.text
    if (note.code) return note.code
    return ''
  }

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const contentText = getContentText(note)
      
      const matchesSearch = !searchTerm || 
        note.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contentText?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = selectedType === 'all' || note.content_type === selectedType
      const matchesCategory = selectedCategory === 'all' || note.component_type === selectedCategory
      
      return matchesSearch && matchesType && matchesCategory
    })
  }, [notes, searchTerm, selectedType, selectedCategory])

  // Get stats
  const stats = useMemo(() => ({
    total: notes.length,
    filtered: filteredNotes.length,
    byType: NOTE_TYPES.reduce((acc, type) => {
      acc[type.id] = notes.filter(note => note.content_type === type.id).length
      return acc
    }, {} as Record<string, number>)
  }), [notes, filteredNotes])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải ghi chú...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📝 Quản lý ghi chú</h1>
          <p className="text-muted-foreground mt-1">
            Lưu trữ và quản lý các ghi chú, code snippets, links và tài liệu tham khảo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
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
                            <Label htmlFor="name" className="text-sm font-medium">Tên ghi chú *</Label>
                            <Input
                              id="name"
                              placeholder={t('enterNoteName')}
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="component_type" className="text-sm font-medium">Danh mục</Label>
                            <Select 
                              value={formData.component_type} 
                              onValueChange={(value: CodeComponent['component_type']) => 
                                setFormData(prev => ({ ...prev, component_type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('noteCategory')} />
                              </SelectTrigger>
                              <SelectContent>
                                {NOTE_CATEGORIES.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="content_type" className="text-sm font-medium">Loại ghi chú</Label>
                            <Select 
                              value={formData.content_type} 
                              onValueChange={(value: CodeComponent['content_type']) => 
                                setFormData(prev => ({ ...prev, content_type: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('noteType')} />
                              </SelectTrigger>
                              <SelectContent>
                                {NOTE_TYPES.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    <div className="flex items-center gap-2">
                                      <type.icon className="h-4 w-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">Mô tả ngắn</Label>
                            <Input
                              id="description"
                              placeholder={t('noteDescription')}
                              value={formData.description}
                              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          📄 Nội dung
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="code" className="text-sm font-medium">Nội dung chính</Label>
                          <Textarea
                            id="code"
                            placeholder={t('enterCode')}
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            rows={12}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      {/* Tags Card */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          🏷️ Tags
                        </h3>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder={t('enterTag')}
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addTag(tagInput)
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => addTag(tagInput)}
                              disabled={!tagInput.trim()}
                            >
                              <Tag className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary" 
                                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => removeTag(tag)}
                                >
                                  #{tag} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Card */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          🖼️ Hình ảnh
                        </h3>
                        <div className="space-y-4">
                          {/* Upload options tabs */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Chọn cách thêm ảnh:</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* File upload */}
                              <div className="space-y-2">
                                <Label htmlFor="image-upload" className="text-xs text-muted-foreground">Upload từ máy</Label>
                                <div className="relative">
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="w-full h-24 border-2 border-dashed hover:border-primary/50 transition-colors"
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <Upload className="h-6 w-6 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                                      <span className="text-xs text-muted-foreground">Max 5MB</span>
                                    </div>
                                  </Button>
                                </div>
                              </div>

                              {/* URL input */}
                              <div className="space-y-2">
                                <Label htmlFor="image-url" className="text-xs text-muted-foreground">Hoặc nhập URL</Label>
                                <div className="space-y-2">
                                  <Input
                                    id="image-url"
                                    placeholder={t('enterImageUrl')}
                                    value={imageUrl}
                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImageUrlChange(imageUrl)}
                                    disabled={!imageUrl.trim()}
                                    className="w-full"
                                  >
                                    <Image className="h-4 w-4 mr-2" />
                                    Preview URL
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Image preview */}
                          {imagePreview && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Preview:</Label>
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full max-h-48 object-cover rounded-lg border"
                                  onError={() => {
                                    toast({
                                      title: "❌ Lỗi tải ảnh",
                                      description: "Không thể tải ảnh từ URL này",
                                      variant: "destructive",
                                    })
                                    setImagePreview(null)
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={removeImage}
                                  className="absolute top-2 right-2 h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {selectedImage ? `File: ${selectedImage.name}` : `URL: ${imageUrl}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <p className="text-destructive text-sm font-medium">{error}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateSheetOpen(false)
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

      {/* Filters & Stats */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and primary filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('typeToSearch')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/80 border-muted"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40 bg-background/80">
                    <SelectValue placeholder={t('noteType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {NOTE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-background/80">
                    <SelectValue placeholder={t('noteCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {NOTE_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  Tổng: {stats.total}
                </Badge>
                {stats.filtered !== stats.total && (
                  <Badge variant="outline" className="bg-accent">
                    Hiển thị: {stats.filtered}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                {NOTE_TYPES.map(type => (
                  <Badge key={type.id} variant="secondary" className="text-xs">
                    <type.icon className="w-3 h-3 mr-1" />
                    {stats.byType[type.id] || 0}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => {
          const noteType = NOTE_TYPES.find(t => t.id === note.content_type)
          const noteCategory = NOTE_CATEGORIES.find(c => c.id === note.component_type)
          const Icon = noteType?.icon || FileText
          const contentText = getContentText(note)

          return (
            <Card 
              key={note.id} 
              className="group hover:shadow-lg transition-all duration-200 border-muted hover:border-muted-foreground/20 bg-card/50 hover:bg-card"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {note.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {noteCategory?.label} • {noteType?.label}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Description */}
                {note.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {note.description}
                  </p>
                )}
                
                {/* Preview Image */}
                {(note as any).preview_image && (
                  <div className="mb-3 rounded-md overflow-hidden border border-muted">
                    <img 
                      src={(note as any).preview_image} 
                      alt="Preview" 
                      className="w-full h-32 object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Content preview */}
                {contentText && (
                  <div className="bg-muted/30 rounded-md p-3 mb-3 relative group">
                    {/* Content based on type */}
                    {note.content_type === 'code' ? (
                      <div className="relative">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto max-h-40 p-2 rounded bg-neutral-100 dark:bg-neutral-900">
                          {formatCode(contentText, 'javascript')}
                        </pre>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(contentText, 'code')}
                                className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('copy')} {t('formattedCode')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : note.content_type === 'link' ? (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {makeLinksClickable(contentText)}
                        </div>
                        {detectUrls(contentText).length > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {detectUrls(contentText).length} link(s)
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(contentText, 'link')}
                                    className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('copy')} {t('links')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="text-xs text-muted-foreground line-clamp-3">
                          {detectUrls(contentText).length > 0 ? makeLinksClickable(contentText) : (
                            <span className="whitespace-pre-wrap">{contentText}</span>
                          )}
                        </div>
                        {contentText.length > 100 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(contentText, 'text')}
                                  className="absolute top-1 right-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('copy')} {t('content')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                        #{tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-muted">
                  <div className="text-xs text-muted-foreground">
                    {note.created_at && new Date(note.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-1">
                    {contentText && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(contentText, note.content_type || 'text')}
                              className="h-8 w-8 p-0 hover:bg-accent/50 hover:text-accent-foreground"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('copy')} {note.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedNoteForShare(note)
                              setShareModalOpen(true)
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('shareLink')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewNote(note)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => note.id && handleDelete(note.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {!loading && filteredNotes.length === 0 && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' 
                ? 'Không tìm thấy ghi chú nào'
                : 'Chưa có ghi chú nào'
              }
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả'
                : 'Bắt đầu bằng cách tạo ghi chú đầu tiên của bạn'
              }
            </p>
            {(!searchTerm && selectedType === 'all' && selectedCategory === 'all') && (
              <Button onClick={() => setIsCreateSheetOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo ghi chú đầu tiên
              </Button>
            )}
          </CardContent>
        </Card>
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
                    <div className="flex gap-1">
                      {previewNote.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
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
                  {previewNote.description && (
                    <div>
                      <h4 className="font-medium mb-2">📝 Mô tả</h4>
                      <p className="text-muted-foreground">{previewNote.description}</p>
                    </div>
                  )}
                  
                  {/* Preview Image */}
                  {(previewNote as any).preview_image && (
                    <div>
                      <h4 className="font-medium mb-2">🖼️ Hình ảnh</h4>
                      <div className="rounded-lg overflow-hidden border border-muted max-w-md">
                        <img 
                          src={(previewNote as any).preview_image} 
                          alt="Preview" 
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {getContentText(previewNote) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">📄 Nội dung</h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(getContentText(previewNote), previewNote.content_type || 'text')}
                                className="h-8 flex items-center gap-2"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('copy')} {previewNote.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        {previewNote.content_type === 'code' ? (
                          <pre className="whitespace-pre-wrap font-mono text-sm break-words overflow-x-auto max-h-60 p-3 rounded bg-neutral-100 dark:bg-neutral-900">
                            {formatCode(getContentText(previewNote), 'javascript')}
                          </pre>
                        ) : previewNote.content_type === 'link' ? (
                          <div className="space-y-2">
                            <div className="text-sm">
                              {makeLinksClickable(getContentText(previewNote))}
                            </div>
                            {detectUrls(getContentText(previewNote)).length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {detectUrls(getContentText(previewNote)).length} link(s) detected
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            {detectUrls(getContentText(previewNote)).length > 0 ? 
                              makeLinksClickable(getContentText(previewNote)) :
                              <span className="whitespace-pre-wrap">{getContentText(previewNote)}</span>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {previewNote.tags && previewNote.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">🏷️ Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewNote.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Tạo: {previewNote.created_at && new Date(previewNote.created_at).toLocaleString('vi-VN')}</span>
                      {previewNote.updated_at && (
                        <span>Cập nhật: {new Date(previewNote.updated_at).toLocaleString('vi-VN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex gap-2">
                {previewNote && getContentText(previewNote) && (
                  <Button
                    variant="outline"
                    onClick={() => previewNote && handleCopy(getContentText(previewNote), previewNote.content_type || 'text')}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy All
                  </Button>
                )}
                <Button 
                  onClick={() => previewNote && handleEdit(previewNote)} 
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
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
                  {/* Same form content as create sheet */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📝 Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-sm font-medium">Tên ghi chú *</Label>
                        <Input
                          id="edit-name"
                          placeholder="Nhập tên ghi chú..."
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-component_type" className="text-sm font-medium">Danh mục</Label>
                        <Select 
                          value={formData.component_type} 
                          onValueChange={(value: CodeComponent['component_type']) => 
                            setFormData(prev => ({ ...prev, component_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {NOTE_CATEGORIES.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-content_type" className="text-sm font-medium">Loại ghi chú</Label>
                        <Select 
                          value={formData.content_type} 
                          onValueChange={(value: CodeComponent['content_type']) => 
                            setFormData(prev => ({ ...prev, content_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                          <SelectContent>
                            {NOTE_TYPES.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-description" className="text-sm font-medium">Mô tả ngắn</Label>
                        <Input
                          id="edit-description"
                          placeholder="Mô tả ngắn về ghi chú..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📄 Nội dung
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="edit-code" className="text-sm font-medium">Nội dung chính</Label>
                      <Textarea
                        id="edit-code"
                        placeholder="Nhập nội dung ghi chú, code snippet, hoặc text..."
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-destructive text-sm font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingNote(null)}
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

      {/* Share Modal */}
      {selectedNoteForShare && (
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          resourceType="note"
          resourceId={selectedNoteForShare.id || ''}
          resourceName={selectedNoteForShare.name || 'Untitled Note'}
        />
      )}
    </div>
  )
}