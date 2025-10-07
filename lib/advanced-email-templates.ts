import { EmailTemplateData } from './email'

export type TemplateStyle = 'modern' | 'corporate' | 'minimal' | 'colorful'
export type BackgroundStyle = 'gradient' | 'solid' | 'pattern' | 'image'
export type LayoutStyle = 'classic' | 'modern' | 'card-based' | 'split'

interface AdvancedTemplateOptions {
  style: TemplateStyle
  background: BackgroundStyle
  layout: LayoutStyle
}

// Background Styles Configuration
const backgroundStyles = {
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    elegant: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  solid: {
    primary: '#1f2937',
    secondary: '#374151',
    light: '#f8fafc',
    accent: '#3b82f6'
  },
  pattern: {
    dots: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
    lines: `linear-gradient(90deg, transparent 24px, #e5e7eb 25px, #e5e7eb 26px, transparent 27px)`,
    grid: `linear-gradient(90deg, #f1f5f9 50%, transparent 50%), linear-gradient(#e2e8f0 50%, transparent 50%)`
  },
  image: {
    subtle: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.05"%3E%3Cpath d="M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z"/%3E%3C/g%3E%3C/svg%3E")'
  }
}

// Layout Configurations
const layoutConfigs = {
  classic: {
    containerStyle: 'max-width: 650px; margin: 0 auto;',
    headerAlign: 'center',
    contentPadding: '30px',
    sectionSpacing: '20px'
  },
  modern: {
    containerStyle: 'max-width: 700px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);',
    headerAlign: 'left',
    contentPadding: '40px',
    sectionSpacing: '25px'
  },
  'card-based': {
    containerStyle: 'max-width: 600px; margin: 0 auto;',
    headerAlign: 'center',
    contentPadding: '25px',
    sectionSpacing: '15px',
    cardStyle: 'background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 15px 0; padding: 20px;'
  },
  split: {
    containerStyle: 'max-width: 800px; margin: 0 auto;',
    headerAlign: 'left',
    contentPadding: '30px',
    sectionSpacing: '20px',
    splitLayout: true
  }
}

export const createAdvancedEmailTemplate = (
  data: EmailTemplateData, 
  options: AdvancedTemplateOptions
): string => {
  const { style, background, layout } = options
  const layoutConfig = layoutConfigs[layout]
  
  // Generate logo section
  const logoSection = data.logoUrl ? 
    `<img src="${data.logoUrl}" alt="${data.companyName}" style="max-height: 60px; margin-bottom: 20px;">` :
    `<div style="background: ${getBackgroundStyle(background, style)}; color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; margin-bottom: 20px;">${data.companyName}</div>`

  // Generate based on layout style
  switch (layout) {
    case 'card-based':
      return createCardBasedTemplate(data, options, logoSection, layoutConfig)
    case 'split':
      return createSplitTemplate(data, options, logoSection, layoutConfig)
    case 'modern':
      return createModernTemplate(data, options, logoSection, layoutConfig)
    default:
      return createClassicTemplate(data, options, logoSection, layoutConfig)
  }
}

function getBackgroundStyle(background: BackgroundStyle, style: TemplateStyle): string {
  switch (background) {
    case 'gradient':
      return backgroundStyles.gradient.primary
    case 'solid':
      return backgroundStyles.solid.primary
    case 'pattern':
      return `${backgroundStyles.solid.light}, ${backgroundStyles.pattern.dots}`
    case 'image':
      return `${backgroundStyles.solid.light} ${backgroundStyles.image.subtle}`
    default:
      return backgroundStyles.gradient.primary
  }
}

