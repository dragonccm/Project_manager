import { NextRequest, NextResponse } from "next/server"
import { 
  updateReportTemplate, 
  deleteReportTemplate,
  duplicateReportTemplate,
  testDatabaseConnection 
} from "@/lib/mongo-database"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const id = params.id
    const templateData = await request.json()
    
    const template = await updateReportTemplate(id, templateData)
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error("Error updating report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const id = params.id
    await deleteReportTemplate(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const id = params.id
    const { newName } = await request.json()
    
    if (!newName) {
      return NextResponse.json(
        { success: false, error: "New name is required for duplication" },
        { status: 400 }
      )
    }

    const template = await duplicateReportTemplate(id, newName)
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error("Error duplicating report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to duplicate template" },
      { status: 500 }
    )
  }
}
