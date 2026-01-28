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
  Zap,
  Layout as LayoutIcon
} from "lucide-react"
import AdvancedEmailComposer from "@/components/advanced-email-composer"
import { useLanguage } from "@/hooks/use-language"

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
    .slice(0, 5)

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
    <div className="space-y-8 animate-fade-in p-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent drop-shadow-sm">
            {t("welcome")}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            {getTodayDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="shadow-soft hover:shadow-glow-primary transition-all rounded-full h-10 w-10 relative">
            <Bell className="h-5 w-5" />
            {highPriorityTasks.length > 0 && (
               <span className="absolute top-0 right-0 h-3 w-3 bg-destructive rounded-full border-2 border-background animate-pulse" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card overflow-hidden relative border-0 shadow-soft-lg group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderOpen className="h-24 w-24 text-primary transform rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalProjects")}</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-glow-primary">
              <FolderOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">{Array.isArray(projects) ? projects.length : 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <span className="text-success font-medium flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+2
              </span> 
              this month
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
        </Card>

        <Card className="glass-card overflow-hidden relative border-0 shadow-soft-lg group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckSquare className="h-24 w-24 text-accent transform -rotate-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("todayTasks")}</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shadow-glow-accent">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">
              {completedTasks.length} <span className="text-lg text-muted-foreground font-normal">/ {todayTasks.length}</span>
            </div>
            <Progress
              value={todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0}
              className="mt-3 h-1.5 bg-accent/20"
              indicatorClassName="bg-accent"
            />
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent" />
        </Card>       

        <Card className="glass-card overflow-hidden relative border-0 shadow-soft-lg group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="h-24 w-24 text-success transform rotate-6" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("totalTasks")}</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1 has-tooltip" title="Completion Rate">
               {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-success to-transparent" />
        </Card>

        <Card className="glass-card overflow-hidden relative border-0 shadow-soft-lg group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="h-24 w-24 text-secondary-foreground transform -rotate-6" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("activeAccounts")}</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">{Array.isArray(accounts) ? accounts.length : 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Active team members
            </p>
          </CardContent>
           <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-foreground to-transparent" />
        </Card>
      </div>

      {highPriorityTasks.length > 0 && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-center gap-4 animate-accordion-down shadow-sm">
           <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 animate-pulse">
              <AlertTriangle className="h-5 w-5 text-destructive" />
           </div>
           <div className="flex-1">
             <h3 className="font-semibold text-destructive">{t("requiresAttention")}</h3>
             <p className="text-sm text-muted-foreground">You have {highPriorityTasks.length} high priority tasks pending.</p>
           </div>
           <Button variant="destructive" size="sm" className="shadow-lg shadow-destructive/20">
             {t("review")}
           </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
        {/* Project Progress - Main Focus */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="glass-card shadow-soft h-full border-white/20 dark:border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutIcon className="h-5 w-5 text-primary" />
                {t("projectProgress")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.slice(0, 5).map((project) => {
                  const progress = getProjectProgress(project.id)
                  const projectTasks = tasks.filter((task: any) => task.projectId == project.id)
                  const completedProjectTasks = projectTasks.filter((task: any) => task.completed)

                  return (
                    <div key={project.id} className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                             {project.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <p className="font-medium text-sm group-hover:text-primary transition-colors cursor-pointer">{project.name}</p>
                             <p className="text-xs text-muted-foreground">
                               {completedProjectTasks.length}/{projectTasks.length} tasks
                             </p>
                           </div>
                        </div>
                        <Badge variant="secondary" className="font-mono bg-secondary/50">{progress}%</Badge>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2 bg-secondary/30" 
                        indicatorClassName="bg-gradient-to-r from-primary to-accent"
                      />
                    </div>
                  )
                })}
                {Array.isArray(projects) && projects.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <FolderOpen className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">{t("noActiveProjects")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel: Schedule & Quick Actions */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Today's Schedule */}
          <Card className="glass-card shadow-soft border-white/20 dark:border-white/5 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-accent" />
                {t("todaySchedule")}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.priority === "high" ? "destructive" : "outline"} className="text-[10px] h-5 px-1.5 uppercase">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {task.estimatedTime}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))
                ) : (
                  <div className="text-center py-8 opacity-60">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t("noTasksToday")}</p>
                    <Button variant="link" size="sm" className="text-primary mt-1">Add a task</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card shadow-soft border-white/20 dark:border-white/5">
             <CardHeader className="pb-3">
               <CardTitle className="flex items-center gap-2 text-base">
                 <Zap className="h-4 w-4 text-yellow-500" />
                 {t("quickActions")}
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" className="h-auto py-3 flex flex-col gap-1 hover:bg-primary hover:text-primary-foreground transition-all">
                   <FolderOpen className="h-5 w-5" />
                   <span className="text-xs font-medium">{t("newProject")}</span>
                 </Button>
                 <Button variant="secondary" className="h-auto py-3 flex flex-col gap-1 hover:bg-accent hover:text-accent-foreground transition-all">
                   <CheckSquare className="h-5 w-5" />
                   <span className="text-xs font-medium">{t("addTask")}</span>
                 </Button>
               </div>
               
               <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Email Composers</p>
                  <div className="grid grid-cols-2 gap-2">
                      <AdvancedEmailComposer
                        initialEmailType="projectUpdate"
                        trigger={<Button variant="ghost" size="sm" className="w-full justify-start text-xs"><Mail className="h-3 w-3 mr-2" /> Project</Button>}
                      />
                      <AdvancedEmailComposer
                        initialEmailType="taskNotification"
                        trigger={<Button variant="ghost" size="sm" className="w-full justify-start text-xs"><Mail className="h-3 w-3 mr-2" /> Task</Button>}
                      />
                  </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}