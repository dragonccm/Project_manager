// Report generation utilities for different formats
// Note: In a real application, you would use proper libraries like:
// - jsPDF for PDF generation
// - docx for Word documents
// - xlsx for Excel files

export async function generateWordReport(data: any) {
  // Simulate Word document generation
  const content = generateReportContent(data)

  // Create a simple text file for demonstration
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${data.type}_report_${Date.now()}.txt`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function generateExcelReport(data: any) {
  // Simulate Excel generation with CSV format
  let csvContent = ""

  if (data.type === "project") {
    csvContent = "Project,Domain,Status,Tasks,Completed,Accounts,Feedback\n"
    data.projects.forEach((project: any) => {
      const projectTasks = data.tasks.filter((task: any) => task.projectId === project.id)
      const completedTasks = projectTasks.filter((task: any) => task.completed)
      const projectAccounts = data.accounts.filter((account: any) => account.projectId === project.id)
      const projectFeedbacks = data.feedbacks.filter((feedback: any) => feedback.projectId === project.id)

      csvContent += `"${project.name}","${project.domain}","${project.status}",${projectTasks.length},${completedTasks.length},${projectAccounts.length},${projectFeedbacks.length}\n`
    })
  } else {
    csvContent = "Date,Task,Project,Priority,Status,Time\n"
    data.tasks.forEach((task: any) => {
      const project = data.projects.find((p: any) => p.id === task.projectId)
      csvContent += `${task.date},"${task.title}","${project?.name || "N/A"}","${task.priority}","${task.completed ? "Completed" : "Pending"}",${task.estimatedTime}\n`
    })
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${data.type}_report_${Date.now()}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function generatePDFReport(data: any) {
  // Simulate PDF generation with formatted text
  const content = generateReportContent(data)

  // Create a formatted text file for demonstration
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${data.type}_report_${Date.now()}.pdf.txt`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function generateReportContent(data: any): string {
  const projectName = data.project?.name || "All Projects"
  const dateRange = `${data.dateRange.from} to ${data.dateRange.to}`

  let content = `${data.type.toUpperCase()} REPORT\n`
  content += `${"=".repeat(50)}\n\n`
  content += `Project: ${projectName}\n`
  content += `Date Range: ${dateRange}\n`
  content += `Generated: ${new Date().toLocaleString()}\n\n`

  // Summary
  content += `SUMMARY\n`
  content += `${"=".repeat(20)}\n`
  content += `Total Tasks: ${data.tasks.length}\n`
  content += `Completed Tasks: ${data.tasks.filter((t: any) => t.completed).length}\n`
  content += `Pending Tasks: ${data.tasks.filter((t: any) => !t.completed).length}\n`
  content += `Total Feedback: ${data.feedbacks.length}\n`
  content += `Total Accounts: ${data.accounts.length}\n\n`

  // Tasks
  if (data.tasks.length > 0) {
    content += `TASKS\n`
    content += `${"=".repeat(20)}\n`
    data.tasks.forEach((task: any) => {
      const project = data.projects.find((p: any) => p.id === task.projectId)
      content += `• ${task.title}\n`
      content += `  Project: ${project?.name || "N/A"}\n`
      content += `  Priority: ${task.priority}\n`
      content += `  Status: ${task.completed ? "Completed" : "Pending"}\n`
      content += `  Estimated Time: ${task.estimatedTime} minutes\n`
      content += `  Date: ${task.date}\n\n`
    })
  }

  // Feedback
  if (data.feedbacks.length > 0) {
    content += `FEEDBACK\n`
    content += `${"=".repeat(20)}\n`
    data.feedbacks.forEach((feedback: any) => {
      const project = data.projects.find((p: any) => p.id === feedback.projectId)
      content += `• ${feedback.subject}\n`
      content += `  Project: ${project?.name || "N/A"}\n`
      content += `  Client: ${feedback.clientName}\n`
      content += `  Rating: ${feedback.rating}/5 stars\n`
      content += `  Status: ${feedback.status}\n`
      content += `  Priority: ${feedback.priority}\n`
      content += `  Message: ${feedback.message}\n`
      content += `  Date: ${new Date(feedback.createdAt).toLocaleDateString()}\n\n`
    })
  }

  // Apply template if available
  if (data.template) {
    content = applyTemplate(data.template.content, data)
  }

  return content
}

function applyTemplate(template: string, data: any): string {
  let content = template

  // Replace basic variables
  content = content.replace(/\{\{reportType\}\}/g, data.type)
  content = content.replace(/\{\{projectName\}\}/g, data.project?.name || "All Projects")
  content = content.replace(/\{\{dateFrom\}\}/g, data.dateRange.from)
  content = content.replace(/\{\{dateTo\}\}/g, data.dateRange.to)
  content = content.replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString())
  content = content.replace(/\{\{totalTasks\}\}/g, data.tasks.length.toString())
  content = content.replace(/\{\{completedTasks\}\}/g, data.tasks.filter((t: any) => t.completed).length.toString())
  content = content.replace(/\{\{pendingTasks\}\}/g, data.tasks.filter((t: any) => !t.completed).length.toString())

  // Handle loops (simplified)
  content = content.replace(/\{\{#tasks\}\}(.*?)\{\{\/tasks\}\}/gs, (match, taskTemplate) => {
    return data.tasks
      .map((task: any) => {
        const project = data.projects.find((p: any) => p.id === task.projectId)
        return taskTemplate
          .replace(/\{\{title\}\}/g, task.title)
          .replace(/\{\{priority\}\}/g, task.priority)
          .replace(/\{\{status\}\}/g, task.completed ? "Completed" : "Pending")
          .replace(/\{\{estimatedTime\}\}/g, task.estimatedTime)
          .replace(/\{\{projectName\}\}/g, project?.name || "N/A")
      })
      .join("")
  })

  content = content.replace(/\{\{#feedbacks\}\}(.*?)\{\{\/feedbacks\}\}/gs, (match, feedbackTemplate) => {
    return data.feedbacks
      .map((feedback: any) => {
        const project = data.projects.find((p: any) => p.id === feedback.projectId)
        return feedbackTemplate
          .replace(/\{\{subject\}\}/g, feedback.subject)
          .replace(/\{\{clientName\}\}/g, feedback.clientName)
          .replace(/\{\{rating\}\}/g, feedback.rating)
          .replace(/\{\{status\}\}/g, feedback.status)
          .replace(/\{\{projectName\}\}/g, project?.name || "N/A")
      })
      .join("")
  })

  return content
}
