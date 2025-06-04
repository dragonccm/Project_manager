"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { getTodayDateString } from "@/lib/date-utils.js"
import {
  Bell,
  Users,
  FolderOpen,
  CheckSquare,
  Star,
  Clock,
  AlertTriangle,
  Plus,
  BarChart3,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"

interface DashboardOverviewProps {
  projects: any[]
  tasks: any[]
  accounts: any[]
  onToggleTask: (id: number, completed: boolean) => Promise<any>
}

export function DashboardOverview({
  projects,
  tasks,
  accounts,
  onToggleTask
}: DashboardOverviewProps) {
  const { t } = useLanguage()
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter((task: any) => task.date === today)
  const completedTasks = todayTasks.filter((task: any) => task.completed)
  const highPriorityTasks = tasks.filter((task: any) => task.priority === "high" && !task.completed)

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentActivity = [
    ...tasks
      .filter((task: any) => new Date(task.date) >= sevenDaysAgo)
      .map((task: any) => ({
        type: "task",
        title: task.title,
        date: task.date,
        status: task.completed ? "completed" : "pending",
        priority: task.priority,
      })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t: any) => t.id == taskId)
    if (task && onToggleTask) {
      await onToggleTask(task.id, task.completed)
    }
  }
  
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((task: any) => task.projectId == projectId)
    if (projectTasks.length === 0) return 0
    const completed = projectTasks.filter((task: any) => task.completed).length
    return Math.round((completed / projectTasks.length) * 100)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile-optimized header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{t("welcome")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{getTodayDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="min-h-[44px] px-3">
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{highPriorityTasks.length}</span>
          </Button>
        </div>
      </div>

      {/* Enhanced responsive stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProjects")}</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.filter((p) => p.status === "active").length} {t("active")}
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("todayTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">
              {completedTasks.length}/{todayTasks.length}
            </div>
            <Progress
              value={todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.filter((t) => t.completed).length} {t("completed")}
            </p>
          </CardContent>
        </Card>

        <Card className="touch-manipulation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeAccounts")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.length} {t("projects")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized alerts */}
      {highPriorityTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-base">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {t("requiresAttention")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {highPriorityTasks.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{highPriorityTasks.length}</Badge>
                    <span className="text-sm">{t("highPriorityTasks")}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="self-start sm:self-auto min-h-[44px]">
                    {t("review")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced responsive three-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Project Progress - Full width on mobile/tablet */}
        <Card className="xl:col-span-1 touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 shrink-0" />
              {t("projectProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => {
                const progress = getProjectProgress(project.id)
                const projectTasks = tasks.filter((task: any) => task.projectId == project.id)
                const completedProjectTasks = projectTasks.filter((task: any) => task.completed)

                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedProjectTasks.length}/{projectTasks.length} {t("completed")}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">{progress}%</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
              {projects.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">{t("noActiveProjects")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Enhanced mobile scrolling */}
        <Card className="xl:col-span-1 touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 shrink-0" />
              {t("recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-80 overflow-y-auto overscroll-contain">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0 touch-manipulation">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.status === "completed" ? "bg-green-500" : "bg-blue-500"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.date}</span>
                      {activity.type === "task" && (activity as any).priority && (
                        <Badge variant={(activity as any).priority === "high" ? "destructive" : "outline"} className="text-xs">
                          {(activity as any).priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">{t("noRecentActivity")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule - Enhanced touch targets */}
        <Card className="xl:col-span-1 touch-manipulation">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 shrink-0" />
              {t("todaySchedule")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {todayTasks.map((task: any) => {
                const project = projects.find((p) => p.id == task.projectId)
                return (
                  <div key={task.id} className="flex items-start gap-3 touch-manipulation">
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTask(task.id)} 
                      className="mt-1 touch-manipulation h-5 w-5" 
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="text-xs">
                          {task.priority}
                        </Badge>
                        {project && <span className="text-xs text-muted-foreground truncate">{project.name}</span>}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          {task.estimatedTime}min
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">{t("noTasksToday")}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile-optimized Quick Actions */}
      <Card className="touch-manipulation">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 shrink-0" />
            {t("quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 min-h-[88px] touch-manipulation">
              <FolderOpen className="h-6 w-6" />
              <span className="text-sm text-center">{t("newProject")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 min-h-[88px] touch-manipulation">
              <CheckSquare className="h-6 w-6" />
              <span className="text-sm text-center">{t("addTask")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 min-h-[88px] touch-manipulation">
              <Users className="h-6 w-6" />
              <span className="text-sm text-center">{t("newAccount")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 min-h-[88px] touch-manipulation">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm text-center">{t("generateReport")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
