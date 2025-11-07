'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Box,
  ArrowRight,
  FileText,
  CheckSquare,
  FolderOpen,
  Users,
  StickyNote
} from 'lucide-react'
import { Shape, ShapeType } from '@/types/database'

interface ShapeSettingsPanelProps {
  shape: Shape | null
  onUpdate: (updates: Partial<Shape>) => void
}

export function ShapeSettingsPanel({ shape, onUpdate }: ShapeSettingsPanelProps) {
  if (!shape) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Shape Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Select a shape to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  const renderCommonSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={shape.x}
              onChange={(e) => onUpdate({ x: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={shape.y}
              onChange={(e) => onUpdate({ y: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Size</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={shape.width}
              onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={shape.height}
              onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rotation</Label>
        <div className="flex gap-2 items-center">
          <Slider
            value={[shape.rotation || 0]}
            onValueChange={([value]) => onUpdate({ rotation: value })}
            min={0}
            max={360}
            step={1}
            className="flex-1"
          />
          <Input
            type="number"
            value={shape.rotation || 0}
            onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) })}
            className="w-16"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Opacity</Label>
        <div className="flex gap-2 items-center">
          <Slider
            value={[shape.opacity !== undefined ? shape.opacity * 100 : 100]}
            onValueChange={([value]) => onUpdate({ opacity: value / 100 })}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-sm w-12">{Math.round((shape.opacity || 1) * 100)}%</span>
        </div>
      </div>
    </div>
  )

  const renderRectangleSettings = () => (
    <>
      {renderCommonSettings()}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Fill Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={shape.fill || '#000000'}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="w-20"
            />
            <Input
              value={shape.fill || '#000000'}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Stroke Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={shape.stroke || '#000000'}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              className="w-20"
            />
            <Input
              value={shape.stroke || '#000000'}
              onChange={(e) => onUpdate({ stroke: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Stroke Width</Label>
          <Slider
            value={[shape.strokeWidth || 1]}
            onValueChange={([value]) => onUpdate({ strokeWidth: value })}
            min={0}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label>Corner Radius</Label>
          <Slider
            value={[shape.cornerRadius || 0]}
            onValueChange={([value]) => onUpdate({ cornerRadius: value })}
            min={0}
            max={50}
            step={1}
          />
        </div>
      </div>
    </>
  )

  const renderTextSettings = () => {
    const textShape = shape as any
    return (
      <>
        {renderCommonSettings()}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Input
              value={textShape.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Slider
              value={[textShape.fontSize || 16]}
              onValueChange={([value]) => onUpdate({ fontSize: value })}
              min={8}
              max={72}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={textShape.fontFamily || 'Arial'}
              onValueChange={(value) => onUpdate({ fontFamily: value })}
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

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={textShape.fill || '#000000'}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                className="w-20"
              />
              <Input
                value={textShape.fill || '#000000'}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select
              value={textShape.align || 'left'}
              onValueChange={(value) => onUpdate({ align: value as 'left' | 'center' | 'right' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </>
    )
  }

  const renderImageSettings = () => {
    const imageShape = shape as any
    return (
      <>
        {renderCommonSettings()}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={imageShape.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Slider
              value={[imageShape.cornerRadius || 0]}
              onValueChange={([value]) => onUpdate({ cornerRadius: value })}
              min={0}
              max={50}
              step={1}
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    onUpdate({ imageUrl: e.target?.result as string })
                  }
                  reader.readAsDataURL(file)
                }
              }
              input.click()
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </>
    )
  }

  const renderDataCardSettings = () => {
    const dataCard = shape as any
    return (
      <>
        {renderCommonSettings()}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Card Type</Label>
            <Select
              value={dataCard.cardType || 'task'}
              onValueChange={(value) => onUpdate({ cardType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Task
                  </div>
                </SelectItem>
                <SelectItem value="project">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Project
                  </div>
                </SelectItem>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Account
                  </div>
                </SelectItem>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Note
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entity ID</Label>
            <Input
              value={dataCard.entityId || ''}
              onChange={(e) => onUpdate({ entityId: e.target.value })}
              placeholder="Select from list..."
            />
          </div>

          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={dataCard.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={dataCard.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={dataCard.borderColor || '#e0e0e0'}
                onChange={(e) => onUpdate({ borderColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={dataCard.borderColor || '#e0e0e0'}
                onChange={(e) => onUpdate({ borderColor: e.target.value })}
                placeholder="#e0e0e0"
              />
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Select {dataCard.cardType || 'item'}
          </Button>
        </div>
      </>
    )
  }

  const renderMermaidSettings = () => {
    const mermaidShape = shape as any
    return (
      <>
        {renderCommonSettings()}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Mermaid Code</Label>
            <textarea
              value={mermaidShape.mermaidCode || ''}
              onChange={(e) => onUpdate({ mermaidCode: e.target.value })}
              placeholder="graph TD\n  A[Start] --> B[End]"
              className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={mermaidShape.theme || 'default'}
              onValueChange={(value) => onUpdate({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Render Diagram
          </Button>
        </div>
      </>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {shape.type === 'rectangle' && <Box className="h-4 w-4" />}
          {shape.type === 'ellipse' && <Box className="h-4 w-4" />}
          {shape.type === 'text' && <Type className="h-4 w-4" />}
          {shape.type === 'image' && <ImageIcon className="h-4 w-4" />}
          {shape.type === 'data-card' && <FileText className="h-4 w-4" />}
          {shape.type === 'mermaid-diagram' && <FileText className="h-4 w-4" />}
          {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="space-y-4">
            {shape.type === 'rectangle' && renderRectangleSettings()}
            {shape.type === 'ellipse' && renderRectangleSettings()}
            {shape.type === 'text' && renderTextSettings()}
            {shape.type === 'image' && renderImageSettings()}
            {shape.type === 'data-card' && renderDataCardSettings()}
            {shape.type === 'mermaid-diagram' && renderMermaidSettings()}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Shadow</Label>
              <Slider
                value={[shape.shadowBlur || 0]}
                onValueChange={([value]) => onUpdate({ shadowBlur: value })}
                min={0}
                max={50}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Z-Index</Label>
              <Input
                type="number"
                value={shape.zIndex || 0}
                onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ShapeSettingsPanel
