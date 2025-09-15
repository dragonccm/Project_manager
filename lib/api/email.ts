import * as nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.mailersend.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// Trial mode configuration
const isTrialMode = process.env.SMTP_TRIAL_MODE === 'true'
const adminEmail = process.env.SMTP_ADMIN_EMAIL

// Helper function to handle trial mode email routing
const handleTrialModeEmail = (originalRecipients: string | string[], originalSubject: string) => {
  if (!isTrialMode || !adminEmail) {
    return {
      to: originalRecipients,
      subject: originalSubject
    }
  }

  // In trial mode, redirect all emails to admin with original recipient info
  const recipientList = Array.isArray(originalRecipients) ? originalRecipients.join(', ') : originalRecipients
  return {
    to: adminEmail,
    subject: `[TRIAL MODE - Intended for: ${recipientList}] ${originalSubject}`
  }
}

// Create transporter
export const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials not configured')
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

export interface TaskNotificationData {
  taskTitle: string
  taskDescription?: string
  projectName?: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  assignedTo?: string
}

export interface ProjectUpdateData {
  projectName: string
  updateType: 'created' | 'completed' | 'updated' | 'deadline_approaching'
  description?: string
  deadline?: string
  progress?: number
}

// Email templates
export const emailTemplates = {
  taskCreated: (data: TaskNotificationData) => ({
    subject: `🆕 Task mới: ${data.taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🆕 Task Mới Được Tạo</h1>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">${data.taskTitle}</h2>
          
          ${data.taskDescription ? `<p style="color: #666; line-height: 1.6;">${data.taskDescription}</p>` : ''}
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${data.projectName ? `<div><strong>Dự án:</strong> ${data.projectName}</div>` : ''}
              <div><strong>Độ ưu tiên:</strong> 
                <span style="background: ${data.priority === 'high' ? '#ef4444' : data.priority === 'medium' ? '#f59e0b' : '#10b981'}; 
                            color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                  ${data.priority === 'high' ? 'Cao' : data.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
              <div><strong>Ngày:</strong> ${new Date(data.dueDate).toLocaleDateString('vi-VN')}</div>
              ${data.assignedTo ? `<div><strong>Được giao cho:</strong> ${data.assignedTo}</div>` : ''}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Email này được gửi tự động từ hệ thống Project Manager.
          </p>
        </div>
      </div>
    `,
    text: `
Task mới: ${data.taskTitle}

${data.taskDescription || ''}

${data.projectName ? `Dự án: ${data.projectName}` : ''}
Độ ưu tiên: ${data.priority}
Ngày: ${new Date(data.dueDate).toLocaleDateString('vi-VN')}
${data.assignedTo ? `Được giao cho: ${data.assignedTo}` : ''}
    `
  }),

  taskCompleted: (data: TaskNotificationData) => ({
    subject: `✅ Task hoàn thành: ${data.taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ Task Đã Hoàn Thành</h1>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">${data.taskTitle}</h2>
          
          ${data.taskDescription ? `<p style="color: #666; line-height: 1.6;">${data.taskDescription}</p>` : ''}
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #166534;">🎉 Chúc mừng! Task này đã được hoàn thành thành công.</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              ${data.projectName ? `<div><strong>Dự án:</strong> ${data.projectName}</div>` : ''}
              <div><strong>Hoàn thành ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Email này được gửi tự động từ hệ thống Project Manager.
          </p>
        </div>
      </div>
    `,
    text: `
Task hoàn thành: ${data.taskTitle}

${data.taskDescription || ''}

${data.projectName ? `Dự án: ${data.projectName}` : ''}
Hoàn thành ngày: ${new Date().toLocaleDateString('vi-VN')}
    `
  }),

  projectUpdate: (data: ProjectUpdateData) => ({
    subject: `📊 Cập nhật dự án: ${data.projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📊 Cập Nhật Dự Án</h1>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">${data.projectName}</h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <div><strong>Loại cập nhật:</strong> 
              <span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${data.updateType === 'created' ? 'Tạo mới' : 
                  data.updateType === 'completed' ? 'Hoàn thành' : 
                  data.updateType === 'updated' ? 'Cập nhật' : 'Gần deadline'}
              </span>
            </div>
            
            ${data.description ? `<div style="margin-top: 10px;"><strong>Mô tả:</strong> ${data.description}</div>` : ''}
            ${data.deadline ? `<div style="margin-top: 10px;"><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleDateString('vi-VN')}</div>` : ''}
            ${data.progress !== undefined ? `<div style="margin-top: 10px;"><strong>Tiến độ:</strong> ${data.progress}%</div>` : ''}
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Email này được gửi tự động từ hệ thống Project Manager.
          </p>
        </div>
      </div>
    `,
    text: `
Cập nhật dự án: ${data.projectName}

Loại cập nhật: ${data.updateType}
${data.description ? `Mô tả: ${data.description}` : ''}
${data.deadline ? `Deadline: ${new Date(data.deadline).toLocaleDateString('vi-VN')}` : ''}
${data.progress !== undefined ? `Tiến độ: ${data.progress}%` : ''}
    `  }),
}

