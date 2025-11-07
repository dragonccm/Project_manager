/**
 * Animation System for A4 Editor
 * 
 * Features:
 * - Smooth transitions for panels
 * - Shape animations
 * - Loading animations
 * - Spring physics
 * - Easing functions
 */

export type EasingFunction = (t: number) => number

/**
 * Easing functions
 */
export const Easing = {
  // Linear
  linear: (t: number) => t,

  // Quad
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  // Elastic
  easeOutElastic: (t: number) => {
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
  },

  // Bounce
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
  },

  // Spring
  spring: (tension = 170, friction = 26) => {
    return (t: number) => {
      const omega = tension / 100
      const zeta = friction / 100
      const beta = Math.sqrt(1 - zeta * zeta)
      const envelope = Math.exp(-zeta * omega * t)
      const phase = beta * omega * t
      return 1 - envelope * (Math.cos(phase) + (zeta / beta) * Math.sin(phase))
    }
  }
}

/**
 * Animation class
 */
export class Animation {
  private startTime: number = 0
  private startValue: number
  private endValue: number
  private duration: number
  private easing: EasingFunction
  private onUpdate: (value: number) => void
  private onComplete?: () => void
  private rafId: number | null = null

  constructor(config: {
    from: number
    to: number
    duration: number
    easing?: EasingFunction
    onUpdate: (value: number) => void
    onComplete?: () => void
  }) {
    this.startValue = config.from
    this.endValue = config.to
    this.duration = config.duration
    this.easing = config.easing || Easing.easeOutCubic
    this.onUpdate = config.onUpdate
    this.onComplete = config.onComplete
  }

  start() {
    this.startTime = performance.now()
    this.animate()
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private animate = () => {
    const currentTime = performance.now()
    const elapsed = currentTime - this.startTime
    const progress = Math.min(elapsed / this.duration, 1)
    const easedProgress = this.easing(progress)
    const currentValue =
      this.startValue + (this.endValue - this.startValue) * easedProgress

    this.onUpdate(currentValue)

    if (progress < 1) {
      this.rafId = requestAnimationFrame(this.animate)
    } else {
      this.onComplete?.()
    }
  }
}

/**
 * Spring animation for smooth physics-based animations
 */
export class SpringAnimation {
  private value: number
  private velocity: number = 0
  private target: number
  private tension: number
  private friction: number
  private onUpdate: (value: number) => void
  private onComplete?: () => void
  private rafId: number | null = null
  private threshold: number = 0.01

  constructor(config: {
    from: number
    to: number
    tension?: number
    friction?: number
    onUpdate: (value: number) => void
    onComplete?: () => void
  }) {
    this.value = config.from
    this.target = config.to
    this.tension = config.tension || 170
    this.friction = config.friction || 26
    this.onUpdate = config.onUpdate
    this.onComplete = config.onComplete
  }

