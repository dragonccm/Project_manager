// Script tạo tasks mẫu để test EmailComposer
// Chạy trong browser console tại http://localhost:3000

console.log("🛠️ Creating sample tasks for EmailComposer testing...");

async function createSampleTasks() {
  try {
    // Bước 1: Điều hướng đến Daily Tasks
    console.log("1️⃣ Navigating to Daily Tasks...");
    const dailyTasksBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Daily Tasks') || btn.textContent?.includes('dailyTasks')
    );
    
    if (!dailyTasksBtn) {
      console.log("❌ Daily Tasks button not found");
      return;
    }
    
    dailyTasksBtn.click();
    console.log("✅ Clicked Daily Tasks");
    
    // Đợi component load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Bước 2: Tìm form tạo task
    console.log("2️⃣ Looking for task creation form...");
    
    const titleInput = document.querySelector('input[placeholder*="task" i], input[placeholder*="tiêu đề" i], #title, [name="title"]');
    const descInput = document.querySelector('textarea[placeholder*="description" i], textarea[placeholder*="mô tả" i], #description, [name="description"]');
    const addButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Add') || btn.textContent?.includes('Thêm') || btn.textContent?.includes('Tạo')
    );
    
    if (!titleInput || !addButton) {
      console.log("❌ Task form not found");
      console.log("Available inputs:", document.querySelectorAll('input'));
      console.log("Available buttons:", Array.from(document.querySelectorAll('button')).map(btn => btn.textContent));
      return;
    }
    
    console.log("✅ Found task form elements");
    
    // Bước 3: Tạo tasks mẫu
    const sampleTasks = [
      {
        title: "Email Test Task 1",
        description: "Task để test email notification system"
      },
      {
        title: "Email Test Task 2", 
        description: "Task thứ hai để test EmailComposer"
      },
      {
        title: "Email Test Task 3",
        description: "Task thứ ba với priority cao"
      }
    ];
    
    console.log("3️⃣ Creating sample tasks...");
    
    for (let i = 0; i < sampleTasks.length; i++) {
      const task = sampleTasks[i];
      console.log(`Creating task ${i + 1}: ${task.title}`);
      
      // Clear và điền title
      titleInput.value = '';
      titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      titleInput.value = task.title;
      titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Clear và điền description nếu có
      if (descInput) {
        descInput.value = '';
        descInput.dispatchEvent(new Event('change', { bubbles: true }));
        descInput.value = task.description;
        descInput.dispatchEvent(new Event('change', { bubbles: true }));
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Click Add button
      addButton.click();
      
      // Đợi một chút trước khi tạo task tiếp theo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`✅ Created: ${task.title}`);
    }
    
    console.log("4️⃣ Tasks created successfully!");
    
    // Bước 4: Điều hướng đến Email Composer để test
    console.log("5️⃣ Navigating to Email Composer to test...");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailBtn = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Email Composer') || btn.textContent?.includes('emailComposer')
    );
    
    if (emailBtn) {
      emailBtn.click();
      console.log("✅ Switched to Email Composer");
      
      // Hướng dẫn test
      console.log(`
🎯 Now test the EmailComposer:
1. Select "Thông báo task mới" from "Loại Email" dropdown
2. You should see "Chọn Task (3 task có sẵn)" 
3. Click on the task selector to see the 3 sample tasks
4. Select a task and compose an email

📊 Sample tasks created:
- Email Test Task 1
- Email Test Task 2  
- Email Test Task 3
      `);
    } else {
      console.log("❌ Email Composer button not found");
    }
    
  } catch (error) {
    console.error("❌ Error creating sample tasks:", error);
  }
}

// Chạy script
createSampleTasks();

console.log("🚀 Sample task creation script started...");
