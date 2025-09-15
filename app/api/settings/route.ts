import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection('settings').findOne({ user_id: request.user.id })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        emailNotifications: {
          enabled: false,
          recipients: []
        },
        theme: 'light',
        language: 'en'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    const result = await db.collection('settings').updateOne(
      { user_id: request.user.id },
      { $set: { ...body, user_id: request.user.id, updated_at: new Date() } },
      { upsert: true }
    )

    const updatedSettings = await db.collection('settings').findOne({ user_id: request.user.id })
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
})