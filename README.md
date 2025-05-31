# Project Manager

A comprehensive project management application built with Next.js, featuring project tracking, account management, task management, feedback systems, and email communication capabilities.

## ✨ Features

### 🗂️ Project Management
- Create and manage multiple projects
- Track project status and progress
- Store project domains and Figma links
- Project-based organization

### 🔐 Account Management
- Secure credential storage for project accounts
- Password generation and management
- Email integration for sharing credentials
- Website and login information tracking

### ✅ Task Management
- Create and assign tasks to projects
- Task status tracking (pending, in progress, completed)
- Priority levels and due dates
- Progress monitoring

### 💬 Feedback System
- Client feedback collection and management
- Rating system (1-5 stars)
- Priority categorization
- Email notifications for new feedback

### 📧 Email Composer
- Professional email templates
- Variable substitution system
- Account credential sharing

### ⚙️ Settings & Customization
- Multi-language support (English/Vietnamese)
- Dark/Light theme switching
- Custom color schemes
- Notification preferences
- Data import/export functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Neon PostgreSQL database (free tier available)

### Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd project-manager
   npm install  # or pnpm install
   ```

2. **Environment setup:**
   ```bash
   # Windows (PowerShell)
   .\setup.ps1
   
   # Or manually:
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Get your Neon Database URL:**
   - Go to [neon.tech](https://neon.tech/)
   - Create a free account and project
   - Copy the connection string to `.env` as `NEON_DATABASE_URL`

4. **Start development:**
   ```bash
   npm run dev  # or pnpm dev
   ```

5. **Visit:** http://localhost:3000

## 🛠️ Environment Variables

### Required
- `NEON_DATABASE_URL` - Your Neon PostgreSQL connection string

### Optional (for enhanced features)
- Email service configuration (SendGrid, Mailgun, Resend, or SMTP)
- Security keys for production deployment
- External API keys (OpenAI, Google, etc.)

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration instructions.

## 📋 Tech Stack

- **Framework:** Next.js 15
- **Database:** Neon PostgreSQL with fallback to localStorage
- **UI:** React + Tailwind CSS + shadcn/ui components
- **Language:** TypeScript
- **State Management:** React hooks + Custom database hook
- **Styling:** Tailwind CSS with custom theme system
- **Icons:** Lucide React

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── account-manager.tsx
│   ├── dashboard-overview.tsx
│   ├── email-composer.tsx
│   └── ...
├── hooks/                # Custom React hooks
│   ├── use-database.ts   # Main database hook
│   ├── use-language.ts   # Internationalization
│   └── use-theme.ts      # Theme management
├── lib/                  # Utility libraries
│   ├── database.ts       # Database operations
│   ├── database-fallback.ts # localStorage fallback
│   └── utils.ts          # Utility functions
├── scripts/              # Utility scripts
└── public/               # Static assets
```

## 🔄 Data Persistence

The application supports two modes:

### 🗃️ Database Mode (Recommended)
- Uses Neon PostgreSQL for persistent storage
- Supports multiple users and devices
- Automatic data synchronization
- Production-ready scalability

### 💾 Fallback Mode (Development)
- Uses browser localStorage when database unavailable
- Single-user, single-device storage
- Good for development and testing
- Data persists only in current browser

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run check-env    # Check environment variables
npm run setup        # Check env + start dev server
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub/GitLab
2. Connect to Vercel
3. Add `NEON_DATABASE_URL` to environment variables
4. Deploy!

### Other Platforms
- Ensure Node.js 18+ support
- Set environment variables
- Run `npm run build` and `npm run start`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation:** [ENV_SETUP.md](./ENV_SETUP.md)
- 🐛 **Issues:** Create an issue on GitHub
- 💬 **Questions:** Check existing issues or create a new one

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icons
