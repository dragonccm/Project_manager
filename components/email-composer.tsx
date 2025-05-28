"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, Users, Save, Eye, Trash2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface EmailComposerProps {
  projects: any[]
}

interface EmailTemplate {
  id: string
  name: string
  type: "account" | "report" | "general"
  subject: string
  content: string
  createdAt: string
}

export function EmailComposer({ projects }: EmailComposerProps) {
  const [accounts, setAccounts] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [emailData, setEmailData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    content: "",
    attachReport: false,
    reportType: "daily",
  })
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templateEditor, setTemplateEditor] = useState({
    name: "",
    type: "general" as const,
    subject: "",
    content: "",
  })
  const [selectedProject, setSelectedProject] = useState("all")
  const [activeTab, setActiveTab] = useState("compose")
  const { t } = useLanguage()

  const useTemplate = (template: EmailTemplate) => {
    setEmailData({
      ...emailData,
      subject: template.subject,
      content: template.content,
    })
    setActiveTab("compose")
  }

  useEffect(() => {
    const savedAccounts = localStorage.getItem("accounts")
    const savedTemplates = localStorage.getItem("emailTemplates")

    if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates))
  }, [])

  const filteredAccounts = accounts.filter(
    (account: any) => selectedProject === "all" || account.projectId == selectedProject,
  )

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId],
    )
  }

  const generateAccountsContent = () => {
    const selectedAccountsData = accounts.filter((account: any) => selectedAccounts.includes(account.id))

    let content = "Account Information:\n\n"
    selectedAccountsData.forEach((account: any) => {
      const project = projects.find((p) => p.id == account.projectId)
      content += `Project: ${project?.name || "Unknown"}\n`
      content += `Website: ${account.website}\n`
      content += `Username: ${account.username}\n`
      content += `Password: ${account.password}\n`
      if (account.email) content += `Email: ${account.email}\n`
      if (account.notes) content += `Notes: ${account.notes}\n`
      content += "\n---\n\n"
    })

    return content
  }

  const sendEmail = () => {
    // In a real application, this would integrate with an email service
    const emailContent = emailData.content + (selectedAccounts.length > 0 ? "\n\n" + generateAccountsContent() : "")

    const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailContent)}`

    if (emailData.cc) {
      const url = new URL(mailtoLink)
      url.searchParams.set("cc", emailData.cc)
    }

    window.open(mailtoLink)

    // Clear form
    setEmailData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      content: "",
      attachReport: false,
      reportType: "daily",
    })
    setSelectedAccounts([])
  }

  const saveTemplate = () => {
    if (!templateEditor.name || !templateEditor.subject || !templateEditor.content) {
      alert("Please fill in all template fields")
      return
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      ...templateEditor,
      createdAt: new Date().toISOString(),
    }

    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates))

    setTemplateEditor({ name: "", type: "general", subject: "", content: "" })
    alert("Template saved successfully!")
  }

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId)
    setTemplates(updatedTemplates)
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates))
  }

  const getDefaultTemplate = (type: string) => {
    const templates = {
      account: {
        subject: "Account Credentials for {{projectName}}",
        content: `Dear {{clientName}},

Here are your account credentials for {{projectName}}:

