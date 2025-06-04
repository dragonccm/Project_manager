// Script to create sample data for testing the Accounts & Projects Grid

const sampleProjects = [
  {
    name: "Website Công ty ABC",
    domain: "abc-company.com",
    description: "Thiết kế và phát triển website cho công ty ABC",
    status: "active",
    figma_link: "https://figma.com/abc-design"
  },
  {
    name: "E-commerce Platform",
    domain: "shop-online.vn", 
    description: "Nền tảng thương mại điện tử cho SME",
    status: "active",
    figma_link: "https://figma.com/ecommerce-design"
  },
  {
    name: "Mobile App Design",
    domain: "mobileapp.io",
    description: "Thiết kế giao diện ứng dụng di động",
    status: "completed",
    figma_link: "https://figma.com/mobile-design"
  },
  {
    name: "Dashboard Analytics",
    domain: "analytics-pro.com",
    description: "Dashboard phân tích dữ liệu cho doanh nghiệp",
    status: "active",
    figma_link: "https://figma.com/dashboard-design"
  }
];

const sampleAccounts = [
  {
    project_id: 1,
    username: "admin_abc",
    password: "SecurePass123!",
    email: "admin@abc-company.com",
    website: "https://abc-company.com/admin",
    notes: "Tài khoản admin chính của website ABC"
  },
  {
    project_id: 1,
    username: "editor_abc", 
    password: "Editor2024#",
    email: "editor@abc-company.com",
    website: "https://abc-company.com/wp-admin",
    notes: "Tài khoản biên tập viên"
  },
  {
    project_id: 2,
    username: "shop_admin",
    password: "ShopSecure456$",
    email: "admin@shop-online.vn",
    website: "https://shop-online.vn/admin",
    notes: "Tài khoản quản trị cửa hàng online"
  },
  {
    project_id: 3,
    username: "mobile_dev",
    password: "MobileDev789%",
    email: "dev@mobileapp.io", 
    website: "https://mobileapp.io/portal",
    notes: "Tài khoản phát triển mobile app"
  },
  {
    project_id: 4,
    username: "analytics_user",
    password: "Analytics321@",
    email: "user@analytics-pro.com",
    website: "https://analytics-pro.com/dashboard", 
    notes: "Tài khoản truy cập dashboard analytics"
  }
];

// Function to create sample data via API calls
async function createSampleData() {
  try {
    console.log("Creating sample projects...");
    
    // Create projects first
    for (const project of sampleProjects) {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });
      
      if (response.ok) {
        const created = await response.json();
        console.log(`Created project: ${created.name}`);
      } else {
        console.error(`Failed to create project: ${project.name}`);
      }
    }
    
    console.log("Creating sample accounts...");
    
    // Create accounts
    for (const account of sampleAccounts) {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(account)
      });
      
      if (response.ok) {
        const created = await response.json();
        console.log(`Created account: ${created.username}`);
      } else {
        console.error(`Failed to create account: ${account.username}`);
      }
    }
    
    console.log("Sample data creation completed!");
    
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
}

// Export for use in browser console or other scripts
if (typeof window !== 'undefined') {
  window.createSampleData = createSampleData;
} else {
  module.exports = { createSampleData, sampleProjects, sampleAccounts };
}
