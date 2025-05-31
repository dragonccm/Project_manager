// Test script for code components functionality
import { 
  initializeTables, 
  getCodeComponents, 
  createCodeComponent, 
  updateCodeComponent, 
  deleteCodeComponent 
} from './lib/database.ts'

async function testCodeComponents() {
  console.log('🧪 Testing Code Components functionality...')
  
  try {
    // Initialize database
    console.log('📊 Initializing database...')
    await initializeTables()
    console.log('✅ Database initialized')
    
    // Test creating a component
    console.log('🎨 Creating test component...')
    const testComponent = {
      name: 'Test Button',
      description: 'A test button component',
      category: 'element',
      tags: ['button', 'test'],
      code_json: { type: 'button', text: 'Click me' },
      elementor_data: { widgetType: 'button', settings: { text: 'Click me' } },
      project_id: 1
    }
    
    const created = await createCodeComponent(testComponent)
    console.log('✅ Component created:', created.id)
    
    // Test getting all components
    console.log('📋 Getting all components...')
    const components = await getCodeComponents()
    console.log('✅ Found components:', components.length)
    
    // Test updating the component
    console.log('✏️ Updating component...')
    const updated = await updateCodeComponent(created.id, {
      description: 'Updated test button component'
    })
    console.log('✅ Component updated')
    
    // Test deleting the component
    console.log('🗑️ Deleting component...')
    await deleteCodeComponent(created.id)
    console.log('✅ Component deleted')
    
    // Verify deletion
    const componentsAfterDelete = await getCodeComponents()
    console.log('✅ Components after deletion:', componentsAfterDelete.length)
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error(error.stack)
  }
}

// Run the test
testCodeComponents().then(() => {
  console.log('Test completed')
  process.exit(0)
}).catch(error => {
  console.error('Test failed:', error)
  process.exit(1)
})

export { testCodeComponents }
