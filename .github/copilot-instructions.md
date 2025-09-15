# Dragonccm Project Manager - AI Coding Agent Instructions

## Project Overview
This is a comprehensive project management application built with Next.js 15, featuring real-time collaboration, multi-database support, and advanced reporting capabilities.

## Core Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Primary MongoDB (Mongoose) with Neon PostgreSQL fallback
- **Real-time**: Socket.io for collaboration features
- **State Management**: Custom React hooks with API integration
- **Email**: Nodemailer with SMTP, SendGrid/Mailgun support
- **Reports**: jsPDF for PDF generation, custom report templates
- **Authentication**: Custom auth system with session management

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (REST + real-time)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard
├── components/            # Reusable UI components
├── features/              # Feature-specific components
│   ├── accounts/          # Account management
│   ├── dashboard/         # Dashboard components
│   ├── emails/            # Email functionality
│   ├── projects/          # Project management
│   ├── settings/          # Application settings
│   └── tasks/             # Task management
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── database.ts        # Database abstraction layer
│   ├── socket-server.ts   # Real-time server
│   └── email.ts           # Email utilities
└── types/                 # TypeScript definitions
```

## Critical Developer Workflows

### Environment Setup
1. **Database Configuration**: Requires `MONGODB_URI` for primary database, `NEON_DATABASE_URL` for fallback
2. **Email Setup**: Configure SMTP credentials in `.env` for email functionality
3. **Development Server**: Run `npm run dev:socket` to start both Next.js and Socket.io server
4. **Database Testing**: Use `/api/test-db` endpoint to verify database connectivity

### Development Commands
```bash
# Start development with Socket.io
npm run dev:socket

# Start Next.js only
npm run dev

# Check environment setup
npm run check-env

# Create sample tasks
npm run create-tasks

# Build for production
npm run build
```

## Key Architectural Patterns

### 1. Dual Database System
- **Primary**: MongoDB with Mongoose ODM
- **Fallback**: Neon PostgreSQL for serverless deployment
- **Abstraction**: `lib/database.ts` provides unified interface
- **Connection**: Server-side only, with connection pooling

### 2. API Layer Architecture
- **Routes**: `/app/api/[resource]/route.ts` pattern
- **Methods**: Standard REST operations (GET, POST, PUT, DELETE)
- **Error Handling**: Consistent error responses with status codes
- **Database Integration**: Direct database calls in route handlers

### 3. State Management Pattern
```typescript
// Custom hook pattern used throughout
export function useApi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // CRUD operations with optimistic updates
  const addItem = async (itemData) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    })
    const newItem = await response.json()
    setData(prev => [newItem, ...prev])
  }
}
```

### 4. Component Organization
- **Features**: Business logic components in `/features/`
- **UI Components**: Reusable components in `/components/`
- **Hooks**: Data fetching and state logic in `/hooks/`
- **Types**: Shared TypeScript interfaces in `/types/`

### 5. Real-time Collaboration
- **Socket.io**: Server in `lib/socket-server.ts`
- **Sessions**: In-memory session management (use Redis in production)
- **Events**: User presence, field locking, change history
- **Integration**: Real-time updates for report editing

## Project-Specific Conventions

### Database Schema Patterns
```typescript
// Mongoose schema with timestamps
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: String,
  figma_link: String,
  description: String,
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
})
```

### API Response Patterns
```typescript
// Consistent error handling
export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### Component Props Pattern
```typescript
interface ComponentProps {
  data: DataType[]
  onAdd: (item: CreateInput) => Promise<void>
  onEdit: (id: string, item: UpdateInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}
```

### Form Handling Pattern
```typescript
// React Hook Form with Zod validation
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

export function FormComponent() {
  const form = useForm({ resolver: zodResolver(schema) })
  // Form implementation
}
```

## Integration Points

### External Services
- **Email**: SMTP/Mailgun/SendGrid integration
- **Database**: MongoDB Atlas + Neon PostgreSQL
- **Analytics**: Vercel Analytics + Speed Insights
- **Deployment**: Vercel platform

### Cross-Component Communication
- **Props**: Parent-child data flow
- **Context**: Theme and auth providers
- **Hooks**: Shared state management
- **Events**: Socket.io for real-time updates

## Development Best Practices

### Code Organization
1. **Feature-first**: Group related components in feature directories
2. **Custom hooks**: Extract reusable logic into hooks
3. **Type safety**: Use TypeScript interfaces for all data structures
4. **Error boundaries**: Wrap components for graceful error handling

### Database Operations
1. **Server-side only**: Database operations in API routes
2. **Connection management**: Reuse connections, handle failures
3. **Validation**: Input validation before database operations
4. **Fallback handling**: Graceful degradation to offline mode

### Real-time Features
1. **Session management**: Track active users and sessions
2. **Conflict resolution**: Field locking for collaborative editing
3. **Change history**: Track modifications for audit trails
4. **Performance**: Optimize for concurrent users

## Common Patterns & Gotchas

### Database Connection
- Always check `isConnected` before operations
- Handle connection failures gracefully
- Use environment variables for configuration
- Test connections with `/api/test-db`

### State Synchronization
- Use optimistic updates for better UX
- Handle API errors with user feedback
- Refresh data after mutations
- Maintain consistency across components

### Real-time Updates
- Join/leave sessions properly
- Handle connection drops
- Validate user permissions
- Update UI state on socket events

### Form Validation
- Use Zod schemas for validation
- Provide user-friendly error messages
- Handle both client and server validation
- Support internationalization

## Key Files to Reference

### Architecture Understanding
- `lib/database.ts` - Database abstraction and models
- `hooks/use-api.ts` - Main data fetching hook
- `app/layout.tsx` - Application providers setup
- `lib/socket-server.ts` - Real-time server implementation

### Component Patterns
- `features/projects/project-form.tsx` - Complex form with CRUD
- `features/tasks/trello-tasks.tsx` - Drag-and-drop task management
- `components/ui/` - Reusable UI components

### API Patterns
- `app/api/projects/route.ts` - REST API implementation
- `app/api/test-db/route.ts` - Database connectivity testing

### Configuration
- `package.json` - Dependencies and scripts
- `.env.example` - Required environment variables
- `setup.ps1` - Development environment setup

## Testing & Debugging

### Database Debugging
```typescript
// Test database connection
const testResponse = await fetch('/api/test-db')
const testResult = await testResponse.json()
console.log('Database status:', testResult)
```

### API Debugging
```typescript
// Log API calls
console.log('API call:', endpoint, method, data)
// Check response status
if (!response.ok) {
  console.error('API error:', response.status, response.statusText)
}
```

### Real-time Debugging
```typescript
// Monitor socket events
socket.on('connect', () => console.log('Connected to server'))
socket.on('disconnect', () => console.log('Disconnected from server'))
socket.on('error', (error) => console.error('Socket error:', error))
```

Remember: This application uses a sophisticated dual-database architecture with real-time collaboration. Always test database operations thoroughly and handle connection failures gracefully. The feature-based organization makes it easy to locate related code, but requires understanding the data flow between components, hooks, and API routes.