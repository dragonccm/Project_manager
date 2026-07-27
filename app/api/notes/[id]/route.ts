import { NextResponse } from "next/server"
import { updateCodeComponent, deleteCodeComponent, getCodeComponentById } from "@/lib/mongo-database"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-session"
import { handleApiError } from "@/lib/api-base"

// Next.js 16: `params` là Promise, phải await. Code cũ đọc thẳng `params.id`
// nên giá trị luôn undefined và các handler này không hoạt động.
type RouteContext = { params: Promise<{ id: string }> }

export const GET = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const { id } = await params
    // Query thẳng theo id thay vì load toàn bộ note rồi lọc trong JS
    const note = await getCodeComponentById(id, request.user.id)

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    return handleApiError(error, 'fetching note')
  }
})

export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const { id } = await params
    const noteData = await request.json()

    const updateData = { ...noteData }

    // Những field không được phép ghi đè từ client
    delete updateData.id
    delete updateData._id
    delete updateData.created_at

    const updatedNote = await updateCodeComponent(id, request.user.id, updateData)

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(updatedNote)
  } catch (error) {
    return handleApiError(error, 'updating note')
  }
})

export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const { id } = await params
    const result = await deleteCodeComponent(id, request.user.id)

    if (!result) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'deleting note')
  }
})
