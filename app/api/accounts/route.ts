import { NextRequest, NextResponse } from 'next/server'
import { getAccounts, createAccount, deleteAccount } from '@/lib/mongo-database'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const accounts = await getAccounts(request.user.id)
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const accountData = await request.json()
    const newAccount = await createAccount({ ...accountData, user_id: request.user.id })
    return NextResponse.json(newAccount)
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
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
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    await deleteAccount(id, request.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
})