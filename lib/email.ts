import * as nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// Create transporter
export const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured')
  }
  
  if (!process.env.SMTP_FROM) {
    throw new Error('SMTP_FROM email address not configured')
  }
  
  return nodemailer.createTransport(emailConfig)
}

// Email types
export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export interface EmailTemplateData {
  recipientName?: string
  companyName: string
  logoUrl?: string
  content: {
    title: string
    message: string
    details?: Record<string, any>
  }
  footer?: {
    companyAddress?: string
    unsubscribeLink?: string
    websiteUrl?: string
  }
}

// Email Service Class
export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    try {
      this.transporter = createTransporter()
      console.log('✅ Email service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
      this.transporter = null
    }
  }

  private ensureTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      try {
        this.transporter = createTransporter()
        console.log('✅ Email transporter recreated successfully')
      } catch (error) {
        console.error('❌ Failed to create email transporter:', error)
        throw new Error(`Email service not configured: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    return this.transporter
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }

      const info = await this.ensureTransporter().sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
    } catch (error: any) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const transporter = this.ensureTransporter()
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('❌ SMTP connection failed:', error)
      return false
    }
  }
}

// Singleton instance
export const emailService = new EmailService()

// Helper function for sending emails
export async function sendEmail(options: EmailOptions): Promise<void> {
  return emailService.sendEmail(options)
}