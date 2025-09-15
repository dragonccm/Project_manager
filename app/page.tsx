"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, BarChart3, Users, FolderOpen, CheckSquare, Mail, Database, Code, FileText } from "lucide-react"
import { ProjectForm } from "@/features/projects/project-form"
import { AccountManager } from "@/features/accounts/account-manager"
import { TrelloTasks } from "@/features/tasks/trello-tasks"
import { TaskOverview } from "@/features/tasks/task-overview"
import { TaskReports } from "@/features/tasks/task-reports"
import { ThemeToggle } from "@/components/theme-toggle"
import { SettingsPanel } from "@/features/settings/settings-panel"
import { CodeComponentManager } from "@/features/code-components/code-component-manager"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { DashboardOverview } from "@/features/dashboard/dashboard-overview"
import { EmailComposer } from "@/features/emails/email-composer"
import { EmailSettings } from "@/features/emails/email-settings"
import { DatabaseStatus } from "@/features/database/database-status"
import { useApi } from "@/hooks/use-api"
import { UserMenu } from "@/components/auth/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"

export default function Dashboard() {
  // All hooks called unconditionally at the top
  const { user, loading: authLoading, clearCookie } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailNotificationSettings, setEmailNotificationSettings] = useState({
    enabled: false,
    recipients: []
  });
  const {
    projects,
    accounts,
    tasks,
    emailTemplates,
    settings,
    loading,
    error,
    isApiAvailable,
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
  } = useApi();

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("emailNotificationSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setEmailNotificationSettings({
        enabled: parsed.enabled,
        recipients: parsed.recipients
      });
    }
  }, []);

  const handleEmailSettingsChange = useCallback((settings: any) => {
    setEmailNotificationSettings({
      enabled: settings.enabled,
      recipients: settings.recipients
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("emailNotificationSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setEmailNotificationSettings({
        enabled: parsed.enabled,
        recipients: parsed.recipients
      });
    }
  }, []);

  // Conditional returns after all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
    );
  }

  // Don't render main content if user is not authenticated
  if (!user) {
    return (
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
    )
  }

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3 },
    { id: "projects", label: t("projects"), icon: FolderOpen },
    { id: "accounts", label: t("accounts"), icon: Users },
    { id: "tasks", label: t("dailyTasks"), icon: CheckSquare },
    { id: "tasksOverview", label: "Task Overview", icon: BarChart3 },
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
      case "tasksOverview":
        return (
          <TaskOverview
            projects={projects}
            tasks={tasks}
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
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-bold">Project Manager</h2>
        <div className="flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
          {!isApiAvailable && (
            <Badge variant="outline" className="text-xs">
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-card border-r border-border">
          <div className="p-4">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Project Manager</h2>
                <div className="flex items-center gap-2">
                  <UserMenu />
                  <ThemeToggle />
                </div>
              </div>
              {!loading && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-muted-foreground">
                    {projects.length} {t("projects")} • {tasks.filter((t) => !t.completed).length} {t("pending")}
                  </p>
                  <div className="flex items-center gap-1">
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCookie}
                        className="p-1 h-6 w-6"
                        title="Clear Auth Cookie (Dev)"
                      >
                        🍪
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                      className="p-1 h-6 w-6"
                    >
                      <Database className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {!isApiAvailable && (
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
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Navigation */}
          <div className="lg:hidden bg-card border-b border-border">
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    className="shrink-0 m-2"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
