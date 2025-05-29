// Test script to check and create sample tasks in database
const { neon } = require('@neondatabase/serverless');

async function testDatabaseTasks() {
  try {
    // Load environment variables
    require('dotenv').config();
    
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Checking existing tasks...');
    
    // Check existing tasks
    const existingTasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    console.log(`Found ${existingTasks.length} existing tasks:`, existingTasks);
    
    // Check existing projects
    const existingProjects = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
    console.log(`Found ${existingProjects.length} existing projects:`, existingProjects);
    
    // Create a sample project if none exists
    let projectId = null;
    if (existingProjects.length === 0) {
      console.log('📝 Creating sample project...');
      const [newProject] = await sql`
        INSERT INTO projects (name, domain, description, status)
        VALUES ('Project Manager Demo', 'demo.project-manager.local', 'Demo project for testing', 'active')
        RETURNING *
      `;
      projectId = newProject.id;
      console.log('✅ Sample project created:', newProject);
    } else {
      projectId = existingProjects[0].id;
      console.log('📋 Using existing project:', existingProjects[0].name);
    }
    
    // Create sample tasks if none exist
    if (existingTasks.length === 0) {
      console.log('📝 Creating sample tasks...');
      
      const today = new Date().toISOString().split('T')[0];
      const sampleTasksData = [
        {
          title: 'Hoàn thành thiết kế giao diện chính',
          description: 'Thiết kế layout và UI components cho trang dashboard',
          priority: 'high',
          date: today,
          estimated_time: 180
        },
        {
          title: 'Review code và tối ưu hiệu suất',
          description: 'Kiểm tra và cải thiện performance của ứng dụng',
          priority: 'medium',
          date: today,
          estimated_time: 120
        },
        {
          title: 'Cập nhật documentation',
          description: 'Viết tài liệu hướng dẫn sử dụng cho người dùng',
          priority: 'low',
          date: today,
          estimated_time: 60
        }
      ];
      
      for (const taskData of sampleTasksData) {
        const [newTask] = await sql`
          INSERT INTO tasks (project_id, title, description, priority, date, estimated_time)
          VALUES (${projectId}, ${taskData.title}, ${taskData.description}, ${taskData.priority}, ${taskData.date}, ${taskData.estimated_time})
          RETURNING *
        `;
        console.log('✅ Task created:', newTask.title);
      }
      
      console.log('🎉 Sample tasks created successfully!');
    } else {
      console.log('📋 Tasks already exist in database');
    }
    
    // Final check
    const finalTasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    console.log(`\n📊 Final summary: ${finalTasks.length} total tasks in database`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDatabaseTasks();
