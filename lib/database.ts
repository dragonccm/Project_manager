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
        date DATE NOT NULL,
        estimated_time INTEGER DEFAULT 60,
        actual_time INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create feedbacks table
    await sql`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create report_templates table
    await sql`
      CREATE TABLE IF NOT EXISTS report_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

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

    // Insert default settings if not exists
    await sql`
      INSERT INTO settings (user_id, language, theme, notifications, custom_colors)
      SELECT 'default', 'en', 'light', 
        '{"email": true, "desktop": false, "feedback": true, "tasks": true}',
        '{"primary": "#3b82f6", "secondary": "#64748b", "accent": "#f59e0b", "background": "#ffffff"}'
      WHERE NOT EXISTS (SELECT 1 FROM settings WHERE user_id = 'default')
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
  date: string
  estimated_time?: number
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [task] = await sql`
      INSERT INTO tasks (project_id, title, description, priority, date, estimated_time)
      VALUES (${taskData.project_id || null}, ${taskData.title}, ${taskData.description || ""}, ${taskData.priority || "medium"}, ${taskData.date}, ${taskData.estimated_time || 60})
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

// Feedbacks
export async function getFeedbacks() {
  if (!sql) throw new Error("Database not available")

  try {
    const feedbacks = await sql`
      SELECT f.*, p.name as project_name 
      FROM feedbacks f
      LEFT JOIN projects p ON f.project_id = p.id
      ORDER BY f.created_at DESC
    `
    return feedbacks
  } catch (error) {
    console.error("Error fetching feedbacks:", error)
    throw error
  }
}

export async function createFeedback(feedbackData: {
  project_id?: number
  client_name: string
  client_email: string
  subject: string
  message: string
  rating: number
  priority?: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [feedback] = await sql`
      INSERT INTO feedbacks (project_id, client_name, client_email, subject, message, rating, priority)
      VALUES (${feedbackData.project_id || null}, ${feedbackData.client_name}, ${feedbackData.client_email}, ${feedbackData.subject}, ${feedbackData.message}, ${feedbackData.rating}, ${feedbackData.priority || "medium"})
      RETURNING *
    `
    return feedback
  } catch (error) {
    console.error("Error creating feedback:", error)
    throw error
  }
}

export async function updateFeedback(
  id: number,
  feedbackData: {
    status?: string
    priority?: string
  },
) {
  if (!sql) throw new Error("Database not available")

  try {
    const [feedback] = await sql`
      UPDATE feedbacks 
      SET 
        status = COALESCE(${feedbackData.status}, status),
        priority = COALESCE(${feedbackData.priority}, priority),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return feedback
  } catch (error) {
    console.error("Error updating feedback:", error)
    throw error
  }
}

// Templates
export async function getReportTemplates() {
  if (!sql) throw new Error("Database not available")

  try {
    const templates = await sql`
      SELECT * FROM report_templates 
      ORDER BY created_at DESC
    `
    return templates
  } catch (error) {
    console.error("Error fetching report templates:", error)
    throw error
  }
}

export async function createReportTemplate(templateData: {
  name: string
  type: string
  content: string
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [template] = await sql`
      INSERT INTO report_templates (name, type, content)
      VALUES (${templateData.name}, ${templateData.type}, ${templateData.content})
      RETURNING *
    `
    return template
  } catch (error) {
    console.error("Error creating report template:", error)
    throw error
  }
}

export async function deleteReportTemplate(id: number) {
  if (!sql) throw new Error("Database not available")

  try {
    await sql`DELETE FROM report_templates WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting report template:", error)
    throw error
  }
}

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
      SELECT * FROM settings WHERE user_id = 'default'
    `
    return settings
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw error
  }
}

export async function updateSettings(settingsData: {
  language?: string
  theme?: string
  notifications?: object
  custom_colors?: object
}) {
  if (!sql) throw new Error("Database not available")

  try {
    const [settings] = await sql`
      UPDATE settings 
      SET 
        language = COALESCE(${settingsData.language}, language),
        theme = COALESCE(${settingsData.theme}, theme),
        notifications = COALESCE(${JSON.stringify(settingsData.notifications)}, notifications),
        custom_colors = COALESCE(${JSON.stringify(settingsData.custom_colors)}, custom_colors),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = 'default'
      RETURNING *
    `
    return settings
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}
