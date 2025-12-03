// Real-time collaboration enhancements for Report Designer
"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export interface CollaborationUser {
  id: string
  name: string
  color: string
  cursor: { x: number, y: number }
  lastSeen: Date
}

interface CollaborationState {
  activeUsers: CollaborationUser[]
  lockingRules: Record<string, string> // fieldId -> userId
  changeHistory: Array<{
    userId: string
    timestamp: string
    action: string
    fieldId: string
    changes: any
  }>
}

interface CollaborationHookReturn {
  activeUsers: CollaborationUser[]
  broadcastAction: (action: any) => void
  lockField: (fieldId: string) => boolean
  unlockField: (fieldId: string) => void
  isFieldLocked: (fieldId: string) => boolean
  getFieldLocker: (fieldId: string) => CollaborationUser | null
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}

export function useCollaboration(reportId: string, userId: string): CollaborationHookReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [lockingRules, setLockingRules] = useState<Record<string, string>>({})
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  
  const cursorRef = useRef({ x: 0, y: 0 })
  const connectionStatusRef = useRef<'connected' | 'disconnected' | 'connecting'>('disconnected')
  
  // Update ref when connection status changes
  useEffect(() => {
    connectionStatusRef.current = connectionStatus
  }, [connectionStatus])
  
  useEffect(() => {
    // Initialize WebSocket connection
    const socketInstance = io('/api/collaboration', {
      path: '/api/collaboration',
      transports: ['websocket', 'polling']
    })
    
    setSocket(socketInstance)
    setConnectionStatus('connecting')
    
    // Connection event handlers
    socketInstance.on('connect', () => {
      setConnectionStatus('connected')
      
      // Join the report session
      socketInstance.emit('join-report', {
        reportId,
        userId,
        userName: `User ${userId.slice(0, 8)}`
      })
    })
    
    socketInstance.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })
    
    // User presence events
    socketInstance.on('user-joined', (user: CollaborationUser) => {
      setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user])
    })
    
    socketInstance.on('user-left', (userId: string) => {
      setActiveUsers(prev => prev.filter(u => u.id !== userId))
    })
    
    socketInstance.on('users-update', (users: CollaborationUser[]) => {
      setActiveUsers(users.filter(u => u.id !== userId))
    })
    
    // Cursor tracking
    socketInstance.on('cursor-move', ({ userId: cursorUserId, cursor }) => {
      if (cursorUserId !== userId) {
        setActiveUsers(prev => 
          prev.map(user => 
            user.id === cursorUserId 
              ? { ...user, cursor, lastSeen: new Date() }
              : user
          )
        )
      }
    })
    
    // Field locking events
    socketInstance.on('field-locked', ({ fieldId, userId: lockerId }) => {
      setLockingRules(prev => ({ ...prev, [fieldId]: lockerId }))
    })
    
    socketInstance.on('field-unlocked', ({ fieldId }) => {
      setLockingRules(prev => {
        const updated = { ...prev }
        delete updated[fieldId]
        return updated
      })
    })
    
    // Mouse cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      const newCursor = { x: e.clientX, y: e.clientY }
      cursorRef.current = newCursor
      
      // Throttle cursor updates to prevent spam - use ref instead of state
      if (socketInstance && connectionStatusRef.current === 'connected') {
        socketInstance.emit('cursor-move', { cursor: newCursor })
      }
    }
    
    // Add mouse move listener with throttling
    let lastCursorUpdate = 0
    const throttledMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastCursorUpdate > 50) { // 50ms throttle
        handleMouseMove(e)
        lastCursorUpdate = now
      }
    }
    
    document.addEventListener('mousemove', throttledMouseMove)
    
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove)
      socketInstance.disconnect()
    }
  }, [reportId, userId])
  const broadcastAction = (action: any) => {
    if (socket && connectionStatusRef.current === 'connected') {
      socket.emit('report-change', {
        reportId,
        userId,
        timestamp: new Date().toISOString(),
        ...action
      })
    }
  }
    const lockField = (fieldId: string): boolean => {
    if (lockingRules[fieldId] && lockingRules[fieldId] !== userId) {
      return false // Field is locked by another user
    }
    
    if (socket && connectionStatus === 'connected') {
      socket.emit('lock-field', { fieldId })
      return true
    }
    
    return false
  }
  
  const unlockField = (fieldId: string) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('unlock-field', { fieldId })
    }
  }
  
  const isFieldLocked = (fieldId: string): boolean => {
    return lockingRules[fieldId] != null && lockingRules[fieldId] !== userId
  }
  
  const getFieldLocker = (fieldId: string): CollaborationUser | null => {
    const lockerId = lockingRules[fieldId]
    if (!lockerId || lockerId === userId) return null
    
    return activeUsers.find(user => user.id === lockerId) || null
  }
  
  return {
    activeUsers,
    broadcastAction,
    lockField,
    unlockField,
    isFieldLocked,
    getFieldLocker,
    connectionStatus
  }
}

// Collaborative cursor component
export function CollaborativeCursors({ activeUsers }: { activeUsers: CollaborationUser[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {activeUsers.map(user => (
        <div
          key={user.id}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: user.cursor.x,
            top: user.cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* Cursor pointer */}
          <div 
            className="w-4 h-4 relative"
            style={{ color: user.color }}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="w-4 h-4 drop-shadow-sm"
            >
              <path d="M13.64 21.97c-.16-.3-.26-.64-.26-1.01V11.24l10.09 4.23c.48.2.48.84 0 1.04L14.96 19.5l-1.32 2.47z"/>
              <path d="M12.5 8.5L4.5 20.5L2.5 2.5L20.5 10.5L12.5 8.5z"/>
            </svg>
          </div>
          
          {/* User name badge */}
          <div 
            className="absolute top-4 left-2 px-2 py-1 rounded text-xs text-white font-medium shadow-lg whitespace-nowrap"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </div>
        </div>
      ))}
    </div>
  )
}

// Collaborative field lock indicator
export function FieldLockIndicator({ 
  fieldId, 
  isLocked, 
  lockedBy 
}: { 
  fieldId: string
  isLocked: boolean
  lockedBy: CollaborationUser | null 
}) {
  if (!isLocked || !lockedBy) return null
  
  return (
    <div 
      className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white font-medium shadow-lg"
      style={{ backgroundColor: lockedBy.color }}
    >
      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
      <span>{lockedBy.name}</span>
    </div>
  )
}

// Real-time collaboration status indicator
export function CollaborationStatus({ 
  connectionStatus, 
  activeUserCount 
}: { 
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  activeUserCount: number 
}) {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          icon: '🟢'
        }
      case 'connecting':
        return {
          color: 'bg-yellow-500',
          text: 'Connecting...',
          icon: '🟡'
        }
      case 'disconnected':
        return {
          color: 'bg-red-500',
          text: 'Disconnected',
          icon: '🔴'
        }
    }
  }
  
  const config = getStatusConfig()
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border text-sm">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="font-medium">{config.text}</span>
      {connectionStatus === 'connected' && activeUserCount > 0 && (
        <span className="text-muted-foreground">
          · {activeUserCount} other{activeUserCount !== 1 ? 's' : ''} online
        </span>
      )}
    </div>
  )
}
