import { Account, Task, Project, EmailTemplate, CodeComponent, Settings, ReportTemplate, DatabaseConnection } from '@/types/database'

// Dynamic imports for server-only modules
let mongoose: any = null
let Models: any = {}

// Initialize MongoDB connection only on server-side
async function initializeMongoose() {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed on server-side')
  }
  
  if (!mongoose) {
    mongoose = await import('mongoose')
  }
  
  return mongoose
}

// Check if database URL is available
const databaseUrl = process.env.MONGODB_URI

let isConnected = false

// Database connection function
async function connectToDatabase(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    throw new Error("Database operations can only be performed on server-side")
  }
  
  if (isConnected) return true

  if (!databaseUrl) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  try {
    const mongooseLib = await initializeMongoose()
    await mongooseLib.default.connect(databaseUrl)
    isConnected = true
    console.log("Connected to MongoDB successfully")
    return true
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Initialize models
async function initializeModels() {
  const mongooseLib = await initializeMongoose()
  
  if (Object.keys(Models).length > 0) return Models

  // Define schemas
  const projectSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    domain: String,
    figma_link: String,
    description: String,
    status: { type: String, default: 'active' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const accountSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    project_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'Project' },
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: String,
    website: { type: String, required: true },
    notes: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const taskSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    project_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'Project' },
    title: { type: String, required: true },
    description: String,
    priority: { type: String, default: 'medium' },
    completed: { type: Boolean, default: false },
    status: { type: String, default: 'todo' },
    date: { type: String, required: true },
    estimated_time: { type: Number, default: 1 }, // Changed from 60 minutes to 1 hour
    actual_time: Number,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const emailTemplateSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    subject: { type: String, required: true },
    content: { type: String, required: true },
    variables: [String],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const codeComponentSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    component_type: { type: String, required: true },
    content_type: { type: String, default: 'code' },
    code: { type: String, required: true },
    content: Object,
    props: Object,
    dependencies: [String],
    tags: [String],
    preview_image: String,
    preview_data: Object,
    metadata: Object,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const settingsSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    category: { type: String, default: 'general' },
    updated_at: { type: Date, default: Date.now }
  })

  const reportTemplateSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    template_data: { type: Object, required: true },
    category: { type: String, default: 'custom' },
    is_default: { type: Boolean, default: false },
    created_by: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const linkSchema = new mongooseLib.default.Schema({
    url: { type: String, required: true },
    original_url: String,
    title: { type: String, required: true },
    description: String,
    platform: { type: String, required: true },
    metadata: Object,
    tags: [String],
    category: { type: String, default: 'general' },
    is_bookmarked: { type: Boolean, default: false },
    is_favorite: { type: Boolean, default: false },
    access_count: { type: Number, default: 0 },
    last_accessed: Date,
    project_id: String,
    user_id: String,
    status: { type: String, enum: ['active', 'broken', 'archived'], default: 'active' },
    custom_title: String,
    notes: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  // Create models
  Models.Project = mongooseLib.default.models.Project || mongooseLib.default.model('Project', projectSchema)
  Models.Account = mongooseLib.default.models.Account || mongooseLib.default.model('Account', accountSchema)
  Models.Task = mongooseLib.default.models.Task || mongooseLib.default.model('Task', taskSchema)
  Models.EmailTemplate = mongooseLib.default.models.EmailTemplate || mongooseLib.default.model('EmailTemplate', emailTemplateSchema)
  Models.CodeComponent = mongooseLib.default.models.CodeComponent || mongooseLib.default.model('CodeComponent', codeComponentSchema)
  Models.Settings = mongooseLib.default.models.Settings || mongooseLib.default.model('Settings', settingsSchema)
  Models.ReportTemplate = mongooseLib.default.models.ReportTemplate || mongooseLib.default.model('ReportTemplate', reportTemplateSchema)
  Models.Link = mongooseLib.default.models.Link || mongooseLib.default.model('Link', linkSchema)

  return Models
}

// Helper function to prepare database
async function prepareDatabase() {
  if (typeof window !== 'undefined') {
    throw new Error("Database operations can only be performed on server-side")
  }
  
  await connectToDatabase()
  return await initializeModels()
}

// Database connection test
export async function testDatabaseConnection(): Promise<DatabaseConnection> {
  if (typeof window !== 'undefined') {
    return { 
      success: false, 
      error: "Database operations can only be performed on server-side",
      isServerSide: false 
    }
  }

  try {
    await connectToDatabase()
    return { success: true, isServerSide: true }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      isServerSide: true 
    }
  }
}

