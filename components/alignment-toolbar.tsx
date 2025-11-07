'use client'

/**
 * Alignment Toolbar Component
 * Toolbar for alignment and distribution operations
 */

import React from 'react'
import {
  AlignLeft,
  AlignRight,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignTop,
  AlignBottom,
  Distribute,
  DistributeHorizontal,
  DistributeVertical,
  Equal,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { alignmentManager } from '@/lib/alignment-tools'
import { Shape } from '@/types/database'

interface AlignmentToolbarProps {
  selectedShapes: Shape[]
  onShapesUpdate: (shapes: Shape[]) => void
  disabled?: boolean
}

export default function AlignmentToolbar({ 
  selectedShapes, 
  onShapesUpdate,
  disabled = false
}: AlignmentToolbarProps) {
  const hasMultipleShapes = selectedShapes.length >= 2
  const canDistribute = selectedShapes.length >= 3

  const handleAlignment = (type: string) => {
    let aligned: Shape[] = []
    
    switch (type) {
      case 'left':
        aligned = alignmentManager.alignLeft(selectedShapes)
        break
      case 'right':
        aligned = alignmentManager.alignRight(selectedShapes)
        break
      case 'top':
        aligned = alignmentManager.alignTop(selectedShapes)
        break
      case 'bottom':
        aligned = alignmentManager.alignBottom(selectedShapes)
        break
      case 'center-horizontal':
        aligned = alignmentManager.alignCenterHorizontal(selectedShapes)
        break
      case 'center-vertical':
        aligned = alignmentManager.alignCenterVertical(selectedShapes)
        break
      case 'distribute-horizontal':
        aligned = alignmentManager.distributeHorizontally(selectedShapes)
        break
      case 'distribute-vertical':
        aligned = alignmentManager.distributeVertically(selectedShapes)
        break
      case 'same-width':
        aligned = alignmentManager.makeSameWidth(selectedShapes)
        break
      case 'same-height':
        aligned = alignmentManager.makeSameHeight(selectedShapes)
        break
      case 'same-size':
        aligned = alignmentManager.makeSameSize(selectedShapes)
        break
      default:
        return
    }
    
    onShapesUpdate(aligned)
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 bg-background border rounded-lg shadow-sm">
        {/* Align Left/Right/Center */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('left')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn trái</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo cạnh trái</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('center-vertical')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignCenterVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn giữa dọc</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo trục dọc</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('right')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn phải</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo cạnh phải</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Align Top/Middle/Bottom */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('top')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignTop className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn trên</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo cạnh trên</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('center-horizontal')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignCenterHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn giữa ngang</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo trục ngang</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('bottom')}
                disabled={disabled || !hasMultipleShapes}
              >
                <AlignBottom className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Căn dưới</p>
              <p className="text-xs text-muted-foreground">Căn các shapes theo cạnh dưới</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Distribute */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('distribute-horizontal')}
                disabled={disabled || !canDistribute}
              >
                <DistributeHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Phân bố ngang</p>
              <p className="text-xs text-muted-foreground">Phân bố đều các shapes theo chiều ngang</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('distribute-vertical')}
                disabled={disabled || !canDistribute}
              >
                <DistributeVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Phân bố dọc</p>
              <p className="text-xs text-muted-foreground">Phân bố đều các shapes theo chiều dọc</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Make Same Size */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('same-width')}
                disabled={disabled || !hasMultipleShapes}
              >
                <Equal className="h-4 w-4 rotate-90" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cùng chiều rộng</p>
              <p className="text-xs text-muted-foreground">Đặt các shapes cùng chiều rộng</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('same-height')}
                disabled={disabled || !hasMultipleShapes}
              >
                <Equal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cùng chiều cao</p>
              <p className="text-xs text-muted-foreground">Đặt các shapes cùng chiều cao</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAlignment('same-size')}
                disabled={disabled || !hasMultipleShapes}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cùng kích thước</p>
              <p className="text-xs text-muted-foreground">Đặt các shapes cùng kích thước</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
