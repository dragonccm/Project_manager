/**
 * Keyboard Shortcuts Manager
 * Quản lý và tùy chỉnh các phím tắt
 */

export interface KeyboardShortcut {
  id: string
  name: string
  description: string
  keys: string[]
  action: () => void
  category: 'editing' | 'navigation' | 'tools' | 'view' | 'file'
  enabled: boolean
}

export interface ShortcutConfig {
  id: string
  keys: string[]
  enabled: boolean
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private customConfig: Map<string, ShortcutConfig> = new Map()
  private isListening: boolean = false

  constructor() {
    this.loadCustomConfig()
  }

  // Đăng ký shortcut
  register(shortcut: KeyboardShortcut) {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  // Hủy đăng ký
  unregister(id: string) {
    this.shortcuts.delete(id)
  }

  // Lấy tất cả shortcuts theo category
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
      .filter(s => s.category === category)
  }

  // Lấy tất cả shortcuts
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  // Kiểm tra key combination
  private matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
    const pressedKeys = []
    
    if (event.ctrlKey || event.metaKey) pressedKeys.push('ctrl')
    if (event.shiftKey) pressedKeys.push('shift')
    if (event.altKey) pressedKeys.push('alt')
    
    const mainKey = event.key.toLowerCase()
    if (!['control', 'shift', 'alt', 'meta'].includes(mainKey)) {
      pressedKeys.push(mainKey)
    }
    
    return keys.length === pressedKeys.length && 
           keys.every(k => pressedKeys.includes(k.toLowerCase()))
  }

  // Xử lý keyboard event
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isListening) return

    for (const [id, shortcut] of this.shortcuts) {
      const config = this.customConfig.get(id)
      const keys = config?.keys || shortcut.keys
      const enabled = config?.enabled ?? shortcut.enabled

      if (enabled && this.matchesShortcut(event, keys)) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  // Bắt đầu lắng nghe
  startListening() {
    this.isListening = true
  }

  // Dừng lắng nghe
  stopListening() {
    this.isListening = false
  }

  // Tùy chỉnh shortcut
  customize(id: string, keys: string[]) {
    this.customConfig.set(id, {
      id,
      keys,
      enabled: true
    })
    this.saveCustomConfig()
  }

  // Bật/tắt shortcut
  toggle(id: string, enabled: boolean) {
    const existing = this.customConfig.get(id)
    const shortcut = this.shortcuts.get(id)
    
    if (shortcut) {
      this.customConfig.set(id, {
        id,
        keys: existing?.keys || shortcut.keys,
        enabled
      })
      this.saveCustomConfig()
    }
  }

  // Reset về mặc định
  reset(id: string) {
    this.customConfig.delete(id)
    this.saveCustomConfig()
  }

  // Reset tất cả
  resetAll() {
    this.customConfig.clear()
    this.saveCustomConfig()
  }

  // Lưu config
  private saveCustomConfig() {
    const config = Array.from(this.customConfig.entries())
    localStorage.setItem('keyboard-shortcuts-config', JSON.stringify(config))
  }

  // Load config
  private loadCustomConfig() {
    try {
      const saved = localStorage.getItem('keyboard-shortcuts-config')
      if (saved) {
        const config = JSON.parse(saved)
        this.customConfig = new Map(config)
      }
    } catch (error) {
      console.error('Failed to load keyboard shortcuts config:', error)
    }
  }

  // Format keys để hiển thị
  static formatKeys(keys: string[]): string {
    return keys
      .map(k => {
        switch (k.toLowerCase()) {
          case 'ctrl': return '⌘'
          case 'shift': return '⇧'
          case 'alt': return '⌥'
          case 'delete': return '⌫'
          case 'backspace': return '⌫'
          case 'enter': return '↵'
          case 'escape': return 'Esc'
          case 'arrowup': return '↑'
          case 'arrowdown': return '↓'
          case 'arrowleft': return '←'
          case 'arrowright': return '→'
          default: return k.toUpperCase()
        }
      })
      .join(' + ')
  }
}

