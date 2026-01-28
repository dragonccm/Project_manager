"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"
import { useApi } from "@/hooks/use-api"
import { AuthModal } from "@/components/auth/auth-modal"
import { LifeLine } from "react-loading-indicators"

// Layout Components
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

// Feature Components
import { ProjectForm } from "@/features/projects/project-form"
import { AccountManager } from "@/features/accounts/account-manager"
import { TrelloTasks } from "@/features/tasks/trello-tasks"
import { TaskOverview } from "@/features/tasks/improved-task-overview"
import { TaskReports } from "@/features/tasks/task-reports"
import { SettingsPanel } from "@/features/settings/settings-panel"
import { NotesManager } from "@/features/notes/notes-manager"
import { DashboardOverview } from "@/features/dashboard/dashboard-overview"
import { EmailComposer } from "@/features/emails/email-composer"
import { EmailSettings } from "@/features/emails/email-settings"
import { ShareManagement } from "@/features/admin/share-management"
import { A4EditorManager } from "@/features/a4-editor/A4EditorManager"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // API Hooks
  const {
    projects,
    accounts,
    tasks,
    loading: dataLoading,
    error,
    addProject,
    editProject,
    removeProject,
    addAccount,
    removeAccount,
    addTask,
    editTask,
    removeTask,
    toggleTask,
  } = useApi()

  // Authentication Check
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [user, authLoading])

  // Loading State
  if (authLoading || (dataLoading && !error)) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <LifeLine color="#6366f1" size="medium" text="" textColor="" />
        </div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Initializing Dragonccm...</p>
      </div>
    )
  }

  // Not Authenticated State
  if (!user) {
    return <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultTab="login" />
  }

  const renderContent = () => {
    return (
      <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-6">
        {activeTab === "dashboard" && (
          <DashboardOverview
            projects={projects}
            tasks={tasks}
            accounts={accounts}
            onToggleTask={toggleTask}
          />
        )}
        {activeTab === "projects" && (
          <ProjectForm
            projects={projects}
            onAddProject={addProject}
            onEditProject={editProject}
            onDeleteProject={removeProject}
          />
        )}
        {activeTab === "accounts" && (
          <AccountManager
            projects={projects}
            accounts={accounts}
            onAddAccount={addAccount}
            onDeleteAccount={removeAccount}
          />
        )}
        {activeTab === "tasks" && (
           <TrelloTasks
             projects={projects}
             tasks={tasks}
             onAddTask={addTask}
             onEditTask={editTask}
             onDeleteTask={removeTask}
             onToggleTask={toggleTask}
             emailNotifications={{ enabled: false, recipients: [] }} 
           />
        )}
        {activeTab === "tasksOverview" && (
          <TaskOverview projects={projects} tasks={tasks} accounts={accounts} />
        )}
        {activeTab === "reports" && (
          <TaskReports projects={projects} tasks={tasks} />
        )}
        {activeTab === "components" && <NotesManager />}
        {activeTab === "a4designer" && <A4EditorManager />}
        {activeTab === "email" && (
          <EmailComposer projects={projects} tasks={tasks} accounts={accounts} />
        )}
        {activeTab === "emailSettings" && <EmailSettings onSettingsChange={() => {}} />}
        {activeTab === "admin" && <ShareManagement />}
        {activeTab === "settings" && (
          <SettingsPanel
            projects={projects}
            accounts={accounts}
            tasks={tasks}
            onImportData={async () => {}} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isMobile={false}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <Header 
          activeTab={activeTab} 
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          isMobile={true}
          onNavigate={setActiveTab}
        />

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth relative z-10">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
