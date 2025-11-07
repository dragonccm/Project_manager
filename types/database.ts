import { PROJECT_STATUS, PRIORITY_LEVELS, TASK_STATUS } from '@/lib/constants'

// Document Canvas Item Types
export interface DocumentItem {
  id: string
  type: "title" | "text" | "image" | "shape" | "tag"
  // Position and size in millimeters (mm)
  x_mm: number
  y_mm: number
  width_mm: number
  height_mm: number
  // Z-index for layering
  z_index: number
  // Rotation in degrees
  rotation?: number
  // Styling
  style: DocumentItemStyle
  // Content based on type
  content: DocumentItemContent
  // References to other entities (for tags/links)
  refs?: Array<{ type: string; id: string }>
  // Lock item from editing
  locked?: boolean
}

export interface DocumentItemStyle {
  // Text styling
  font_family?: string
  font_size_pt?: number // Font size in points
  font_weight?: "normal" | "bold" | "lighter" | "bolder" | number
  font_style?: "normal" | "italic" | "oblique"
  text_align?: "left" | "center" | "right" | "justify"
  text_color?: string
  line_height?: number
  letter_spacing?: number
  
  // Box styling
  background_color?: string
  border_width?: number
  border_color?: string
  border_style?: "solid" | "dashed" | "dotted" | "none"
  border_radius?: number
  
  // Spacing
  padding_top_mm?: number
  padding_right_mm?: number
  padding_bottom_mm?: number
  padding_left_mm?: number
  
  // Visual effects
  opacity?: number
  shadow?: {
    offset_x_mm: number
    offset_y_mm: number
    blur_mm: number
    color: string
  }
}

export interface DocumentItemContent {
  // For title and text types
  text?: string
  // For image type
  image_url?: string
  image_alt?: string
  preserve_aspect?: boolean
  // For shape type
  shape_type?: "rectangle" | "circle" | "ellipse" | "line" | "arrow" | "triangle"
  fill_color?: string
  stroke_color?: string
  stroke_width?: number
  // For tag type (entity reference)
  tag_label?: string
  tag_entity_type?: string
  tag_entity_id?: string
}

export interface Project {
  id: string
  name: string
  domain?: string
  figma_link?: string
  description?: string
  status: keyof typeof PROJECT_STATUS
  created_at: string
  updated_at: string
  user_id: string
  accounts?: Account[] // Added for runtime account association
}

export interface DatabaseConnection {
  success: boolean
  error?: string
  isServerSide: boolean
}

export interface CodeComponent {
  id: string
  name: string
  description?: string
  component_type: "element" | "section" | "template" | "widget" | "global"
  content_type: "code" | "text" | "link" | "file" | "webpage" | "mixed" | "password" | "image" | "document"
  code?: string
  content?: {
    text?: string
    formatted?: boolean // For text type with preserved formatting
    language?: string // For code type language selection
    links?: Array<{ url: string; title: string; description?: string }>
    files?: Array<{ url: string; name: string; type: string; size?: number }>
    webpages?: Array<{ url: string; title: string; thumbnail?: string; description?: string }>
    html?: string
    css?: string
    javascript?: string
    password?: {
      username?: string
      password?: string
      email?: string
      website?: string
      notes?: string
    }
    images?: Array<{ url: string; alt?: string; caption?: string }>
    document?: {
      canvas_width_mm: number // Default 210 (A4 width)
      canvas_height_mm: number // Default 297 (A4 height)
      grid_size_mm?: number // Grid spacing in mm (e.g., 5mm)
      grid_enabled?: boolean
      snap_to_grid?: boolean
      items: DocumentItem[]
      background_color?: string
      version?: number
    }
  }
  props?: object
  dependencies?: string[]
  tags?: string[]
  preview_image?: string
  preview_data?: {
    thumbnail?: string
    screenshots?: string[]
    demo_url?: string
  }
  linked_a4_template?: string // ID of linked A4 template
  metadata?: {
    author?: string
    version?: string
    license?: string
    framework?: string
    category?: string
    difficulty?: "beginner" | "intermediate" | "advanced"
    responsive?: boolean
    accessibility?: boolean
  }
  created_at?: string
  updated_at?: string
}

export interface Account {
  id: string
  project_id?: string
  username: string
  password: string
  email?: string
  website: string
  notes?: string
  created_at: string
  updated_at: string
  project_name?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  project_id?: string
  assigned_to?: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  date: string
  estimated_time?: number
  actual_time?: number
  completed: boolean
  created_at: string
  updated_at: string
  created_by?: string // User ID who created the task
  created_by_user?: {
    id: string
    username: string
    full_name?: string
  } // User details populated from database
}

export interface EmailTemplate {
  id: string
  name: string
  type: string
  subject: string
  content: string
  created_at: string
  updated_at: string
}

