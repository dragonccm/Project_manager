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
import { GoogleLoader, GoogleTopProgressBar } from "@/components/ui/google-loader"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavigatingTab, setIsNavigatingTab] = useState(false)

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

  // Tab navigation loader effect
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab !== activeTab) {
      setIsNavigatingTab(true)
      setActiveTab(newTab)
      setTimeout(() => {
        setIsNavigatingTab(false)
      }, 350)
    }
  }, [activeTab])

  // Authentication Check
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [user, authLoading])

  // Loading State
  if (authLoading || (dataLoading && !error)) {
    return <GoogleLoader fullScreen text="Initializing Dragonccm Console..." />
  }

  // Các tab cần chiếm trọn khung: bỏ max-width, padding, margin và bo góc của
  // <main> để nội dung nằm sát sidebar và header.
  const FULL_BLEED_TABS = ["a4designer"]
  const isFullBleed = FULL_BLEED_TABS.includes(activeTab)

  // Not Authenticated State
  if (!user) {
    return <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} defaultTab="login" />
  }

  const renderContent = () => {
    return (
      <div
        key={activeTab}
        className={
          isFullBleed
            ? "h-full w-full min-h-0"
            : "animate-page-enter w-full max-w-7xl mx-auto space-y-6"
        }
      >
        {activeTab === "dashboard" && (
          <DashboardOverview
            projects={projects}
            tasks={tasks}
            accounts={accounts}
            onToggleTask={toggleTask}
            onNavigate={handleTabChange}
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Google Top Progress Bar Loader */}
      <GoogleTopProgressBar isNavigating={isNavigatingTab} />

      {/* Top Full Width Header */}
      <Header 
        activeTab={activeTab} 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobile={isMobileMenuOpen}
        onNavigate={handleTabChange}
      />

      {/* Main Content & Sidebar Container */}
      <div className="flex-1 flex min-w-0 overflow-hidden relative">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 top-14 z-50 transform transition-transform duration-300 ease-in-out md:relative md:top-0 md:translate-x-0 bg-background
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
            isMobile={false}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Main Content Area: Floating rounded panel with soft #F0F4F9 background */}
        <main
          className={`flex-1 min-w-0 scroll-smooth relative z-10 bg-[#F0F4F9] dark:bg-[#1E1F22] ${
            isFullBleed
              ? "overflow-hidden"
              : "overflow-auto p-4 md:p-6 lg:p-8 rounded-3xl md:rounded-[28px] mr-2 md:mr-4 mb-2 md:mb-4 mt-1"
          }`}
        >
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

