'use client'

import React, { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut
} from '@/components/ui/context-menu'
import {
  Copy,
  Trash2,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  ArrowDown,
  MoveUp,
  MoveDown,
  Layers,
  RotateCw,
  Files
} from 'lucide-react'

interface Shape {
  id: string
  type: string
  [key: string]: any
}

interface ShapeContextMenuProps {
  children: React.ReactNode
  selectedShapes: Shape[]
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
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
}

/**
 * ShapeContextMenu - Context menu cho shape operations
 * 
 * Features:
 * - Mirror/Flip operations
 * - Duplicate shapes
 * - Delete shapes
 * - Layer ordering
 * - Copy/Cut/Paste
 * - Rotate submenu
 * - Keyboard shortcuts display
 */
export default function ShapeContextMenu({
  children,
  selectedShapes,
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
  onRotate,
  onCopy,
  onCut,
  onPaste
}: ShapeContextMenuProps) {
  const hasSelection = selectedShapes.length > 0
  const selectionCount = selectedShapes.length

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-64">
        {/* Clipboard Operations */}
        {onCopy && (
          <ContextMenuItem
            disabled={!hasSelection}
            onClick={onCopy}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
            <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        {onCut && (
          <ContextMenuItem
            disabled={!hasSelection}
            onClick={onCut}
          >
            <Copy className="mr-2 h-4 w-4" />
            Cut
            <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        {onPaste && (
          <ContextMenuItem onClick={onPaste}>
            <Files className="mr-2 h-4 w-4" />
            Paste
            <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        
        {(onCopy || onCut || onPaste) && <ContextMenuSeparator />}

        {/* Duplicate */}
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onDuplicate}
        >
          <Files className="mr-2 h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Transform Operations */}
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSelection}>
            <FlipHorizontal className="mr-2 h-4 w-4" />
            Mirror
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onMirrorHorizontal}>
              <FlipHorizontal className="mr-2 h-4 w-4" />
              Mirror Horizontal
            </ContextMenuItem>
            <ContextMenuItem onClick={onMirrorVertical}>
              <FlipVertical className="mr-2 h-4 w-4" />
              Mirror Vertical
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSelection}>
            <FlipHorizontal className="mr-2 h-4 w-4" />
            Flip
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onFlipHorizontal}>
              <FlipHorizontal className="mr-2 h-4 w-4" />
              Flip Horizontal
            </ContextMenuItem>
            <ContextMenuItem onClick={onFlipVertical}>
              <FlipVertical className="mr-2 h-4 w-4" />
              Flip Vertical
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Rotate Submenu */}
        {onRotate && (
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!hasSelection}>
              <RotateCw className="mr-2 h-4 w-4" />
              Rotate
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => onRotate(90)}>
                Rotate 90° CW
                <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onRotate(-90)}>
                Rotate 90° CCW
                <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => onRotate(180)}>
                Rotate 180°
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => onRotate(0)}>
                Reset Rotation
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />

        {/* Layer Ordering */}
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSelection}>
            <Layers className="mr-2 h-4 w-4" />
            Arrange
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={onBringToFront}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Bring to Front
              <ContextMenuShortcut>Ctrl+Shift+]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onBringForward}>
              <MoveUp className="mr-2 h-4 w-4" />
              Bring Forward
              <ContextMenuShortcut>Ctrl+]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onSendBackward}>
              <MoveDown className="mr-2 h-4 w-4" />
              Send Backward
              <ContextMenuShortcut>Ctrl+[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onSendToBack}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Send to Back
              <ContextMenuShortcut>Ctrl+Shift+[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Delete */}
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete {selectionCount > 1 ? `(${selectionCount})` : ''}
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
