"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { DocumentItem, DocumentItemStyle } from '@/types/database'
import { Type, Image, Square, Tag, Trash2, Copy, Lock, Unlock, MoveUp, MoveDown } from 'lucide-react'

interface DocumentStylePanelProps {
  selectedItem: DocumentItem | null
  onItemUpdate: (item: DocumentItem) => void
  onItemDelete: (itemId: string) => void
  onItemDuplicate: (item: DocumentItem) => void
}

export function DocumentStylePanel({
  selectedItem,
  onItemUpdate,
  onItemDelete,
  onItemDuplicate
}: DocumentStylePanelProps) {
  if (!selectedItem) {
    return (
      <Card className="p-4 w-full lg:w-80">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select an item to edit its properties</p>
        </div>
      </Card>
    )
  }

  const updateStyle = (updates: Partial<DocumentItemStyle>) => {
    onItemUpdate({
      ...selectedItem,
      style: { ...selectedItem.style, ...updates }
    })
  }

  const updateContent = (updates: any) => {
    onItemUpdate({
      ...selectedItem,
      content: { ...selectedItem.content, ...updates }
    })
  }

  const updatePosition = (updates: Partial<Pick<DocumentItem, 'x_mm' | 'y_mm' | 'width_mm' | 'height_mm' | 'z_index' | 'rotation'>>) => {
    onItemUpdate({
      ...selectedItem,
      ...updates
    })
  }

  return (
    <Card className="p-4 w-full lg:w-80 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Properties</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onItemUpdate({ ...selectedItem, locked: !selectedItem.locked })}
              title={selectedItem.locked ? 'Unlock' : 'Lock'}
            >
              {selectedItem.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onItemDuplicate(selectedItem)}
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onItemDelete(selectedItem.id)}
              title="Delete"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Type */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Type</Label>
          <div className="text-sm capitalize">{selectedItem.type}</div>
        </div>

        {/* Position & Size */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Position & Size (mm)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={selectedItem.x_mm.toFixed(1)}
                onChange={(e) => updatePosition({ x_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={selectedItem.y_mm.toFixed(1)}
                onChange={(e) => updatePosition({ y_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
              />
            </div>
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={selectedItem.width_mm.toFixed(1)}
                onChange={(e) => updatePosition({ width_mm: parseFloat(e.target.value) || 1 })}
                step="0.5"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={selectedItem.height_mm.toFixed(1)}
                onChange={(e) => updatePosition({ height_mm: parseFloat(e.target.value) || 1 })}
                step="0.5"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Z-Index & Rotation */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Z-Index</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={selectedItem.z_index}
                onChange={(e) => updatePosition({ z_index: parseInt(e.target.value) || 0 })}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePosition({ z_index: selectedItem.z_index + 1 })}
                title="Bring Forward"
              >
                <MoveUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePosition({ z_index: Math.max(0, selectedItem.z_index - 1) })}
                title="Send Backward"
              >
                <MoveDown className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Rotation (°)</Label>
            <Input
              type="number"
              value={selectedItem.rotation || 0}
              onChange={(e) => updatePosition({ rotation: parseFloat(e.target.value) || 0 })}
              step="5"
            />
          </div>
        </div>

        <Separator />

        {/* Content Properties */}
        {(selectedItem.type === 'title' || selectedItem.type === 'text') && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Content</Label>
            <textarea
              className="w-full min-h-[80px] p-2 text-sm border rounded-md"
              value={selectedItem.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Enter text..."
            />
          </div>
        )}

        {selectedItem.type === 'image' && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Image</Label>
            <Input
              placeholder="Image URL"
              value={selectedItem.content.image_url || ''}
              onChange={(e) => updateContent({ image_url: e.target.value })}
            />
            <Input
              placeholder="Alt text"
              value={selectedItem.content.image_alt || ''}
              onChange={(e) => updateContent({ image_alt: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedItem.content.preserve_aspect ?? true}
                onChange={(e) => updateContent({ preserve_aspect: e.target.checked })}
              />
              Preserve aspect ratio
            </label>
          </div>
        )}

        {selectedItem.type === 'shape' && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Shape</Label>
            <Select
              value={selectedItem.content.shape_type || 'rectangle'}
              onValueChange={(value) => updateContent({ shape_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="ellipse">Ellipse</SelectItem>
                <SelectItem value="triangle">Triangle</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label className="text-xs">Fill Color</Label>
              <Input
                type="color"
                value={selectedItem.content.fill_color || '#000000'}
                onChange={(e) => updateContent({ fill_color: e.target.value })}
              />
            </div>
          </div>
        )}

        {selectedItem.type === 'tag' && (
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Tag</Label>
            <Input
              placeholder="Tag label"
              value={selectedItem.content.tag_label || ''}
              onChange={(e) => updateContent({ tag_label: e.target.value })}
            />
          </div>
        )}

        <Separator />

        {/* Text Styling */}
        {(selectedItem.type === 'title' || selectedItem.type === 'text') && (
          <>
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Text Style</Label>
              
              <div>
                <Label className="text-xs">Font Family</Label>
                <Select
                  value={selectedItem.style.font_family || 'Arial'}
                  onValueChange={(value) => updateStyle({ font_family: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Size (pt)</Label>
                  <Input
                    type="number"
                    value={selectedItem.style.font_size_pt || 12}
                    onChange={(e) => updateStyle({ font_size_pt: parseFloat(e.target.value) || 12 })}
                    min="6"
                    max="72"
                  />
                </div>
                <div>
                  <Label className="text-xs">Font Weight</Label>
                  <Select
                    value={String(selectedItem.style.font_weight || 'normal')}
                    onValueChange={(value) => updateStyle({ font_weight: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Lighter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Text Color</Label>
                  <Input
                    type="color"
                    value={selectedItem.style.text_color || '#000000'}
                    onChange={(e) => updateStyle({ text_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Alignment</Label>
                  <Select
                    value={selectedItem.style.text_align || 'left'}
                    onValueChange={(value: any) => updateStyle({ text_align: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="justify">Justify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Box Styling */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Box Style</Label>
          
          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={selectedItem.style.background_color || '#ffffff'}
                onChange={(e) => updateStyle({ background_color: e.target.value })}
                className="w-16"
              />
              <Input
                value={selectedItem.style.background_color || '#ffffff'}
                onChange={(e) => updateStyle({ background_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Border</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={selectedItem.style.border_width || 0}
                onChange={(e) => updateStyle({ border_width: parseFloat(e.target.value) || 0 })}
                min="0"
              />
              <Input
                type="color"
                value={selectedItem.style.border_color || '#000000'}
                onChange={(e) => updateStyle({ border_color: e.target.value })}
              />
              <Select
                value={selectedItem.style.border_style || 'solid'}
                onValueChange={(value: any) => updateStyle({ border_style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Border Radius (px)</Label>
            <Input
              type="number"
              value={selectedItem.style.border_radius || 0}
              onChange={(e) => updateStyle({ border_radius: parseFloat(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div>
            <Label className="text-xs">Opacity: {((selectedItem.style.opacity ?? 1) * 100).toFixed(0)}%</Label>
            <Slider
              value={[(selectedItem.style.opacity ?? 1) * 100]}
              onValueChange={([value]) => updateStyle({ opacity: value / 100 })}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </div>

        <Separator />

        {/* Padding */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Padding (mm)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="number"
                value={selectedItem.style.padding_top_mm || 0}
                onChange={(e) => updateStyle({ padding_top_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="number"
                value={selectedItem.style.padding_right_mm || 0}
                onChange={(e) => updateStyle({ padding_right_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="number"
                value={selectedItem.style.padding_bottom_mm || 0}
                onChange={(e) => updateStyle({ padding_bottom_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="number"
                value={selectedItem.style.padding_left_mm || 0}
                onChange={(e) => updateStyle({ padding_left_mm: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
