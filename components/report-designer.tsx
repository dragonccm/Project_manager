"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  closestCenter, 
  useDroppable,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection
} from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  Download, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileBarChart,
  Undo2,
  Redo2,
  Copy,
  Move3D,
  Grid3X3,
  Eye,
  EyeOff,
  Filter,
  FolderOpen,
  Edit3,
  Settings,
  ReceiptPoundSterlingIcon
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useDatabase } from "@/hooks/use-database"
import { useCollaboration, CollaborativeCursors, CollaborationUser } from "@/components/collaboration"
import { useAdvancedAnimations, AnimatedDragOverlay, MagneticSnapZone } from "@/components/advanced-animations"
import { motion, AnimatePresence } from "framer-motion"
import { SuccessCelebration, FieldDropParticles } from "@/components/particle-effects"
import { MobileGestureWrapper, MobileToolbar } from "@/components/mobile-gestures"
import { useTouch } from "@/hooks/use-touch"
import { CollaborationProvider, CollaborationPanel, UserCursors, ActivityIndicator, useCollaboration as useRealTimeCollaboration } from "@/components/real-time-collaboration"
import { ParticleEffect, SuccessAnimation, DropZoneHighlight, NotificationSystem, useVisualFeedback } from "@/components/visual-feedback"

// Import error boundary
import { ReportDesignerErrorBoundary, useErrorHandler } from "@/components/error-boundary"

// Define available data fields for reports
const DATA_FIELDS = [
  { id: "title", label: "Task Title", icon: FileText, type: "text" },
  { id: "description", label: "Description", icon: FileText, type: "text" },
  { id: "project", label: "Project", icon: Tag, type: "text" },
  { id: "status", label: "Status", icon: CheckCircle2, type: "status" },
  { id: "priority", label: "Priority", icon: AlertTriangle, type: "priority" },
  { id: "assignee", label: "Assignee", icon: User, type: "text" },
  { id: "created_date", label: "Created Date", icon: Calendar, type: "date" },
  { id: "due_date", label: "Due Date", icon: Calendar, type: "date" },
  { id: "estimated_time", label: "Estimated Time", icon: Clock, type: "number" },
  { id: "actual_time", label: "Actual Time", icon: Clock, type: "number" },
  { id: "completion_status", label: "Completed", icon: CheckCircle2, type: "boolean" }
]

// Enhanced data fields with advanced features
const ADVANCED_DATA_FIELDS = [
  // Basic fields (existing)
  ...DATA_FIELDS,
  
  // Advanced field types
  {
    id: "calculated-field",
    name: "Calculated Field",
    type: "calculated",
    icon: <FileBarChart className="h-4 w-4" />,
    description: "Create custom formulas and calculations",
    category: "advanced"
  },
  {
    id: "conditional-format",
    name: "Conditional Format",
    type: "conditional",
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Apply conditional formatting rules",
    category: "advanced"
  },
  {
    id: "field-group",
    name: "Field Group",
    type: "group",
    icon: <Move3D className="h-4 w-4" />,
    description: "Group related fields together",
    category: "advanced"
  },
  {
    id: "data-filter",
    name: "Data Filter",
    type: "filter",
    icon: <Filter className="h-4 w-4" />,
    description: "Add dynamic data filtering",
    category: "advanced"
  }
]

