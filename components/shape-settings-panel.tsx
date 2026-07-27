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
import { useLanguage } from '@/hooks/use-language'

/** Tên hiển thị của từng loại hình, lấy từ từ điển */
function shapeTypeLabel(type: ShapeType, t: (k: string) => string): string {
  const map: Partial<Record<ShapeType, string>> = {
    rectangle: 'rectangle',
    ellipse: 'ellipse',
    line: 'lineShape',
    arrow: 'arrow',
    polygon: 'polygon',
    text: 'textElement',
    image: 'imageLabel',
    'data-card': 'dataCard',
    'mermaid-diagram': 'mermaidDiagram',
  }
  const key = map[type]
  return key ? t(key) : type
}

interface ShapeSettingsPanelProps {
  shape: Shape | null
  onUpdate: (updates: Partial<Shape>) => void
}

export function ShapeSettingsPanel({ shape, onUpdate }: ShapeSettingsPanelProps) {
  const { t } = useLanguage()

  if (!shape) {
    return (
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            {t("shapeSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Box className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("selectShapeToEdit")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // displayConfig là object lồng — phải merge chứ không ghi đè, nếu không
  // mỗi lần đổi một màu sẽ xoá sạch các thiết lập hiển thị còn lại.
  const updateDisplayConfig = (patch: Record<string, unknown>) => {
    const current = (shape as any).displayConfig || {}
    onUpdate({ displayConfig: { ...current, ...patch } } as Partial<Shape>)
  }

  const renderCommonSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("position")}</Label>
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
        <Label>{t("size")}</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{t("width")}</Label>
            <Input
              type="number"
              value={shape.width}
              onChange={(e) => onUpdate({ width: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">{t("height")}</Label>
            <Input
              type="number"
              value={shape.height}
              onChange={(e) => onUpdate({ height: parseFloat(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("rotation")}</Label>
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
        <Label>{t("opacity")}</Label>
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
          <Label>{t("fillColor")}</Label>
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
          <Label>{t("strokeColor")}</Label>
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
          <Label>{t("strokeWidth")}</Label>
          <Slider
            value={[shape.strokeWidth || 1]}
            onValueChange={([value]) => onUpdate({ strokeWidth: value })}
            min={0}
            max={20}
            step={0.5}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("cornerRadius")}</Label>
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
            <Label>{t("textContent")}</Label>
            <Input
              value={textShape.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter text..."
            />
          </div>

          <div className="space-y-2">
            <Label>{t("fontSize")}</Label>
            <Slider
              value={[textShape.fontSize || 16]}
              onValueChange={([value]) => onUpdate({ fontSize: value })}
              min={8}
              max={72}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("fontFamily")}</Label>
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
            <Label>{t("textColor")}</Label>
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
            <Label>{t('imageUrl')}</Label>
            <Input
              value={imageShape.src || ''}
              onChange={(e) => onUpdate({ src: e.target.value } as Partial<Shape>)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>{t("borderRadius")}</Label>
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
                    onUpdate({ src: e.target?.result as string } as Partial<Shape>)
                  }
                  reader.readAsDataURL(file)
                }
              }
              input.click()
            }}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {t("uploadImage")}
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
            <Label>{t("cardType")}</Label>
            <Select
              value={dataCard.dataType || 'task'}
              onValueChange={(value) => onUpdate({ dataType: value } as Partial<Shape>)}
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
            <Label>{t("entityId")}</Label>
            <Input
              value={dataCard.dataId || ''}
              onChange={(e) => onUpdate({ dataId: e.target.value } as Partial<Shape>)}
              placeholder="Select from list..."
            />
          </div>

          <div className="space-y-2">
            <Label>{t('backgroundColor')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={dataCard.displayConfig?.backgroundColor || '#ffffff'}
                onChange={(e) => updateDisplayConfig({ backgroundColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={dataCard.displayConfig?.backgroundColor || '#ffffff'}
                onChange={(e) => updateDisplayConfig({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("borderColor")}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={dataCard.displayConfig?.borderColor || '#e0e0e0'}
                onChange={(e) => updateDisplayConfig({ borderColor: e.target.value })}
                className="w-20"
              />
              <Input
                value={dataCard.displayConfig?.borderColor || '#e0e0e0'}
                onChange={(e) => updateDisplayConfig({ borderColor: e.target.value })}
                placeholder="#e0e0e0"
              />
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Select {dataCard.dataType || 'item'}
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
            <Label>{t("mermaidCode")}</Label>
            <textarea
              value={mermaidShape.code || ''}
              onChange={(e) => onUpdate({ code: e.target.value } as Partial<Shape>)}
              placeholder="graph TD\n  A[Start] --> B[End]"
              className="w-full h-32 p-2 border rounded-md font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("mermaidTheme")}</Label>
            <Select
              value={mermaidShape.theme || 'default'}
              onValueChange={(value) => onUpdate({ theme: value } as Partial<Shape>)}
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
    <Card className="h-full shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="text-sm flex items-center gap-2">
          {shape.type === 'rectangle' && <Box className="h-4 w-4 text-primary" />}
          {shape.type === 'ellipse' && <Box className="h-4 w-4 text-secondary" />}
          {shape.type === 'text' && <Type className="h-4 w-4 text-accent" />}
          {shape.type === 'image' && <ImageIcon className="h-4 w-4 text-success" />}
          {shape.type === 'data-card' && <FileText className="h-4 w-4 text-info" />}
          {shape.type === 'mermaid-diagram' && <FileText className="h-4 w-4 text-warning" />}
          {/* Ghép tên loại hình từ từ điển thay vì viết hoa chữ cái tiếng Anh */}
          <span className="font-semibold">{t('shapeSettings')}: {shapeTypeLabel(shape.type, t)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] p-6">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="properties" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="h-4 w-4 mr-2" />
              {t("propertiesTab")}
            </TabsTrigger>
            <TabsTrigger value="style" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Box className="h-4 w-4 mr-2" />
              {t("styleTab")}
            </TabsTrigger>
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
              <Label>{t("shadow")}</Label>
              <Slider
                value={[shape.shadow?.blur || 0]}
                onValueChange={([value]) =>
                  onUpdate({ shadow: { ...(shape.shadow || {}), blur: value } })
                }
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
