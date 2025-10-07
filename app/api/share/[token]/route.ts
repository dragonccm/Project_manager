import { NextRequest, NextResponse } from 'next/server'
import Share from '@/lib/models/Share'
import mongoose from 'mongoose'

// GET /api/share/[token] - Retrieve shared content
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const { token } = params

    // Find share link
    const share = await Share.findOne({ token })

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      )
    }

    // Check if share is active
    if (!share.isActive) {
      return NextResponse.json(
        { error: 'Share link has been disabled' },
        { status: 403 }
      )
    }

    // Check if share is expired
    if (share.isExpired()) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      )
    }

    // Get client info for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Increment access count with tracking
    await share.incrementAccess(ipAddress, userAgent)

    // Fetch the shared resource based on type
    let resource: any = null
    let sanitizedResource: any = null

    switch (share.resourceType) {
      case 'task':
        resource = await mongoose.connection.collection('tasks').findOne({ 
          _id: new mongoose.Types.ObjectId(share.resourceId as string) 
        })
        if (resource) {
          sanitizedResource = {
            id: resource._id?.toString(),
            name: resource.title || resource.name,
            title: resource.title,
            description: resource.description,
            status: resource.status,
            priority: resource.priority,
            date: resource.date,
            due_date: resource.date,
            estimatedTime: resource.estimated_time,
            actualTime: resource.actual_time,
            created_at: resource.created_at,
            updated_at: resource.updated_at
          }
        }
        break

      case 'note':
        resource = await mongoose.connection.collection('code_components').findOne({ 
          _id: new mongoose.Types.ObjectId(share.resourceId as string) 
        })
        if (resource) {
          sanitizedResource = {
            id: resource._id?.toString(),
            name: resource.name,
            description: resource.description,
            code: resource.content,
            content: resource.content,
            type: resource.content_type,
            category: resource.category,
            tags: resource.tags || [],
            image_url: resource.image_url,
            created_at: resource.created_at,
            updated_at: resource.updated_at
          }
        }
        break

      case 'account':
        resource = await mongoose.connection.collection('accounts').findOne({ 
          _id: new mongoose.Types.ObjectId(share.resourceId as string) 
        })
        if (resource) {
          // Sanitize account data - DO NOT expose passwords
          sanitizedResource = {
            id: resource._id?.toString(),
            website: resource.website,
            username: resource.username,
            email: resource.email,
            notes: resource.notes,
            project: resource.project,
            created_at: resource.created_at,
            updated_at: resource.updated_at
            // IMPORTANT: password field intentionally omitted
          }
        }
        break

      case 'project':
        resource = await mongoose.connection.collection('projects').findOne({ 
          _id: new mongoose.Types.ObjectId(share.resourceId as string) 
        })
        if (resource) {
          sanitizedResource = {
            id: resource._id?.toString(),
            name: resource.name,
            domain: resource.domain,
            figma_link: resource.figma_link,
            description: resource.description,
            status: resource.status,
            created_at: resource.created_at,
            updated_at: resource.updated_at
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid resource type' },
          { status: 400 }
        )
    }

    if (!resource) {
      return NextResponse.json(
        { error: 'Shared resource not found' },
        { status: 404 }
      )
    }

    // Return share info and sanitized resource
    return NextResponse.json({
      success: true,
      share: {
        resourceType: share.resourceType,
        expiresAt: share.expiresAt,
        accessCount: share.accessCount,
        createdAt: share.createdAt,
        sharedBy: share.createdBy
      },
      resource: sanitizedResource
    })

  } catch (error) {
    console.error('Error retrieving shared content:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve shared content' },
      { status: 500 }
    )
  }
}

// DELETE /api/share/[token] - Revoke share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string)
    }

    const { token } = params

    // Find and delete share link
    const share = await Share.findOneAndDelete({ token })

    if (!share) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Share link revoked successfully'
    })

  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}
