import mongoose from 'mongoose'

// Shape and widget types
export type ShapeType = 
  | 'rectangle' 
  | 'ellipse' 
  | 'line' 
  | 'arrow' 
  | 'polygon' 
  | 'text' 
  | 'image' 
  | 'data-card'
  | 'mermaid-diagram'

export type DataCardType = 'note' | 'account' | 'project' | 'task'

// Base shape interface
export interface BaseShape {
  id: string
  type: ShapeType
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  draggable?: boolean
  zIndex?: number
  locked?: boolean
  visible?: boolean
  opacity?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  shadow?: {
    color?: string
    blur?: number
    offsetX?: number
    offsetY?: number
    opacity?: number
  }
}

// Data card specific properties
export interface DataCard extends BaseShape {
  type: 'data-card'
  dataType: DataCardType
  dataId: string // ID of the linked entity
  displayConfig: {
    showTitle?: boolean
    showId?: boolean
    showLabels?: boolean
    showIcon?: boolean
    iconName?: string
    backgroundColor?: string
    borderColor?: string
    borderRadius?: number
    padding?: number
    fontSize?: number
    fontFamily?: string
    fontColor?: string
  }
  permission?: 'read-only' | 'edit'
  metadata?: {
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
  }
}

// Mermaid diagram specific properties
export interface MermaidDiagram extends BaseShape {
  type: 'mermaid-diagram'
  code: string
  renderedSvg?: string
  diagramType?: string
}

// Text specific properties
export interface TextShape extends BaseShape {
  type: 'text'
  text: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

// Image specific properties
export interface ImageShape extends BaseShape {
  type: 'image'
  src: string
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
}

// Arrow specific properties
export interface ArrowShape extends BaseShape {
  type: 'arrow'
  points: number[] // [x1, y1, x2, y2]
  pointerLength?: number
  pointerWidth?: number
}

// Line specific properties
export interface LineShape extends BaseShape {
  type: 'line'
  points: number[] // [x1, y1, x2, y2, ...]
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  dashEnabled?: boolean
  dash?: number[]
}

// Polygon specific properties
export interface PolygonShape extends BaseShape {
  type: 'polygon'
  points: number[] // [x1, y1, x2, y2, ...]
  closed?: boolean
}

// Union type for all shapes
export type Shape = 
  | BaseShape 
  | DataCard 
  | MermaidDiagram 
  | TextShape 
  | ImageShape 
  | ArrowShape 
  | LineShape 
  | PolygonShape

// Canvas mode
export type CanvasMode = 'a4' | 'flexible'

// Canvas settings
export interface CanvasSettings {
  mode: CanvasMode
  width: number // Canvas width in pixels
  height: number // Canvas height in pixels
  backgroundColor?: string
  backgroundImage?: string
  gridEnabled?: boolean
  gridSize?: number
  gridColor?: string
  snapToGrid?: boolean
  snapTolerance?: number
  padding?: number
  autoExpand?: boolean // For flexible mode
}

// A4 Template schema
const a4TemplateSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  description: String,
  
  // Canvas configuration
  canvasSettings: {
    mode: { 
      type: String, 
      enum: ['a4', 'flexible'], 
      default: 'a4' 
    },
    width: { type: Number, default: 794 }, // A4 width at 96 DPI
    height: { type: Number, default: 1123 }, // A4 height at 96 DPI
    backgroundColor: { type: String, default: '#ffffff' },
    backgroundImage: String,
    gridEnabled: { type: Boolean, default: true },
    gridSize: { type: Number, default: 20 },
    gridColor: { type: String, default: '#e0e0e0' },
    snapToGrid: { type: Boolean, default: true },
    snapTolerance: { type: Number, default: 5 },
    padding: { type: Number, default: 40 },
    autoExpand: { type: Boolean, default: false }
  },
  
  // Shapes and widgets
  shapes: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['rectangle', 'ellipse', 'line', 'arrow', 'polygon', 'text', 'image', 'data-card', 'mermaid-diagram']
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: Number,
    height: Number,
    rotation: { type: Number, default: 0 },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },
    draggable: { type: Boolean, default: true },
    zIndex: { type: Number, default: 0 },
    locked: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    opacity: { type: Number, default: 1 },
    fill: String,
    stroke: String,
    strokeWidth: Number,
    shadow: {
      color: String,
      blur: Number,
      offsetX: Number,
      offsetY: Number,
      opacity: Number
    },
    
    // Type-specific properties (stored as mixed)
    // For text
    text: String,
    fontSize: Number,
    fontFamily: String,
    fontStyle: String,
    align: String,
    verticalAlign: String,
    
    // For image
    src: String,
    cropX: Number,
    cropY: Number,
    cropWidth: Number,
    cropHeight: Number,
    
    // For lines/arrows/polygons
    points: [Number],
    pointerLength: Number,
    pointerWidth: Number,
    lineCap: String,
    lineJoin: String,
    dashEnabled: Boolean,
    dash: [Number],
    closed: Boolean,
    
    // For data cards
    dataType: {
      type: String,
      enum: ['note', 'account', 'project', 'task']
    },
    dataId: String,
    displayConfig: {
      showTitle: Boolean,
      showId: Boolean,
      showLabels: Boolean,
      showIcon: Boolean,
      iconName: String,
      backgroundColor: String,
      borderColor: String,
      borderRadius: Number,
      padding: Number,
      fontSize: Number,
      fontFamily: String,
      fontColor: String
    },
    permission: {
      type: String,
      enum: ['read-only', 'edit']
    },
    
    // For mermaid diagrams
    code: String,
    renderedSvg: String,
    diagramType: String,
    
    // Generic metadata
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Linked entities
  linkedEntities: [{
    entityType: { 
      type: String, 
      required: true,
      enum: ['note', 'mail', 'account', 'project', 'task']
    },
    entityId: { type: String, required: true },
    linkType: { 
      type: String,
      enum: ['embedded', 'referenced', 'attached'],
      default: 'referenced'
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Template metadata
  category: { 
    type: String, 
    default: 'custom' 
  },
  tags: [String],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  
  // Version control
  version: { 
    type: Number, 
    default: 1 
  },
  versionHistory: [{
    version: Number,
    templateData: mongoose.Schema.Types.Mixed,
    changedBy: String,
    changeDescription: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Usage tracking
  usageCount: { 
    type: Number, 
    default: 0 
  },
  lastUsed: Date,
  
  // Sharing and permissions
  sharedWith: [{
    userId: String,
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    },
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Audit trail
  createdBy: String,
  updatedBy: String,
  
  // Timestamps
  created_at: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updated_at: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
})

// Indexes for performance
a4TemplateSchema.index({ user_id: 1, created_at: -1 })
a4TemplateSchema.index({ category: 1, isPublic: 1 })
a4TemplateSchema.index({ tags: 1 })
a4TemplateSchema.index({ 'linkedEntities.entityId': 1 })

// Middleware to update version before save
a4TemplateSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1
  }
  next()
})

export default mongoose.models.A4Template || mongoose.model('A4Template', a4TemplateSchema)
