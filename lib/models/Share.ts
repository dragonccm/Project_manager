import mongoose from 'mongoose'

// Share Link Schema for public sharing
const ShareSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['task', 'note', 'account', 'project', 'report'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  createdBy: {
    type: String,
    required: false // Optional: user ID or email who created the share
  },
  expiresAt: {
    type: Date,
    required: false, // null means never expires
    index: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    required: false
  },
  viewHistory: [{
    viewedAt: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }],
  resourceName: {
    type: String,
    required: false // Store the name of the shared resource for easy display
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false // Store additional share-specific data
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'shares'
})

// Index for cleanup of expired shares
ShareSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0 // TTL index - MongoDB automatically removes expired documents
})

// Compound index for efficient queries
ShareSchema.index({ resourceType: 1, resourceId: 1 })

// Method to check if share is expired
ShareSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false
  return new Date() > this.expiresAt
}

// Method to check if share is active and not expired
ShareSchema.methods.isAvailable = function() {
  return this.isActive && !this.isExpired()
}

// Method to increment access count with tracking
ShareSchema.methods.incrementAccess = async function(ipAddress?: string, userAgent?: string) {
  this.accessCount += 1
  this.lastAccessedAt = new Date()
  
  // Add to view history (keep last 100 views to avoid bloating)
  if (!this.viewHistory) this.viewHistory = []
  this.viewHistory.push({
    viewedAt: new Date(),
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown'
  })
  
  // Keep only last 100 views
  if (this.viewHistory.length > 100) {
    this.viewHistory = this.viewHistory.slice(-100)
  }
  
  await this.save()
}

// Method to update expiry date
ShareSchema.methods.updateExpiry = async function(newExpiryDate: Date | null) {
  this.expiresAt = newExpiryDate
  await this.save()
}

// Method to toggle active status
ShareSchema.methods.toggleActive = async function() {
  this.isActive = !this.isActive
  await this.save()
}

export default mongoose.models.Share || mongoose.model('Share', ShareSchema)
