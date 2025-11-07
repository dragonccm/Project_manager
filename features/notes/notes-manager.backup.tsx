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
import dynamic from "next/dynamic"
import { okaidia } from "@uiw/codemirror-theme-okaidia"
import { javascript } from "@codemirror/lang-javascript"

// Dynamic import CodeMirror for SSR compatibility
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false })

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
                            <div className="space-y-6 p-6 flex-1 overflow-y-auto">
                              {previewNote.description && (
                                <div>
                                  <h4 className="font-medium mb-2">📝 Mô tả</h4>
                                  <p className="text-muted-foreground">{previewNote.description}</p>
                                </div>
                              )}
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
                                            onClick={() => handleCopy(getContentText(previewNote), previewNote?.content_type || 'text')}
                                            className="h-8 flex items-center gap-2"
                                          >
                                            <Copy className="h-3 w-3" />
                                            Copy
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{t('copy')} {previewNote?.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="bg-muted/30 rounded-lg p-4">
                                    {previewNote?.content_type === 'code' ? (
                                      <div className="relative">
                                        <CodeMirror
                                          value={getContentText(previewNote)}
                                          extensions={[javascript({ jsx: true })]}
                                          theme={okaidia}
                                          height="200px"
                                          className="rounded border font-mono text-sm"
                                          readOnly={true}
                                        />
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="absolute top-2 right-2 z-10"
                                          onClick={() => handleCopy(getContentText(previewNote), 'code')}
                                        >
                                          <Copy className="h-4 w-4 mr-1" /> Copy
                                        </Button>
                                      </div>
                                    ) : previewNote?.content_type === 'link' ? (
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
                                    ) : previewNote?.content_type === 'file' ? (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-mono text-sm">{previewNote?.content?.fileName || 'File đính kèm'}</span>
                                          {previewNote?.content?.fileUrl && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => window.open(previewNote.content.fileUrl, '_blank')}
                                            >
                                              <Download className="h-4 w-4 mr-1" /> Tải về
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ) : previewNote?.content_type === 'webpage' ? (
                                      <div className="space-y-2">
                                        <div className="mb-2 text-xs text-muted-foreground">Web Preview</div>
                                        {detectUrls(getContentText(previewNote)).length > 0 ? (
                                          <iframe
                                            src={detectUrls(getContentText(previewNote))[0]}
                                            title="Web Preview"
                                            className="w-full h-64 rounded border"
                                            sandbox="allow-scripts allow-same-origin allow-popups"
                                          />
                                        ) : (
                                          <span className="text-sm">Không có URL hợp lệ để preview</span>
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
                              {previewNote?.tags && previewNote.tags.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">🏷️ Tags</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {previewNote.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs px-2 py-0">#{tag}</Badge>
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
                            <div className="p-6 border-t">
                              <div className="flex gap-2">
                                {getContentText(previewNote) && (
                                  <Button
                                    variant="outline"
                                    onClick={() => handleCopy(getContentText(previewNote), previewNote?.content_type || 'text')}
                                    className="flex-1"
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy All
                                  </Button>
                                )}
                                <Button 
                                  onClick={() => handleEdit(previewNote)} 
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
                    )}

                    {/* Share Modal */}
                    {selectedNoteForShare && (
                      /* ...existing code... */
                    )}
                  </div>
                );
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(getContentText(previewNote || {}), previewNote?.content_type || 'text')}
                              className="h-8 flex items-center gap-2"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('copy')} {previewNote?.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      {previewNote?.content_type === 'code' ? (
                        <div className="relative">
                          <CodeMirror
                            value={getContentText(previewNote || {})}
                            extensions={[javascript({ jsx: true })]}
                            theme={okaidia}
                            height="200px"
                            className="rounded border font-mono text-sm"
                            readOnly={true}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2 z-10"
                            onClick={() => handleCopy(getContentText(previewNote || {}), 'code')}
                          >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                      ) : previewNote?.content_type === 'link' ? (
                        <div className="space-y-2">
                          <div className="text-sm">
                            {makeLinksClickable(getContentText(previewNote || {}))}
                          </div>
                          {detectUrls(getContentText(previewNote || {})).length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {detectUrls(getContentText(previewNote || {})).length} link(s) detected
                            </Badge>
                          )}
                        </div>
                      ) : previewNote?.content_type === 'file' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{previewNote?.content?.fileName || 'File đính kèm'}</span>
                            {previewNote?.content?.fileUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(previewNote.content.fileUrl, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-1" /> Tải về
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : previewNote?.content_type === 'webpage' ? (
                        <div className="space-y-2">
                          <div className="mb-2 text-xs text-muted-foreground">Web Preview</div>
                          {detectUrls(getContentText(previewNote || {})).length > 0 ? (
                            <iframe
                              src={detectUrls(getContentText(previewNote || {}))[0]}
                              title="Web Preview"
                              className="w-full h-64 rounded border"
                              sandbox="allow-scripts allow-same-origin allow-popups"
                            />
                          ) : (
                            <span className="text-sm">Không có URL hợp lệ để preview</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm">
                          {detectUrls(getContentText(previewNote || {})).length > 0 ? 
                            makeLinksClickable(getContentText(previewNote || {})) :
                            <span className="whitespace-pre-wrap">{getContentText(previewNote || {})}</span>
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {previewNote?.tags && previewNote.tags.length > 0 && (
                      {/* Preview Sheet */}
                      {previewNote && (
                        <Sheet open={!!previewNote} onOpenChange={() => setPreviewNote(null)}>
                          <SheetContent side="right" className="w-full sm:max-w-[800px] lg:max-w-[900px] overflow-y-auto p-0">
                            <div className="h-full flex flex-col">
                              <SheetHeader className="p-6 pb-4 border-b bg-muted/20">
                                <SheetTitle className="flex items-center gap-2 text-xl">
                                  {NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon && (() => {
                                    const Icon = NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon!
                                    return <Icon className="h-5 w-5" />
                                  })()}
                                  {previewNote.name}
                                </SheetTitle>
                              </SheetHeader>
                              <div className="space-y-6 p-6 flex-1 overflow-y-auto">
                                {previewNote.description && (
                                  <div>
                                    <h4 className="font-medium mb-2">📝 Mô tả</h4>
                                    <p className="text-muted-foreground">{previewNote.description}</p>
                                  </div>
                                )}
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
                                              onClick={() => handleCopy(getContentText(previewNote), previewNote?.content_type || 'text')}
                                              className="h-8 flex items-center gap-2"
                                            >
                                              <Copy className="h-3 w-3" />
                                              Copy
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{t('copy')} {previewNote?.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                      {previewNote?.content_type === 'code' ? (
                                        <div className="relative">
                                          <CodeMirror
                                            value={getContentText(previewNote)}
                                            extensions={[javascript({ jsx: true })]}
                                            theme={okaidia}
                                            height="200px"
                                            className="rounded border font-mono text-sm"
                                            readOnly={true}
                                          />
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="absolute top-2 right-2 z-10"
                                            onClick={() => handleCopy(getContentText(previewNote), 'code')}
                                          >
                                            <Copy className="h-4 w-4 mr-1" /> Copy
                                          </Button>
                                        </div>
                                      ) : previewNote?.content_type === 'link' ? (
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
                                      ) : previewNote?.content_type === 'file' ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-mono text-sm">{previewNote?.content?.fileName || 'File đính kèm'}</span>
                                            {previewNote?.content?.fileUrl && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(previewNote.content.fileUrl, '_blank')}
                                              >
                                                <Download className="h-4 w-4 mr-1" /> Tải về
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ) : previewNote?.content_type === 'webpage' ? (
                                        <div className="space-y-2">
                                          <div className="mb-2 text-xs text-muted-foreground">Web Preview</div>
                                          {detectUrls(getContentText(previewNote)).length > 0 ? (
                                            <iframe
                                              src={detectUrls(getContentText(previewNote))[0]}
                                              title="Web Preview"
                                              className="w-full h-64 rounded border"
                                              sandbox="allow-scripts allow-same-origin allow-popups"
                                            />
                                          ) : (
                                            <span className="text-sm">Không có URL hợp lệ để preview</span>
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
                                {previewNote?.tags && previewNote.tags.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">🏷️ Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {previewNote.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0">#{tag}</Badge>
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
                              <div className="p-6 border-t">
                                <div className="flex gap-2">
                                  {getContentText(previewNote) && (
                                    <Button
                                      variant="outline"
                                      onClick={() => handleCopy(getContentText(previewNote), previewNote?.content_type || 'text')}
                                      className="flex-1"
                                    >
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy All
                                    </Button>
                                  )}
                                  <Button 
                                    onClick={() => handleEdit(previewNote)} 
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
                      )}
      // Check file type
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

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(fileObj)
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
    <>
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
                  {/* ...form content... */}
                    <div className="space-y-6">
                      {/* Header Information Card */}
                      <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          📝 Thông tin cơ bản
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                          {/* ...rest of form and content... */}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* ...rest of notes manager content... */}
      </div>
    </>
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
                          {formData.content_type === 'code' ? (
                            <div className="relative">
                              <CodeMirror
                                value={formData.code}
                                extensions={[javascript({ jsx: true })]}
                                theme={okaidia}
                                height="200px"
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
                          ) : (
                            <Textarea
                              id="code"
                              placeholder={t('enterCode')}
                              value={formData.code}
                              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                              rows={12}
                              className="font-mono text-sm"
                            />
                          )}
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
                        <Button size="sm" variant="outline" onClick={() => setPasswordVisible(prev => ({ ...prev, [note.id]: !prev[note.id] }))}>
                          {passwordVisible[note.id] ? 'Ẩn' : 'Hiện'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(note.content?.password?.password || '', 'text')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {note.content.password.notes && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Ghi chú:</span>
                          <span>{note.content.password.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  </form>
                ) : contentText && (
                  <div className="bg-muted/30 rounded-md p-3 mb-3 relative group">
                    {note.content_type === 'image' && Array.isArray(note.content?.images) ? (
                      <>
                        <div className="mb-2 font-semibold text-xs text-muted-foreground">Gallery ({note.content?.images?.length || 0} ảnh)</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(note.content?.images?.length > 3 && !passwordVisible[note.id] ? note.content.images.slice(0, 3) : note.content.images || []).map((img: any, idx: number) => (
                            <div key={img.url + idx} className="relative group">
                              <img
                                src={img.url}
                                alt={img.alt || `Ảnh ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(img.url, '_blank')}
                              />
                              {img.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 rounded-b-md">{img.caption}</div>}
                            </div>
                          ))}
                        </div>
                        {note.content?.images?.length > 3 && !passwordVisible[note.id] && (
                          <Button size="sm" variant="link" className="mt-2 px-1" onClick={() => setPasswordVisible(prev => ({ ...prev, [note.id]: true }))}>
                            Xem tất cả
                          </Button>
                        )}
                        {note.content?.images?.length > 3 && passwordVisible[note.id] && (
                          <Button size="sm" variant="link" className="mt-2 px-1" onClick={() => setPasswordVisible(prev => ({ ...prev, [note.id]: false }))}>
                            Thu gọn
                          </Button>
                        )}
                      </>
                    ) : null}
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
                {previewNote && NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon && (() => {
                  const Icon = NOTE_TYPES.find(t => t.id === previewNote.content_type)?.icon!
                  return <Icon className="h-5 w-5" />
                })()}
                {previewNote?.name}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 p-6 flex-1 overflow-y-auto">
              {previewNote?.description && (
                <div>
                  <h4 className="font-medium mb-2">📝 Mô tả</h4>
                  <p className="text-muted-foreground">{previewNote.description}</p>
                </div>
              )}
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
                            onClick={() => handleCopy(getContentText(previewNote), previewNote?.content_type || 'text')}
                            className="h-8 flex items-center gap-2"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('copy')} {previewNote?.content_type === 'code' ? t('formattedCode') : t('content')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    {previewNote?.content_type === 'code' ? (
                      <div className="relative">
                        <CodeMirror
                          value={getContentText(previewNote) || ''}
                          extensions={[javascript({ jsx: true })]}
                          theme={okaidia}
                          height="200px"
                          className="rounded border font-mono text-sm"
                          readOnly={true}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => handleCopy(getContentText(previewNote) || '', 'code')}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </div>
                    ) : previewNote?.content_type === 'link' ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          {makeLinksClickable(getContentText(previewNote) || '')}
                        </div>
                        {detectUrls(getContentText(previewNote) || '').length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {detectUrls(getContentText(previewNote) || '').length} link(s) detected
                          </Badge>
                        )}
                      </div>
                    ) : previewNote?.content_type === 'file' ? (
                      <div className="space-y-2">
                        {Array.isArray(previewNote.content?.files) && previewNote.content.files.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{previewNote.content.files[0].name || 'File đính kèm'}</span>
                            {previewNote.content.files[0].url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(previewNote.content.files[0].url, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-1" /> Tải về
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm">Không có file đính kèm</span>
                        )}
                      </div>
                    ) : previewNote?.content_type === 'webpage' ? (
                      <div className="space-y-2">
                        <div className="mb-2 text-xs text-muted-foreground">Web Preview</div>
                        {detectUrls(getContentText(previewNote) || '').length > 0 ? (
                          <iframe
                            src={detectUrls(getContentText(previewNote) || '')[0]}
                            title="Web Preview"
                            className="w-full h-64 rounded border"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                          />
                        ) : (
                          <span className="text-sm">Không có URL hợp lệ để preview</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm">
                        {detectUrls(getContentText(previewNote) || '').length > 0 ? 
                          makeLinksClickable(getContentText(previewNote) || '') :
                          <span className="whitespace-pre-wrap">{getContentText(previewNote) || ''}</span>
                        }
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
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
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
            <div className="p-6 border-t">
              <div className="flex gap-2">
                {previewNote && getContentText(previewNote) && (
                  <Button
                    variant="outline"
                    onClick={() => previewNote && handleCopy(getContentText(previewNote) || '', previewNote?.content_type || 'text')}
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
  );
}