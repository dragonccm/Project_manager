// Test environment variables and email configuration
// Run this in terminal: node test-env-check.js

// Load environment variables from .env file
require('dotenv').config()

console.log('🧪 Checking Email Environment Configuration...\n')

// Check for required environment variables
const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']

console.log('📋 Environment Variables Check:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    if (varName.includes('PASS')) {
      console.log(`✅ ${varName}: ${'*'.repeat(value.length)} (hidden)`)
    } else if (varName === 'SMTP_USER') {
      console.log(`✅ ${varName}: ${value.replace(/(.{3}).*(@.*)/, '$1***$2')}`)
    } else {
      console.log(`✅ ${varName}: ${value}`)
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

console.log('\n🔧 Testing nodemailer import...')
try {
  const nodemailer = require('nodemailer')
  console.log('✅ nodemailer imported successfully')
  
  // Test transporter creation with current config
  console.log('\n⚙️ Testing transporter creation...')
  const config = {
    host: process.env.SMTP_HOST || 'smtp.mailersend.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Cannot create transporter: SMTP credentials not set')
  } else {
    try {
      const transporter = nodemailer.createTransport(config)
      console.log('✅ Transporter created successfully')
      
      // Test connection
      console.log('\n🌐 Testing SMTP connection...')
      transporter.verify((error, success) => {
        if (error) {
          console.log('❌ SMTP connection failed:', error.message)
        } else {
          console.log('✅ SMTP connection successful!')
        }
      })
    } catch (error) {
      console.log('❌ Failed to create transporter:', error.message)
    }
  }
} catch (error) {
  console.log('❌ Failed to import nodemailer:', error.message)
}

console.log('\n📝 Next Steps:')
console.log('1. Ensure all environment variables are set in .env file')
console.log('2. Verify SMTP credentials with your email provider')
console.log('3. Test the API endpoint at http://localhost:3002/api/email')
console.log('4. Use the browser console test script for frontend testing')
