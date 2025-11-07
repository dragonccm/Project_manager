'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Circle, Line, Text, Image, Transformer, Arrow, RegularPolygon, Group } from 'react-konva'
import Konva from 'konva'
import { 
  CanvasSettings, 
  Shape, 
  BaseShape,
  TextShape,
  ImageShape,
  LineShape,
  ArrowShape,
  PolygonShape,
  DataCard,
  DataCardType,
  MermaidDiagram,
  ShapeType 
} from '@/types/database'
import { 
  Save, 
  Download, 
  Maximize2, 
  Minimize2, 
  Grid3x3, 
  Layers, 
  Copy, 
  Trash2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layout,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import ShapeSettingsPanel from '@/components/shape-settings-panel'
import DraggableShapeItem from '@/components/draggable-shape-item'
import DataCardRenderer from '@/components/data-card-renderer'
import EntitySelectorDialog from '@/components/entity-selector-dialog'
import MermaidEditorDialog from '@/components/mermaid-editor-dialog'

interface A4EditorProps {
  templateId?: string
  onSave?: (templateData: any) => void
  initialData?: {
    canvasSettings?: Partial<CanvasSettings>
    shapes?: Shape[]
  }
}

export default function A4Editor({ templateId, onSave, initialData }: A4EditorProps) {
  const { toast } = useToast()
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  
  // Canvas state
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    mode: initialData?.canvasSettings?.mode || 'a4',
    width: initialData?.canvasSettings?.width || 794,
    height: initialData?.canvasSettings?.height || 1123,
    backgroundColor: initialData?.canvasSettings?.backgroundColor || '#ffffff',
    gridEnabled: initialData?.canvasSettings?.gridEnabled !== false,
    gridSize: initialData?.canvasSettings?.gridSize || 20,
    gridColor: initialData?.canvasSettings?.gridColor || '#e0e0e0',
    snapToGrid: initialData?.canvasSettings?.snapToGrid !== false,
    snapTolerance: initialData?.canvasSettings?.snapTolerance || 5,
    padding: initialData?.canvasSettings?.padding || 40,
    autoExpand: initialData?.canvasSettings?.autoExpand || false
  })
  
  const [shapes, setShapes] = useState<Shape[]>(initialData?.shapes || [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [history, setHistory] = useState<Shape[][]>([])
  const [historyStep, setHistoryStep] = useState(0)
  
  // Tool state
  const [activeTool, setActiveTool] = useState<ShapeType | 'select'>('select')
  const [isDrawing, setIsDrawing] = useState(false)
  
  // Dialog states
  const [entitySelectorOpen, setEntitySelectorOpen] = useState(false)
  const [mermaidEditorOpen, setMermaidEditorOpen] = useState(false)
  const [pendingShapeId, setPendingShapeId] = useState<string | null>(null)
  
  // Image cache for Image shapes
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  
  // Connection state for lines/arrows
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<{ shapeId: string; point: 'start' | 'end' } | null>(null)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case 'c':
            if (selectedId) {
              e.preventDefault()
              handleCopy()
            }
            break
          case 'd':
            if (selectedId) {
              e.preventDefault()
              handleDuplicate()
            }
            break
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedId) {
              e.preventDefault()
              handleDelete()
            }
            break
          case 'Escape':
            setSelectedId(null)
            setActiveTool('select')
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, historyStep])
  
  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
      const stage = stageRef.current
      const selectedNode = stage.findOne('#' + selectedId)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer()?.batchDraw()
      }
    }
  }, [selectedId])
  
  // Canvas mode toggle
  const toggleCanvasMode = () => {
    setCanvasSettings(prev => ({
      ...prev,
      mode: prev.mode === 'a4' ? 'flexible' : 'a4',
      autoExpand: prev.mode === 'a4'
    }))
  }
  
  // Grid toggle
  const toggleGrid = () => {
    setCanvasSettings(prev => ({
      ...prev,
      gridEnabled: !prev.gridEnabled
    }))
  }
  
  // Snap to grid toggle
  const toggleSnapToGrid = () => {
    setCanvasSettings(prev => ({
      ...prev,
      snapToGrid: !prev.snapToGrid
    }))
  }
  
  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3))
  }
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1))
  }
  
  // History management
  const saveToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newShapes)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }
  
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1)
      setShapes(history[historyStep - 1])
    }
  }
  
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1)
      setShapes(history[historyStep + 1])
    }
  }
  
  // Shape operations
  const addShape = (type: ShapeType) => {
    const newShape: BaseShape = {
      id: `shape-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
      draggable: true,
      zIndex: shapes.length
    }
    
    const updatedShapes = [...shapes, newShape]
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedId(newShape.id)
    setActiveTool('select')
  }
  
  const handleDelete = () => {
    if (!selectedId) return
    
    const updatedShapes = shapes.filter(s => s.id !== selectedId)
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedId(null)
  }
  
  const handleCopy = () => {
    if (!selectedId) return
    
    const shapeToCopy = shapes.find(s => s.id === selectedId)
    if (shapeToCopy) {
      localStorage.setItem('copiedShape', JSON.stringify(shapeToCopy))
      toast({
        title: "Shape copied",
        description: "Use Ctrl+V to paste"
      })
    }
  }
  
  const handleDuplicate = () => {
    if (!selectedId) return
    
    const shapeToDuplicate = shapes.find(s => s.id === selectedId)
    if (shapeToDuplicate) {
      const newShape = {
        ...shapeToDuplicate,
        id: `shape-${Date.now()}`,
        x: shapeToDuplicate.x + 20,
        y: shapeToDuplicate.y + 20
      }
      
      const updatedShapes = [...shapes, newShape]
      setShapes(updatedShapes)
      saveToHistory(updatedShapes)
      setSelectedId(newShape.id)
    }
  }
  
  // Update shape handler for settings panel
  const handleUpdateShape = (shapeId: string, updates: Partial<Shape>) => {
    const updatedShapes = shapes.map(shape => 
      shape.id === shapeId ? { ...shape, ...updates } : shape
    )
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
  }
  
  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const shapeType = e.dataTransfer.getData('shapeType') as ShapeType
    
    if (!shapeType) return
    
    // Get drop position relative to stage
    const stage = stageRef.current
    if (!stage) return
    
    const stageBox = stage.container().getBoundingClientRect()
    const x = (e.clientX - stageBox.left) / zoom
    const y = (e.clientY - stageBox.top) / zoom
    
    addShapeAtPosition(shapeType, x, y)
  }
  
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  
  const addShapeAtPosition = (type: ShapeType, x: number, y: number) => {
    let newShape: Shape
    
    const baseProps = {
      id: `shape-${Date.now()}`,
      type,
      x,
      y,
      draggable: true,
      zIndex: shapes.length
    }
    
    // Create shape based on type with proper properties
    switch (type) {
      case 'text':
        newShape = {
          ...baseProps,
          type: 'text',
          text: 'New Text',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000',
          width: 200,
          height: 50
        } as TextShape
        break
        
      case 'image':
        newShape = {
          ...baseProps,
          type: 'image',
          src: 'https://via.placeholder.com/150',
          width: 150,
          height: 150
        } as ImageShape
        break
        
      case 'line':
        newShape = {
          ...baseProps,
          type: 'line',
          points: [0, 0, 100, 0],
          stroke: '#000000',
          strokeWidth: 2,
          width: 100,
          height: 2
        } as LineShape
        break
        
      case 'arrow':
        newShape = {
          ...baseProps,
          type: 'arrow',
          points: [0, 0, 100, 0],
          pointerLength: 10,
          pointerWidth: 10,
          stroke: '#000000',
          strokeWidth: 2,
          width: 100,
          height: 2
        } as ArrowShape
        break
        
      case 'polygon':
        // Create pentagon points
        const pentagonPoints: number[] = []
        const sides = 5
        const radius = 50
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
          pentagonPoints.push(radius + radius * Math.cos(angle))
          pentagonPoints.push(radius + radius * Math.sin(angle))
        }
        
        newShape = {
          ...baseProps,
          type: 'polygon',
          points: pentagonPoints,
          closed: true,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2,
          width: radius * 2,
          height: radius * 2
        } as PolygonShape
        break
        
      case 'data-card':
        newShape = {
          ...baseProps,
          type: 'data-card',
          dataType: 'note',
          dataId: '',
          width: 300,
          height: 200,
          displayConfig: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            showIcon: true,
            compact: false
          }
        } as DataCard
        
        // Add shape first, then open selector
        const updatedShapesData = [...shapes, newShape]
        setShapes(updatedShapesData)
        saveToHistory(updatedShapesData)
        setSelectedId(newShape.id)
        setPendingShapeId(newShape.id)
        setEntitySelectorOpen(true)
        setActiveTool('select')
        return
        
      case 'mermaid-diagram':
        newShape = {
          ...baseProps,
          type: 'mermaid-diagram',
          code: 'graph TD\n    A[Start] --> B[End]',
          width: 400,
          height: 300
        } as MermaidDiagram
        
        // Add shape first, then open editor
        const updatedShapesMermaid = [...shapes, newShape]
        setShapes(updatedShapesMermaid)
        saveToHistory(updatedShapesMermaid)
        setSelectedId(newShape.id)
        setPendingShapeId(newShape.id)
        setMermaidEditorOpen(true)
        setActiveTool('select')
        return
        
      default:
        // Rectangle, ellipse and other basic shapes
        newShape = {
          ...baseProps,
          width: 100,
          height: 100,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 2
        } as BaseShape
    }
    
    const updatedShapes = [...shapes, newShape]
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedId(newShape.id)
    setActiveTool('select')
  }
  
  // Handle entity selection for data card
  const handleEntitySelect = (entityType: DataCardType, entityId: string, entityName: string) => {
    if (!pendingShapeId) return
    
    const updatedShapes = shapes.map(shape => {
      if (shape.id === pendingShapeId && shape.type === 'data-card') {
        return {
          ...shape,
          dataType: entityType,
          dataId: entityId
        } as DataCard
      }
      return shape
    })
    
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setPendingShapeId(null)
    
    toast({
      title: "Entity Linked",
      description: `Data card linked to ${entityType}: ${entityName}`
    })
  }
  
  // Handle mermaid code save
  const handleMermaidSave = (code: string, theme: string) => {
    if (!pendingShapeId) return
    
    const updatedShapes = shapes.map(shape => {
      if (shape.id === pendingShapeId && shape.type === 'mermaid-diagram') {
        return {
          ...shape,
          code
        } as MermaidDiagram
      }
      return shape
    })
    
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setPendingShapeId(null)
  }
  
  const handleSave = async () => {
    const templateData = {
      canvasSettings,
      shapes
    }
    
    if (onSave) {
      onSave(templateData)
    }
    
    toast({
      title: "Template saved",
      description: "Your design has been saved successfully"
    })
  }
  
  const handleExportPDF = async () => {
    toast({
      title: "Exporting PDF",
      description: "This feature is coming soon..."
    })
  }
  
  const handleExportPNG = async () => {
    if (!stageRef.current) return
    
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'design.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Exported PNG",
      description: "Your design has been exported as PNG"
    })
  }
  
  // Render grid
  const renderGrid = () => {
    if (!canvasSettings.gridEnabled) return null
    
    const lines = []
    const { width, height, gridSize, gridColor } = canvasSettings
    
    // Vertical lines
    for (let i = 0; i < width / gridSize!; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize!, 0, i * gridSize!, height]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      )
    }
    
    // Horizontal lines
    for (let i = 0; i < height / gridSize!; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize!, width, i * gridSize!]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      )
    }
    
    return lines
  }

  return (
    <div className={`flex h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Left Toolbar */}
      <Card className="w-64 rounded-none border-r">
        <CardContent className="p-4 space-y-4 h-full overflow-y-auto">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Basic Shapes</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="rectangle" label="Rectangle" icon={<></>} />
                  <DraggableShapeItem type="ellipse" label="Ellipse" icon={<></>} />
                  <DraggableShapeItem type="line" label="Line" icon={<></>} />
                  <DraggableShapeItem type="arrow" label="Arrow" icon={<></>} />
                  <DraggableShapeItem type="polygon" label="Polygon" icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Text & Media</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="text" label="Text" icon={<></>} />
                  <DraggableShapeItem type="image" label="Image" icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Data & Diagrams</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="data-card" label="Data Card" icon={<></>} />
                  <DraggableShapeItem type="mermaid-diagram" label="Mermaid Diagram" icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!selectedId}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={!selectedId}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedId}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyStep === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyStep >= history.length - 1}
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Redo
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Canvas Mode</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCanvasMode}
                  className="w-full"
                >
                  <Layout className="w-4 h-4 mr-2" />
                  {canvasSettings.mode === 'a4' ? 'Fixed A4' : 'Flexible'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Show Grid</Label>
                <Switch
                  checked={canvasSettings.gridEnabled}
                  onCheckedChange={toggleGrid}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Snap to Grid</Label>
                <Switch
                  checked={canvasSettings.snapToGrid}
                  onCheckedChange={toggleSnapToGrid}
                />
              </div>
              
              {canvasSettings.gridEnabled && (
                <div className="space-y-2">
                  <Label>Grid Size: {canvasSettings.gridSize}px</Label>
                  <Slider
                    value={[canvasSettings.gridSize || 20]}
                    onValueChange={(value) => setCanvasSettings(prev => ({ ...prev, gridSize: value[0] }))}
                    min={10}
                    max={50}
                    step={5}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={canvasSettings.backgroundColor}
                  onChange={(e) => setCanvasSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="layers" className="space-y-2 mt-4">
              <div className="space-y-1">
                {shapes.map((shape, index) => (
                  <div
                    key={shape.id}
                    className={`p-2 rounded cursor-pointer hover:bg-accent ${
                      selectedId === shape.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedId(shape.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{shape.type} - {shape.id.slice(-6)}</span>
                      <div className="flex gap-1">
                        {shape.visible !== false ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                        {shape.locked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Top Toolbar */}
        <div className="bg-background border-b p-2 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-1" />
            Export PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPNG}>
            <Download className="w-4 h-4 mr-1" />
            Export PNG
          </Button>
          
          <div className="flex-1" />
          
          <Button size="sm" variant="outline" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button size="sm" variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
          <div 
            className="shadow-lg" 
            style={{ 
              background: canvasSettings.backgroundColor,
              width: canvasSettings.width * zoom,
              height: canvasSettings.height * zoom
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            <Stage
              ref={stageRef}
              width={canvasSettings.width}
              height={canvasSettings.height}
              scaleX={zoom}
              scaleY={zoom}
              onClick={(e) => {
                // Deselect when clicking on empty area
                if (e.target === e.target.getStage()) {
                  setSelectedId(null)
                }
              }}
            >
              <Layer>
                {/* Grid */}
                {renderGrid()}
                
                {/* Shapes */}
                {shapes.map((shape) => {
                  // Rectangle
                  if (shape.type === 'rectangle') {
                    return (
                      <Rect
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={() => setSelectedId(shape.id)}
                        onTap={() => setSelectedId(shape.id)}
                      />
                    )
                  }
                  
                  // Ellipse
                  if (shape.type === 'ellipse') {
                    const avgRadius = ((shape.width || 100) + (shape.height || 100)) / 4
                    return (
                      <Circle
                        key={shape.id}
                        id={shape.id}
                        x={shape.x + (shape.width || 0) / 2}
                        y={shape.y + (shape.height || 0) / 2}
                        radius={avgRadius}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={() => setSelectedId(shape.id)}
                        onTap={() => setSelectedId(shape.id)}
                      />
                    )
                  }
                  
                  // Text
                  if (shape.type === 'text') {
                    const textShape = shape as TextShape
                    return (
                      <Text
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        text={textShape.text || 'Text'}
                        fontSize={textShape.fontSize || 16}
                        fontFamily={textShape.fontFamily || 'Arial'}
                        fill={textShape.fill || '#000000'}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={() => setSelectedId(shape.id)}
                        onTap={() => setSelectedId(shape.id)}
                      />
                    )
                  }
                  
                  // Line
                  if (shape.type === 'line') {
                    const lineShape = shape as LineShape
                    const points = lineShape.points || [0, 0, 100, 0]
                    const isSelected = selectedId === shape.id
                    
                    return (
                      <React.Fragment key={shape.id}>
                        <Line
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          points={points}
                          stroke={lineShape.stroke || '#000000'}
                          strokeWidth={lineShape.strokeWidth || 2}
                          draggable={shape.draggable}
                          rotation={shape.rotation}
                          onClick={() => setSelectedId(shape.id)}
                          onTap={() => setSelectedId(shape.id)}
                        />
                        {/* Connection points when selected */}
                        {isSelected && (
                          <>
                            {/* Start point */}
                            <Circle
                              x={shape.x + points[0]}
                              y={shape.y + points[1]}
                              radius={6}
                              fill="#3b82f6"
                              stroke="#ffffff"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) => {
                                const newPoints = [...points]
                                newPoints[0] = e.target.x() - shape.x
                                newPoints[1] = e.target.y() - shape.y
                                handleUpdateShape(shape.id, { points: newPoints })
                              }}
                            />
                            {/* End point */}
                            <Circle
                              x={shape.x + points[2]}
                              y={shape.y + points[3]}
                              radius={6}
                              fill="#3b82f6"
                              stroke="#ffffff"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) => {
                                const newPoints = [...points]
                                newPoints[2] = e.target.x() - shape.x
                                newPoints[3] = e.target.y() - shape.y
                                handleUpdateShape(shape.id, { points: newPoints })
                              }}
                            />
                          </>
                        )}
                      </React.Fragment>
                    )
                  }
                  
                  // Arrow
                  if (shape.type === 'arrow') {
                    const arrowShape = shape as ArrowShape
                    const points = arrowShape.points || [0, 0, 100, 0]
                    const isSelected = selectedId === shape.id
                    
                    return (
                      <React.Fragment key={shape.id}>
                        <Arrow
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          points={points}
                          pointerLength={arrowShape.pointerLength || 10}
                          pointerWidth={arrowShape.pointerWidth || 10}
                          stroke={arrowShape.stroke || '#000000'}
                          strokeWidth={arrowShape.strokeWidth || 2}
                          fill={arrowShape.stroke || '#000000'}
                          draggable={shape.draggable}
                          rotation={shape.rotation}
                          onClick={() => setSelectedId(shape.id)}
                          onTap={() => setSelectedId(shape.id)}
                        />
                        {/* Connection points when selected */}
                        {isSelected && (
                          <>
                            {/* Start point */}
                            <Circle
                              x={shape.x + points[0]}
                              y={shape.y + points[1]}
                              radius={6}
                              fill="#10b981"
                              stroke="#ffffff"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) => {
                                const newPoints = [...points]
                                newPoints[0] = e.target.x() - shape.x
                                newPoints[1] = e.target.y() - shape.y
                                handleUpdateShape(shape.id, { points: newPoints })
                              }}
                            />
                            {/* End point (with arrow) */}
                            <Circle
                              x={shape.x + points[2]}
                              y={shape.y + points[3]}
                              radius={6}
                              fill="#ef4444"
                              stroke="#ffffff"
                              strokeWidth={2}
                              draggable
                              onDragMove={(e) => {
                                const newPoints = [...points]
                                newPoints[2] = e.target.x() - shape.x
                                newPoints[3] = e.target.y() - shape.y
                                handleUpdateShape(shape.id, { points: newPoints })
                              }}
                            />
                          </>
                        )}
                      </React.Fragment>
                    )
                  }
                  
                  // Polygon
                  if (shape.type === 'polygon') {
                    const polygonShape = shape as PolygonShape
                    return (
                      <Line
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        points={polygonShape.points || []}
                        closed={polygonShape.closed !== false}
                        fill={shape.fill}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={() => setSelectedId(shape.id)}
                        onTap={() => setSelectedId(shape.id)}
                      />
                    )
                  }
                  
                  // Image
                  if (shape.type === 'image') {
                    const imageShape = shape as ImageShape
                    const imageSrc = imageShape.src || 'https://via.placeholder.com/150'
                    
                    // Get or create cached image
                    let imageObj = imageCache.current.get(imageSrc)
                    if (!imageObj) {
                      imageObj = new window.Image()
                      imageObj.crossOrigin = 'anonymous'
                      imageObj.src = imageSrc
                      imageCache.current.set(imageSrc, imageObj)
                      
                      // Force re-render when image loads
                      imageObj.onload = () => {
                        setShapes([...shapes])
                      }
                      
                      imageObj.onerror = () => {
                        console.error('Failed to load image:', imageSrc)
                        // Use a placeholder on error
                        imageObj!.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4='
                      }
                    }
                    
                    // Only render if image is complete or has started loading
                    if (!imageObj.complete) {
                      // Render placeholder while loading
                      return (
                        <Group
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          draggable={shape.draggable}
                          rotation={shape.rotation}
                          onClick={() => setSelectedId(shape.id)}
                          onTap={() => setSelectedId(shape.id)}
                        >
                          <Rect
                            width={shape.width}
                            height={shape.height}
                            fill="#f3f4f6"
                            stroke="#d1d5db"
                            strokeWidth={1}
                          />
                          <Text
                            x={(shape.width || 150) / 2}
                            y={(shape.height || 150) / 2}
                            text="Loading..."
                            fontSize={12}
                            fill="#9ca3af"
                            align="center"
                            offsetX={30}
                            offsetY={6}
                          />
                        </Group>
                      )
                    }
                    
                    return (
                      <Image
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        image={imageObj}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={() => setSelectedId(shape.id)}
                        onTap={() => setSelectedId(shape.id)}
                      />
                    )
                  }
                  
                  // Data Card - rendered as HTML overlay
                  if (shape.type === 'data-card') {
                    const dataCard = shape as DataCard
                    
                    // Get icon and color based on data type
                    const getCardStyle = (type: DataCardType) => {
                      switch(type) {
                        case 'task':
                          return { icon: '☑', color: '#3b82f6', bgColor: '#dbeafe' }
                        case 'project':
                          return { icon: '📁', color: '#8b5cf6', bgColor: '#ede9fe' }
                        case 'account':
                          return { icon: '👤', color: '#10b981', bgColor: '#d1fae5' }
                        case 'note':
                          return { icon: '📝', color: '#f59e0b', bgColor: '#fef3c7' }
                        default:
                          return { icon: '📄', color: '#6b7280', bgColor: '#f3f4f6' }
                      }
                    }
                    
                    const style = getCardStyle(dataCard.dataType)
                    
                    const handleCardClick = () => {
                      setSelectedId(shape.id)
                      // Nếu chưa có dataId, mở entity selector
                      if (!dataCard.dataId) {
                        setPendingShapeId(shape.id)
                        setEntitySelectorOpen(true)
                      }
                    }
                    
                    return (
                      <Group
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={handleCardClick}
                        onTap={handleCardClick}
                      >
                        {/* Background */}
                        <Rect
                          width={shape.width}
                          height={shape.height}
                          fill={dataCard.displayConfig?.backgroundColor || style.bgColor}
                          stroke={dataCard.displayConfig?.borderColor || style.color}
                          strokeWidth={2}
                          cornerRadius={dataCard.displayConfig?.borderRadius || 8}
                          shadowColor="rgba(0,0,0,0.1)"
                          shadowBlur={10}
                          shadowOffsetY={2}
                        />
                        
                        {/* Header with icon */}
                        <Rect
                          width={shape.width}
                          height={40}
                          fill={style.color}
                          cornerRadius={[8, 8, 0, 0]}
                          opacity={0.1}
                        />
                        
                        {/* Icon */}
                        <Text
                          x={12}
                          y={8}
                          text={style.icon}
                          fontSize={24}
                        />
                        
                        {/* Type Label */}
                        <Text
                          x={45}
                          y={12}
                          text={dataCard.dataType.toUpperCase()}
                          fontSize={14}
                          fontFamily="Arial"
                          fontStyle="bold"
                          fill={style.color}
                        />
                        
                        {/* ID or "Not linked" */}
                        <Text
                          x={12}
                          y={50}
                          text={dataCard.dataId ? `ID: ${dataCard.dataId.substring(0, 12)}...` : '⚠ Not linked - Click to select'}
                          fontSize={11}
                          fontFamily="Arial"
                          fill={dataCard.dataId ? '#374151' : '#dc2626'}
                          width={(shape.width || 300) - 24}
                          wrap="word"
                        />
                        
                        {/* Status indicator */}
                        {!dataCard.dataId && (
                          <Rect
                            x={12}
                            y={80}
                            width={(shape.width || 300) - 24}
                            height={30}
                            fill="#fef2f2"
                            stroke="#fca5a5"
                            strokeWidth={1}
                            cornerRadius={4}
                          />
                        )}
                        {!dataCard.dataId && (
                          <Text
                            x={(shape.width || 300) / 2}
                            y={88}
                            text="Click card to link entity"
                            fontSize={10}
                            fontFamily="Arial"
                            fill="#dc2626"
                            align="center"
                            width={(shape.width || 300) - 24}
                          />
                        )}
                      </Group>
                    )
                  }
                  
                  // Mermaid Diagram - rendered as placeholder
                  if (shape.type === 'mermaid-diagram') {
                    const mermaidShape = shape as MermaidDiagram
                    const codeLines = (mermaidShape.code || '').split('\n').filter(l => l.trim())
                    
                    // Get diagram type from code
                    const diagramType = codeLines[0]?.trim().toLowerCase() || 'graph'
                    const getTypeInfo = (type: string) => {
                      if (type.includes('graph') || type.includes('flowchart')) 
                        return { icon: '🔀', name: 'Flowchart', color: '#3b82f6' }
                      if (type.includes('sequence')) 
                        return { icon: '↔️', name: 'Sequence', color: '#8b5cf6' }
                      if (type.includes('class')) 
                        return { icon: '📦', name: 'Class', color: '#10b981' }
                      if (type.includes('state')) 
                        return { icon: '🔄', name: 'State', color: '#f59e0b' }
                      if (type.includes('er')) 
                        return { icon: '🗃️', name: 'ER Diagram', color: '#ef4444' }
                      if (type.includes('gantt')) 
                        return { icon: '📊', name: 'Gantt', color: '#ec4899' }
                      return { icon: '📋', name: 'Diagram', color: '#6b7280' }
                    }
                    
                    const typeInfo = getTypeInfo(diagramType)
                    
                    const handleMermaidClick = () => {
                      setSelectedId(shape.id)
                      // Mở editor để chỉnh sửa code
                      setPendingShapeId(shape.id)
                      setMermaidEditorOpen(true)
                    }
                    
                    return (
                      <Group
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        draggable={shape.draggable}
                        rotation={shape.rotation}
                        onClick={handleMermaidClick}
                        onTap={handleMermaidClick}
                      >
                        {/* Background */}
                        <Rect
                          width={shape.width}
                          height={shape.height}
                          fill="#f8fafc"
                          stroke={typeInfo.color}
                          strokeWidth={2}
                          cornerRadius={8}
                          shadowColor="rgba(0,0,0,0.1)"
                          shadowBlur={8}
                          shadowOffsetY={2}
                        />
                        
                        {/* Header */}
                        <Rect
                          width={shape.width}
                          height={35}
                          fill={typeInfo.color}
                          cornerRadius={[8, 8, 0, 0]}
                          opacity={0.15}
                        />
                        
                        {/* Icon */}
                        <Text
                          x={10}
                          y={8}
                          text={typeInfo.icon}
                          fontSize={20}
                        />
                        
                        {/* Type name */}
                        <Text
                          x={40}
                          y={10}
                          text={typeInfo.name}
                          fontSize={14}
                          fontFamily="Arial"
                          fontStyle="bold"
                          fill={typeInfo.color}
                        />
                        
                        {/* Code preview */}
                        <Text
                          x={10}
                          y={45}
                          text="Code:"
                          fontSize={10}
                          fontFamily="Arial"
                          fill="#64748b"
                        />
                        
                        {codeLines.slice(0, Math.min(5, Math.floor(((shape.height || 300) - 70) / 18))).map((line, idx) => (
                          <Text
                            key={idx}
                            x={10}
                            y={60 + idx * 18}
                            text={line.length > 40 ? line.substring(0, 40) + '...' : line}
                            fontSize={11}
                            fontFamily="Consolas, monospace"
                            fill="#334155"
                            width={(shape.width || 400) - 20}
                          />
                        ))}
                        
                        {codeLines.length > 5 && (
                          <Text
                            x={10}
                            y={60 + Math.min(5, Math.floor(((shape.height || 300) - 70) / 18)) * 18}
                            text={`... ${codeLines.length - 5} more lines`}
                            fontSize={10}
                            fontFamily="Arial"
                            fill="#94a3b8"
                            fontStyle="italic"
                          />
                        )}
                        
                        {/* Click to edit hint */}
                        <Rect
                          x={10}
                          y={(shape.height || 300) - 35}
                          width={(shape.width || 400) - 20}
                          height={25}
                          fill="#f1f5f9"
                          stroke="#cbd5e1"
                          strokeWidth={1}
                          cornerRadius={4}
                        />
                        <Text
                          x={(shape.width || 400) / 2}
                          y={(shape.height || 300) - 27}
                          text="✏️ Click to edit diagram code"
                          fontSize={11}
                          fontFamily="Arial"
                          fill="#475569"
                          align="center"
                          width={(shape.width || 400) - 20}
                        />
                      </Group>
                    )
                  }
                  
                  return null
                })}
                
                {/* Transformer */}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Shape Settings */}
      {selectedId && (
        <Card className="w-80 rounded-none border-l">
          <CardContent className="p-4 h-full overflow-y-auto">
            <ShapeSettingsPanel
              shape={shapes.find(s => s.id === selectedId)!}
              onUpdate={(updates) => handleUpdateShape(selectedId, updates)}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Entity Selector Dialog */}
      <EntitySelectorDialog
        open={entitySelectorOpen}
        onOpenChange={setEntitySelectorOpen}
        onSelect={handleEntitySelect}
      />
      
      {/* Mermaid Editor Dialog */}
      <MermaidEditorDialog
        open={mermaidEditorOpen}
        onOpenChange={setMermaidEditorOpen}
        initialCode={pendingShapeId ? (shapes.find(s => s.id === pendingShapeId) as MermaidDiagram)?.code : ''}
        onSave={handleMermaidSave}
      />
    </div>
  )
}
