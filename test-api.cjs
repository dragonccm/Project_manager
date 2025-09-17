// Simple API test script using Node.js built-in modules
const https = require('https');
const http = require('http');

// Test task creation
const testTaskCreation = () => {
  const taskData = JSON.stringify({
    title: "Test Task Creation",
    description: "Testing task creation functionality",
    status: "pending",
    priority: "medium"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/tasks',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yzc5N2UzNTBmNDdjZDc3YWExZmMyNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6Im5ndXllbm5nb2Nsb25nNTUxMUBnbWFpbC5jb20iLCJmdWxsX25hbWUiOiJkcmFnb25jY20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5MzA4NDgsImV4cCI6MTc1ODUzNTY0OH0.IOjcyeDc5RBAb0nJbHJFiruImNPYery_7rfr8ZnXng4',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(taskData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      
      // If task creation was successful, test task retrieval
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ Task creation successful! Now testing task retrieval...');
        testTaskRetrieval();
      } else {
        console.log('❌ Task creation failed');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });

  req.write(taskData);
  req.end();
  console.log('🚀 Testing task creation...');
};

// Test task retrieval
const testTaskRetrieval = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/tasks',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yzc5N2UzNTBmNDdjZDc3YWExZmMyNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6Im5ndXllbm5nb2Nsb25nNTUxMUBnbWFpbC5jb20iLCJmdWxsX25hbWUiOiJkcmFnb25jY20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5MzA4NDgsImV4cCI6MTc1ODUzNTY0OH0.IOjcyeDc5RBAb0nJbHJFiruImNPYery_7rfr8ZnXng4'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nGET Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('GET Response Body:', data);
      const tasks = JSON.parse(data);
      console.log(`\n📊 Retrieved ${tasks.length} tasks`);
      
      if (tasks.length > 0) {
        console.log('✅ SUCCESS: Task creation and retrieval working!');
        console.log('First task:', JSON.stringify(tasks[0], null, 2));
      } else {
        console.log('❌ WARNING: No tasks found after creation');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`GET request error: ${e.message}`);
  });

  req.end();
};

// Start the test
testTaskCreation();