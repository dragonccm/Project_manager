'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Database, Users, FolderOpen, Key, Loader2, Info } from 'lucide-react'

interface MigrationResult {
  success: boolean
  message: string
  data?: {
    users: number
    projects: number
    accounts: number
    errors: string[]
  }
}

export default function MigrationTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [currentStep, setCurrentStep] = useState<'ready' | 'migrating' | 'completed' | 'error'>('ready')

  const handleMigration = async () => {
    setIsLoading(true)
    setCurrentStep('migrating')
    setMigrationResult(null)

    try {
      const response = await fetch('/api/migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'migrate' }),
      })

      const result: MigrationResult = await response.json()
      setMigrationResult(result)
      
      if (result.success) {
        setCurrentStep('completed')
      } else {
        setCurrentStep('error')
      }
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationResult({
        success: false,
        message: 'Network error occurred during migration',
      })
      setCurrentStep('error')
    } finally {
      setIsLoading(false)
    }
  }

  const resetMigration = () => {
    setCurrentStep('ready')
    setMigrationResult(null)
    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Database className="h-8 w-8 text-blue-600" />
          Migration Tool
        </h1>
        <p className="text-gray-600">
          Migrate data from old Neon database JSON files to MongoDB
        </p>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Migration Information
          </CardTitle>
          <CardDescription>
            This tool will migrate data from the following sources:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Admin User</div>
                <div className="text-sm text-gray-500">mogo_admin.json</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Projects</div>
                <div className="text-sm text-gray-500">projects.json</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Key className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Accounts</div>
                <div className="text-sm text-gray-500">accounts.json</div>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Notes:</AlertTitle>
            <AlertDescription className="space-y-1">
              <div>• Admin user will be created with default password "admin123" - please change after migration</div>
              <div>• Existing records with same data will be skipped to prevent duplicates</div>
              <div>• All migrated data will be linked to the admin user account</div>
              <div>• Project status will be converted to match new schema requirements</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Migration Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Controls</CardTitle>
          <CardDescription>
            {currentStep === 'ready' && 'Click the button below to start the migration process'}
            {currentStep === 'migrating' && 'Migration in progress...'}
            {currentStep === 'completed' && 'Migration completed successfully!'}
            {currentStep === 'error' && 'Migration encountered errors. Check the results below.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          {currentStep === 'migrating' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Migrating data...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {currentStep === 'ready' && (
              <Button 
                onClick={handleMigration} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            )}

            {(currentStep === 'completed' || currentStep === 'error') && (
              <Button 
                onClick={resetMigration}
                variant="outline"
              >
                Run New Migration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {migrationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={migrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className="text-sm">
                <strong>Status:</strong> {migrationResult.message}
              </AlertDescription>
            </Alert>

            {migrationResult.data && (
              <div className="space-y-4">
                {/* Success metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {migrationResult.data.users}
                    </div>
                    <div className="text-sm text-green-600">Users Migrated</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {migrationResult.data.projects}
                    </div>
                    <div className="text-sm text-blue-600">Projects Migrated</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {migrationResult.data.accounts}
                    </div>
                    <div className="text-sm text-purple-600">Accounts Migrated</div>
                  </div>
                </div>

                {/* Error list */}
                {migrationResult.data.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-700">Errors encountered:</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {migrationResult.data.errors.map((error, index) => (
                        <div key={index} className="text-sm bg-red-50 border-l-4 border-red-400 p-3">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success message */}
            {migrationResult.success && migrationResult.data && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Migration Completed Successfully!</AlertTitle>
                <AlertDescription>
                  Your data has been successfully migrated to MongoDB. 
                  {migrationResult.data.errors.length > 0 && 
                    ` Note: ${migrationResult.data.errors.length} minor issues were encountered but didn't prevent the migration.`
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status indicator */}
      <div className="flex justify-center">
        <Badge variant={
          currentStep === 'ready' ? 'secondary' :
          currentStep === 'migrating' ? 'default' :
          currentStep === 'completed' ? 'default' : 'destructive'
        }>
          {currentStep === 'ready' && 'Ready to migrate'}
          {currentStep === 'migrating' && 'Migration in progress...'}
          {currentStep === 'completed' && 'Migration completed'}
          {currentStep === 'error' && 'Migration completed with errors'}
        </Badge>
      </div>
    </div>
  )
}