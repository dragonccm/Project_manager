export interface Project {
  id: number
  name: string
  domain?: string
  figma_link?: string
  description?: string
  status: "active" | "paused" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  accounts?: Account[] // Added for runtime account association
}

export interface CodeComponent {
  id: number
  project_id?: number
  name: string
  description?: string
  category: "element" | "section" | "template" | "widget" | "global"
  tags: string[]
  code_json: object
  code_json_raw?: string // Raw JSON string for editing
  preview_image?: string
  elementor_data: object
  elementor_data_raw?: string // Raw JSON string for editing
  created_at: string
  updated_at: string
  project_name?: string
}

export interface Account {
  id: number
  project_id?: number
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
  id: number
  title: string
  description?: string
  project_id?: number
  assigned_to?: number
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
  id: number
  name: string
  type: string
  subject: string
  content: string
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: number
  name: string
  description?: string
  template_data: object // Stores the field configuration, layout, styles
  category: "standard" | "custom"
  is_default: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Settings {
  id?: number
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
  project_id?: number
  name: string
  description?: string
  category: "element" | "section" | "template" | "widget" | "global"
  tags: string[]
  code_json: object
  code_json_raw?: string // Raw JSON string for editing
  preview_image?: string
  elementor_data: object
  elementor_data_raw?: string // Raw JSON string for editing
}

export interface CreateAccountInput {
  project_id: number
  username: string
  password: string
  email?: string
  website: string
  notes?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  project_id?: number
  assigned_to?: number
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
