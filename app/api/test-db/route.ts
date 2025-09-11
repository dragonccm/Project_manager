import { testDatabaseConnection } from '@/lib/api/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    const result = await testDatabaseConnection()
    console.log('Database connection result:', result)
    
    return NextResponse.json({ 
      success: true, 
      result
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
