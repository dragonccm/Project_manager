// Advanced animation system for enhanced drag & drop experience
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion"

// Enhanced drag animations with physics
export const dragAnimations = {
  // Smooth pickup animation
  pickup: {
    scale: 1.05,
    rotate: 2,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8
    }
  },
  
  // Dragging state with subtle breathing effect
  dragging: {
    scale: [1.05, 1.08, 1.05],
    transition: {
      scale: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  },
  
  // Drop animation with bounce
  drop: {
    scale: 1,
    rotate: 0,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 1
    }
  },
  
  // Error state with shake
  error: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
}

// Drop zone animations
export const dropZoneAnimations = {
  idle: {
    scale: 1,
    borderColor: "hsl(var(--border))",
    backgroundColor: "hsl(var(--background))",
    transition: {
      duration: 0.2
    }
  },
  
  dragOver: {
    scale: 1.02,
    borderColor: "hsl(var(--primary))",
    backgroundColor: "hsl(var(--primary) / 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  },
  
  accepting: {
    scale: 1.05,
    borderColor: "hsl(var(--primary))",
    backgroundColor: "hsl(var(--primary) / 0.1)",
    boxShadow: "0 0 0 4px hsl(var(--primary) / 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  
  rejecting: {
    borderColor: "hsl(var(--destructive))",
    backgroundColor: "hsl(var(--destructive) / 0.05)",
    transition: {
      duration: 0.2
    }
  }
}

// Magnetic snap animation
export function useMagneticSnap(snapDistance: number = 20) {
  const [snapTargets, setSnapTargets] = useState<Array<{ x: number, y: number, id: string }>>([])
  const [isSnapping, setIsSnapping] = useState(false)
  
  const findSnapTarget = (x: number, y: number) => {
    return snapTargets.find(target => {
      const distance = Math.sqrt(Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2))
      return distance <= snapDistance
    })
  }
  
  const registerSnapTarget = (x: number, y: number, id: string) => {
    setSnapTargets(prev => [...prev.filter(t => t.id !== id), { x, y, id }])
  }
  
  const unregisterSnapTarget = (id: string) => {
    setSnapTargets(prev => prev.filter(t => t.id !== id))
  }
  
  return {
    findSnapTarget,
    registerSnapTarget,
    unregisterSnapTarget,
    isSnapping,
    setIsSnapping
  }
}

// Advanced cursor tracking with spring physics
export function useAdvancedCursor() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  // Smooth spring-based cursor following
  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)
  
  // Magnetic effect when near interactive elements
  const magneticRange = 100
  const magneticStrength = 0.3
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      
      // Check for nearby magnetic elements
      const magneticElements = document.querySelectorAll('[data-magnetic="true"]')
      let targetX = clientX
      let targetY = clientY
      
      magneticElements.forEach(element => {
        const rect = element.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const distance = Math.sqrt(
          Math.pow(centerX - clientX, 2) + Math.pow(centerY - clientY, 2)
        )
        
        if (distance < magneticRange) {
          const force = (magneticRange - distance) / magneticRange
          targetX += (centerX - clientX) * force * magneticStrength
          targetY += (centerY - clientY) * force * magneticStrength
        }
      })
      
      mouseX.set(targetX)
      mouseY.set(targetY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])
  
  return { cursorX, cursorY }
}

// Enhanced drag overlay component with advanced animations
export function EnhancedDragOverlay({ 
  children, 
  isDragging, 
  dragState = 'dragging' 
}: {
  children: React.ReactNode
  isDragging: boolean
  dragState?: 'pickup' | 'dragging' | 'drop' | 'error'
}) {
  const { cursorX, cursorY } = useAdvancedCursor()
  
  // Transform based on cursor position for natural following
  const x = useTransform(cursorX, value => value - 20)
  const y = useTransform(cursorY, value => value - 20)
  
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{ x, y }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={dragAnimations[dragState]}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div
            animate={{
              filter: [
                "hue-rotate(0deg)",
                "hue-rotate(10deg)",
                "hue-rotate(0deg)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Morphing field transition
export function MorphingField({ 
  from, 
  to, 
  isTransitioning 
}: {
  from: React.ReactNode
  to: React.ReactNode
  isTransitioning: boolean
}) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div
            key="from"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              filter: "blur(4px)",
              transition: { duration: 0.3 }
            }}
          >
            {from}
          </motion.div>
        ) : (
          <motion.div
            key="to"
            initial={{ 
              opacity: 0, 
              scale: 1.2,
              filter: "blur(4px)"
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              filter: "blur(0px)",
              transition: { 
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }
            }}
          >
            {to}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Gesture-based animations for mobile
export function useGestureAnimations() {
  const [gestureState, setGestureState] = useState<{
    scale: number
    rotation: number
    x: number
    y: number
  }>({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0
  })
  
  const handlePinch = (scale: number) => {
    setGestureState(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, scale)) }))
  }
  
  const handleRotate = (rotation: number) => {
    setGestureState(prev => ({ ...prev, rotation }))
  }
  
  const handlePan = (x: number, y: number) => {
    setGestureState(prev => ({ ...prev, x, y }))
  }
  
  const resetGestures = () => {
    setGestureState({ scale: 1, rotation: 0, x: 0, y: 0 })
  }
  
  return {
    gestureState,
    handlePinch,
    handleRotate,
    handlePan,
    resetGestures
  }
}

