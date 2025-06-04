import * as React from "react"

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isSwiping: boolean
}

export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  const [swipeState, setSwipeState] = React.useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
  })

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
    })
  }, [])

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!swipeState.isSwiping) return
    
    const touch = e.touches[0]
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }))
  }, [swipeState.isSwiping])

  const handleTouchEnd = React.useCallback(() => {
    if (!swipeState.isSwiping) return

    const deltaX = swipeState.currentX - swipeState.startX
    const deltaY = swipeState.currentY - swipeState.startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine if it's a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    setSwipeState(prev => ({ ...prev, isSwiping: false }))
  }, [swipeState, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  }
}

export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  threshold: number = 80
) {
  const [isPulling, setIsPulling] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) {
      setIsPulling(false)
      setPullDistance(0)
      return
    }

    const touch = e.touches[0]
    const currentY = touch.clientY
    const startY = touch.clientY - pullDistance
    const distance = Math.max(0, currentY - startY)
    
    setPullDistance(Math.min(distance, threshold * 1.5))
  }, [isPulling, pullDistance, threshold])

  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling) return

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setIsPulling(false)
    setPullDistance(0)
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing])

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  }
}