function createCardBasedTemplate(
  data: EmailTemplateData, 
  options: AdvancedTemplateOptions,
  logoSection: string,
  layoutConfig: any
): string {
  const headerBg = getBackgroundStyle(options.background, options.style)
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; ${layoutConfig.containerStyle} background: #f8fafc; padding: 20px;">
      <!-- Header Card -->
      <div style="${layoutConfig.cardStyle} background: ${headerBg}; text-align: ${layoutConfig.headerAlign};">
        ${logoSection}
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${data.content.title}</h1>
      </div>
      
      <!-- Greeting Card -->
      ${data.recipientName ? `
      <div style="${layoutConfig.cardStyle}">
        <p style="color: #374151; font-size: 16px; margin: 0;">Xin chào <strong>${data.recipientName}</strong>,</p>
      </div>
      ` : ''}
      
      <!-- Content Card -->
      <div style="${layoutConfig.cardStyle}">
        <div style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          ${data.content.message}
        </div>
      </div>
      
      <!-- Details Cards -->
      ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
        `<div style="${layoutConfig.cardStyle} border-left: 4px solid #3b82f6;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #374151;">${key}:</strong>
            <span style="color: #4b5563;">${value}</span>
          </div>
        </div>`
      ).join('') : ''}
      
      <!-- Footer Card -->
      <div style="${layoutConfig.cardStyle} background: #f9fafb; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Email này được gửi tự động từ hệ thống ${data.companyName}
        </p>
        ${data.footer?.websiteUrl ? `<a href="${data.footer.websiteUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Truy cập website</a>` : ''}
      </div>
    </div>
  `
}

function createSplitTemplate(
  data: EmailTemplateData, 
  options: AdvancedTemplateOptions,
  logoSection: string,
  layoutConfig: any
): string {
  const headerBg = getBackgroundStyle(options.background, options.style)
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; ${layoutConfig.containerStyle} background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="display: table; width: 100%;">
        <!-- Left Side - Header -->
        <div style="display: table-cell; width: 40%; background: ${headerBg}; padding: ${layoutConfig.contentPadding}; vertical-align: middle; text-align: center;">
          ${logoSection}
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">${data.content.title}</h1>
        </div>
        
        <!-- Right Side - Content -->
        <div style="display: table-cell; width: 60%; padding: ${layoutConfig.contentPadding}; vertical-align: top;">
          ${data.recipientName ? `<p style="color: #374151; font-size: 16px; margin-bottom: ${layoutConfig.sectionSpacing};">Xin chào <strong>${data.recipientName}</strong>,</p>` : ''}
          
          <div style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: ${layoutConfig.sectionSpacing};">
            ${data.content.message}
          </div>
          
          ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
            `<div style="background: #f8fafc; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #3b82f6;">
              <strong style="color: #374151; font-size: 14px;">${key}:</strong>
              <div style="color: #4b5563; font-size: 14px; margin-top: 4px;">${value}</div>
            </div>`
          ).join('') : ''}
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
          Email này được gửi tự động từ hệ thống ${data.companyName}
        </p>
        ${data.footer?.websiteUrl ? `<a href="${data.footer.websiteUrl}" style="color: #3b82f6; text-decoration: none; font-size: 13px;">Truy cập website</a>` : ''}
      </div>
    </div>
  `
}

