// Quick script to create tasks for today's date to test TrelloTasks component
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
config({ path: resolve(__dirname, '..', '.env') });

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);

const today = "2025-05-29"; // Using the current date as specified in the context

async function createTodayTasks() {
  try {
    console.log(`📅 Creating tasks for today: ${today}`);
    
    // Check if we have any projects
    const projects = await sql`SELECT * FROM projects LIMIT 1`;
    let projectId = null;
    
    if (projects.length === 0) {
      const [newProject] = await sql`
        INSERT INTO projects (name, domain, description, status)
        VALUES ('Test Project', 'test.local', 'Project for testing TrelloTasks', 'active')
        RETURNING id
      `;
      projectId = newProject.id;
      console.log('✅ Created test project with ID:', projectId);
    } else {
      projectId = projects[0].id;
      console.log('✅ Using existing project with ID:', projectId);
    }

    // Create sample tasks for today with different statuses
    const tasksToCreate = [
      {
        title: 'Review code changes',
        description: 'Review and merge pull requests from team',
        priority: 'high',
        status: 'todo',
        estimated_time: 90
      },
      {
        title: 'Design system updates',
        description: 'Update design tokens and component library',
        priority: 'medium',
        status: 'in-progress',
        estimated_time: 120
      },
      {
        title: 'Fix drag and drop bugs',
        description: 'Resolve issues with task dragging in TrelloTasks component',
        priority: 'high',
        status: 'todo',
        estimated_time: 60
      },
      {
        title: 'Update documentation',
        description: 'Write documentation for new features',
        priority: 'low',
        status: 'done',
        estimated_time: 45
      }
    ];
    
    console.log(`🔄 Creating ${tasksToCreate.length} sample tasks...`);
    
    for (const taskData of tasksToCreate) {
      const [task] = await sql`
        INSERT INTO tasks (project_id, title, description, priority, status, date, estimated_time, completed)
        VALUES (${projectId}, ${taskData.title}, ${taskData.description}, ${taskData.priority}, ${taskData.status}, ${today}, ${taskData.estimated_time}, ${taskData.status === 'done'})
        RETURNING *
      `;
      console.log(`✅ Created task: "${task.title}" (${task.status})`);
    }

    // Show final count for today
    const todayTasks = await sql`
      SELECT status, COUNT(*) as status_count
      FROM tasks 
      WHERE date = ${today}
      GROUP BY status
    `;
    
    console.log('\n📊 Tasks created for today:');
    todayTasks.forEach(row => {
      console.log(`  ${row.status}: ${row.status_count} tasks`);
    });

    const totalToday = await sql`SELECT COUNT(*) as count FROM tasks WHERE date = ${today}`;
    console.log(`\n🎉 Total tasks for today: ${totalToday[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTodayTasks();
