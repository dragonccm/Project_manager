"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, BarChart3, Users, FolderOpen, CheckSquare, Mail, Database } from "lucide-react"
import { ProjectForm } from "@/components/project-form"
import { AccountManager } from "@/components/account-manager"
import { DailyTasks } from "@/components/daily-tasks"
import { FeedbackSystem } from "@/components/feedback-system"
import { ReportGenerator } from "@/components/report-generator"
import { SettingsPanel } from "@/components/settings-panel"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { DashboardOverview } from "@/components/dashboard-overview"
import { EmailComposer } from "@/components/email-composer"
import { DatabaseStatus } from "@/components/database-status"
import { useDatabase } from "@/hooks/use-database"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false)
  const { t } = useLanguage()
  const { theme } = useTheme()

  // Replace projects state with database hook
  const {
    projects,
    accounts,
    tasks,
    feedbacks,
    reportTemplates,
    emailTemplates,
    settings,
    loading,
    error,
    isDatabaseAvailable,
    addProject,
    editProject,
    removeProject,
    addAccount,
    removeAccount,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    addFeedback,
    editFeedback,
    addReportTemplate,
    removeReportTemplate,
    addEmailTemplate,
    removeEmailTemplate,
    updateUserSettings,
  } = useDatabase()

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3 },
    { id: "projects", label: t("projects"), icon: FolderOpen },
    { id: "accounts", label: t("accounts"), icon: Users },
    { id: "tasks", label: t("dailyTasks"), icon: CheckSquare },
    { id: "feedback", label: t("feedback"), icon: Bell },
    { id: "reports", label: t("reports"), icon: BarChart3 },
    { id: "settings", label: t("settings"), icon: Settings },
    { id: "email", label: t("emailComposer"), icon: Mail },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "projects":
        return (
          <ProjectForm
            projects={projects}
            onAddProject={addProject}
            onEditProject={editProject}
            onDeleteProject={removeProject}
          />
        )
      case "accounts":
        return (
          <AccountManager
            projects={projects}
            accounts={accounts}
            onAddAccount={addAccount}
            onDeleteAccount={removeAccount}
          />
        )
      case "tasks":
        return (
          <DailyTasks
            projects={projects}
            tasks={tasks}
            onAddTask={addTask}
            onEditTask={editTask}
            onDeleteTask={removeTask}
            onToggleTask={toggleTask}
          />
        )
      case "feedback":
        return (
          <FeedbackSystem
            projects={projects}
            feedbacks={feedbacks}
            onAddFeedback={addFeedback}
            onEditFeedback={editFeedback}
          />
        )
      case "reports":
        return (
          <ReportGenerator
            projects={projects}
            tasks={tasks}
            feedbacks={feedbacks}
            accounts={accounts}
            templates={reportTemplates}
            onAddTemplate={addReportTemplate}
            onDeleteTemplate={removeReportTemplate}
          />
        )
      case "settings":
        return <SettingsPanel settings={settings} onUpdateSettings={updateUserSettings} />
      case "email":
        return (
          <EmailComposer
            projects={projects}
            accounts={accounts}
            templates={emailTemplates}
            onAddTemplate={addEmailTemplate}
            onDeleteTemplate={removeEmailTemplate}
          />
        )
      default:
        return (
          <DashboardOverview
            projects={projects}
            tasks={tasks}
            accounts={accounts}
            feedbacks={feedbacks}
            onToggleTask={toggleTask}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-background ${theme} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-background ${theme} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-destructive">Error loading data. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold">Project Manager</h2>
            {!loading && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-muted-foreground">
                  {projects.length} {t("projects")} • {tasks.filter((t) => !t.completed).length} {t("pending")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                  className="p-1 h-6 w-6"
                >
                  <Database className="h-3 w-3" />
                </Button>
              </div>
            )}
            {!isDatabaseAvailable && (
              <Badge variant="outline" className="mt-2 text-xs">
                Offline Mode
              </Badge>
            )}
          </div>

          {showDatabaseStatus && (
            <div className="mb-4">
              <DatabaseStatus />
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {item.id === "feedback" && !loading && (
                  <Badge variant="destructive" className="ml-auto">
                    {feedbacks.filter((f) => f.status === "new").length}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">{renderContent()}</div>
      </div>
    </div>
  )
}
