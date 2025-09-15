"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, FileSpreadsheet, Calendar, Filter, BarChart3, PaintBucket } from "lucide-react"
import { exportTasksToPDF, exportTemplateReportToPDF } from "@/lib/pdf-export"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"
import { ReportDesigner } from "@/components/report-designer"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

interface TaskReportsProps {
  projects: any[]
  tasks: any[]
}

export function TaskReports({ projects, tasks }: TaskReportsProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { reportTemplates: rawReportTemplates } = useApi()
  
  // Ensure reportTemplates is always an array
  const reportTemplates = Array.isArray(rawReportTemplates) ? rawReportTemplates : []
  
  const [reportType, setReportType] = useState("execution")
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none")
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    to: new Date().toISOString().split("T")[0] // today
  })
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Filter tasks based on criteria
  const getFilteredTasks = () => {
    return tasks.filter((task: any) => {
      const taskDate = task.date ? getLocalDateString(new Date(task.date)) : null
      const dateInRange = taskDate && taskDate >= dateRange.from && taskDate <= dateRange.to
      const projectMatch = selectedProject === "all" || task.projectId == selectedProject || task.project_id == selectedProject
      const statusMatch = selectedStatus === "all" || 
        (selectedStatus === "completed" && task.completed) ||
        (selectedStatus === "pending" && !task.completed) ||
        (selectedStatus === "in-progress" && task.status === "in-progress") ||
        (selectedStatus === "todo" && (!task.status || task.status === "todo"))
      
      return dateInRange && projectMatch && statusMatch
    })
  }

  // Generate task execution report
  const generateExecutionReport = (format: "csv" | "json") => {
    const filteredTasks = getFilteredTasks()
    
    if (format === "csv") {
      let csv = "Task ID,Title,Description,Project,Priority,Status,Created Date,Due Date,Estimated Time (min),Actual Time (min),Completion Status,Last Updated\n"
      
      filteredTasks.forEach((task: any) => {
        const project = projects.find((p) => p.id == (task.projectId || task.project_id))
        const status = task.completed ? "Completed" : 
                     task.status === "in-progress" ? "In Progress" : 
                     task.status === "done" ? "Done" : "To Do"
        
        csv += `${task.id},"${task.title}","${task.description || ''}","${project?.name || 'No Project'}",${task.priority},${status},${task.created_at || ''},${task.date || ''},${task.estimated_time || task.estimatedTime || ''},${task.actual_time || task.actualTime || ''},${task.completed ? 'Yes' : 'No'},${task.updated_at || ''}\n`
      })
      
      downloadFile(csv, `task_execution_report_${Date.now()}.csv`, "text/csv")
    } else {
      const reportData = {
        generated_at: new Date().toISOString(),
        report_type: "Task Execution Process",
        date_range: dateRange,
        filters: {
          project: selectedProject,
          status: selectedStatus
        },
        summary: {
          total_tasks: filteredTasks.length,
          completed_tasks: filteredTasks.filter(t => t.completed).length,
          in_progress_tasks: filteredTasks.filter(t => t.status === "in-progress").length,
          pending_tasks: filteredTasks.filter(t => !t.completed && t.status !== "in-progress").length,
          total_estimated_time: filteredTasks.reduce((sum, t) => sum + (t.estimated_time || t.estimatedTime || 0), 0),
          total_actual_time: filteredTasks.reduce((sum, t) => sum + (t.actual_time || t.actualTime || 0), 0)
        },
        tasks: filteredTasks.map((task: any) => {
          const project = projects.find((p) => p.id == (task.projectId || task.project_id))
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            project: {
              id: project?.id,
              name: project?.name
            },
            priority: task.priority,
            status: task.completed ? "completed" : (task.status || "todo"),
            created_date: task.created_at,
            due_date: task.date,
            estimated_time_minutes: task.estimated_time || task.estimatedTime,
            actual_time_minutes: task.actual_time || task.actualTime,
            completed: task.completed,
            last_updated: task.updated_at,
            execution_progress: {
              stage: task.completed ? "completed" : (task.status || "todo"),
              completion_percentage: task.completed ? 100 : (task.status === "in-progress" ? 50 : 0)
            }
          }
        })
      }
      
      downloadFile(JSON.stringify(reportData, null, 2), `task_execution_report_${Date.now()}.json`, "application/json")
    }
  }

  // Generate status tracking report
  const generateStatusReport = (format: "csv" | "json") => {
    const filteredTasks = getFilteredTasks()
    
    // Group tasks by status
    const statusGroups = {
      todo: filteredTasks.filter(t => !t.completed && (!t.status || t.status === "todo")),
      "in-progress": filteredTasks.filter(t => !t.completed && t.status === "in-progress"),
      done: filteredTasks.filter(t => t.completed || t.status === "done")
    }

    if (format === "csv") {
      let csv = "Status,Task Count,Tasks\n"
      
      Object.entries(statusGroups).forEach(([status, tasks]) => {
        const taskTitles = tasks.map((t: any) => t.title).join("; ")
        csv += `${status.toUpperCase()},${tasks.length},"${taskTitles}"\n`
      })
      
      downloadFile(csv, `task_status_report_${Date.now()}.csv`, "text/csv")
    } else {
      const reportData = {
        generated_at: new Date().toISOString(),
        report_type: "Task Status Tracking",
        date_range: dateRange,
        status_summary: Object.entries(statusGroups).map(([status, tasks]) => ({
          status: status.toUpperCase(),
          count: tasks.length,
          percentage: filteredTasks.length > 0 ? Math.round((tasks.length / filteredTasks.length) * 100) : 0,
          tasks: tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            project: projects.find(p => p.id == (t.projectId || t.project_id))?.name
          }))
        }))
      }
      
      downloadFile(JSON.stringify(reportData, null, 2), `task_status_report_${Date.now()}.json`, "application/json")
    }
  }
  // Download file helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate template-based report
  const generateTemplateBasedReport = (format: "csv" | "json") => {
    if (selectedTemplateId === "none") {
      toast({
        title: "Error",
        description: "Please select a template first.",
        variant: "destructive"
      })
      return
    }

    const template = reportTemplates.find(t => t.id.toString() === selectedTemplateId)
    if (!template) {
      toast({
        title: "Error", 
        description: "Selected template not found.",
        variant: "destructive"
      })
      return
    }

    const templateData = template.template_data as any
    const selectedFields = templateData?.fields || []
    
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Template has no fields selected.",
        variant: "destructive"
      })
      return
    }

    const filteredTasks = getFilteredTasks()

    if (format === "csv") {
      // Generate CSV based on template fields
      const headers = selectedFields.map((fieldId: string) => {
        switch (fieldId) {
          case 'title': return 'Task Title'
          case 'description': return 'Description'
          case 'project': return 'Project'
          case 'status': return 'Status'
          case 'priority': return 'Priority'
          case 'assignee': return 'Assignee'
          case 'created_date': return 'Created Date'
          case 'due_date': return 'Due Date'
          case 'estimated_time': return 'Estimated Time'
          case 'actual_time': return 'Actual Time'
          case 'completion_status': return 'Completed'
          default: return fieldId
        }
      })

      let csv = headers.join(',') + '\n'
      
      filteredTasks.forEach((task: any) => {
        const row = selectedFields.map((fieldId: string) => {
          switch (fieldId) {
            case 'title': return `"${task.title || ''}"`
            case 'description': return `"${task.description || ''}"`
            case 'project': 
              const project = projects.find(p => p.id == (task.projectId || task.project_id))
              return `"${project?.name || 'No Project'}"`
            case 'status': 
              return task.completed ? 'Completed' : (task.status || 'To Do')
            case 'priority': return task.priority || ''
            case 'assignee': return `"${task.assignee || ''}"`
            case 'created_date': return task.created_at || ''
            case 'due_date': return task.date || ''
            case 'estimated_time': return task.estimated_time || task.estimatedTime || ''
            case 'actual_time': return task.actual_time || task.actualTime || ''
            case 'completion_status': return task.completed ? 'Yes' : 'No'
            default: return ''
          }
        }).join(',')
        csv += row + '\n'
      })

      downloadFile(csv, `template_report_${template.name}_${Date.now()}.csv`, "text/csv")
    } else {
      // Generate JSON based on template
      const reportData = {
        generated_at: new Date().toISOString(),
        report_type: "Template-based Report",
        template: {
          id: template.id,
          name: template.name,
          description: template.description
        },
        date_range: dateRange,
        filters: {
          project: selectedProject,
          status: selectedStatus
        },
        summary: {
          total_tasks: filteredTasks.length,
          selected_fields: selectedFields.length
        },
        tasks: filteredTasks.map((task: any) => {
          const project = projects.find(p => p.id == (task.projectId || task.project_id))
          const taskData: any = {}
          
          selectedFields.forEach((fieldId: string) => {
            switch (fieldId) {
              case 'title': taskData.title = task.title; break
              case 'description': taskData.description = task.description; break
              case 'project': taskData.project = { id: project?.id, name: project?.name }; break
              case 'status': taskData.status = task.completed ? 'completed' : (task.status || 'todo'); break
              case 'priority': taskData.priority = task.priority; break
              case 'assignee': taskData.assignee = task.assignee; break
              case 'created_date': taskData.created_date = task.created_at; break
              case 'due_date': taskData.due_date = task.date; break
              case 'estimated_time': taskData.estimated_time = task.estimated_time || task.estimatedTime; break
              case 'actual_time': taskData.actual_time = task.actual_time || task.actualTime; break
              case 'completion_status': taskData.completed = task.completed; break
            }
          })
          
          return taskData
        })
      }

      downloadFile(JSON.stringify(reportData, null, 2), `template_report_${template.name}_${Date.now()}.json`, "application/json")
    }

    toast({
      title: "Success",
      description: `Template-based report exported successfully using "${template.name}".`
    })
  }

  const filteredTasks = getFilteredTasks()
  const completedTasks = filteredTasks.filter(t => t.completed)
  const inProgressTasks = filteredTasks.filter(t => t.status === "in-progress")
  const todoTasks = filteredTasks.filter(t => !t.completed && (!t.status || t.status === "todo"))
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Báo Cáo Task</h1>
      </div>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Báo Cáo Chuẩn
          </TabsTrigger>
          <TabsTrigger value="designer" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            Thiết Kế Báo Cáo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ Lọc Báo Cáo
              </CardTitle>
              <CardDescription>
                Chọn tiêu chí để tạo báo cáo phù hợp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Loại Báo Cáo</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="execution">Quy Trình Thực Hiện Task</SelectItem>
                      <SelectItem value="status">Theo Dõi Trạng Thái</SelectItem>
                    </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng Thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả</SelectItem>
                  <SelectItem value="todo">Cần Làm</SelectItem>
                  <SelectItem value="in-progress">Đang Làm</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                  <SelectItem value="pending">Chưa Hoàn Thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template Báo Cáo</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Báo Cáo Chuẩn</SelectItem>
                  {reportTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Từ Ngày</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Đến Ngày</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Xem Trước Báo Cáo</CardTitle>
          <CardDescription>
            Dữ liệu sẽ được xuất dựa trên các tiêu chí đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredTasks.length}</div>
              <div className="text-sm text-blue-600">Tổng Task</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-green-600">Hoàn Thành</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</div>
              <div className="text-sm text-yellow-600">Đang Làm</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{todoTasks.length}</div>
              <div className="text-sm text-gray-600">Cần Làm</div>
            </div>
          </div>

          <Separator />

          {/* Sample Data Preview */}
          <div>
            <h4 className="font-medium mb-2">Dữ Liệu Mẫu (5 task đầu tiên):</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredTasks.slice(0, 5).map((task: any) => {
                const project = projects.find((p) => p.id == (task.projectId || task.project_id))
                const status = task.completed ? "completed" : (task.status || "todo")
                return (
                  <div key={task.id} className="flex items-center gap-4 p-2 border rounded">
                    <Badge variant={
                      status === "completed" ? "default" :
                      status === "in-progress" ? "secondary" : "outline"
                    }>
                      {status === "completed" ? "Hoàn thành" :
                       status === "in-progress" ? "Đang làm" : "Cần làm"}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {project?.name || "Không có project"} • {task.priority} • {task.date}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredTasks.length > 5 && (
                <div className="text-center text-sm text-muted-foreground p-2">
                  ... và {filteredTasks.length - 5} task khác
                </div>
              )}
            </div>
          </div>

          <Separator />          {/* Export Buttons */}
          <div className="space-y-4">
            <h4 className="font-medium">Xuất Báo Cáo:</h4>
            
            {/* Standard Export */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Báo cáo chuẩn:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => reportType === "execution" ? generateExecutionReport("csv") : generateStatusReport("csv")}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Xuất CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reportType === "execution" ? generateExecutionReport("json") : generateStatusReport("json")}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Xuất JSON
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const data = getFilteredTasks().map((t:any) => ({
                      ...t,
                      project_name: projects.find((p:any)=>p.id==(t.projectId||t.project_id))?.name || ''
                    }))
                    exportTasksToPDF(data, { title: 'Báo cáo Task' })
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Xuất PDF
                </Button>
              </div>
            </div>

            {/* Template-based Export */}
            {reportTemplates.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Báo cáo theo template {selectedTemplateId !== "none" ? `(${reportTemplates.find(t => t.id.toString() === selectedTemplateId)?.name})` : ""}:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => generateTemplateBasedReport("csv")}
                    disabled={selectedTemplateId === "none"}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Xuất CSV theo Template
                  </Button>
                  <Button
                    onClick={() => generateTemplateBasedReport("json")}
                    disabled={selectedTemplateId === "none"}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Xuất JSON theo Template
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedTemplateId === 'none') return;
                      const template = reportTemplates.find((t:any)=> t.id.toString() === selectedTemplateId)
                      if (!template) return;
                      const data = getFilteredTasks();
                      exportTemplateReportToPDF(template, data, { title: template.name })
                    }}
                    disabled={selectedTemplateId === "none"}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Xuất PDF theo Template
                  </Button>
                </div>
                {selectedTemplateId === "none" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Chọn template ở trên để sử dụng tính năng này
                  </p>
                )}
              </div>
            )}
          </div>{filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có task nào phù hợp với tiêu chí đã chọn.</p>
              <p className="text-sm">Hãy thử điều chỉnh bộ lọc để xem dữ liệu.</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="designer">
          <ReportDesigner 
            projects={projects} 
            tasks={tasks}
            onTemplateCreated={(template) => {
              console.log('Template created:', template)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
