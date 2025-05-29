// Test Email Service
// This script tests the email service functionality

const { EmailService } = require('./lib/email.ts');

async function testEmailService() {
  console.log('🧪 Testing Email Service...');
  
  try {
    // Test transporter creation
    console.log('✅ Creating email service...');
    const emailService = new EmailService();
    
    console.log('✅ Email service created successfully!');
    console.log('📧 SMTP Configuration:');
    console.log('- Host:', process.env.SMTP_HOST);
    console.log('- Port:', process.env.SMTP_PORT);
    console.log('- User:', process.env.SMTP_USER ? '✅ Configured' : '❌ Not configured');
    console.log('- Pass:', process.env.SMTP_PASS ? '✅ Configured' : '❌ Not configured');
    console.log('- From:', process.env.SMTP_FROM);
    
    // Test email sending (uncomment to actually send)
    /*
    await emailService.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from Project Manager',
      html: '<h1>Hello from Project Manager!</h1><p>This is a test email.</p>',
      text: 'Hello from Project Manager! This is a test email.'
    });
    console.log('✅ Test email sent successfully!');
    */
    
    console.log('🎉 Email service test completed successfully!');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

// Load environment variables
require('dotenv').config();

testEmailService();
