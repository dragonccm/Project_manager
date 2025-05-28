"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Calendar, BarChart, Save, Eye, Trash2, FileSpreadsheet, FileImage } from 'lucide-react'
import { useLanguage } from "@/hooks/use-language"
import { generateWordReport, generateExcelReport, generatePDFReport } from "@/lib/report-generators"

interface ReportGeneratorProps {
  projects: any[]
}

interface Template {
  id: string
  name: string
  type: 'word' | 'excel' | 'pdf'
  content: string
  createdAt: string
}

export function ReportGenerator({ projects }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState("daily")
  const [selectedProject, setSelectedProject] = useState("all")
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  })
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templateEditor, setTemplateEditor] = useState({
    name: "",
    type: "word" as const,
    content: "",
  })
  const [activeTab, setActiveTab] = useState("generate")
  const { t } = useLanguage()

  useEffect(() => {
    const savedTemplates = localStorage.getItem("reportTemplates")
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    }
  }, [])

  const generateReport = async (format: 'csv' | 'word' | 'excel' | 'pdf') => {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]")
    const accounts = JSON.parse(localStorage.getItem("accounts") || "[]")

    const reportData = {
      type: reportType,
      project: selectedProject !== "all" ? projects.find((p) => p.id === selectedProject) : null,
      dateRange,
      tasks: tasks.filter((task: any) => {
        const taskDate = task.date
        return (
          taskDate >= dateRange.from &&
          taskDate <= dateRange.to &&
          (selectedProject === "all" || task.projectId == selectedProject)
        )
      }),
      feedbacks: feedbacks.filter((feedback: any) => {
        const feedbackDate = feedback.createdAt.split("T")[0]
        return (
          feedbackDate >= dateRange.from &&
          feedbackDate <= dateRange.to &&
          (selectedProject === "all" || feedback.projectId == selectedProject)
        )
      }),
      accounts:
        selectedProject !== "all" ? accounts.filter((account: any) => account.projectId == selectedProject) : accounts,
      projects,
      template: selectedTemplate
    }

    try {
      switch (format) {
        case 'csv':
          generateCSVReport(reportData)
          break
        case 'word':
          await generateWordReport(reportData)
          break
        case 'excel':
          await generateExcelReport(reportData)
          break
        case 'pdf':
          await generatePDFReport(reportData)
          break
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    }
  }

  const generateCSVReport = (data: any) => {
    let csvContent = ""

    if (reportType === "daily" || reportType === "weekly") {
      csvContent = generateTaskReport(data)
    } else if (reportType === "project") {
      csvContent = generateProjectReport(data)
    } else if (reportType === "feedback") {
      csvContent = generateFeedbackReport(data)
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateTaskReport = (data: any) => {
    let csv = "Date,Task,Project,Priority,Status,Estimated Time,Actual Time\n"
    data.tasks.forEach((task: any) => {
      const project = projects.find((p) => p.id == task.projectId)
      csv += `${task.date},"${task.title}","${project?.name || "N/A"}",${task.priority},${task.completed ? "Completed" : "Pending"},${task.estimatedTime},${task.actualTime || "N/A"}\n`
    })
    return csv
  }

  const generateProjectReport = (data: any) => {
    let csv = "Project,Domain,Figma,Status,Total Tasks,Completed Tasks,Total Accounts,Total Feedback\n"
    projects.forEach((project: any) => {
      const projectTasks = data.tasks.filter((task: any) => task.projectId == project.id)
      const completedTasks = projectTasks.filter((task: any) => task.completed)
      const projectAccounts = data.accounts.filter((account: any) => account.projectId == project.id)
      const projectFeedbacks = data.feedbacks.filter((feedback: any) => feedback.projectId == project.id)
      csv += `"${project.name}","${project.domain}","${project.figmaLink}",${project.status},${projectTasks.length},${completedTasks.length},${projectAccounts.length},${projectFeedbacks.length}\n`
    })
    return csv
  }

  const generateFeedbackReport = (data: any) => {
    let csv = "Date,Project,Client,Subject,Rating,Priority,Status,Message\n"
    data.feedbacks.forEach((feedback: any) => {
      const project = projects.find((p) => p.id == feedback.projectId)
      const date = new Date(feedback.createdAt).toLocaleDateString()
      csv += `${date},"${project?.name || "N/A"}","${feedback.clientName}","${feedback.subject}",${feedback.rating},${feedback.priority},${feedback.status},"${feedback.message.replace(/"/g, '""')}"\n`
    })
    return csv
  }

  const saveTemplate = () => {
    if (!templateEditor.name || !templateEditor.content) {
      alert("Please fill in template name and content")
      return
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      ...templateEditor,
      createdAt: new Date().toISOString(),
    }

    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))

    setTemplateEditor({ name: "", type: "word", content: "" })
    alert("Template saved successfully!")
  }

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId)
    setTemplates(updatedTemplates)
    localStorage.setItem("reportTemplates", JSON.stringify(updatedTemplates))
  }

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setTemplateEditor({
      name: template.name,
      type: template.type,
      content: template.content
    })
  }

  const getDefaultTemplate = (type: string) => {
    const templates = {
      word: `# {{reportType}} Report

**Project:** {{projectName}}
**Date Range:** {{dateFrom}} to {{dateTo}}
**Generated:** {{currentDate}}

## Summary
- Total Tasks: {{totalTasks}}
- Completed Tasks: {{completedTasks}}
- Pending Tasks: {{pendingTasks}}

## Task Details
{{#tasks}}
- **{{title}}** ({{priority}}) - {{status}}
  Project: {{projectName}}
  Estimated Time: {{estimatedTime}} minutes
{{/tasks}}

## Feedback Summary
{{#feedbacks}}
- **{{subject}}** - Rating: {{rating}}/5
  Client: {{clientName}}
  Status: {{status}}
{{/feedbacks}}`,
      
      excel: `Sheet1:
A1: Task Title | B1: Project | C1: Priority | D1: Status | E1: Estimated Time
{{#tasks}}
A{{row}}: {{title}} | B{{row}}: {{projectName}} | C{{row}}: {{priority}} | D{{row}}: {{status}} | E{{row}}: {{estimatedTime}}
{{/tasks}}

Sheet2:
A1: Feedback Subject | B1: Client | C1: Rating | D1: Status
{{#feedbacks}}
A{{row}}: {{subject}} | B{{row}}: {{clientName}} | C{{row}}: {{rating}} | D{{row}}: {{status}}
{{/feedbacks}}`,
      
      pdf: `{{reportType}} Report

Project: {{projectName}}
Date: {{dateFrom}} - {{dateTo}}

TASKS SUMMARY
=============
Total: {{totalTasks}}
Completed: {{completedTasks}}
Pending: {{pendingTasks}}

TASK DETAILS
============
{{#tasks}}
• {{title}} ({{priority}})
  Project: {{projectName}}
  Status: {{status}}
  Time: {{estimatedTime}}min

{{/tasks}}

FEEDBACK SUMMARY
===============
{{#feedbacks}}
• {{subject}} - {{rating}}/5 stars
  Client: {{clientName}}
  Status: {{status}}

{{/feedbacks}}`
    }
    return templates[type as keyof typeof templates] || ""
  }

  const reportTemplates = [
    {
      id: "daily",
      name: t("dailyReport"),
      description: t("dailyReportDesc"),
      icon: Calendar,
    },
    {
      id: "weekly",
      name: t("weeklyReport"),
      description: t("weeklyReportDesc"),
      icon: Calendar,
    },
    {
      id: "project",
      name: t("projectReport"),
      description: t("projectReportDesc"),
      icon: FileText,
    },
    {
      id: "feedback",
      name: t("feedbackReport"),
      description: t("feedbackReportDesc"),
      icon: BarChart,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("reportGenerator")}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">{t("generateReport")}</TabsTrigger>
          <TabsTrigger value="templates">{t("manageTemplates")}</TabsTrigger>
          <TabsTrigger value="designer">{t("templateDesigner")}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>{t("reportConfiguration")}</CardTitle>
                <CardDescription>{t("configureReportSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("reportType")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {reportTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant={reportType === template.id ? "default" : "outline"}
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => setReportType(template.id)}
                      >
                        <template.icon className="h-5 w-5" />
                        <div className="text-center">
                          <div className="font-medium text-sm">{template.name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">{t("project")} ({t("optional")})</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("allProjects")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allProjects")}</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">{t("fromDate")}</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">{t("toDate")}</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{t("selectedTemplate")}: {selectedTemplate.name}</p>
                    <Badge variant="outline">{selectedTemplate.type.toUpperCase()}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>{t("exportOptions")}</CardTitle>
                <CardDescription>{t("chooseExportFormat")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => generateReport('csv')} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileSpreadsheet className="h-6 w-6" />
                    <span className="text-sm font-medium">CSV</span>
                    <span className="text-xs text-muted-foreground">{t("basicData")}</span>
                  </Button>

                  <Button 
                    onClick={() => generateReport('excel')} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Excel</span>
                    <span className="text-xs text-muted-foreground">{t("advancedSpreadsheet")}</span>
                  </Button>

                  <Button 
                    onClick={() => generateReport('word')} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Word</span>
                    <span className="text-xs text-muted-foreground">{t("documentReport")}</span>
                  </Button>

                  <Button 
                    onClick={() => generateReport('pdf')} 
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <FileImage className="h-6 w-6 text-red-600" />
                    <span className="text-sm font-medium">PDF</span>
                    <span className="text-xs text-muted-foreground">{t("printableReport")}</span>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">{t("quickGenerate")}</h4>
                  <div className="space-y-2">
                    <Button onClick={() => generateReport('pdf')} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t("generatePDFReport")}
                    </Button>
                    <Button onClick={() => generateReport('excel')} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {t("generateExcelReport")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("savedTemplates")}</CardTitle>
              <CardDescription>{t("manageYourReportTemplates")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge variant="outline">{template.type.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">
                        {t("created")}: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => loadTemplate(template)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          {t("use")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setTemplateEditor({
                              name: template.name,
                              type: template.type,
                              content: template.content
                            })
                            setActiveTab("designer")
                          }}
                        >
                          {t("edit")}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {templates.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {t("noTemplatesYet")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Designer */}
            <Card>
              <CardHeader>
                <CardTitle>{t("templateDesigner")}</CardTitle>
                <CardDescription>{t("createCustomReportTemplate")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">{t("templateName")}</Label>
                  <Input
                    id="templateName"
                    value={templateEditor.name}
                    onChange={(e) => setTemplateEditor({ ...templateEditor, name: e.target.value })}
                    placeholder={t("enterTemplateName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">{t("templateType")}</Label>
                  <Select 
                    value={templateEditor.type} 
                    onValueChange={(value: any) => setTemplateEditor({ ...templateEditor, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">Word Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateContent">{t("templateContent")}</Label>
                  <Textarea
                    id="templateContent"
                    value={templateEditor.content}
                    onChange={(e) => setTemplateEditor({ ...templateEditor, content: e.target.value })}
                    placeholder={getDefaultTemplate(templateEditor.type)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveTemplate} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {t("saveTemplate")}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setTemplateEditor({ 
                      ...templateEditor, 
                      content: getDefaultTemplate(templateEditor.type) 
                    })}
                  >
                    {t("loadDefault")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Variables */}
            <Card>
              <CardHeader>
                <CardTitle>{t("availableVariables")}</CardTitle>
                <CardDescription>{t("useTheseVariablesInTemplate")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t("basicVariables")}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <code>{"{{reportType}}"}</code>
                        <span className="text-muted-foreground">{t("reportType")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{currentDate}}"}</code>
                        <span className="text-muted-foreground">{t("currentDate")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{dateFrom}}"}</code>
                        <span className="text-muted-foreground">{t("fromDate")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{dateTo}}"}</code>
                        <span className="text-muted-foreground">{t("toDate")}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("projectVariables")}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <code>{"{{projectName}}"}</code>
                        <span className="text-muted-foreground">{t("projectName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{projectDomain}}"}</code>
                        <span className="text-muted-foreground">{t("projectDomain")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{totalTasks}}"}</code>
                        <span className="text-muted-foreground">{t("totalTasks")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{completedTasks}}"}</code>
                        <span className="text-muted-foreground">{t("completedTasks")}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("loopVariables")}</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <code>{"{{#tasks}} ... {{/tasks}}"}</code>
                        <p className="text-muted-foreground text-xs">{t("loopThroughTasks")}</p>
                      </div>
                      <div>
                        <code>{"{{#feedbacks}} ... {{/feedbacks}}"}</code>
                        <p className="text-muted-foreground text-xs">{t("loopThroughFeedbacks")}</p>
                      </div>
                      <div>
                        <code>{"{{#projects}} ... {{/projects}}"}</code>
                        <p className="text-muted-foreground text-xs">{t("loopThroughProjects")}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("taskVariables")}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• title, description, priority</div>
                      <div>• status, estimatedTime, actualTime</div>
                      <div>• projectName, date</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("feedbackVariables")}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• subject, message, rating</div>
                      <div>• clientName, clientEmail</div>
                      <div>• status, priority, createdAt</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
