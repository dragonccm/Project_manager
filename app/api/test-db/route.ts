import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongo-database'

export async function GET() {
  try {
    // Test MongoDB connection
    const { db, client } = await connectToDatabase()
    
    // Test basic connectivity
    await client.db().admin().ping()
    
    // Get collection stats
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: db.databaseName,
      collections: collectionNames,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}