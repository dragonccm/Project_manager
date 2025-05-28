"use client"

import { useState, useEffect } from "react"
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getAccounts,
  createAccount,
  deleteAccount,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getFeedbacks,
  createFeedback,
  updateFeedback,
  getReportTemplates,
  createReportTemplate,
  deleteReportTemplate,
  getEmailTemplates,
  createEmailTemplate,
  deleteEmailTemplate,
  getSettings,
  updateSettings,
  testDatabaseConnection,
  initializeTables,
} from "@/lib/database"
import { createLocalStorageOperations } from "@/lib/database-fallback"
import {
  Project,
  Account,
  Task,
  Feedback,
  ReportTemplate,
  EmailTemplate,
  Settings,
  CreateProjectInput,
  CreateAccountInput,
  CreateTaskInput,
  CreateFeedbackInput,
  CreateReportTemplateInput,
  CreateEmailTemplateInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateFeedbackInput,
  UpdateSettingsInput,
} from "@/types/database"

export function useDatabase() {
  const [projects, setProjects] = useState<Project[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean>(false)

  const localOps = createLocalStorageOperations()

  const loadFromLocalStorage = () => {
    try {
      console.log("Loading data from localStorage...")
      const savedProjects = localStorage.getItem("projects")
      const savedAccounts = localStorage.getItem("accounts")
      const savedTasks = localStorage.getItem("tasks")
      const savedFeedbacks = localStorage.getItem("feedbacks")
      const savedReportTemplates = localStorage.getItem("reportTemplates")
      const savedEmailTemplates = localStorage.getItem("emailTemplates")
      const savedSettings = localStorage.getItem("settings")

      setProjects(savedProjects ? JSON.parse(savedProjects) : [])
      setAccounts(savedAccounts ? JSON.parse(savedAccounts) : [])
      setTasks(savedTasks ? JSON.parse(savedTasks) : [])
      setFeedbacks(savedFeedbacks ? JSON.parse(savedFeedbacks) : [])
      setReportTemplates(savedReportTemplates ? JSON.parse(savedReportTemplates) : [])
      setEmailTemplates(savedEmailTemplates ? JSON.parse(savedEmailTemplates) : [])
      setSettings(
        savedSettings
          ? JSON.parse(savedSettings)
          : {
              language: "en",
              theme: "light",
              notifications: { email: true, desktop: false, feedback: true, tasks: true },
              custom_colors: { primary: "#3b82f6", secondary: "#64748b", accent: "#f59e0b", background: "#ffffff" },
            },
      )
      console.log("Data loaded from localStorage successfully")
    } catch (err) {
      console.error("Error loading from localStorage:", err)
      setError(err instanceof Error ? err : new Error("Unknown error occurred"))
    }
  }

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Test database connection first
      const connectionTest = await testDatabaseConnection()
      console.log("Database connection test:", connectionTest)

      if (!connectionTest.success) {
        console.warn("Database not available, using localStorage fallback:", connectionTest.error)
        setIsDatabaseAvailable(false)
        loadFromLocalStorage()
        return
      }

      // Initialize database tables
      const initResult = await initializeTables()
      if (!initResult.success) {
        console.warn("Failed to initialize database tables, using localStorage fallback:", initResult.error)
        setIsDatabaseAvailable(false)
        loadFromLocalStorage()
        return
      }

      setIsDatabaseAvailable(true)
      console.log("Loading data from database...")

      // Load from database
      const [
        projectsData,
        accountsData,
        tasksData,
        feedbacksData,
        reportTemplatesData,
        emailTemplatesData,
        settingsData,
      ] = await Promise.all([
        getProjects(),
        getAccounts(),
        getTasks(),
        getFeedbacks(),
        getReportTemplates(),
        getEmailTemplates(),
        getSettings(),
      ])

      console.log("Database data loaded:", {
        projects: projectsData.length,
        accounts: accountsData.length,
        tasks: tasksData.length,
        feedbacks: feedbacksData.length,
      })

      // Map database fields to component-expected fields
      const mappedAccounts = accountsData.map((account: any) => ({
        ...account,
        id: account.id.toString(), // Ensure ID is string for components
        projectId: account.project_id?.toString() || "1",
        createdAt: account.created_at
      }))

      const mappedTasks = tasksData.map((task: any) => ({
        ...task,
        id: task.id.toString(), // Ensure ID is string for components
        projectId: task.project_id?.toString() || "1",
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }))

      const mappedProjects = projectsData.map((project: any) => ({
        ...project,
        id: project.id.toString(), // Ensure ID is string for components
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        figmaLink: project.figma_link
      }))

      const mappedFeedbacks = feedbacksData.map((feedback: any) => ({
        ...feedback,
        id: feedback.id.toString(), // Ensure ID is string for components
        projectId: feedback.project_id?.toString() || "1",
        createdAt: feedback.created_at
      }))

      setProjects(mappedProjects as Project[])
      setAccounts(mappedAccounts as Account[])
      setTasks(mappedTasks as Task[])
      setFeedbacks(mappedFeedbacks as Feedback[])
      setReportTemplates(reportTemplatesData as ReportTemplate[])
      setEmailTemplates(emailTemplatesData as EmailTemplate[])
      setSettings(
        (settingsData as Settings) || {
          language: "en",
          theme: "light",
          notifications: { email: true, desktop: false, feedback: true, tasks: true },
          custom_colors: { primary: "#3b82f6", secondary: "#64748b", accent: "#f59e0b", background: "#ffffff" },
        },
      )
    } catch (err) {
      console.error("Database error, falling back to localStorage:", err)
      setIsDatabaseAvailable(false)
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Project operations
  const addProject = async (projectData: CreateProjectInput) => {
    try {
      console.log("Adding project:", projectData)

      if (!isDatabaseAvailable) {
        console.log("Using localStorage for project creation")
        const newProject = localOps.createProject(projectData) as Project
        setProjects((prev) => [newProject, ...prev])
        return newProject
      }

      console.log("Using database for project creation")
      const newProject = await createProject(projectData) as any
      console.log("Project created in database:", newProject)
      
      // Map database fields to component-expected fields
      const mappedProject = {
        ...newProject,
        id: newProject.id.toString(),
        createdAt: newProject.created_at,
        updatedAt: newProject.updated_at,
        figmaLink: newProject.figma_link
      } as Project
      
      setProjects((prev) => [mappedProject, ...prev])
      return mappedProject
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newProject = localOps.createProject(projectData) as Project
      setProjects((prev) => [newProject, ...prev])
      setIsDatabaseAvailable(false)
      return newProject
    }
  }

  const editProject = async (id: number, projectData: UpdateProjectInput) => {
    try {
      console.log("Editing project:", id, projectData)

      if (!isDatabaseAvailable) {
        const updatedProject = localOps.updateProject(id.toString(), projectData)
        setProjects((prev) => prev.map((p) => (p.id == id ? updatedProject as Project : p)))
        return updatedProject
      }

      const updatedProject = await updateProject(id, projectData) as Project
      setProjects((prev) => prev.map((p) => (p.id === id ? updatedProject : p)))
      return updatedProject
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedProject = localOps.updateProject(id.toString(), projectData)
      setProjects((prev) => prev.map((p) => (p.id == id ? updatedProject as Project : p)))
      setIsDatabaseAvailable(false)
      return updatedProject
    }
  }

  const removeProject = async (id: number) => {
    try {
      console.log("Removing project:", id)

      if (!isDatabaseAvailable) {
        localOps.deleteProject(id.toString())
        setProjects((prev) => prev.filter((p) => p.id != id))
        return
      }

      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      localOps.deleteProject(id.toString())
      setProjects((prev) => prev.filter((p) => p.id != id))
      setIsDatabaseAvailable(false)
    }
  }

  // Account operations
  const addAccount = async (accountData: CreateAccountInput) => {
    try {
      console.log("Adding account:", accountData)

      if (!isDatabaseAvailable) {
        const newAccount = localOps.createAccount(accountData) as Account
        setAccounts((prev) => [newAccount, ...prev])
        return newAccount
      }

      const newAccount = await createAccount(accountData) as any
      console.log("Account created in database:", newAccount)
      
      // Map database fields to component-expected fields
      const mappedAccount = {
        ...newAccount,
        id: newAccount.id.toString(),
        projectId: newAccount.project_id?.toString() || "1",
        createdAt: newAccount.created_at
      } as Account
      
      setAccounts((prev) => [mappedAccount, ...prev])
      return mappedAccount
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newAccount = localOps.createAccount(accountData) as Account
      setAccounts((prev) => [newAccount, ...prev])
      setIsDatabaseAvailable(false)
      return newAccount
    }
  }

  const removeAccount = async (id: number) => {
    try {
      if (!isDatabaseAvailable) {
        localOps.deleteAccount(id.toString())
        setAccounts((prev) => prev.filter((a) => a.id != id))
        return
      }

      await deleteAccount(id)
      setAccounts((prev) => prev.filter((a) => a.id != id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      localOps.deleteAccount(id.toString())
      setAccounts((prev) => prev.filter((a) => a.id != id))
      setIsDatabaseAvailable(false)
    }
  }

  // Task operations
  const addTask = async (taskData: CreateTaskInput) => {
    try {
      console.log("Adding task:", taskData)

      if (!isDatabaseAvailable) {
        const newTask = localOps.createTask(taskData)
        setTasks((prev) => [newTask as Task, ...prev])
        return newTask
      }

      const newTask = await createTask(taskData) as any
      
      // Map database fields to component-expected fields
      const mappedTask = {
        ...newTask,
        id: newTask.id.toString(),
        projectId: newTask.project_id?.toString() || "1",
        createdAt: newTask.created_at,
        updatedAt: newTask.updated_at
      } as Task
      
      setTasks((prev) => [mappedTask, ...prev])
      return mappedTask
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newTask = localOps.createTask(taskData)
      setTasks((prev) => [newTask as Task, ...prev])
      setIsDatabaseAvailable(false)
      return newTask
    }
  }

  const editTask = async (id: number, taskData: UpdateTaskInput) => {
    try {
      if (!isDatabaseAvailable) {
        const updatedTask = localOps.updateTask(id.toString(), taskData)
        setTasks((prev) => prev.map((t) => (t.id == id ? updatedTask as Task : t)))
        return updatedTask
      }

      const updatedTask = await updateTask(id, taskData) as any
      
      // Map database fields to component-expected fields
      const mappedTask = {
        ...updatedTask,
        id: updatedTask.id.toString(),
        projectId: updatedTask.project_id?.toString() || "1",
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at
      } as Task
      
      setTasks((prev) => prev.map((t) => (t.id == id ? mappedTask : t)))
      return mappedTask
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedTask = localOps.updateTask(id.toString(), taskData)
      setTasks((prev) => prev.map((t) => (t.id == id ? updatedTask as Task : t)))
      setIsDatabaseAvailable(false)
      return updatedTask
    }
  }

  const removeTask = async (id: number) => {
    try {
      if (!isDatabaseAvailable) {
        localOps.deleteTask(id.toString())
        setTasks((prev) => prev.filter((t) => t.id != id))
        return
      }

      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id != id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      localOps.deleteTask(id.toString())
      setTasks((prev) => prev.filter((t) => t.id != id))
      setIsDatabaseAvailable(false)
    }
  }

  const toggleTask = async (id: number, completed: boolean) => {
    try {
      console.log("Toggling task:", id, completed)

      if (!isDatabaseAvailable) {
        const updatedTask = localOps.updateTask(id.toString(), { completed })
        setTasks((prev) => prev.map((t) => (t.id == id ? updatedTask as Task : t)))
        return updatedTask
      }

      const updatedTask = await updateTask(id, { completed }) as Task
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
      return updatedTask
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedTask = localOps.updateTask(id.toString(), { completed })
      setTasks((prev) => prev.map((t) => (t.id == id ? updatedTask as Task : t)))
      setIsDatabaseAvailable(false)
      return updatedTask
    }
  }

  // Feedback operations
  const addFeedback = async (feedbackData: CreateFeedbackInput) => {
    try {
      console.log("Adding feedback:", feedbackData)

      if (!isDatabaseAvailable) {
        const newFeedback = localOps.createFeedback(feedbackData)
        setFeedbacks((prev) => [newFeedback as Feedback, ...prev])
        return newFeedback
      }

      const newFeedback = await createFeedback(feedbackData) as any
      
      // Map database fields to component-expected fields
      const mappedFeedback = {
        ...newFeedback,
        id: newFeedback.id.toString(),
        projectId: newFeedback.project_id?.toString() || "1",
        createdAt: newFeedback.created_at
      } as Feedback
      
      setFeedbacks((prev) => [mappedFeedback, ...prev])
      return mappedFeedback
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newFeedback = localOps.createFeedback(feedbackData)
      setFeedbacks((prev) => [newFeedback as Feedback, ...prev])
      setIsDatabaseAvailable(false)
      return newFeedback
    }
  }

  const editFeedback = async (id: number, feedbackData: UpdateFeedbackInput) => {
    try {
      if (!isDatabaseAvailable) {
        const updatedFeedback = localOps.updateFeedback(id.toString(), feedbackData)
        setFeedbacks((prev) => prev.map((f) => (f.id == id ? updatedFeedback as Feedback : f)))
        return updatedFeedback
      }

      const updatedFeedback = await updateFeedback(id, feedbackData) as any
      
      // Map database fields to component-expected fields
      const mappedFeedback = {
        ...updatedFeedback,
        id: updatedFeedback.id.toString(),
        projectId: updatedFeedback.project_id?.toString() || "1",
        createdAt: updatedFeedback.created_at
      } as Feedback
      
      setFeedbacks((prev) => prev.map((f) => (f.id == id ? mappedFeedback : f)))
      return mappedFeedback
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedFeedback = localOps.updateFeedback(id.toString(), feedbackData)
      setFeedbacks((prev) => prev.map((f) => (f.id == id ? updatedFeedback as Feedback : f)))
      setIsDatabaseAvailable(false)
      return updatedFeedback
    }
  }

  // Template operations
  const addReportTemplate = async (templateData: CreateReportTemplateInput) => {
    try {
      if (!isDatabaseAvailable) {
        const newTemplate = localOps.createReportTemplate(templateData)
        setReportTemplates((prev) => [newTemplate as ReportTemplate, ...prev])
        return newTemplate
      }

      const newTemplate = await createReportTemplate(templateData) as ReportTemplate
      setReportTemplates((prev) => [newTemplate, ...prev])
      return newTemplate
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newTemplate = localOps.createReportTemplate(templateData)
      setReportTemplates((prev) => [newTemplate as ReportTemplate, ...prev])
      setIsDatabaseAvailable(false)
      return newTemplate
    }
  }

  const removeReportTemplate = async (id: number) => {
    try {
      if (!isDatabaseAvailable) {
        localOps.deleteReportTemplate(id.toString())
        setReportTemplates((prev) => prev.filter((t) => t.id != id))
        return
      }

      await deleteReportTemplate(id)
      setReportTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      localOps.deleteReportTemplate(id.toString())
      setReportTemplates((prev) => prev.filter((t) => t.id != id))
      setIsDatabaseAvailable(false)
    }
  }

  const addEmailTemplate = async (templateData: CreateEmailTemplateInput) => {
    try {
      if (!isDatabaseAvailable) {
        const newTemplate = localOps.createEmailTemplate(templateData)
        setEmailTemplates((prev) => [newTemplate as EmailTemplate, ...prev])
        return newTemplate
      }

      const newTemplate = await createEmailTemplate(templateData) as EmailTemplate
      setEmailTemplates((prev) => [newTemplate, ...prev])
      return newTemplate
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newTemplate = localOps.createEmailTemplate(templateData)
      setEmailTemplates((prev) => [newTemplate as EmailTemplate, ...prev])
      setIsDatabaseAvailable(false)
      return newTemplate
    }
  }

  const removeEmailTemplate = async (id: number) => {
    try {
      if (!isDatabaseAvailable) {
        localOps.deleteEmailTemplate(id.toString())
        setEmailTemplates((prev) => prev.filter((t) => t.id != id))
        return
      }

      await deleteEmailTemplate(id)
      setEmailTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      localOps.deleteEmailTemplate(id.toString())
      setEmailTemplates((prev) => prev.filter((t) => t.id != id))
      setIsDatabaseAvailable(false)
    }
  }

  // Settings operations
  const updateUserSettings = async (settingsData: UpdateSettingsInput) => {
    try {
      if (!isDatabaseAvailable) {
        const updatedSettings = { ...settings, ...settingsData }
        localStorage.setItem("settings", JSON.stringify(updatedSettings))
        setSettings(updatedSettings as Settings)
        return updatedSettings
      }

      const updatedSettings = await updateSettings(settingsData) as Settings
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedSettings = { ...settings, ...settingsData }
      localStorage.setItem("settings", JSON.stringify(updatedSettings))
      setSettings(updatedSettings as Settings)
      setIsDatabaseAvailable(false)
      return updatedSettings
    }
  }

  return {
    // Data
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

    // Operations
    loadData,
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
  }
}
