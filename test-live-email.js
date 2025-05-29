// Final live email test - sends actual email via API
require('dotenv').config()

async function testLiveEmailSending() {
  console.log('🧪 Live Email Sending Test\n')
  
  const API_BASE = 'http://localhost:3000'
  
  try {
    // Test 1: Check API connection
    console.log('1️⃣ Testing API connection...')
    const connectionTest = await fetch(`${API_BASE}/api/email`)
    const connectionResult = await connectionTest.json()
    
    console.log('Connection result:', connectionResult)
    
    if (!connectionTest.ok || !connectionResult.connected) {
      console.log('❌ API connection failed')
      return
    }
    
    console.log('✅ API connection successful')
    
    // Test 2: Send actual test email
    console.log('\n2️⃣ Sending test email...')
    
    const emailData = {
      type: 'custom',
      data: {
        subject: 'Project Manager - Email System Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">🎉 Email System Test Successful!</h1>
            <p>This email confirms that the Project Manager email system is working correctly.</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3>System Status:</h3>
              <ul>
                <li>✅ SMTP Configuration: Working</li>
                <li>✅ Nodemailer Integration: Functional</li>
                <li>✅ API Endpoints: Operational</li>
                <li>✅ Email Templates: Available</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              Sent on: ${new Date().toLocaleString()}<br>
              From: Project Manager System
            </p>
          </div>
        `,
        text: `
Project Manager - Email System Test

This email confirms that the Project Manager email system is working correctly.

System Status:
- SMTP Configuration: Working
- Nodemailer Integration: Functional  
- API Endpoints: Operational
- Email Templates: Available

Sent on: ${new Date().toLocaleString()}
From: Project Manager System
        `
      },
      recipients: process.env.SMTP_FROM // Send to ourselves for testing
    }
    
    console.log(`Sending test email to: ${emailData.recipients}`)
    
    const emailResponse = await fetch(`${API_BASE}/api/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
    
    const emailResult = await emailResponse.json()
    
    console.log('Email response:', emailResponse.status, emailResult)
    
    if (emailResponse.ok) {
      console.log('✅ Test email sent successfully!')
      console.log('📧 Check your inbox at:', emailData.recipients)
    } else {
      console.log('❌ Email sending failed:', emailResult.error)
      if (emailResult.details) {
        console.log('Details:', emailResult.details)
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message)
  }
}

// Only run if called directly
if (require.main === module) {
  testLiveEmailSending()
}

module.exports = { testLiveEmailSending }
