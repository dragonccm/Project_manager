"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Database, Plus, List, CheckCircle } from "lucide-react"
import { useDatabase } from "@/hooks/use-database"

export function DatabaseTest() {
  const {
    projects,
    tasks,
    accounts,
    feedbacks,
    isDatabaseAvailable,
    loading,
    addProject,
    addTask,
    addAccount,
    addFeedback,
    removeProject,
    toggleTask,
  } = useDatabase()

  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const runDatabaseTest = async () => {
    setTesting(true)
    setTestResults([])
    const results: string[] = []

    try {
      // Test 1: Create a project
      results.push("🧪 Testing project creation...")
      const testProject = await addProject({
        name: "Test Project " + Date.now(),
        domain: "test.example.com",
        description: "This is a test project",
        status: "active",
      })
      results.push(`✅ Project created: ${testProject.name}`)

      // Test 2: Create a task
      results.push("🧪 Testing task creation...")
      const testTask = await addTask({
        project_id: testProject.id,
        title: "Test Task " + Date.now(),
        description: "This is a test task",
        priority: "high",
        date: new Date().toISOString().split("T")[0],
        estimated_time: 120,
      })
      results.push(`✅ Task created: ${testTask.title}`)

      // Test 3: Create an account
      results.push("🧪 Testing account creation...")
      const testAccount = await addAccount({
        project_id: testProject.id,
        username: "testuser" + Date.now(),
        password: "testpass123",
        email: "test@example.com",
        website: "https://test.example.com",
        notes: "Test account",
      })
      results.push(`✅ Account created: ${testAccount.username}`)

      // Test 4: Create feedback
      results.push("🧪 Testing feedback creation...")
      const testFeedback = await addFeedback({
        project_id: testProject.id,
        client_name: "Test Client",
        client_email: "client@example.com",
        subject: "Test Feedback",
        message: "This is test feedback",
        rating: 5,
        priority: "medium",
      })
      results.push(`✅ Feedback created: ${testFeedback.subject}`)

      // Test 5: Toggle task completion
      results.push("🧪 Testing task toggle...")
      await toggleTask(testTask.id, true)
      results.push(`✅ Task marked as completed`)

      // Test 6: Clean up - remove test project
      results.push("🧪 Cleaning up test data...")
      await removeProject(testProject.id)
      results.push(`✅ Test project removed`)

      results.push("🎉 All database tests passed successfully!")
    } catch (error) {
      results.push(`❌ Test failed: ${error.message}`)
    }

    setTestResults(results)
    setTesting(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading database...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Test & Status
          <Badge variant={isDatabaseAvailable ? "default" : "secondary"}>
            {isDatabaseAvailable ? "Database" : "LocalStorage"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Tasks</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{accounts.length}</div>
            <div className="text-sm text-muted-foreground">Accounts</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{feedbacks.length}</div>
            <div className="text-sm text-muted-foreground">Feedbacks</div>
          </div>
        </div>

        <Separator />

        {/* Test Button */}
        <div className="text-center">
          <Button onClick={runDatabaseTest} disabled={testing} size="lg" className="w-full md:w-auto">
            {testing ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-pulse" />
                Running Tests...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Run Database Test
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will create test data, verify CRUD operations, and clean up automatically
          </p>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <List className="h-4 w-4" />
                Test Results
              </h4>
              <div className="bg-muted p-4 rounded-lg space-y-1 max-h-60 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Environment Info */}
        <Separator />
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Environment: {isDatabaseAvailable ? "Production (Neon PostgreSQL)" : "Development (LocalStorage)"}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Auto-fallback: {isDatabaseAvailable ? "Not needed" : "Active"}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3" />
            Data persistence: {isDatabaseAvailable ? "Database" : "Browser storage"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
