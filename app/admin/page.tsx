import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Settings, Users, BarChart3 } from 'lucide-react'

export default function AdminPage() {
  const adminTools = [
    {
      title: 'Data Migration',
      description: 'Migrate data from old Neon database JSON files to MongoDB',
      href: '/admin/migration',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports and analytics data',
      href: '/admin/reports',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Administrative tools and utilities for managing the project manager application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-300">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Important Security Notice
        </h3>
        <p className="text-yellow-700 text-sm">
          This admin panel provides powerful tools that can affect the entire application. 
          Please ensure you have proper authentication and authorization in place before deploying to production. 
          Access should be restricted to authorized administrators only.
        </p>
      </div>
    </div>
  )
}