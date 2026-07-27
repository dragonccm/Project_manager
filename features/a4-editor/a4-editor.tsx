'use client'

import { useLanguage } from "@/hooks/use-language"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  ShapeType,
  EdgeBinding
} from '@/types/database'
import {
  routeEdge,
  isBoundEdge,
  computeEdgeLanes,
  getShapeBounds,
  anchorPoint,
  type Side,
} from '@/lib/diagram/edge-routing'
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
  FileText,
  Sparkles
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
import { AiDiagramDialog } from '@/components/ai-diagram-dialog'

interface A4EditorProps {
  templateId?: string
  onSave?: (templateData: any) => void
  initialData?: {
    canvasSettings?: Partial<CanvasSettings>
    shapes?: Shape[]
  }
}

export default function A4Editor({ templateId, onSave, initialData }: A4EditorProps) {
  const { t } = useLanguage()
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
  // Vùng chọn là một MẢNG. `selectedId` bên dưới chỉ là giá trị dẫn xuất cho
  // những chỗ chỉ có nghĩa khi chọn đúng một hình (bảng thuộc tính).
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : [])
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  )

  /** Click thường thay cả vùng chọn; giữ Shift để thêm/bớt từng hình */
  const selectShape = useCallback((id: string, additive: boolean) => {
    setSelectedIds(prev => {
      if (!additive) return [id]
      return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    })
  }, [])

  // Khung quét chọn trên nền trống
  const [marquee, setMarquee] = useState<
    { x1: number; y1: number; x2: number; y2: number } | null
  >(null)
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
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [pendingShapeId, setPendingShapeId] = useState<string | null>(null)
  
  // Image cache for Image shapes
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())

  /**
   * Vùng vẽ trải kín khung chứa thay vì chỉ là tờ A4 794×1123 nổi giữa nền xám.
   * Kích thước thật của canvas = max(khổ giấy đã cấu hình, kích thước khung
   * nhìn thấy) nên luôn full, và vẫn cuộn được khi nội dung vượt quá.
   */
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const measure = () =>
      setViewport({ width: el.clientWidth, height: el.clientHeight })

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Trừ padding của khung cuộn để không sinh thanh cuộn thừa
  const PAD = 32
  const stageWidth = Math.max(
    canvasSettings.width,
    Math.floor((viewport.width - PAD * 2) / zoom) || 0
  )
  const stageHeight = Math.max(
    canvasSettings.height,
    Math.floor((viewport.height - PAD * 2) / zoom) || 0
  )

  // Tra cứu hình theo id để định tuyến cạnh mà không quét mảng mỗi lần
  const shapesById = useMemo(
    () => new Map(shapes.map(s => [s.id, s])),
    [shapes]
  )

  // Làn của từng cạnh, để hai mũi tên giữa cùng cặp hình không đè lên nhau
  const edgeLanes = useMemo(() => computeEdgeLanes(shapes), [shapes])
  
  // Nối hai hình bằng chuột: kéo từ một điểm neo sang hình khác.
  // Ref là nguồn đọc chính, state chỉ để vẽ đường xem trước. Với thao tác kéo
  // rất nhanh, mouseup có thể chạy trước khi React re-render, khi đó handler
  // đọc state sẽ vẫn thấy giá trị cũ và bỏ lỡ thao tác nối.
  const connectingRef = useRef<{ shapeId: string; side: Side } | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ shapeId: string; side: Side } | null>(null)
  const [connectPreview, setConnectPreview] = useState<{ x: number; y: number } | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Cùng lý do: giữ khung quét chọn trong ref để mouseup luôn đọc được
  const marqueeRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  
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
            if (selectedIds.length) {
              e.preventDefault()
              handleCopy()
            }
            break
          case 'a':
            e.preventDefault()
            setSelectedIds(shapes.map(sh => sh.id))
            break
          case 'v':
            e.preventDefault()
            handlePaste()
            break
          case 'd':
            if (selectedIds.length) {
              e.preventDefault()
              handleDuplicate()
            }
            break
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedIds.length) {
              e.preventDefault()
              handleDelete()
            }
            break
          case 'Escape':
            setSelectedIds([])
            connectingRef.current = null
            setConnectingFrom(null)
            setActiveTool('select')
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, shapes, historyStep])
  
  // Update transformer when selection changes
  useEffect(() => {
    const tr = transformerRef.current
    const stage = stageRef.current
    if (!tr || !stage) return

    // Nhánh else trước đây bị thiếu: bỏ chọn hình thì các tay cầm biến đổi
    // vẫn dính lại trên canvas.
    // Cạnh không co giãn/xoay được — vị trí của nó suy ra từ hai node hai đầu.
    const nodes = selectedIds
      .filter(id => {
        const s = shapesById.get(id)
        return s && !isBoundEdge(s)
      })
      .map(id => stage.findOne('#' + id))
      .filter((n): n is Konva.Node => Boolean(n))
    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, shapes, shapesById])
  
  /**
   * Cạnh gắn node phải luôn nằm ở gốc toạ độ (đường đi nằm trong `points`).
   * react-konva sẽ không sửa lại nếu có gì đó dịch chúng bằng lệnh, vì prop
   * x/y vẫn là 0 — nên chốt lại ở đây sau mỗi lần shapes đổi.
   */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let moved = false
    for (const shape of shapes) {
      if (!isBoundEdge(shape)) continue
      const node = stage.findOne('#' + shape.id)
      if (node && (node.x() !== 0 || node.y() !== 0)) {
        node.position({ x: 0, y: 0 })
        moved = true
      }
    }
    if (moved) stage.batchDraw()
  }, [shapes])

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
    if (!selectedIds.length) return

    const doomed = new Set(selectedIds)

    // Xoá kèm các cạnh trỏ tới hình bị xoá. Nếu để lại, chúng thành cạnh mồ côi
    // không định tuyến được và bị vẽ thành mũi tên dị dạng ở gốc toạ độ.
    const updatedShapes = shapes.filter(s => {
      if (doomed.has(s.id)) return false
      const e = s as Shape & EdgeBinding
      if (e.source?.shapeId && doomed.has(e.source.shapeId)) return false
      if (e.target?.shapeId && doomed.has(e.target.shapeId)) return false
      return true
    })

    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedIds([])
  }

  const handleCopy = () => {
    if (!selectedIds.length) return

    const picked = shapes.filter(s => selectedIds.includes(s.id))
    localStorage.setItem('copiedShapes', JSON.stringify(picked))
    toast({
      title: `Đã sao chép ${picked.length} hình`,
      description: 'Nhấn Ctrl+V để dán'
    })
  }

  /**
   * Nhân bản vùng chọn. Cạnh nối giữa hai hình cùng được nhân bản sẽ trỏ sang
   * bản sao, chứ không trỏ ngược về hình gốc.
   */
  const cloneShapes = (source: Shape[], offset = 20): Shape[] => {
    const stamp = Date.now().toString(36)
    const idMap = new Map(source.map((s, i) => [s.id, `shape-${stamp}-${i}`]))

    return source.map(s => {
      const e = s as Shape & EdgeBinding
      const clone: any = { ...s, id: idMap.get(s.id)! }

      if (e.source?.shapeId) {
        clone.source = { ...e.source, shapeId: idMap.get(e.source.shapeId) ?? e.source.shapeId }
      }
      if (e.target?.shapeId) {
        clone.target = { ...e.target, shapeId: idMap.get(e.target.shapeId) ?? e.target.shapeId }
      }
      // Cạnh đã gắn node thì vị trí do node quyết định, đừng dịch nó
      if (!isBoundEdge(s)) {
        clone.x = (s.x || 0) + offset
        clone.y = (s.y || 0) + offset
      }
      return clone as Shape
    })
  }

  const handleDuplicate = () => {
    if (!selectedIds.length) return

    const picked = shapes.filter(s => selectedIds.includes(s.id))
    const clones = cloneShapes(picked)
    const updatedShapes = [...shapes, ...clones]

    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedIds(clones.map(c => c.id))
  }
  
  // Update shape handler for settings panel
  const handleUpdateShape = (shapeId: string, updates: Partial<Shape>) => {
    const updatedShapes = shapes.map(shape =>
      shape.id === shapeId ? { ...shape, ...updates } : shape
    )
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
  }

  // Làm tròn về mắt lưới gần nhất. Trước đây canvasSettings.snapToGrid chỉ là
  // một công tắc trong UI, không hàm nào đọc tới nên bật/tắt đều vô nghĩa.
  const snap = useCallback((value: number) => {
    if (!canvasSettings.snapToGrid) return Math.round(value)
    const size = canvasSettings.gridSize || 20
    return Math.round(value / size) * size
  }, [canvasSettings.snapToGrid, canvasSettings.gridSize])

  // Konva chỉ dịch chuyển node trên canvas; nếu không ghi ngược vào state thì
  // lần render kế tiếp sẽ kéo hình về toạ độ cũ. Đây là lý do trước đây kéo
  // hình xong là nó nhảy về chỗ cũ, và lưu template ra toạ độ sai.
  // Vị trí lúc bắt đầu kéo, để tính độ dịch chuyển áp cho cả vùng chọn
  const dragOrigin = useRef<{ id: string; x: number; y: number } | null>(null)

  const handleShapeDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id()
    if (!id) return
    dragOrigin.current = { id, x: e.target.x(), y: e.target.y() }
  }

  /**
   * Kéo một hình đang nằm trong vùng chọn nhiều thì các hình còn lại đi theo.
   * Konva chỉ di chuyển đúng node bị kéo, nên phải tự dịch các node anh em ngay
   * trong lúc kéo, nếu không chúng sẽ nhảy một phát ở cuối.
   */
  /** Các id trong vùng chọn thực sự dịch chuyển được (cạnh thì không) */
  const movableSelection = () =>
    selectedIds.filter(id => {
      const s = shapesById.get(id)
      return s && !isBoundEdge(s)
    })

  const handleShapeDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const origin = dragOrigin.current
    if (!origin || selectedIds.length < 2 || !selectedIds.includes(origin.id)) return

    const dx = e.target.x() - origin.x
    const dy = e.target.y() - origin.y
    const stage = stageRef.current
    if (!stage) return

    // Bỏ qua cạnh: chúng luôn render ở x=0,y=0 với toạ độ tuyệt đối trong
    // `points`. Dịch chúng bằng lệnh sẽ không bao giờ được React hoàn tác —
    // react-konva thấy prop x/y vẫn là 0 nên bỏ qua, và cạnh kẹt ở chỗ sai.
    for (const id of movableSelection()) {
      if (id === origin.id) continue
      const node = stage.findOne('#' + id)
      const base = shapesById.get(id)
      if (node && base) node.position({ x: base.x + dx, y: base.y + dy })
    }
  }

  const handleShapeDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id()
    if (!id) return

    const origin = dragOrigin.current
    dragOrigin.current = null

    const x = snap(e.target.x())
    const y = snap(e.target.y())
    // Đặt lại vị trí node cho khớp giá trị đã snap, tránh nhấp nháy
    e.target.position({ x, y })

    // Kéo nhiều: áp cùng độ dịch cho mọi hình trong vùng chọn
    if (origin && selectedIds.length > 1 && selectedIds.includes(id)) {
      const dx = x - origin.x
      const dy = y - origin.y
      const moving = new Set(movableSelection())

      const updatedShapes = shapes.map(s =>
        moving.has(s.id) ? { ...s, x: snap(s.x + dx), y: snap(s.y + dy) } : s
      )
      setShapes(updatedShapes)
      saveToHistory(updatedShapes)
      return
    }

    handleUpdateShape(id, { x, y })
  }

  // Transformer phóng to node bằng scaleX/scaleY. Phải quy đổi về width/height
  // rồi reset scale, nếu không kích thước sẽ nhân dồn ở lần transform sau.
  const handleShapeTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const id = node.id()
    if (!id) return

    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    const current = shapes.find(s => s.id === id)
    if (!current) return

    node.scaleX(1)
    node.scaleY(1)

    handleUpdateShape(id, {
      x: snap(node.x()),
      y: snap(node.y()),
      width: Math.max(5, Math.round((current.width || node.width() || 0) * scaleX)),
      height: Math.max(5, Math.round((current.height || node.height() || 0) * scaleY)),
      rotation: Math.round(node.rotation())
    })
  }

  // Konva props dùng chung cho mọi hình có thể kéo/biến đổi
  const interactionProps = (shape: Shape) => ({
    draggable: shape.draggable,
    onDragStart: handleShapeDragStart,
    onDragMove: handleShapeDragMove,
    onDragEnd: handleShapeDragEnd,
    onTransformEnd: handleShapeTransformEnd,
    onMouseEnter: () => setHoveredId(shape.id),
    // Cố tình KHÔNG xoá hoveredId ở mouseleave: điểm neo nằm ngay trên mép
    // hình, rê chuột ra tới neo là đã rời khỏi hình và neo sẽ biến mất trước
    // khi kịp bấm. hoveredId chỉ đổi khi rê sang hình khác, hoặc rời canvas.
  })

  // ---------------------------------------------------------------
  // Quét chọn khung + nối hai hình bằng chuột
  // ---------------------------------------------------------------

  /** Toạ độ con trỏ trong hệ toạ độ canvas (đã trừ zoom) */
  const pointerPos = () => stageRef.current?.getRelativePointerPosition() ?? null

  /**
   * Hình nằm dưới con trỏ, bỏ qua cạnh và các chốt phụ trợ.
   *
   * Phải duyệt TẤT CẢ node giao nhau chứ không chỉ node trên cùng: điểm neo là
   * một Circle không có id nằm đè lên mép hình, `getIntersection` sẽ trả về nó
   * và ta không lần ra được hình bên dưới.
   */
  const shapeUnderPointer = (): Shape | null => {
    const stage = stageRef.current
    const pos = stage?.getPointerPosition()
    if (!stage || !pos) return null

    for (const hit of stage.getAllIntersections(pos)) {
      let node: Konva.Node | null = hit
      while (node) {
        const id = node.id()
        const found = id ? shapesById.get(id) : undefined
        if (found && !isBoundEdge(found) && found.type !== 'arrow' && found.type !== 'line') {
          return found
        }
        node = node.getParent() as Konva.Node | null
      }
    }
    return null
  }

  const handleStagePointerDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (connectingRef.current) return
    // Bấm trúng một hình thì để chính hình đó xử lý chọn
    if (e.target !== e.target.getStage()) return

    const p = pointerPos()
    if (!p) return

    const additive = 'shiftKey' in e.evt && e.evt.shiftKey
    if (!additive) setSelectedIds([])

    const box = { x1: p.x, y1: p.y, x2: p.x, y2: p.y }
    marqueeRef.current = box
    setMarquee(box)
  }

  const handleStagePointerMove = () => {
    const p = pointerPos()
    if (!p) return

    if (connectingRef.current) {
      setConnectPreview(p)
      return
    }
    if (!marqueeRef.current) return

    marqueeRef.current = { ...marqueeRef.current, x2: p.x, y2: p.y }
    setMarquee(marqueeRef.current)
  }

  const handleStagePointerUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (connectingRef.current) {
      finishConnection()
      return
    }

    const drawn = marqueeRef.current
    marqueeRef.current = null
    if (!drawn) return

    const box = {
      x: Math.min(drawn.x1, drawn.x2),
      y: Math.min(drawn.y1, drawn.y2),
      width: Math.abs(drawn.x2 - drawn.x1),
      height: Math.abs(drawn.y2 - drawn.y1),
    }

    // Kéo quá ngắn thì coi như một cú click bỏ chọn, không phải quét
    if (box.width > 4 && box.height > 4) {
      const hits = shapes
        .filter(s => {
          if (isBoundEdge(s) || s.type === 'arrow' || s.type === 'line') return false
          const b = getShapeBounds(s)
          return (
            b.x < box.x + box.width &&
            b.x + b.width > box.x &&
            b.y < box.y + box.height &&
            b.y + b.height > box.y
          )
        })
        .map(s => s.id)

      const additive = 'shiftKey' in e.evt && e.evt.shiftKey
      setSelectedIds(prev => (additive ? [...new Set([...prev, ...hits])] : hits))
    }

    setMarquee(null)
  }

  const startConnection = (shapeId: string, side: Side, at: { x: number; y: number }) => {
    connectingRef.current = { shapeId, side }
    setConnectingFrom({ shapeId, side })
    setConnectPreview(at)
  }

  const finishConnection = () => {
    const from = connectingRef.current
    connectingRef.current = null
    setConnectingFrom(null)
    setConnectPreview(null)
    if (!from) return

    const target = shapeUnderPointer()
    // Thả vào chỗ trống hoặc thả lại chính nó thì huỷ
    if (!target || target.id === from.shapeId) return

    const newEdge = {
      id: `edge-${Date.now().toString(36)}`,
      type: 'arrow',
      x: 0,
      y: 0,
      points: [0, 0, 0, 0],
      source: { shapeId: from.shapeId, anchor: from.side },
      target: { shapeId: target.id, anchor: 'auto' },
      router: 'orthogonal',
      stroke: '#475569',
      strokeWidth: 2,
      pointerLength: 9,
      pointerWidth: 9,
      draggable: false,
      zIndex: 5,
    } as unknown as Shape

    const updatedShapes = [...shapes, newEdge]
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedIds([newEdge.id])
  }

  /**
   * Hình đang hiện các điểm neo: ưu tiên hình đang rê chuột, nếu không thì hình
   * đang được chọn đơn lẻ. Không hiện khi đang quét chọn để đỡ rối mắt.
   */
  const anchorHost = (() => {
    if (marquee) return null
    const id = hoveredId || (selectedIds.length === 1 ? selectedIds[0] : null)
    if (!id) return null
    const shape = shapesById.get(id)
    if (!shape || isBoundEdge(shape) || shape.type === 'arrow' || shape.type === 'line') {
      return null
    }
    return shape
  })()

  /**
   * Chèn sơ đồ do AI sinh. Nếu sơ đồ rộng/cao hơn khổ giấy hiện tại thì nới
   * canvas ra chế độ linh hoạt — sơ đồ luồng thường dài hơn A4 nhiều.
   */
  const handleInsertAiDiagram = (
    aiShapes: Shape[],
    meta: { title: string; width: number; height: number }
  ) => {
    const updatedShapes = [...shapes, ...aiShapes]
    setShapes(updatedShapes)
    saveToHistory(updatedShapes)
    setSelectedId(null)

    const needWidth = Math.max(canvasSettings.width, meta.width)
    const needHeight = Math.max(canvasSettings.height, meta.height)

    if (needWidth > canvasSettings.width || needHeight > canvasSettings.height) {
      setCanvasSettings(prev => ({
        ...prev,
        mode: 'flexible',
        width: needWidth,
        height: needHeight,
        autoExpand: true,
      }))
    }
  }

  const handlePaste = () => {
    const raw = localStorage.getItem('copiedShapes')
    if (!raw) return

    try {
      const copied = JSON.parse(raw)
      const list: Shape[] = Array.isArray(copied) ? copied : [copied]
      if (!list.length) return

      const clones = cloneShapes(list)
      const updatedShapes = [...shapes, ...clones]

      setShapes(updatedShapes)
      saveToHistory(updatedShapes)
      setSelectedIds(clones.map(c => c.id))
    } catch {
      toast({
        title: 'Không dán được',
        description: 'Dữ liệu trong clipboard không hợp lệ',
        variant: 'destructive'
      })
    }
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
    const stage = stageRef.current
    if (!stage) return

    // Vùng vẽ nay rộng hơn khổ giấy, xuất nguyên canvas sẽ thừa rất nhiều nền
    // trống. Cắt đúng theo hộp bao của nội dung, chừa lề 24px.
    const drawn = shapes.filter(s => !isBoundEdge(s))
    let region: { x: number; y: number; width: number; height: number }

    if (drawn.length) {
      const b = drawn.map(getShapeBounds)
      const minX = Math.max(0, Math.min(...b.map(v => v.x)) - 24)
      const minY = Math.max(0, Math.min(...b.map(v => v.y)) - 24)
      const maxX = Math.max(...b.map(v => v.x + v.width)) + 24
      const maxY = Math.max(...b.map(v => v.y + v.height)) + 24
      region = { x: minX * zoom, y: minY * zoom, width: (maxX - minX) * zoom, height: (maxY - minY) * zoom }
    } else {
      region = { x: 0, y: 0, width: canvasSettings.width * zoom, height: canvasSettings.height * zoom }
    }

    const dataURL = stage.toDataURL({ ...region, pixelRatio: 2 / zoom })
    const link = document.createElement('a')
    link.download = 'so-do.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: t('exportedPng'),
      description: t('exportedPngDesc')
    })
  }
  
  // Render grid
  const renderGrid = () => {
    if (!canvasSettings.gridEnabled) return null

    const lines = []
    const { gridSize, gridColor } = canvasSettings
    // Lưới phủ toàn bộ vùng vẽ, không chỉ riêng khổ giấy
    const width = stageWidth
    const height = stageHeight

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
    // h-screen chỉ đúng khi fullscreen. Ở chế độ nhúng, component nằm dưới
    // header nên 100vh luôn cao hơn khung chứa và bị tràn — dùng h-full.
    <div className={`flex min-h-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-background h-screen' : 'h-full'}`}>
      {/* Left Toolbar */}
      <Card className="w-64 shrink-0 h-full rounded-none border-y-0 border-l-0 border-r">
        <CardContent className="p-4 space-y-4 h-full overflow-y-auto">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tools">{t("tools")}</TabsTrigger>
              <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
              <TabsTrigger value="layers">{t("layers")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("basicShapes")}</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="rectangle" label={t("rectangle")} icon={<></>} />
                  <DraggableShapeItem type="ellipse" label={t("ellipse")} icon={<></>} />
                  <DraggableShapeItem type="line" label={t("lineShape")} icon={<></>} />
                  <DraggableShapeItem type="arrow" label={t("arrow")} icon={<></>} />
                  <DraggableShapeItem type="polygon" label={t("polygon")} icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("textAndMedia")}</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="text" label={t("textElement")} icon={<></>} />
                  <DraggableShapeItem type="image" label={t("imageLabel")} icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("dataAndDiagrams")}</Label>
                <div className="space-y-2">
                  <DraggableShapeItem type="data-card" label={t("dataCard")} icon={<></>} />
                  <DraggableShapeItem type="mermaid-diagram" label={t("mermaidDiagram")} icon={<></>} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t("actions")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!selectedIds.length}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t("copy")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={!selectedIds.length}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {t("duplicate")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedIds.length}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t("delete")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyStep === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {t("undo")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyStep >= history.length - 1}
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    {t("redo")}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("canvasMode")}</Label>
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
                <Label>{t("showGrid")}</Label>
                <Switch
                  checked={canvasSettings.gridEnabled}
                  onCheckedChange={toggleGrid}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>{t("snapToGrid")}</Label>
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
                <Label>{t("backgroundColor")}</Label>
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
                      isSelected(shape.id) ? 'bg-accent' : ''
                    }`}
                    onClick={(e) => selectShape(shape.id, e.shiftKey)}
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
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-100 dark:bg-neutral-900">
        {/* Top Toolbar */}
        <div className="bg-background border-b p-2 flex items-center gap-2">
          <Button size="sm" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1" />
            {t('aiGenerateDiagram')}
          </Button>
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {t("save")}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-1" />
            {t("exportPdf")}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportPNG}>
            <Download className="w-4 h-4 mr-1" />
            {t("exportPng")}
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
        <div ref={viewportRef} className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-start">
          <div
            className="shadow-sm"
            style={{
              background: canvasSettings.backgroundColor,
              width: stageWidth * zoom,
              height: stageHeight * zoom
            }}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            <Stage
              ref={stageRef}
              width={stageWidth}
              height={stageHeight}
              scaleX={zoom}
              scaleY={zoom}
              onMouseDown={handleStagePointerDown}
              onTouchStart={handleStagePointerDown}
              onMouseMove={handleStagePointerMove}
              onTouchMove={handleStagePointerMove}
              onMouseUp={handleStagePointerUp}
              onTouchEnd={handleStagePointerUp}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Layer>
                {/* Grid */}
                {renderGrid()}

                {/* Mốc khổ giấy: vùng vẽ giờ rộng hơn tờ A4 nên cần đường
                    ranh giới để biết phần nào sẽ nằm trong trang in */}
                {canvasSettings.mode === 'a4' && (
                  <Rect
                    x={0}
                    y={0}
                    width={canvasSettings.width}
                    height={canvasSettings.height}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    dash={[8, 6]}
                    listening={false}
                  />
                )}
                
                {/* Shapes */}
                {shapes.map((shape) => {
                  // Rectangle
                  if (shape.type === 'rectangle') {
                    const boxFill = shape.fill
                    const boxProps = {
                      width: shape.width,
                      height: shape.height,
                      fill: boxFill,
                      stroke: shape.stroke,
                      strokeWidth: shape.strokeWidth,
                      // Bảng cài đặt có thanh trượt cho hai thuộc tính này
                      // nhưng trước đây renderer không đọc, nên kéo không có tác dụng.
                      cornerRadius: shape.cornerRadius,
                      shadowBlur: shape.shadow?.blur,
                      shadowColor: shape.shadow?.color,
                    }

                    // Node sơ đồ: nhãn nằm TRONG hộp, gói chung một Group để
                    // click và kéo tác động lên cả cụm.
                    if (shape.label) {
                      return (
                        <Group
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          {...interactionProps(shape)}
                          rotation={shape.rotation}
                          onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                          onTap={() => selectShape(shape.id, false)}
                        >
                          <Rect {...boxProps} />
                          <Text
                            width={shape.width}
                            height={shape.height}
                            text={shape.label}
                            fontSize={shape.labelFontSize || 13}
                            fontFamily="Arial"
                            fill={shape.labelColor || '#1e293b'}
                            align="center"
                            verticalAlign="middle"
                            padding={8}
                            listening={false}
                          />
                        </Group>
                      )
                    }

                    return (
                      <Rect
                        key={shape.id}
                        id={shape.id}
                        x={shape.x}
                        y={shape.y}
                        {...boxProps}
                        {...interactionProps(shape)}
                        rotation={shape.rotation}
                        onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                        onTap={() => selectShape(shape.id, false)}
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
                        {...interactionProps(shape)}
                        rotation={shape.rotation}
                        onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                        onTap={() => selectShape(shape.id, false)}
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
                        {...interactionProps(shape)}
                        rotation={shape.rotation}
                        onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                        onTap={() => selectShape(shape.id, false)}
                      />
                    )
                  }
                  
                  // Cạnh đã gắn source/target: đường đi được tính lại từ vị trí
                  // thật của hai hình nên kéo khối là mũi tên đi theo.
                  // Không cho kéo trực tiếp — vị trí của nó là kết quả suy ra.
                  if (isBoundEdge(shape)) {
                    const routed = routeEdge(
                      shape as Shape & EdgeBinding,
                      shapesById,
                      edgeLanes.get(shape.id) ?? 0
                    )
                    if (routed) {
                      const edge = shape as ArrowShape & EdgeBinding
                      const selected = isSelected(shape.id)
                      const stroke = edge.stroke || '#475569'
                      const EdgeNode = shape.type === 'line' ? Line : Arrow
                      const labelW = edge.label ? edge.label.length * 7 + 12 : 0

                      return (
                        <React.Fragment key={shape.id}>
                          <EdgeNode
                            id={shape.id}
                            x={0}
                            y={0}
                            points={routed.points}
                            pointerLength={edge.pointerLength || 9}
                            pointerWidth={edge.pointerWidth || 9}
                            stroke={selected ? '#2563eb' : stroke}
                            strokeWidth={(edge.strokeWidth || 2) + (selected ? 1 : 0)}
                            fill={selected ? '#2563eb' : stroke}
                            lineCap="round"
                            lineJoin="round"
                            // Đường mảnh rất khó bấm trúng — nới vùng nhận click
                            hitStrokeWidth={14}
                            onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                            onTap={() => selectShape(shape.id, false)}
                          />
                          {edge.label && (
                            <>
                              <Rect
                                x={routed.labelX - labelW / 2}
                                y={routed.labelY - 10}
                                width={labelW}
                                height={20}
                                fill={canvasSettings.backgroundColor || '#ffffff'}
                                cornerRadius={4}
                                listening={false}
                              />
                              <Text
                                x={routed.labelX - labelW / 2}
                                y={routed.labelY - 6}
                                width={labelW}
                                text={edge.label}
                                fontSize={12}
                                fill={stroke}
                                align="center"
                                listening={false}
                              />
                            </>
                          )}
                        </React.Fragment>
                      )
                    }
                  }

                  // Line
                  if (shape.type === 'line') {
                    const lineShape = shape as LineShape
                    const points = lineShape.points || [0, 0, 100, 0]
                    const selected = isSelected(shape.id)
                    
                    return (
                      <React.Fragment key={shape.id}>
                        <Line
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          points={points}
                          stroke={lineShape.stroke || '#000000'}
                          strokeWidth={lineShape.strokeWidth || 2}
                          {...interactionProps(shape)}
                          rotation={shape.rotation}
                          onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                          onTap={() => selectShape(shape.id, false)}
                        />
                        {/* Connection points when selected */}
                        {selected && (
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
                    const selected = isSelected(shape.id)
                    
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
                          {...interactionProps(shape)}
                          rotation={shape.rotation}
                          onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                          onTap={() => selectShape(shape.id, false)}
                        />
                        {/* Connection points when selected */}
                        {selected && (
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
                        {...interactionProps(shape)}
                        rotation={shape.rotation}
                        onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                        onTap={() => selectShape(shape.id, false)}
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
                          {...interactionProps(shape)}
                          rotation={shape.rotation}
                          onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                          onTap={() => selectShape(shape.id, false)}
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
                        cornerRadius={shape.cornerRadius}
                        shadowBlur={shape.shadow?.blur}
                        shadowColor={shape.shadow?.color}
                        {...interactionProps(shape)}
                        rotation={shape.rotation}
                        onClick={(e) => selectShape(shape.id, e.evt.shiftKey)}
                        onTap={() => selectShape(shape.id, false)}
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
                        {...interactionProps(shape)}
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
                        {...interactionProps(shape)}
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
                
                {/* Điểm neo: kéo từ đây sang hình khác để tạo mũi tên nối */}
                {anchorHost && (['top', 'right', 'bottom', 'left'] as Side[]).map(side => {
                  const p = anchorPoint(getShapeBounds(anchorHost), side)
                  return (
                    <Circle
                      key={`anchor-${side}`}
                      x={p.x}
                      y={p.y}
                      radius={6}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={2}
                      hitStrokeWidth={14}
                      listening={!connectingFrom}
                      onMouseDown={e => {
                        // Chặn nổi bọt lên Stage, nếu không sẽ khởi động quét chọn
                        e.cancelBubble = true
                        startConnection(anchorHost.id, side, p)
                      }}
                      onTouchStart={e => {
                        e.cancelBubble = true
                        startConnection(anchorHost.id, side, p)
                      }}
                      onMouseEnter={e => {
                        // Rê từ node sang chính điểm neo sẽ bắn mouseleave của
                        // node và làm neo biến mất — giữ lại hoveredId ở đây.
                        setHoveredId(anchorHost.id)
                        const c = e.target.getStage()?.container()
                        if (c) c.style.cursor = 'crosshair'
                      }}
                      onMouseLeave={e => {
                        const c = e.target.getStage()?.container()
                        if (c) c.style.cursor = 'default'
                      }}
                    />
                  )
                })}

                {/* Đường xem trước trong lúc kéo nối */}
                {connectingFrom && connectPreview && (() => {
                  const host = shapesById.get(connectingFrom.shapeId)
                  if (!host) return null
                  const start = anchorPoint(getShapeBounds(host), connectingFrom.side)
                  return (
                    <Arrow
                      points={[start.x, start.y, connectPreview.x, connectPreview.y]}
                      stroke="#2563eb"
                      strokeWidth={2}
                      fill="#2563eb"
                      pointerLength={9}
                      pointerWidth={9}
                      dash={[6, 4]}
                      listening={false}
                    />
                  )
                })()}

                {/* Khung quét chọn */}
                {marquee && (
                  <Rect
                    x={Math.min(marquee.x1, marquee.x2)}
                    y={Math.min(marquee.y1, marquee.y2)}
                    width={Math.abs(marquee.x2 - marquee.x1)}
                    height={Math.abs(marquee.y2 - marquee.y1)}
                    fill="rgba(37, 99, 235, 0.1)"
                    stroke="#2563eb"
                    strokeWidth={1}
                    dash={[4, 4]}
                    listening={false}
                  />
                )}

                {/* Transformer */}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={selectedIds.length === 1}
                  flipEnabled={false}
                  boundBoxFunc={(oldBox, newBox) =>
                    newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                  }
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - Shape Settings */}
      {selectedId && (
        <Card className="w-80 shrink-0 h-full rounded-none border-y-0 border-r-0 border-l">
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

      <AiDiagramDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onInsert={handleInsertAiDiagram}
      />
    </div>
  )
}
