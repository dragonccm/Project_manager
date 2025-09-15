// Authentication database functions
import { User, CreateUserInput, UpdateUserInput, LoginCredentials, AuthResponse, Session } from '@/types/auth'
import { hashPassword, verifyPassword, generateJWT, generateToken } from './auth-utils'

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

// Initialize authentication models
async function initializeAuthModels() {
  const mongooseLib = await initializeMongoose()
  
  if (Object.keys(Models).length > 0) return Models

  // User authentication schemas
  const userSchema = new mongooseLib.default.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    avatar_url: String,
    role: { type: String, enum: ['admin', 'user', 'viewer'], default: 'user' },
    email_verified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  })

  const sessionSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    last_accessed: { type: Date, default: Date.now }
  })

  const passwordResetSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
  })

  const emailVerificationSchema = new mongooseLib.default.Schema({
    user_id: { type: mongooseLib.default.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
    verified_at: Date,
    created_at: { type: Date, default: Date.now }
  })

  // Authentication models
  Models.User = mongooseLib.default.models.User || mongooseLib.default.model('User', userSchema)
  Models.Session = mongooseLib.default.models.Session || mongooseLib.default.model('Session', sessionSchema)
  Models.PasswordReset = mongooseLib.default.models.PasswordReset || mongooseLib.default.model('PasswordReset', passwordResetSchema)
  Models.EmailVerification = mongooseLib.default.models.EmailVerification || mongooseLib.default.model('EmailVerification', emailVerificationSchema)

  return Models
}

// Helper function to prepare auth database
async function prepareAuthDatabase() {
  if (typeof window !== 'undefined') {
    throw new Error("Database operations can only be performed on server-side")
  }
  
  await connectToDatabase()
  return await initializeAuthModels()
}

// ===== USER MANAGEMENT FUNCTIONS =====

export async function createUser(userData: CreateUserInput): Promise<User> {
  try {
    const models = await prepareAuthDatabase()
    
    // Check if user already exists
    const existingUser = await models.User.findOne({
      $or: [{ username: userData.username }, { email: userData.email }]
    })
    
    if (existingUser) {
      throw new Error('Username or email already exists')
    }
    
    // Hash password
    const password_hash = hashPassword(userData.password)
    
    const user = await models.User.create({
      ...userData,
      password_hash,
      email_verified: false
    })
    
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at?.toISOString() || new Date().toISOString(),
      updated_at: user.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const models = await prepareAuthDatabase()
    const mongooseLib = await initializeMongoose()
    const user = await models.User.findById(new mongooseLib.default.Types.ObjectId(id))
    
    if (!user) return null
    
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at?.toISOString() || new Date().toISOString(),
      updated_at: user.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const models = await prepareAuthDatabase()
    const user = await models.User.findOne({ username })
    
    if (!user) return null
    
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at?.toISOString() || new Date().toISOString(),
      updated_at: user.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting user by username:', error)
    throw error
  }
}

export async function updateUser(id: string, updates: UpdateUserInput): Promise<User> {
  try {
    const models = await prepareAuthDatabase()
    const mongooseLib = await initializeMongoose()
    const updated = await models.User.findByIdAndUpdate(
      new mongooseLib.default.Types.ObjectId(id),
      { ...updates, updated_at: new Date() },
      { new: true }
    )
    
    if (!updated) throw new Error('User not found')
    
    return {
      id: updated._id.toString(),
      username: updated.username,
      email: updated.email,
      full_name: updated.full_name,
      avatar_url: updated.avatar_url,
      role: updated.role,
      email_verified: updated.email_verified,
      created_at: updated.created_at?.toISOString() || new Date().toISOString(),
      updated_at: updated.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// ===== AUTHENTICATION FUNCTIONS =====

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse | null> {
  try {
    const models = await prepareAuthDatabase()
    const user = await models.User.findOne({ username: credentials.username })
    
    if (!user || !verifyPassword(credentials.password, user.password_hash)) {
      return null
    }
    
    // Generate JWT token
    const { token, expires_at } = generateJWT(
      { userId: user._id.toString(), username: user.username, role: user.role },
      credentials.remember_me ? '30d' : '7d'
    )
    
    // Create session
    await models.Session.create({
      user_id: user._id,
      token,
      expires_at,
      last_accessed: new Date()
    })
    
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at?.toISOString() || new Date().toISOString(),
        updated_at: user.updated_at?.toISOString() || new Date().toISOString()
      },
      token,
      expires_at: expires_at.toISOString()
    }
  } catch (error) {
    console.error('Error authenticating user:', error)
    throw error
  }
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const models = await prepareAuthDatabase()
    const session = await models.Session.findOne({ token, expires_at: { $gt: new Date() } })
      .populate('user_id')
    
    if (!session || !session.user_id) return null
    
    // Update last accessed time
    await models.Session.updateOne({ _id: session._id }, { last_accessed: new Date() })
    
    const user = session.user_id
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at?.toISOString() || new Date().toISOString(),
      updated_at: user.updated_at?.toISOString() || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error verifying session:', error)
    throw error
  }
}

export async function logout(token: string): Promise<void> {
  try {
    const models = await prepareAuthDatabase()
    await models.Session.deleteOne({ token })
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  try {
    const models = await prepareAuthDatabase()
    const mongooseLib = await initializeMongoose()
    const sessions = await models.Session.find({ 
      user_id: new mongooseLib.default.Types.ObjectId(userId),
      expires_at: { $gt: new Date() }
    }).sort({ last_accessed: -1 })
    
    return sessions.map((session: any) => ({
      id: session._id.toString(),
      user_id: session.user_id.toString(),
      token: session.token,
      expires_at: session.expires_at?.toISOString() || new Date().toISOString(),
      created_at: session.created_at?.toISOString() || new Date().toISOString(),
      last_accessed: session.last_accessed?.toISOString() || new Date().toISOString()
    }))
  } catch (error) {
    console.error('Error getting user sessions:', error)
    throw error
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const models = await prepareAuthDatabase()
    await models.Session.deleteMany({ expires_at: { $lt: new Date() } })
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    throw error
  }
}