{{#accounts}}
Website: {{website}}
Username: {{username}}
Password: {{password}}
{{#email}}Email: {{email}}{{/email}}
{{#notes}}Notes: {{notes}}{{/notes}}

{{/accounts}}

Please keep this information secure and let us know if you have any questions.

Best regards,
{{yourName}}`,
      },
      report: {
        subject: "{{reportType}} Report - {{projectName}}",
        content: `Dear {{clientName}},

Please find attached the {{reportType}} report for {{projectName}}.

Summary:
- Total Tasks: {{totalTasks}}
- Completed: {{completedTasks}}
- Progress: {{progress}}%
- Status: {{projectStatus}}

Recent Tasks:
{{#recentTasks}}
- {{title}} ({{status}})
{{/recentTasks}}

Next Steps:
{{nextSteps}}

Best regards,
{{yourName}}`,
      },
      general: {
        subject: "Update on {{projectName}}",
        content: `Dear {{clientName}},

I hope this email finds you well.

{{emailContent}}

Please let me know if you have any questions or need any clarification.

Best regards,
{{yourName}}`,
      },
    }
    return templates[type as keyof typeof templates] || templates.general
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("emailComposer")}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">{t("composeEmail")}</TabsTrigger>
          <TabsTrigger value="templates">{t("emailTemplates")}</TabsTrigger>
          <TabsTrigger value="designer">{t("emailTemplateDesigner")}</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email Composer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t("composeEmail")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="to">{t("to")}</Label>
                      <Input
                        id="to"
                        type="email"
                        value={emailData.to}
                        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                        placeholder="client@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cc">{t("cc")}</Label>
                      <Input
                        id="cc"
                        type="email"
                        value={emailData.cc}
                        onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
                        placeholder="manager@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("subject")}</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder={t("enterEmailSubject")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">{t("emailContent")}</Label>
                    <Textarea
                      id="content"
                      value={emailData.content}
                      onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                      placeholder={t("enterEmailContent")}
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attachReport"
                      checked={emailData.attachReport}
                      onCheckedChange={(checked) => setEmailData({ ...emailData, attachReport: !!checked })}
                    />
                    <Label htmlFor="attachReport">{t("attachReport")}</Label>
                  </div>

                  {emailData.attachReport && (
                    <div className="space-y-2">
                      <Label>{t("reportType")}</Label>
                      <Select
                        value={emailData.reportType}
                        onValueChange={(value) => setEmailData({ ...emailData, reportType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("dailyReport")}</SelectItem>
                          <SelectItem value="weekly">{t("weeklyReport")}</SelectItem>
                          <SelectItem value="project">{t("projectReport")}</SelectItem>
                          <SelectItem value="feedback">{t("feedbackReport")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={sendEmail} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      {t("sendEmail")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEmailData({
                          to: "",
                          cc: "",
                          bcc: "",
                          subject: "",
                          content: "",
                          attachReport: false,
                          reportType: "daily",
                        })
                      }
                    >
                      {t("clear")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("includeAccounts")}
                </CardTitle>
                <CardDescription>{t("selectAccountsToInclude")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("filterByProject")}</Label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredAccounts.map((account: any) => {
                    const project = projects.find((p) => p.id == account.projectId)
                    return (
                      <div key={account.id} className="flex items-center space-x-2 p-2 border rounded">
                        <Checkbox
                          checked={selectedAccounts.includes(account.id)}
                          onCheckedChange={() => handleAccountToggle(account.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{account.website}</p>
                          <p className="text-xs text-muted-foreground">{project?.name}</p>
                        </div>
                      </div>
                    )
                  })}
                  {filteredAccounts.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">{t("noAccountsFound")}</p>
                  )}
                </div>

                {selectedAccounts.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">{t("selectedAccounts")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAccounts.map((accountId) => {
                        const account = accounts.find((a: any) => a.id === accountId)
                        return (
                          <Badge key={accountId} variant="secondary" className="text-xs">
                            {account?.website}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("savedEmailTemplates")}</CardTitle>
              <CardDescription>{t("manageYourEmailTemplates")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm font-medium mb-1">{template.subject}</p>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {template.content.substring(0, 100)}...
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => useTemplate(template)}>
                          <Eye className="h-3 w-3 mr-1" />
                          {t("useTemplate")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTemplateEditor({
                              name: template.name,
                              type: template.type,
                              subject: template.subject,
                              content: template.content,
                            })
                            setActiveTab("designer")
                          }}
                        >
                          {t("edit")}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {templates.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">{t("noEmailTemplatesYet")}</div>
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
                <CardTitle>{t("emailTemplateDesigner")}</CardTitle>
                <CardDescription>{t("createCustomEmailTemplate")}</CardDescription>
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
                      <SelectItem value="account">{t("accountCredentials")}</SelectItem>
                      <SelectItem value="report">{t("reports")}</SelectItem>
                      <SelectItem value="general">{t("generalEmail")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateSubject">{t("subject")}</Label>
                  <Input
                    id="templateSubject"
                    value={templateEditor.subject}
                    onChange={(e) => setTemplateEditor({ ...templateEditor, subject: e.target.value })}
                    placeholder={getDefaultTemplate(templateEditor.type).subject}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateContent">{t("emailContent")}</Label>
                  <Textarea
                    id="templateContent"
                    value={templateEditor.content}
                    onChange={(e) => setTemplateEditor({ ...templateEditor, content: e.target.value })}
                    placeholder={getDefaultTemplate(templateEditor.type).content}
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
                    onClick={() => {
                      const defaultTemplate = getDefaultTemplate(templateEditor.type)
                      setTemplateEditor({
                        ...templateEditor,
                        subject: defaultTemplate.subject,
                        content: defaultTemplate.content,
                      })
                    }}
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
                <CardDescription>{t("useTheseVariablesInEmail")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t("basicVariables")}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <code>{"{{clientName}}"}</code>
                        <span className="text-muted-foreground">{t("clientName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{yourName}}"}</code>
                        <span className="text-muted-foreground">{t("yourName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <code>{"{{currentDate}}"}</code>
                        <span className="text-muted-foreground">{t("currentDate")}</span>
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
                        <code>{"{{projectStatus}}"}</code>
                        <span className="text-muted-foreground">{t("projectStatus")}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("accountVariables")}</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <code>{"{{#accounts}} ... {{/accounts}}"}</code>
                        <p className="text-muted-foreground text-xs">{t("accountInfo")}</p>
                      </div>
                      <div className="text-muted-foreground text-xs ml-4">
                        • website, username, password
                        <br />• email, notes
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{t("reportVariables")}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• reportType, totalTasks</div>
                      <div>• completedTasks, progress</div>
                      <div>• recentTasks, nextSteps</div>
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
