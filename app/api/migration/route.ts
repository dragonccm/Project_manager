import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createUser, getUserByUsername } from '@/lib/auth-database'
import { createProject, createAccount } from '@/lib/database'

interface OldProject {
  id: number
  name: string
  domain: string
  figma_link: string
  description: string
  status: string
  created_at: string
  updated_at: string
  user_id: number
}

interface OldAccount {
  id: number
  project_id: number
  username: string
  password: string
  email: string
  website: string
  notes: string
  created_at: string
  updated_at: string
  user_id: number
}

interface OldUser {
  _id: { $oid: string }
  username: string
  email: string
  full_name: string
  role: string
  password_hash: string
  created_at: { $date: string }
  updated_at: { $date: string }
}

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

export async function POST(request: NextRequest): Promise<NextResponse<MigrationResult>> {
  try {
    const body = await request.json()
    const { action } = body

    if (action !== 'migrate') {
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use "migrate" to start migration.'
      }, { status: 400 })
    }

    // Define paths to old database files
    const oldDatabasePath = path.join(process.cwd(), 'old_database')
    const projectsPath = path.join(oldDatabasePath, 'projects.json')
    const accountsPath = path.join(oldDatabasePath, 'accounts.json')
    const adminPath = path.join(oldDatabasePath, 'mogo_admin.json')

    const migrationResults = {
      users: 0,
      projects: 0,
      accounts: 0,
      errors: [] as string[]
    }

    // 1. Migrate admin user first
    try {
      const adminData = await fs.readFile(adminPath, 'utf-8')
      const adminUser: OldUser = JSON.parse(adminData)
      
      try {
        // Try to create admin user
        await createUser({
          username: adminUser.username,
          email: adminUser.email,
          password: 'admin123', // Default password, user should change this
          full_name: adminUser.full_name,
          role: adminUser.role as 'admin' | 'user' | 'viewer'
        })
        migrationResults.users += 1
        console.log('Admin user migrated successfully')
      } catch (userError: any) {
        if (userError.message.includes('already exists')) {
          console.log('Admin user already exists, skipping...')
        } else {
          migrationResults.errors.push(`Admin user migration error: ${userError.message}`)
        }
      }
    } catch (error: any) {
      migrationResults.errors.push(`Admin file read error: ${error.message}`)
    }

    // Get the admin user ID for linking projects and accounts
    let adminUserId: string | null = null
    try {
      const { getUserByUsername } = await import('@/lib/auth-database')
      const adminUser = await getUserByUsername('admin')
      adminUserId = adminUser?.id || null
    } catch (error: any) {
      migrationResults.errors.push(`Failed to get admin user ID: ${error.message}`)
    }

    if (!adminUserId) {
      return NextResponse.json({
        success: false,
        message: 'Cannot proceed without admin user ID',
        data: migrationResults
      }, { status: 400 })
    }

    // 2. Migrate projects
    try {
      const projectsData = await fs.readFile(projectsPath, 'utf-8')
      const oldProjects: OldProject[] = JSON.parse(projectsData)
      const projectIdMapping: { [oldId: number]: string } = {}

      for (const oldProject of oldProjects) {
        try {
          const newProject = await createProject({
            name: oldProject.name,
            domain: oldProject.domain || '',
            figma_link: oldProject.figma_link || '',
            description: oldProject.description || '',
            status: oldProject.status.toUpperCase() as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED',
            user_id: adminUserId
          })
          
          if (newProject) {
            projectIdMapping[oldProject.id] = newProject.id
            migrationResults.projects += 1
            console.log(`Project "${oldProject.name}" migrated successfully`)
          }
        } catch (error: any) {
          migrationResults.errors.push(`Project "${oldProject.name}" migration error: ${error.message}`)
        }
      }

      // 3. Migrate accounts
      try {
        const accountsData = await fs.readFile(accountsPath, 'utf-8')
        const oldAccounts: OldAccount[] = JSON.parse(accountsData)

        for (const oldAccount of oldAccounts) {
          try {
            const newProjectId = projectIdMapping[oldAccount.project_id]
            if (!newProjectId && oldAccount.project_id) {
              migrationResults.errors.push(`Account "${oldAccount.username}" skipped: Project ID ${oldAccount.project_id} not found`)
              continue
            }

            await createAccount({
              project_id: newProjectId || undefined,
              username: oldAccount.username,
              password: oldAccount.password,
              email: oldAccount.email || '',
              website: oldAccount.website,
              notes: oldAccount.notes || '',
              user_id: adminUserId
            } as any)
            
            migrationResults.accounts += 1
            console.log(`Account "${oldAccount.username}" migrated successfully`)
          } catch (error: any) {
            migrationResults.errors.push(`Account "${oldAccount.username}" migration error: ${error.message}`)
          }
        }
      } catch (error: any) {
        migrationResults.errors.push(`Accounts file read error: ${error.message}`)
      }

    } catch (error: any) {
      migrationResults.errors.push(`Projects file read error: ${error.message}`)
    }

    const success = migrationResults.errors.length === 0 || 
      (migrationResults.users > 0 || migrationResults.projects > 0 || migrationResults.accounts > 0)

    return NextResponse.json({
      success,
      message: success 
        ? `Migration completed! Users: ${migrationResults.users}, Projects: ${migrationResults.projects}, Accounts: ${migrationResults.accounts}`
        : 'Migration failed with errors',
      data: migrationResults
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      message: `Migration failed: ${error.message}`
    }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Migration API endpoint. Use POST with action: "migrate" to start migration.',
    status: 'ready'
  })
}