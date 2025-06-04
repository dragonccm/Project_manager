"use client"

import { useState, useEffect } from "react"
import { getLocalDateString, getLocalISOString } from "@/lib/date-utils"
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
  getEmailTemplates,
  createEmailTemplate,
  deleteEmailTemplate,
  getCodeComponents,
  createCodeComponent,
  updateCodeComponent,
  deleteCodeComponent,
  getSettings,
  updateSettings,
  testDatabaseConnection,
  initializeTables,
  // Add report template functions
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  duplicateReportTemplate,
} from "@/lib/database"
import { createLocalStorageOperations } from "@/lib/database-fallback"
import {
  Project,
  Account,
  Task,
  EmailTemplate,
  CodeComponent,
  Settings,
  CreateProjectInput,
  CreateAccountInput,
  CreateTaskInput,
  CreateEmailTemplateInput,
  CreateCodeComponentInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateCodeComponentInput,
  UpdateSettingsInput,
  // Add report template types
  ReportTemplate,
  CreateReportTemplateInput,
  UpdateReportTemplateInput,
} from "@/types/database"

export function useDatabase() {
  const [projects, setProjects] = useState<Project[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [codeComponents, setCodeComponents] = useState<CodeComponent[]>([])
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isDatabaseAvailable, setIsDatabaseAvailable] = useState<boolean>(false)

  const localOps = createLocalStorageOperations()

  const loadFromLocalStorage = () => {
    try {
      const savedProjects = localStorage.getItem("projects")
      const savedAccounts = localStorage.getItem("accounts")
      const savedTasks = localStorage.getItem("tasks")
      const savedEmailTemplates = localStorage.getItem("emailTemplates")
      const savedCodeComponents = localStorage.getItem("codeComponents")
      const savedSettings = localStorage.getItem("settings")

      setProjects(savedProjects ? JSON.parse(savedProjects) : [])
      setAccounts(savedAccounts ? JSON.parse(savedAccounts) : [])
      setTasks(savedTasks ? JSON.parse(savedTasks) : [])
      setEmailTemplates(savedEmailTemplates ? JSON.parse(savedEmailTemplates) : [])
      setCodeComponents(savedCodeComponents ? JSON.parse(savedCodeComponents) : [])
      setSettings(
        savedSettings
          ? JSON.parse(savedSettings)
          : {
              language: "en",
              theme: "light",
              notifications: { email: true, desktop: false, tasks: true },
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
        emailTemplatesData,
        codeComponentsData,
        reportTemplatesData,
        settingsData,
      ] = await Promise.all([
        getProjects(),
        getAccounts(),
        getTasks(),
        getEmailTemplates(),
        getCodeComponents(),
        getReportTemplates(),
        getSettings(),
      ])

      console.log("Database data loaded:", {
        projects: projectsData,
        accounts: accountsData,
        tasks: tasksData,
      })

      // Map database fields to component-expected fields
      const mappedAccounts = accountsData.map((account: any) => ({
        ...account,
        id: account.id.toString(), // Ensure ID is string for components
        projectId: account.project_id?.toString() || "1",
        createdAt: account.created_at
      }))
      
      // Safe date logging - only if tasks exist
      if (tasksData.length > 0) {
        console.log("Database data loaded successfully------------------", getLocalDateString(new Date(tasksData[0].date)))
        console.log("Database data loaded successfully------------------",tasksData[0].date)
      }
      
      const mappedTasks = tasksData.map((task: any) => ({
        ...task,
        id: task.id.toString(), // Ensure ID is string for components
        projectId: task.project_id?.toString() || "1",
        status: task.status || (task.completed ? "done" : "todo"),
        completed: typeof task.completed === "boolean" ? task.completed : !!task.completed,
        estimatedTime: typeof task.estimated_time === "number" ? task.estimated_time : (task.estimatedTime || 60),
        date: task.date ? (typeof task.date === "string" ? getLocalDateString(new Date(task.date)) : getLocalDateString(new Date(task.date))) : "",
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }))

      const mappedProjects = projectsData.map((project: any) => {
        // Find accounts associated with this project
        const projectAccounts = mappedAccounts.filter((account: any) => 
          account.projectId === project.id.toString()
        );
        
        return {
          ...project,
          id: project.id.toString(), // Ensure ID is string for components
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          figmaLink: project.figma_link,
          accounts: projectAccounts // Add accounts array to project
        };
      })

      const mappedCodeComponents = codeComponentsData.map((component: any) => ({
        ...component,
        id: component.id.toString(), // Ensure ID is string for components
        projectId: component.project_id?.toString() || "1",
        createdAt: component.created_at,
        updatedAt: component.updated_at
      }))

      const mappedReportTemplates = reportTemplatesData.map((template: any) => ({
        ...template,
        id: template.id.toString(), // Ensure ID is string for components
        createdAt: template.created_at,
        updatedAt: template.updated_at
      }))

      setProjects(mappedProjects as Project[])
      setAccounts(mappedAccounts as Account[])
      setTasks(mappedTasks as Task[])
      setEmailTemplates(emailTemplatesData as EmailTemplate[])
      setCodeComponents(mappedCodeComponents as CodeComponent[])
      setReportTemplates(mappedReportTemplates as ReportTemplate[])
      setSettings(
        (settingsData as Settings) || {
          language: "en",
          theme: "light",
          notifications: { email: true, desktop: false, tasks: true },
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
      
      // Map database fields to component-expected fields (matching the getTasks mapping)
      const mappedTask = {
        ...newTask,
        id: newTask.id.toString(),
        projectId: newTask.project_id?.toString() || "1",
        status: newTask.status || (newTask.completed ? "done" : "todo"),
        completed: typeof newTask.completed === "boolean" ? newTask.completed : !!newTask.completed,
        estimatedTime: typeof newTask.estimated_time === "number" ? newTask.estimated_time : (newTask.estimatedTime || 60),
        date: newTask.date ? (typeof newTask.date === "string" ? getLocalDateString(new Date(newTask.date)) : getLocalDateString(new Date(newTask.date))) : "",
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
      
      // Map database fields to component-expected fields (matching the getTasks mapping)
      const mappedTask = {
        ...updatedTask,
        id: updatedTask.id.toString(),
        projectId: updatedTask.project_id?.toString() || "1",
        status: updatedTask.status || (updatedTask.completed ? "done" : "todo"),
        completed: typeof updatedTask.completed === "boolean" ? updatedTask.completed : !!updatedTask.completed,
        estimatedTime: typeof updatedTask.estimated_time === "number" ? updatedTask.estimated_time : (updatedTask.estimatedTime || 60),
        date: updatedTask.date ? (typeof updatedTask.date === "string" ? getLocalDateString(new Date(updatedTask.date)) : getLocalDateString(new Date(updatedTask.date))) : "",
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

      const updatedTask = await updateTask(id, { completed }) as any
      
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
      const updatedTask = localOps.updateTask(id.toString(), { completed })
      setTasks((prev) => prev.map((t) => (t.id == id ? updatedTask as Task : t)))
      setIsDatabaseAvailable(false)
      return updatedTask
    }
  }

  // Template operations
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

  // Code Component operations
  const addCodeComponent = async (componentData: CreateCodeComponentInput) => {
    try {
      console.log("Adding code component:", componentData)

      if (!isDatabaseAvailable) {
        console.log("Using localStorage for code component creation")
        const newComponent = {
          id: Date.now(),
          ...componentData,
          created_at: getLocalISOString(),
          updated_at: getLocalISOString(),
        } as CodeComponent
        
        const updatedComponents = [newComponent, ...codeComponents]
        localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
        setCodeComponents(updatedComponents)
        return newComponent
      }

      console.log("Using database for code component creation")
      const newComponent = await createCodeComponent(componentData) as any
      console.log("Code component created in database:", newComponent)
      
      // Map database fields to component-expected fields
      const mappedComponent = {
        ...newComponent,
        id: newComponent.id.toString(),
        projectId: newComponent.project_id?.toString() || "1",
        createdAt: newComponent.created_at,
        updatedAt: newComponent.updated_at
      } as CodeComponent

      setCodeComponents((prev) => [mappedComponent, ...prev])
      return mappedComponent
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const newComponent = {
        id: Date.now(),
        ...componentData,
        created_at: getLocalISOString(),
        updated_at: getLocalISOString(),
      } as CodeComponent
      
      const updatedComponents = [newComponent, ...codeComponents]
      localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
      setCodeComponents(updatedComponents)
      setIsDatabaseAvailable(false)
      return newComponent
    }
  }

  const editCodeComponent = async (id: string, componentData: UpdateCodeComponentInput) => {
    try {
      const componentId = parseInt(id)
      
      if (!isDatabaseAvailable) {
        const updatedComponents = codeComponents.map((comp) =>
          comp.id.toString() === id ? { ...comp, ...componentData, updated_at: getLocalISOString() } : comp
        )
        localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
        setCodeComponents(updatedComponents)
        return updatedComponents.find((comp) => comp.id.toString() === id)
      }

      const updatedComponent = await updateCodeComponent(componentId, componentData) as any
      
      // Map database fields to component-expected fields
      const mappedComponent = {
        ...updatedComponent,
        id: updatedComponent.id.toString(),
        projectId: updatedComponent.project_id?.toString() || "1",
        createdAt: updatedComponent.created_at,
        updatedAt: updatedComponent.updated_at
      } as CodeComponent

      setCodeComponents((prev) => prev.map((comp) => (comp.id.toString() === id ? mappedComponent : comp)))
      return mappedComponent
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedComponents = codeComponents.map((comp) =>
        comp.id.toString() === id ? { ...comp, ...componentData, updated_at: getLocalISOString() } : comp
      )
      localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
      setCodeComponents(updatedComponents)
      setIsDatabaseAvailable(false)
      return updatedComponents.find((comp) => comp.id.toString() === id)
    }
  }

  const removeCodeComponent = async (id: string) => {
    try {
      const componentId = parseInt(id)
      
      if (!isDatabaseAvailable) {
        const updatedComponents = codeComponents.filter((comp) => comp.id.toString() !== id)
        localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
        setCodeComponents(updatedComponents)
        return
      }

      await deleteCodeComponent(componentId)
      setCodeComponents((prev) => prev.filter((comp) => comp.id.toString() !== id))
    } catch (err) {
      console.error("Database error, using localStorage:", err)
      const updatedComponents = codeComponents.filter((comp) => comp.id.toString() !== id)
      localStorage.setItem("codeComponents", JSON.stringify(updatedComponents))
      setCodeComponents(updatedComponents)
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

  // Report Templates
  const addReportTemplate = async (templateData: CreateReportTemplateInput) => {
    try {
      if (isDatabaseAvailable) {
        const newTemplate = await createReportTemplate(templateData)
        const mappedTemplate: ReportTemplate = {
          id: newTemplate.id,
          name: newTemplate.name,
          description: newTemplate.description,
          template_data: newTemplate.template_data,
          category: newTemplate.category,
          is_default: newTemplate.is_default,
          created_by: newTemplate.created_by,
          created_at: newTemplate.created_at,
          updated_at: newTemplate.updated_at
        }
        setReportTemplates([...reportTemplates, mappedTemplate])
        return mappedTemplate
      } else {
        const newTemplate: ReportTemplate = {
          id: Date.now(),
          name: templateData.name,
          description: templateData.description || "",
          template_data: templateData.template_data,
          category: templateData.category || "custom",
          is_default: templateData.is_default || false,
          created_by: templateData.created_by || "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const updatedTemplates = [...reportTemplates, newTemplate]
        localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))
        setReportTemplates(updatedTemplates)
        return newTemplate
      }
    } catch (error: any) {
      console.error("Error adding report template:", error)
      throw error
    }
  }

  const editReportTemplate = async (id: number, templateData: UpdateReportTemplateInput) => {
    try {
      if (isDatabaseAvailable) {
        const updatedTemplate = await updateReportTemplate(id, templateData)
        const mappedTemplate: ReportTemplate = {
          id: updatedTemplate.id,
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          template_data: updatedTemplate.template_data,
          category: updatedTemplate.category,
          is_default: updatedTemplate.is_default,
          created_by: updatedTemplate.created_by,
          created_at: updatedTemplate.created_at,
          updated_at: updatedTemplate.updated_at
        }
        setReportTemplates(reportTemplates.map((t) => (t.id === id ? mappedTemplate : t)))
        return mappedTemplate
      } else {
        const updatedTemplates = reportTemplates.map((template) =>
          template.id === id
            ? { 
                ...template, 
                ...templateData, 
                updated_at: new Date().toISOString() 
              }
            : template
        )
        localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))
        setReportTemplates(updatedTemplates)
        return updatedTemplates.find((t) => t.id === id)
      }
    } catch (error: any) {
      console.error("Error editing report template:", error)
      throw error
    }
  }

  const removeReportTemplate = async (id: number) => {
    try {
      if (isDatabaseAvailable) {
        await deleteReportTemplate(id)
        setReportTemplates(reportTemplates.filter((template) => template.id !== id))
      } else {
        const updatedTemplates = reportTemplates.filter((template) => template.id !== id)
        localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))
        setReportTemplates(updatedTemplates)
      }
    } catch (error: any) {
      console.error("Error removing report template:", error)
      throw error
    }
  }

  const duplicateReportTemplateFunc = async (id: number, newName: string): Promise<ReportTemplate> => {
    try {
      if (isDatabaseAvailable) {
        const duplicatedTemplate = await duplicateReportTemplate(id, newName)
        const mappedTemplate: ReportTemplate = {
          id: duplicatedTemplate.id,
          name: duplicatedTemplate.name,
          description: duplicatedTemplate.description,
          template_data: duplicatedTemplate.template_data,
          category: duplicatedTemplate.category,
          is_default: duplicatedTemplate.is_default,
          created_by: duplicatedTemplate.created_by,
          created_at: duplicatedTemplate.created_at,
          updated_at: duplicatedTemplate.updated_at
        }
        setReportTemplates([...reportTemplates, mappedTemplate])
        return mappedTemplate
      } else {
        const originalTemplate = reportTemplates.find((t) => t.id === id)
        if (!originalTemplate) {
          throw new Error("Template not found")
        }
        
        const newTemplate: ReportTemplate = {
          ...originalTemplate,
          id: Date.now(),
          name: newName,
          description: (originalTemplate.description || "") + " (Copy)",
          category: "custom",
          is_default: false,
          created_by: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        const updatedTemplates = [...reportTemplates, newTemplate]
        localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))
        setReportTemplates(updatedTemplates)
        return newTemplate
      }
    } catch (error: any) {
      console.error("Error duplicating report template:", error)
      throw error
    }
  }

  return {
    // Data
    projects,
    accounts,
    tasks,
    emailTemplates,
    codeComponents,
    reportTemplates,
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
    addEmailTemplate,
    removeEmailTemplate,
    addCodeComponent,
    editCodeComponent,
    removeCodeComponent,
    updateUserSettings,
    addReportTemplate,
    editReportTemplate,
    removeReportTemplate,
    duplicateReportTemplate,
  }
}
