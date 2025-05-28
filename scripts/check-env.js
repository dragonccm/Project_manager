#!/usr/bin/env node

/**
 * Environment Variables Checker Script
 * Checks if all required environment variables are set and provides guidance
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

// Required and optional environment variables
const envConfig = {
  required: {
    NEON_DATABASE_URL: {
      description: 'Neon PostgreSQL database connection string',
      example: 'postgresql://username:password@host.neon.tech/dbname?sslmode=require',
      link: 'https://neon.tech/',
    }
  },
  optional: {
    // Email Services
    SENDGRID_API_KEY: {
      description: 'SendGrid API key for email services',
      example: 'SG.your_sendgrid_api_key',
      link: 'https://sendgrid.com/',
    },
    MAILGUN_API_KEY: {
      description: 'Mailgun API key for email services',
      example: 'your_mailgun_api_key',
      link: 'https://mailgun.com/',
    },
    RESEND_API_KEY: {
      description: 'Resend API key for email services',
      example: 're_your_resend_api_key',
      link: 'https://resend.com/',
    },
    // SMTP Configuration
    SMTP_HOST: {
      description: 'SMTP server hostname',
      example: 'smtp.gmail.com',
    },
    SMTP_PORT: {
      description: 'SMTP server port',
      example: '587',
    },
    SMTP_USER: {
      description: 'SMTP username/email',
      example: 'your-email@gmail.com',
    },
    SMTP_PASS: {
      description: 'SMTP password/app password',
      example: 'your-app-password',
    },
    SMTP_FROM: {
      description: 'Default from email address',
      example: 'your-email@gmail.com',
    },
    // Security
    NEXTAUTH_SECRET: {
      description: 'NextAuth secret for session encryption',
      example: 'your-nextauth-secret-here',
    },
    JWT_SECRET: {
      description: 'JWT secret for token signing',
      example: 'your-jwt-secret-here',
    },
    ENCRYPTION_KEY: {
      description: 'Encryption key for sensitive data',
      example: 'your-encryption-key-here',
    },
    // External APIs
    OPENAI_API_KEY: {
      description: 'OpenAI API key for AI features',
      example: 'sk-your_openai_api_key',
      link: 'https://platform.openai.com/',
    },
    GOOGLE_API_KEY: {
      description: 'Google API key for Google services',
      example: 'your_google_api_key',
      link: 'https://console.developers.google.com/',
    },
  }
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  log('\n🔍 Environment Variables Checker', 'cyan');
  log('=====================================', 'cyan');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    log('\n❌ .env file not found!', 'red');
    
    if (fs.existsSync(envExamplePath)) {
      log('\n💡 Quick fix:', 'yellow');
      log('Copy .env.example to .env:', 'white');
      log('  cp .env.example .env', 'green');
    } else {
      log('\n💡 Create a .env file with the required variables.', 'yellow');
    }
    
    log('\nSee ENV_SETUP.md for detailed instructions.', 'blue');
    return false;
  }
  
  // Load environment variables
  require('dotenv').config();
  
  log('\n✅ .env file found', 'green');
  
  // Check required variables
  log('\n📋 Required Variables:', 'bright');
  let allRequiredSet = true;
  
  for (const [key, config] of Object.entries(envConfig.required)) {
    const value = process.env[key];
    if (value && value.trim()) {
      log(`  ✅ ${key}`, 'green');
    } else {
      log(`  ❌ ${key} - MISSING`, 'red');
      log(`     ${config.description}`, 'white');
      log(`     Example: ${config.example}`, 'yellow');
      if (config.link) {
        log(`     Get it from: ${config.link}`, 'blue');
      }
      allRequiredSet = false;
    }
  }
  
  // Check optional variables
  log('\n📋 Optional Variables:', 'bright');
  let optionalCount = 0;
  
  for (const [key, config] of Object.entries(envConfig.optional)) {
    const value = process.env[key];
    if (value && value.trim()) {
      log(`  ✅ ${key}`, 'green');
      optionalCount++;
    } else {
      log(`  ⚪ ${key} - Not set`, 'yellow');
    }
  }
  
  // Summary
  log('\n📊 Summary:', 'bright');
  if (allRequiredSet) {
    log('  ✅ All required variables are set', 'green');
    log('  🚀 Your app should work with database functionality', 'green');
  } else {
    log('  ❌ Some required variables are missing', 'red');
    log('  ⚠️  App will fall back to localStorage mode', 'yellow');
  }
  
  log(`  📧 Optional email features: ${optionalCount > 0 ? 'Some configured' : 'Not configured'}`, optionalCount > 0 ? 'green' : 'yellow');
  
  // Next steps
  log('\n🚀 Next Steps:', 'bright');
  if (!allRequiredSet) {
    log('  1. Set up your Neon database: https://neon.tech/', 'blue');
    log('  2. Copy the connection string to NEON_DATABASE_URL in .env', 'blue');
    log('  3. Restart your development server', 'blue');
  } else {
    log('  1. Run: npm run dev (or pnpm dev)', 'blue');
    log('  2. Visit: http://localhost:3000', 'blue');
    log('  3. Check database status in the app', 'blue');
  }
  
  if (optionalCount === 0) {
    log('  4. Consider setting up email services for enhanced functionality', 'blue');
  }
  
  log('\n📖 For detailed setup instructions, see: ENV_SETUP.md', 'cyan');
  
  return allRequiredSet;
}

// Install dotenv if not available
try {
  require('dotenv');
} catch (e) {
  log('Installing dotenv...', 'yellow');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
}

// Run the checker
checkEnvFile();
