// Touch event handling hook
"use client"

import { useEffect, useRef, useState } from "react"

interface TouchState {
  isActive: boolean
  startPosition: { x: number, y: number } | null
  currentPosition: { x: number, y: number } | null
  deltaX: number
  deltaY: number
  distance: number
  duration: number
  velocity: { x: number, y: number }
}

interface TouchOptions {
  preventDefault?: boolean
  threshold?: number
  maxDuration?: number
}

export function useTouch(options: TouchOptions = {}) {
  const {
    preventDefault = true,
    threshold = 10,
    maxDuration = 1000
  } = options
  
  const [touchState, setTouchState] = useState<TouchState>({
    isActive: false,
    startPosition: null,
    currentPosition: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    duration: 0,
    velocity: { x: 0, y: 0 }
  })
  
  const startTime = useRef<number>(0)
  const rafId = useRef<number | null>(null)
  
  const updateTouchState = (current: { x: number, y: number }) => {
    setTouchState(prev => {
      if (!prev.startPosition) return prev
      
      const deltaX = current.x - prev.startPosition.x
      const deltaY = current.y - prev.startPosition.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const duration = Date.now() - startTime.current
      
      const velocity = duration > 0 ? {
        x: deltaX / duration,
        y: deltaY / duration
      } : { x: 0, y: 0 }
      
      return {
        ...prev,
        currentPosition: current,
        deltaX,
        deltaY,
        distance,
        duration,
        velocity
      }
    })
  }
  
  const handleTouchStart = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    const touch = e.touches[0]
    if (!touch) return
    
    startTime.current = Date.now()
    const position = { x: touch.clientX, y: touch.clientY }
    
    setTouchState({
      isActive: true,
      startPosition: position,
      currentPosition: position,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      duration: 0,
      velocity: { x: 0, y: 0 }
    })
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    const touch = e.touches[0]
    if (!touch || !touchState.isActive) return
    
    const current = { x: touch.clientX, y: touch.clientY }
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }
    
    rafId.current = requestAnimationFrame(() => {
      updateTouchState(current)
    })
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }
    
    setTouchState(prev => ({
      ...prev,
      isActive: false
    }))
  }
  
  const handleTouchCancel = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }
    
    setTouchState({
      isActive: false,
      startPosition: null,
      currentPosition: null,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      duration: 0,
      velocity: { x: 0, y: 0 }
    })
  }
  
  const bindToElement = (element: HTMLElement | null) => {
    if (!element) return
    
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: !preventDefault })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
    }
  }
  
  // Touch gesture detection
  const isSwipe = touchState.distance > threshold && touchState.duration < maxDuration
  const isTap = touchState.distance < threshold && touchState.duration < 300
  const isLongPress = touchState.distance < threshold && touchState.duration > 500
  
  const swipeDirection = isSwipe ? {
    horizontal: touchState.deltaX > 0 ? 'right' : 'left',
    vertical: touchState.deltaY > 0 ? 'down' : 'up',
    primary: Math.abs(touchState.deltaX) > Math.abs(touchState.deltaY) ? 
      (touchState.deltaX > 0 ? 'right' : 'left') : 
      (touchState.deltaY > 0 ? 'down' : 'up')
  } : null
  
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [])
  
  return {
    touchState,
    bindToElement,
    gestures: {
      isSwipe,
      isTap,
      isLongPress,
      swipeDirection
    }
  }
}
