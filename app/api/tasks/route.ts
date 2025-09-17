import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    console.log('GET /api/tasks - User ID:', request.user.id)
    const tasks = await getTasks(request.user.id)
    console.log('Tasks retrieved successfully:', tasks.length, 'tasks')
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks - Full error:', error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const taskData = await request.json()
    const newTask = await createTask({ ...taskData, user_id: request.user.id })
    return NextResponse.json(newTask)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const taskData = await request.json()
    const updatedTask = await updateTask(id, request.user.id, taskData)
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
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
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    await deleteTask(id, request.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
})