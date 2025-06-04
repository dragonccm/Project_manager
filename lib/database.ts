import { neon } from "@neondatabase/serverless"

// Check if database URL is available
const databaseUrl = process.env.NEON_DATABASE_URL

if (!databaseUrl) {
  console.warn("NEON_DATABASE_URL environment variable is not set. Using localStorage fallback.")
}

const sql = databaseUrl ? neon(databaseUrl) : null

// Database connection test
export async function testDatabaseConnection() {
  if (!sql) {
    return { success: false, error: "No database URL configured" }
  }

  try {
    await sql`SELECT 1 as test`
    return { success: true }
  } catch (error: any) {
    console.error("Database connection test failed:", error)
    return { success: false, error: error.message || String(error) }
  }
}

// Initialize database tables
export async function initializeTables() {
  if (!sql) throw new Error("Database not available")

  try {
    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255),
        figma_link TEXT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        website VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        completed BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'todo',
        date DATE NOT NULL,
        estimated_time INTEGER DEFAULT 60,
        actual_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add status column to existing tasks table if it doesn't exist
    try {
      await sql`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'todo'
      `
    } catch (error) {
      // Column might already exist, ignore error
      console.log("Status column might already exist:", error)
    }

    // Create email_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create code_components table
    await sql`
      CREATE TABLE IF NOT EXISTS code_components (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'element',
        tags TEXT[] DEFAULT '{}',
        code_json JSONB NOT NULL,
        preview_image TEXT,
        elementor_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) DEFAULT 'default',
        language VARCHAR(10) DEFAULT 'en',
        theme VARCHAR(20) DEFAULT 'light',
        notifications JSONB DEFAULT '{}',
        custom_colors JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create report_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS report_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        template_data JSONB NOT NULL,
        category VARCHAR(50) DEFAULT 'custom',
        is_default BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Ensure all columns exist in report_templates table (for existing databases)
    try {
      await sql`ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS description TEXT`
      await sql`ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS template_data JSONB`
      await sql`ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'custom'`
      await sql`ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE`
      await sql`ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS created_by VARCHAR(100)`
    } catch (error) {
      // Columns might already exist, ignore error
      console.log("Some columns might already exist in report_templates:", error)
    }

    // Insert default settings if not exists
    await sql`
      INSERT INTO settings (user_id, language, theme, notifications, custom_colors)
      SELECT 'default', 'en', 'light', 
        '{"email": true, "desktop": false, "tasks": true}',
        '{"primary": "#3b82f6", "secondary": "#64748b", "accent": "#f59e0b", "background": "#ffffff"}'
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE user_id = 'default')
    `

    // Insert default report templates if not exists
    await sql`
      INSERT INTO report_templates (name, description, template_data, category, is_default, created_by)
      SELECT 
        'Standard Task Report',
        'Báo cáo tiêu chuẩn hiển thị thông tin cơ bản của task',
        '{"fields": ["title", "project", "status", "priority", "due_date"], "layout": "table", "styles": {"header": {"background": "#f8fafc", "color": "#334155"}, "rows": {"alternating": true}}}',
        'standard',
        true,
        'system'
      WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Standard Task Report')
    `

    await sql`
      INSERT INTO report_templates (name, description, template_data, category, is_default, created_by)
      SELECT 
        'Detailed Task Analysis',
        'Báo cáo chi tiết với thời gian thực hiện và tiến độ',
        '{"fields": ["title", "description", "project", "status", "priority", "created_date", "due_date", "estimated_time", "actual_time"], "layout": "detailed", "styles": {"header": {"background": "#e2e8f0", "color": "#1e293b"}, "sections": {"padding": "16px", "border": "1px solid #cbd5e1"}}}',
        'standard',
        true,
        'system'
      WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Detailed Task Analysis')
    `

    await sql`
      INSERT INTO report_templates (name, description, template_data, category, is_default, created_by)
      SELECT 
        'Project Summary',
        'Báo cáo tóm tắt theo dự án',
        '{"fields": ["project", "status", "priority"], "layout": "summary", "groupBy": "project", "styles": {"header": {"background": "#dbeafe", "color": "#1e40af"}, "summary": {"showCounts": true, "showPercentages": true}}}',
        'standard',
        true,
        'system'
      WHERE NOT EXISTS (SELECT 1 FROM report_templates WHERE name = 'Project Summary')
    `

    console.log("Database tables initialized successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Error initializing database tables:", error)
    return { success: false, error: error.message || String(error) }
  }
}

// Projects
export async function getProjects() {
  if (!sql) throw new Error("Database not available")

  try {
    const projects = await sql`
      SELECT * FROM projects 
      ORDER BY created_at DESC
    `
    return projects
  } catch (error) {
    console.error("Error fetching projects:", error)
    throw error
  }
}

export async function createProject(projectData: {
  name: string
  domain?: string
  figma_link?: string
  description?: string
  status?: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [project] = await sql`
      INSERT INTO projects (name, domain, figma_link, description, status)
      VALUES (${projectData.name}, ${projectData.domain || ""}, ${projectData.figma_link || ""}, ${projectData.description || ""}, ${projectData.status || "active"})
      RETURNING *
    `
    return project
  } catch (error) {
    console.error("Error creating project:", error)
    throw error
  }
}

export async function updateProject(
  id: number,
  projectData: {
    name?: string
    domain?: string
    figma_link?: string
    description?: string
    status?: string
  },
) {
  if (!sql) throw new Error("Database not available")

  try {
    const [project] = await sql`
      UPDATE projects 
      SET 
        name = COALESCE(${projectData.name}, name),
        domain = COALESCE(${projectData.domain}, domain),
        figma_link = COALESCE(${projectData.figma_link}, figma_link),
        description = COALESCE(${projectData.description}, description),
        status = COALESCE(${projectData.status}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return project
  } catch (error) {
    console.error("Error updating project:", error)
    throw error
  }
}

