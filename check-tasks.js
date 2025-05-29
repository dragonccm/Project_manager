// Quick test to check tasks from database
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()
const sql = neon(process.env.NEON_DATABASE_URL)

async function checkTasks() {
  try {
    const tasks = await sql`
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY t.created_at DESC
    `
    
    console.log(`📊 Found ${tasks.length} tasks in database:`)
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.title}" - ${task.priority} priority (Project: ${task.project_name || 'No project'})`)
      console.log(`   Date: ${task.date}, Estimated: ${task.estimated_time}min, Completed: ${task.completed}`)
      console.log(`   Description: ${task.description}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkTasks()
