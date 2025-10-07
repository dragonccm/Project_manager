import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import OTP from '@/lib/models/OTP'
import { sendEmail } from '@/lib/email'

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const rateLimit = rateLimitMap.get(email)

  if (!rateLimit || now > rateLimit.resetAt) {
    // Reset or create new rate limit
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000 // 1 hour
    })
    return { allowed: true }
  }

  if (rateLimit.count >= 3) {
    // Max 3 requests per hour
    const remainingTime = Math.ceil((rateLimit.resetAt - now) / 1000 / 60) // minutes
    return { allowed: false, remainingTime }
  }

  rateLimit.count += 1
  return { allowed: true }
}

// POST /api/auth/forgot-password - Request OTP for password reset
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email.toLowerCase())
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Too many requests. Please try again in ${rateLimit.remainingTime} minutes.`,
          remainingTime: rateLimit.remainingTime
        },
        { status: 429 }
      )
    }

    // Check if user exists (prevent email enumeration by returning same message)
    // In a real app, you'd query your users collection
    const userExists = await mongoose.connection.collection('users').findOne({ 
      email: email.toLowerCase() 
    })

    // Get client info for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (userExists) {
      // Generate and send OTP
      const { code } = await OTP.createOTP(
        email.toLowerCase(),
        ipAddress,
        userAgent
      )

      // Send OTP via email
      try {
        await sendEmail({
          to: email,
          subject: 'Password Reset - OTP Code',
          text: `Your OTP code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>You requested to reset your password. Use the following OTP code:</p>
              <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
              <p style="color: #666;">If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Error sending OTP email:', emailError)
        // Don't reveal email sending failure
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, an OTP code has been sent.',
      expiresIn: 600 // 10 minutes in seconds
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
