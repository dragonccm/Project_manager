'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Save,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  RefreshCw
} from 'lucide-react'
import { AutoSaveManager, SaveState, SaveHistoryEntry } from '@/lib/auto-save-manager'

interface AutoSaveIndicatorProps {
  autoSaveManager: AutoSaveManager
}

/**
 * AutoSaveIndicator - UI indicator cho auto-save status
 * 
 * Features:
 * - Visual save status
 * - Time since last save
 * - Manual save button
 * - Save history dropdown
 * - Recovery dialog
 * - Error indicator
 */
export default function AutoSaveIndicator({ autoSaveManager }: AutoSaveIndicatorProps) {
  const [state, setState] = useState<SaveState>(autoSaveManager.getState())
  const [history, setHistory] = useState<SaveHistoryEntry[]>([])
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false)
  const [recoveryData, setRecoveryData] = useState<any>(null)

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = autoSaveManager.onStateChange(newState => {
      setState(newState)
    })

    return unsubscribe
  }, [autoSaveManager])

  // Update history periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(autoSaveManager.getHistory())
    }, 5000)

    return () => clearInterval(interval)
  }, [autoSaveManager])

  // Handle manual save
  const handleManualSave = async () => {
    await autoSaveManager.save()
  }

  // Handle restore from history
  const handleRestore = (id: string) => {
    const data = autoSaveManager.restoreFromHistory(id)
    if (data) {
      setRecoveryData(data)
      setRecoveryDialogOpen(true)
    }
  }

  // Handle recovery accept
  const handleAcceptRecovery = () => {
    if (recoveryData) {
      // Trigger recovery callback
      autoSaveManager.clearRecovery()
      // Implementation would restore the data
    }
    setRecoveryDialogOpen(false)
    setRecoveryData(null)
  }

  // Get status icon and color
  const getStatusDisplay = () => {
    if (state.isSaving) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: 'Saving...',
        variant: 'default' as const,
        color: 'text-blue-600'
      }
    }

    if (state.saveError) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Save failed',
        variant: 'destructive' as const,
        color: 'text-red-600'
      }
    }

    if (state.hasUnsavedChanges) {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: 'Unsaved changes',
        variant: 'secondary' as const,
        color: 'text-yellow-600'
      }
    }

    return {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: 'All changes saved',
      variant: 'outline' as const,
      color: 'text-green-600'
    }
  }

  const status = getStatusDisplay()
  const timeSinceLastSave = autoSaveManager.formatTimeSinceLastSave()

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={status.variant} className="gap-1.5">
              <span className={status.color}>{status.icon}</span>
              <span className="text-xs">{status.text}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{status.text}</p>
              {timeSinceLastSave && (
                <p className="text-xs text-muted-foreground">
                  Last saved {timeSinceLastSave}
                </p>
              )}
              {state.saveError && (
                <p className="text-xs text-red-500">{state.saveError}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Manual Save Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualSave}
              disabled={state.isSaving || !state.hasUnsavedChanges}
              className="h-8 w-8"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save now</p>
            <p className="text-xs text-muted-foreground">Ctrl+S</p>
          </TooltipContent>
        </Tooltip>

        {/* History Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save history</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Save History</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {history.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No save history yet
              </div>
            ) : (
              history.map((entry, index) => (
                <DropdownMenuItem
                  key={entry.id}
                  onClick={() => handleRestore(entry.id)}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium">
                      {index === 0 ? 'Latest' : `${index + 1} versions ago`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(entry.size / 1024).toFixed(1)} KB
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Recovery Dialog */}
        <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore from history?</DialogTitle>
              <DialogDescription>
                This will restore your work to a previous version. Your current
                unsaved changes will be lost.
              </DialogDescription>
            </DialogHeader>
            
            {recoveryData && (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  This version was saved at{' '}
                  {new Date(recoveryData.timestamp).toLocaleString()}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRecoveryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAcceptRecovery}>
                Restore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
