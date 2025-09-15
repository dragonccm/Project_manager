import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/mongo-database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, remember_me = false } = body

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await authenticateUser({
      username,
      password,
      remember_me
    })

    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: authResult.user,
      token: authResult.token, // Include token in response for localStorage
      expires_at: authResult.expires_at
    })

    // Set HTTP-only cookie with the JWT token
    response.cookies.set('auth-token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember_me ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/'
    })

    console.log('🍪 Set auth cookie for user:', authResult.user.username, 'Token length:', authResult.token.length)

    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}