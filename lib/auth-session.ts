// Simple session-based authentication for Next.js 15
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Nguồn duy nhất cho JWT secret. Trước đây file này và lib/mongo-database.ts
// mỗi nơi tự đặt một fallback KHÁC NHAU, nên khi thiếu JWT_SECRET thì token
// được ký bằng secret này lại bị xác thực bằng secret kia → luôn đăng nhập hụt.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      'JWT_SECRET chưa được cấu hình. Copy .env.example thành .env và điền giá trị.'
    )
  }
  return secret
}

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
    getJwtSecret(),
    { expiresIn: '7d' }
  )
    
  return token
}

// Verify JWT token
export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, getJwtSecret()) as User
  } catch (error) {
    // Chỉ log loại lỗi, KHÔNG log token — đây là credential.
    const reason = error instanceof Error ? error.name : 'Unknown'
    console.warn(`Token verification failed: ${reason}`)
    return null
  }
}

// Get user from request (from cookie or Authorization header)
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // KHÔNG log nội dung cookie/token ở đây: request.cookies chứa cookie của
    // MỌI ứng dụng chạy trên cùng host (localhost dùng chung cookie giữa các
    // port), nên việc in ra sẽ làm lộ session của app khác vào log.

    // Try Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return verifyToken(authHeader.substring(7))
    }

    // Try cookie
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      return verifyToken(token)
    }

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