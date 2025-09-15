import fetch from 'node-fetch'

const base = 'http://localhost:3000'

async function safeJson(res) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { raw: text } }
}

async function run() {
  // Health
  const health = await fetch(base + '/api/health')
  console.log('Health:', health.status, await safeJson(health))

  // Try login with default dev user, else register
  let token = null
  const username = 'devuser'
  const password = 'Devpass123!'
  const email = 'devuser@example.com'
  const full_name = 'Dev User'

  let res = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, remember_me: true })
  })
  let body = await safeJson(res)
  if (!res.ok) {
    console.log('Login failed, trying register...', res.status, body)
    res = await fetch(base + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, full_name })
    })
    body = await safeJson(res)
    console.log('Register:', res.status, body)
    // Try login again
    res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, remember_me: true })
    })
    body = await safeJson(res)
  }
  console.log('Login:', res.status)
  token = body?.token
  if (!token) throw new Error('No token from login')

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  // Create project
  res = await fetch(base + '/api/projects', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Smoke Test Project', description: 'Created by smoke test' })
  })
  body = await safeJson(res)
  console.log('Create project:', res.status, body?.id || body)
  if (!res.ok) throw new Error('Project create failed')
  const projectId = body.id

  // Create account
  res = await fetch(base + '/api/accounts', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ project_id: projectId, username: 'acctuser', password: 'P@ssw0rd!', website: 'https://example.com', email: 'acct@example.com' })
  })
  body = await safeJson(res)
  console.log('Create account:', res.status, body?.id || body)
  if (!res.ok) throw new Error('Account create failed')

  // Fetch lists
  res = await fetch(base + '/api/projects', { headers: authHeaders })
  body = await safeJson(res)
  console.log('Projects count:', Array.isArray(body) ? body.length : body)

  res = await fetch(base + '/api/accounts', { headers: authHeaders })
  body = await safeJson(res)
  console.log('Accounts count:', Array.isArray(body) ? body.length : body)
}

run().catch(err => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
