/**
 * Auto-save Manager - Tự động lưu với recovery
 * 
 * Features:
 * - Auto-save every N seconds
 * - Manual save
 * - Save state tracking
 * - Recovery on load
 * - Save history
 * - Conflict detection
 */

export interface SaveState {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  saveError: string | null
}

export interface SaveOptions {
  interval?: number // milliseconds
  debounce?: number // milliseconds
  maxHistory?: number
  onSave?: (data: any) => Promise<void>
  onError?: (error: Error) => void
  onRecovery?: (data: any) => void
}

export interface SaveHistoryEntry {
  id: string
  timestamp: Date
  data: any
  size: number
}

export class AutoSaveManager {
  private saveInterval: number = 30000 // 30 seconds
  private debounceTimeout: NodeJS.Timeout | null = null
  private autoSaveTimer: NodeJS.Timeout | null = null
  private isEnabled = false
  private isDirty = false
  
  private state: SaveState = {
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null
  }

  private saveHistory: SaveHistoryEntry[] = []
  private maxHistorySize = 10
  private currentData: any = null

  private onSaveCallback?: (data: any) => Promise<void>
  private onErrorCallback?: (error: Error) => void
  private onRecoveryCallback?: (data: any) => void
  private stateChangeCallbacks: Set<(state: SaveState) => void> = new Set()

  constructor(options: SaveOptions = {}) {
    this.saveInterval = options.interval || 30000
    this.maxHistorySize = options.maxHistory || 10
    this.onSaveCallback = options.onSave
    this.onErrorCallback = options.onError
    this.onRecoveryCallback = options.onRecovery

    // Try to recover on init
    this.tryRecover()
  }

  /**
   * Start auto-save
   */
  start() {
    if (this.isEnabled) return

    this.isEnabled = true
    this.scheduleAutoSave()
    console.log('[AutoSave] Started with interval:', this.saveInterval)
  }

  /**
   * Stop auto-save
   */
  stop() {
    if (!this.isEnabled) return

    this.isEnabled = false
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = null
    }
    console.log('[AutoSave] Stopped')
  }

  /**
   * Mark data as changed
   */
  markDirty(data: any) {
    this.isDirty = true
    this.currentData = data
    this.updateState({ hasUnsavedChanges: true })

    // Debounced save
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.saveToLocalStorage()
    }, 1000) // 1 second debounce
  }

  /**
   * Schedule next auto-save
   */
  private scheduleAutoSave() {
    if (!this.isEnabled) return

    this.autoSaveTimer = setTimeout(() => {
      if (this.isDirty) {
        this.save()
      }
      this.scheduleAutoSave()
    }, this.saveInterval)
  }

  /**
   * Save data
   */
  async save(): Promise<boolean> {
    if (this.state.isSaving) {
      console.log('[AutoSave] Already saving, skipping...')
      return false
    }

    if (!this.currentData) {
      console.log('[AutoSave] No data to save')
      return false
    }

    this.updateState({ isSaving: true, saveError: null })

    try {
      // Save to server
      if (this.onSaveCallback) {
        await this.onSaveCallback(this.currentData)
      }

      // Add to history
      this.addToHistory(this.currentData)

      // Save to localStorage
      this.saveToLocalStorage()

      // Clear dirty flag
      this.isDirty = false

      // Update state
      this.updateState({
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveError: null
      })

      console.log('[AutoSave] Saved successfully')
      return true
    } catch (error) {
      console.error('[AutoSave] Save failed:', error)
      
      this.updateState({
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Save failed'
      })

      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error : new Error('Save failed'))
      }

      return false
    }
  }

  /**
   * Save to localStorage (backup)
   */
  private saveToLocalStorage() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        data: this.currentData
      }
      localStorage.setItem('autosave_backup', JSON.stringify(data))
      console.log('[AutoSave] Backup saved to localStorage')
    } catch (error) {
      console.error('[AutoSave] Failed to save to localStorage:', error)
    }
  }

  /**
   * Try to recover from localStorage
   */
  private tryRecover() {
    try {
      const backup = localStorage.getItem('autosave_backup')
      if (!backup) return

      const { timestamp, data } = JSON.parse(backup)
      const backupDate = new Date(timestamp)
      const now = new Date()
      const diffMinutes = (now.getTime() - backupDate.getTime()) / 1000 / 60

      // Only recover if backup is less than 24 hours old
      if (diffMinutes < 24 * 60) {
        console.log('[AutoSave] Found backup from', backupDate)
        
        if (this.onRecoveryCallback) {
          this.onRecoveryCallback({ timestamp: backupDate, data })
        }
      } else {
        console.log('[AutoSave] Backup too old, ignoring')
        localStorage.removeItem('autosave_backup')
      }
    } catch (error) {
      console.error('[AutoSave] Recovery failed:', error)
    }
  }

  /**
   * Clear recovery data
   */
  clearRecovery() {
    localStorage.removeItem('autosave_backup')
    console.log('[AutoSave] Recovery data cleared')
  }

  /**
   * Add to save history
   */
  private addToHistory(data: any) {
    const entry: SaveHistoryEntry = {
      id: `save-${Date.now()}`,
      timestamp: new Date(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      size: JSON.stringify(data).length
    }

    this.saveHistory.unshift(entry)

    // Limit history size
    if (this.saveHistory.length > this.maxHistorySize) {
      this.saveHistory = this.saveHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * Get save history
   */
  getHistory(): SaveHistoryEntry[] {
    return [...this.saveHistory]
  }

  /**
   * Restore from history
   */
  restoreFromHistory(id: string): any | null {
    const entry = this.saveHistory.find(e => e.id === id)
    return entry ? JSON.parse(JSON.stringify(entry.data)) : null
  }

  /**
   * Get current state
   */
  getState(): SaveState {
    return { ...this.state }
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: SaveState) => void) {
    this.stateChangeCallbacks.add(callback)
    return () => {
      this.stateChangeCallbacks.delete(callback)
    }
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<SaveState>) {
    this.state = { ...this.state, ...updates }
    this.stateChangeCallbacks.forEach(callback => {
      callback(this.state)
    })
  }

  /**
   * Set save interval
   */
  setSaveInterval(milliseconds: number) {
    this.saveInterval = milliseconds
    
    // Restart if currently running
    if (this.isEnabled) {
      this.stop()
      this.start()
    }
  }

  /**
   * Get save interval
   */
  getSaveInterval(): number {
    return this.saveInterval
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): number | null {
    if (!this.state.lastSaved) return null
    return Date.now() - this.state.lastSaved.getTime()
  }

  /**
   * Format time since last save
   */
  formatTimeSinceLastSave(): string | null {
    const time = this.getTimeSinceLastSave()
    if (time === null) return null

    const seconds = Math.floor(time / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop()
    this.stateChangeCallbacks.clear()
    this.saveHistory = []
    this.currentData = null
  }
}

/**
 * Create a new AutoSaveManager instance
 */
export function createAutoSaveManager(options: SaveOptions = {}): AutoSaveManager {
  return new AutoSaveManager(options)
}