// Type alias for the database ReportTemplate
type ReportTemplate = {
  id: number
  name: string
  description?: string
  template_data: object
  category: "standard" | "custom"
  is_default: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

interface DragState {
  isDragging: boolean
  draggedItem: any
}

interface HistoryState {
  past: string[][]
  present: string[]
  future: string[][]
}

// Enhanced visual feedback component
function DragPreview({ item, style }: { item: any, style?: React.CSSProperties }) {
  if (!item || !item.field) return null
  
  const IconComponent = item.field.icon
  
  return (
    <div 
      style={style}
      className="bg-primary/90 text-primary-foreground p-3 rounded-lg shadow-lg border-2 border-primary backdrop-blur-sm transform rotate-3 scale-105"
    >
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        <span className="text-sm font-medium">{item.field.label}</span>
      </div>
    </div>
  )
}

interface DataFieldCardProps {
  field: typeof DATA_FIELDS[0]
  isDragging?: boolean
}

function DataFieldCard({ field, isDragging = false }: DataFieldCardProps) {
  const IconComponent = field.icon
  
  return (
    <Card className={`
      cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out
      ${isDragging 
        ? 'opacity-20 scale-95 shadow-2xl ring-2 ring-primary/50' 
        : 'hover:shadow-lg hover:scale-102 hover:bg-primary/5'
      }
    `}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">{field.label}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {field.type}
          </Badge>
        </div>
        {/* Visual drag indicator */}
        <div className="flex gap-1 mt-2 opacity-30">
          <div className="h-1 w-1 bg-current rounded-full"></div>
          <div className="h-1 w-1 bg-current rounded-full"></div>
          <div className="h-1 w-1 bg-current rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DraggableDataFieldProps {
  field: typeof DATA_FIELDS[0]
}

function DraggableDataField({ field }: DraggableDataFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, data: { type: 'data-field', field } })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide the original item completely when dragging to prevent visual duplication
    opacity: isDragging ? 0 : 1,
    // Ensure the item stays in its original position and improve performance
    position: 'relative' as const,
    zIndex: isDragging ? 0 : 'auto',
    willChange: isDragging ? 'transform, opacity' : 'auto',
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`draggable-field-${field.id}`}
      data-field-type={field.type}
      className="draggable-item"
    >
      <DataFieldCard field={field} isDragging={false} />
    </div>
  )
}

interface ReportFieldProps {
  field: typeof DATA_FIELDS[0]
  onRemove: () => void
  isFieldLocked?: boolean
  fieldLocker?: CollaborationUser | null
  currentUserId?: string
}

function ReportField({ field, onRemove, isFieldLocked = false, fieldLocker, currentUserId }: ReportFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `report-${field.id}`, 
    data: { type: 'report-field', field },
    disabled: isFieldLocked && fieldLocker?.id !== currentUserId
  })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    // Completely hide the original item when dragging
    opacity: isDragging ? 0 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 0 : 'auto',
    willChange: isDragging ? 'transform, opacity' : 'auto',
  }

  const IconComponent = field.icon
  const isLockedByOther = isFieldLocked && fieldLocker?.id !== currentUserId
  
  return (
    <motion.div
      ref={setNodeRef}
      className={`
        flex items-center gap-2 p-3 border rounded-lg group transition-all duration-200 relative
        ${isDragging 
          ? 'bg-primary/10 border-primary shadow-lg' 
          : isLockedByOther
            ? 'bg-destructive/5 border-destructive/20 opacity-60'
            : 'bg-background hover:bg-muted/50 hover:shadow-md'
        }
      `}
      style={style}
      data-testid={`report-field-${field.id}`}
      data-field-type={field.type}
      initial={{ scale: 1 }}
      animate={{ 
        scale: isFieldLocked ? 0.98 : 1,
        transition: { duration: 0.2 }
      }}
    >
      {/* Field Lock Indicator */}
      {isFieldLocked && (
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
          fieldLocker?.id === currentUserId ? 'bg-blue-500' : 'bg-red-500'
        }`}>
          <User className="h-2 w-2 text-white" />
        </div>
      )}
      
      <div 
        {...attributes} 
        {...listeners} 
        className={`cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors drag-handle ${
          isLockedByOther ? 'cursor-not-allowed' : ''
        }`}
        data-testid={`drag-handle-${field.id}`}
        aria-label={`Drag ${field.label} field`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <IconComponent className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium flex-1">{field.label}</span>
      
      {isLockedByOther && (
        <Badge variant="destructive" className="text-xs">
          Locked by {fieldLocker?.name || `User ${fieldLocker?.id.slice(-4)}`}
        </Badge>
      )}
      
      <Badge variant="outline" className="text-xs">
        {field.type}
      </Badge>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={isLockedByOther}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

interface ReportDesignFrameProps {
  fields: string[]
  onFieldsChange: (fields: string[]) => void
  dragState?: DragState
  showGrid?: boolean
  isFieldLocked?: (fieldId: string) => boolean
  getFieldLocker?: (fieldId: string) => CollaborationUser | null
  currentUserId?: string
}

function ReportDesignFrame({ 
  fields, 
  onFieldsChange,   dragState = { isDragging: false, draggedItem: null }, 
  showGrid = false,
  isFieldLocked = () => false,
  getFieldLocker = () => null,
  currentUserId = ''
}: ReportDesignFrameProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'report-frame',
    data: { type: 'report-frame' }
  })

  const reportFields = fields
    .map(fieldId => DATA_FIELDS.find(f => f.id === fieldId))
    .filter(Boolean) as typeof DATA_FIELDS

  const handleRemoveField = (fieldId: string) => {
    onFieldsChange(fields.filter(id => id !== fieldId))
  }

  return (
    <Card className="min-h-[400px] flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5" />
          Report Design Canvas
          {dragState.isDragging && (
            <Badge variant="secondary" className="ml-auto animate-pulse">
              <Move3D className="h-3 w-3 mr-1" />
              Dragging...
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Drag data fields here to design your report layout
        </CardDescription>
      </CardHeader>
      <CardContent>        <div
          ref={setNodeRef}
          className={`
            min-h-[300px] border-2 border-dashed rounded-lg p-4 transition-all duration-300 relative
            ${showGrid ? 'bg-grid-pattern' : ''}
            ${isOver 
              ? 'border-primary bg-primary/10 scale-[1.02] shadow-inner drop-zone-active' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }
            ${dragState.isDragging ? 'ring-2 ring-primary/20' : ''}
          `}
          style={{
            backgroundImage: showGrid ? 
              'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)' : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'none'
          }}
          data-testid="report-frame"
          role="region"
          aria-label="Report design canvas"
          aria-dropeffect={dragState.isDragging ? "move" : "none"}
        >
          {/* Drop zone indicator */}
          {isOver && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-bounce">
                <Plus className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Drop here</span>
              </div>
            </div>
          )}

          {reportFields.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Start designing your report</p>
                <p className="text-sm">Drag data fields from the left panel to add them to your report</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                  <GripVertical className="h-3 w-3" />
                  <span>Reorder by dragging</span>
                  <span>•</span>
                  <Trash2 className="h-3 w-3" />
                  <span>Remove on hover</span>
                </div>
              </div>
            </div>
          ) : (
            <SortableContext items={reportFields.map(f => `report-${f.id}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">                {reportFields.map((field) => (
                  <ReportField
                    key={field.id}
                    field={field}
                    onRemove={() => handleRemoveField(field.id)}
                    isFieldLocked={isFieldLocked(field.id)}
                    fieldLocker={getFieldLocker(field.id)}
                    currentUserId={currentUserId}
                  />
                ))}
                
                {/* Add field indicator at bottom */}
                <div className={`
                  border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center transition-all
                  ${isOver ? 'border-primary/50 bg-primary/5' : 'hover:border-muted-foreground/40'}
                `}>
                  <Plus className="h-5 w-5 mx-auto mb-1 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground/70">Drop new field here</span>
                </div>
              </div>
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ReportDesignerProps {
  projects: any[]
  tasks: any[]
  onTemplateCreated?: (template: ReportTemplate) => void
}

