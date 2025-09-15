import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/lib/mongo-database'

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (token) {
      // Remove session from database
      await logout(token)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    // Clear the HTTP-only cookie
    response.cookies.delete('auth-token')

    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, clear the cookie
    const response = NextResponse.json(
      { success: true, message: 'Logout completed' }
    )
    response.cookies.delete('auth-token')
    
    return response
  }
}