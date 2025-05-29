// Console test for email API - Copy and paste this into browser console

console.log('🧪 Starting Email API Test...')

// Test 1: Check connection
async function testEmailConnection() {
  console.log('\n1️⃣ Testing Email Connection...')
  try {
    const response = await fetch('/api/email', { method: 'GET' })
    const result = await response.json()
    
    console.log('Connection Response:', response.status, result)
    
    if (response.ok && result.connected) {
      console.log('✅ Email connection successful!')
      return true
    } else {
      console.log('❌ Email connection failed:', result.error)
      return false
    }
  } catch (error) {
    console.log('❌ Connection test error:', error)
    return false
  }
}

// Test 2: Send test email
async function testSendEmail() {
  console.log('\n2️⃣ Testing Email Sending...')
  try {
    const emailData = {
      type: 'custom',
      data: {
        subject: 'Test Email from Project Manager',
        html: '<h1>Test Email</h1><p>This is a test email from the project manager system.</p>',
        text: 'Test Email - This is a test email from the project manager system.'
      },
      recipients: 'test@example.com'
    }
    
    console.log('Sending email with data:', emailData)
    
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    })
    
    const result = await response.json()
    console.log('Send Response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Email sent successfully!')
      return true
    } else {
      console.log('❌ Email sending failed:', result.error, result.details)
      return false
    }
  } catch (error) {
    console.log('❌ Send email error:', error)
    return false
  }
}

// Run all tests
async function runAllEmailTests() {
  console.log('🚀 Running All Email Tests...')
  
  const connectionOk = await testEmailConnection()
  
  if (connectionOk) {
    await testSendEmail()
  } else {
    console.log('⏭️ Skipping send test due to connection failure')
  }
  
  console.log('\n✨ Email tests completed!')
}

// Auto-run the tests
runAllEmailTests()
