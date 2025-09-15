// Authentication middleware for API routes
import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    username: string
    email: string
    role: string
  }
}

export async function authenticateRequest(request: NextRequest): Promise<{
  isAuthenticated: boolean
  user?: any
  error?: string
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isAuthenticated: false, error: 'No authorization token provided' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyJWT(token)
    if (!decoded) {
      return { isAuthenticated: false, error: 'Invalid or expired token' }
    }

    return {
      isAuthenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { isAuthenticated: false, error: 'Authentication failed' }
  }
}

// Middleware function for API routes
export async function withAuth(
  handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const auth = await authenticateRequest(request)

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      )
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = auth.user

    return handler(authenticatedRequest, context)
  }
}

// Helper function to check if user has required role
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'viewer': 1,
    'user': 2,
    'admin': 3
  }

  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole as keyof typeof roleHierarchy]
}

// Middleware for admin-only routes
export async function withAdminAuth(
  handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const auth = await authenticateRequest(request)

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: auth.error || 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasRole(auth.user.role, 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = auth.user

    return handler(authenticatedRequest, context)
  }
}