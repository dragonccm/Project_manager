'use client'

/**
 * Template Manager Component
 * Quản lý templates với filter, search, clone, version history
 */

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Copy, 
  History, 
  Star, 
  StarOff,
  Trash2,
  Eye,
  Share2,
  MoreVertical,
  Clock,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { A4Template } from '@/types/database'

interface TemplateManagerProps {
  onSelectTemplate: (template: A4Template) => void
  onCreateNew: () => void
}

export default function TemplateManager({ onSelectTemplate, onCreateNew }: TemplateManagerProps) {
  const { toast } = useToast()
  
  const [templates, setTemplates] = useState<A4Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<A4Template[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent' | 'shared'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'modified'>('modified')
  
  // Version history dialog
  const [versionDialogOpen, setVersionDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<A4Template | null>(null)
  const [versions, setVersions] = useState<any[]>([])

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch()
  }, [templates, searchTerm, filterBy, sortBy])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/a4-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...templates]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Category filter
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(t => t.isFavorite)
        break
      case 'recent':
        filtered = filtered.slice(0, 10)
        break
      case 'shared':
        filtered = filtered.filter(t => t.sharedWith && t.sharedWith.length > 0)
        break
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'modified':
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      }
    })
    
    setFilteredTemplates(filtered)
  }

  const handleClone = async (template: A4Template) => {
    try {
      const response = await fetch('/api/a4-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          name: `${template.name} (Copy)`,
          _id: undefined,
          createdAt: undefined,
          updatedAt: undefined
        })
      })
      
      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã sao chép template'
        })
        loadTemplates()
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép template',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Bạn có chắc muốn xóa template này?')) return
    
    try {
      const response = await fetch(`/api/a4-templates?id=${templateId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa template'
        })
        loadTemplates()
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa template',
        variant: 'destructive'
      })
    }
  }

  const handleToggleFavorite = async (template: A4Template) => {
    try {
      const response = await fetch(`/api/a4-templates?id=${template._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          isFavorite: !template.isFavorite
        })
      })
      
      if (response.ok) {
        loadTemplates()
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật template',
        variant: 'destructive'
      })
    }
  }

  const loadVersionHistory = async (template: A4Template) => {
    setSelectedTemplate(template)
    setVersionDialogOpen(true)
    
    if (template.versionHistory) {
      setVersions(template.versionHistory)
    }
  }

  const handleRestoreVersion = async (versionIndex: number) => {
    if (!selectedTemplate || !selectedTemplate.versionHistory) return
    
    const version = selectedTemplate.versionHistory[versionIndex]
    
    try {
      const response = await fetch(`/api/a4-templates?id=${selectedTemplate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTemplate,
          shapes: version.shapes,
          canvasSettings: version.canvasSettings
        })
      })
      
      if (response.ok) {
        toast({
          title: 'Thành công',
          description: 'Đã khôi phục version'
        })
        setVersionDialogOpen(false)
        loadTemplates()
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể khôi phục version',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Templates</h2>
          <Button onClick={onCreateNew}>
            Tạo mới
          </Button>
        </div>
        
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                Tất cả
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('favorites')}>
                Yêu thích
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('recent')}>
                Gần đây
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('shared')}>
                Được chia sẻ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sắp xếp: Tên
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Sắp xếp: Ngày tạo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('modified')}>
                Sắp xếp: Cập nhật
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active filters */}
        <div className="flex gap-2 flex-wrap">
          {filterBy !== 'all' && (
            <Badge variant="secondary">
              {filterBy === 'favorites' && 'Yêu thích'}
              {filterBy === 'recent' && 'Gần đây'}
              {filterBy === 'shared' && 'Được chia sẻ'}
            </Badge>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Không tìm thấy template nào</p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card 
                key={template._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(template)
                        }}
                      >
                        {template.isFavorite ? (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleClone(template)
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            loadVersionHistory(template)
                          }}>
                            <History className="h-4 w-4 mr-2" />
                            Lịch sử
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Share functionality
                          }}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Chia sẻ
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(template._id!)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.description || 'Không có mô tả'}
                  </p>
                  
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {template.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="text-xs text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(template.updatedAt)}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Version History Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử phiên bản</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {versions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Chưa có lịch sử phiên bản
                </p>
              ) : (
                versions.map((version, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">
                            Version {versions.length - index}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(version.timestamp)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestoreVersion(index)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Khôi phục
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {version.shapes?.length || 0} shapes
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersionDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
