// Socket.IO server initialization for Next.js
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

interface CollaborationUser {
  id: string
  name: string
  color: string
  cursor: { x: number, y: number }
  lastSeen: Date
  reportId: string
}

interface ReportSession {
  reportId: string
  users: Map<string, CollaborationUser>
  fieldLocks: Map<string, string> // fieldId -> userId
  changeHistory: Array<{
    userId: string
    timestamp: string
    action: string
    fieldId: string
    changes: any
  }>
}

// In-memory storage for active sessions (in production, use Redis or similar)
const activeSessions = new Map<string, ReportSession>()

const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
  '#00D2D3', '#FF9F43', '#EE5A6F', '#0ABDE3'
]

function generateUserColor(userId: string): string {
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  return userColors[Math.abs(hash) % userColors.length]
}

function getOrCreateSession(reportId: string): ReportSession {
  if (!activeSessions.has(reportId)) {
    activeSessions.set(reportId, {
      reportId,
      users: new Map(),
      fieldLocks: new Map(),
      changeHistory: []
    })
  }
  return activeSessions.get(reportId)!
}

export function initializeSocketServer(server: NetServer) {
  const io = new SocketIOServer(server, {
    path: '/api/collaboration/socket',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })
  
  console.log('🚀 Socket.IO server initialized')
  
  io.on('connection', (socket) => {
    console.log('🔗 Client connected:', socket.id)
    
    let currentUser: CollaborationUser | null = null
    let currentSession: ReportSession | null = null
    
    // User joins a report session
    socket.on('join-report', ({ reportId, userId, userName }) => {
      console.log(`👋 User ${userName} (${userId}) joining report ${reportId}`)
      
      currentSession = getOrCreateSession(reportId)
      
      currentUser = {
        id: userId,
        name: userName,
        color: generateUserColor(userId),
        cursor: { x: 0, y: 0 },
        lastSeen: new Date(),
        reportId
      }
      
      currentSession.users.set(userId, currentUser)
      
      socket.join(reportId)
      
      // Notify user they've joined
      socket.emit('user-joined', currentUser)
      
      // Send current active users
      const activeUsers = Array.from(currentSession.users.values())
      socket.emit('users-update', activeUsers)
      
      // Notify other users in the room
      socket.to(reportId).emit('user-joined', currentUser)
      socket.to(reportId).emit('users-update', activeUsers)
      
      // Send current field locks
      const locks = Object.fromEntries(currentSession.fieldLocks)
      socket.emit('field-locks-update', locks)
    })
    
    // Handle cursor movement
    socket.on('cursor-move', ({ cursor }) => {
      if (currentUser && currentSession) {
        currentUser.cursor = cursor
        currentUser.lastSeen = new Date()
        
        socket.to(currentUser.reportId).emit('cursor-move', {
          userId: currentUser.id,
          cursor
        })
      }
    })
    
    // Handle field locking
    socket.on('lock-field', ({ fieldId }) => {
      if (currentUser && currentSession) {
        if (!currentSession.fieldLocks.has(fieldId)) {
          currentSession.fieldLocks.set(fieldId, currentUser.id)
          
          io.to(currentUser.reportId).emit('field-locked', {
            fieldId,
            userId: currentUser.id
          })
          
          socket.emit('field-lock-success', { fieldId })
        } else {
          socket.emit('field-lock-failed', { 
            fieldId, 
            lockedBy: currentSession.fieldLocks.get(fieldId) 
          })
        }
      }
    })
    
    // Handle field unlocking
    socket.on('unlock-field', ({ fieldId }) => {
      if (currentUser && currentSession) {
        const lockOwnerId = currentSession.fieldLocks.get(fieldId)
        if (lockOwnerId === currentUser.id) {
          currentSession.fieldLocks.delete(fieldId)
          
          io.to(currentUser.reportId).emit('field-unlocked', { fieldId })
        }
      }
    })
    
    // Handle report changes
    socket.on('report-change', (changeData) => {
      if (currentUser && currentSession) {
        const change = {
          userId: currentUser.id,
          timestamp: new Date().toISOString(),
          action: changeData.action,
          fieldId: changeData.fieldId,
          changes: changeData.changes
        }
        
        currentSession.changeHistory.push(change)
        
        // Keep only last 100 changes
        if (currentSession.changeHistory.length > 100) {
          currentSession.changeHistory = currentSession.changeHistory.slice(-100)
        }
        
        // Broadcast to other users
        socket.to(currentUser.reportId).emit('report-change', change)
      }
    })
    
    // Handle drag events
    socket.on('drag-start', (dragData) => {
      if (currentUser) {
        socket.to(currentUser.reportId).emit('user-drag-start', {
          userId: currentUser.id,
          ...dragData
        })
      }
    })
    
    socket.on('drag-end', (dragData) => {
      if (currentUser) {
        socket.to(currentUser.reportId).emit('user-drag-end', {
          userId: currentUser.id,
          ...dragData
        })
      }
    })
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
      
      if (currentUser && currentSession) {
        // Remove user from session
        currentSession.users.delete(currentUser.id)
        
        // Release any field locks held by this user
        for (const [fieldId, userId] of currentSession.fieldLocks.entries()) {
          if (userId === currentUser.id) {
            currentSession.fieldLocks.delete(fieldId)
            socket.to(currentUser.reportId).emit('field-unlocked', { fieldId })
          }
        }
        
        // Notify other users
        socket.to(currentUser.reportId).emit('user-left', currentUser.id)
        
        const activeUsers = Array.from(currentSession.users.values())
        socket.to(currentUser.reportId).emit('users-update', activeUsers)
        
        // Clean up empty sessions
        if (currentSession.users.size === 0) {
          activeSessions.delete(currentUser.reportId)
          console.log(`🧹 Cleaned up empty session for report ${currentUser.reportId}`)
        }
      }
    })
  })
  
  return io
}
