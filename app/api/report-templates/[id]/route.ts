import { NextResponse } from "next/server"
import {
  updateReportTemplate,
  deleteReportTemplate,
  duplicateReportTemplate,
  testDatabaseConnection
} from "@/lib/mongo-database"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-session"

// Trước đây các handler ở đây không có withAuth: bất kỳ ai cũng sửa/xoá/nhân bản
// được report template của người khác chỉ cần biết id.

// Next.js 16: params là Promise, phải await trước khi dùng
type RouteContext = { params: Promise<{ id: string }> }

async function ensureDb() {
  const connectionTest = await testDatabaseConnection()
  if (!connectionTest.success) {
    return NextResponse.json(
      { success: false, error: "Database not available" },
      { status: 503 }
    )
  }
  return null
}

export const PUT = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const dbError = await ensureDb()
    if (dbError) return dbError

    const { id } = await params
    const templateData = await request.json()
    const template = await updateReportTemplate(id, request.user.id, templateData)
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error("Error updating report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const dbError = await ensureDb()
    if (dbError) return dbError

    const { id } = await params
    const deleted = await deleteReportTemplate(id, request.user.id)
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (
  request: AuthenticatedRequest,
  { params }: RouteContext
) => {
  try {
    const dbError = await ensureDb()
    if (dbError) return dbError

    const { id } = await params
    const { newName } = await request.json()
    if (!newName) {
      return NextResponse.json(
        { success: false, error: "New name is required for duplication" },
        { status: 400 }
      )
    }

    const template = await duplicateReportTemplate(id, request.user.id, newName)
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error("Error duplicating report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to duplicate template" },
      { status: 500 }
    )
  }
})
