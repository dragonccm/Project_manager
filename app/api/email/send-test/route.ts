import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface TestEmailRequest {
  subject: string
  htmlContent: string
  templateData: any
}

// Create email transporter (using existing email config)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// POST - Send test email
export async function POST(request: NextRequest) {
  try {
    const { subject, htmlContent, templateData }: TestEmailRequest = await request.json()

    // Validate required fields
    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: 'Email configuration not found. Please configure SMTP settings.' },
        { status: 500 }
      )
    }

    const transporter = createTransporter()

    // Test email recipient (could be configurable)
    const testRecipient = process.env.SMTP_FROM || process.env.SMTP_USER

    const mailOptions = {
      from: {
        name: 'Project Manager - Email Designer',
        address: process.env.SMTP_FROM || process.env.SMTP_USER!
      },
      to: testRecipient,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: templateData?.content || 'This is a test email from Email Designer.'
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${testRecipient}`,
      recipient: testRecipient
    })

  } catch (error) {
    console.error('Error sending test email:', error)
    
    let errorMessage = 'Failed to send test email'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}