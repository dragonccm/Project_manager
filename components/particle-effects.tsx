"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

interface ParticleSystemProps {
  isActive: boolean
  trigger?: { x: number; y: number }
  color?: string
  count?: number
  duration?: number
}

export function ParticleSystem({ 
  isActive, 
  trigger, 
  color = "#3b82f6", 
  count = 20,
  duration = 2000 
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!isActive || !trigger) return

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: trigger.x,
      y: trigger.y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 2,
      life: 1,
      color,
      size: Math.random() * 6 + 2
    }))

    setParticles(newParticles)

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.1, // gravity
        life: particle.life - 0.02
      })).filter(particle => particle.life > 0))
    }, 16)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setParticles([])
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [isActive, trigger, color, count, duration])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: particle.life,
              scale: particle.life * 0.5 + 0.5
            }}
            exit={{ opacity: 0, scale: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Success celebration particles
export function SuccessCelebration({ 
  isActive, 
  position 
}: { 
  isActive: boolean
  position?: { x: number; y: number }
}) {
  return (
    <ParticleSystem
      isActive={isActive}
      trigger={position}
      color="#10b981"
      count={30}
      duration={3000}
    />
  )
}

// Field drop particles
export function FieldDropParticles({ 
  isActive, 
  position 
}: { 
  isActive: boolean
  position?: { x: number; y: number }
}) {
  return (
    <ParticleSystem
      isActive={isActive}
      trigger={position}
      color="#6366f1"
      count={15}      duration={1500}
    />
  )
}
