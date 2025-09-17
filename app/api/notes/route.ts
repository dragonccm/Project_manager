import { NextRequest, NextResponse } from "next/server"
import { getCodeComponents, createCodeComponent } from "@/lib/mongo-database"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-session"
import { handleApiError, validateRequired } from "@/lib/api-base"

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const contentType = searchParams.get('content_type') 
    const tags = searchParams.get('tags')
    const projectId = searchParams.get('project_id')
    const search = searchParams.get('search')

    // Get all notes (code components) 
    const notes = await getCodeComponents()
    
    // Apply client-side filtering based on query parameters
    let filteredNotes = notes

    if (category && category !== 'all') {
      filteredNotes = filteredNotes.filter((note: any) => note.component_type === category)
    }
    
    if (contentType && contentType !== 'all') {
      filteredNotes = filteredNotes.filter((note: any) => note.content_type === contentType)
    }

    if (projectId && projectId !== 'all') {
      filteredNotes = filteredNotes.filter((note: any) => note.project_id === projectId)
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase())
      filteredNotes = filteredNotes.filter((note: any) => 
        note.tags && note.tags.some((tag: string) => 
          tagArray.some(searchTag => tag.toLowerCase().includes(searchTag))
        )
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredNotes = filteredNotes.filter((note: any) =>
        note.name?.toLowerCase().includes(searchLower) ||
        note.description?.toLowerCase().includes(searchLower) ||
        note.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json(filteredNotes)
  } catch (error) {
    return handleApiError(error, 'fetching notes')
  }
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const noteData = await request.json()
    
    // Validate required fields
    const missingFields = validateRequired(noteData, ['name', 'content_type'])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Transform note data to match CodeComponent interface
    const componentData = {
      ...noteData,
      component_type: noteData.component_type || 'note',
      content_type: noteData.content_type || 'mixed',
      user_id: request.user.id
    }

    const newNote = await createCodeComponent(componentData)
    return NextResponse.json(newNote)
  } catch (error) {
    return handleApiError(error, 'creating note')
  }
})