function createModernTemplate(
  data: EmailTemplateData, 
  options: AdvancedTemplateOptions,
  logoSection: string,
  layoutConfig: any
): string {
  const headerBg = getBackgroundStyle(options.background, options.style)
  
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; ${layoutConfig.containerStyle} background: #ffffff;">
      <!-- Header -->
      <div style="background: ${headerBg}; padding: ${layoutConfig.contentPadding}; text-align: ${layoutConfig.headerAlign};">
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 100%;">
          <div>
            ${logoSection}
          </div>
          <div style="text-align: right;">
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">${data.content.title}</h1>
          </div>
        </div>
      </div>
      
      <!-- Body -->
      <div style="padding: ${layoutConfig.contentPadding}; background: #ffffff;">
        ${data.recipientName ? `
        <div style="background: linear-gradient(90deg, #f8fafc, #ffffff); padding: 20px; border-radius: 12px; margin-bottom: ${layoutConfig.sectionSpacing}; border-left: 4px solid #3b82f6;">
          <p style="color: #374151; font-size: 17px; margin: 0; font-weight: 500;">Xin chào ${data.recipientName},</p>
        </div>
        ` : ''}
        
        <div style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: ${layoutConfig.sectionSpacing};">
          ${data.content.message}
        </div>
        
        ${data.content.details ? `
        <div style="background: #f8fafc; border-radius: 16px; padding: 25px; margin: ${layoutConfig.sectionSpacing} 0;">
          <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Chi tiết thông tin</h3>
          <div style="display: grid; gap: 12px;">
            ${Object.entries(data.content.details).map(([key, value]) => 
              `<div style="display: flex; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="min-width: 120px; font-weight: 600; color: #374151;">${key}:</div>
                <div style="color: #4b5563; flex: 1;">${value}</div>
              </div>`
            ).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Footer -->
      <div style="background: linear-gradient(135deg, #f1f5f9, #e2e8f0); padding: 25px; text-align: center; border-radius: 0 0 16px 16px;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
          ${data.companyName} - Email tự động
        </p>
        ${data.footer?.websiteUrl ? `<a href="${data.footer.websiteUrl}" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; background: white; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Truy cập website</a>` : ''}
      </div>
    </div>
  `
}

function createClassicTemplate(
  data: EmailTemplateData, 
  options: AdvancedTemplateOptions,
  logoSection: string,
  layoutConfig: any
): string {
  const headerBg = getBackgroundStyle(options.background, options.style)
  
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; ${layoutConfig.containerStyle} background: #ffffff; border: 2px solid #d1d5db;">
      <!-- Header -->
      <div style="background: ${headerBg}; padding: ${layoutConfig.contentPadding}; text-align: ${layoutConfig.headerAlign}; border-bottom: 3px solid #374151;">
        ${logoSection}
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 400; text-transform: uppercase; letter-spacing: 2px;">${data.content.title}</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: ${layoutConfig.contentPadding}; background: #ffffff; line-height: 1.8;">
        ${data.recipientName ? `<p style="color: #374151; font-size: 16px; margin-bottom: ${layoutConfig.sectionSpacing}; font-style: italic;">Kính gửi ${data.recipientName},</p>` : ''}
        
        <div style="color: #4b5563; font-size: 16px; margin-bottom: ${layoutConfig.sectionSpacing}; text-align: justify;">
          ${data.content.message}
        </div>
        
        ${data.content.details ? Object.entries(data.content.details).map(([key, value]) => 
          `<div style="border: 1px solid #d1d5db; margin: 10px 0; padding: 15px; background: #f9fafb;">
            <strong style="color: #374151; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">${key}:</strong><br>
            <span style="color: #4b5563; font-size: 15px; margin-top: 5px; display: inline-block;">${value}</span>
          </div>`
        ).join('') : ''}
        
        <div style="margin-top: 30px; text-align: right; font-style: italic; color: #6b7280;">
          Trân trọng,<br>
          <strong>${data.companyName}</strong>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #374151; padding: 20px; text-align: center; color: #d1d5db; border-top: 3px solid #1f2937;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">
          © ${new Date().getFullYear()} ${data.companyName}. Email được gửi tự động.
        </p>
        ${data.footer?.websiteUrl ? `<a href="${data.footer.websiteUrl}" style="color: #93c5fd; text-decoration: underline; font-size: 14px;">Website chính thức</a>` : ''}
      </div>
    </div>
  `
}

// Report Email Template
export const reportEmailTemplate = (reportData: any, options: AdvancedTemplateOptions) => {
  const templateData: EmailTemplateData = {
    companyName: "Project Manager",
    logoUrl: "/logo.png",
    recipientName: reportData.recipientName,
    content: {
      title: `Báo Cáo ${reportData.reportType}`,
      message: `Chúng tôi gửi đến bạn báo cáo ${reportData.reportType.toLowerCase()} được tạo vào ${new Date().toLocaleDateString('vi-VN')}.`,
      details: {
        "Loại báo cáo": reportData.reportType,
        "Ngày tạo": new Date().toLocaleDateString('vi-VN'),
        "Tổng số dự án": reportData.stats?.totalProjects || "N/A",
        "Tổng số nhiệm vụ": reportData.stats?.totalTasks || "N/A",
        "Trạng thái": reportData.status || "Hoàn thành",
        "Ghi chú": reportData.customMessage || "Báo cáo được tạo tự động từ hệ thống"
      }
    },
    footer: {
      websiteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000"
    }
  }

  const html = createAdvancedEmailTemplate(templateData, options)
  
  return {
    subject: `Báo Cáo ${reportData.reportType} - ${new Date().toLocaleDateString('vi-VN')}`,
    html,
    text: `Báo cáo ${reportData.reportType} được gửi từ Project Manager.`
  }
}

// Background and Layout options for UI
export const backgroundOptions = [
  { id: 'gradient', name: 'Gradient Đẹp', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'solid', name: 'Màu Đơn Sắc', preview: '#1f2937' },
  { id: 'pattern', name: 'Họa Tiết', preview: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' },
  { id: 'image', name: 'Hình Nền Tinh Tế', preview: 'url("data:image/svg+xml,%3Csvg...")' }
] as const

export const layoutOptions = [
  { id: 'classic', name: 'Cổ Điển', description: 'Layout truyền thống, trang trọng' },
  { id: 'modern', name: 'Hiện Đại', description: 'Thiết kế hiện đại với typography đẹp' },
  { id: 'card-based', name: 'Thẻ Card', description: 'Các thông tin được chia thành từng thẻ' },
  { id: 'split', name: 'Chia Đôi', description: 'Header bên trái, nội dung bên phải' }
] as const