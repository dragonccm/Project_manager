import { NextRequest, NextResponse } from "next/server"
import { 
  getReportTemplates, 
  createReportTemplate, 
  initializeTables,
  testDatabaseConnection 
} from "@/lib/database"

export async function GET() {
  try {
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Database not available", data: [] },
        { status: 503 }
      )
    }

    const templates = await getReportTemplates()
    return NextResponse.json({ success: true, data: templates })
  } catch (error: any) {
    console.error("Error fetching report templates:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const templateData = await request.json()
    
    // Validate required fields
    if (!templateData.name || !templateData.template_data) {
      return NextResponse.json(
        { success: false, error: "Name and template_data are required" },
        { status: 400 }
      )
    }

    const template = await createReportTemplate(templateData)
    return NextResponse.json({ success: true, data: template })
  } catch (error: any) {
    console.error("Error creating report template:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create template" },
      { status: 500 }
    )
  }
}
