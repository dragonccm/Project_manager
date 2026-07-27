import { MongoClient, Db, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Account, Task, Project, EmailTemplate, CodeComponent, Settings, ReportTemplate } from '@/types/database'
import { getJwtSecret } from '@/lib/auth-session'

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
    // Enhanced MongoDB connection with UTF-8 support
    client = new MongoClient(MONGODB_URI!, {
      // Ensure proper UTF-8 handling
      compressors: ['zlib'],
      readPreference: 'primary',
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
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
  console.log('getTasks called with userId:', userId)
  try {
    const { db } = await connectToDatabase()
    console.log('Database connected successfully')

    const objectId = require('mongodb').ObjectId
    console.log('ObjectId imported, converting userId to ObjectId')

    const userObjectId = new objectId(userId)
    console.log('User ObjectId created:', userObjectId)

    // Use aggregation to populate user information for task creators
    const tasks = await db.collection('tasks').aggregate([
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'created_by_user'
        }
      },
      { $unwind: { path: '$created_by_user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          project_id: 1,
          assigned_to: 1,
          status: 1,
          priority: 1,
          date: 1,
          estimated_time: 1,
          actual_time: 1,
          completed: 1,
          created_at: 1,
          updated_at: 1,
          user_id: 1,
          created_by: '$user_id',
          'created_by_user.id': '$created_by_user._id',
          'created_by_user.username': '$created_by_user.username',
          'created_by_user.full_name': { $ifNull: ['$created_by_user.full_name', '$created_by_user.username'] }
        }
      },
      { $sort: { created_at: -1 } }
    ]).toArray()
    console.log('Tasks aggregation completed, found:', tasks.length, 'tasks')

    const transformedTasks = tasks.map(task => ({
      ...task,
      id: task._id.toString(),
      created_by: task.created_by.toString(),
      created_by_user: task.created_by_user && task.created_by_user.id ? {
        id: task.created_by_user.id.toString(),
        username: task.created_by_user.username,
        full_name: task.created_by_user.full_name
      } : undefined,
      _id: undefined
    }))

    console.log('Tasks transformed successfully with user information')
    return transformedTasks
  } catch (error) {
    console.error('Error in getTasks:', error)
    throw error
  }
}

export async function createTask(taskData: any) {
  console.log('createTask called with data:', taskData)

  // Debug UTF-8 encoding for Vietnamese characters
  if (taskData.title) {
    console.log('Title encoding check:', {
      original: taskData.title,
      length: taskData.title.length,
      bytes: Buffer.byteLength(taskData.title, 'utf8'),
      encoded: encodeURIComponent(taskData.title)
    })
  }

  const { db } = await connectToDatabase()
  console.log('Database connected for task creation')

  const objectId = require('mongodb').ObjectId
  const newTask = {
    ...taskData,
    user_id: new objectId(taskData.user_id), // Convert user_id to ObjectId
    created_at: new Date(),
    updated_at: new Date()
  }
  console.log('Creating task with ObjectId user_id:', newTask.user_id)

  const result = await db.collection('tasks').insertOne(newTask)
  console.log('Task created successfully with ID:', result.insertedId)

  return {
    ...newTask,
    id: result.insertedId.toString(),
    user_id: taskData.user_id, // Return original string format for client
    _id: undefined
  }
}

export async function updateTask(id: string, userId: string, taskData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('tasks').findOneAndUpdate(
    { _id: new objectId(id), user_id: new objectId(userId) }, // Convert userId to ObjectId
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
    user_id: userId, // Return original string format
    _id: undefined
  }
}

export async function deleteTask(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  const result = await db.collection('tasks').deleteOne({ _id: new objectId(id), user_id: new objectId(userId) }) // Convert userId to ObjectId
  if (result.deletedCount === 0) throw new Error('Task not found')
}

// Code component operations (dùng cho cả Notes — xem app/api/notes)
// LƯU Ý: mọi hàm dưới đây BẮT BUỘC nhận userId và đưa vào filter.
// Trước đây chúng query theo _id không kèm user_id, khiến user A có thể
// đọc/sửa/xoá dữ liệu của user B nếu biết id.
export async function getCodeComponents(userId: string) {
  const { db } = await connectToDatabase()
  const components = await db
    .collection('code_components')
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .toArray()
  return components.map(component => ({
    ...component,
    id: component._id.toString(),
    _id: undefined
  }))
}

