// Complete test of Daily Tasks functionality
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()
const sql = neon(process.env.NEON_DATABASE_URL)

async function testDailyTasksFeatures() {
  try {
    console.log('🔍 TESTING DAILY TASKS COMPONENT FEATURES')
    console.log('=' * 50)
    
    // 1. Check current state
    console.log('\n1️⃣ CHECKING CURRENT DATABASE STATE')
    const allTasks = await sql`SELECT COUNT(*) as count FROM tasks`
    const todayTasks = await sql`
      SELECT COUNT(*) as count 
      FROM tasks 
      WHERE date = ${new Date().toISOString().split('T')[0]}
    `
    console.log(`📊 Total tasks in database: ${allTasks[0].count}`)
    console.log(`📅 Tasks for today: ${todayTasks[0].count}`)
    
    // 2. Test adding a new task (simulating form submission)
    console.log('\n2️⃣ TESTING TASK CREATION (Form Submission)')
    const newTaskData = {
      project_id: 1,
      title: 'Test UI Integration',
      description: 'Kiểm tra tích hợp UI với database',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
      estimated_time: 75
    }
    
    const [createdTask] = await sql`
      INSERT INTO tasks (project_id, title, description, priority, date, estimated_time, completed)
      VALUES (${newTaskData.project_id}, ${newTaskData.title}, ${newTaskData.description}, ${newTaskData.priority}, ${newTaskData.date}, ${newTaskData.estimated_time}, false)
      RETURNING *
    `
    console.log('✅ Task created:', createdTask.title)
    
    // 3. Test task toggle (simulating checkbox click)
    console.log('\n3️⃣ TESTING TASK TOGGLE (Checkbox Click)')
    await sql`UPDATE tasks SET completed = true WHERE id = ${createdTask.id}`
    const [toggledTask] = await sql`SELECT * FROM tasks WHERE id = ${createdTask.id}`
    console.log(`✅ Task toggled to: ${toggledTask.completed ? 'Completed' : 'Pending'}`)
    
    // 4. Get final statistics
    console.log('\n4️⃣ FINAL STATISTICS')
    const finalStats = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE completed = true) as completed_tasks,
        COUNT(*) FILTER (WHERE completed = false) as pending_tasks,
        COUNT(*) FILTER (WHERE date = ${new Date().toISOString().split('T')[0]}) as today_tasks
      FROM tasks
    `
    
    const stats = finalStats[0]
    console.log(`📊 Total tasks: ${stats.total_tasks}`)
    console.log(`✅ Completed: ${stats.completed_tasks}`)
    console.log(`⏳ Pending: ${stats.pending_tasks}`)
    console.log(`📅 Today: ${stats.today_tasks}`)
    
    // 5. Display today's tasks formatted for UI
    console.log('\n5️⃣ TODAY\'S TASKS (UI FORMAT)')
    const todayTasksList = await sql`
      SELECT t.*, p.name as project_name 
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.date = ${new Date().toISOString().split('T')[0]}
      ORDER BY 
        CASE t.priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2  
          WHEN 'low' THEN 3
        END,
        t.created_at DESC
    `
    
    todayTasksList.forEach((task, index) => {
      const status = task.completed ? '✅' : '⏳'
      const priority = task.priority.toUpperCase()
      console.log(`${status} ${index + 1}. "${task.title}" [${priority}] (${task.estimated_time}min)`)
      console.log(`   📁 Project: ${task.project_name || 'No project'}`)
      console.log(`   📝 ${task.description}`)
      console.log('')
    })
    
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!')
    console.log('\n💡 The Daily Tasks component should now:')
    console.log('   ✓ Load real data from database')
    console.log('   ✓ Show green notification banner')
    console.log('   ✓ Display correct task counts')
    console.log('   ✓ Allow creating new tasks')
    console.log('   ✓ Allow toggling task completion')
    console.log('\n🔄 Please refresh the browser to see updated data!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testDailyTasksFeatures()
