# API Documentation - Share & Password Recovery

## Share System API

### POST /api/share
Create a new share link for a resource.

**Request Body:**
```json
{
  "resourceType": "task" | "note" | "account" | "project",
  "resourceId": "string (MongoDB ObjectId)",
  "expiresIn": "24h" | "7d" | "30d" | "never",
  "createdBy": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "shareId": "string (MongoDB ObjectId)",
  "token": "string (UUID)",
  "shareUrl": "string (full URL)",
  "expiresAt": "string (ISO date) or null",
  "accessCount": 0
}
```

**Errors:**
- `400` - Invalid resource type or missing fields
- `500` - Server error

---

### GET /api/share/[token]
Retrieve shared content by token.

**URL Parameters:**
- `token` - UUID share token

**Response (200 OK):**
```json
{
  "success": true,
  "share": {
    "resourceType": "task",
    "expiresAt": "2025-01-14T10:00:00.000Z",
    "accessCount": 5,
    "createdAt": "2025-01-07T10:00:00.000Z",
    "sharedBy": "user@example.com"
  },
  "resource": {
    // Resource-specific fields
    // NOTE: Passwords are NEVER included for account resources
  }
}
```

**Errors:**
- `404` - Share not found
- `410` - Share expired
- `500` - Server error

---

### DELETE /api/share/[token]
Revoke a share link.

**URL Parameters:**
- `token` - UUID share token

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Share revoked successfully"
}
```

**Errors:**
- `404` - Share not found
- `500` - Server error

---

## Password Recovery API

### POST /api/auth/forgot-password
Request OTP for password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account with this email exists, an OTP code has been sent.",
  "expiresIn": 600
}
```

**Errors:**
- `400` - Invalid email format
- `429` - Rate limit exceeded (3 per hour)
- `500` - Server error

**Security Notes:**
- Returns same message for existing/non-existing emails (prevent enumeration)
- Rate limited by email address
- OTP expires in 10 minutes

---

### POST /api/auth/verify-otp
Verify OTP code and get reset token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "string (32-byte hex)",
  "expiresIn": 900
}
```

**Errors:**
- `400` - Invalid OTP format or max attempts exceeded
- `401` - Invalid OTP code (with `remainingAttempts` field)
- `404` - No valid OTP found
- `410` - OTP expired
- `429` - Rate limit exceeded (10 per 15 minutes)
- `500` - Server error

**Security Notes:**
- Maximum 5 verification attempts per OTP
- Rate limited by email address
- Reset token expires in 15 minutes

---

### POST /api/auth/reset-password
Reset password with verified token.

**Request Body:**
```json
{
  "resetToken": "string (from verify-otp)",
  "newPassword": "string (min 8 chars)",
  "confirmPassword": "string (must match)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

**Errors:**
- `400` - Password requirements not met or passwords don't match
- `401` - Invalid reset token
- `404` - User not found
- `410` - Reset token expired
- `500` - Server error

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Security Actions:**
- Invalidates all user sessions
- Deletes all OTPs for the user
- Deletes the one-time reset token
- Logs password reset in audit log

---

### POST /api/auth/change-password
Change password for authenticated user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "currentPassword": "string",
  "newPassword": "string (min 8 chars)",
  "confirmNewPassword": "string (must match)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` - Password requirements not met or passwords don't match or new password same as current
- `401` - Current password incorrect
- `404` - User not found
- `500` - Server error

**Security Actions:**
- Verifies current password with bcrypt
- Validates new password complexity
- Invalidates other sessions (keeps current)
- Logs password change in audit log

---

## Database Models

### Share Model
```typescript
{
  token: string (UUID, unique, indexed)
  resourceType: "task" | "note" | "account" | "project"
  resourceId: ObjectId (indexed)
  createdBy?: string
  expiresAt?: Date (TTL indexed for auto-deletion)
  accessCount: number (default: 0)
  lastAccessedAt?: Date
  metadata?: any
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `token: 1` (unique)
- `resourceType: 1, resourceId: 1` (compound)
- `expiresAt: 1` (TTL, expireAfterSeconds: 0)

---

### OTP Model
```typescript
{
  email: string (lowercase, indexed)
  code: string (bcrypt hashed)
  expiresAt: Date (TTL indexed)
  attempts: number (default: 0, max: 5)
  maxAttempts: number (default: 5)
  verified: boolean (default: false)
  usedAt?: Date
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `email: 1`
- `email: 1, verified: 1` (compound)
- `expiresAt: 1` (TTL, expireAfterSeconds: 0)

---

## Rate Limiting

### Current Implementation (In-Memory)
```typescript
// Forgot Password: 3 requests per hour per email
// Verify OTP: 10 attempts per 15 minutes per email
```

### Production Recommendation (Redis)
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function checkRateLimit(key: string, limit: number, window: number) {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, window)
  }
  return count <= limit
}
```

---

## Email Templates

### OTP Email (HTML)
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Password Reset Request</h2>
  <p>Your OTP code is:</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
    123456
  </div>
  <p>This code expires in <strong>10 minutes</strong>.</p>
</div>
```

---

## Testing with cURL

### Create Share Link
```bash
curl -X POST http://localhost:3000/api/share \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "task",
    "resourceId": "60d5ec49f1b2c8b1f8e4e1a1",
    "expiresIn": "7d"
  }'
```

### Get Shared Content
```bash
curl http://localhost:3000/api/share/550e8400-e29b-41d4-a716-446655440000
```

### Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

---

## Error Handling

All API routes return consistent error responses:

```json
{
  "error": "Error message here",
  "remainingAttempts": 3,  // Optional, for OTP verification
  "remainingTime": 45      // Optional, for rate limiting (minutes)
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `410` - Gone (expired resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
