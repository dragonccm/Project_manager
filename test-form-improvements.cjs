// Test script to verify the improved Code Components form functionality
console.log("🧪 Testing improved Code Components form...");

const fs = require('fs');
const path = require('path');

// Check if sample JSON files exist
const sampleFiles = [
  'sample-component.json',
  'sample-button.json'
];

console.log("📁 Checking sample files...");
sampleFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      console.log(`✅ ${file}: Valid JSON structure`);
      console.log(`   - Name: ${json.name}`);
      console.log(`   - Category: ${json.category}`);
      console.log(`   - Tags: ${json.tags.join(', ')}`);
      console.log(`   - Has code_json: ${!!json.code_json}`);
      console.log(`   - Has elementor_data: ${!!json.elementor_data}`);
    } catch (error) {
      console.log(`❌ ${file}: Invalid JSON - ${error.message}`);
    }
  } else {
    console.log(`❌ ${file}: File not found`);
  }
});

// Check component file structure
const componentFile = path.join(__dirname, 'components', 'code-component-manager.tsx');
if (fs.existsSync(componentFile)) {
  const content = fs.readFileSync(componentFile, 'utf8');
  
  console.log("\n🔧 Checking form improvements...");
  
  // Check for wide dialog
  if (content.includes('max-w-6xl')) {
    console.log("✅ Wide dialog layout implemented");
  } else {
    console.log("❌ Wide dialog layout missing");
  }
  
  // Check for Vietnamese interface
  if (content.includes('Tải file JSON')) {
    console.log("✅ Vietnamese interface implemented");
  } else {
    console.log("❌ Vietnamese interface missing");
  }
  
  // Check for file upload functionality
  if (content.includes('input type="file"') && content.includes('accept=".json"')) {
    console.log("✅ File upload functionality present");
  } else {
    console.log("❌ File upload functionality missing");
  }
  
  // Check for grid layout
  if (content.includes('grid-cols-4') && content.includes('grid-cols-2')) {
    console.log("✅ Improved grid layout implemented");
  } else {
    console.log("❌ Improved grid layout missing");
  }
  
  // Check for copy functionality
  if (content.includes('navigator.clipboard.writeText')) {
    console.log("✅ Copy-to-clipboard functionality present");
  } else {
    console.log("❌ Copy-to-clipboard functionality missing");
  }
  
} else {
  console.log("❌ Component file not found");
}

console.log("\n✅ Form improvement test completed!");
console.log("🌐 Open http://localhost:3001 to test the UI");
console.log("📱 Navigate to Code Components to see the improved form");
console.log("📂 Use sample-component.json or sample-button.json to test file upload");
