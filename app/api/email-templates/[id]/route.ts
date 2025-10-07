import { NextRequest, NextResponse } from 'next/server'

interface EmailTemplate {
  id?: string
  name: string
  subject: string
  content: string
  htmlContent: string
  templateType: string
  backgroundColor: string
  textColor: string
  layout: string
  createdAt?: string
  updatedAt?: string
}

// In-memory storage for templates (should match the one in main route)
const emailTemplates: Map<string, EmailTemplate> = new Map()

// GET - Get specific email template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!emailTemplates.has(id)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const template = emailTemplates.get(id)
    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching email template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email template' },
      { status: 500 }
    )
  }
}

// PUT - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!emailTemplates.has(id)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const templateData: EmailTemplate = await request.json()
    
    // Validate required fields
    if (!templateData.name || !templateData.subject) {
      return NextResponse.json(
        { error: 'Name and subject are required' },
        { status: 400 }
      )
    }

    const existingTemplate = emailTemplates.get(id)!
    const updatedTemplate: EmailTemplate = {
      ...existingTemplate,
      ...templateData,
      id,
      updatedAt: new Date().toISOString()
    }

    emailTemplates.set(id, updatedTemplate)

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!emailTemplates.has(id)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    emailTemplates.delete(id)

    return NextResponse.json(
      { message: 'Template deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    )
  }
}