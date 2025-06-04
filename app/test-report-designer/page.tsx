"use client"

import React from 'react'
import { ReportDesigner } from '@/components/report-designer'

// Sample data for testing
const sampleProjects = [
  { id: '1', name: 'Project Alpha', status: 'active' },
  { id: '2', name: 'Project Beta', status: 'active' },
  { id: '3', name: 'Project Gamma', status: 'completed' }
]

const sampleTasks = [
  {
    id: '1',
    title: 'Design Homepage',
    description: 'Create the main landing page design',
    projectId: '1',
    priority: 'high',
    status: 'in-progress',
    completed: false,
    date: '2025-06-02',
    created_at: '2025-06-01',
    estimated_time: 120,
    actual_time: 90,
    assignee: 'John Doe'
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Add user login and registration functionality',
    projectId: '1',
    priority: 'high',
    status: 'completed',
    completed: true,
    date: '2025-06-01',
    created_at: '2025-05-30',
    estimated_time: 240,
    actual_time: 280,
    assignee: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Write Documentation',
    description: 'Create user manual and API documentation',
    projectId: '2',
    priority: 'medium',
    status: 'todo',
    completed: false,
    date: '2025-06-05',
    created_at: '2025-06-01',
    estimated_time: 180,
    actual_time: 0,
    assignee: 'Mike Johnson'
  },
  {
    id: '4',
    title: 'Database Optimization',
    description: 'Optimize database queries for better performance',
    projectId: '2',
    priority: 'low',
    status: 'todo',
    completed: false,
    date: '2025-06-10',
    created_at: '2025-06-02',
    estimated_time: 360,
    actual_time: 0,
    assignee: 'Sarah Wilson'
  }
]

export default function ReportDesignerTest() {
  const handleTemplateCreated = (template: any) => {
    console.log('New template created:', template)
    alert(`Template "${template.name}" created successfully!`)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Report Designer Test</h1>
        <p className="text-muted-foreground">Test the drag-and-drop report designer functionality</p>
      </div>
      
      <ReportDesigner 
        projects={sampleProjects}
        tasks={sampleTasks}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  )
}
