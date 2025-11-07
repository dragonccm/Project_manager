'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  ChevronRight,
  ChevronDown,
  Settings,
  Palette,
  Type,
  Box,
  Layout
} from 'lucide-react'

interface Shape {
  id: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  [key: string]: any
}

interface DynamicSettingsPanelProps {
  selectedShapes: Shape[]
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  onUpdateMultiple: (ids: string[], updates: Partial<Shape>) => void
}

/**
 * DynamicSettingsPanel - Panel bên phải động dựa trên selection
 * 
 * Features:
 * - Auto-update khi selection thay đổi
 * - Multi-edit cho nhiều shapes
 * - Collapsible sections
 * - Tabbed interface
 * - Live preview
 */
export default function DynamicSettingsPanel({
  selectedShapes,
  onUpdateShape,
  onUpdateMultiple
}: DynamicSettingsPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['position', 'size', 'style'])
  )

  const selectedCount = selectedShapes.length
  const firstShape = selectedShapes[0]
  const allSameType = selectedShapes.every(s => s.type === firstShape?.type)

  // Toggle section
  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  // Update single or multiple shapes
  const handleUpdate = (updates: Partial<Shape>) => {
    if (selectedCount === 1) {
      onUpdateShape(firstShape.id, updates)
    } else {
      const ids = selectedShapes.map(s => s.id)
      onUpdateMultiple(ids, updates)
    }
  }

  // No selection state
  if (selectedCount === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Settings className="h-12 w-12 mb-4 opacity-50" />
            <p>No shape selected</p>
            <p className="text-sm">Select a shape to edit properties</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get common values (for multi-select)
  const getCommonValue = (key: string): any => {
    if (selectedCount === 1) return firstShape[key]
    
    const firstValue = firstShape[key]
    const allSame = selectedShapes.every(s => s[key] === firstValue)
    return allSame ? firstValue : undefined
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Properties
          {selectedCount > 1 && (
            <span className="text-xs text-muted-foreground">
              ({selectedCount} selected)
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-1">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties" className="space-y-2 mt-4">
              {/* Position Section */}
              <Collapsible
                open={openSections.has('position')}
                onOpenChange={() => toggleSection('position')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 py-1 h-auto"
                  >
                    {openSections.has('position') ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <Layout className="h-4 w-4 mr-2" />
                    Position
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="x" className="text-xs">X</Label>
                      <Input
                        id="x"
                        type="number"
                        value={getCommonValue('x') ?? ''}
                        onChange={e => handleUpdate({ x: Number(e.target.value) })}
                        className="h-8"
                        placeholder={selectedCount > 1 ? 'Mixed' : ''}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="y" className="text-xs">Y</Label>
                      <Input
                        id="y"
                        type="number"
                        value={getCommonValue('y') ?? ''}
                        onChange={e => handleUpdate({ y: Number(e.target.value) })}
                        className="h-8"
                        placeholder={selectedCount > 1 ? 'Mixed' : ''}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="rotation" className="text-xs">Rotation</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rotation"
                        type="number"
                        value={getCommonValue('rotation') ?? 0}
                        onChange={e => handleUpdate({ rotation: Number(e.target.value) })}
                        className="h-8"
                        min={-180}
                        max={180}
                      />
                      <span className="text-xs text-muted-foreground">°</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Size Section */}
              <Collapsible
                open={openSections.has('size')}
                onOpenChange={() => toggleSection('size')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 py-1 h-auto"
                  >
                    {openSections.has('size') ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <Box className="h-4 w-4 mr-2" />
                    Size
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 py-2 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="width" className="text-xs">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={getCommonValue('width') ?? ''}
                        onChange={e => handleUpdate({ width: Number(e.target.value) })}
                        className="h-8"
                        placeholder={selectedCount > 1 ? 'Mixed' : ''}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="height" className="text-xs">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        value={getCommonValue('height') ?? ''}
                        onChange={e => handleUpdate({ height: Number(e.target.value) })}
                        className="h-8"
                        placeholder={selectedCount > 1 ? 'Mixed' : ''}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />

              {/* Text Section (only for text shapes) */}
              {allSameType && firstShape.type === 'text' && (
                <>
                  <Collapsible
                    open={openSections.has('text')}
                    onOpenChange={() => toggleSection('text')}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start px-2 py-1 h-auto"
                      >
                        {openSections.has('text') ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <Type className="h-4 w-4 mr-2" />
                        Text
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 py-2 space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="text" className="text-xs">Content</Label>
                        <Input
                          id="text"
                          value={getCommonValue('text') ?? ''}
                          onChange={e => handleUpdate({ text: e.target.value })}
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          value={getCommonValue('fontSize') ?? 16}
                          onChange={e => handleUpdate({ fontSize: Number(e.target.value) })}
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="fontFamily" className="text-xs">Font Family</Label>
                        <Input
                          id="fontFamily"
                          value={getCommonValue('fontFamily') ?? 'Arial'}
                          onChange={e => handleUpdate({ fontFamily: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  <Separator />
                </>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-2 mt-4">
              {/* Fill/Stroke Section */}
              <Collapsible
                open={openSections.has('style')}
                onOpenChange={() => toggleSection('style')}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 py-1 h-auto"
                  >
                    {openSections.has('style') ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    <Palette className="h-4 w-4 mr-2" />
                    Colors
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 py-2 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="fill" className="text-xs">Fill</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="fill"
                        type="color"
                        value={getCommonValue('fill') ?? '#000000'}
                        onChange={e => handleUpdate({ fill: e.target.value })}
                        className="h-8 w-16"
                      />
                      <Input
                        value={getCommonValue('fill') ?? '#000000'}
                        onChange={e => handleUpdate({ fill: e.target.value })}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="stroke" className="text-xs">Stroke</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="stroke"
                        type="color"
                        value={getCommonValue('stroke') ?? '#000000'}
                        onChange={e => handleUpdate({ stroke: e.target.value })}
                        className="h-8 w-16"
                      />
                      <Input
                        value={getCommonValue('stroke') ?? '#000000'}
                        onChange={e => handleUpdate({ stroke: e.target.value })}
                        className="h-8 flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="strokeWidth" className="text-xs">Stroke Width</Label>
                    <Input
                      id="strokeWidth"
                      type="number"
                      value={getCommonValue('strokeWidth') ?? 1}
                      onChange={e => handleUpdate({ strokeWidth: Number(e.target.value) })}
                      className="h-8"
                      min={0}
                      max={20}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>
          </Tabs>

          {/* Multi-select info */}
          {selectedCount > 1 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Editing {selectedCount} shapes
                {!allSameType && (
                  <span className="block mt-1">
                    (Mixed types - some properties may not apply)
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
