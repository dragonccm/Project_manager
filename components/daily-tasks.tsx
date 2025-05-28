"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Circle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useDatabase } from "@/hooks/use-database"

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
}

export function DailyTasks({ projects, tasks }: DailyTasksProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium" as const,
    estimatedTime: 60,
  })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const { t } = useLanguage()
  const { addTask, toggleTask } = useDatabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await addTask({
        project_id: formData.projectId ? Number.parseInt(formData.projectId) : undefined,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        date: selectedDate,
        estimated_time: formData.estimatedTime,
      })

      setFormData({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        estimatedTime: 60,
      })
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Error saving task. Please try again.")
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask(Number.parseInt(taskId), !completed)
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Error updating task. Please try again.")
    }
  }

  const todayTasks = tasks.filter((task: any) => task.date === selectedDate)
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
                    {projects.map((project) => (
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
                const project = projects.find((p) => p.id == task.projectId)
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
                            {task.estimated_time}min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">{t("noTasksForThisDay")}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
