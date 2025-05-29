// Test adding a new task via API
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()
const sql = neon(process.env.NEON_DATABASE_URL)

async function testAddTask() {
  try {
    console.log('🧪 Testing task creation...')
    
    // Create a new task
    const [newTask] = await sql`
      INSERT INTO tasks (project_id, title, description, priority, date, estimated_time, completed)
      VALUES (1, 'Test task từ script', 'Đây là task test được tạo từ script', 'medium', ${new Date().toISOString().split('T')[0]}, 45, false)
      RETURNING *
    `
    
    console.log('✅ New task created:', newTask)
    
    // Get all tasks for today
    const todayTasks = await sql`
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.date = ${new Date().toISOString().split('T')[0]}
      ORDER BY t.created_at DESC
    `
    
    console.log(`\n📋 Total tasks for today: ${todayTasks.length}`)
    todayTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (${task.priority}, ${task.estimated_time}min) - Project: ${task.project_name}`)
    })
    
    // Test toggle task completion
    console.log('\n🔄 Testing task toggle...')
    await sql`UPDATE tasks SET completed = true WHERE id = ${newTask.id}`
    console.log('✅ Task marked as completed')
    
    // Check the update
    const [updatedTask] = await sql`SELECT * FROM tasks WHERE id = ${newTask.id}`
    console.log('📊 Updated task status:', updatedTask.completed ? 'Completed' : 'Pending')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testAddTask()
