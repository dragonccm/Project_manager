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
    `
  }),

  dailyReport: (tasks: TaskNotificationData[], projects: ProjectUpdateData[]) => ({
    subject: `📈 Báo cáo hàng ngày - ${new Date().toLocaleDateString('vi-VN')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📈 Báo Cáo Hàng Ngày</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px;">
          <h3 style="color: #333; margin-top: 0;">📋 Tổng quan Tasks</h3>
          <p>Hôm nay có <strong>${tasks.length}</strong> task được cập nhật.</p>
          
          ${tasks.length > 0 ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              ${tasks.map(task => `
                <div style="border-bottom: 1px solid #e1e5e9; padding: 10px 0;">
                  <strong>${task.taskTitle}</strong>
                  <br>
                  <small style="color: #666;">${task.projectName || 'Không có dự án'} • ${task.priority} priority</small>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <h3 style="color: #333;">🚀 Cập nhật Dự án</h3>
          <p>Có <strong>${projects.length}</strong> dự án được cập nhật.</p>
          
          ${projects.length > 0 ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              ${projects.map(project => `
                <div style="border-bottom: 1px solid #e1e5e9; padding: 10px 0;">
                  <strong>${project.projectName}</strong>
                  <br>
                  <small style="color: #666;">${project.updateType} • ${project.progress !== undefined ? project.progress + '%' : 'N/A'}</small>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Email này được gửi tự động từ hệ thống Project Manager.
          </p>
        </div>
      </div>
    `,
    text: `
Báo cáo hàng ngày - ${new Date().toLocaleDateString('vi-VN')}

Tasks: ${tasks.length} task được cập nhật
${tasks.map(task => `- ${task.taskTitle} (${task.projectName || 'Không có dự án'})`).join('\n')}

Dự án: ${projects.length} dự án được cập nhật  
${projects.map(project => `- ${project.projectName} (${project.updateType})`).join('\n')}
    `
  })
}

// Email service functions
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
        html: options.html,        text: options.text,
      }

      const info = await this.ensureTransporter().sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
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
    })
  }

  async sendDailyReport(tasks: TaskNotificationData[], projects: ProjectUpdateData[], recipients: string | string[]): Promise<void> {
    const template = emailTemplates.dailyReport(tasks, projects)
    
    await this.sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
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
