"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { getTodayDateString } from "@/lib/date-utils"
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
  FileText,
  Mail,
} from "lucide-react"
import AdvancedEmailComposer from "@/components/advanced-email-composer"
import { useLanguage } from "@/hooks/use-language"
import { getLocalDateString } from "@/lib/date-utils"

interface DashboardOverviewProps {
  projects: any[]
  tasks: any[]
  accounts: any[]
  onToggleTask: (id: string, completed: boolean) => Promise<any>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div>
        <h1 className="text-3xl font-bold">{t("welcome")}</h1>
        <p className="text-muted-foreground">{getTodayDateString()}</p>
      </div><div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            {highPriorityTasks.length}
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProjects")}</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(projects) ? projects.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(projects) ? projects.filter((p) => p.status === "active").length : 0} {t("active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("todayTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedTasks.length}/{todayTasks.length}
            </div>
            <Progress
              value={todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTasks")}</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter((t) => t.completed).length} {t("completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeAccounts")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(accounts) ? accounts.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(projects) ? projects.length : 0} {t("projects")}
            </p>
          </CardContent>
        </Card>
      </div>      {/* Alerts */}
      {highPriorityTasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {t("requiresAttention")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highPriorityTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{highPriorityTasks.length}</Badge>
                  <span className="text-sm">{t("highPriorityTasks")}</span>
                  <Button variant="ghost" size="sm">
                    {t("review")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("projectProgress")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => {
                const progress = getProjectProgress(project.id)
                const projectTasks = tasks.filter((task: any) => task.projectId == project.id)
                const completedProjectTasks = projectTasks.filter((task: any) => task.completed)

                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedProjectTasks.length}/{projectTasks.length} {t("completed")}
                        </p>
                      </div>
                      <Badge variant="outline">{progress}%</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
              {Array.isArray(projects) && projects.length === 0 && (
                <p className="text-center text-muted-foreground py-4">{t("noActiveProjects")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">                  <div
                  className={`w-2 h-2 rounded-full mt-2 ${activity.status === "completed" ? "bg-green-500" : "bg-blue-500"
                    }`}
                /><div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
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
                <p className="text-center text-muted-foreground py-4">{t("noRecentActivity")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("todaySchedule")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks.map((task: any) => {
                const project = Array.isArray(projects) ? projects.find((p) => p.id == task.projectId) : null
                return (
                  <div key={task.id} className="flex items-start gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="text-xs">
                          {task.priority}
                        </Badge>
                        {project && <span className="text-xs text-muted-foreground">{project.name}</span>}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimatedTime}min
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length === 0 && <p className="text-center text-muted-foreground py-4">{t("noTasksToday")}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("quickActions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              <span className="text-sm">{t("newProject")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <CheckSquare className="h-6 w-6" />
              <span className="text-sm">{t("addTask")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">{t("newAccount")}</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">{t("generateReport")}</span>
            </Button>
            {/* Email Composer Triggers */}
            <div className="col-span-2 md:col-span-4 flex flex-wrap gap-2 mt-4">
              <AdvancedEmailComposer
                initialEmailType="projectUpdate"
                trigger={
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Gửi Email Dự Án
                  </Button>
                }
              />
              <AdvancedEmailComposer
                initialEmailType="taskNotification"
                trigger={
                  <Button variant="secondary" size="sm" className="gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Gửi Email Nhiệm Vụ
                  </Button>
                }
              />
              <AdvancedEmailComposer
                initialEmailType="accountUpdate"
                trigger={
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    Gửi Email Tài Khoản
                  </Button>
                }
              />
              <AdvancedEmailComposer
                initialEmailType="reportEmail"
                trigger={
                  <Button variant="secondary" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Gửi Báo Cáo
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}