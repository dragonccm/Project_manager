"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Circle, Mail, Inbox, Loader, Check, X } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useEmail } from "@/hooks/use-email"
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
  id: string
  title: string
  description: string
  projectId: string
  priority: "low" | "medium" | "high"
  completed: boolean
  date: string
  estimatedTime: number
  actualTime?: number
}

interface DailyTasksProps {
  projects: any[]
  tasks: any[]
  onAddTask?: (taskData: any) => Promise<any>
  onEditTask?: (id: number, taskData: any) => Promise<any>
  onDeleteTask?: (id: number) => Promise<void>
  onToggleTask?: (id: number, completed: boolean) => Promise<any>
  emailNotifications?: {
    enabled: boolean
    recipients: string[]
  }
}

// Tạo component cho task có thể kéo thả
interface DraggableTaskCardProps {
  task: any;
  project: any;
  onToggle: (taskId: string, completed: boolean) => void;
  getPriorityColor: (priority: string) => string;
}

function DraggableTaskCard({ task, project, onToggle, getPriorityColor }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({
    id: task.id,
    data: { ...task }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`border rounded-lg p-4 mb-2 bg-white cursor-move hover:shadow-md transition-shadow ${task.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id, task.completed)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
            <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
          </div>
          {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project && (
              <span className="flex items-center gap-1">
                <Circle className="h-3 w-3" />
                {project.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimated_time || task.estimatedTime}min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DailyTasks({ projects, tasks, onAddTask, onEditTask, onDeleteTask, onToggleTask, emailNotifications }: DailyTasksProps) {
  const { t } = useLanguage()
  const { sendTaskCreatedEmail, sendTaskCompletedEmail } = useEmail()
  
  // Thêm state để ẩn/hiện form thêm task
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Thêm state để theo dõi tasks theo trạng thái
  const [todoTasks, setTodoTasks] = useState<any[]>([])
  const [inProgressTasks, setInProgressTasks] = useState<any[]>([])
  const [doneTasks, setDoneTasks] = useState<any[]>([])
  
  // Sensors cho drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px khoảng cách tối thiểu để kích hoạt kéo
      },
    })
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "none",
    priority: "medium" as const,
    estimatedTime: 60,
    status: "todo" // Thêm trạng thái mặc định
  })
  const [selectedDate, setSelectedDate] = useState(() => {
    // Smart default: use date with existing tasks if today has no tasks
    if (!tasks || tasks.length === 0) {
      return new Date().toISOString().split("T")[0]
    }
    
    const today = new Date().toISOString().split("T")[0]
    const todayTasks = tasks.filter((task: any) => {
      const taskDate = task.date ? new Date(task.date).toISOString().split("T")[0] : null
      return taskDate === today
    })
    
    if (todayTasks.length > 0) {
      return today
    }
    
    // Find the most recent task date
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return sortedTasks[0]?.date ? new Date(sortedTasks[0].date).toISOString().split("T")[0] : today
  })

  // Debug: Log khi selectedDate thay đổi
  useEffect(() => {
    console.log("DailyTasks: selectedDate =", selectedDate);
    console.log("Today's ISO date =", new Date().toISOString().split("T")[0]);
    
    // Log các task được lọc theo ngày đã chọn
    const filteredTasks = tasks.filter((task: any) => {
      const taskDate = task.date ? new Date(task.date).toISOString().split("T")[0] : null;
      const matches = taskDate === selectedDate;
      console.log(`Task ${task.id}: date=${task.date}, ISO date=${taskDate}, matches=${matches}`);
      return matches;
    });
    
    console.log("Filtered tasks for selectedDate:", filteredTasks.length);
  }, [selectedDate, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!onAddTask) {
      alert("Chức năng thêm task chưa được kết nối!")
      return
    }

    try {
      const newTask = await onAddTask({
        project_id: formData.projectId && formData.projectId !== "" && formData.projectId !== "none" ? Number.parseInt(formData.projectId) : null,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        date: selectedDate,
        estimated_time: formData.estimatedTime,
      })

      // Send email notification if enabled
      if (emailNotifications?.enabled && emailNotifications.recipients.length > 0) {
        try {
          const project = projects.find(p => p.id === Number.parseInt(formData.projectId))
          await sendTaskCreatedEmail({
            taskTitle: formData.title,
            taskDescription: formData.description,
            projectName: project?.name || "Chưa chọn project",
            priority: formData.priority,
            dueDate: selectedDate,
            assignedTo: "Chưa phân công"
          }, emailNotifications.recipients)
        } catch (emailError) {
          console.error("Error sending task created email:", emailError)
          // Don't show email error to user, just log it
        }
      }

      setFormData({
        title: "",
        description: "",
        projectId: "none",
        priority: "medium",
        estimatedTime: 60,
      })
      
      alert("Task đã được tạo thành công!")
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Lỗi khi lưu task. Vui lòng thử lại.")
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (!onToggleTask) {
      alert("Chức năng cập nhật task chưa được kết nối!")
      return
    }

    try {
      await onToggleTask(Number.parseInt(taskId), !completed)
      
      // Send email notification when task is completed
      if (!completed && emailNotifications?.enabled && emailNotifications.recipients.length > 0) {
        try {
          const task = tasks.find(t => t.id === Number.parseInt(taskId))
          if (task) {
            const project = projects.find(p => p.id === task.projectId)
            await sendTaskCompletedEmail({
              taskTitle: task.title,
              taskDescription: task.description,
              projectName: project?.name || "Chưa chọn project",
              priority: task.priority,
              dueDate: task.date
            }, emailNotifications.recipients)
          }
        } catch (emailError) {
          console.error("Error sending task completed email:", emailError)
          // Don't show email error to user, just log it
        }
      }
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Lỗi khi cập nhật task. Vui lòng thử lại.")
    }
  }

  // Use database data only
  const displayProjects = projects || []
  const displayTasks = tasks || []
  
  const todayTasks = displayTasks.filter((task: any) => {
    // Handle both ISO date strings and simple date strings
    const taskDate = task.date ? new Date(task.date).toISOString().split("T")[0] : null
    return taskDate === selectedDate
  })
  const completedTasks = todayTasks.filter((task: any) => task.completed)
  const pendingTasks = todayTasks.filter((task: any) => !task.completed)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("dailyTasks")}</h1>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Show connection status */}
      {(!projects || projects.length === 0) && (!tasks || tasks.length === 0) ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          ⚠️ Không thể kết nối đến database hoặc chưa có dữ liệu. Vui lòng kiểm tra kết nối database.
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          ✅ Đã kết nối database thành công - {projects?.length || 0} project(s), {tasks?.length || 0} task(s) tổng cộng.
          {todayTasks.length > 0 ? ` Hôm nay có ${todayTasks.length} task(s).` : " Hôm nay chưa có task nào."}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTasks")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("completed")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("pending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("addNewTask")}</CardTitle>
            <CardDescription>{t("createTaskForToday")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("taskTitle")}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("enterTaskTitle")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("taskDescription")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">{t("project")}</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProject")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noProject")}</SelectItem>
                    {displayProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">{t("estimatedTime")} (min)</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) })}
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("addTask")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("todayTasks")}</CardTitle>
            <CardDescription>
              {selectedDate === new Date().toISOString().split("T")[0]
                ? t("tasksForToday")
                : `${t("tasksFor")} ${selectedDate}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayTasks.map((task: any) => {
                // Handle both projectId formats from database (project_id) and UI (projectId)
                const taskProjectId = task.projectId || task.project_id?.toString()
                const project = displayProjects.find((p) => p.id == taskProjectId || p.id === taskProjectId)
                
                return (
                  <div key={task.id} className={`border rounded-lg p-4 ${task.completed ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {project && (
                            <span className="flex items-center gap-1">
                              <Circle className="h-3 w-3" />
                              {project.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_time || task.estimatedTime}min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedDate === new Date().toISOString().split("T")[0] 
                    ? t("noTasksForThisDay") 
                    : `Không có task nào cho ngày ${selectedDate}`}
                  <br />
                  <span className="text-sm">Hãy thêm task mới hoặc chọn ngày khác.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
