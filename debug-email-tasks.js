// Test script to debug EmailComposer tasks display
// Run this in browser console on http://localhost:3000

console.log("🔍 Debugging EmailComposer Tasks...");

// Test 1: Check if we're on the right page
console.log("Current URL:", window.location.href);

// Test 2: Click Email Composer in menu
setTimeout(() => {
  const emailButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('Email Composer') || 
    btn.textContent?.includes('emailComposer')
  );
  
  if (emailButton) {
    console.log("✅ Found Email Composer button");
    emailButton.click();
    
    // Wait for component to render
    setTimeout(() => {
      // Test 3: Check if EmailComposer component is rendered
      const emailComposer = document.querySelector('[data-testid="email-composer"]') || 
                           document.querySelector('h1').textContent.includes('Email Composer');
      
      if (emailComposer) {
        console.log("✅ EmailComposer component is rendered");
        
        // Test 4: Check email type selector
        const emailTypeSelect = document.querySelector('select') || 
                               document.querySelector('[role="combobox"]');
        
        if (emailTypeSelect) {
          console.log("✅ Email type selector found");
          
          // Test 5: Try to select task-related email type
          const taskCreatedOption = Array.from(document.querySelectorAll('option, [role="option"]'))
            .find(opt => opt.textContent?.includes('task') || opt.textContent?.includes('Task'));
          
          if (taskCreatedOption) {
            console.log("✅ Task email options found");
            console.log("Available options:", 
              Array.from(document.querySelectorAll('option, [role="option"]'))
                .map(opt => opt.textContent)
            );
          } else {
            console.log("❌ No task email options found");
          }
        } else {
          console.log("❌ Email type selector not found");
        }
      } else {
        console.log("❌ EmailComposer component not found");
      }
    }, 1000);
  } else {
    console.log("❌ Email Composer button not found");
    console.log("Available buttons:", 
      Array.from(document.querySelectorAll('button')).map(btn => btn.textContent)
    );
  }
}, 500);

// Test 6: Check if we can access React state (development mode)
setTimeout(() => {
  console.log("🔍 Checking for tasks data...");
  
  // Try to find any tasks data in the DOM
  const tasksElements = document.querySelectorAll('[data-testid*="task"], [id*="task"], .task');
  console.log("Found task-related elements:", tasksElements.length);
  
  // Check localStorage for any task data
  const localStorageKeys = Object.keys(localStorage);
  console.log("localStorage keys:", localStorageKeys);
  
  localStorageKeys.forEach(key => {
    if (key.toLowerCase().includes('task')) {
      console.log(`📦 ${key}:`, localStorage.getItem(key));
    }
  });
}, 2000);

console.log("🎯 Debug script loaded! Check results above...");
