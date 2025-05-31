import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, recipients } = body

    if (!type || !data || !recipients) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data, recipients' },
        { status: 400 }
      )
    }

    switch (type) {
      case 'task_created':
        await emailService.sendTaskNotification('created', data, recipients)
        break
      
      case 'task_completed':
        await emailService.sendTaskNotification('completed', data, recipients)
        break
      
      case 'project_update':        await emailService.sendProjectUpdate(data, recipients)
        break
      
      case 'custom':
        await emailService.sendEmail({
          to: recipients,
          subject: data.subject,
          html: data.html,
          text: data.text,
        })
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const isConnected = await emailService.testConnection()
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER?.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask email for security
        from: process.env.SMTP_FROM,
      }
    })
  } catch (error) {
    console.error('Email connection test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
