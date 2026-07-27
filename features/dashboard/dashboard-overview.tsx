"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { getTodayDateString } from "@/lib/date-utils"
import {
  Heart,
  FolderOpen,
  ArrowUpRight,
  Sparkles,
  CheckSquare,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Users,
  AlertTriangle,
  Mail,
  Layout as LayoutIcon,
  Calendar
} from "lucide-react"
import AdvancedEmailComposer from "@/components/advanced-email-composer"
import { useLanguage } from "@/hooks/use-language"

interface DashboardOverviewProps {
  projects: any[]
  tasks: any[]
  accounts: any[]
  onToggleTask: (id: string, completed: boolean) => Promise<any>
  /** Chuyển tab. Thiếu callback này thì 4 nút trên các thẻ hero không làm gì cả. */
  onNavigate?: (tab: string) => void
}

export function DashboardOverview({
  projects,
  tasks,
  accounts,
  onToggleTask,
  onNavigate
}: DashboardOverviewProps) {
  const { t } = useLanguage()
  const today = new Date().toISOString().split("T")[0]
  const todayTasks = tasks.filter((task: any) => task.date === today)
  const completedTasks = todayTasks.filter((task: any) => task.completed)
  const highPriorityTasks = tasks.filter((task: any) => task.priority === "high" && !task.completed)

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
    <div className="space-y-8 animate-fade-in p-1 md:p-3 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Quản lý dự án & Tiến độ công việc
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#1B66C9]" />
            Hôm nay: {getTodayDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold bg-[#E8F0FE] text-[#1B66C9] dark:bg-[#2C384E] dark:text-[#8AB4F8]">
            {projects.length} Dự án active
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold bg-[#E6F4EA] text-[#34A853] dark:bg-[#1C3A27] dark:text-[#81C995]">
            {tasks.length} Task tổng cộng
          </Badge>
        </div>
      </div>

      {/* 4 Hero Cards Grid with Real Project Manager Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero Card 1: Projects Overview (Google Blue) */}
        <div className="rounded-[22px] bg-[#1B66C9] text-white p-5 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group hover-lift cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
              Dự án
            </span>
          </div>
          <div className="space-y-1.5 mt-4">
            <h3 className="font-bold text-base leading-snug tracking-tight">
              {projects.length} Dự án đang thực hiện
            </h3>
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
              Theo dõi tiến độ, phân bổ nhân sự và trạng thái tổng quan các dự án hệ thống.
            </p>
          </div>
          <div className="mt-4">
            <Button size="sm" className="rounded-full bg-white text-[#1B66C9] hover:bg-white/90 text-xs font-semibold px-4 h-8.5 gap-1.5 shadow-none transition-all active:scale-95" onClick={() => onNavigate?.("projects")}>
              <ArrowUpRight className="w-3.5 h-3.5" />
              Tổng quan Dự án
            </Button>
          </div>
        </div>

        {/* Hero Card 2: A4 Designer (Rainbow Border Dark Card) */}
        <div className="rainbow-border p-5 text-white flex flex-col justify-between min-h-[220px] shadow-sm group hover-lift cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <LayoutIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm">
              Biên tập A4
            </span>
          </div>
          <div className="space-y-1.5 mt-4">
            <h3 className="font-bold text-base leading-snug tracking-tight text-white">
              Thiết kế Mẫu A4 & Sơ đồ
            </h3>
            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
              Công cụ đồ họa Konva A4 canvas, tạo mẫu báo cáo, sơ đồ Mermaid và xuất PDF/PNG.
            </p>
          </div>
          <div className="mt-4">
            <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold px-4 h-8.5 gap-1.5 shadow-none transition-all active:scale-95" onClick={() => onNavigate?.("a4designer")}>
              <ArrowUpRight className="w-3.5 h-3.5" />
              Mở A4 Designer
            </Button>
          </div>
        </div>

        {/* Hero Card 3: Today's Tasks */}
        <div className="rounded-[22px] bg-[#0F0F11] border border-white/10 text-white p-5 flex flex-col justify-between min-h-[220px] shadow-sm group hover-lift cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-[#FBBC04]/20 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-[#FBBC04]" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm">
              {t("dailyTasks")}
            </span>
          </div>
          <div className="space-y-1.5 mt-4">
            <h3 className="font-bold text-base leading-snug tracking-tight text-white">
              {completedTasks.length} / {todayTasks.length} Task hoàn thành
            </h3>
            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
              {todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}% tỉ lệ hoàn thành danh mục công việc trong ngày.
            </p>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 text-xs font-semibold px-4 h-8.5 gap-1.5 bg-transparent transition-all active:scale-95" onClick={() => onNavigate?.("tasks")}>
              <ArrowUpRight className="w-3.5 h-3.5" />
              Bảng công việc
            </Button>
          </div>
        </div>

        {/* Hero Card 4: Team Accounts */}
        <div className="rounded-[22px] bg-[#0F0F11] border border-white/10 text-white p-5 flex flex-col justify-between min-h-[220px] shadow-sm group hover-lift cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-full bg-[#EA4335]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#F28B82]" />
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm">
              Thành viên
            </span>
          </div>
          <div className="space-y-1.5 mt-4">
            <h3 className="font-bold text-base leading-snug tracking-tight text-white">
              {accounts.length} Thành viên hệ thống
            </h3>
            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
              Tài khoản người dùng, phân quyền truy cập và phân công công việc.
            </p>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 text-xs font-semibold px-4 h-8.5 gap-1.5 bg-transparent transition-all active:scale-95" onClick={() => onNavigate?.("accounts")}>
              <ArrowUpRight className="w-3.5 h-3.5" />
              Quản lý Tài khoản
            </Button>
          </div>
        </div>
      </div>

      {/* Alert for High Priority Tasks if any */}
      {highPriorityTasks.length > 0 && (
        <div className="p-4 rounded-2xl border border-[#EA4335]/30 bg-[#FCE8E6] dark:bg-[#3C2221] flex items-center gap-4 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#EA4335] text-white flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-[#EA4335] dark:text-[#F28B82]">Cần chú ý ngay!</h4>
            <p className="text-xs text-foreground/80">Bạn có {highPriorityTasks.length} công việc mức độ ưu tiên CAO chưa hoàn thành.</p>
          </div>
          <Button size="sm" className="rounded-full bg-[#EA4335] hover:bg-[#EA4335]/90 text-white text-xs font-semibold px-4" onClick={() => onNavigate?.("tasks")}>
            Xem ngay
          </Button>
        </div>
      )}

      {/* Main Grid: Projects & Quick Actions on Left, Today Schedule on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Projects Progress & Quick Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real Projects Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E8F0FE] text-[#1B66C9] flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">Tiến độ Dự án</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{projects.length} Dự án</span>
            </div>

            <Card className="rounded-[20px] bg-card border border-border/80 shadow-none p-5 space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 4).map((project) => {
                  const progress = getProjectProgress(project.id)
                  const projectTasks = tasks.filter((task: any) => task.projectId == project.id)
                  const completedProjectTasks = projectTasks.filter((task: any) => task.completed)

                  return (
                    <div key={project.id} className="space-y-2 group p-2 rounded-xl hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#1B66C9] dark:bg-[#2C384E] dark:text-[#8AB4F8] flex items-center justify-center text-xs font-bold">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-foreground group-hover:text-[#1B66C9] transition-colors">{project.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {completedProjectTasks.length} / {projectTasks.length} tasks đã hoàn thành
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono text-xs rounded-full px-2.5 bg-secondary font-bold">{progress}%</Badge>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2 bg-secondary" 
                        indicatorClassName="bg-[#1B66C9] dark:bg-[#8AB4F8]"
                      />
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 opacity-60">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Chưa có dự án nào trong hệ thống</p>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions & Composers Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FEF7E0] text-[#B45309] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Tác vụ Nhanh & Email</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="rounded-[20px] bg-card border border-border/80 shadow-none p-4 flex flex-col justify-between min-h-[120px]">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Soạn Email Báo cáo Dự án</h4>
                  <p className="text-xs text-muted-foreground mt-1">Tự động tổng hợp thông tin dự án gửi thành viên qua SMTP.</p>
                </div>
                <div className="mt-4">
                  <AdvancedEmailComposer
                    initialEmailType="projectUpdate"
                    trigger={
                      <Button size="sm" variant="outline" className="rounded-full text-xs h-8 gap-1.5 w-full justify-center border-border">
                        <Mail className="w-3.5 h-3.5 text-[#1B66C9]" /> Soạn Email Dự án
                      </Button>
                    }
                  />
                </div>
              </Card>

              <Card className="rounded-[20px] bg-card border border-border/80 shadow-none p-4 flex flex-col justify-between min-h-[120px]">
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Thông báo Công việc</h4>
                  <p className="text-xs text-muted-foreground mt-1">Gửi thông báo cập nhật Task hoàn thành đến danh sách nhóm.</p>
                </div>
                <div className="mt-4">
                  <AdvancedEmailComposer
                    initialEmailType="taskNotification"
                    trigger={
                      <Button size="sm" variant="outline" className="rounded-full text-xs h-8 gap-1.5 w-full justify-center border-border">
                        <Mail className="w-3.5 h-3.5 text-[#34A853]" /> Soạn Email Task
                      </Button>
                    }
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Schedule Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E6F4EA] text-[#34A853] flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">Lịch trình Hôm nay</h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{todayTasks.length} Tasks</span>
          </div>

          <Card className="rounded-[20px] bg-card border border-border/80 shadow-none p-4 space-y-3">
            <div className="space-y-2.5">
              {todayTasks.length > 0 ? (
                todayTasks.slice(0, 6).map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTask(task.id)} 
                      className="mt-0.5 rounded-sm border-muted-foreground/40 data-[state=checked]:bg-[#1B66C9]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={task.priority === "high" ? "destructive" : "outline"} 
                          className="text-[10px] h-4.5 px-2 rounded-full uppercase font-bold"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estimatedTime || 30}m
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-60">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Hôm nay không có task nào</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


