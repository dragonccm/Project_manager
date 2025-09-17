import { NextResponse } from 'next/server'
import { getProjects, getAccounts, getTasks, getEmailTemplates, getReportTemplates, getSettings } from '@/lib/mongo-database'

export async function GET() {
  const results: Record<string, any> = {}
  const testUserId = '507f1f77bcf86cd799439011' // Valid ObjectId format
  
  // Test each API function individually
  console.log('Testing getProjects...')
  try {
    const projects = await getProjects(testUserId)
    results.projects = { success: true, count: projects.length }
    console.log('getProjects succeeded:', projects.length, 'projects')
  } catch (error) {
    console.error('getProjects failed:', error)
    results.projects = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('Testing getAccounts...')
  try {
    const accounts = await getAccounts(testUserId)
    results.accounts = { success: true, count: accounts.length }
    console.log('getAccounts succeeded:', accounts.length, 'accounts')
  } catch (error) {
    console.error('getAccounts failed:', error)
    results.accounts = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('Testing getTasks...')
  try {
    const tasks = await getTasks(testUserId)
    results.tasks = { success: true, count: tasks.length }
    console.log('getTasks succeeded:', tasks.length, 'tasks')
  } catch (error) {
    console.error('getTasks failed:', error)
    results.tasks = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('Testing getEmailTemplates...')
  try {
    const emailTemplates = await getEmailTemplates()
    results.emailTemplates = { success: true, count: emailTemplates.length }
    console.log('getEmailTemplates succeeded:', emailTemplates.length, 'templates')
  } catch (error) {
    console.error('getEmailTemplates failed:', error)
    results.emailTemplates = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('Testing getReportTemplates...')
  try {
    const reportTemplates = await getReportTemplates()
    results.reportTemplates = { success: true, count: Array.isArray(reportTemplates) ? reportTemplates.length : 1 }
    console.log('getReportTemplates succeeded')
  } catch (error) {
    console.error('getReportTemplates failed:', error)
    results.reportTemplates = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('Testing getSettings...')
  try {
    const settings = await getSettings()
    results.settings = { success: true, hasData: !!settings }
    console.log('getSettings succeeded')
  } catch (error) {
    console.error('getSettings failed:', error)
    results.settings = { success: false, error: error instanceof Error ? error.message : String(error) }
  }
  
  console.log('All database function tests completed')
  
  return NextResponse.json({
    success: true,
    message: 'Database function tests completed',
    results,
    timestamp: new Date().toISOString()
  })
}