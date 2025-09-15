import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth-database'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify session
    const user = await verifySession(token)

    if (!user) {
      // Token is invalid or expired
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
      response.cookies.delete('auth-token')
      return response
    }

    return NextResponse.json({
      success: true,
      user: user
    })
    
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}