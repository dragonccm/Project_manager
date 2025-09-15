"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2, Clock3, ListChecks } from "lucide-react"

interface TaskOverviewProps {
  projects: any[]
  tasks: any[]
}

export function TaskOverview({ projects, tasks }: TaskOverviewProps) {
  const total = tasks.length
  const completed = tasks.filter((t:any)=> t.completed).length
  const inProgress = tasks.filter((t:any)=> t.status === 'in-progress').length
  const todo = total - completed - inProgress

  const byProject = projects.map((p:any) => ({
    id: p.id,
    name: p.name,
    total: tasks.filter((t:any)=> (t.projectId||t.project_id) == p.id).length,
    completed: tasks.filter((t:any)=> (t.projectId||t.project_id) == p.id && t.completed).length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Tổng Quan Task</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng Task</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Hoàn Thành</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /><div className="text-3xl font-bold">{completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Đang Làm</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-yellow-600" /><div className="text-3xl font-bold">{inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cần Làm</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-gray-600" /><div className="text-3xl font-bold">{todo}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thống Kê Theo Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byProject.map((p)=> (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.name}</div>
                  <Badge variant="outline">{p.total} task</Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Hoàn thành: {p.completed}</div>
                <div className="mt-1 h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: `${p.total ? Math.round(p.completed/p.total*100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
