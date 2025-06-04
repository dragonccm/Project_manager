// Test page for creating sample data and testing the grid
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDatabase } from "@/hooks/use-database"

export default function TestGridPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  
  const {
    projects,
    accounts,
    addProject,
    addAccount,
    isDatabaseAvailable
  } = useDatabase()

  const sampleProjects = [
    {
      name: "Website Công ty ABC",
      domain: "abc-company.com",
      description: "Thiết kế và phát triển website cho công ty ABC",
      status: "active",
      figma_link: "https://figma.com/abc-design"
    },
    {
      name: "E-commerce Platform",
      domain: "shop-online.vn", 
      description: "Nền tảng thương mại điện tử cho SME",
      status: "active",
      figma_link: "https://figma.com/ecommerce-design"
    },
    {
      name: "Mobile App Design",
      domain: "mobileapp.io",
      description: "Thiết kế giao diện ứng dụng di động",
      status: "completed",
      figma_link: "https://figma.com/mobile-design"
    },
    {
      name: "Dashboard Analytics",
      domain: "analytics-pro.com",
      description: "Dashboard phân tích dữ liệu cho doanh nghiệp",
      status: "active",
      figma_link: "https://figma.com/dashboard-design"
    }
  ]

  const createSampleData = async () => {
    setIsCreating(true)
    setMessage("Đang tạo dữ liệu mẫu...")
    
    try {
      // Create projects first
      const createdProjects = []
      for (const project of sampleProjects) {
        const created = await addProject(project)
        createdProjects.push(created)
        setMessage(`Đã tạo project: ${project.name}`)
      }
      
      // Create sample accounts
      const sampleAccounts = [
        {
          project_id: createdProjects[0]?.id || 1,
          username: "admin_abc",
          password: "SecurePass123!",
          email: "admin@abc-company.com",
          website: "https://abc-company.com/admin",
          notes: "Tài khoản admin chính của website ABC"
        },
        {
          project_id: createdProjects[0]?.id || 1,
          username: "editor_abc", 
          password: "Editor2024#",
          email: "editor@abc-company.com",
          website: "https://abc-company.com/wp-admin",
          notes: "Tài khoản biên tập viên"
        },
        {
          project_id: createdProjects[1]?.id || 2,
          username: "shop_admin",
          password: "ShopSecure456$",
          email: "admin@shop-online.vn",
          website: "https://shop-online.vn/admin",
          notes: "Tài khoản quản trị cửa hàng online"
        },
        {
          project_id: createdProjects[2]?.id || 3,
          username: "mobile_dev",
          password: "MobileDev789%",
          email: "dev@mobileapp.io", 
          website: "https://mobileapp.io/portal",
          notes: "Tài khoản phát triển mobile app"
        },
        {
          project_id: createdProjects[3]?.id || 4,
          username: "analytics_user",
          password: "Analytics321@",
          email: "user@analytics-pro.com",
          website: "https://analytics-pro.com/dashboard", 
          notes: "Tài khoản truy cập dashboard analytics"
        }
      ]
      
      for (const account of sampleAccounts) {
        await addAccount(account)
        setMessage(`Đã tạo account: ${account.username}`)
      }
      
      setMessage("✅ Tạo dữ liệu mẫu thành công!")
      
    } catch (error) {
      console.error("Error creating sample data:", error)
      setMessage("❌ Lỗi khi tạo dữ liệu mẫu: " + error.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Grid Component</CardTitle>
          <CardDescription>
            Trang test cho giao diện lưới Accounts & Projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={isDatabaseAvailable ? "default" : "secondary"}>
              Database: {isDatabaseAvailable ? "Kết nối" : "Offline"}
            </Badge>
            <Badge variant="outline">
              Projects: {projects.length}
            </Badge>
            <Badge variant="outline">
              Accounts: {accounts.length}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={createSampleData}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Đang tạo..." : "🎲 Tạo dữ liệu mẫu"}
            </Button>
            
            {message && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <h3 className="font-semibold mb-2">📋 Dữ liệu hiện tại:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Projects ({projects.length})</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {projects.map(project => (
                    <div key={project.id} className="text-sm p-2 bg-muted/50 rounded">
                      {project.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Accounts ({accounts.length})</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {accounts.map(account => (
                    <div key={account.id} className="text-sm p-2 bg-muted/50 rounded">
                      {account.username} ({account.website})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              🏠 Quay về Dashboard chính
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
