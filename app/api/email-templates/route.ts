import { NextRequest, NextResponse } from 'next/server'
// import { verifyAuthToken } from '@/lib/auth-middleware'

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

// In-memory storage for templates (in production, use database)
const emailTemplates: Map<string, EmailTemplate> = new Map()

// Initialize with some default templates
const defaultTemplates: EmailTemplate[] = [
  {
    id: 'default-1',
    name: 'Welcome Email',
    subject: 'Chào mừng đến với Project Manager',
    content: 'Chào bạn!\n\nCảm ơn bạn đã sử dụng Project Manager. Chúng tôi hy vọng bạn sẽ có trải nghiệm tuyệt vời với ứng dụng quản lý dự án của chúng tôi.\n\nNếu bạn có bất kỳ câu hỏi nào, đừng ngại liên hệ với chúng tôi.\n\nTrân trọng,\nTeam Project Manager',
    htmlContent: '',
    templateType: 'general',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    layout: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project-1',
    name: 'Project Update',
    subject: 'Cập nhật tiến độ dự án: {projectName}',
    content: 'Kính gửi team,\n\nDự án "{projectName}" có cập nhật mới:\n\n• Trạng thái: {status}\n• Tiến độ: {progress}%\n• Deadline: {deadline}\n\nVui lòng kiểm tra và feedback.\n\nCảm ơn!',
    htmlContent: '',
    templateType: 'project',
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    layout: 'modern',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Initialize default templates
defaultTemplates.forEach(template => {
  emailTemplates.set(template.id!, template)
})

// GET - Get all email templates
export async function GET(request: NextRequest) {
  try {
    // TODO: Verify authentication when middleware is ready
    // const authResult = await verifyAuthToken(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const templates = Array.from(emailTemplates.values()).sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    )

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    )
  }
}

// POST - Create new email template
export async function POST(request: NextRequest) {
  try {
    // TODO: Verify authentication when middleware is ready
    // const authResult = await verifyAuthToken(request)
    // if (!authResult.success) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const templateData: EmailTemplate = await request.json()
    
    // Validate required fields
    if (!templateData.name || !templateData.subject) {
      return NextResponse.json(
        { error: 'Name and subject are required' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newTemplate: EmailTemplate = {
      ...templateData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    emailTemplates.set(id, newTemplate)

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Failed to create email template' },
      { status: 500 }
    )
  }
}