'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  FlipHorizontal,
  FlipVertical,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoveUp,
  MoveDown,
  RotateCw
} from 'lucide-react'

interface ShapeOperationsToolbarProps {
  selectedCount: number
  onMirrorHorizontal: () => void
  onMirrorVertical: () => void
  onFlipHorizontal: () => void
  onFlipVertical: () => void
  onDuplicate: () => void
  onDelete: () => void
  onBringToFront: () => void
  onBringForward: () => void
  onSendBackward: () => void
  onSendToBack: () => void
  onRotate?: (degrees: number) => void
}

/**
 * ShapeOperationsToolbar - Toolbar cho shape operations
 * 
 * Features:
 * - Mirror/Flip buttons
 * - Duplicate/Delete buttons
 * - Layer ordering buttons
 * - Rotate buttons
 * - Disabled state khi không có selection
 * - Tooltips với keyboard shortcuts
 */
export default function ShapeOperationsToolbar({
  selectedCount,
  onMirrorHorizontal,
  onMirrorVertical,
  onFlipHorizontal,
  onFlipVertical,
  onDuplicate,
  onDelete,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onRotate
}: ShapeOperationsToolbarProps) {
  const disabled = selectedCount === 0

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
        {/* Mirror/Flip Operations */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMirrorHorizontal}
                disabled={disabled}
                className="h-8 w-8"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mirror Horizontal</p>
              <p className="text-xs text-muted-foreground">Shift+H</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMirrorVertical}
                disabled={disabled}
                className="h-8 w-8"
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mirror Vertical</p>
              <p className="text-xs text-muted-foreground">Shift+V</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFlipHorizontal}
                disabled={disabled}
                className="h-8 w-8"
              >
                <FlipHorizontal className="h-4 w-4 rotate-45" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Horizontal (in place)</p>
              <p className="text-xs text-muted-foreground">Alt+H</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFlipVertical}
                disabled={disabled}
                className="h-8 w-8"
              >
                <FlipVertical className="h-4 w-4 rotate-45" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Flip Vertical (in place)</p>
              <p className="text-xs text-muted-foreground">Alt+V</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Rotate Operations */}
        {onRotate && (
          <>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRotate(90)}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rotate 90° CW</p>
                  <p className="text-xs text-muted-foreground">Ctrl+]</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRotate(-90)}
                    disabled={disabled}
                    className="h-8 w-8"
                  >
                    <RotateCw className="h-4 w-4 scale-x-[-1]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rotate 90° CCW</p>
                  <p className="text-xs text-muted-foreground">Ctrl+[</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-8" />
          </>
        )}

        {/* Duplicate/Delete */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                disabled={disabled}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Duplicate</p>
              <p className="text-xs text-muted-foreground">Ctrl+D</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                disabled={disabled}
                className="h-8 w-8 text-red-600 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete {selectedCount > 1 ? `(${selectedCount})` : ''}</p>
              <p className="text-xs text-muted-foreground">Del</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Layer Ordering */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBringToFront}
                disabled={disabled}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring to Front</p>
              <p className="text-xs text-muted-foreground">Ctrl+Shift+]</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBringForward}
                disabled={disabled}
                className="h-8 w-8"
              >
                <MoveUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bring Forward</p>
              <p className="text-xs text-muted-foreground">Ctrl+]</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSendBackward}
                disabled={disabled}
                className="h-8 w-8"
              >
                <MoveDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send Backward</p>
              <p className="text-xs text-muted-foreground">Ctrl+[</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSendToBack}
                disabled={disabled}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send to Back</p>
              <p className="text-xs text-muted-foreground">Ctrl+Shift+[</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Selection Count Badge */}
        {selectedCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <div className="px-2 text-xs text-muted-foreground">
              {selectedCount} selected
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
