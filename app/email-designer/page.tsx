'use client'

import { EmailDesigner } from '@/features/emails'

export default function EmailDesignerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Thiết Kế Email</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các mẫu email chuyên nghiệp với công cụ thiết kế trực quan
          </p>
        </div>
        
        <EmailDesigner />
      </div>
    </div>
  )
}