export interface FieldLayout {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface ReportTemplateData {
  fields: string[]
  layout: "table" | "custom"
  fieldLayout?: FieldLayout[]
  created_at: string
}

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  template_data: ReportTemplateData
  category: "standard" | "custom"
  is_default: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Settings {
  id?: string
  language: string
  theme: "light" | "dark" | "system"
  notifications: {
    email: boolean
    desktop: boolean
    tasks: boolean
  }
  custom_colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  created_at?: string
  updated_at?: string
}

// Input types for create operations
export interface CreateProjectInput {
  name: string
  domain?: string
  figma_link?: string
  description?: string
  status?: string
}

export interface CreateCodeComponentInput {
  project_id?: string
  name: string
  description?: string
  component_type: "element" | "section" | "template" | "widget" | "global"
  content_type: "code" | "text" | "link" | "file" | "webpage" | "mixed"
  code?: string
  content?: {
    text?: string
    links?: Array<{ url: string; title: string; description?: string }>
    files?: Array<{ url: string; name: string; type: string; size?: number }>
    webpages?: Array<{ url: string; title: string; thumbnail?: string; description?: string }>
    html?: string
    css?: string
    javascript?: string
  }
  props?: object
  dependencies?: string[]
  tags?: string[]
  preview_image?: string
  preview_data?: {
    thumbnail?: string
    screenshots?: string[]
    demo_url?: string
  }
  metadata?: {
    author?: string
    version?: string
    license?: string
    framework?: string
    category?: string
    difficulty?: "beginner" | "intermediate" | "advanced"
    responsive?: boolean
    accessibility?: boolean
  }
}

export interface CreateAccountInput {
  project_id: string
  username: string
  password: string
  email?: string
  website: string
  notes?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  project_id?: string
  assigned_to?: string
  status?: string
  priority?: string
  date: string
  estimated_time?: number
  completed?: boolean
}

export interface CreateEmailTemplateInput {
  name: string
  type: string
  subject: string
  content: string
}

export interface CreateReportTemplateInput {
  name: string
  description?: string
  template_data: ReportTemplateData
  category?: "standard" | "custom"
  is_default?: boolean
  created_by?: string
}

export interface DatabaseResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ConnectionTestResult {
  success: boolean
  error?: string
  details?: any
}

// A4 Template Types
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
export type CanvasMode = 'a4' | 'flexible'
export type LinkType = 'embedded' | 'referenced' | 'attached'
export type EntityType = 'note' | 'mail' | 'account' | 'project' | 'task'

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

export interface DataCard extends BaseShape {
  type: 'data-card'
  dataType: DataCardType
  dataId: string
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

export interface MermaidDiagram extends BaseShape {
  type: 'mermaid-diagram'
  code: string
  renderedSvg?: string
  diagramType?: string
}

export interface TextShape extends BaseShape {
  type: 'text'
  text: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

export interface ImageShape extends BaseShape {
  type: 'image'
  src: string
  cropX?: number
  cropY?: number
  cropWidth?: number
  cropHeight?: number
}

export interface ArrowShape extends BaseShape {
  type: 'arrow'
  points: number[]
  pointerLength?: number
  pointerWidth?: number
}

export interface LineShape extends BaseShape {
  type: 'line'
  points: number[]
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  dashEnabled?: boolean
  dash?: number[]
}

export interface PolygonShape extends BaseShape {
  type: 'polygon'
  points: number[]
  closed?: boolean
}

export type Shape = 
  | BaseShape 
  | DataCard 
  | MermaidDiagram 
  | TextShape 
  | ImageShape 
  | ArrowShape 
  | LineShape 
  | PolygonShape

export interface CanvasSettings {
  mode: CanvasMode
  width: number
  height: number
  backgroundColor?: string
  backgroundImage?: string
  gridEnabled?: boolean
  gridSize?: number
  gridColor?: string
  snapToGrid?: boolean
  snapTolerance?: number
  padding?: number
  autoExpand?: boolean
}

export interface LinkedEntity {
  entityType: EntityType
  entityId: string
  linkType: LinkType
  metadata?: any
}

export interface VersionHistory {
  version: number
  templateData: any
  changedBy: string
  changeDescription: string
  timestamp: Date
}

export interface SharedUser {
  userId: string
  permission: 'view' | 'edit' | 'admin'
  sharedAt: Date
}

export interface A4Template {
  _id?: string // MongoDB ID
  id: string
  user_id: string
  name: string
  description?: string
  canvasSettings: CanvasSettings
  shapes: Shape[]
  linkedEntities: LinkedEntity[]
  category: string
  tags: string[]
  isPublic: boolean
  isTemplate: boolean
  version: number
  versionHistory: VersionHistory[]
  usageCount: number
  lastUsed?: Date
  sharedWith: SharedUser[]
  createdBy?: string
  updatedBy?: string
  created_at: string
  updated_at: string
}

export interface CreateA4TemplateInput {
  name: string
  description?: string
  canvasSettings?: Partial<CanvasSettings>
  shapes?: Shape[]
  linkedEntities?: LinkedEntity[]
  category?: string
  tags?: string[]
  isPublic?: boolean
  isTemplate?: boolean
}

export interface UpdateA4TemplateInput extends Partial<CreateA4TemplateInput> {
  version?: number
  changeDescription?: string
  sharedWith?: SharedUser[]
  usageCount?: number
  lastUsed?: Date
}

// Partial update types
export interface UpdateProjectInput extends Partial<CreateProjectInput> {}
export interface UpdateTaskInput extends Partial<CreateTaskInput> {}
export interface UpdateCodeComponentInput extends Partial<CreateCodeComponentInput> {}
export interface UpdateReportTemplateInput extends Partial<CreateReportTemplateInput> {}
export interface UpdateSettingsInput extends Partial<Omit<Settings, 'id' | 'created_at' | 'updated_at'>> {}
