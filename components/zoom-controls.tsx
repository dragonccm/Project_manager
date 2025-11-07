'use client'

/**
 * Zoom Controls Component
 * Advanced zoom controls với slider, percentage, và quick actions
 */

import React, { useState } from 'react'
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize2,
  Expand,
  Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface ZoomControlsProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onFitToScreen: () => void
  onFitToWidth: () => void
  minZoom?: number
  maxZoom?: number
  className?: string
}

export default function ZoomControls({
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  onFitToWidth,
  minZoom = 0.1,
  maxZoom = 5,
  className = ''
}: ZoomControlsProps) {
  const [sliderValue, setSliderValue] = useState([zoom * 100])
  const [popoverOpen, setPopoverOpen] = useState(false)

  const zoomPercentage = Math.round(zoom * 100)

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    onZoomChange(value[0] / 100)
  }

  const handleZoomPreset = (preset: number) => {
    onZoomChange(preset)
    setSliderValue([preset * 100])
    setPopoverOpen(false)
  }

  const zoomPresets = [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '125%', value: 1.25 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 },
    { label: '300%', value: 3 },
    { label: '400%', value: 4 }
  ]

  return (
    <TooltipProvider>
      <Card className={`flex items-center gap-1 p-2 ${className}`}>
        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomOut}
              disabled={zoom <= minZoom}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Thu nhỏ</p>
            <p className="text-xs text-muted-foreground">Ctrl + -</p>
          </TooltipContent>
        </Tooltip>

        {/* Zoom Percentage with Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="min-w-[60px] font-mono"
            >
              {zoomPercentage}%
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              {/* Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Zoom Level</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(sliderValue[0])}%
                  </span>
                </div>
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  min={minZoom * 100}
                  max={maxZoom * 100}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{minZoom * 100}%</span>
                  <span>{maxZoom * 100}%</span>
                </div>
              </div>

              <Separator />

              {/* Presets */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Quick Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  {zoomPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={zoom === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleZoomPreset(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Fit Options */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Fit Options</span>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      onFitToScreen()
                      setPopoverOpen(false)
                    }}
                  >
                    <Maximize className="h-4 w-4 mr-2" />
                    Fit to Screen
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      onFitToWidth()
                      setPopoverOpen(false)
                    }}
                  >
                    <Expand className="h-4 w-4 mr-2" />
                    Fit to Width
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      onZoomReset()
                      setSliderValue([100])
                      setPopoverOpen(false)
                    }}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Reset to 100%
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomIn}
              disabled={zoom >= maxZoom}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Phóng to</p>
            <p className="text-xs text-muted-foreground">Ctrl + +</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Fit to Screen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToScreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit to Screen</p>
            <p className="text-xs text-muted-foreground">Ctrl + 1</p>
          </TooltipContent>
        </Tooltip>

        {/* Fit to Width */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToWidth}
            >
              <Expand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fit to Width</p>
            <p className="text-xs text-muted-foreground">Ctrl + 2</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onZoomReset()
                setSliderValue([100])
              }}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Zoom</p>
            <p className="text-xs text-muted-foreground">Ctrl + 0</p>
          </TooltipContent>
        </Tooltip>
      </Card>
    </TooltipProvider>
  )
}
