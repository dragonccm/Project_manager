// Mobile gesture support and touch optimizations for Report Designer
"use client"

import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, useDragControls } from "framer-motion"
import { useTouch } from "@/hooks/use-touch"

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  isMultiTouch: boolean
  scale: number
  rotation: number
  center: { x: number, y: number }
  velocity: { x: number, y: number }
  doubleTap?: boolean
  longPress?: boolean
  swipe?: { direction: 'left' | 'right' | 'up' | 'down', velocity: number }
}

interface MobileGestureProps {
  children: React.ReactNode
  onPinch?: (scale: number) => void
  onRotate?: (rotation: number) => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  className?: string
}

// Touch gesture recognition hook
export function useMobileGestures() {
  const [gestureState, setGestureState] = useState<GestureState>({
    isMultiTouch: false,
    scale: 1,
    rotation: 0,
    center: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 }
  })
  
  const touchHistory = useRef<TouchPoint[]>([])
  const lastTouchTime = useRef<number>(0)
  const tapCount = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches)
    const now = Date.now()
    
    // Clear long press timer if new touch starts
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    if (touches.length === 1) {
      const touch = touches[0]
      touchHistory.current = [{ x: touch.clientX, y: touch.clientY, timestamp: now }]
      
      // Handle double tap detection
      if (now - lastTouchTime.current < 300) {
        tapCount.current += 1
      } else {
        tapCount.current = 1
      }
      lastTouchTime.current = now
      
      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        // Trigger long press if finger hasn't moved much
        const currentTouch = touchHistory.current[touchHistory.current.length - 1]
        const firstTouch = touchHistory.current[0]
        if (currentTouch && firstTouch) {
          const distance = Math.sqrt(
            Math.pow(currentTouch.x - firstTouch.x, 2) + 
            Math.pow(currentTouch.y - firstTouch.y, 2)
          )
          if (distance < 10) {
            // Long press detected
            setGestureState(prev => ({ ...prev, longPress: true }))
          }
        }
      }, 500)
      
    } else if (touches.length === 2) {
      // Multi-touch gesture start
      setGestureState(prev => ({
        ...prev,
        isMultiTouch: true,
        center: {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2
        }
      }))
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touches = Array.from(e.touches)
    const now = Date.now()
    
    if (touches.length === 1) {
      const touch = touches[0]
      touchHistory.current.push({ x: touch.clientX, y: touch.clientY, timestamp: now })
      
      // Keep only last 10 touch points
      if (touchHistory.current.length > 10) {
        touchHistory.current = touchHistory.current.slice(-10)
      }
      
      // Calculate velocity
      if (touchHistory.current.length >= 2) {
        const current = touchHistory.current[touchHistory.current.length - 1]
        const previous = touchHistory.current[touchHistory.current.length - 2]
        const timeDiff = current.timestamp - previous.timestamp
        
        if (timeDiff > 0) {
          const velocity = {
            x: (current.x - previous.x) / timeDiff,
            y: (current.y - previous.y) / timeDiff
          }
          
          setGestureState(prev => ({ ...prev, velocity }))
        }
      }
      
    } else if (touches.length === 2) {
      // Handle pinch and rotation
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      const angle = Math.atan2(
        touch2.clientY - touch1.clientY,
        touch2.clientX - touch1.clientX
      )
      
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }
      
      setGestureState(prev => ({
        ...prev,
        scale: distance / 100, // Normalize scale
        rotation: angle * 180 / Math.PI,
        center
      }))
    }
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now()
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    if (e.touches.length === 0) {
      // All fingers lifted
      if (tapCount.current === 2 && now - lastTouchTime.current < 300) {
        // Double tap detected
        setGestureState(prev => ({ ...prev, doubleTap: true }))
        tapCount.current = 0
      }
      
      // Check for swipe gesture
      if (touchHistory.current.length >= 2) {
        const firstTouch = touchHistory.current[0]
        const lastTouch = touchHistory.current[touchHistory.current.length - 1]
        const deltaX = lastTouch.x - firstTouch.x
        const deltaY = lastTouch.y - firstTouch.y
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const timeDiff = lastTouch.timestamp - firstTouch.timestamp
        
        if (distance > 50 && timeDiff < 500) {
          // Swipe detected
          const velocity = distance / timeDiff
          let direction: 'left' | 'right' | 'up' | 'down'
          
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left'
          } else {
            direction = deltaY > 0 ? 'down' : 'up'
          }
          
          setGestureState(prev => ({ ...prev, swipe: { direction, velocity } }))
        }
      }
      
      // Reset gesture state
      setTimeout(() => {
        setGestureState(prev => ({
          ...prev,
          isMultiTouch: false,
          doubleTap: false,
          longPress: false,
          swipe: undefined
        }))
      }, 100)
      
      touchHistory.current = []
    }
  }
  
  return {
    gestureState,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

// Mobile-optimized gesture wrapper component
export function MobileGestureWrapper({
  children,
  onPinch,
  onRotate,
  onSwipe,
  onDoubleTap,
  onLongPress,
  className = ""
}: MobileGestureProps) {
  const { gestureState, touchHandlers } = useMobileGestures()
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  
  useEffect(() => {
    if (gestureState.isMultiTouch) {
      if (onPinch && gestureState.scale !== scale) {
        setScale(gestureState.scale)
        onPinch(gestureState.scale)
      }
      
      if (onRotate && gestureState.rotation !== rotation) {
        setRotation(gestureState.rotation)
        onRotate(gestureState.rotation)
      }
    }
  }, [gestureState.scale, gestureState.rotation, gestureState.isMultiTouch])
  
  useEffect(() => {
    if (gestureState.doubleTap && onDoubleTap) {
      onDoubleTap()
    }
  }, [gestureState.doubleTap])
  
  useEffect(() => {
    if (gestureState.longPress && onLongPress) {
      onLongPress()
    }
  }, [gestureState.longPress])
  
  useEffect(() => {
    if (gestureState.swipe && onSwipe) {
      onSwipe(gestureState.swipe.direction, gestureState.swipe.velocity)
    }
  }, [gestureState.swipe])
  
  return (
    <div
      className={`touch-manipulation ${className}`}
      {...touchHandlers}
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center',
        transition: gestureState.isMultiTouch ? 'none' : 'transform 0.2s ease-out'
      }}
    >
      {children}
    </div>
  )
}

