// Test script to create sample tasks in database
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL)

async function createSampleTasks() {
  try {
    console.log('🧪 Testing database connection...')
    
    // Test connection
    const result = await sql`SELECT 1 as test`
    console.log('✅ Database connected successfully')

    // First, let's check if we have any projects
    const projects = await sql`SELECT * FROM projects LIMIT 1`
    let projectId = null
    
    if (projects.length === 0) {
      console.log('📝 Creating a sample project first...')
      const [newProject] = await sql`
        INSERT INTO projects (name, domain, description, status)
        VALUES ('Project Manager System', 'project-manager.local', 'Hệ thống quản lý dự án', 'active')
        RETURNING id
      `
      projectId = newProject.id
      console.log('✅ Sample project created with ID:', projectId)
    } else {
      projectId = projects[0].id
      console.log('✅ Using existing project with ID:', projectId)
    }

    // Check existing tasks
    const existingTasks = await sql`SELECT COUNT(*) as count FROM tasks`
    console.log(`📊 Current tasks in database: ${existingTasks[0].count}`)

    // Create sample tasks for today
    const today = new Date().toISOString().split('T')[0]
    console.log('📅 Creating tasks for date:', today)

    const tasksToCreate = [
      {
        title: 'Tích hợp database cho Daily Tasks',
        description: 'Kết nối và lưu task vào PostgreSQL database',
        priority: 'high',
        estimated_time: 120
      },
      {
        title: 'Test chức năng CRUD tasks',
        description: 'Kiểm tra tạo, đọc, cập nhật và xóa task',
        priority: 'medium', 
        estimated_time: 90
      },
      {
        title: 'Cập nhật UI hiển thị task',
        description: 'Cải thiện giao diện hiển thị danh sách task',
        priority: 'low',
        estimated_time: 60
      }
    ]

    console.log('🔄 Creating sample tasks...')
    
    for (const taskData of tasksToCreate) {
      const [task] = await sql`
        INSERT INTO tasks (project_id, title, description, priority, date, estimated_time, completed)
        VALUES (${projectId}, ${taskData.title}, ${taskData.description}, ${taskData.priority}, ${today}, ${taskData.estimated_time}, false)
        RETURNING *
      `
      console.log(`✅ Created task: "${task.title}" (ID: ${task.id})`)
    }

    // Show final count
    const finalTasks = await sql`SELECT COUNT(*) as count FROM tasks`
    console.log(`🎉 Total tasks in database: ${finalTasks[0].count}`)

    // Show all tasks for today
    const todayTasks = await sql`
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.date = ${today}
      ORDER BY t.created_at DESC
    `
    
    console.log('\n📋 Tasks for today:')
    todayTasks.forEach(task => {
      console.log(`- [${task.completed ? '✅' : '⏳'}] ${task.title} (${task.priority} priority, ${task.estimated_time}min)`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createSampleTasks()
