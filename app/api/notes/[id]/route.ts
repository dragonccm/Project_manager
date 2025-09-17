import { NextRequest, NextResponse } from "next/server"
import { updateCodeComponent, deleteCodeComponent, getCodeComponents } from "@/lib/mongo-database"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-session"
import { handleApiError, validateRequired } from "@/lib/api-base"

export const GET = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const notes = await getCodeComponents()
    const note = notes.find((n: any) => n.id === params.id)
    
    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(note)
  } catch (error) {
    return handleApiError(error, 'fetching note')
  }
})

export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const noteData = await request.json()
    
    const updateData = {
      ...noteData,
      updated_at: new Date()
    }
    
    // Remove fields that shouldn't be updated
    delete updateData.id
    delete updateData._id
    delete updateData.created_at

    const updatedNote = await updateCodeComponent(params.id, updateData)
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedNote)
  } catch (error) {
    return handleApiError(error, 'updating note')
  }
})

export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const result = await deleteCodeComponent(params.id)
    
    if (!result) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'deleting note')
  }
})