"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Project,
  Account,
  Task,
  EmailTemplate,
  Settings,
  CreateProjectInput,
  CreateAccountInput,
  CreateTaskInput,
  CreateEmailTemplateInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdateSettingsInput,
  ReportTemplate,
  CreateReportTemplateInput,
  UpdateReportTemplateInput,
} from "@/types/database"
import { API_ENDPOINTS } from "@/lib/constants"

// Helper function to make authenticated API calls
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  // Get token from localStorage if available
  let token = null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token') // Use 'auth_token' to match useAuth hook
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for authentication (fallback)
    headers
  })
}

// Helper function to safely parse JSON responses
const safeJsonParse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const text = await response.text()
  if (!text) {
    return null // Return null for empty responses
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON parse error:', error, 'Response text:', text)
    throw new Error('Invalid JSON response')
  }
}

export function useApi() {
  const [projects, setProjects] = useState<Project[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true)

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Test API connection using health endpoint
      try {
        const healthResponse = await fetch(API_ENDPOINTS.HEALTH)
        const healthData = await safeJsonParse(healthResponse)
        
        if (!healthData.success) {
          throw new Error('API health check failed')
        }
        
        console.log("API health check passed")
      } catch (err) {
        console.warn("API health check failed:", err)
        // Continue anyway, might be network issues
      }

      console.log("Loading data from API...")

      // Load from API endpoints with error handling for each
      const [
        projectsResponse,
        accountsResponse,
        tasksResponse,
        emailTemplatesResponse,
        reportTemplatesResponse,
        settingsResponse,
      ] = await Promise.allSettled([
        authenticatedFetch(API_ENDPOINTS.PROJECTS),
        authenticatedFetch(API_ENDPOINTS.ACCOUNTS),
        authenticatedFetch(API_ENDPOINTS.TASKS),
        authenticatedFetch(API_ENDPOINTS.EMAIL),
        authenticatedFetch(API_ENDPOINTS.REPORT_TEMPLATES),
        authenticatedFetch(API_ENDPOINTS.SETTINGS),
      ])

      // Process responses and handle authentication errors gracefully
      const projectsData = projectsResponse.status === 'fulfilled' 
        ? (await safeJsonParse(projectsResponse.value)) || []
        : []
      const accountsData = accountsResponse.status === 'fulfilled'
        ? (await safeJsonParse(accountsResponse.value)) || []
        : []
      const tasksData = tasksResponse.status === 'fulfilled'
        ? (await safeJsonParse(tasksResponse.value)) || []
        : []
      const emailTemplatesData = emailTemplatesResponse.status === 'fulfilled'
        ? (await safeJsonParse(emailTemplatesResponse.value)) || []
        : []
      const reportTemplatesData = reportTemplatesResponse.status === 'fulfilled'
        ? (await safeJsonParse(reportTemplatesResponse.value)) || { data: [] }
        : { data: [] }
      const settingsData = settingsResponse.status === 'fulfilled'
        ? await safeJsonParse(settingsResponse.value)
        : null

      console.log("API data loaded successfully")

      // Ensure all data is arrays before setting state
      setProjects(Array.isArray(projectsData) ? projectsData : [])
      setAccounts(Array.isArray(accountsData) ? accountsData : [])
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setEmailTemplates(Array.isArray(emailTemplatesData) ? emailTemplatesData : [])
      // Handle report templates response format
      setReportTemplates(Array.isArray(reportTemplatesData?.data) ? reportTemplatesData.data : [])
      setSettings(settingsData)
    } catch (err) {
      console.error("API error:", err)
      // Don't set error for authentication failures, just log them
      if (err instanceof Error && !err.message.includes('401')) {
        setError(err)
        setIsApiAvailable(false)
      } else {
        console.log("Authentication required - continuing with empty data")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Project operations
  const addProject = async (projectData: CreateProjectInput) => {
    try {
      console.log("Adding project via API:", projectData)
      const response = await authenticatedFetch(API_ENDPOINTS.PROJECTS, {
        method: 'POST',
        body: JSON.stringify(projectData)
      })
      const newProject = await safeJsonParse(response)
      setProjects((prev) => Array.isArray(prev) ? [newProject, ...prev] : [newProject])
      return newProject
    } catch (err) {
      console.error("Error adding project:", err)
      throw err
    }
  }

  const editProject = async (id: string, projectData: UpdateProjectInput) => {
    try {
      console.log("Editing project via API:", id, projectData)
      const response = await authenticatedFetch(`/api/projects?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
      })
      const updatedProject = await safeJsonParse(response)
      setProjects((prev) => Array.isArray(prev) ? prev.map((p) => (p.id === id ? updatedProject : p)) : [updatedProject])
      return updatedProject
    } catch (err) {
      console.error("Error editing project:", err)
      throw err
    }
  }

  const removeProject = async (id: string) => {
    try {
      console.log("Deleting project via API:", id)
      await authenticatedFetch(`/api/projects?id=${id}`, { method: 'DELETE' })
      setProjects((prev) => Array.isArray(prev) ? prev.filter((p) => p.id !== id) : [])
    } catch (err) {
      console.error("Error deleting project:", err)
      throw err
    }
  }

  // Account operations
  const addAccount = async (accountData: CreateAccountInput) => {
    try {
      console.log("Adding account via API:", accountData)
      const response = await authenticatedFetch(API_ENDPOINTS.ACCOUNTS, {
        method: 'POST',
        body: JSON.stringify(accountData)
      })
      const newAccount = await safeJsonParse(response)
      setAccounts((prev) => Array.isArray(prev) ? [newAccount, ...prev] : [newAccount])
      return newAccount
    } catch (err) {
      console.error("Error adding account:", err)
      throw err
    }
  }

  const removeAccount = async (id: string) => {
    try {
      console.log("Deleting account via API:", id)
      await authenticatedFetch(`/api/accounts?id=${id}`, { method: 'DELETE' })
      setAccounts((prev) => Array.isArray(prev) ? prev.filter((a) => a.id !== id) : [])
    } catch (err) {
      console.error("Error deleting account:", err)
      throw err
    }
  }

  // Task operations
  const addTask = async (taskData: CreateTaskInput) => {
    try {
      console.log("Adding task via API:", taskData)
      const response = await authenticatedFetch(API_ENDPOINTS.TASKS, {
        method: 'POST',
        body: JSON.stringify(taskData)
      })
      const newTask = await safeJsonParse(response)
      setTasks((prev) => Array.isArray(prev) ? [newTask, ...prev] : [newTask])
      return newTask
    } catch (err) {
      console.error("Error adding task:", err)
      throw err
    }
  }

  const editTask = async (id: string, taskData: Partial<CreateTaskInput>) => {
    try {
      console.log("Editing task via API:", id, taskData)
      const response = await authenticatedFetch(`/api/tasks?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      })
      const updatedTask = await safeJsonParse(response)
      setTasks((prev) => Array.isArray(prev) ? prev.map((t) => (t.id === id ? updatedTask : t)) : [updatedTask])
      return updatedTask
    } catch (err) {
      console.error("Error editing task:", err)
      throw err
    }
  }

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      console.log("Toggling task via API:", id, completed)
      const response = await authenticatedFetch(`/api/tasks?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed })
      })
      const updatedTask = await safeJsonParse(response)
      setTasks((prev) => Array.isArray(prev) ? prev.map((t) => (t.id === id ? updatedTask : t)) : [updatedTask])
      return updatedTask
    } catch (err) {
      console.error("Error toggling task:", err)
      throw err
    }
  }

  const removeTask = async (id: string) => {
    try {
      console.log("Deleting task via API:", id)
      await authenticatedFetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      setTasks((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : [])
    } catch (err) {
      console.error("Error deleting task:", err)
      throw err
    }
  }

  // Email template operations
  const addEmailTemplate = async (templateData: CreateEmailTemplateInput) => {
    try {
      console.log("Adding email template via API:", templateData)
      const response = await authenticatedFetch(API_ENDPOINTS.EMAIL, {
        method: 'POST',
        body: JSON.stringify(templateData)
      })
      const newTemplate = await safeJsonParse(response)
      setEmailTemplates((prev) => Array.isArray(prev) ? [newTemplate, ...prev] : [newTemplate])
      return newTemplate
    } catch (err) {
      console.error("Error adding email template:", err)
      throw err
    }
  }

  const removeEmailTemplate = async (id: string) => {
    try {
      console.log("Deleting email template via API:", id)
      await authenticatedFetch(`/api/email/${id}`, { method: 'DELETE' })
      setEmailTemplates((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : [])
    } catch (err) {
      console.error("Error deleting email template:", err)
      throw err
    }
  }

  // Report template operations
  const addReportTemplate = async (templateData: CreateReportTemplateInput) => {
    try {
      console.log("Adding report template via API:", templateData)
      const response = await authenticatedFetch(API_ENDPOINTS.REPORT_TEMPLATES, {
        method: 'POST',
        body: JSON.stringify(templateData)
      })
      const newTemplate = await safeJsonParse(response)
      setReportTemplates((prev) => Array.isArray(prev) ? [newTemplate, ...prev] : [newTemplate])
      return newTemplate
    } catch (err) {
      console.error("Error adding report template:", err)
      throw err
    }
  }

  const editReportTemplate = async (id: string, templateData: UpdateReportTemplateInput) => {
    try {
      console.log("Editing report template via API:", id, templateData)
      const response = await authenticatedFetch(`/api/report-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData)
      })
      const updatedTemplate = await safeJsonParse(response)
      setReportTemplates((prev) => Array.isArray(prev) ? prev.map((t) => (t.id === id ? updatedTemplate : t)) : [updatedTemplate])
      return updatedTemplate
    } catch (err) {
      console.error("Error editing report template:", err)
      throw err
    }
  }

  const removeReportTemplate = async (id: string) => {
    try {
      console.log("Deleting report template via API:", id)
      await authenticatedFetch(`/api/report-templates/${id}`, { method: 'DELETE' })
      setReportTemplates((prev) => Array.isArray(prev) ? prev.filter((t) => t.id !== id) : [])
    } catch (err) {
      console.error("Error deleting report template:", err)
      throw err
    }
  }

  const duplicateReportTemplate = async (id: string, newName: string) => {
    try {
      console.log("Duplicating report template via API:", id, newName)
      const response = await authenticatedFetch(`/api/report-templates/${id}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ newName })
      })
      const duplicatedTemplate = await safeJsonParse(response)
      setReportTemplates((prev) => Array.isArray(prev) ? [duplicatedTemplate, ...prev] : [duplicatedTemplate])
      return duplicatedTemplate
    } catch (err) {
      console.error("Error duplicating report template:", err)
      throw err
    }
  }

  // Settings operations
  const updateUserSettings = async (settingsData: UpdateSettingsInput) => {
    try {
      console.log("Updating settings via API:", settingsData)
      const response = await fetch(API_ENDPOINTS.SETTINGS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      })
      const updatedSettings = await safeJsonParse(response)
      setSettings(updatedSettings)
      return updatedSettings
    } catch (err) {
      console.error("Error updating settings:", err)
      throw err
    }
  }

  return {
    projects,
    accounts,
    tasks,
    emailTemplates,
    reportTemplates,
    settings,
    loading,
    error,
    isApiAvailable,
    loadData,
    // Project operations
    addProject,
    editProject,
    removeProject,
    // Account operations
    addAccount,
    removeAccount,
    // Task operations
    addTask,
    editTask,
    toggleTask,
    removeTask,
    // Email template operations
    addEmailTemplate,
    removeEmailTemplate,
    // Report template operations
    addReportTemplate,
    editReportTemplate,
    removeReportTemplate,
    duplicateReportTemplate,
    // Settings operations
    updateUserSettings,
  }
}