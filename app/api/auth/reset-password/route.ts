import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password - Reset password with verified token
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { resetToken, newPassword, confirmPassword } = body

    // Validate input
    if (!resetToken || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Reset token and passwords are required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check password complexity (at least one uppercase, one lowercase, one number)
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          requirements: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            minLength: newPassword.length >= 8
          }
        },
        { status: 400 }
      )
    }

    // Verify reset token
    const resetTokenDoc = await mongoose.connection.collection('password_reset_tokens').findOne({
      token: resetToken
    })

    if (!resetTokenDoc) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      )
    }

    // Check if token has expired
    if (new Date() > new Date(resetTokenDoc.expiresAt)) {
      // Delete expired token
      await mongoose.connection.collection('password_reset_tokens').deleteOne({
        _id: resetTokenDoc._id
      })
      
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new OTP.' },
        { status: 410 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password
    const updateResult = await mongoose.connection.collection('users').updateOne(
      { email: resetTokenDoc.email },
      { 
        $set: { 
          password: hashedPassword,
          passwordUpdatedAt: new Date()
        } 
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete the reset token (one-time use)
    await mongoose.connection.collection('password_reset_tokens').deleteOne({
      _id: resetTokenDoc._id
    })

    // Delete all OTPs for this email
    await mongoose.connection.collection('otps').deleteMany({
      email: resetTokenDoc.email
    })

    // Invalidate all existing sessions for this user (security measure)
    // In a production app, you'd delete from your sessions collection
    await mongoose.connection.collection('sessions').deleteMany({
      email: resetTokenDoc.email
    })

    // Log password reset for audit trail
    await mongoose.connection.collection('audit_logs').insertOne({
      email: resetTokenDoc.email,
      action: 'password_reset',
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    })

  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