// Mobile-optimized drag and drop field
export function MobileDragField({
  field,
  onMove,
  onLongPress,
  className = ""
}: {
  field: any
  onMove?: (newPosition: { x: number, y: number }) => void
  onLongPress?: () => void
  className?: string
}) {
  const dragControls = useDragControls()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const handleDragStart = (event: any, info: PanInfo) => {
    setIsDragging(true)
    setDragOffset({ x: info.offset.x, y: info.offset.y })
  }
  
  const handleDrag = (event: any, info: PanInfo) => {
    // Provide haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    
    if (onMove) {
      const newPosition = {
        x: info.point.x,
        y: info.point.y
      }
      onMove(newPosition)
    }
    
    // Stronger haptic feedback on drop
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50])
    }
  }
  
  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragElastic={0.1}
      dragMomentum={false}
      whileDrag={{ 
        scale: 1.05, 
        zIndex: 1000,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className={`select-none cursor-grab active:cursor-grabbing ${className} ${
        isDragging ? 'pointer-events-none' : ''
      }`}
      style={{
        touchAction: 'none' // Prevent scroll during drag
      }}
    >
      <MobileGestureWrapper
        onLongPress={onLongPress}
        onDoubleTap={() => {
          // Provide haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(100)
          }
        }}
      >
        {field}
      </MobileGestureWrapper>
    </motion.div>
  )
}

// Touch-optimized toolbar for mobile devices
export function MobileToolbar({
  tools,
  onToolSelect,
  selectedTool,
  className = ""
}: {
  tools: Array<{ id: string, icon: React.ReactNode, label: string }>
  onToolSelect: (toolId: string) => void
  selectedTool?: string
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
      initial={false}
    >
      <motion.div
        className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg p-2"
        layout
      >
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {tools.map((tool, index) => (
            <motion.button
              key={tool.id}
              className={`min-w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                selectedTool === tool.id 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onToolSelect(tool.id)
                // Haptic feedback
                if ('vibrate' in navigator) {
                  navigator.vibrate(50)
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {tool.icon}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Hook for detecting mobile device and touch capabilities
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [hasTouch, setHasTouch] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(userAgent))
      setHasTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    checkMobile()
    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])
  
  return { isMobile, hasTouch, orientation }
}
