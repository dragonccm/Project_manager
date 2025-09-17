import { NextResponse } from 'next/server'
import { getTasks } from '@/lib/mongo-database'

export async function GET() {
  try {
    console.log('Test API endpoint called')
    
    // Try to get tasks for a test user ID
    // Since we need a valid ObjectId, let's create one or use a hardcoded one for testing
    const testUserId = '507f1f77bcf86cd799439011' // Valid ObjectId format for testing
    console.log('Using test user ID:', testUserId)
    
    const tasks = await getTasks(testUserId)
    console.log('Tasks retrieved for test:', tasks.length)
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      taskCount: tasks.length,
      sampleTask: tasks[0] || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API error - Full error:', error)
    console.error('Test API error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Test API error message:', error instanceof Error ? error.message : String(error))
    console.error('Test API error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test API failed',
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}