  start() {
    this.animate()
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  setTarget(target: number) {
    this.target = target
    if (this.rafId === null) {
      this.start()
    }
  }

  private animate = () => {
    const delta = this.target - this.value
    const spring = delta * (this.tension / 100)
    const damper = this.velocity * (this.friction / 100)
    const acceleration = spring - damper

    this.velocity += acceleration * (1 / 60)
    this.value += this.velocity * (1 / 60)

    this.onUpdate(this.value)

    // Check if animation is complete
    if (Math.abs(delta) > this.threshold || Math.abs(this.velocity) > this.threshold) {
      this.rafId = requestAnimationFrame(this.animate)
    } else {
      this.value = this.target
      this.velocity = 0
      this.onUpdate(this.value)
      this.onComplete?.()
      this.rafId = null
    }
  }
}

/**
 * Preset animations
 */
export const Animations = {
  // Fade in/out
  fadeIn: (element: HTMLElement, duration = 300) => {
    return new Animation({
      from: 0,
      to: 1,
      duration,
      easing: Easing.easeOutCubic,
      onUpdate: (value) => {
        element.style.opacity = value.toString()
      }
    })
  },

  fadeOut: (element: HTMLElement, duration = 300) => {
    return new Animation({
      from: 1,
      to: 0,
      duration,
      easing: Easing.easeOutCubic,
      onUpdate: (value) => {
        element.style.opacity = value.toString()
      }
    })
  },

  // Slide in/out
  slideInLeft: (element: HTMLElement, distance = 100, duration = 300) => {
    return new Animation({
      from: -distance,
      to: 0,
      duration,
      easing: Easing.easeOutCubic,
      onUpdate: (value) => {
        element.style.transform = `translateX(${value}px)`
      }
    })
  },

  slideOutLeft: (element: HTMLElement, distance = 100, duration = 300) => {
    return new Animation({
      from: 0,
      to: -distance,
      duration,
      easing: Easing.easeInCubic,
      onUpdate: (value) => {
        element.style.transform = `translateX(${value}px)`
      }
    })
  },

  slideInRight: (element: HTMLElement, distance = 100, duration = 300) => {
    return new Animation({
      from: distance,
      to: 0,
      duration,
      easing: Easing.easeOutCubic,
      onUpdate: (value) => {
        element.style.transform = `translateX(${value}px)`
      }
    })
  },

  slideOutRight: (element: HTMLElement, distance = 100, duration = 300) => {
    return new Animation({
      from: 0,
      to: distance,
      duration,
      easing: Easing.easeInCubic,
      onUpdate: (value) => {
        element.style.transform = `translateX(${value}px)`
      }
    })
  },

  // Scale
  scaleIn: (element: HTMLElement, duration = 300) => {
    return new Animation({
      from: 0,
      to: 1,
      duration,
      easing: Easing.easeOutElastic,
      onUpdate: (value) => {
        element.style.transform = `scale(${value})`
      }
    })
  },

  scaleOut: (element: HTMLElement, duration = 200) => {
    return new Animation({
      from: 1,
      to: 0,
      duration,
      easing: Easing.easeInCubic,
      onUpdate: (value) => {
        element.style.transform = `scale(${value})`
      }
    })
  },

  // Bounce
  bounce: (element: HTMLElement, duration = 600) => {
    return new Animation({
      from: 0,
      to: 1,
      duration,
      easing: Easing.easeOutBounce,
      onUpdate: (value) => {
        element.style.transform = `translateY(${(1 - value) * -20}px)`
      }
    })
  }
}

/**
 * Composite animation - run multiple animations in sequence or parallel
 */
export class CompositeAnimation {
  private animations: Animation[] = []
  private mode: 'sequence' | 'parallel' = 'parallel'
  private currentIndex = 0

  constructor(mode: 'sequence' | 'parallel' = 'parallel') {
    this.mode = mode
  }

  add(animation: Animation) {
    this.animations.push(animation)
    return this
  }

  start() {
    if (this.mode === 'parallel') {
      this.animations.forEach(anim => anim.start())
    } else {
      this.playNext()
    }
  }

  stop() {
    this.animations.forEach(anim => anim.stop())
  }

  private playNext() {
    if (this.currentIndex >= this.animations.length) return

    const currentAnim = this.animations[this.currentIndex]
    const originalOnComplete = currentAnim['onComplete']

    currentAnim['onComplete'] = () => {
      originalOnComplete?.()
      this.currentIndex++
      this.playNext()
    }

    currentAnim.start()
  }
}

/**
 * React hook for animations
 */
export function useAnimation() {
  const animationRef = React.useRef<Animation | SpringAnimation | null>(null)

  React.useEffect(() => {
    return () => {
      animationRef.current?.stop()
    }
  }, [])

  const animate = React.useCallback((config: {
    from: number
    to: number
    duration: number
    easing?: EasingFunction
    onUpdate: (value: number) => void
    onComplete?: () => void
  }) => {
    animationRef.current?.stop()
    animationRef.current = new Animation(config)
    animationRef.current.start()
  }, [])

  const spring = React.useCallback((config: {
    from: number
    to: number
    tension?: number
    friction?: number
    onUpdate: (value: number) => void
    onComplete?: () => void
  }) => {
    animationRef.current?.stop()
    animationRef.current = new SpringAnimation(config)
    animationRef.current.start()
  }, [])

  return { animate, spring }
}

// For React imports
import React from 'react'