// Custom comparison function for React.memo optimization
const areEqual = (prevProps: ReportDesignerProps, nextProps: ReportDesignerProps) => {
  return (
    prevProps.projects === nextProps.projects &&
    prevProps.tasks === nextProps.tasks &&
    prevProps.onTemplateCreated === nextProps.onTemplateCreated
  )
}

export const ReportDesigner = React.memo(function ReportDesignerComponent({ projects, tasks, onTemplateCreated }: ReportDesignerProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  // Database integration
  const { 
    reportTemplates, 
    addReportTemplate, 
    editReportTemplate, 
    removeReportTemplate, 
    duplicateReportTemplate: duplicateReportTemplateFunc,
    loading: dbLoading 
  } = useDatabase()
  
  // Template management state
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Memoize reportTemplates reference to prevent unnecessary re-renders
  const reportTemplatesRef = useRef(reportTemplates)

  // Update ref when reportTemplates changes
  useEffect(() => {
    reportTemplatesRef.current = reportTemplates
  }, [reportTemplates])
  
  // Enhanced drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null
  })
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: selectedFields,
    future: []
  })
    // UI preferences
  const [showGrid, setShowGrid] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Particle effects state
  const [particleEffect, setParticleEffect] = useState<{ 
    isActive: boolean
    position?: { x: number; y: number }
    type: 'success' | 'drop' | null
  }>({ isActive: false, type: null })
  // Activity feed state
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    type: string
    message: string
    timestamp: Date
    userId: string
  }>>([])

  // Mobile state
  const [isMobile, setIsMobile] = useState(false)
  const [mobileToolbarVisible, setMobileToolbarVisible] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)
  
  // Touch hook for mobile gestures
  const touchHandlers = useTouch({
    preventDefault: true,
    threshold: 10
  })
  // Real-time collaboration - generate userId once and memoize
  const userId = useMemo(() => {
    // Generate random ID only once
    const randomId = Math.random().toString(36).substr(2, 9)
    return `user-${randomId}`
  }, []) // Empty dependency array to run only once
  
  const reportId = `report-${templateName || 'untitled'}`
  const {
    activeUsers,
    broadcastAction,
    lockField,
    unlockField,
    isFieldLocked,
    getFieldLocker,
    connectionStatus
  } = useCollaboration(reportId, userId)

  // Advanced animations
  const {
    animateFieldAddition,
    animateFieldRemoval,
    magneticSnap,
    createParticleEffect,
    animateSuccess
  } = useAdvancedAnimations()
  // Touch and mouse sensors with improved settings - memoized to prevent recreation
  const mouseSensor = useMemo(() => useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8, // Reduced distance for more responsive dragging
    },
  }), [])

  const touchSensor = useMemo(() => useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150, // Reduced delay for better touch response
      tolerance: 8, // Increased tolerance for touch devices
    },
  }), [])

  const sensors = useMemo(() => useSensors(mouseSensor, touchSensor), [mouseSensor, touchSensor])

  // Add advanced field configuration state
  const [fieldConfigurations, setFieldConfigurations] = useState<Record<string, any>>({})
  const [conditionalRules, setConditionalRules] = useState<Array<{
    fieldId: string
    condition: string
    value: any
    style: Record<string, string>
  }>>([])
  // Update history when fields change (only when not loading template) - debounced to prevent excessive updates
  useEffect(() => {
    if (!isLoadingTemplate) {
      const timeoutId = setTimeout(() => {
        setHistory(prev => ({
          past: [...prev.past, prev.present],
          present: selectedFields,
          future: []
        }))
      }, 100) // Debounce by 100ms to prevent excessive history updates during rapid changes

      return () => clearTimeout(timeoutId)
    }
  }, [selectedFields, isLoadingTemplate])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
      checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleUndo = () => {
    if (history.past.length === 0) return
    
    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, history.past.length - 1)
    
    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    })
    setSelectedFields(previous)
  }

  const handleRedo = () => {
    if (history.future.length === 0) return
    
    const next = history.future[0]
    const newFuture = history.future.slice(1)
    
    setHistory({    past: [...history.past, history.present],
      present: next,
      future: newFuture
    })
    setSelectedFields(next)
  }

  const handleRemoveField = (fieldId: string) => {
    // Check if field is locked by another user
    if (isFieldLocked(fieldId)) {
      const locker = getFieldLocker(fieldId)
      console.log(`Cannot remove field ${fieldId} - locked by ${locker?.name}`)
      return
    }

    // Animate field removal
    animateFieldRemoval(fieldId)
    setSelectedFields(selectedFields.filter(id => id !== fieldId))
    
    // Log activity
    const field = DATA_FIELDS.find(f => f.id === fieldId)
    setRecentActivity(prev => [{
      id: `remove-${Date.now()}`,
      type: 'field-removed',
      message: `Removed ${field?.label} from report`,
      timestamp: new Date(),
      userId
    }, ...prev.slice(0, 9)])
    
    // Broadcast field removal
    broadcastAction({
      type: 'field-removed',
      fieldId,
      userId,
      timestamp: Date.now()
    })
  }

  const handleFieldUpdate = (fieldId: string, updates: any) => {
    // Update field configurations
    setFieldConfigurations(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...updates }
    }))
    
    // Broadcast field update
    broadcastAction({
      type: 'field-updated',
      fieldId,
      updates,
      userId,
      timestamp: Date.now()
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current
    setActiveId(event.active.id as string)
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: activeData
    }))    // Broadcast drag start to collaborators
    broadcastAction({
      type: 'drag-start',
      fieldId: event.active.id,
      userId,
      timestamp: Date.now()
    })

    // Apply magnetic snap effect
    magneticSnap.setIsSnapping(true)
  }
    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null
    }))    // Stop magnetic snap effect
    magneticSnap.setIsSnapping(false)

    if (!over) {
      // Broadcast failed drop
      broadcastAction({
        type: 'drag-cancelled',
        fieldId: active.id,
        userId,
        timestamp: Date.now()
      })
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    // Handle dropping data field into report frame
    if (activeData?.type === 'data-field' && over.id === 'report-frame') {
      const fieldId = activeData.field.id
      if (!selectedFields.includes(fieldId)) {
        // Check if field is locked by another user
        if (isFieldLocked(fieldId)) {
          const locker = getFieldLocker(fieldId)
          // Show notification about locked field
          console.log(`Field ${fieldId} is locked by ${locker?.name}`)
          return
        }        // Animate field addition
        animateFieldAddition(fieldId)
        setSelectedFields([...selectedFields, fieldId])
        
        // Create particle effect at drop location
        const dropRect = over.rect
        if (dropRect) {
          setParticleEffect({
            isActive: true,
            position: {
              x: dropRect.left + dropRect.width / 2,
              y: dropRect.top + dropRect.height / 2
            },
            type: 'drop'
          })
          
          // Reset particle effect after animation
          setTimeout(() => {
            setParticleEffect(prev => ({ ...prev, isActive: false }))
          }, 100)
        }

        // Log activity
        const activityId = `activity-${Date.now()}`
        setRecentActivity(prev => [{
          id: activityId,
          type: 'field-added',
          message: `Added ${activeData.field.label} to report`,
          timestamp: new Date(),
          userId
        }, ...prev.slice(0, 9)]) // Keep last 10 activities
        
        // Broadcast field addition
        broadcastAction({
          type: 'field-added',
          fieldId,
          userId,
          timestamp: Date.now(),
          position: selectedFields.length
        })
      }
      return
    }

    // Handle reordering within report frame
    if (activeData?.type === 'report-field' && overData?.type === 'report-field') {
      const activeIndex = selectedFields.findIndex(id => `report-${id}` === active.id)
      const overIndex = selectedFields.findIndex(id => `report-${id}` === over.id)
        if (activeIndex !== -1 && overIndex !== -1) {
        const newFields = arrayMove(selectedFields, activeIndex, overIndex)
        setSelectedFields(newFields)
        
        // Broadcast reorder
        broadcastAction({
          type: 'fields-reordered',
          fields: newFields,
          userId,
          timestamp: Date.now()
        })
      }
    }
  }
  // Template management functions
  const handleSaveTemplate = async () => {
    if (!templateName.trim() || selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a template name and select at least one field.",
        variant: "destructive"
      })
      return
    }

    try {
      const templateData = {
        name: templateName,
        description: templateDescription || "",
        template_data: {
          fields: selectedFields,
          fieldConfigurations,
          layout: {
            showGrid,
            showPreview
          }
        },
        category: "custom" as const,
        is_default: false,
        created_by: "user"
      }

      const newTemplate = await addReportTemplate(templateData)
      
      toast({
        title: "Success",
        description: `Template "${templateName}" saved successfully!`
      })
      
      onTemplateCreated?.(newTemplate)
      
      // Reset form
      setTemplateName("")
      setTemplateDescription("")
      setIsEditingTemplate(false)
      setSelectedTemplateId(null)
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplateId || !templateName.trim() || selectedFields.length === 0) {
      toast({
        title: "Error", 
        description: "Please provide a template name and select at least one field.",
        variant: "destructive"
      })
      return
    }

    try {
      const templateData = {
        name: templateName,
        description: templateDescription || "",
        template_data: {
          fields: selectedFields,
          fieldConfigurations,
          layout: {
            showGrid,
            showPreview
          }
        }
      }

      await editReportTemplate(selectedTemplateId, templateData)
      
      toast({
        title: "Success",
        description: `Template "${templateName}" updated successfully!`
      })
      
      setIsEditingTemplate(false)
      setSelectedTemplateId(null)
      setTemplateName("")
      setTemplateDescription("")
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Ref to track loading state to avoid circular dependencies
  const isLoadingRef = useRef(isLoadingTemplate)
  
  // Update ref when isLoadingTemplate changes
  useEffect(() => {
    isLoadingRef.current = isLoadingTemplate
  }, [isLoadingTemplate])

  const handleLoadTemplate = useCallback((template: ReportTemplate) => {
    if (isLoadingRef.current) return // Prevent multiple calls

    setIsLoadingTemplate(true)
    try {
      const templateData = template.template_data as any

      setTemplateName(template.name)
      setTemplateDescription(template.description || "")
      setSelectedFields(templateData?.fields || [])

      // Load field configurations if available
      if (templateData?.fieldConfigurations) {
        setFieldConfigurations(templateData.fieldConfigurations)
      }

      // Load layout preferences if available
      if (templateData?.layout) {
        setShowGrid(templateData.layout.showGrid || false)
        setShowPreview(templateData.layout.showPreview || true)
      }

      toast({
        title: "Success",
        description: `Template "${template.name}" loaded successfully!`
      })
      setIsLoadingTemplate(false)
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive"
      })
      setIsLoadingTemplate(false)
    }
  }, []) // No dependencies needed since we use ref

  // Memoize the onValueChange handler to prevent infinite re-renders
  const handleTemplateSelect = useCallback((value: string) => {
    if (isLoadingRef.current) return // Prevent changes while loading

    const templateId = parseInt(value)
    const template = reportTemplatesRef.current.find(t => t.id === templateId)
    if (template) {
      handleLoadTemplate(template)
    }
  }, [handleLoadTemplate])

  const handleEditTemplate = (template: ReportTemplate) => {
    setSelectedTemplateId(template.id)
    setIsEditingTemplate(true)
  }

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await removeReportTemplate(templateId)
      
      toast({
        title: "Success",
        description: "Template deleted successfully!"
      })
      
      // Clear form if editing the deleted template
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null)
        setIsEditingTemplate(false)
        setTemplateName("")
        setTemplateDescription("")
        setSelectedFields([])
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDuplicateTemplate = async (templateId: number, originalName: string) => {
    try {
      const newName = `${originalName} (Copy)`
      await duplicateReportTemplateFunc(templateId, newName)
      
      toast({
        title: "Success",
        description: `Template duplicated as "${newName}"!`
      })
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleNewTemplate = () => {
    setSelectedTemplateId(null)
    setIsEditingTemplate(false)
    setTemplateName("")
    setTemplateDescription("")
    setSelectedFields([])
    setFieldConfigurations({})
  }

  const generateReport = (format: 'csv' | 'json') => {
    if (selectedFields.length === 0) return

    const reportFields = selectedFields
      .map(fieldId => DATA_FIELDS.find(f => f.id === fieldId))
      .filter(Boolean) as typeof DATA_FIELDS

    if (format === 'csv') {
      let csv = reportFields.map(f => f.label).join(',') + '\n'
      
      tasks.forEach((task: any) => {
        const row = reportFields.map(field => {
          switch (field.id) {
            case 'title': return `"${task.title || ''}"`
            case 'description': return `"${task.description || ''}"`
            case 'project': 
              const project = projects.find(p => p.id == (task.projectId || task.project_id))
              return `"${project?.name || 'No Project'}"`
            case 'status': 
              return task.completed ? 'Completed' : (task.status || 'To Do')
            case 'priority': return task.priority || ''
            case 'assignee': return `"${task.assignee || ''}"`
            case 'created_date': return task.created_at || ''
            case 'due_date': return task.date || ''
            case 'estimated_time': return task.estimated_time || task.estimatedTime || ''
            case 'actual_time': return task.actual_time || task.actualTime || ''
            case 'completion_status': return task.completed ? 'Yes' : 'No'
            default: return ''
          }
        }).join(',')
        csv += row + '\n'
      })

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `custom_report_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // JSON format implementation similar to existing reports
      const reportData = {
        generated_at: new Date().toISOString(),
        report_type: "Custom Report",
        template_name: templateName,
        fields: reportFields.map(f => ({ id: f.id, label: f.label, type: f.type })),
        summary: {
          total_tasks: tasks.length,
          selected_fields: selectedFields.length
        },
        tasks: tasks.map((task: any) => {
          const project = projects.find(p => p.id == (task.projectId || task.project_id))
          const taskData: any = {}
          
          reportFields.forEach(field => {
            switch (field.id) {
              case 'title': taskData.title = task.title; break
              case 'description': taskData.description = task.description; break
              case 'project': taskData.project = { id: project?.id, name: project?.name }; break
              case 'status': taskData.status = task.completed ? 'completed' : (task.status || 'todo'); break
              case 'priority': taskData.priority = task.priority; break
              case 'assignee': taskData.assignee = task.assignee; break
              case 'created_date': taskData.created_date = task.created_at; break
              case 'due_date': taskData.due_date = task.date; break
              case 'estimated_time': taskData.estimated_time = task.estimated_time || task.estimatedTime; break
              case 'actual_time': taskData.actual_time = task.actual_time || task.actualTime; break
              case 'completion_status': taskData.completed = task.completed; break
            }
          })
          
          return taskData
        })
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `custom_report_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const activeDragField = activeId ? DATA_FIELDS.find(f => f.id === activeId) : null
  return (
    <div className="space-y-6">
      {/* Enhanced Template Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Management
          </CardTitle>
          <CardDescription>
            Create, save, and manage custom report templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Load Existing Template */}
          <div className="space-y-2">
            <Label htmlFor="template-select">Load Existing Template</Label>
            <div className="flex gap-2">              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a template to load..." />
                </SelectTrigger>
                <SelectContent>
                  {reportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {(template.template_data as any)?.fields?.length || 0} fields
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleNewTemplate}
                variant="outline"
                size="icon"
                title="Create New Template"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isEditingTemplate ? (
              <>
                <Button
                  onClick={handleUpdateTemplate}
                  disabled={!templateName.trim() || selectedFields.length === 0 || dbLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Update Template
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingTemplate(false)
                    setSelectedTemplateId(null)
                    setTemplateName("")
                    setTemplateDescription("")
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || selectedFields.length === 0 || dbLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            )}
            
            <Button
              onClick={() => generateReport('csv')}
              disabled={selectedFields.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button
              onClick={() => generateReport('json')}
              disabled={selectedFields.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export JSON
            </Button>
          </div>

          {/* Template Status */}
          {selectedFields.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Templates Gallery */}
      {reportTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Saved Templates ({reportTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template) => {
                const templateData = template.template_data as any
                const fieldCount = templateData?.fields?.length || 0
                
                return (
                  <Card key={template.id} className="group hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {template.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {fieldCount} fields
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {template.category === 'standard' ? 'Standard' : 'Custom'}
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLoadTemplate(template)}
                              title="Load Template"
                            >
                              <FolderOpen className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTemplate(template)}
                              title="Edit Template"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicateTemplate(template.id, template.name)}
                              title="Duplicate Template"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            
                            {template.category === 'custom' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTemplate(template.id)}
                                title="Delete Template"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}{/* Enhanced Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">            <div className="flex items-center gap-2">
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background border">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground capitalize">
                  {connectionStatus}
                </span>
              </div>

              {/* Active Users Display */}
              {activeUsers.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-background border">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex -space-x-1 ml-1">
                    {activeUsers.slice(0, 3).map((user, index) => (
                      <div
                        key={user.id}
                        className={`w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white ${
                          ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index % 4]
                        }`}
                        title={`User ${user.id.slice(-4)}`}
                      >
                        {user.id.slice(-2).toUpperCase()}
                      </div>
                    ))}
                    {activeUsers.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-background bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
                        +{activeUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator orientation="vertical" className="h-6" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={history.past.length === 0}
                className="flex items-center gap-1"
                data-testid="undo-button"
                aria-label="Undo last action"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={history.future.length === 0}
                className="flex items-center gap-1"
                data-testid="redo-button"
                aria-label="Redo last action"
              >
                <Redo2 className="h-4 w-4" />
                Redo
              </Button>
              <Separator orientation="vertical" className="h-6" />              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="flex items-center gap-1"
                data-testid="grid-toggle"
                aria-label={`${showGrid ? 'Hide' : 'Show'} grid pattern`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>              <Button
                variant={showPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1"
              >
                {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Preview
              </Button>              <Separator orientation="vertical" className="h-6" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedFields.length > 0 && (
                <Badge variant="secondary">
                  {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
              {dragState.isDragging && (
                <Badge variant="outline" className="animate-pulse">
                  <Move3D className="h-3 w-3 mr-1" />
                  Dragging...
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>      {/* Drag and Drop Interface */}
      <DndContext
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Fields Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Available Data Fields
                <Badge variant="outline" className="ml-auto">
                  {DATA_FIELDS.length}
                </Badge>
              </CardTitle>
              <CardDescription>
                Drag these fields to design your report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SortableContext items={DATA_FIELDS.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {DATA_FIELDS.map((field) => (
                    <DraggableDataField key={field.id} field={field} />
                  ))}
                </div>
              </SortableContext>
            </CardContent>
          </Card>          {/* Report Design Frame */}
          <div className="lg:col-span-2">            <ReportDesignFrame
              fields={selectedFields}
              onFieldsChange={setSelectedFields}
              dragState={dragState}
              showGrid={showGrid}
              isFieldLocked={isFieldLocked}
              getFieldLocker={getFieldLocker}
              currentUserId={userId}
            />
          </div>
        </div>        {/* Enhanced Animated Drag Overlay with physics-based animations */}
        <AnimatedDragOverlay 
          activeId={activeId}
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
          style={{ 
            cursor: 'grabbing',
            transformOrigin: 'center',
          }}
          className="drag-overlay"
        >
          {activeId && (
            (() => {
              const field = DATA_FIELDS.find(f => f.id === activeId || f.id === activeId.replace('report-', ''))
              if (!field) return null
              
              return (
                <motion.div 
                  className="transform pointer-events-none will-change-transform"
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ 
                    scale: 1.05, 
                    rotate: 2,
                    transition: {
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }
                  }}
                  style={{ 
                    filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))',
                  }}
                >
                  <Card className="bg-primary/95 text-primary-foreground shadow-2xl border-2 border-primary/70 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <field.icon className="h-4 w-4" />
                        </motion.div>
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant="secondary" className="ml-auto text-xs bg-primary-foreground/20">
                          {field.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })()
          )}
        </AnimatedDragOverlay>        {/* Collaborative Cursors Overlay */}
        <CollaborativeCursors 
          activeUsers={activeUsers}
        />
      </DndContext>      {/* Magnetic Snap Zones for enhanced precision */}
      <MagneticSnapZone
        targetSelector=".drop-zone"
        snapRadius={40}
        magneticForce={0.3}
        isActive={dragState.isDragging}
      />

      {/* Particle Effects System */}
      <AnimatePresence>
        {particleEffect.isActive && particleEffect.type === 'drop' && (
          <FieldDropParticles
            isActive={true}
            position={particleEffect.position}
          />
        )}
        {particleEffect.isActive && particleEffect.type === 'success' && (
          <SuccessCelebration
            isActive={true}
            position={particleEffect.position}
          />
        )}
      </AnimatePresence>

      {/* Real-time Activity Feed */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 w-80 max-h-64 overflow-hidden"
        >
          <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <FileBarChart className="h-4 w-4" />
                </motion.div>
                Recent Activity
                <Badge variant="outline" className="ml-auto text-xs">
                  {recentActivity.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 rounded border text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      activity.type === 'field-added' ? 'bg-green-500' :
                      activity.type === 'field-removed' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-muted-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground/70">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}      {/* Mobile Gestures and Toolbar - Always render but conditionally show */}
      <MobileGestureWrapper
        onPinch={(scale: number) => {
          if (isMobile) {
            // Handle zoom on mobile
            setZoomLevel((prev: number) => Math.max(0.5, Math.min(2, prev * scale)))
          }
        }}
        onRotate={(rotation: number) => {
          if (isMobile) {
            // Handle rotation for field alignment - simplified for now
            console.log('Rotation gesture detected:', rotation)
          }
        }}
        onSwipe={(direction: 'left' | 'right' | 'up' | 'down', velocity: number) => {
          if (isMobile) {
            // Handle swipe gestures for navigation
            if (direction === 'left' && velocity > 0.5) {
              // Swipe left - undo
              handleUndo()
            } else if (direction === 'right' && velocity > 0.5) {
              // Swipe right - redo
              handleRedo()
            }
          }
        }}
        onDoubleTap={() => {
          if (isMobile) {
            // Double tap to reset zoom
            setZoomLevel(1)
          }
        }}
        onLongPress={() => {
          if (isMobile) {
            // Long press to show mobile toolbar
            setMobileToolbarVisible(true)
          }
        }}
        className={`fixed inset-0 pointer-events-none ${isMobile ? '' : 'hidden'}`}
      >
        <div className="w-full h-full pointer-events-auto">
          {/* Content that can receive touch events */}
        </div>
      </MobileGestureWrapper>
      
      {mobileToolbarVisible && isMobile && (
        <MobileToolbar
          tools={[
            {
              id: 'undo',
              icon: <Undo2 className="h-4 w-4" />,
              label: 'Undo'
            },
            {
              id: 'redo', 
              icon: <Redo2 className="h-4 w-4" />,
              label: 'Redo'
            },
            {
              id: 'grid',
              icon: <Grid3X3 className="h-4 w-4" />,
              label: 'Toggle Grid'
            },
            {
              id: 'close',
              icon: <EyeOff className="h-4 w-4" />,
              label: 'Close'
            }
          ]}
          onToolSelect={(toolId: string) => {
            switch (toolId) {
              case 'undo':
                handleUndo()
                break
              case 'redo':
                handleRedo()
                break
              case 'grid':
                setShowGrid(!showGrid)
                break
              case 'close':
                setMobileToolbarVisible(false)
                break
            }
          }}
          selectedTool=""
          className="z-50"
        />
      )}
    </div>
  )
}, areEqual)
