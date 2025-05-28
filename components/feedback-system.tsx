"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageSquare, Star, Clock, User } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface Feedback {
  id: string
  projectId: string
  clientName: string
  clientEmail: string
  subject: string
  message: string
  rating: number
  status: "new" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

interface FeedbackSystemProps {
  projects: any[]
}

export function FeedbackSystem({ projects }: FeedbackSystemProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [formData, setFormData] = useState({
    projectId: "",
    clientName: "",
    clientEmail: "",
    subject: "",
    message: "",
    rating: 5,
    priority: "medium" as const,
  })
  const [filter, setFilter] = useState("all")
  const { t } = useLanguage()

  useEffect(() => {
    const savedFeedbacks = localStorage.getItem("feedbacks")
    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      ...formData,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedFeedbacks = [...feedbacks, newFeedback]
    setFeedbacks(updatedFeedbacks)
    localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks))

    setFormData({
      projectId: "",
      clientName: "",
      clientEmail: "",
      subject: "",
      message: "",
      rating: 5,
      priority: "medium",
    })
  }

  const updateFeedbackStatus = (feedbackId: string, status: Feedback["status"]) => {
    const updatedFeedbacks = feedbacks.map((feedback) =>
      feedback.id === feedbackId ? { ...feedback, status, updatedAt: new Date().toISOString() } : feedback,
    )
    setFeedbacks(updatedFeedbacks)
    localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks))
  }

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filter === "all") return true
    return feedback.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "destructive"
      case "in-progress":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("feedbackSystem")}</h1>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <Badge variant="destructive">
            {feedbacks.filter((f) => f.status === "new").length} {t("new")}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalFeedback")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbacks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("newFeedback")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{feedbacks.filter((f) => f.status === "new").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("inProgress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {feedbacks.filter((f) => f.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("resolved")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {feedbacks.filter((f) => f.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("addNewFeedback")}</CardTitle>
            <CardDescription>{t("recordClientFeedback")}</CardDescription>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">{t("clientName")}</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder={t("enterClientName")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail">{t("clientEmail")}</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t("subject")}</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={t("feedbackSubject")}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("message")}</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("feedbackMessage")}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">{t("rating")}</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) => setFormData({ ...formData, rating: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} {rating === 1 ? t("star") : t("stars")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t("priority")}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("low")}</SelectItem>
                      <SelectItem value="medium">{t("medium")}</SelectItem>
                      <SelectItem value="high">{t("high")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("addFeedback")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("feedbackList")}</CardTitle>
            <CardDescription>
              <div className="flex gap-2 mt-2">
                <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                  {t("all")}
                </Button>
                <Button variant={filter === "new" ? "default" : "outline"} size="sm" onClick={() => setFilter("new")}>
                  {t("new")}
                </Button>
                <Button
                  variant={filter === "in-progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("in-progress")}
                >
                  {t("inProgress")}
                </Button>
                <Button
                  variant={filter === "resolved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("resolved")}
                >
                  {t("resolved")}
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredFeedbacks.map((feedback) => {
                const project = projects.find((p) => p.id === feedback.projectId)
                return (
                  <div key={feedback.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{feedback.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusColor(feedback.status)}>{feedback.status}</Badge>
                          <Badge variant={getPriorityColor(feedback.priority)}>{feedback.priority}</Badge>
                          {project && <Badge variant="outline">{project.name}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{feedback.message}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {feedback.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {feedback.status !== "resolved" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateFeedbackStatus(feedback.id, "in-progress")}
                            >
                              {t("inProgress")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateFeedbackStatus(feedback.id, "resolved")}
                            >
                              {t("resolve")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredFeedbacks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">{t("noFeedbackFound")}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
