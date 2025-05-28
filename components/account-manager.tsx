"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Copy, Mail, RefreshCw, Plus } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { generateStrongPassword } from "@/lib/password-generator"
import { useDatabase } from "@/hooks/use-database"

interface Account {
  id: string
  projectId: string
  username: string
  password: string
  email: string
  website: string
  notes: string
  createdAt: string
}

interface AccountManagerProps {
  projects: any[]
  accounts: any[]
}

export function AccountManager({ projects, accounts }: AccountManagerProps) {
  const { addAccount, removeAccount } = useDatabase()
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    projectId: "",
    username: "",
    password: "",
    email: "",
    website: "",
    notes: "",
  })
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await addAccount({
        project_id: Number.parseInt(formData.projectId),
        username: formData.username,
        password: formData.password,
        email: formData.email,
        website: formData.website,
        notes: formData.notes,
      })

      setFormData({
        projectId: "",
        username: "",
        password: "",
        email: "",
        website: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error saving account:", error)
      alert("Error saving account. Please try again.")
    }
  }

  const generatePassword = () => {
    const password = generateStrongPassword()
    setFormData({ ...formData, password })
  }

  const autoFillFromWebsite = async () => {
    if (formData.website && formData.username) {
      try {
        const url = new URL(formData.website)
        const domain = url.hostname.replace("www.", "")
        const password = generateStrongPassword()

        setFormData({
          ...formData,
          password,
          email: formData.email || `${formData.username}@${domain}`,
        })
      } catch (error) {
        console.error("Invalid URL")
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sendEmailWithCredentials = (account: Account) => {
    const subject = `Account Credentials for ${account.website}`
    const body = `Username: ${account.username}\nPassword: ${account.password}\nWebsite: ${account.website}`
    const mailtoLink = `mailto:${account.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("accountManagement")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("addNewAccount")}</CardTitle>
            <CardDescription>{t("createAccountForProject")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">{t("project")}</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectProject")} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("website")}</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t("enterUsername")}
                    required
                  />
                  <Button type="button" variant="outline" onClick={autoFillFromWebsite}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t("enterPassword")}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("additionalNotes")}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("createAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("savedAccounts")}</CardTitle>
            <CardDescription>{t("manageYourAccounts")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {accounts.map((account) => {
                const project = projects.find((p) => p.id == account.projectId)
                return (
                  <div key={account.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{account.website}</h3>
                        <Badge variant="outline">{project?.name || "Unknown Project"}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(account.username)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        {account.email && (
                          <Button variant="ghost" size="sm" onClick={() => sendEmailWithCredentials(account)}>
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("username")}:</span>
                        <span className="font-mono">{account.username}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("password")}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{showPasswords[account.id] ? account.password : "••••••••"}</span>
                          <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(account.id)}>
                            {showPasswords[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {account.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t("email")}:</span>
                          <span className="font-mono">{account.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {accounts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">{t("noAccountsYet")}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
