// Test environment variables loading
require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEON_DATABASE_URL:', process.env.NEON_DATABASE_URL ? '✅ SET' : '❌ NOT SET');

if (process.env.NEON_DATABASE_URL) {
  console.log('Database URL length:', process.env.NEON_DATABASE_URL.length);
  console.log('Database URL starts with:', process.env.NEON_DATABASE_URL.substring(0, 20) + '...');
} else {
  console.log('❌ Database URL is not set!');
  console.log('Please check your .env file');
}

// Test database connection
async function testConnection() {
  try {
    // Import neon directly to test connection
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    console.log('Testing direct database connection...');
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
