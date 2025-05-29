import { useState } from 'react'

export interface EmailData {
  type: 'task_created' | 'task_completed' | 'project_update' | 'daily_report' | 'custom'
  data: any
  recipients: string | string[]
}

export interface EmailStatus {
  loading: boolean
  success: boolean
  error: string | null
}

export function useEmail() {
  const [status, setStatus] = useState<EmailStatus>({
    loading: false,
    success: false,
    error: null
  })

  const sendEmail = async (emailData: EmailData) => {
    setStatus({ loading: true, success: false, error: null })

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      setStatus({ loading: false, success: true, error: null })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setStatus({ loading: false, success: false, error: errorMessage })
      throw error
    }
  }

  const testConnection = async () => {
    setStatus({ loading: true, success: false, error: null })

    try {
      const response = await fetch('/api/email', {
        method: 'GET',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test connection')
      }

      setStatus({ 
        loading: false, 
        success: result.connected, 
        error: result.connected ? null : 'Connection failed'
      })
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setStatus({ loading: false, success: false, error: errorMessage })
      throw error
    }
  }

  const sendTaskCreatedEmail = async (
    taskData: {
      taskTitle: string
      taskDescription?: string
      projectName?: string
      priority: 'low' | 'medium' | 'high'
      dueDate: string
      assignedTo?: string
    },
    recipients: string | string[]
  ) => {
    return sendEmail({
      type: 'task_created',
      data: taskData,
      recipients,
    })
  }

  const sendTaskCompletedEmail = async (
    taskData: {
      taskTitle: string
      taskDescription?: string
      projectName?: string
      priority: 'low' | 'medium' | 'high'
      dueDate: string
    },
    recipients: string | string[]
  ) => {
    return sendEmail({
      type: 'task_completed',
      data: taskData,
      recipients,
    })
  }

  const sendProjectUpdateEmail = async (
    projectData: {
      projectName: string
      updateType: 'created' | 'completed' | 'updated' | 'deadline_approaching'
      description?: string
      deadline?: string
      progress?: number
    },
    recipients: string | string[]
  ) => {
    return sendEmail({
      type: 'project_update',
      data: projectData,
      recipients,
    })
  }

  const sendDailyReportEmail = async (
    reportData: {
      tasks: any[]
      projects: any[]
    },
    recipients: string | string[]
  ) => {
    return sendEmail({
      type: 'daily_report',
      data: reportData,
      recipients,
    })
  }

  const sendCustomEmail = async (
    emailData: {
      subject: string
      html?: string
      text?: string
    },
    recipients: string | string[]
  ) => {
    return sendEmail({
      type: 'custom',
      data: emailData,
      recipients,
    })
  }

  return {
    status,
    sendEmail,
    testConnection,
    sendTaskCreatedEmail,
    sendTaskCompletedEmail,
    sendProjectUpdateEmail,
    sendDailyReportEmail,
    sendCustomEmail,
  }
}
