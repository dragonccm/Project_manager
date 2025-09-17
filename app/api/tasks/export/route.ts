import { NextRequest, NextResponse } from 'next/server'
import { getTasks } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'
import type { Task } from '@/types/database'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    
    console.log('Export request - User ID:', request.user.id, 'Format:', format)
    const tasks = await getTasks(request.user.id) as any[]
    
    if (format === 'csv') {
      // Create CSV with UTF-8 BOM for Vietnamese character support
      const headers = ['Title', 'Description', 'Status', 'Priority', 'Created At']
      const csvRows = [
        headers.join(','), // Header row
        ...tasks.map((task: any) => [
          `"${(task.title || '').replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          `"${task.status || ''}"`,
          `"${task.priority || ''}"`,
          `"${task.created_at || ''}"`
        ].join(','))
      ]
      
      const csvContent = '\uFEFF' + csvRows.join('\n') // Add BOM for UTF-8
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="tasks_export.csv"'
        }
      })
    }
    
    if (format === 'json') {
      return NextResponse.json(tasks, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': 'attachment; filename="tasks_export.json"'
        }
      })
    }
    
    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    
  } catch (error) {
    console.error('Error exporting tasks:', error)
    return NextResponse.json(
      { error: 'Failed to export tasks' },
      { status: 500 }
    )
  }
})