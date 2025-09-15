import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'
import { createSuccessResponse, handleApiError, validateRequired } from '@/lib/api-base'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const projects = await getProjects(request.user.id)
    return createSuccessResponse(projects)
  } catch (error) {
    return handleApiError(error, 'fetching projects')
  }
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const projectData = await request.json()
    
    // Validate required fields
    const missingFields = validateRequired(projectData, ['name'])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    const newProject = await createProject({ ...projectData, user_id: request.user.id })
    return createSuccessResponse(newProject)
  } catch (error) {
    return handleApiError(error, 'creating project')
  }
})

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const projectData = await request.json()
    const updatedProject = await updateProject(id, request.user.id, projectData)
    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await deleteProject(id, request.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
})