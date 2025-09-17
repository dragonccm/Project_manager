import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-session'

export async function GET(request: NextRequest) {
  try {
    // Use the same auth logic as other endpoints
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
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