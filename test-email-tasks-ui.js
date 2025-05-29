// Test để kiểm tra tasks trong EmailComposer
// Chạy script này trong browser console tại http://localhost:3000

console.log("🧪 Testing EmailComposer Tasks Display...");

// Bước 1: Điều hướng đến Daily Tasks để tạo task
function goToDailyTasks() {
  console.log("1️⃣ Điều hướng đến Daily Tasks...");
  const dailyTasksBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Daily Tasks') || btn.textContent?.includes('dailyTasks')
  );
  
  if (dailyTasksBtn) {
    dailyTasksBtn.click();
    console.log("✅ Clicked Daily Tasks button");
    return true;
  } else {
    console.log("❌ Daily Tasks button not found");
    console.log("Available buttons:", Array.from(document.querySelectorAll('button')).map(btn => btn.textContent));
    return false;
  }
}

// Bước 2: Điều hướng đến Email Composer
function goToEmailComposer() {
  console.log("2️⃣ Điều hướng đến Email Composer...");
  const emailBtn = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Email Composer') || btn.textContent?.includes('emailComposer')
  );
  
  if (emailBtn) {
    emailBtn.click();
    console.log("✅ Clicked Email Composer button");
    return true;
  } else {
    console.log("❌ Email Composer button not found");
    return false;
  }
}

// Bước 3: Kiểm tra console logs từ EmailComposer
function checkConsoleLogs() {
  console.log("3️⃣ Kiểm tra console logs từ EmailComposer...");
  console.log("📝 Mở Developer Console (F12) để xem logs từ EmailComposer component");
}

// Bước 4: Kiểm tra UI hiển thị tasks
function checkTasksInUI() {
  console.log("4️⃣ Kiểm tra UI hiển thị tasks...");
  
  setTimeout(() => {
    // Tìm email type selector
    const emailTypeSelector = document.querySelector('select, [role="combobox"]');
    if (emailTypeSelector) {
      console.log("✅ Email type selector found");
      
      // Click để mở dropdown
      emailTypeSelector.click();
      
      setTimeout(() => {
        // Tìm option "Thông báo task mới"
        const taskOption = Array.from(document.querySelectorAll('option, [role="option"]')).find(opt => 
          opt.textContent?.includes('task') || opt.textContent?.includes('Task') || opt.textContent?.includes('Thông báo')
        );
        
        if (taskOption) {
          console.log("✅ Task email option found:", taskOption.textContent);
          taskOption.click();
          
          setTimeout(() => {
            // Kiểm tra xem có task selector hiện ra không
            const taskSelector = Array.from(document.querySelectorAll('select, [role="combobox"]')).find(sel => 
              sel.getAttribute('placeholder')?.includes('task') || 
              sel.previousElementSibling?.textContent?.includes('Task')
            );
            
            if (taskSelector) {
              console.log("✅ Task selector appeared");
              
              // Kiểm tra label để xem có hiển thị số lượng tasks không
              const label = taskSelector.previousElementSibling;
              if (label && label.textContent) {
                console.log("📊 Task selector label:", label.textContent);
                
                // Extract số lượng tasks từ label
                const match = label.textContent.match(/\((\d+) task/);
                if (match) {
                  const taskCount = parseInt(match[1]);
                  console.log(`📈 Found ${taskCount} tasks`);
                  
                  if (taskCount === 0) {
                    console.log("⚠️ No tasks found. Need to create tasks first!");
                    console.log("💡 Go to Daily Tasks and create some tasks, then return to Email Composer");
                  } else {
                    console.log("🎉 Tasks are available for email composition!");
                  }
                } else {
                  console.log("❓ Could not determine task count from label");
                }
              }
            } else {
              console.log("❌ Task selector did not appear");
            }
          }, 500);
        } else {
          console.log("❌ Task email option not found");
          console.log("Available options:", Array.from(document.querySelectorAll('option, [role="option"]')).map(opt => opt.textContent));
        }
      }, 500);
    } else {
      console.log("❌ Email type selector not found");
    }
  }, 1000);
}

// Chạy test tự động
console.log("🚀 Starting automated test...");

// Đầu tiên check Daily Tasks
if (goToDailyTasks()) {
  setTimeout(() => {
    // Sau đó chuyển đến Email Composer
    if (goToEmailComposer()) {
      checkConsoleLogs();
      checkTasksInUI();
    }
  }, 1000);
}

// Hướng dẫn thủ công
console.log(`
📋 Manual Testing Steps:
1. Tạo một vài tasks trong "Daily Tasks"
2. Chuyển đến "Email Composer" 
3. Chọn "Thông báo task mới" trong dropdown "Loại Email"
4. Kiểm tra xem có hiển thị "Chọn Task (X task có sẵn)" không
5. Nếu không có tasks, sẽ hiển thị thông báo "Không có task nào"
`);
