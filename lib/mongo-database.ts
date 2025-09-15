import { MongoClient, Db, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Account, Task, Project, EmailTemplate, CodeComponent, Settings, ReportTemplate } from '@/types/database'

let client: MongoClient | null = null
let db: Db | null = null

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

export async function connectToDatabase() {
  if (client && db) {
    return { client, db }
  }

  try {
    client = new MongoClient(MONGODB_URI!)
    await client.connect()
    db = client.db()
    
    console.log('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function testDatabaseConnection() {
  try {
    await connectToDatabase()
    return { success: true }
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return { success: false, error: error.message || String(error) }
  }
}

// Project operations
export async function getProjects(userId: string) {
  const { db } = await connectToDatabase()
  const projects = await db.collection('projects').find({ user_id: userId }).sort({ created_at: -1 }).toArray()
  return projects.map(project => ({
    ...project,
    id: project._id.toString(),
    _id: undefined
  }))
}

export async function createProject(projectData: any) {
  const { db } = await connectToDatabase()
  const newProject = {
    ...projectData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('projects').insertOne(newProject)
  return {
    ...newProject,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

export async function updateProject(id: string, userId: string, projectData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('projects').findOneAndUpdate(
    { _id: new objectId(id), user_id: userId },
    { 
      $set: { 
        ...projectData, 
        updated_at: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  if (!result) throw new Error('Project not found')
  
  return {
    ...result,
    id: result._id.toString(),
    _id: undefined
  }
}

export async function deleteProject(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('projects').deleteOne({ _id: new objectId(id), user_id: userId })
  if (result.deletedCount === 0) throw new Error('Project not found')
}

// Account operations
export async function getAccounts(userId: string) {
  const { db } = await connectToDatabase()
  const accounts = await db.collection('accounts').find({ user_id: userId }).sort({ created_at: -1 }).toArray()
  return accounts.map(account => ({
    ...account,
    id: account._id.toString(),
    _id: undefined
  }))
}

export async function createAccount(accountData: any) {
  const { db } = await connectToDatabase()
  const newAccount = {
    ...accountData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('accounts').insertOne(newAccount)
  return {
    ...newAccount,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

export async function deleteAccount(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('accounts').deleteOne({ _id: new objectId(id), user_id: userId })
  if (result.deletedCount === 0) throw new Error('Account not found')
}

// Task operations
export async function getTasks(userId: string) {
  const { db } = await connectToDatabase()
  const tasks = await db.collection('tasks').find({ user_id: userId }).sort({ created_at: -1 }).toArray()
  return tasks.map(task => ({
    ...task,
    id: task._id.toString(),
    _id: undefined
  }))
}

export async function createTask(taskData: any) {
  const { db } = await connectToDatabase()
  const newTask = {
    ...taskData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('tasks').insertOne(newTask)
  return {
    ...newTask,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

export async function updateTask(id: string, userId: string, taskData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('tasks').findOneAndUpdate(
    { _id: new objectId(id), user_id: userId },
    { 
      $set: { 
        ...taskData, 
        updated_at: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  if (!result) throw new Error('Task not found')
  
  return {
    ...result,
    id: result._id.toString(),
    _id: undefined
  }
}

export async function deleteTask(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('tasks').deleteOne({ _id: new objectId(id), user_id: userId })
  if (result.deletedCount === 0) throw new Error('Task not found')
}

// Email template operations
export async function getEmailTemplates() {
  const { db } = await connectToDatabase()
  const templates = await db.collection('email_templates').find({}).sort({ created_at: -1 }).toArray()
  return templates.map(template => ({
    ...template,
    id: template._id.toString(),
    _id: undefined
  }))
}

export async function createEmailTemplate(templateData: any) {
  const { db } = await connectToDatabase()
  const newTemplate = {
    ...templateData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('email_templates').insertOne(newTemplate)
  return {
    ...newTemplate,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

// Code component operations
export async function getCodeComponents() {
  const { db } = await connectToDatabase()
  const components = await db.collection('code_components').find({}).sort({ created_at: -1 }).toArray()
  return components.map(component => ({
    ...component,
    id: component._id.toString(),
    _id: undefined
  }))
}

export async function createCodeComponent(componentData: any) {
  const { db } = await connectToDatabase()
  const newComponent = {
    ...componentData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('code_components').insertOne(newComponent)
  return {
    ...newComponent,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

// Link operations
export async function getLinks(userId: string) {
  const { db } = await connectToDatabase()
  const links = await db.collection('links').find({ user_id: userId }).sort({ created_at: -1 }).toArray()
  return links.map(link => ({
    ...link,
    id: link._id.toString(),
    _id: undefined
  }))
}

export async function createLink(linkData: any) {
  const { db } = await connectToDatabase()
  const newLink = {
    ...linkData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('links').insertOne(newLink)
  return {
    ...newLink,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

export async function updateLink(id: string, linkData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('links').findOneAndUpdate(
    { _id: new objectId(id) },
    { 
      $set: { 
        ...linkData, 
        updated_at: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  if (!result) throw new Error('Link not found')
  
  return {
    ...result,
    id: result._id.toString(),
    _id: undefined
  }
}

export async function deleteLink(id: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  await db.collection('links').deleteOne({ _id: new objectId(id) })
}

export async function bulkCreateLinks(linksData: any[]) {
  const { db } = await connectToDatabase()
  const linksWithTimestamps = linksData.map(link => ({
    ...link,
    created_at: new Date(),
    updated_at: new Date()
  }))
  const result = await db.collection('links').insertMany(linksWithTimestamps)
  return result.insertedIds
}

// Report template operations
export async function getReportTemplates(user_id?: string) {
  const { db } = await connectToDatabase()
  const filter = user_id ? { user_id } : {}
  const templates = await db.collection('report_templates').find(filter).sort({ created_at: -1 }).toArray()
  return templates.map(template => ({
    ...template,
    id: template._id.toString(),
    _id: undefined
  }))
}

export async function createReportTemplate(templateData: any) {
  const { db } = await connectToDatabase()
  const newTemplate = {
    ...templateData,
    created_at: new Date(),
    updated_at: new Date()
  }
  const result = await db.collection('report_templates').insertOne(newTemplate)
  return {
    ...newTemplate,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

export async function updateReportTemplate(id: string, templateData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('report_templates').findOneAndUpdate(
    { _id: new objectId(id) },
    { 
      $set: { 
        ...templateData, 
        updated_at: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  if (!result) throw new Error('Report template not found')
  
  return {
    ...result,
    id: result._id.toString(),
    _id: undefined
  }
}

export async function deleteReportTemplate(id: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  await db.collection('report_templates').deleteOne({ _id: new objectId(id) })
}

export async function duplicateReportTemplate(id: string, newName: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  
  const originalTemplate = await db.collection('report_templates').findOne({ _id: new objectId(id) })
  if (!originalTemplate) throw new Error('Report template not found')
  
  const duplicatedTemplate = {
    ...originalTemplate,
    name: newName,
    created_at: new Date(),
    updated_at: new Date()
  }
  
  const result = await db.collection('report_templates').insertOne(duplicatedTemplate)
  return {
    ...duplicatedTemplate,
    id: result.insertedId.toString(),
    _id: undefined
  }
}

// Auth operations
export async function createUser(userData: any) {
  const { db } = await connectToDatabase()
  
  // Hash password if provided
  if (userData.password) {
    const saltRounds = 10
    userData.password_hash = await bcrypt.hash(userData.password, saltRounds)
    delete userData.password // Don't store plain password
  }
  
  const newUser = {
    ...userData,
    created_at: new Date(),
    updated_at: new Date()
  }
  
  try {
    const result = await db.collection('users').insertOne(newUser)
    return {
      ...newUser,
      id: result.insertedId.toString(),
      _id: undefined
    }
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0]
      const duplicateValue = error.keyValue[duplicateField]
      
      if (duplicateField === 'username') {
        throw new Error(`Username "${duplicateValue}" already exists. Please choose a different username.`)
      } else if (duplicateField === 'email') {
        throw new Error(`Email "${duplicateValue}" is already registered. Please use a different email address.`)
      } else {
        throw new Error(`A user with this ${duplicateField} already exists.`)
      }
    }
    
    // Re-throw other errors
    throw error
  }
}

export async function authenticateUser({ username, password, remember_me = false }: {
  username: string;
  password: string;
  remember_me?: boolean;
}) {
  const { db } = await connectToDatabase()
  
  // Find user by username or email
  const user = await db.collection('users').findOne({
    $or: [
      { username: username },
      { email: username }
    ]
  })
  
  if (!user) {
    return null
  }
  
  console.log('🔍 User found:', { 
    id: user._id, 
    username: user.username, 
    hasPasswordHash: !!user.password_hash,
    passwordHashType: typeof user.password_hash
  })
  
  // Compare password using bcrypt with error handling
  let passwordMatch = false
  try {
    if (!user.password_hash) {
      console.log('❌ No password hash found for user')
      return null
    }
    
    passwordMatch = await bcrypt.compare(password, user.password_hash)
    console.log('🔐 Password comparison result:', passwordMatch)
  } catch (error) {
    console.error('❌ Bcrypt comparison error:', error)
    
    // Fallback: check if it's a plain text password (for debugging/development)
    if (process.env.NODE_ENV === 'development' && password === user.password_hash) {
      console.log('🔓 Using fallback password comparison for development')
      passwordMatch = true
    } else {
      return null
    }
  }
  if (!passwordMatch) {
    return null
  }
  
  // Get JWT secret
  const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'
  
  // Generate JWT token
  const userPayload = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  }
  
  const token = jwt.sign(userPayload, JWT_SECRET, {
    expiresIn: remember_me ? '30d' : '7d'
  })
  
  console.log('✅ Generated JWT token for user:', user.username, 'Token length:', token.length, 'Preview:', token.substring(0, 50) + '...')
  
  const expires_at = new Date(Date.now() + (remember_me ? 30 : 7) * 24 * 60 * 60 * 1000)
  
  // Store session
  await db.collection('sessions').insertOne({
    user_id: user._id.toString(),
    token,
    expires_at,
    created_at: new Date()
  })
  
  return {
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    token,
    expires_at
  }
}

export async function logout(token: string) {
  const { db } = await connectToDatabase()
  await db.collection('sessions').deleteOne({ token })
}

export async function verifyUserToken(token: string) {
  const { db } = await connectToDatabase()
  
  const session = await db.collection('sessions').findOne({
    token,
    expires_at: { $gt: new Date() }
  })
  
  if (!session) {
    return null
  }
  
  const user = await db.collection('users').findOne({
    _id: new ObjectId(session.user_id)
  })
  
  if (!user) {
    return null
  }
  
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  }
}

// Settings operations
export async function getSettings() {
  const { db } = await connectToDatabase()
  const settings = await db.collection('settings').findOne({ user_id: 'default' })
  
  if (!settings) {
    const defaultSettings = {
      language: "en",
      theme: "light",
      notifications: { email: true, desktop: false, tasks: true },
      custom_colors: { primary: "#3b82f6", secondary: "#64748b", accent: "#f59e0b", background: "#ffffff" },
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('settings').insertOne({ user_id: 'default', ...defaultSettings })
    return defaultSettings
  }
  
  return {
    ...settings,
    id: settings._id.toString(),
    _id: undefined
  }
}

export async function updateSettings(settingsData: any) {
  const { db } = await connectToDatabase()
  const result = await db.collection('settings').findOneAndUpdate(
    { user_id: 'default' },
    { 
      $set: { 
        ...settingsData, 
        updated_at: new Date() 
      } 
    },
    { returnDocument: 'after', upsert: true }
  )
  
  if (!result) {
    throw new Error('Failed to update settings')
  }
  
  return {
    ...result,
    id: result._id.toString(),
    _id: undefined
  }
}