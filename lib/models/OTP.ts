import mongoose, { Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// OTP Document interface
interface IOTPDocument extends Document {
  email: string
  code: string
  expiresAt: Date
  attempts: number
  maxAttempts: number
  verified: boolean
  usedAt?: Date
  ipAddress?: string
  userAgent?: string
  verifyCode(inputCode: string): Promise<boolean>
  isValid(): boolean
}

// OTP Model interface with static methods
interface IOTPModel extends Model<IOTPDocument> {
  generateCode(): string
  createOTP(email: string, ipAddress?: string, userAgent?: string): Promise<{ otpId: any; code: string }>
}

// OTP Code Schema for password recovery
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'otp_codes'
})

// TTL index - MongoDB automatically removes expired OTPs
OTPSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0 
})

// Compound index for efficient queries
OTPSchema.index({ email: 1, verified: 1 })

// Hash OTP code before saving
OTPSchema.pre('save', async function(next) {
  if (!this.isModified('code')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.code = await bcrypt.hash(this.code, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to verify OTP code
OTPSchema.methods.verifyCode = async function(inputCode: string): Promise<boolean> {
  // Check if OTP is expired
  if (new Date() > this.expiresAt) {
    return false
  }
  
  // Check if OTP is already verified/used
  if (this.verified) {
    return false
  }
  
  // Check if max attempts exceeded
  if (this.attempts >= this.maxAttempts) {
    return false
  }
  
  // Increment attempts
  this.attempts += 1
  await this.save()
  
  // Verify code
  const isMatch = await bcrypt.compare(inputCode, this.code)
  
  if (isMatch) {
    this.verified = true
    this.usedAt = new Date()
    await this.save()
  }
  
  return isMatch
}

// Method to check if OTP is still valid
OTPSchema.methods.isValid = function(): boolean {
  return !this.verified && 
         new Date() < this.expiresAt && 
         this.attempts < this.maxAttempts
}

// Static method to generate OTP code
OTPSchema.statics.generateCode = function(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to create new OTP
OTPSchema.statics.createOTP = async function(email: string, ipAddress?: string, userAgent?: string) {
  // Invalidate all previous OTPs for this email
  await this.updateMany(
    { email, verified: false },
    { $set: { verified: true } }
  )
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  const otp = await this.create({
    email,
    code,
    expiresAt,
    ipAddress,
    userAgent
  })
  
  // Return plain code (before hashing was applied by pre-save hook)
  return { otpId: otp._id, code }
}

const OTP = (mongoose.models.OTP || mongoose.model<IOTPDocument, IOTPModel>('OTP', OTPSchema)) as IOTPModel

export default OTP
