// Authentication utility functions
import crypto from 'crypto'

// Hash password using bcrypt-like approach with crypto
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':')
    if (!salt || !hash) return false
    
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
    return hash === verifyHash
  } catch (error) {
    return false
  }
}

// Generate random token
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Generate JWT-like token (simple implementation)
export function generateJWT(payload: any, expiresIn: string = '7d'): { token: string, expires_at: Date } {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  
  const now = new Date()
  const expires_at = new Date()
  
  // Parse expiresIn (7d, 24h, 60m, etc.)
  const timeMatch = expiresIn.match(/^(\d+)([dhm])$/)
  if (timeMatch) {
    const [, amount, unit] = timeMatch
    const num = parseInt(amount)
    switch (unit) {
      case 'd': expires_at.setDate(now.getDate() + num); break
      case 'h': expires_at.setHours(now.getHours() + num); break
      case 'm': expires_at.setMinutes(now.getMinutes() + num); break
    }
  } else {
    expires_at.setDate(now.getDate() + 7) // Default 7 days
  }
  
  const payloadWithExp = {
    ...payload,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(expires_at.getTime() / 1000)
  }
  
  const payloadBase64 = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url')
  
  // Simple signature (in production, use proper JWT library)
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payloadBase64}`)
    .digest('base64url')
  
  const token = `${header}.${payloadBase64}.${signature}`
  
  return { token, expires_at }
}

// Verify JWT token
export function verifyJWT(token: string): any {
  try {
    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) return null
    
    // Verify signature
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url')
    
    if (signature !== expectedSignature) return null
    
    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString())
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null // Token expired
    }
    
    return decodedPayload
  } catch (error) {
    return null
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate username format
export function isValidUsername(username: string): boolean {
  // Allow alphanumeric characters and underscores, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean, message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }
  
  return { valid: true }
}