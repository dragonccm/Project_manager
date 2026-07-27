import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongo-database'

// Endpoint kiểm tra kết nối DB. Không yêu cầu đăng nhập nên KHÔNG trả về
// danh sách collection / schema — chỉ báo kết nối được hay không.
export async function GET() {
  try {
    const { db, client } = await connectToDatabase()
    await client.db().admin().ping()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: db.databaseName,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
