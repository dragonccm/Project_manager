import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Cookie cleared. Please login again.',
      action: 'redirect_to_login'
    })

    // Force clear the auth cookie with multiple methods
    response.cookies.delete('auth-token')
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Clear cookie error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cookie' },
      { status: 500 }
    )
  }
}