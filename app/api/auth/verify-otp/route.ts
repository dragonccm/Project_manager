import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import OTP from '@/lib/models/OTP'
import crypto from 'crypto'

// Rate limiting for verification attempts
const verifyRateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkVerifyRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const rateLimit = verifyRateLimitMap.get(email)

  if (!rateLimit || now > rateLimit.resetAt) {
    verifyRateLimitMap.set(email, {
      count: 1,
      resetAt: now + 15 * 60 * 1000 // 15 minutes
    })
    return { allowed: true }
  }

  if (rateLimit.count >= 10) {
    // Max 10 verification attempts per 15 minutes
    const remainingTime = Math.ceil((rateLimit.resetAt - now) / 1000 / 60)
    return { allowed: false, remainingTime }
  }

  rateLimit.count += 1
  return { allowed: true }
}

// POST /api/auth/verify-otp - Verify OTP code
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
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

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'OTP code must be 6 digits' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = checkVerifyRateLimit(email.toLowerCase())
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Too many verification attempts. Please try again in ${rateLimit.remainingTime} minutes.`,
          remainingTime: rateLimit.remainingTime
        },
        { status: 429 }
      )
    }

    // Find the most recent valid OTP for this email
    const otp = await OTP.findOne({
      email: email.toLowerCase(),
      verified: false
    }).sort({ createdAt: -1 })

    if (!otp) {
      return NextResponse.json(
        { error: 'No valid OTP found. Please request a new one.' },
        { status: 404 }
      )
    }

    // Check if OTP is still valid
    if (!otp.isValid()) {
      // Delete expired OTP
      await OTP.deleteOne({ _id: otp._id })
      
      if (otp.attempts >= otp.maxAttempts) {
        return NextResponse.json(
          { error: 'Maximum verification attempts exceeded. Please request a new OTP.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Verify the OTP code
    const isValid = await otp.verifyCode(code)

    if (!isValid) {
      await otp.save() // Save incremented attempts

      const remainingAttempts = otp.maxAttempts - otp.attempts

      if (remainingAttempts <= 0) {
        // Delete OTP after max attempts
        await OTP.deleteOne({ _id: otp._id })
        return NextResponse.json(
          { error: 'Maximum verification attempts exceeded. Please request a new OTP.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Invalid OTP code',
          remainingAttempts
        },
        { status: 401 }
      )
    }

    // OTP is valid - mark as verified
    otp.verified = true
    otp.usedAt = new Date()
    await otp.save()

    // Generate a temporary reset token (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    // Store reset token in a temporary collection
    await mongoose.connection.collection('password_reset_tokens').insertOne({
      email: email.toLowerCase(),
      token: resetToken,
      expiresAt: resetTokenExpiry,
      createdAt: new Date()
    })

    // Create TTL index if it doesn't exist
    try {
      await mongoose.connection.collection('password_reset_tokens').createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0 }
      )
    } catch (indexError) {
      // Index might already exist
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
      expiresIn: 900 // 15 minutes in seconds
    })

  } catch (error) {
    console.error('Error in verify OTP:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
