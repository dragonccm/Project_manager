"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"
import { testDatabaseConnection, initializeTables } from "@/lib/database"

export function DatabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    testing: boolean
    initializing: boolean
    error?: string
  }>({
    connected: false,
    testing: true,
    initializing: false,
  })

  const testConnection = async () => {
    setConnectionStatus((prev) => ({ ...prev, testing: true, error: undefined }))

    try {
      console.log("Testing database connection...")
      const result = await testDatabaseConnection()
      console.log("Connection test result:", result)

      if (result.success) {
        setConnectionStatus((prev) => ({ ...prev, initializing: true }))
        console.log("Initializing database tables...")
        const initResult = await initializeTables()
        console.log("Initialization result:", initResult)

        setConnectionStatus({
          connected: result.success && initResult.success,
          testing: false,
          initializing: false,
          error: initResult.error,
        })
      } else {
        setConnectionStatus({
          connected: false,
          testing: false,
          initializing: false,
          error: result.error,
        })
      }
    } catch (error) {
      console.error("Connection test error:", error)
      setConnectionStatus({
        connected: false,
        testing: false,
        initializing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  const getStatusIcon = () => {
    if (connectionStatus.testing || connectionStatus.initializing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    if (connectionStatus.connected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusText = () => {
    if (connectionStatus.testing) return "Testing connection..."
    if (connectionStatus.initializing) return "Initializing database..."
    if (connectionStatus.connected) return "Database Connected"
    return "Database Disconnected"
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <Badge variant={connectionStatus.connected ? "default" : "destructive"}>
            {connectionStatus.connected ? "Database" : "LocalStorage"}
          </Badge>
        </div>

        {connectionStatus.error && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <strong>Error:</strong> {connectionStatus.error}
            {!connectionStatus.connected && (
              <div className="mt-1 text-xs">
                Make sure NEON_NEON_DATABASE_URL environment variable is set correctly.
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {connectionStatus.connected
            ? "✅ Connected to Neon PostgreSQL database"
            : "⚠️ Using localStorage fallback - check NEON_DATABASE_URL"}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={connectionStatus.testing || connectionStatus.initializing}
          className="w-full"
        >
          <RefreshCw
            className={`h-3 w-3 mr-2 ${connectionStatus.testing || connectionStatus.initializing ? "animate-spin" : ""}`}
          />
          {connectionStatus.testing || connectionStatus.initializing ? "Testing..." : "Test Connection"}
        </Button>
      </CardContent>
    </Card>
  )
}