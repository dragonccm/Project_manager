// Test task creation via fetch
async function testTaskCreation() {
  try {
    const taskData = {
      title: 'Test Task - Font Fix',
      description: 'Testing task creation after database fixes',
      status: 'To Do',
      priority: 'High',
      project_id: '',
      assigned_to: '',
      estimated_time: '2h',
      actual_time: '',
      completed: false
    };
    
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yzc5N2UzNTBmNDdjZDc3YWExZmMyNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6Im5ndXllbm5nb2Nsb25nNTUxMUBnbWFpbC5jb20iLCJmdWxsX25hbWUiOiJkcmFnb25jY20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5MzA4NDgsImV4cCI6MTc1ODUzNTY0OH0.IOjcyeDc5RBAb0nJbHJFiruImNPYery_7rfr8ZnXng4'
      },
      body: JSON.stringify(taskData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Task created successfully:', result);
    } else {
      console.error('Task creation failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testTaskCreation();