'use client'

import React from 'react'
import { ShapeType } from '@/types/database'
import { Button } from '@/components/ui/button'
import { 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  Type, 
  Pentagon,
  Image as ImageIcon,
  CreditCard,
  Network
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DraggableShapeItemProps {
  type: ShapeType
  label: string
  icon: React.ReactNode
  onDragStart?: (type: ShapeType) => void
}

const shapeConfigs: Record<ShapeType, { icon: React.ReactNode; color: string }> = {
  rectangle: { 
    icon: <Square className="w-5 h-5" />, 
    color: 'text-blue-500' 
  },
  ellipse: { 
    icon: <Circle className="w-5 h-5" />, 
    color: 'text-purple-500' 
  },
  line: { 
    icon: <Minus className="w-5 h-5" />, 
    color: 'text-gray-500' 
  },
  arrow: { 
    icon: <ArrowRight className="w-5 h-5" />, 
    color: 'text-green-500' 
  },
  text: { 
    icon: <Type className="w-5 h-5" />, 
    color: 'text-orange-500' 
  },
  polygon: { 
    icon: <Pentagon className="w-5 h-5" />, 
    color: 'text-pink-500' 
  },
  image: { 
    icon: <ImageIcon className="w-5 h-5" />, 
    color: 'text-teal-500' 
  },
  'data-card': { 
    icon: <CreditCard className="w-5 h-5" />, 
    color: 'text-indigo-500' 
  },
  'mermaid-diagram': { 
    icon: <Network className="w-5 h-5" />, 
    color: 'text-cyan-500' 
  }
}

export default function DraggableShapeItem({ 
  type, 
  label, 
  icon, 
  onDragStart 
}: DraggableShapeItemProps) {
  const config = shapeConfigs[type]
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('shapeType', type)
    e.dataTransfer.effectAllowed = 'copy'
    
    // Create a custom drag image
    const dragImage = document.createElement('div')
    dragImage.className = 'bg-primary text-primary-foreground px-3 py-2 rounded shadow-lg flex items-center gap-2'
    dragImage.innerHTML = `
      <span class="${config.color}">${icon}</span>
      <span>${label}</span>
    `
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    
    // Clean up drag image after drag starts
    setTimeout(() => document.body.removeChild(dragImage), 0)
    
    if (onDragStart) {
      onDragStart(type)
    }
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={handleDragStart}
      >
        <motion.div
          className={config.color}
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          {config.icon}
        </motion.div>
        <span className="flex-1 text-left">{label}</span>
      </Button>
    </motion.div>
  )
}
