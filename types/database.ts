import { PROJECT_STATUS, PRIORITY_LEVELS, TASK_STATUS } from '@/lib/constants'


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

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  template_data: object
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
  template_data: object
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

// Partial update types
export interface UpdateProjectInput extends Partial<CreateProjectInput> {}
export interface UpdateTaskInput extends Partial<CreateTaskInput> {}
export interface UpdateCodeComponentInput extends Partial<CreateCodeComponentInput> {}
export interface UpdateReportTemplateInput extends Partial<CreateReportTemplateInput> {}
export interface UpdateSettingsInput extends Partial<Omit<Settings, 'id' | 'created_at' | 'updated_at'>> {}
