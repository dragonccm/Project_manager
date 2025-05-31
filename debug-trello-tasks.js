// Debug script để kiểm tra TrelloTasks component
// Chạy trong browser console tại http://localhost:3000

console.log("🔍 DEBUG TRELLO TASKS COMPONENT");

// Kiểm tra dữ liệu tasks
console.log("1️⃣ Checking tasks data in React DevTools...");

// Hướng dẫn debug
console.log(`
📋 Debug Steps:
1. Open React DevTools (F12 -> Components tab)
2. Find "TrelloTasks" component in the tree
3. Check the "tasks" prop to see if data is passed correctly
4. Check selectedDate state
5. Check tasksByStatus state

🎯 Expected Data Structure:
- tasks should be array with items having:
  * id (string)
  * title (string) 
  * date (string)
  * status ("todo" | "in-progress" | "done")
  * completed (boolean)

⚠️ Common Issues:
- selectedDate not matching task dates
- Missing status field in tasks
- Date format mismatch (ISO vs other formats)
`);

// Kiểm tra nếu có React DevTools
setTimeout(() => {
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("✅ React DevTools detected");
    
    // Thử tìm TrelloTasks component
    const trelloComponent = document.querySelector('[data-testid="trello-tasks"], .trello-tasks, [class*="trello"]');
    if (trelloComponent) {
      console.log("✅ TrelloTasks component found in DOM");
    } else {
      console.log("❌ TrelloTasks component not found in DOM");
    }
  } else {
    console.log("❌ React DevTools not available");
  }
}, 500);

// Kiểm tra localStorage fallback
setTimeout(() => {
  console.log("2️⃣ Checking localStorage fallback...");
  
  const localTasks = localStorage.getItem('tasks');
  if (localTasks) {
    const tasks = JSON.parse(localTasks);
    console.log("📦 LocalStorage tasks:", tasks.length, tasks);
  } else {
    console.log("❌ No tasks in localStorage");
  }
  
  // Kiểm tra date format
  const today = new Date().toISOString().split("T")[0];
  console.log("📅 Today's date (ISO):", today);
  
}, 1000);

// Kiểm tra network requests
console.log("3️⃣ Monitor network requests for database calls...");
console.log("Check Network tab for API calls to /api/* endpoints");

// Kiểm tra console errors
console.log("4️⃣ Watch for console errors...");
console.log("Any React errors or database connection issues will appear in console");
