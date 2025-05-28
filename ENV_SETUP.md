# Project Manager - Environment Variables Setup

## Required Environment Variables

### 1. Database Configuration (REQUIRED)

```bash
NEON_DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

**How to get Neon Database URL:**
1. Go to [Neon.tech](https://neon.tech/)
2. Create a free account
3. Create a new project
4. Go to Dashboard → Connection String
5. Copy the connection string and paste it as `NEON_DATABASE_URL`

### 2. Email Configuration (Optional)

The app currently uses `mailto:` links for basic email functionality, but you can enhance it with proper email services:

#### Option A: SMTP (Gmail example)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

#### Option B: Email Service APIs

**SendGrid:**
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

**Mailgun:**
```bash
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
```

**Resend:**
```bash
RESEND_API_KEY=re_your_resend_api_key
```

### 3. Security (Optional but recommended for production)

```bash
NEXTAUTH_SECRET=your-nextauth-secret-here
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here
```

## Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the required values in `.env`:
   - **REQUIRED:** `NEON_DATABASE_URL` 
   - **Optional:** Email service configuration
   - **Optional:** Security keys for production

3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Features That Require Environment Variables

### Database Features (NEON_DATABASE_URL required):
- Project management with persistent storage
- Account credentials storage
- Task management
- Feedback system
- Report templates
- Email templates
- User settings sync

### Email Features (Optional):
- Enhanced email sending through SMTP/API services
- Automated email notifications
- Professional email templates

## Fallback Behavior

If `NEON_DATABASE_URL` is not configured, the app will automatically fall back to localStorage for data persistence. This is suitable for:
- Development and testing
- Single-user scenarios
- Offline usage

However, localStorage data is browser-specific and will be lost if you clear browser data.

## Environment Files

- `.env` - Your actual environment variables (not committed to git)
- `.env.example` - Template with example values (committed to git)
- `.env.local` - Next.js local environment file (alternative to .env)

## Security Notes

1. Never commit `.env` files to version control
2. Use strong, unique secrets for production
3. Rotate API keys regularly
4. Use environment-specific configurations for different deployment stages

## Getting API Keys

### Neon Database (Required)
- Website: https://neon.tech/
- Free tier: 10GB storage, 100 hours compute time
- Setup time: ~5 minutes

### Email Services (Optional)
- **SendGrid**: https://sendgrid.com/ (100 emails/day free)
- **Mailgun**: https://mailgun.com/ (5,000 emails/month free)  
- **Resend**: https://resend.com/ (3,000 emails/month free)
- **Gmail SMTP**: Enable 2FA + App Password

## Troubleshooting

### Database Connection Issues
- Check if NEON_DATABASE_URL is correctly formatted
- Ensure your Neon database is active (not paused)
- Verify network connectivity

### Email Issues
- Check SMTP credentials and server settings
- Verify API keys are valid and have proper permissions
- Test with a simple email first

### Environment Variable Issues
- Restart your development server after changing .env
- Check for typos in variable names
- Ensure no trailing spaces in values