export async function getCodeComponentById(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const { ObjectId } = await import('mongodb')
  if (!ObjectId.isValid(id)) return null

  const component = await db
    .collection('code_components')
    .findOne({ _id: new ObjectId(id), user_id: userId })
  if (!component) return null

  return { ...component, id: component._id.toString(), _id: undefined }
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

export async function updateCodeComponent(id: string, userId: string, componentData: any) {
  const { db } = await connectToDatabase()
  const { ObjectId } = await import('mongodb')
  if (!ObjectId.isValid(id)) return null

  // Không cho ghi đè quyền sở hữu qua body request
  const { user_id: _ignored, ...safeData } = componentData

  const result = await db.collection('code_components').findOneAndUpdate(
    { _id: new ObjectId(id), user_id: userId },
    { $set: { ...safeData, updated_at: new Date() } },
    { returnDocument: 'after' }
  )

  if (!result) return null

  return { ...result, id: result._id.toString(), _id: undefined }
}

export async function deleteCodeComponent(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const { ObjectId } = await import('mongodb')
  if (!ObjectId.isValid(id)) return false

  const result = await db
    .collection('code_components')
    .deleteOne({ _id: new ObjectId(id), user_id: userId })
  return result.deletedCount > 0
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

export async function updateLink(id: string, userId: string, linkData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  if (!objectId.isValid(id)) throw new Error('Link not found')

  const { user_id: _ignored, ...safeData } = linkData

  const result = await db.collection('links').findOneAndUpdate(
    { _id: new objectId(id), user_id: userId },
    {
      $set: {
        ...safeData,
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

export async function deleteLink(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  if (!objectId.isValid(id)) return false

  const result = await db
    .collection('links')
    .deleteOne({ _id: new objectId(id), user_id: userId })
  return result.deletedCount > 0
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

export async function updateReportTemplate(id: string, userId: string, templateData: any) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  if (!objectId.isValid(id)) throw new Error('Report template not found')

  const { user_id: _ignored, ...safeData } = templateData

  const result = await db.collection('report_templates').findOneAndUpdate(
    { _id: new objectId(id), user_id: userId },
    {
      $set: {
        ...safeData,
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

export async function deleteReportTemplate(id: string, userId: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  if (!objectId.isValid(id)) return false

  const result = await db
    .collection('report_templates')
    .deleteOne({ _id: new objectId(id), user_id: userId })
  return result.deletedCount > 0
}

export async function duplicateReportTemplate(id: string, userId: string, newName: string) {
  const { db } = await connectToDatabase()
  const objectId = require('mongodb').ObjectId
  if (!objectId.isValid(id)) throw new Error('Report template not found')

  const originalTemplate = await db
    .collection('report_templates')
    .findOne({ _id: new objectId(id), user_id: userId })
  if (!originalTemplate) throw new Error('Report template not found')

  // Bỏ _id cũ để Mongo sinh id mới thay vì ghi đè bản gốc
  const { _id: _oldId, ...rest } = originalTemplate
  const duplicatedTemplate = {
    ...rest,
    name: newName,
    user_id: userId,
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
        throw new Error(`Tên đăng nhập "${duplicateValue}" đã tồn tại. Vui lòng chọn tên đăng nhập khác.`)
      } else if (duplicateField === 'email') {
        throw new Error(`Email "${duplicateValue}" đã được đăng ký. Vui lòng sử dụng địa chỉ email khác.`)
      } else {
        throw new Error(`Người dùng với ${duplicateField} này đã tồn tại.`)
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

  // So khớp mật khẩu bằng bcrypt.
  // Đã bỏ nhánh fallback cũ: nó cho phép đăng nhập bằng CHÍNH chuỗi hash
  // (`password === user.password_hash`) khi NODE_ENV=development — tức là ai
  // đọc được hash trong DB là đăng nhập được vào tài khoản đó.
  let passwordMatch = false
  try {
    if (!user.password_hash) {
      return null
    }
    passwordMatch = await bcrypt.compare(password, user.password_hash)
  } catch (error) {
    console.error('Bcrypt comparison error:', error)
    return null
  }

  if (!passwordMatch) {
    return null
  }

  // Dùng chung một nguồn secret với lib/auth-session.ts, nếu không token ký ra
  // sẽ không verify được.
  const JWT_SECRET = getJwtSecret()

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
