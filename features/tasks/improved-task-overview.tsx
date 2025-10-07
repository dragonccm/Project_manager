"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  CheckCircle2, 
  Clock3, 
  ListChecks, 
  AlertCircle, 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  Users,
  Target,
  Activity
} from "lucide-react"

interface TaskOverviewProps {
  projects: any[]
  tasks: any[]
  accounts?: any[]
}

export function TaskOverview({ projects, tasks, accounts }: TaskOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")

  // Ensure we have valid data arrays
  const validTasks = Array.isArray(tasks) ? tasks.filter(task => task && (task.id || task._id)) : []
  const validProjects = Array.isArray(projects) ? projects.filter(project => project && (project.id || project._id)) : []

  // Calculate basic statistics
  const stats = useMemo(() => {
    const total = validTasks.length
    const completed = validTasks.filter(task => task.completed || task.status === 'completed').length
    const inProgress = validTasks.filter(task => task.status === 'in-progress' || task.status === 'doing').length
    const todo = validTasks.filter(task => !task.completed && task.status !== 'completed' && task.status !== 'in-progress' && task.status !== 'doing').length
    const overdue = validTasks.filter(task => {
      if (!task.date && !task.dueDate) return false
      const dueDate = new Date(task.date || task.dueDate)
      const today = new Date()
      return dueDate < today && !task.completed
    }).length

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [validTasks])

  // Calculate project statistics
  const projectStats = useMemo(() => {
    return validProjects.map(project => {
      const projectId = project.id || project._id
      const projectTasks = validTasks.filter(task => {
        const taskProjectId = task.projectId || task.project_id || task.project?.id
        return taskProjectId?.toString() === projectId?.toString()
      })
      
      const totalTasks = projectTasks.length
      const completedTasks = projectTasks.filter(task => task.completed || task.status === 'completed').length
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        id: projectId,
        name: project.name || 'Unnamed Project',
        total: totalTasks,
        completed: completedTasks,
        progress: progressPercentage,
        status: project.status || 'active'
      }
    }).filter(project => project.total > 0) // Only show projects with tasks
  }, [validProjects, validTasks])

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return validTasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Project filter
      if (filterProject !== "all") {
        const taskProjectId = task.projectId || task.project_id || task.project?.id
        if (taskProjectId?.toString() !== filterProject) return false
      }

      // Status filter
      if (filterStatus !== "all") {
        const taskStatus = task.completed ? 'completed' : (task.status || 'todo')
        if (taskStatus !== filterStatus) return false
      }

      // Priority filter
      if (filterPriority !== "all") {
        if (task.priority !== filterPriority) return false
      }

      return true
    })
  }, [validTasks, searchTerm, filterProject, filterStatus, filterPriority])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (task: any) => {
    if (task.completed) return 'bg-green-100 text-green-800'
    if (task.status === 'in-progress' || task.status === 'doing') return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Task Overview</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng số: {stats.total} tasks
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-600" />
              Tổng Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Hoàn Thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <Progress value={stats.completionRate} className="mt-1 h-1" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-600" />
              Đang Làm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-yellow-600" />
              Cần Làm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.todo}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Quá Hạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project Statistics */}
      {projectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Thống Kê Theo Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectStats.map(project => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{project.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {project.total} tasks
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                    <span>Hoàn thành: {project.completed}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ Lọc & Tìm Kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm task..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Project Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả projects</SelectItem>
                  {validProjects.map(project => (
                    <SelectItem key={project.id || project._id} value={(project.id || project._id).toString()}>
                      {project.name || 'Unnamed Project'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="in-progress">Đang làm</SelectItem>
                  <SelectItem value="todo">Cần làm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ưu tiên</label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Danh Sách Tasks ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không tìm thấy tasks phù hợp</p>
              </div>
            ) : (
              filteredTasks.map((task, index) => {
                const project = validProjects.find(p => 
                  (p.id || p._id)?.toString() === (task.projectId || task.project_id || task.project?.id)?.toString()
                )
                
                return (
                  <div key={task.id || task._id || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{task.title || 'Untitled Task'}</span>
                        {task.priority && (
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.name}
                          </span>
                        )}
                        {(task.date || task.dueDate) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.date || task.dueDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {task.estimatedTime && (
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {task.estimatedTime}min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task)}`}>
                        {task.completed ? 'Hoàn thành' : 
                         task.status === 'in-progress' || task.status === 'doing' ? 'Đang làm' : 'Cần làm'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}