// Initialize database tables (collections in MongoDB)
export async function initializeTables(): Promise<{ success: boolean, error?: string }> {
  try {
    // MongoDB doesn't need table initialization like SQL databases
    // Collections are created automatically when documents are inserted
    console.log('MongoDB collections will be created automatically when needed')
    return { success: true }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }
  }
}

// ===== PROJECT FUNCTIONS =====

export async function getProjects(): Promise<Project[]> {
  try {
    const models = await prepareDatabase()
    const projects = await models.Project.find().sort({ created_at: -1 })
    
    return projects.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      domain: p.domain,
      figma_link: p.figma_link,
      description: p.description,
      status: p.status,
      created_at: p.created_at?.toISOString() || new Date().toISOString(),
      updated_at: p.updated_at?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  try {
    const models = await prepareDatabase()
    const project = await models.Project.create(projectData)
    
    return {
      id: project._id.toString(),
      name: project.name,
      domain: project.domain,
      figma_link: project.figma_link,
      description: project.description,
      status: project.status,
      user_id: project.user_id?.toString() || projectData.user_id,
      created_at: project.created_at?.toISOString() || new Date().toISOString(),
      updated_at: project.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    const updated = await models.Project.findByIdAndUpdate(
      new mongooseLib.default.Types.ObjectId(id),
      { ...updates, updated_at: new Date() },
      { new: true }
    )
    if (!updated) throw new Error('Project not found')
    
    return {
      id: updated._id.toString(),
      name: updated.name,
      domain: updated.domain,
      figma_link: updated.figma_link,
      description: updated.description,
      status: updated.status,
      user_id: updated.user_id?.toString(),
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.Project.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// ===== TASK FUNCTIONS =====

export async function getTasks(): Promise<Task[]> {
  try {
    const models = await prepareDatabase()
    const tasks = await models.Task.find()
      .populate('user_id', 'username full_name')
      .sort({ created_at: -1 })
    
    return tasks.map((t: any) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      project_id: t.project_id?.toString(),
      assigned_to: t.assigned_to,
      priority: t.priority,
      completed: t.completed,
      status: t.status,
      date: t.date,
      estimated_time: t.estimated_time,
      actual_time: t.actual_time,
      created_at: t.created_at?.toISOString() || new Date().toISOString(),
      updated_at: t.updated_at?.toISOString() || new Date().toISOString(),
      created_by: t.user_id?._id?.toString() || t.user_id?.toString(),
      created_by_user: t.user_id && typeof t.user_id === 'object' ? {
        id: t.user_id._id?.toString() || t.user_id.toString(),
        username: t.user_id.username,
        full_name: t.user_id.full_name
      } : undefined
    }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    
    // Convert project_id to ObjectId if provided
    const taskToCreate = {
      ...taskData,
      project_id: taskData.project_id ? new mongooseLib.default.Types.ObjectId(taskData.project_id) : undefined
    }
    
    const task = await models.Task.create(taskToCreate)
    
    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      project_id: task.project_id?.toString(),
      assigned_to: task.assigned_to,
      priority: task.priority,
      completed: task.completed,
      status: task.status,
      date: task.date,
      estimated_time: task.estimated_time,
      actual_time: task.actual_time,
      created_at: task.created_at?.toISOString() || new Date().toISOString(),
      updated_at: task.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    
    // Convert project_id to ObjectId if provided in updates
    const updatesToApply = {
      ...updates,
      project_id: updates.project_id ? new mongooseLib.default.Types.ObjectId(updates.project_id) : updates.project_id,
      updated_at: new Date()
    }
    
    const updated = await models.Task.findByIdAndUpdate(
      new mongooseLib.default.Types.ObjectId(id),
      updatesToApply,
      { new: true }
    )
    if (!updated) throw new Error('Task not found')
    
    return {
      id: updated._id.toString(),
      title: updated.title,
      description: updated.description,
      project_id: updated.project_id?.toString(),
      assigned_to: updated.assigned_to,
      priority: updated.priority,
      completed: updated.completed,
      status: updated.status,
      date: updated.date,
      estimated_time: updated.estimated_time,
      actual_time: updated.actual_time,
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.Task.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

// ===== ACCOUNT FUNCTIONS =====

export async function getAccounts(): Promise<Account[]> {
  try {
    const models = await prepareDatabase()
    const accounts = await models.Account.find().sort({ created_at: -1 })
    
    return accounts.map((a: any) => ({
      id: a._id.toString(),
      project_id: a.project_id?.toString(),
      username: a.username,
      password: a.password,
      email: a.email,
      website: a.website,
      notes: a.notes,
      created_at: a.created_at?.toISOString() || new Date().toISOString(),
      updated_at: a.updated_at?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw error
  }
}

export async function createAccount(accountData: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    
    // Convert project_id to ObjectId if provided
    const accountToCreate = {
      ...accountData,
      project_id: accountData.project_id ? new mongooseLib.default.Types.ObjectId(accountData.project_id) : undefined
    }
    
    const account = await models.Account.create(accountToCreate)
    
    return {
      id: account._id.toString(),
      project_id: account.project_id?.toString(),
      username: account.username,
      password: account.password,
      email: account.email,
      website: account.website,
      notes: account.notes,
      created_at: account.created_at?.toISOString() || new Date().toISOString(),
      updated_at: account.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating account:', error)
    throw error
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.Account.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}

// ===== REPORT TEMPLATE FUNCTIONS =====

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  try {
    const models = await prepareDatabase()
    const templates = await models.ReportTemplate.find().sort({ created_at: -1 })
    
    return templates.map((template: any) => ({
      id: template._id.toString(),
      name: template.name,
      description: template.description,
      template_data: template.template_data,
      category: template.category || 'custom',
      is_default: template.is_default || false,
      created_by: template.created_by,
      created_at: template.created_at?.toISOString() || new Date().toISOString(),
      updated_at: template.updated_at?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error fetching report templates:', error)
    throw error
  }
}

export async function createReportTemplate(templateData: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate> {
  try {
    const models = await prepareDatabase()
    const template = await models.ReportTemplate.create(templateData)
    
    return {
      id: template._id.toString(),
      name: template.name,
      description: template.description,
      template_data: template.template_data,
      category: template.category || 'custom',
      is_default: template.is_default || false,
      created_by: template.created_by,
      created_at: template.created_at?.toISOString() || new Date().toISOString(),
      updated_at: template.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating report template:', error)
    throw error
  }
}

export async function updateReportTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    const updated = await models.ReportTemplate.findByIdAndUpdate(
      new mongooseLib.default.Types.ObjectId(id),
      { ...updates, updated_at: new Date() },
      { new: true }
    )
    if (!updated) throw new Error('Report template not found')
    
    return {
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      template_data: updated.template_data,
      category: updated.category || 'custom',
      is_default: updated.is_default || false,
      created_by: updated.created_by,
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating report template:', error)
    throw error
  }
}

export async function deleteReportTemplate(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.ReportTemplate.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting report template:', error)
    throw error
  }
}

// Additional utility functions for compatibility
export async function updateCodeComponent(id: string, updates: Partial<CodeComponent>): Promise<CodeComponent> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    const updated = await models.CodeComponent.findByIdAndUpdate(
      new mongooseLib.default.Types.ObjectId(id),
      { ...updates, updated_at: new Date() },
      { new: true }
    )
    if (!updated) throw new Error('Code component not found')
    
    return {
      id: updated._id.toString(),
      name: updated.name,
      description: updated.description,
      component_type: updated.component_type,
      content_type: updated.content_type || 'code',
      code: updated.code,
      content: updated.content,
      props: updated.props,
      dependencies: updated.dependencies || [],
      tags: updated.tags || [],
      preview_image: updated.preview_image,
      preview_data: updated.preview_data,
      metadata: updated.metadata,
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating code component:', error)
    throw error
  }
}

// Missing functions that hooks are trying to import

// Email Templates
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const models = await prepareDatabase()
    const templates = await models.EmailTemplate.find({})
    
    return templates.map((template: any) => ({
      id: template._id.toString(),
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.content,
      created_at: template.created_at?.toISOString() || new Date().toISOString(),
      updated_at: template.updated_at?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error getting email templates:', error)
    return []
  }
}

export async function createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
  try {
    const models = await prepareDatabase()
    const newTemplate = await models.EmailTemplate.create(template)
    
    return {
      id: newTemplate._id.toString(),
      name: newTemplate.name,
      type: newTemplate.type,
      subject: newTemplate.subject,
      content: newTemplate.content,
      created_at: newTemplate.created_at?.toISOString() || new Date().toISOString(),
      updated_at: newTemplate.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating email template:', error)
    throw error
  }
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.EmailTemplate.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting email template:', error)
    throw error
  }
}

// Code Components
export async function getCodeComponents(): Promise<CodeComponent[]> {
  try {
    const models = await prepareDatabase()
    const components = await models.CodeComponent.find({})
    
    return components.map((component: any) => ({
      id: component._id.toString(),
      name: component.name,
      description: component.description,
      component_type: component.component_type,
      content_type: component.content_type || 'code',
      code: component.code,
      content: component.content,
      props: component.props || {},
      dependencies: component.dependencies || [],
      tags: component.tags || [],
      preview_image: component.preview_image,
      preview_data: component.preview_data,
      metadata: component.metadata,
      created_at: component.created_at?.toISOString() || new Date().toISOString(),
      updated_at: component.updated_at?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error getting code components:', error)
    return []
  }
}

export async function createCodeComponent(component: Omit<CodeComponent, 'id' | 'created_at' | 'updated_at'>): Promise<CodeComponent> {
  try {
    const models = await prepareDatabase()
    const newComponent = await models.CodeComponent.create(component)
    
    return {
      id: newComponent._id.toString(),
      name: newComponent.name,
      description: newComponent.description,
      component_type: newComponent.component_type,
      content_type: newComponent.content_type || 'code',
      code: newComponent.code,
      content: newComponent.content,
      props: newComponent.props || {},
      dependencies: newComponent.dependencies || [],
      tags: newComponent.tags || [],
      preview_image: newComponent.preview_image,
      preview_data: newComponent.preview_data,
      metadata: newComponent.metadata,
      created_at: newComponent.created_at?.toISOString() || new Date().toISOString(),
      updated_at: newComponent.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating code component:', error)
    throw error
  }
}

export async function deleteCodeComponent(id: string): Promise<void> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    await models.CodeComponent.findByIdAndDelete(new mongooseLib.default.Types.ObjectId(id))
  } catch (error) {
    console.error('Error deleting code component:', error)
    throw error
  }
}

// Settings
export async function getSettings(): Promise<Settings | null> {
  try {
    const models = await prepareDatabase()
    const settings = await models.Settings.findOne({})
    
    if (!settings) return null
    
    return {
      id: settings._id.toString(),
      theme: settings.theme,
      language: settings.language,
      notifications: settings.notifications,
      custom_colors: settings.custom_colors || {
        primary: '#007bff',
        secondary: '#6c757d', 
        accent: '#28a745',
        background: '#ffffff'
      },
      created_at: settings.created_at?.toISOString() || new Date().toISOString(),
      updated_at: settings.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting settings:', error)
    return null
  }
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  try {
    const models = await prepareDatabase()
    const updated = await models.Settings.findOneAndUpdate(
      {},
      { ...settings, updated_at: new Date() },
      { new: true, upsert: true }
    )
    
    return {
      id: updated._id.toString(),
      theme: updated.theme,
      language: updated.language,
      notifications: updated.notifications,
      custom_colors: updated.custom_colors || {
        primary: '#007bff',
        secondary: '#6c757d', 
        accent: '#28a745',
        background: '#ffffff'
      },
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}

// Duplicate report template
export async function duplicateReportTemplate(id: string, newName?: string): Promise<ReportTemplate> {
  try {
    const models = await prepareDatabase()
    const mongooseLib = await initializeMongoose()
    
    // Find original template
    const original = await models.ReportTemplate.findById(new mongooseLib.default.Types.ObjectId(id))
    if (!original) throw new Error('Template not found')
    
    // Create duplicate
    const duplicate = await models.ReportTemplate.create({
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      template_data: original.template_data,
      category: original.category || 'custom',
      is_default: false,
      created_by: original.created_by
    })
    
    return {
      id: duplicate._id.toString(),
      name: duplicate.name,
      description: duplicate.description,
      template_data: duplicate.template_data,
      category: duplicate.category || 'custom',
      is_default: duplicate.is_default || false,
      created_by: duplicate.created_by,
      created_at: duplicate.created_at?.toISOString() || new Date().toISOString(),
      updated_at: duplicate.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error duplicating template:', error)
    throw error
  }
}

// ==================== LINK MANAGEMENT FUNCTIONS ====================

export async function getLinks(userId?: string): Promise<any[]> {
  try {
    await connectToDatabase()
    const models = await initializeModels()
    
    const filter = userId ? { user_id: userId } : {}
    const links = await models.Link.find(filter).sort({ created_at: -1 })
    
    return links.map((link: any) => ({
      id: link._id.toString(),
      url: link.url,
      originalUrl: link.original_url || link.url,
      title: link.title,
      description: link.description,
      platform: link.platform,
      metadata: link.metadata,
      tags: link.tags || [],
      category: link.category || 'general',
      isBookmarked: link.is_bookmarked || false,
      isFavorite: link.is_favorite || false,
      accessCount: link.access_count || 0,
      lastAccessed: link.last_accessed,
      createdAt: link.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: link.updated_at?.toISOString() || new Date().toISOString(),
      projectId: link.project_id,
      userId: link.user_id,
      status: link.status || 'active',
      customTitle: link.custom_title,
      notes: link.notes
    }))
  } catch (error) {
    console.error('Error getting links:', error)
    throw error
  }
}

export async function createLink(linkData: {
  url: string
  originalUrl?: string
  title: string
  description?: string
  platform: string
  metadata?: any
  tags?: string[]
  category?: string
  projectId?: string
  userId?: string
  customTitle?: string
  notes?: string
  status?: string
}): Promise<any> {
  try {
    await connectToDatabase()
    const models = await initializeModels()
    
    const newLink = await models.Link.create({
      url: linkData.url,
      original_url: linkData.originalUrl || linkData.url,
      title: linkData.title,
      description: linkData.description,
      platform: linkData.platform,
      metadata: linkData.metadata,
      tags: linkData.tags || [],
      category: linkData.category || 'general',
      is_bookmarked: false,
      is_favorite: false,
      access_count: 0,
      project_id: linkData.projectId,
      user_id: linkData.userId,
      status: linkData.status || 'active',
      custom_title: linkData.customTitle,
      notes: linkData.notes
    })
    
    return {
      id: newLink._id.toString(),
      url: newLink.url,
      originalUrl: newLink.original_url,
      title: newLink.title,
      description: newLink.description,
      platform: newLink.platform,
      metadata: newLink.metadata,
      tags: newLink.tags || [],
      category: newLink.category,
      isBookmarked: newLink.is_bookmarked || false,
      isFavorite: newLink.is_favorite || false,
      accessCount: newLink.access_count || 0,
      lastAccessed: newLink.last_accessed,
      createdAt: newLink.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: newLink.updated_at?.toISOString() || new Date().toISOString(),
      projectId: newLink.project_id,
      userId: newLink.user_id,
      status: newLink.status,
      customTitle: newLink.custom_title,
      notes: newLink.notes
    }
  } catch (error) {
    console.error('Error creating link:', error)
    throw error
  }
}

export async function updateLink(linkId: string, updates: any): Promise<any> {
  try {
    await connectToDatabase()
    const models = await initializeModels()
    
    const updateData: any = {}
    
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.isBookmarked !== undefined) updateData.is_bookmarked = updates.isBookmarked
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
    if (updates.accessCount !== undefined) updateData.access_count = updates.accessCount
    if (updates.lastAccessed !== undefined) updateData.last_accessed = updates.lastAccessed
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.customTitle !== undefined) updateData.custom_title = updates.customTitle
    if (updates.notes !== undefined) updateData.notes = updates.notes
    
    updateData.updated_at = new Date()
    
    const updatedLink = await models.Link.findByIdAndUpdate(
      linkId,
      updateData,
      { new: true }
    )
    
    if (!updatedLink) throw new Error('Link not found')
    
    return {
      id: updatedLink._id.toString(),
      url: updatedLink.url,
      originalUrl: updatedLink.original_url,
      title: updatedLink.title,
      description: updatedLink.description,
      platform: updatedLink.platform,
      metadata: updatedLink.metadata,
      tags: updatedLink.tags || [],
      category: updatedLink.category,
      isBookmarked: updatedLink.is_bookmarked || false,
      isFavorite: updatedLink.is_favorite || false,
      accessCount: updatedLink.access_count || 0,
      lastAccessed: updatedLink.last_accessed,
      createdAt: updatedLink.created_at?.toISOString() || new Date().toISOString(),
      updatedAt: updatedLink.updated_at?.toISOString() || new Date().toISOString(),
      projectId: updatedLink.project_id,
      userId: updatedLink.user_id,
      status: updatedLink.status,
      customTitle: updatedLink.custom_title,
      notes: updatedLink.notes
    }
  } catch (error) {
    console.error('Error updating link:', error)
    throw error
  }
}

export async function deleteLink(linkId: string): Promise<boolean> {
  try {
    await connectToDatabase()
    const models = await initializeModels()
    
    const result = await models.Link.findByIdAndDelete(linkId)
    return !!result
  } catch (error) {
    console.error('Error deleting link:', error)
    throw error
  }
}

export async function bulkCreateLinks(linksData: any[]): Promise<any[]> {
  try {
    await connectToDatabase()
    const models = await initializeModels()
    
    const createdLinks = []
    
    for (const linkData of linksData) {
      try {
        const newLink = await models.Link.create({
          url: linkData.url,
          original_url: linkData.originalUrl || linkData.url,
          title: linkData.title,
          description: linkData.description,
          platform: linkData.platform,
          metadata: linkData.metadata,
          tags: linkData.tags || [],
          category: linkData.category || 'general',
          is_bookmarked: false,
          is_favorite: false,
          access_count: 0,
          project_id: linkData.projectId,
          user_id: linkData.userId,
          status: linkData.status || 'active',
          custom_title: linkData.customTitle,
          notes: linkData.notes
        })
        
        createdLinks.push({
          id: newLink._id.toString(),
          url: newLink.url,
          originalUrl: newLink.original_url,
          title: newLink.title,
          description: newLink.description,
          platform: newLink.platform,
          metadata: newLink.metadata,
          tags: newLink.tags || [],
          category: newLink.category,
          isBookmarked: newLink.is_bookmarked || false,
          isFavorite: newLink.is_favorite || false,
          accessCount: newLink.access_count || 0,
          lastAccessed: newLink.last_accessed,
          createdAt: newLink.created_at?.toISOString() || new Date().toISOString(),
          updatedAt: newLink.updated_at?.toISOString() || new Date().toISOString(),
          projectId: newLink.project_id,
          userId: newLink.user_id,
          status: newLink.status,
          customTitle: newLink.custom_title,
          notes: newLink.notes
        })
      } catch (error) {
        console.error(`Error creating link ${linkData.url}:`, error)
      }
    }
    
    return createdLinks
  } catch (error) {
    console.error('Error bulk creating links:', error)
    throw error
  }
}