export async function deleteProject(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM projects WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting project:", error)
    throw error
  }
}

// Accounts
export async function getAccounts() {
  if (!sql) throw new Error("Database not available")

  try {
    const accounts = await sql`
      SELECT a.*, p.name as project_name 
      FROM accounts a
      LEFT JOIN projects p ON a.project_id = p.id
      ORDER BY a.created_at DESC
    `
    return accounts
  } catch (error) {
    console.error("Error fetching accounts:", error)
    throw error
  }
}

export async function createAccount(accountData: {
  project_id: number
  username: string
  password: string
  email?: string
  website: string
  notes?: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [account] = await sql`
      INSERT INTO accounts (project_id, username, password, email, website, notes)
      VALUES (${accountData.project_id}, ${accountData.username}, ${accountData.password}, ${accountData.email || ""}, ${accountData.website}, ${accountData.notes || ""})
      RETURNING *
    `
    return account
  } catch (error) {
    console.error("Error creating account:", error)
    throw error
  }
}

export async function deleteAccount(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM accounts WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    throw error
  }
}

// Tasks
export async function getTasks() {
  if (!sql) throw new Error("Database not available")

  try {
    const tasks = await sql`
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.date DESC, t.created_at DESC
    `
    return tasks
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

export async function createTask(taskData: {
  project_id?: number
  title: string
  description?: string
  priority?: string
  status?: string
  date: string
  estimated_time?: number
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [task] = await sql`
      INSERT INTO tasks (project_id, title, description, priority, status, date, estimated_time)
      VALUES (${taskData.project_id || null}, ${taskData.title}, ${taskData.description || ""}, ${taskData.priority || "medium"}, ${taskData.status || "todo"}, ${taskData.date}, ${taskData.estimated_time || 60})
      RETURNING *
    `
    return task
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

export async function updateTask(
  id: number,
  taskData: {
    title?: string
    description?: string
    priority?: string
    completed?: boolean
    status?: string
    actual_time?: number
  },
) {
  if (!sql) throw new Error("Database not available")

  try {
    const [task] = await sql`
      UPDATE tasks 
      SET 
        title = COALESCE(${taskData.title}, title),
        description = COALESCE(${taskData.description}, description),
        priority = COALESCE(${taskData.priority}, priority),
        completed = COALESCE(${taskData.completed}, completed),
        status = COALESCE(${taskData.status}, status),
        actual_time = COALESCE(${taskData.actual_time}, actual_time),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return task
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

export async function deleteTask(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

// Templates
export async function getEmailTemplates() {
  if (!sql) throw new Error("Database not available")

  try {
    const templates = await sql`
      SELECT * FROM email_templates 
      ORDER BY created_at DESC
    `
    return templates
  } catch (error) {
    console.error("Error fetching email templates:", error)
    throw error
  }
}

export async function createEmailTemplate(templateData: {
  name: string
  type: string
  subject: string
  content: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [template] = await sql`
      INSERT INTO email_templates (name, type, subject, content)
      VALUES (${templateData.name}, ${templateData.type}, ${templateData.subject}, ${templateData.content})
      RETURNING *
    `
    return template
  } catch (error) {
    console.error("Error creating email template:", error)
    throw error
  }
}

export async function deleteEmailTemplate(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM email_templates WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting email template:", error)
    throw error
  }
}

// Settings
export async function getSettings() {
  if (!sql) throw new Error("Database not available")

  try {
    const [settings] = await sql`
      SELECT * FROM settings 
      WHERE user_id = 'default'
      LIMIT 1
    `
    return settings || null
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw error
  }
}

export async function updateSettings(settingsData: any) {
  if (!sql) throw new Error("Database not available")
  
  try {
    const [updatedSettings] = await sql`
      UPDATE settings 
      SET 
        language = COALESCE(${settingsData.language}, language),
        theme = COALESCE(${settingsData.theme}, theme),
        notifications = COALESCE(${JSON.stringify(settingsData.notifications)}, notifications),
        custom_colors = COALESCE(${JSON.stringify(settingsData.custom_colors)}, custom_colors),
        updated_at = NOW()
      WHERE user_id = 'default'
      RETURNING *
    `
    return updatedSettings
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}

// Code Components
export async function getCodeComponents() {
  if (!sql) throw new Error("Database not available")

  try {
    const components = await sql`
      SELECT cc.*, p.name as project_name 
      FROM code_components cc
      LEFT JOIN projects p ON cc.project_id = p.id
      ORDER BY cc.created_at DESC
    `
    return components
  } catch (error) {
    console.error("Error fetching code components:", error)
    throw error
  }
}

export async function createCodeComponent(componentData: {
  project_id?: number
  name: string
  description?: string
  category: string
  tags: string[]
  code_json: object
  preview_image?: string
  elementor_data: object
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [component] = await sql`
      INSERT INTO code_components (project_id, name, description, category, tags, code_json, preview_image, elementor_data)
      VALUES (${componentData.project_id || null}, ${componentData.name}, ${componentData.description || ""}, ${componentData.category}, ${componentData.tags}, ${JSON.stringify(componentData.code_json)}, ${componentData.preview_image || ""}, ${JSON.stringify(componentData.elementor_data)})
      RETURNING *
    `
    return component
  } catch (error) {
    console.error("Error creating code component:", error)
    throw error
  }
}

export async function updateCodeComponent(
  id: number,
  componentData: {
    name?: string
    description?: string
    category?: string
    tags?: string[]
    code_json?: object
    preview_image?: string
    elementor_data?: object
  }
) {
  if (!sql) throw new Error("Database not available")

  try {
    const [component] = await sql`
      UPDATE code_components 
      SET 
        name = COALESCE(${componentData.name}, name),
        description = COALESCE(${componentData.description}, description),
        category = COALESCE(${componentData.category}, category),
        tags = COALESCE(${componentData.tags}, tags),
        code_json = COALESCE(${componentData.code_json ? JSON.stringify(componentData.code_json) : null}, code_json),
        preview_image = COALESCE(${componentData.preview_image}, preview_image),
        elementor_data = COALESCE(${componentData.elementor_data ? JSON.stringify(componentData.elementor_data) : null}, elementor_data),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return component
  } catch (error) {
    console.error("Error updating code component:", error)
    throw error
  }
}

export async function deleteCodeComponent(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM code_components WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting code component:", error)
    throw error
  }
}

// Report Templates
export async function getReportTemplates() {
  if (!sql) throw new Error("Database not available")

  try {
    const templates = await sql`
      SELECT * FROM report_templates 
      ORDER BY is_default DESC, created_at DESC
    `
    return templates
  } catch (error) {
    console.error("Error fetching report templates:", error)
    throw error
  }
}

export async function createReportTemplate(templateData: {
  name: string
  description?: string
  template_data: object
  category?: string
  is_default?: boolean
  created_by?: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [template] = await sql`
      INSERT INTO report_templates (name, description, template_data, category, is_default, created_by)
      VALUES (${templateData.name}, ${templateData.description || ""}, ${JSON.stringify(templateData.template_data)}, ${templateData.category || "custom"}, ${templateData.is_default || false}, ${templateData.created_by || "user"})
      RETURNING *
    `
    return template
  } catch (error) {
    console.error("Error creating report template:", error)
    throw error
  }
}

export async function updateReportTemplate(
  id: number,
  templateData: {
    name?: string
    description?: string
    template_data?: object
    category?: string
    is_default?: boolean
  }
) {
  if (!sql) throw new Error("Database not available")

  try {
    const [template] = await sql`
      UPDATE report_templates 
      SET 
        name = COALESCE(${templateData.name}, name),
        description = COALESCE(${templateData.description}, description),
        template_data = COALESCE(${templateData.template_data ? JSON.stringify(templateData.template_data) : null}, template_data),
        category = COALESCE(${templateData.category}, category),
        is_default = COALESCE(${templateData.is_default}, is_default),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return template
  } catch (error) {
    console.error("Error updating report template:", error)
    throw error
  }
}

export async function deleteReportTemplate(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    // Don't allow deleting default templates
    const [template] = await sql`
      SELECT is_default FROM report_templates WHERE id = ${id}
    `
    
    if (template?.is_default) {
      throw new Error("Cannot delete default templates")
    }

    await sql`DELETE FROM report_templates WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting report template:", error)
    throw error
  }
}

export async function duplicateReportTemplate(id: number, newName: string) {
  if (!sql) throw new Error("Database not available")

  try {
    const [originalTemplate] = await sql`
      SELECT * FROM report_templates WHERE id = ${id}
    `
    
    if (!originalTemplate) {
      throw new Error("Template not found")
    }

    const [newTemplate] = await sql`
      INSERT INTO report_templates (name, description, template_data, category, is_default, created_by)
      VALUES (${newName}, ${originalTemplate.description + " (Copy)"}, ${originalTemplate.template_data}, 'custom', false, 'user')
      RETURNING *
    `
    return newTemplate
  } catch (error) {
    console.error("Error duplicating report template:", error)
    throw error
  }
}
