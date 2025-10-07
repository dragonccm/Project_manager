import { EmailTemplateData } from './email'

// Professional Email Templates with Logo
export const createEmailTemplate = (data: EmailTemplateData, templateType: 'modern' | 'corporate' | 'minimal' | 'colorful' = 'modern'): string => {
  const logoSection = data.logoUrl ? 
    `<img src="${data.logoUrl}" alt="${data.companyName}" style="max-height: 60px; margin-bottom: 20px;">` :
    `<div style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; margin-bottom: 20px;">${data.companyName}</div>`

  const templates = {
    modern: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          ${logoSection}
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">${data.content.title}</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
          ${data.recipientName ? `<p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Xin chào ${data.recipientName},</p>` : ''}
          
          <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            ${data.content.message}
          </div>
          
          ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
            `<div style="background: #f9fafb; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; border-radius: 4px;">
              <strong style="color: #374151;">${key}:</strong> 
              <span style="color: #4b5563;">${value}</span>
            </div>`
          ).join('') : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
            Email này được gửi tự động từ hệ thống ${data.companyName}
          </p>
          ${data.footer?.websiteUrl ? `<a href="${data.footer.websiteUrl}" style="color: #667eea; text-decoration: none; font-size: 14px;">Truy cập website</a>` : ''}
        </div>
      </div>
    `,
    
    corporate: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 2px solid #e5e7eb;">
        <!-- Header -->
        <div style="background: #1f2937; padding: 25px; text-align: center;">
          ${logoSection}
          <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${data.content.title}</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 35px; background: #ffffff;">
          ${data.recipientName ? `<p style="color: #374151; font-size: 16px; margin-bottom: 25px;"><strong>Kính gửi:</strong> ${data.recipientName}</p>` : ''}
          
          <div style="color: #4b5563; font-size: 15px; line-height: 1.7; margin-bottom: 25px; text-align: justify;">
            ${data.content.message}
          </div>
          
          ${data.content.details ? `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              ${Object.entries(data.content.details).map(([key, value]) => 
                `<tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 15px; background: #f9fafb; font-weight: bold; color: #374151; width: 30%;">${key}</td>
                  <td style="padding: 12px 15px; color: #4b5563;">${value}</td>
                </tr>`
              ).join('')}
            </table>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            © ${new Date().getFullYear()} ${data.companyName}. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    `,
    
    minimal: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="padding: 40px 30px 30px; text-align: center; border-bottom: 2px solid #e5e7eb;">
          ${logoSection}
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #111827; margin: 0 0 25px 0; font-size: 24px; font-weight: 400;">${data.content.title}</h2>
          
          ${data.recipientName ? `<p style="color: #6b7280; font-size: 16px; margin-bottom: 25px;">Chào ${data.recipientName},</p>` : ''}
          
          <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            ${data.content.message}
          </div>
          
          ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
            `<p style="margin: 15px 0; padding: 0; color: #4b5563; font-size: 15px;">
              <span style="font-weight: 600; color: #111827;">${key}:</span> ${value}
            </p>`
          ).join('') : ''}
        </div>
        
        <!-- Footer -->
        <div style="padding: 25px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            ${data.companyName} - Hệ thống quản lý dự án
          </p>
        </div>
      </div>
    `,
    
    colorful: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #667eea, #764ba2); padding: 3px; border-radius: 15px;">
        <div style="background: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4); padding: 30px; text-align: center; position: relative;">
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 10px; display: inline-block;">
              ${logoSection}
              <h1 style="color: #333; margin: 10px 0 0 0; font-size: 26px; font-weight: 600;">${data.content.title}</h1>
            </div>
          </div>
          
          <!-- Body -->
          <div style="padding: 35px 30px; background: #ffffff;">
            ${data.recipientName ? `<p style="color: #333; font-size: 16px; margin-bottom: 20px;">Xin chào <strong style="color: #667eea;">${data.recipientName}</strong>,</p>` : ''}
            
            <div style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              ${data.content.message}
            </div>
            
            ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
              `<div style="background: linear-gradient(45deg, #667eea20, #764ba220); padding: 15px; margin: 12px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                <strong style="color: #333; font-size: 15px;">${key}:</strong>
                <div style="color: #555; margin-top: 5px;">${value}</div>
              </div>`
            ).join('') : ''}
          </div>
          
          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 25px; text-align: center;">
            <p style="color: white; font-size: 14px; margin: 0; opacity: 0.9;">
              🚀 ${data.companyName} - Nền tảng quản lý dự án hiện đại
            </p>
          </div>
        </div>
      </div>
    `
  }
  
  return templates[templateType]
}

// Predefined email templates for different purposes
export const emailTemplates = {
  projectUpdate: (projectData: any, templateType: 'modern' | 'corporate' | 'minimal' | 'colorful' = 'modern') => ({
    subject: `📊 Cập nhật dự án: ${projectData.name}`,
    html: createEmailTemplate({
      recipientName: projectData.recipientName,
      companyName: 'Project Manager',
      logoUrl: projectData.logoUrl || '/logo.png',
      content: {
        title: 'Cập Nhật Dự Án',
        message: `Dự án <strong>${projectData.name}</strong> đã có những cập nhật mới quan trọng. Vui lòng xem chi tiết bên dưới:`,
        details: {
          'Tên Dự Án': projectData.name,
          'Mô Tả': projectData.description || 'Không có mô tả',
          'Trạng Thái': projectData.status || 'Đang tiến hành',
          'Domain': projectData.domain || 'Chưa xác định',
          'Figma Link': projectData.figma_link ? `<a href="${projectData.figma_link}" style="color: #667eea;">Xem thiết kế</a>` : 'Chưa có',
          'Ngày Cập Nhật': new Date().toLocaleDateString('vi-VN')
        }
      },
      footer: {
        websiteUrl: 'http://localhost:3000'
      }
    }, templateType),
    text: `Cập nhật dự án: ${projectData.name}\n\n${projectData.description || 'Không có mô tả'}\n\nTrạng thái: ${projectData.status || 'Đang tiến hành'}`
  }),

  taskNotification: (taskData: any, templateType: 'modern' | 'corporate' | 'minimal' | 'colorful' = 'modern') => ({
    subject: `${taskData.type === 'created' ? '🆕 Nhiệm vụ mới' : '✅ Nhiệm vụ hoàn thành'}: ${taskData.title}`,
    html: createEmailTemplate({
      recipientName: taskData.recipientName,
      companyName: 'Project Manager',
      logoUrl: taskData.logoUrl || '/logo.png',
      content: {
        title: taskData.type === 'created' ? 'Nhiệm Vụ Mới' : 'Nhiệm Vụ Hoàn Thành',
        message: `${taskData.type === 'created' ? 'Bạn được phân công một nhiệm vụ mới' : 'Nhiệm vụ đã được hoàn thành thành công'}. Chi tiết như sau:`,
        details: {
          'Tiêu Đề': taskData.title,
          'Mô Tả': taskData.description || 'Không có mô tả',
          'Độ Ưu Tiên': taskData.priority === 'high' ? '🔴 Cao' : taskData.priority === 'medium' ? '🟡 Trung bình' : '🟢 Thấp',
          'Trạng Thái': taskData.status || 'Mới',
          'Dự Án': taskData.project?.name || 'Chưa xác định',
          'Ngày Tạo': new Date(taskData.created_at || Date.now()).toLocaleDateString('vi-VN'),
          ...(taskData.due_date && { 'Hạn Hoàn Thành': new Date(taskData.due_date).toLocaleDateString('vi-VN') })
        }
      }
    }, templateType),
    text: `${taskData.type === 'created' ? 'Nhiệm vụ mới' : 'Nhiệm vụ hoàn thành'}: ${taskData.title}\n\n${taskData.description || 'Không có mô tả'}\n\nĐộ ưu tiên: ${taskData.priority}`
  }),

  accountUpdate: (accountData: any, templateType: 'modern' | 'corporate' | 'minimal' | 'colorful' = 'modern') => ({
    subject: `👤 Cập nhật tài khoản: ${accountData.username}`,
    html: createEmailTemplate({
      recipientName: accountData.recipientName,
      companyName: 'Project Manager',
      logoUrl: accountData.logoUrl || '/logo.png',
      content: {
        title: 'Thông Tin Tài Khoản',
        message: 'Thông tin tài khoản của bạn đã được cập nhật. Vui lòng kiểm tra các thông tin sau:',
        details: {
          'Tên Đăng Nhập': accountData.username,
          'Họ Tên': accountData.full_name || 'Chưa cập nhật',
          'Email': accountData.email,
          'Quyền Hạn': accountData.role === 'admin' ? '👑 Quản trị viên' : '👤 Người dùng',
          'Trạng Thái': accountData.status === 'active' ? '✅ Hoạt động' : '❌ Tạm khóa',
          'Ngày Cập Nhật': new Date().toLocaleDateString('vi-VN')
        }
      }
    }, templateType),
    text: `Cập nhật tài khoản: ${accountData.username}\n\nHọ tên: ${accountData.full_name}\nEmail: ${accountData.email}\nQuyền hạn: ${accountData.role}`
  }),

  systemNotification: (notificationData: any, templateType: 'modern' | 'corporate' | 'minimal' | 'colorful' = 'modern') => ({
    subject: `🔔 ${notificationData.title}`,
    html: createEmailTemplate({
      recipientName: notificationData.recipientName,
      companyName: 'Project Manager',
      logoUrl: notificationData.logoUrl || '/logo.png',
      content: {
        title: notificationData.title,
        message: notificationData.message,
        details: notificationData.details
      }
    }, templateType),
    text: `${notificationData.title}\n\n${notificationData.message}`
  })
}