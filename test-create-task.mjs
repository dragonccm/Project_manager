import { createTask } from './lib/mongo-database'

async function testCreateTask() {
  try {
    console.log('Testing task creation...')
    
    const testTask = {
      title: 'Test Task',
      description: 'This is a test task to verify functionality',
      status: 'To Do',
      priority: 'Medium',
      user_id: '68c797e350f47cd77aa1fc24', // Admin user ID from logs
      project_id: '',
      assigned_to: '',
      estimated_time: '',
      actual_time: '',
      completed: false
    }
    
    const result = await createTask(testTask)
    console.log('Task created successfully:', result)
    
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

testCreateTask()