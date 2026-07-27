"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface GoogleLoaderProps {
  className?: string
  text?: string
  fullScreen?: boolean
}

export function GoogleLoader({ 
  className, 
  text = "Đang tải dữ liệu...",
  fullScreen = false 
}: GoogleLoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4 select-none p-6", className)}>
      {/* 4-Color Google Infinity Spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[3.5px] border-[#4285F4]/20 border-t-[#4285F4] animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-[3.5px] border-[#EA4335]/20 border-t-[#EA4335] animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
        <div className="absolute inset-3 rounded-full border-[3.5px] border-[#FBBC04]/20 border-t-[#FBBC04] animate-spin [animation-duration:1.8s]" />
        <div className="absolute inset-4.5 rounded-full border-[3.5px] border-[#34A853]/20 border-t-[#34A853] animate-spin [animation-duration:0.9s]" />
      </div>

      {/* Bouncing 4 Google Dots */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04] animate-bounce" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]" />
      </div>

      {text && (
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-all duration-300">
        {content}
      </div>
    )
  }

  return content
}

export function GoogleTopProgressBar({ isNavigating }: { isNavigating: boolean }) {
  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-muted">
      <div className="h-full w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] animate-pulse" />
    </div>
  )
}
