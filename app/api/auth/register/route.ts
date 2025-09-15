import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/mongo-database'
import { isValidEmail, isValidUsername, isValidPassword } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, full_name } = body

    // Force role to be 'user' - admin accounts should not be created through public registration
    const role = 'user'

    // Validation
    if (!username || !email || !password || !full_name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const passwordValidation = isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await createUser({
      username,
      email,
      password,
      full_name,
      role
    })

    // Don't return sensitive data
    const { ...userResponse } = newUser
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}