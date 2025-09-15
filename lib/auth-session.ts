// Simple session-based authentication for Next.js 15
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development'

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: User
}

// Create JWT token
export function createToken(user: User): string {
  const token = jwt.sign(
    { 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
    
  return token
}

// Verify JWT token
export function verifyToken(token: string): User | null {
  try {
    console.log('🔍 Attempting to verify token:', token?.substring(0, 30) + '...', 'Full length:', token.length)
    const payload = jwt.verify(token, JWT_SECRET) as User
    console.log('✅ Token verified successfully for user:', payload.username)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    console.log('Token that failed:', token)
    return null
  }
}

// Get user from request (from cookie or Authorization header)
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Debug: log all cookies
    console.log('🍪 All cookies received:', Object.fromEntries(request.cookies))
    
    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔑 Verifying Bearer token:', token?.substring(0, 20) + '...')
      return verifyToken(token)
    }

    // Try cookie
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      console.log('🍪 Verifying cookie token:', token?.substring(0, 20) + '...', 'Length:', token.length)
      return verifyToken(token)
    }

    console.log('❌ No auth token found in request')
    return null
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

// Authentication wrapper for API routes
export function withAuth<T extends any[]>(
  handler: (request: AuthenticatedRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      const response = NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
      
      // Clear invalid auth cookie to force fresh login
      response.cookies.delete('auth-token')
      
      return response
    }

    // Create authenticated request
    const authenticatedRequest = Object.assign(request, { user }) as AuthenticatedRequest
    
    return handler(authenticatedRequest, ...args)
  }
}

// Set authentication cookie
export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
  return response
}

// Clear authentication cookie
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('auth-token')
  return response
}