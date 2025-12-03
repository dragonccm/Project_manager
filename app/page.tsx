"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, BarChart3, Users, FolderOpen, CheckSquare, Mail, Database, Code, FileText, PieChart, Cog, Activity, Shield, Layout } from "lucide-react"
import { ProjectForm } from "@/features/projects/project-form"
import { AccountManager } from "@/features/accounts/account-manager"
import { TrelloTasks } from "@/features/tasks/trello-tasks"
import { TaskOverview } from "@/features/tasks/improved-task-overview"
import { EnhancedTaskOverview } from "@/features/tasks/enhanced-task-overview"
import { TaskReports } from "@/features/tasks/task-reports"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { SettingsPanel } from "@/features/settings/settings-panel"
import { NotesManager } from "@/features/notes/notes-manager"
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
import { LifeLine } from "react-loading-indicators"
import AdvancedEmailComposer from "@/components/advanced-email-composer"
import { ShareManagement } from "@/features/admin/share-management"

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
      <div className="min-h-screen flex items-center justify-center loading-backdrop loading-fade-in">
        <div className="loading-container">
          <LifeLine color="#32cd32" size="medium" text="" textColor="" />
          <p className="loading-text text-foreground">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab="login"
        />
      </>
    );
  }

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3 },
    { id: "projects", label: t("projects"), icon: FolderOpen },
    { id: "accounts", label: t("accounts"), icon: Users },
    { id: "tasks", label: t("dailyTasks"), icon: CheckSquare },
    { id: "tasksOverview", label: t("taskOverview"), icon: PieChart },
    { id: "reports", label: t("reports"), icon: FileText },
    { id: "components", label: "Notes", icon: Code },
    { id: "a4designer", label: "A4 Designer", icon: Layout },
    { id: "email", label: t("emailComposer"), icon: Mail },
    { id: "admin", label: t("adminPanel"), icon: Shield },
    { id: "emailSettings", label: t("emailSettings"), icon: Cog },
    { id: "settings", label: t("settings"), icon: Settings },
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
            accounts={accounts}
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
        return <NotesManager />
      case "a4designer":
        // Redirect to dedicated A4 editor page
        if (typeof window !== 'undefined') {
          window.location.href = '/a4-editor';
        }
        return (
          <div className="text-center py-12">
            <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">A4 Designer</h2>
            <p className="text-muted-foreground mb-4">Đang chuyển đến trang thiết kế A4...</p>
          </div>
        )
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
      case "admin":
        return <ShareManagement />
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
      <div className={`min-h-screen bg-background ${theme} flex items-center justify-center loading-backdrop loading-fade-in`}>
        <div className="loading-container">
          <LifeLine color="#32cd32" size="medium" text="" textColor="" />
          <p className="loading-text text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-background ${theme} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-destructive">{t("errorLoading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-lg font-bold">{t("projectManager")}</h2>
        <div className="flex items-center gap-2">
          <UserMenu />
          <LanguageToggle />
          <ThemeToggle />
          {!isApiAvailable && (
            <Badge variant="outline" className="text-xs">
              {t("offline")}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-card border-r border-border">
          <div className="p-4">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{t("projectManager")}</h2>
                <div className="flex items-center gap-2">
                  <UserMenu />
                  <LanguageToggle />
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
                  {t("offline")}
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

        {/* Desktop Main Content */}
        <div className="hidden md:flex flex-1 flex-col">
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Content first, sticky navigation at bottom */}
      <div className="md:hidden flex flex-col h-screen">
        {/* Mobile Main Content */}
        <div className="flex-1 mobile-scroll-container p-4 mobile-content-with-nav">
          {renderContent()}
        </div>

        {/* Mobile Navigation - Sticky Bottom */}
        <div className="mobile-sticky-nav fixed bottom-0 left-0 right-0 border-t border-border z-50 glass pb-safe">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex min-w-max justify-around w-full px-2">
              {menuItems.slice(0, 5).map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  className={`mobile-nav-button flex-col h-14 px-1 min-w-[64px] ${activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className={`h-5 w-5 mb-1 ${activeTab === item.id ? 'animate-bounce' : ''}`} />
                  <span className="text-[10px] leading-tight text-center font-medium">{item.label}</span>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="mobile-nav-button flex-col h-14 px-1 min-w-[64px] text-muted-foreground"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-[10px] leading-tight text-center font-medium">{t("settings")}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Status and Database Controls */}
          <div className="px-4 pb-2">
            {!loading && (
              <p className="text-xs text-muted-foreground text-center mb-2">
                {projects.length} {t("projects")} • {tasks.filter((t) => !t.completed).length} {t("pending")}
                {!isApiAvailable && ` • ${t("offline")}`}
              </p>
            )}

            {/* Mobile Database Status Toggle */}
            <div className="flex justify-center gap-2 mb-2">
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCookie}
                  className="h-6 px-2 text-xs"
                  title="Clear Auth Cookie (Dev)"
                >
                  🍪 Dev
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDatabaseStatus(!showDatabaseStatus)}
                className="h-6 px-2 text-xs"
              >
                <Database className="h-3 w-3 mr-1" />
                DB Status
              </Button>
            </div>

            {/* Mobile Database Status */}
            {showDatabaseStatus && (
              <div className="mb-2">
                <DatabaseStatus />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
