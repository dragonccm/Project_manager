import { createProject, getProjects } from '@/lib/api/database'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing figma link creation...')
    
    // Test creating project with figma link
    const projectData = {
      name: 'Test Project with Figma',
      domain: 'https://test.com',
      figma_link: 'https://figma.com/test-design',
      description: 'Test project with figma link',
      status: 'active'
    }
    
    console.log('Creating project with data:', projectData)
    const newProject = await createProject(projectData)
    console.log('Created project:', newProject)
    
    // Get all projects to verify
    const projects = await getProjects()
    console.log('All projects:', projects.map(p => ({ 
      id: p.id, 
      name: p.name, 
      figma_link: p.figma_link 
    })))
    
    return NextResponse.json({ 
      success: true, 
      newProject, 
      allProjects: projects.map(p => ({ 
        id: p.id, 
        name: p.name, 
        figma_link: p.figma_link 
      }))
    })
      } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
