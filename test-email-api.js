// Test email API endpoint
async function testEmailAPI() {
  console.log('🧪 Testing Email API...')
  
  try {
    // Test connection first
    console.log('1️⃣ Testing connection...')
    const connectionResponse = await fetch('/api/email', {
      method: 'GET'
    })
    
    const connectionResult = await connectionResponse.json()
    console.log('Connection result:', connectionResult)
    
    if (!connectionResponse.ok) {
      console.error('❌ Connection test failed:', connectionResult.error)
      return
    }
    
    if (!connectionResult.connected) {
      console.error('❌ Email service not connected')
      return
    }
    
    console.log('✅ Connection test passed')
    
    // Test sending email
    console.log('2️⃣ Testing email sending...')
    const emailData = {
      type: 'custom',
      data: {
        subject: 'Test Email from Project Manager',
        html: '<h1>Test Email</h1><p>This is a test email from the project manager system.</p>',
        text: 'Test Email - This is a test email from the project manager system.'
      },
      recipients: 'test@example.com' // Change this to a real email for testing
    }
    
    const emailResponse = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
    
    const emailResult = await emailResponse.json()
    console.log('Email result:', emailResult)
    
    if (!emailResponse.ok) {
      console.error('❌ Email sending failed:', emailResult.error, emailResult.details)
      return
    }
    
    console.log('✅ Email sent successfully!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testEmailAPI()