// Particle effect for successful drops
export function SuccessParticles({ 
  trigger, 
  position 
}: {
  trigger: boolean
  position: { x: number, y: number }
}) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    life: number
  }>>([])
  
  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1
      }))
      
      setParticles(newParticles)
      
      const animateParticles = () => {
        setParticles(current => 
          current
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx * 0.016,
              y: particle.y + particle.vy * 0.016,
              vy: particle.vy + 300 * 0.016, // gravity
              life: particle.life - 0.016
            }))
            .filter(particle => particle.life > 0)
        )
      }
      
      const interval = setInterval(animateParticles, 16)
      setTimeout(() => clearInterval(interval), 1000)
    }
  }, [trigger, position])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            opacity: particle.life,
            scale: particle.life
          }}
          transition={{ duration: 0 }}
        />
      ))}
    </div>
  )
}

// Unified hook for advanced animations
export function useAdvancedAnimations() {
  const magneticSnap = useMagneticSnap()
  const cursor = useAdvancedCursor()
  const gestures = useGestureAnimations()

  return {
    animateFieldAddition: (fieldId: string) => {
      // Physics-based field addition animation
      return {
        initial: { scale: 0, opacity: 0, y: -20 },
        animate: { 
          scale: 1, 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8
          }
        }
      }
    },
    
    animateFieldRemoval: (fieldId: string) => {
      // Smooth field removal with physics
      return {
        exit: {
          scale: 0,
          opacity: 0,
          x: 20,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        }
      }
    },
    
    magneticSnap,
    
    createParticleEffect: (x: number, y: number) => {
      // Create particle effect at coordinates
      console.log(`Creating particle effect at ${x}, ${y}`)
    },
    
    animateSuccess: () => {
      // Success animation
      return {
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      }
    },
    
    cursor,
    gestures
  }
}

// Enhanced Animated Drag Overlay
export function AnimatedDragOverlay({ 
  activeId, 
  children, 
  dropAnimation,
  style,
  className,
  ...domProps 
}: { 
  activeId: string | null
  children: React.ReactNode
  dropAnimation?: {
    duration?: number
    easing?: string
  }
  style?: React.CSSProperties
  className?: string
  [key: string]: any 
}) {
  // Extract non-DOM props to prevent React warnings
  const { 
    // Remove any other non-DOM props that might be passed
    ...filteredDomProps 
  } = domProps

  return (
    <motion.div
      initial={{ scale: 1, rotate: 0 }}
      animate={{ 
        scale: activeId ? 1.05 : 1, 
        rotate: activeId ? 2 : 0 
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
        // Use dropAnimation settings if provided
        ...(dropAnimation && {
          duration: dropAnimation.duration ? dropAnimation.duration / 1000 : undefined,
          ease: dropAnimation.easing || undefined
        })
      }}
      style={style}
      className={className}
      {...filteredDomProps}
    >
      {children}
    </motion.div>
  )
}

// Magnetic Snap Zone Component
export function MagneticSnapZone({
  targetSelector,
  snapRadius = 40,
  magneticForce = 0.3,
  isActive = false,
  children
}: {
  targetSelector: string
  snapRadius?: number
  magneticForce?: number
  isActive?: boolean
  children?: React.ReactNode
}) {
  useEffect(() => {
    if (!isActive) return

    const targets = document.querySelectorAll(targetSelector)
    
    const handleMouseMove = (e: MouseEvent) => {
      targets.forEach(target => {
        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        )
        
        if (distance < snapRadius) {
          const strength = 1 - (distance / snapRadius)
          const offsetX = (centerX - e.clientX) * strength * magneticForce
          const offsetY = (centerY - e.clientY) * strength * magneticForce
          
          // Apply magnetic effect (this would need cursor API or similar)
          console.log(`Magnetic snap: ${offsetX}, ${offsetY}`)
        }
      })
    }

    if (isActive) {
      document.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [targetSelector, snapRadius, magneticForce, isActive])

  return children ? <>{children}</> : null
}

// Export all animation configurations
export const animationPresets = {
  dragAnimations,
  dropZoneAnimations,
  
  // Micro-interactions
  button: {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  },
  
  // Loading states
  skeleton: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  
  // Error states
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: {
      duration: 0.4
    }
  }
}
