'use client'

/**
 * Page Navigator Component
 * Quản lý và điều hướng giữa các trang
 */

import React, { useState } from 'react'
import { Plus, MoreVertical, GripVertical, Trash2, Copy, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { Label } from '@/components/ui/label'
import { Page } from '@/lib/canvas-manager'
import { useToast } from '@/hooks/use-toast'

interface PageNavigatorProps {
  pages: Page[]
  activePage: string | null
  onPageSelect: (pageId: string) => void
  onPageAdd: (page: Omit<Page, 'id' | 'order'>) => void
  onPageDelete: (pageId: string) => void
  onPageRename: (pageId: string, newName: string) => void
  onPageDuplicate: (pageId: string) => void
  onPageReorder: (pageId: string, newOrder: number) => void
  className?: string
}

export default function PageNavigator({
  pages,
  activePage,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageRename,
  onPageDuplicate,
  onPageReorder,
  className = ''
}: PageNavigatorProps) {
  const { toast } = useToast()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [newPageName, setNewPageName] = useState('')
  const [newPageSize, setNewPageSize] = useState({ width: 794, height: 1123 })
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)

  const handleAddPage = () => {
    if (!newPageName.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên trang',
        variant: 'destructive'
      })
      return
    }

    onPageAdd({
      name: newPageName,
      width: newPageSize.width,
      height: newPageSize.height
    })

    setNewPageName('')
    setNewPageSize({ width: 794, height: 1123 })
    setAddDialogOpen(false)

    toast({
      title: 'Thành công',
      description: 'Đã thêm trang mới'
    })
  }

  const handleRename = () => {
    if (!selectedPageId || !newPageName.trim()) return

    onPageRename(selectedPageId, newPageName)
    setRenameDialogOpen(false)
    setNewPageName('')

    toast({
      title: 'Thành công',
      description: 'Đã đổi tên trang'
    })
  }

  const handleDelete = (pageId: string) => {
    if (pages.length <= 1) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa trang cuối cùng',
        variant: 'destructive'
      })
      return
    }

    if (!confirm('Bạn có chắc muốn xóa trang này?')) return

    onPageDelete(pageId)

    toast({
      title: 'Thành công',
      description: 'Đã xóa trang'
    })
  }

  const handleDuplicate = (pageId: string) => {
    onPageDuplicate(pageId)

    toast({
      title: 'Thành công',
      description: 'Đã nhân đôi trang'
    })
  }

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (!draggedPageId || draggedPageId === targetPageId) return

    const draggedPage = pages.find(p => p.id === draggedPageId)
    const targetPage = pages.find(p => p.id === targetPageId)

    if (!draggedPage || !targetPage) return

    onPageReorder(draggedPageId, targetPage.order)
  }

  const handleDragEnd = () => {
    setDraggedPageId(null)
  }

  const pageSizePresets = [
    { name: 'A4 Portrait', width: 794, height: 1123 },
    { name: 'A4 Landscape', width: 1123, height: 794 },
    { name: 'US Letter', width: 816, height: 1056 },
    { name: 'Custom', width: 800, height: 600 }
  ]

  return (
    <>
      <Card className={`p-3 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Pages</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            title="Thêm trang"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragOver={(e) => handleDragOver(e, page.id)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-2 p-2 rounded cursor-pointer
                  hover:bg-accent transition-colors
                  ${activePage === page.id ? 'bg-accent border-2 border-primary' : 'border-2 border-transparent'}
                  ${draggedPageId === page.id ? 'opacity-50' : ''}
                `}
                onClick={() => onPageSelect(page.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {page.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {page.order + 1}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {page.width} × {page.height}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPageId(page.id)
                        setNewPageName(page.name)
                        setRenameDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Đổi tên
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicate(page.id)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Nhân đôi
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(page.id)
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Add Page Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm trang mới</DialogTitle>
            <DialogDescription>
              Tạo một trang mới cho template của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="page-name">Tên trang</Label>
              <Input
                id="page-name"
                placeholder="Ví dụ: Cover Page, Content..."
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
              />
            </div>

            <div>
              <Label>Kích thước</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pageSizePresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant={
                      newPageSize.width === preset.width &&
                      newPageSize.height === preset.height
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      setNewPageSize({ width: preset.width, height: preset.height })
                    }
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="page-width">Chiều rộng (px)</Label>
                <Input
                  id="page-width"
                  type="number"
                  value={newPageSize.width}
                  onChange={(e) =>
                    setNewPageSize({ ...newPageSize, width: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="page-height">Chiều cao (px)</Label>
                <Input
                  id="page-height"
                  type="number"
                  value={newPageSize.height}
                  onChange={(e) =>
                    setNewPageSize({ ...newPageSize, height: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddPage}>
              Thêm trang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên trang</DialogTitle>
          </DialogHeader>

          <div>
            <Label htmlFor="rename-page">Tên mới</Label>
            <Input
              id="rename-page"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleRename}>
              Đổi tên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