// Email service functions
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private lastConnectionTest: number = 0
  private connectionTestResult: boolean | null = null
  private static CONNECTION_TEST_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
  }  async sendEmail(options: EmailOptions): Promise<void> {
    try {      // In trial mode with unknown admin email, log the email instead of failing
      if (isTrialMode && (!adminEmail || adminEmail === 'unknown' || adminEmail.includes('test-p7kx4xwmm72g9yjr.mlsender.net'))) {
        console.log('📧 Trial Mode - Email Service (Simulated Send):')
        console.log(`   From: ${options.from || process.env.SMTP_FROM}`)
        console.log(`   To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
        console.log(`   Subject: ${options.subject}`)
        console.log(`   Content: Email logged instead of sent due to trial account limitations`)
        
        // Store the email attempt for later review
        this.logEmailAttempt(options)
        return
      }

      // Handle trial mode email routing if admin email is known
      const emailRouting = handleTrialModeEmail(options.to, options.subject)
      
      const mailOptions = {
        from: options.from || process.env.SMTP_FROM,
        to: Array.isArray(emailRouting.to) ? emailRouting.to.join(', ') : emailRouting.to,
        subject: emailRouting.subject,
        html: options.html,
        text: options.text,
      }

      // Add trial mode notice to email content if in trial mode
      if (isTrialMode && adminEmail && !adminEmail.includes('test-p7kx4xwmm72g9yjr.mlsender.net')) {
        const originalRecipients = Array.isArray(options.to) ? options.to.join(', ') : options.to
        const trialNotice = `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 6px;">
            <p style="margin: 0; color: #92400e;">
              <strong>🚨 TRIAL MODE:</strong> This email was originally intended for: <strong>${originalRecipients}</strong>
              <br>Due to trial account limitations, all emails are redirected to the administrator.
            </p>
          </div>
        `
        
        if (mailOptions.html) {
          // Insert trial notice after the opening div if HTML email
          mailOptions.html = mailOptions.html.replace(
            /(<div[^>]*>)/,
            `$1${trialNotice}`
          )
        }
        
        if (mailOptions.text) {
          mailOptions.text = `[TRIAL MODE] Originally for: ${originalRecipients}\n\n${mailOptions.text}`
        }
      }

      const info = await this.ensureTransporter().sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
      
      if (isTrialMode) {
        console.log(`📧 Trial mode: Email redirected from ${options.to} to ${adminEmail}`)
      }    } catch (error: any) {
      // Handle trial account limitations gracefully
      if (error.message && error.message.includes('MS42225')) {
        console.log('📧 Trial Mode - Email Service (Fallback):')
        console.log(`   ⚠️  Trial account limitation detected`)
        console.log(`   📝 Email logged instead of sent:`)
        console.log(`       From: ${options.from || process.env.SMTP_FROM}`)
        console.log(`       To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`)
        console.log(`       Subject: ${options.subject}`)
        
        // Store the email attempt for later review
        this.logEmailAttempt(options)
        return
      }
      
      console.error('Failed to send email:', error)
      throw error
    }
  }

  private logEmailAttempt(options: EmailOptions): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      from: options.from || process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      content: options.text || 'HTML content provided',
      status: 'trial_mode_blocked'
    }
    
    // In a real application, you might want to store this in a database or file
    console.log('📊 Email Log Entry:', JSON.stringify(logEntry, null, 2))
  }

  async sendTaskNotification(type: 'created' | 'completed', data: TaskNotificationData, recipients: string | string[]): Promise<void> {
    const template = type === 'created' ? emailTemplates.taskCreated(data) : emailTemplates.taskCompleted(data)
    
    await this.sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  async sendProjectUpdate(data: ProjectUpdateData, recipients: string | string[]): Promise<void> {
    const template = emailTemplates.projectUpdate(data)
    
    await this.sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })  }

  async testConnection(): Promise<boolean> {
    // Check if we have a cached result that's still valid
    const now = Date.now()
    if (this.connectionTestResult !== null && 
        now - this.lastConnectionTest < EmailService.CONNECTION_TEST_CACHE_DURATION) {
      console.log(`📝 Using cached SMTP connection result: ${this.connectionTestResult ? 'connected' : 'failed'}`)
      return this.connectionTestResult
    }

    try {
      const transporter = this.ensureTransporter()
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
      this.connectionTestResult = true
      this.lastConnectionTest = now
      return true
    } catch (error) {
      console.error('❌ SMTP connection failed:', error)
      this.connectionTestResult = false
      this.lastConnectionTest = now
      return false
    }
  }
}

// Singleton instance
export const emailService = new EmailService()