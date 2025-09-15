import { NextRequest, NextResponse } from 'next/server'
import { getLinks, createLink, updateLink, deleteLink, bulkCreateLinks } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const links = await getLinks(request.user.id)
    return NextResponse.json({ success: true, data: links })
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    
    // Handle bulk creation
    if (body.bulk && Array.isArray(body.links)) {
      // Add user_id to all links
      const linksWithUserId = body.links.map((link: any) => ({ ...link, user_id: request.user.id }))
      const createdLinks = await bulkCreateLinks(linksWithUserId)
      return NextResponse.json({ success: true, data: createdLinks })
    }
    
    // Handle single link creation
    const newLink = await createLink({ ...body, user_id: request.user.id })
    return NextResponse.json({ success: true, data: newLink })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      )
    }
    
    // Ensure user can only update their own links
    const updatedLink = await updateLink(id, { ...updates, user_id: request.user.id })
    return NextResponse.json({ success: true, data: updatedLink })
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update link' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      )
    }
    
    // Note: deleteLink should be updated to include user_id check
    const deleted = await deleteLink(id)
    return NextResponse.json({ success: true, data: { deleted } })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    )
  }
})