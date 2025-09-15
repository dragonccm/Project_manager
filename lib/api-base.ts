import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'
import { ERROR_MESSAGES } from '@/lib/constants'

// Base API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Standard API response helpers
export const createSuccessResponse = <T>(data: T, message?: string): NextResponse => {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export const createErrorResponse = (
  error: string, 
  status: number = 500,
  message?: string
): NextResponse => {
  return NextResponse.json({
    success: false,
    error,
    message,
  }, { status })
}

// Standard error handlers
export const handleApiError = (error: unknown, context: string): NextResponse => {
  console.error(`${context} error:`, error)
  
  if (error instanceof Error) {
    return createErrorResponse(
      ERROR_MESSAGES.SERVER_ERROR,
      500,
      `${context}: ${error.message}`
    )
  }
  
  return createErrorResponse(
    ERROR_MESSAGES.SERVER_ERROR,
    500,
    `${context}: Unknown error occurred`
  )
}

// Validation helpers
export const validateRequired = (data: any, fields: string[]): string[] => {
  const missing: string[] = []
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field)
    }
  }
  
  return missing
}

// Pagination helpers
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export const parsePaginationParams = (request: NextRequest): PaginationParams => {
  const { searchParams } = new URL(request.url)
  
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10'))),
    offset: parseInt(searchParams.get('offset') || '0'),
  }
}

// Authentication wrapper for API routes
export const createAuthenticatedRoute = (
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) => {
  return withAuth(handler)
}

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Standard CRUD operation types
export interface CrudOperations<T, CreateInput, UpdateInput> {
  getAll: (userId: string, pagination?: PaginationParams) => Promise<T[]>
  getById: (id: string, userId: string) => Promise<T | null>
  create: (data: CreateInput, userId: string) => Promise<T>
  update: (id: string, data: UpdateInput, userId: string) => Promise<T>
  delete: (id: string, userId: string) => Promise<boolean>
}