// Default shortcuts configuration
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  // File operations
  {
    id: 'save',
    name: 'Lưu',
    description: 'Lưu template hiện tại',
    keys: ['ctrl', 's'],
    category: 'file',
    enabled: true
  },
  {
    id: 'export',
    name: 'Xuất',
    description: 'Xuất template ra file',
    keys: ['ctrl', 'e'],
    category: 'file',
    enabled: true
  },
  {
    id: 'new',
    name: 'Tạo mới',
    description: 'Tạo template mới',
    keys: ['ctrl', 'n'],
    category: 'file',
    enabled: true
  },
  {
    id: 'open',
    name: 'Mở',
    description: 'Mở template',
    keys: ['ctrl', 'o'],
    category: 'file',
    enabled: true
  },

  // Editing operations
  {
    id: 'undo',
    name: 'Hoàn tác',
    description: 'Hoàn tác thao tác trước',
    keys: ['ctrl', 'z'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'redo',
    name: 'Làm lại',
    description: 'Làm lại thao tác',
    keys: ['ctrl', 'shift', 'z'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'copy',
    name: 'Sao chép',
    description: 'Sao chép shape đã chọn',
    keys: ['ctrl', 'c'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'paste',
    name: 'Dán',
    description: 'Dán shape đã sao chép',
    keys: ['ctrl', 'v'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'cut',
    name: 'Cắt',
    description: 'Cắt shape đã chọn',
    keys: ['ctrl', 'x'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'duplicate',
    name: 'Nhân đôi',
    description: 'Nhân đôi shape đã chọn',
    keys: ['ctrl', 'd'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'delete',
    name: 'Xóa',
    description: 'Xóa shape đã chọn',
    keys: ['delete'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'selectAll',
    name: 'Chọn tất cả',
    description: 'Chọn tất cả shapes',
    keys: ['ctrl', 'a'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'deselect',
    name: 'Bỏ chọn',
    description: 'Bỏ chọn tất cả',
    keys: ['escape'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'group',
    name: 'Nhóm',
    description: 'Nhóm các shapes đã chọn',
    keys: ['ctrl', 'g'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'ungroup',
    name: 'Bỏ nhóm',
    description: 'Bỏ nhóm shapes',
    keys: ['ctrl', 'shift', 'g'],
    category: 'editing',
    enabled: true
  },

  // Layer operations
  {
    id: 'bringToFront',
    name: 'Đưa lên trên',
    description: 'Đưa shape lên trên cùng',
    keys: ['ctrl', 'shift', 'arrowup'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'sendToBack',
    name: 'Đưa xuống dưới',
    description: 'Đưa shape xuống dưới cùng',
    keys: ['ctrl', 'shift', 'arrowdown'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'bringForward',
    name: 'Đưa lên 1 lớp',
    description: 'Đưa shape lên 1 lớp',
    keys: ['ctrl', 'arrowup'],
    category: 'editing',
    enabled: true
  },
  {
    id: 'sendBackward',
    name: 'Đưa xuống 1 lớp',
    description: 'Đưa shape xuống 1 lớp',
    keys: ['ctrl', 'arrowdown'],
    category: 'editing',
    enabled: true
  },

  // View operations
  {
    id: 'zoomIn',
    name: 'Phóng to',
    description: 'Phóng to canvas',
    keys: ['ctrl', '+'],
    category: 'view',
    enabled: true
  },
  {
    id: 'zoomOut',
    name: 'Thu nhỏ',
    description: 'Thu nhỏ canvas',
    keys: ['ctrl', '-'],
    category: 'view',
    enabled: true
  },
  {
    id: 'zoomReset',
    name: 'Reset zoom',
    description: 'Đặt lại zoom về 100%',
    keys: ['ctrl', '0'],
    category: 'view',
    enabled: true
  },
  {
    id: 'fitToScreen',
    name: 'Vừa màn hình',
    description: 'Fit canvas vào màn hình',
    keys: ['ctrl', '1'],
    category: 'view',
    enabled: true
  },
  {
    id: 'toggleGrid',
    name: 'Bật/tắt lưới',
    description: 'Hiển thị/ẩn lưới',
    keys: ['ctrl', "'"],
    category: 'view',
    enabled: true
  },
  {
    id: 'toggleSnap',
    name: 'Bật/tắt snap',
    description: 'Bật/tắt snap to grid',
    keys: ['ctrl', ';'],
    category: 'view',
    enabled: true
  },
  {
    id: 'fullscreen',
    name: 'Toàn màn hình',
    description: 'Chế độ toàn màn hình',
    keys: ['f11'],
    category: 'view',
    enabled: true
  },

  // Tools
  {
    id: 'selectTool',
    name: 'Chọn công cụ Select',
    description: 'Chuyển sang công cụ Select',
    keys: ['v'],
    category: 'tools',
    enabled: true
  },
  {
    id: 'rectangleTool',
    name: 'Công cụ Rectangle',
    description: 'Chuyển sang công cụ Rectangle',
    keys: ['r'],
    category: 'tools',
    enabled: true
  },
  {
    id: 'circleTool',
    name: 'Công cụ Circle',
    description: 'Chuyển sang công cụ Circle',
    keys: ['c'],
    category: 'tools',
    enabled: true
  },
  {
    id: 'textTool',
    name: 'Công cụ Text',
    description: 'Chuyển sang công cụ Text',
    keys: ['t'],
    category: 'tools',
    enabled: true
  },
  {
    id: 'lineTool',
    name: 'Công cụ Line',
    description: 'Chuyển sang công cụ Line',
    keys: ['l'],
    category: 'tools',
    enabled: true
  },
  {
    id: 'arrowTool',
    name: 'Công cụ Arrow',
    description: 'Chuyển sang công cụ Arrow',
    keys: ['a'],
    category: 'tools',
    enabled: true
  },

  // Navigation
  {
    id: 'panUp',
    name: 'Di chuyển lên',
    description: 'Di chuyển canvas lên',
    keys: ['arrowup'],
    category: 'navigation',
    enabled: true
  },
  {
    id: 'panDown',
    name: 'Di chuyển xuống',
    description: 'Di chuyển canvas xuống',
    keys: ['arrowdown'],
    category: 'navigation',
    enabled: true
  },
  {
    id: 'panLeft',
    name: 'Di chuyển trái',
    description: 'Di chuyển canvas sang trái',
    keys: ['arrowleft'],
    category: 'navigation',
    enabled: true
  },
  {
    id: 'panRight',
    name: 'Di chuyển phải',
    description: 'Di chuyển canvas sang phải',
    keys: ['arrowright'],
    category: 'navigation',
    enabled: true
  }
]

// Export singleton instance
export const keyboardShortcutManager = new KeyboardShortcutManager()
