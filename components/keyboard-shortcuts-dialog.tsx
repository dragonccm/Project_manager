'use client'

/**
 * Keyboard Shortcuts Settings Dialog
 * UI để xem và tùy chỉnh các phím tắt
 */

import React, { useState, useEffect } from 'react'
import { Keyboard, Search, RotateCcw, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { KeyboardShortcut, KeyboardShortcutManager } from '@/lib/keyboard-shortcuts'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manager: KeyboardShortcutManager
}

export default function KeyboardShortcutsDialog({ 
  open, 
  onOpenChange, 
  manager 
}: KeyboardShortcutsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [recordedKeys, setRecordedKeys] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('file')

  useEffect(() => {
    if (open) {
      setShortcuts(manager.getAllShortcuts())
    }
  }, [open, manager])

  const categories = [
    { id: 'file', name: 'File' },
    { id: 'editing', name: 'Chỉnh sửa' },
    { id: 'view', name: 'Hiển thị' },
    { id: 'tools', name: 'Công cụ' },
    { id: 'navigation', name: 'Di chuyển' }
  ]

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = searchTerm === '' || 
      shortcut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || shortcut.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  const startRecording = (shortcutId: string) => {
    setEditingId(shortcutId)
    setIsRecording(true)
    setRecordedKeys([])
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (editingId && recordedKeys.length > 0) {
      manager.customize(editingId, recordedKeys)
      setShortcuts(manager.getAllShortcuts())
    }
    setEditingId(null)
    setRecordedKeys([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return

    e.preventDefault()
    const keys: string[] = []
    
    if (e.ctrlKey || e.metaKey) keys.push('ctrl')
    if (e.shiftKey) keys.push('shift')
    if (e.altKey) keys.push('alt')
    
    const mainKey = e.key.toLowerCase()
    if (!['control', 'shift', 'alt', 'meta'].includes(mainKey)) {
      keys.push(mainKey)
    }

    if (keys.length > 0) {
      setRecordedKeys(keys)
    }
  }

  const handleToggle = (shortcutId: string, enabled: boolean) => {
    manager.toggle(shortcutId, enabled)
    setShortcuts(manager.getAllShortcuts())
  }

  const handleReset = (shortcutId: string) => {
    manager.reset(shortcutId)
    setShortcuts(manager.getAllShortcuts())
  }

  const handleResetAll = () => {
    if (confirm('Bạn có chắc muốn reset tất cả phím tắt về mặc định?')) {
      manager.resetAll()
      setShortcuts(manager.getAllShortcuts())
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Phím tắt
          </DialogTitle>
          <DialogDescription>
            Xem và tùy chỉnh các phím tắt của bạn
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm phím tắt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs by category */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Phím tắt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShortcuts.map(shortcut => (
                  <TableRow key={shortcut.id}>
                    <TableCell className="font-medium">
                      {shortcut.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </TableCell>
                    <TableCell>
                      {editingId === shortcut.id ? (
                        <div 
                          className="flex items-center gap-2"
                          onKeyDown={handleKeyDown}
                          tabIndex={0}
                        >
                          <Badge 
                            variant={isRecording ? 'default' : 'outline'}
                            className="min-w-[120px] justify-center"
                          >
                            {recordedKeys.length > 0
                              ? KeyboardShortcutManager.formatKeys(recordedKeys)
                              : 'Nhấn phím...'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={stopRecording}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">
                          {KeyboardShortcutManager.formatKeys(shortcut.keys)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={shortcut.enabled}
                          onCheckedChange={(checked) => 
                            handleToggle(shortcut.id, checked)
                          }
                        />
                        {editingId !== shortcut.id && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startRecording(shortcut.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReset(shortcut.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleResetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset tất cả
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
