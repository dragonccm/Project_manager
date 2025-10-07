import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import Share from '@/lib/models/Share'
import mongoose from 'mongoose'

// POST /api/share - Create a new share link
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { resourceType, resourceId, expiresIn, customExpiryDate, createdBy } = body

    // Validate input
    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'Resource type and ID are required' },
        { status: 400 }
      )
    }

    // Validate resource type
    const validTypes = ['task', 'note', 'account', 'project', 'report']
    if (!validTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resource type' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = randomUUID()

    // Calculate expiration date
    let expiresAt: Date | null = null
    if (expiresIn === 'custom' && customExpiryDate) {
      // Use custom date provided by user
      expiresAt = new Date(customExpiryDate)
      // Validate custom date is in the future
      if (expiresAt <= new Date()) {
        return NextResponse.json(
          { error: 'Custom expiry date must be in the future' },
          { status: 400 }
        )
      }
    } else if (expiresIn) {
      const now = new Date()
      switch (expiresIn) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000)
          break
        case '24h':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case '1d':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case '1M':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case 'never':
          expiresAt = null
          break
        default:
          // Default to 7 days
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    } else {
      // Default to 7 days if not specified
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    // Create share link
    const share = await Share.create({
      token,
      resourceType,
      resourceId,
      createdBy,
      expiresAt,
      accessCount: 0
    })

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${token}`

    return NextResponse.json({
      success: true,
      shareId: share._id,
      token,
      shareUrl,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      accessCount: 0
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}

// GET /api/share - List all shares with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1

    // Build filter query
    const filter: any = {}
    
    if (resourceType) {
      filter.resourceType = resourceType
    }
    
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true'
    }
    
    if (search) {
      filter.$or = [
        { token: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch shares with pagination
    const [shares, totalCount] = await Promise.all([
      Share.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Share.countDocuments(filter)
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: shares,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })

  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}

// PUT /api/share - Update share expiry date
export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { shareId, expiresAt } = body

    // Validate input
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    // Find share
    const share = await Share.findById(shareId)
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      )
    }

    // Update expiry date
    const newExpiryDate = expiresAt ? new Date(expiresAt) : null
    
    // Validate date is in the future if provided
    if (newExpiryDate && newExpiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      )
    }

    await share.updateExpiry(newExpiryDate)

    return NextResponse.json({
      success: true,
      share: {
        id: share._id,
        token: share.token,
        expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null
      }
    })

  } catch (error) {
    console.error('Error updating share expiry:', error)
    return NextResponse.json(
      { error: 'Failed to update share expiry' },
      { status: 500 }
    )
  }
}

// PATCH /api/share - Toggle share active status
export async function PATCH(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const body = await request.json()
    const { shareId } = body

    // Validate input
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    // Find share
    const share = await Share.findById(shareId)
    if (!share) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      )
    }

    // Toggle active status
    await share.toggleActive()

    return NextResponse.json({
      success: true,
      share: {
        id: share._id,
        token: share.token,
        isActive: share.isActive
      }
    })

  } catch (error) {
    console.error('Error toggling share status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle share status' },
      { status: 500 }
    )
  }
}
