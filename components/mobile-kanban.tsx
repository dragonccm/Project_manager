"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface MobileKanbanProps {
  columns: Array<{
    id: string
    title: string
    icon: React.ReactNode
    tasks: any[]
    bgColor: string
  }>
  renderTask: (task: any) => React.ReactNode
  className?: string
}

// Desktop Column Component with Droppable
function DesktopColumn({ 
  column, 
  renderTask 
}: { 
  column: {
    id: string
    title: string
    icon: React.ReactNode
    tasks: any[]
    bgColor: string
  }
  renderTask: (task: any) => React.ReactNode 
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="touch-manipulation">
      <CardHeader className={`${column.bgColor} rounded-t-lg pb-3`}>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {column.icon}
          <span className="truncate">{column.title}</span>
          <Badge variant="outline" className="ml-auto shrink-0">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="p-3 min-h-[200px] max-h-[500px] overflow-y-auto overscroll-contain">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {column.tasks.map((task) => renderTask(task))}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm italic">
                Không có task nào trong danh sách này
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}

// Mobile Column Component with Droppable
function MobileColumn({ 
  column, 
  renderTask 
}: { 
  column: {
    id: string
    title: string
    icon: React.ReactNode
    tasks: any[]
    bgColor: string
  }
  renderTask: (task: any) => React.ReactNode 
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="touch-manipulation">
      <CardHeader className={`${column.bgColor} rounded-t-lg pb-3`}>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {column.icon}
          <span>{column.title}</span>
          <Badge variant="outline" className="ml-auto">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="p-4">
        <SortableContext items={column.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto overscroll-contain">
            {column.tasks.map((task) => renderTask(task))}
            {column.tasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MoreHorizontal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có task nào trong danh sách này</p>
              </div>
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}export function MobileKanbanBoard({ columns, renderTask, className }: MobileKanbanProps) {
  const isMobile = useIsMobile()
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0)

  if (!isMobile) {
    // Desktop: Regular grid layout with droppable zones
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6", className)}>
        {columns.map((column) => (
          <DesktopColumn 
            key={column.id} 
            column={column} 
            renderTask={renderTask} 
          />
        ))}
      </div>
    )
  }

  // Mobile: Horizontal swipe interface with droppable zones
  const currentColumn = columns[currentColumnIndex]
  const hasPrevious = currentColumnIndex > 0
  const hasNext = currentColumnIndex < columns.length - 1

  return (
    <div className={cn("space-y-4", className)}>
      {/* Mobile column navigation */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentColumnIndex(Math.max(0, currentColumnIndex - 1))}
          disabled={!hasPrevious}
          className="touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          {columns.map((column, index) => (
            <Button
              key={column.id}
              variant={index === currentColumnIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentColumnIndex(index)}
              className="touch-manipulation"
            >
              {column.icon}
              <span className="ml-1 hidden sm:inline">{column.title}</span>
              <Badge 
                variant={index === currentColumnIndex ? "secondary" : "outline"} 
                className="ml-1 text-xs"
              >
                {column.tasks.length}
              </Badge>
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentColumnIndex(Math.min(columns.length - 1, currentColumnIndex + 1))}
          disabled={!hasNext}
          className="touch-manipulation"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current column display with droppable */}
      <MobileColumn column={currentColumn} renderTask={renderTask} />

      {/* Mobile swipe indicator */}
      <div className="flex justify-center gap-1">
        {columns.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentColumnIndex ? "bg-primary w-6" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}
