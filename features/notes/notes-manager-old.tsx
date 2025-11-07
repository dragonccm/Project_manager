"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Edit, Trash2, Copy, Tag, Upload, X, Image, Eye, EyeOff, FileText, Code, Link as LinkIcon, ExternalLink, Download, Share2, Search, Bookmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { CodeComponent } from "@/types/database"
import dynamic from 'next/dynamic'
import { javascript } from '@codemirror/lang-javascript'
import { okaidia } from '@uiw/codemirror-theme-okaidia'
import { DocumentCanvas } from './document-canvas'
import { DocumentStylePanel } from './document-style-panel'
import { DocumentItemToolbar } from './document-item-toolbar'
import { DocumentItem } from '@/types/database'
import { nanoid } from 'nanoid'
import { A4TemplateSelector } from '@/components/a4-template-selector'

// Dynamic import CodeMirror for SSR compatibility
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false })

// Utility functions
const formatCode = (code: string, language?: string) => {
  if (!code) return code
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

interface NotesManagerProps { }

export function NotesManager({ }: NotesManagerProps) {
  const { toast } = useToast()
  const { t } = useLanguage()

  // State
  const [notes, setNotes] = useState<CodeComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Password visibility state
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({})

  // Text expansion state
  const [textExpanded, setTextExpanded] = useState<Record<string, boolean>>({})

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    component_type: 'global' as CodeComponent['component_type'],
    content_type: 'text' as CodeComponent['content_type'],
    description: '',
    code: '',
    tags: [] as string[],
    content: null as any,
    linked_a4_template: undefined as string | undefined
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    username: '',
    password: '',
    website: '',
    notes: ''
  })

  // Image gallery state
  const [imageGallery, setImageGallery] = useState<Array<{ url: string, alt?: string, caption?: string }>>([])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imageAltInput, setImageAltInput] = useState('')
  const [imageCaptionInput, setImageCaptionInput] = useState('')

  // Code language state
  const [codeLanguage, setCodeLanguage] = useState('javascript')

  // Document canvas states
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  // Image states
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')

  // Sheet states
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CodeComponent | null>(null)
  const [previewNote, setPreviewNote] = useState<CodeComponent | null>(null)



  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [tagInput, setTagInput] = useState('')

  // Note types
  const NOTE_TYPES = [
    { id: "text", label: t('textNote'), icon: FileText, description: t('simpleTextNotes') },
    { id: "code", label: t('codeSnippet'), icon: Code, description: t('codeSnippetsWithSyntax') },
    { id: "link", label: t('linkBookmark'), icon: LinkIcon, description: t('urlBookmarksAndLinks') },
    { id: "file", label: t('fileNote'), icon: Image, description: t('fileBasedNotes') },
    { id: "webpage", label: t('webpage'), icon: ExternalLink, description: t('webpageReferences') },
    { id: "mixed", label: t('mixedContent'), icon: Bookmark, description: t('mixedContentNotes') },
    { id: "password", label: "Tài khoản/Mật khẩu", icon: Eye, description: "Lưu trữ tài khoản, mật khẩu an toàn" },
    { id: "image", label: "Hình ảnh", icon: Image, description: "Bộ sưu tập hình ảnh" },
    { id: "document", label: "📄 Document A4", icon: FileText, description: "Tài liệu chuyên nghiệp với canvas A4" }
  ]

  // Note categories
  const NOTE_CATEGORIES = [
    { id: "element", label: t('element'), description: t('uiElementsAndComponents') },
    { id: "section", label: t('section'), description: t('pageSectionsAndLayouts') },
    { id: "template", label: t('template'), description: t('fullPageTemplates') },
    { id: "widget", label: t('widget'), description: t('interactiveWidgets') },
    { id: "global", label: t('global'), description: t('globalComponentsAndNotes') }
  ]

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes')
      if (!response.ok) throw new Error('Failed to load notes')
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      console.error('Error loading notes:', err)
      setError('Failed to load notes')
      toast({
        title: "❌ Lỗi",
        description: "Không thể tải ghi chú",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Add/Edit note handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : '/api/notes'
      const method = editingNote ? 'PUT' : 'POST'

      // Prepare payload based on content type
      const payload = { ...formData }

      // Handle different content types
      if (formData.content_type === 'document') {
        payload.content = {
          document: {
            canvas_width_mm: 210,
            canvas_height_mm: 297,
            grid_size_mm: 5,
            grid_enabled: true,
            snap_to_grid: true,
            items: documentItems,
            background_color: '#ffffff',
            version: '1.0'
          }
        }
      } else if (formData.content_type === 'password') {
        payload.content = {
          password: {
            email: passwordForm.email,
            username: passwordForm.username,
            password: passwordForm.password,
            website: passwordForm.website,
            notes: passwordForm.notes
          }
        }
        payload.code = '' // Clear code field for password type
      } else if (formData.content_type === 'image') {
        payload.content = {
          images: imageGallery
        }
        payload.code = imageGallery.length > 0 ? `${imageGallery.length} ảnh` : ''
      } else if (formData.content_type === 'code') {
        payload.content = {
          language: codeLanguage,
          code: formData.code
        }
      } else if (formData.content_type === 'text') {
        // Preserve text formatting
        payload.content = {
          text: formData.code,
          formatted: true
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to save note')

      toast({
        title: "✅ Thành công",
        description: editingNote ? "Đã cập nhật ghi chú" : "Đã tạo ghi chú mới"
      })

      await loadNotes()
      setIsCreateSheetOpen(false)
      setEditingNote(null)
      resetForm()
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể lưu ghi chú",
        variant: "destructive",
      })
    }
  }

  // Delete note
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return

    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete note')

      toast({
        title: "✅ Đã xóa",
        description: "Ghi chú đã được xóa"
      })

      await loadNotes()
    } catch (err) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể xóa ghi chú",
        variant: "destructive",
      })
    }
  }

  // Edit note
  const handleEdit = (note: CodeComponent) => {
    setEditingNote(note)
    setFormData({
      name: note.name || '',
      component_type: note.component_type,
      content_type: note.content_type,
      description: note.description || '',
      code: note.code || '',
      tags: note.tags || [],
      content: note.content || null,
      linked_a4_template: note.linked_a4_template || undefined
    })

    // Load document items if it's a document note
    if (note.content_type === 'document' && note.content?.document?.items) {
      setDocumentItems(note.content.document.items)
    } else {
      setDocumentItems([])
    }

    // Load password data if it's a password note
    if (note.content_type === 'password' && note.content?.password) {
      setPasswordForm({
        email: note.content.password.email || '',
        username: note.content.password.username || '',
        password: note.content.password.password || '',
        website: note.content.password.website || '',
        notes: note.content.password.notes || ''
      })
    } else {
      setPasswordForm({ email: '', username: '', password: '', website: '', notes: '' })
    }

    // Load image gallery if it's an image note
    if (note.content_type === 'image' && note.content?.images) {
      setImageGallery(note.content.images)
    } else {
      setImageGallery([])
    }

    // Load code language if it's a code note
    if (note.content_type === 'code' && note.content?.language) {
      setCodeLanguage(note.content.language)
    } else {
      setCodeLanguage('javascript')
    }

    setSelectedItemId(null)
    setIsCreateSheetOpen(true)
  }

  // Copy to clipboard
  const handleCopy = async (text: string, type: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      toast({
        title: "✅ Đã sao chép",
        description: `Đã sao chép ${type === 'code' ? 'code' : 'nội dung'} vào clipboard`
      })
    }
  }

  // Tag management
  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0]
    if (!fileObj || !fileObj.type.startsWith('image/')) {
      toast({
        title: "❌ File không hợp lệ",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(fileObj)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(fileObj)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageUrl('')
  }

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    if (url) {
      setSelectedImage(null)
      setImagePreview(url)
    }
  }

  // Image gallery helpers
  const addImageToGallery = () => {
    if (!imageUrlInput.trim()) {
      toast({
        title: "⚠️ Cảnh báo",
        description: "Vui lòng nhập URL ảnh",
        variant: "destructive"
      })
      return
    }

    setImageGallery(prev => [...prev, {
      url: imageUrlInput.trim(),
      alt: imageAltInput.trim() || undefined,
      caption: imageCaptionInput.trim() || undefined
    }])

    setImageUrlInput('')
    setImageAltInput('')
    setImageCaptionInput('')

    toast({
      title: "✅ Đã thêm",
      description: "Đã thêm ảnh vào gallery"
    })
  }

  const removeImageFromGallery = (index: number) => {
    setImageGallery(prev => prev.filter((_, i) => i !== index))
    toast({
      title: "✅ Đã xóa",
      description: "Đã xóa ảnh khỏi gallery"
    })
  }

  // Get content text for display
  const getContentText = (note: CodeComponent) => {
    if (typeof note.content === 'string') return note.content
    if (note.content?.text) return note.content.text
    if (note.code) return note.code
    return ''
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      component_type: 'global',
      content_type: 'text',
      description: '',
      code: '',
      tags: [],
      content: null,
      linked_a4_template: undefined
    })
    setSelectedImage(null)
    setImagePreview(null)
    setImageUrl('')
    setTagInput('')
    setDocumentItems([])
    setSelectedItemId(null)
    setPasswordForm({ email: '', username: '', password: '', website: '', notes: '' })
    setImageGallery([])
    setImageUrlInput('')
    setImageAltInput('')
    setImageCaptionInput('')
    setCodeLanguage('javascript')
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
  }), [notes, filteredNotes, NOTE_TYPES])

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📝 Quản lý ghi chú</h1>
          <p className="text-muted-foreground mt-1">
            Lưu trữ và quản lý các ghi chú, code snippets, links và tài liệu tham khảo
          </p>
        </div>
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
                <SheetTitle className="text-xl font-semibold">
                  {editingNote ? '✏️ Chỉnh sửa ghi chú' : '✨ Tạo ghi chú mới'}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tạo và lưu trữ các thông tin quan trọng của bạn
                </p>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📝 Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tên ghi chú *</Label>
                        <Input
                          id="name"
                          placeholder="Nhập tên ghi chú"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="component_type">Danh mục</Label>
                        <Select
                          value={formData.component_type}
                          onValueChange={(value: CodeComponent['component_type']) =>
                            setFormData(prev => ({ ...prev, component_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor="content_type">Loại ghi chú</Label>
                        <Select
                          value={formData.content_type}
                          onValueChange={(value: CodeComponent['content_type']) =>
                            setFormData(prev => ({ ...prev, content_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        <Label htmlFor="description">Mô tả ngắn</Label>
                        <Input
                          id="description"
                          placeholder="Mô tả ghi chú"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📄 Nội dung
                    </h3>

                    {/* Document Type */}
                    {formData.content_type === 'document' && (
                      <div className="space-y-4">
                        <DocumentItemToolbar
                          onAddItem={(item) => setDocumentItems(prev => [...prev, item])}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                          <div className="border rounded-lg overflow-hidden">
                            <DocumentCanvas
                              items={documentItems}
                              onItemsChange={(newItems) => {
                                setDocumentItems(newItems)
                                if (selectedItemId) {
                                  const updatedItem = newItems.find(item => item.id === selectedItemId)
                                  if (!updatedItem) setSelectedItemId(null)
                                }
                              }}
                              onItemSelect={setSelectedItemId}
                              canvasWidth={210}
                              canvasHeight={297}
                              gridSize={5}
                              gridEnabled={true}
                              snapToGrid={true}
                            />
                          </div>

                          {selectedItemId && documentItems.find(item => item.id === selectedItemId) && (
                            <div className="border rounded-lg overflow-hidden">
                              <DocumentStylePanel
                                selectedItem={documentItems.find(item => item.id === selectedItemId)!}
                                onItemUpdate={(updatedItem: DocumentItem) => {
                                  setDocumentItems(prev =>
                                    prev.map(item => item.id === updatedItem.id ? updatedItem : item)
                                  )
                                }}
                                onItemDelete={(itemId: string) => {
                                  setDocumentItems(prev => prev.filter(item => item.id !== itemId))
                                  setSelectedItemId(null)
                                }}
                                onItemDuplicate={(duplicatedItem: DocumentItem) => {
                                  setDocumentItems(prev => [...prev, duplicatedItem])
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Password Type */}
                    {formData.content_type === 'password' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password-email">Email/Username</Label>
                            <Input
                              id="password-email"
                              type="text"
                              placeholder="Email hoặc tên đăng nhập"
                              value={passwordForm.email}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password-username">Tên hiển thị</Label>
                            <Input
                              id="password-username"
                              type="text"
                              placeholder="Tên người dùng"
                              value={passwordForm.username}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, username: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password-password">Mật khẩu *</Label>
                            <Input
                              id="password-password"
                              type="password"
                              placeholder="Nhập mật khẩu"
                              value={passwordForm.password}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password-website">Website/App</Label>
                            <Input
                              id="password-website"
                              type="url"
                              placeholder="https://example.com"
                              value={passwordForm.website}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, website: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password-notes">Ghi chú bổ sung</Label>
                          <Textarea
                            id="password-notes"
                            placeholder="Các ghi chú khác về tài khoản..."
                            value={passwordForm.notes}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {/* Image Type */}
                    {formData.content_type === 'image' && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
                          <div className="space-y-2">
                            <Label>URL Ảnh *</Label>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={imageUrlInput}
                              onChange={(e) => setImageUrlInput(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Alt Text</Label>
                              <Input
                                placeholder="Mô tả ảnh"
                                value={imageAltInput}
                                onChange={(e) => setImageAltInput(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Caption</Label>
                              <Input
                                placeholder="Chú thích"
                                value={imageCaptionInput}
                                onChange={(e) => setImageCaptionInput(e.target.value)}
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={addImageToGallery}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm ảnh vào gallery
                          </Button>
                        </div>

                        {imageGallery.length > 0 && (
                          <div className="space-y-2">
                            <Label>Gallery ({imageGallery.length} ảnh)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 border rounded-lg">
                              {imageGallery.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img.url}
                                    alt={img.alt || `Image ${idx + 1}`}
                                    className="w-full h-32 object-cover rounded-md border"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImageFromGallery(idx)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  {img.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-md truncate">
                                      {img.caption}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Code Type */}
                    {formData.content_type === 'code' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label>Ngôn ngữ:</Label>
                          <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="typescript">TypeScript</SelectItem>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                              <SelectItem value="csharp">C#</SelectItem>
                              <SelectItem value="php">PHP</SelectItem>
                              <SelectItem value="ruby">Ruby</SelectItem>
                              <SelectItem value="go">Go</SelectItem>
                              <SelectItem value="rust">Rust</SelectItem>
                              <SelectItem value="sql">SQL</SelectItem>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="css">CSS</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="yaml">YAML</SelectItem>
                              <SelectItem value="markdown">Markdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="relative">
                          <CodeMirror
                            value={formData.code}
                            extensions={[javascript({ jsx: true })]}
                            theme={okaidia}
                            height="400px"
                            className="rounded border font-mono text-sm"
                            onChange={(val) => setFormData(prev => ({ ...prev, code: val }))}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => handleCopy(formData.code, 'code')}
                          >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Text Type */}
                    {formData.content_type === 'text' && (
                      <div className="space-y-2">
                        <Label htmlFor="text-content">Nội dung văn bản</Label>
                        <Textarea
                          id="text-content"
                          placeholder="Nhập nội dung văn bản... (hỗ trợ xuống dòng và định dạng)"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          rows={15}
                          className="font-sans text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          💡 Văn bản sẽ giữ nguyên định dạng khi paste, bao gồm xuống dòng và khoảng trắng
                        </p>
                      </div>
                    )}

                    {/* Link, File, Webpage, Mixed Types */}
                    {!['document', 'password', 'image', 'code', 'text'].includes(formData.content_type) && (
                      <div className="space-y-2">
                        <Label htmlFor="code">Nội dung</Label>
                        <Textarea
                          id="code"
                          placeholder="Nhập nội dung..."
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* A4 Template Selector */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      📄 Template A4
                    </h3>
                    <A4TemplateSelector
                      linkedTemplateId={formData.linked_a4_template}
                      entityType="note"
                      entityId={editingNote?.id}
                      onTemplateLink={(templateId) => {
                        setFormData(prev => ({ ...prev, linked_a4_template: templateId }))
                      }}
                      onTemplateUnlink={() => {
                        setFormData(prev => ({ ...prev, linked_a4_template: undefined }))
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      🏷️ Tags
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập tag..."
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

                  {/* Submit */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateSheetOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit">
                      {editingNote ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters & Stats */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm ghi chú..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {NOTE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label} ({stats.byType[type.id] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {NOTE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>Tổng: <strong>{stats.total}</strong></span>
            <span>•</span>
            <span>Hiển thị: <strong>{stats.filtered}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => {
          const contentText = getContentText(note)
          const Icon = NOTE_TYPES.find(t => t.id === note.content_type)?.icon || FileText
          const isTextLong = contentText.length > 200
          const isExpanded = textExpanded[note.id || '']

          return (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h1>thẻ note nè con</h1>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold line-clamp-1">{note.name}</h3>
                    </div>
                    {note.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>
                    )}
                  </div>
                </div>
{/* --------------------------------------------------------------------------------------------------------------------- */}
                {/* Password/Account Note */}
                {note.content_type === 'password' && note.content?.password && (
                  <div className="bg-muted/50 rounded-md p-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">🔐 Tài khoản</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPasswordVisible(prev => ({ ...prev, [note.id || '']: !prev[note.id || ''] }))}
                        >
                          {passwordVisible[note.id || ''] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(note.content?.password?.password || '', 'password')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><span className="text-muted-foreground">Email:</span> {note.content.password.email || '-'}</div>
                      <div><span className="text-muted-foreground">Website:</span> {note.content.password.website || '-'}</div>
                      <div>
                        <span className="text-muted-foreground">Password:</span>{' '}
                        {passwordVisible[note.id || ''] ? note.content.password.password || '-' : '••••••••'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Gallery */}
                {note.content_type === 'image' && Array.isArray(note.content?.images) && note.content.images.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      📷 Gallery ({note.content.images.length} ảnh)
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(note.content.images.length > 6 && !isExpanded
                        ? note.content.images.slice(0, 6)
                        : note.content.images
                      ).map((img: any, idx: number) => (
                        <div key={img.url + idx} className="relative group aspect-square">
                          <img
                            src={img.url}
                            alt={img.alt || `Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(img.url, '_blank')}
                          />
                          {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 rounded-b-md truncate">
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {note.content.images.length > 6 && (
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={() => setTextExpanded(prev => ({ ...prev, [note.id || '']: !prev[note.id || ''] }))}
                      >
                        {isExpanded ? 'Thu gọn' : `Xem tất cả (${note.content.images.length})`}
                      </Button>
                    )}
                  </div>
                )}

                {/* Document Preview */}
                {note.content_type === 'document' && note.content?.document?.items && (
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-2">
                      📄 Document A4 ({note.content.document.items.length} items)
                    </div>
                    <div className="border rounded-md overflow-hidden" style={{ height: '200px' }}>
                      <DocumentCanvas
                        items={note.content.document.items}
                        onItemsChange={() => { }}
                        canvasWidth={note.content.document.canvas_width_mm || 210}
                        canvasHeight={note.content.document.canvas_height_mm || 297}
                        gridSize={note.content.document.grid_size_mm || 5}
                        gridEnabled={false}
                        snapToGrid={false}
                        readOnly={true}
                      />
                    </div>
                  </div>
                )}

                {/* Text Content (with collapse) */}
                {contentText && note.content_type !== 'password' && note.content_type !== 'image' && (
                  <div className="bg-muted/30 rounded-md p-3 mb-3 relative">
                    <div 
                      className={`text-sm ${note.content_type === 'code' ? 'font-mono' : ''} whitespace-pre-wrap overflow-hidden transition-all duration-200`}
                      style={{
                        maxHeight: !isExpanded && isTextLong ? '6rem' : 'none',
                        display: '-webkit-box',
                        WebkitLineClamp: !isExpanded && isTextLong ? 4 : 'unset',
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {note.content_type === 'link' ? makeLinksClickable(contentText) : contentText}
                    </div>
                    {isTextLong && (
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-1 h-auto p-0 text-xs"
                        onClick={() => setTextExpanded(prev => ({ ...prev, [note.id || '']: !prev[note.id || ''] }))}
                      >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                      </Button>
                    )}
                  </div>
                )}
{/* --------------------------------------------------------------------------------------------------------------------- */}
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
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {note.created_at && new Date(note.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex gap-1">
                    {contentText && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(contentText, note.content_type || 'text')}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewNote(note)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8 p-0"
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

      {/* Empty State */}
      {!loading && filteredNotes.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Không tìm thấy ghi chú nào'
                : 'Chưa có ghi chú nào'
              }
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
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
        <SheetContent side="right" className="w-full sm:max-w-[800px] overflow-y-auto p-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
              <SheetTitle className="flex items-center gap-2">
                {previewNote && NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon && (() => {
                  const Icon = NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon!
                  return <Icon className="h-5 w-5" />
                })()}
                {previewNote?.name}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {previewNote?.description && (
                <div>
                  <h4 className="font-medium mb-2">📝 Mô tả</h4>
                  <p className="text-muted-foreground">{previewNote.description}</p>
                </div>
              )}

              {/* Document Preview */}
              {previewNote?.content_type === 'document' && previewNote?.content?.document && (
                <div>
                  <h4 className="font-medium mb-2">📄 Document A4</h4>
                  <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                    <DocumentCanvas
                      items={previewNote.content.document.items || []}
                      onItemsChange={() => { }}
                      canvasWidth={previewNote.content.document.canvas_width_mm || 210}
                      canvasHeight={previewNote.content.document.canvas_height_mm || 297}
                      gridSize={previewNote.content.document.grid_size_mm || 5}
                      gridEnabled={previewNote.content.document.grid_enabled || false}
                      snapToGrid={false}
                      readOnly={true}
                    />
                  </div>
                </div>
              )}

              {/* Password Preview */}
              {previewNote?.content_type === 'password' && previewNote?.content?.password && (
                <div>
                  <h4 className="font-medium mb-2">🔐 Thông tin tài khoản</h4>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {previewNote.content.password.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm font-medium">{previewNote.content.password.email}</span>
                      </div>
                    )}
                    {previewNote.content.password.username && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Username:</span>
                        <span className="text-sm font-medium">{previewNote.content.password.username}</span>
                      </div>
                    )}
                    {previewNote.content.password.website && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Website:</span>
                        <a href={previewNote.content.password.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          {previewNote.content.password.website}
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {passwordVisible[previewNote.id || ''] ? previewNote.content.password.password : '••••••••••••'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPasswordVisible(prev => ({ ...prev, [previewNote.id || '']: !prev[previewNote.id || ''] }))}
                        >
                          {passwordVisible[previewNote.id || ''] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(previewNote.content?.password?.password || '', 'password')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {previewNote.content.password.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground block mb-1">Ghi chú:</span>
                        <p className="text-sm whitespace-pre-wrap">{previewNote.content.password.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image Gallery Preview */}
              {previewNote?.content_type === 'image' && previewNote?.content?.images && previewNote.content.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">� Image Gallery ({previewNote.content.images.length} ảnh)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewNote.content.images.map((img: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <img
                          src={img.url}
                          alt={img.alt || `Image ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(img.url, '_blank')}
                        />
                        {img.caption && (
                          <p className="text-xs text-muted-foreground">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Preview */}
              {previewNote?.content_type === 'code' && getContentText(previewNote) && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">💻 Code Snippet</h4>
                    {previewNote.content?.language && (
                      <Badge variant="secondary" className="text-xs">
                        {previewNote.content.language}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="relative">
                      <CodeMirror
                        value={getContentText(previewNote)}
                        extensions={[javascript({ jsx: true })]}
                        theme={okaidia}
                        height="400px"
                        className="rounded border"
                        readOnly
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => handleCopy(getContentText(previewNote), 'code')}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text/Other Content */}
              {previewNote && !['document', 'password', 'image', 'code'].includes(previewNote.content_type) && getContentText(previewNote) && (
                <div>
                  <h4 className="font-medium mb-2">📄 Nội dung</h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {previewNote.content_type === 'link' ? (
                      <div className="text-sm space-y-2">
                        {makeLinksClickable(getContentText(previewNote))}
                      </div>
                    ) : previewNote.content_type === 'text' ? (
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {getContentText(previewNote)}
                      </div>
                    ) : (
                      <div className="text-sm whitespace-pre-wrap font-mono">
                        {getContentText(previewNote)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {previewNote?.tags && previewNote.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewNote.tags.map(tag => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <div className="flex justify-between">
                  <span>Tạo: {previewNote?.created_at && new Date(previewNote.created_at).toLocaleString('vi-VN')}</span>
                  {previewNote?.updated_at && (
                    <span>Cập nhật: {new Date(previewNote.updated_at).toLocaleString('vi-VN')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => previewNote && handleCopy(getContentText(previewNote), previewNote.content_type || 'text')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (previewNote) {
                    handleEdit(previewNote)
                    setPreviewNote(null)
                  }
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  )
}
