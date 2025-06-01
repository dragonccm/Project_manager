"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, BarChart3, Users, FolderOpen, CheckSquare, Mail, Database, Code, FileText } from "lucide-react"
import { ProjectForm } from "@/features/projects/project-form"
import { AccountManager } from "@/features/accounts/account-manager"
import { TrelloTasks } from "@/features/tasks/trello-tasks"
import { TaskReports } from "@/features/tasks/task-reports"

import { SettingsPanel } from "@/features/settings/settings-panel"
import { CodeComponentManager } from "@/features/code-components/code-component-manager"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { DashboardOverview } from "@/features/dashboard/dashboard-overview"
import { EmailComposer } from "@/features/emails/email-composer"
import { EmailSettings } from "@/features/emails/email-settings"
import { DatabaseStatus } from "@/features/database/database-status"
import { useDatabase } from "@/hooks/use-database"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false)
  const [emailNotificationSettings, setEmailNotificationSettings] = useState({
    enabled: false,
    recipients: []
  })
  const { t } = useLanguage()
  const { theme } = useTheme()

  // Load email notification settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("emailNotificationSettings")
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setEmailNotificationSettings({
        enabled: parsed.enabled,
        recipients: parsed.recipients
      })
    }
  }, [])

  // Handle email settings changes
  const handleEmailSettingsChange = useCallback((settings: any) => {
    setEmailNotificationSettings({
      enabled: settings.enabled,
      recipients: settings.recipients
    })
  }, [])

  // Replace projects state with database hook
  const {
    projects,
    accounts,
    tasks,
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
    addEmailTemplate,
    removeEmailTemplate,
    updateUserSettings,
  } = useDatabase()

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3 },
    { id: "projects", label: t("projects"), icon: FolderOpen },
    { id: "accounts", label: t("accounts"), icon: Users },
    { id: "tasks", label: t("dailyTasks"), icon: CheckSquare },
    { id: "reports", label: "Báo Cáo", icon: FileText },
    { id: "components", label: "Code Components", icon: Code },
    { id: "settings", label: t("settings"), icon: Settings },
    { id: "email", label: t("emailComposer"), icon: Mail },
    { id: "emailSettings", label: "Email Settings", icon: Settings },
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
          <TrelloTasks
            projects={projects}
            tasks={tasks}
            onAddTask={addTask}
            onEditTask={editTask}
            onDeleteTask={removeTask}
            onToggleTask={toggleTask}
            emailNotifications={emailNotificationSettings}
          />
        )
      case "reports":
        return (
          <TaskReports
            projects={projects}
            tasks={tasks}
          />
        )
      case "components":
        return <CodeComponentManager />
      case "settings":
        return (
          <SettingsPanel
            projects={projects}
            accounts={accounts}
            tasks={tasks}
            onImportData={async (data) => {
              // Handle import by calling individual add functions
              if (data.projects) {
                for (const project of data.projects) {
                  await addProject(project)
                }
              }
              if (data.accounts) {
                for (const account of data.accounts) {
                  await addAccount(account)
                }
              }
              if (data.tasks) {
                for (const task of data.tasks) {
                  await addTask(task)
                }
              }
            }}
          />
        )
      case "email":
        return (
          <EmailComposer
            projects={projects}
            tasks={tasks}
            accounts={accounts}
          />
        )
      case "emailSettings":
        return <EmailSettings onSettingsChange={handleEmailSettingsChange} />
      default:
        return (
          <DashboardOverview
            projects={projects}
            tasks={tasks}
            accounts={accounts}
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
