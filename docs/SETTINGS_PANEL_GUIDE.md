# Settings Panel System - Complete Integration Guide

## 📦 Components Created

### 1. **Dynamic Settings Panel** (`components/dynamic-settings-panel.tsx`)
Panel bên phải tự động cập nhật dựa trên selection.

**Features:**
- ✅ Auto-update khi selection thay đổi
- ✅ Multi-edit cho nhiều shapes
- ✅ Collapsible sections (Position, Size, Text, Style)
- ✅ Tabbed interface (Properties/Style)
- ✅ Mixed values indicator cho multi-select
- ✅ Live preview updates
- ✅ Color pickers
- ✅ Number inputs với validation
- ✅ 350+ lines of TypeScript

**Props:**
```typescript
interface DynamicSettingsPanelProps {
  selectedShapes: Shape[]
  onUpdateShape: (id: string, updates: Partial<Shape>) => void
  onUpdateMultiple: (ids: string[], updates: Partial<Shape>) => void
}
```

**Sections:**
- **Position:** X, Y, Rotation
- **Size:** Width, Height
- **Text:** Content, Font Size, Font Family (text shapes only)
- **Style:** Fill color, Stroke color, Stroke width

---

### 2. **Assets Library** (`components/assets-library.tsx`)
Thư viện assets với drag & drop và search.

**Features:**
- ✅ Search/filter assets
- ✅ Category tabs (All, Shapes, Images, Text, Components)
- ✅ Drag & drop to canvas
- ✅ Asset thumbnails
- ✅ Grouped by category
- ✅ Add new assets buttons
- ✅ Asset count badges
- ✅ Empty state
- ✅ 350+ lines of TypeScript

**Props:**
```typescript
interface AssetsLibraryProps {
  assets: Asset[]
  onDragStart?: (asset: Asset) => void
  onAssetClick?: (asset: Asset) => void
  onAddAsset?: (type: Asset['type']) => void
}

interface Asset {
  id: string
  name: string
  type: 'shape' | 'image' | 'text' | 'component'
  category?: string
  thumbnail?: string
  data: any
}
```

---

## 🚀 Complete Integration Example

### A4 Editor với Settings Panel và Assets Library

```tsx
'use client'

import { useState, useEffect } from 'react'
import DynamicSettingsPanel from '@/components/dynamic-settings-panel'
import AssetsLibrary from '@/components/assets-library'
import { createSelectionManager } from '@/lib/selection-manager'

// Sample assets data
const SAMPLE_ASSETS: Asset[] = [
  {
    id: 'rect-1',
    name: 'Rectangle',
    type: 'shape',
    category: 'Basic Shapes',
    data: { type: 'rect', width: 100, height: 100, fill: '#3b82f6' }
  },
  {
    id: 'circle-1',
    name: 'Circle',
    type: 'shape',
    category: 'Basic Shapes',
    data: { type: 'circle', radius: 50, fill: '#ef4444' }
  },
  {
    id: 'text-1',
    name: 'Heading',
    type: 'text',
    category: 'Text',
    data: { text: 'Heading', fontSize: 24, fontFamily: 'Arial' }
  },
  {
    id: 'logo-1',
    name: 'Logo',
    type: 'image',
    category: 'Branding',
    thumbnail: '/assets/logo.png',
    data: { src: '/assets/logo.png' }
  },
  {
    id: 'card-1',
    name: 'Info Card',
    type: 'component',
    category: 'Components',
    data: { type: 'card', title: 'Title', content: 'Content' }
  }
]

export default function A4EditorWithPanels() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [assets, setAssets] = useState<Asset[]>(SAMPLE_ASSETS)
  const [selectionManager] = useState(() => createSelectionManager(shapes))
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Update selection manager when shapes change
  useEffect(() => {
    selectionManager.setShapes(shapes)
  }, [shapes, selectionManager])

  // Get selected shapes
  const selectedShapes = shapes.filter(s => selectedIds.includes(s.id))

  // Update single shape
  const handleUpdateShape = (id: string, updates: Partial<Shape>) => {
    setShapes(prev =>
      prev.map(shape =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    )
  }

  // Update multiple shapes
  const handleUpdateMultiple = (ids: string[], updates: Partial<Shape>) => {
    setShapes(prev =>
      prev.map(shape =>
        ids.includes(shape.id) ? { ...shape, ...updates } : shape
      )
    )
  }

  // Handle asset drag start
  const handleAssetDragStart = (asset: Asset) => {
    console.log('Dragging asset:', asset)
  }

  // Handle asset click (add to canvas)
  const handleAssetClick = (asset: Asset) => {
    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      ...asset.data,
      x: 100,
      y: 100
    }
    setShapes(prev => [...prev, newShape])
  }

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    
    try {
      const asset = JSON.parse(e.dataTransfer.getData('application/json')) as Asset
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newShape: Shape = {
        id: `shape-${Date.now()}`,
        ...asset.data,
        x,
        y
      }

      setShapes(prev => [...prev, newShape])
      
      // Select the new shape
      setSelectedIds([newShape.id])
    } catch (error) {
      console.error('Failed to parse dropped asset:', error)
    }
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  // Handle add new asset
  const handleAddAsset = (type: Asset['type']) => {
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: `New ${type}`,
      type,
      category: 'Custom',
      data: {}
    }
    setAssets(prev => [...prev, newAsset])
  }

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Assets Library */}
      <div className="w-64 border-r">
        <AssetsLibrary
          assets={assets}
          onDragStart={handleAssetDragStart}
          onAssetClick={handleAssetClick}
          onAddAsset={handleAddAsset}
        />
      </div>

      {/* Main Canvas */}
      <div
        className="flex-1 relative overflow-hidden bg-gray-100"
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
      >
        {/* Canvas content */}
        {shapes.map(shape => (
          <div
            key={shape.id}
            className={`absolute border-2 cursor-pointer ${
              selectedIds.includes(shape.id)
                ? 'border-blue-500 ring-2 ring-blue-500/50'
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width || 100,
              height: shape.height || 100,
              backgroundColor: shape.fill,
              transform: `rotate(${shape.rotation || 0}deg)`
            }}
            onClick={() => {
              setSelectedIds([shape.id])
            }}
          >
            {shape.type === 'text' && (
              <div
                style={{
                  fontSize: shape.fontSize,
                  fontFamily: shape.fontFamily
                }}
              >
                {shape.text}
              </div>
            )}
          </div>
        ))}

        {/* Drop indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-lg text-sm pointer-events-none opacity-0 transition-opacity" id="drop-indicator">
          Drop here to add to canvas
        </div>
      </div>

      {/* Right Sidebar - Settings Panel */}
      <div className="w-80 border-l">
        <DynamicSettingsPanel
          selectedShapes={selectedShapes}
          onUpdateShape={handleUpdateShape}
          onUpdateMultiple={handleUpdateMultiple}
        />
      </div>
    </div>
  )
}
```

---

## 🎨 Advanced Features

### 1. Collapsible Panels

Add ability to collapse sidebars:

```tsx
const [leftPanelOpen, setLeftPanelOpen] = useState(true)
const [rightPanelOpen, setRightPanelOpen] = useState(true)

<div className="h-screen flex">
  {/* Left Panel với toggle */}
  {leftPanelOpen && (
    <div className="w-64 border-r">
      <AssetsLibrary {...props} />
    </div>
  )}
  
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
    className="absolute top-4 left-4 z-10"
  >
    {leftPanelOpen ? <ChevronLeft /> : <ChevronRight />}
  </Button>

  {/* Canvas */}
  <div className="flex-1" />

  {/* Right Panel với toggle */}
  {rightPanelOpen && (
    <div className="w-80 border-l">
      <DynamicSettingsPanel {...props} />
    </div>
  )}
  
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setRightPanelOpen(!rightPanelOpen)}
    className="absolute top-4 right-4 z-10"
  >
    {rightPanelOpen ? <ChevronRight /> : <ChevronLeft />}
  </Button>
</div>
```

---

### 2. Resizable Panels

Using `react-resizable-panels`:

```bash
npm install react-resizable-panels
```

```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

<PanelGroup direction="horizontal">
  {/* Left Panel */}
  <Panel defaultSize={20} minSize={15} maxSize={30}>
    <AssetsLibrary {...props} />
  </Panel>
  
  <PanelResizeHandle className="w-1 bg-border hover:bg-primary" />

  {/* Canvas */}
  <Panel defaultSize={60} minSize={40}>
    <div className="h-full">{/* Canvas */}</div>
  </Panel>

  <PanelResizeHandle className="w-1 bg-border hover:bg-primary" />

  {/* Right Panel */}
  <Panel defaultSize={20} minSize={15} maxSize={30}>
    <DynamicSettingsPanel {...props} />
  </Panel>
</PanelGroup>
```

---

### 3. Asset Upload

Add image upload functionality:

```tsx
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // Upload to server
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  const { url } = await response.json()

  // Add to assets
  const newAsset: Asset = {
    id: `image-${Date.now()}`,
    name: file.name,
    type: 'image',
    category: 'Uploaded',
    thumbnail: url,
    data: { src: url }
  }

  setAssets(prev => [...prev, newAsset])
}

// In AssetsLibrary component
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
  className="hidden"
  id="image-upload"
/>
<label htmlFor="image-upload">
  <Button as="span">Upload Image</Button>
</label>
```

---

### 4. Custom Property Types

Extend settings panel with more property types:

```tsx
// In DynamicSettingsPanel

// Dropdown select
<Select
  value={getCommonValue('align')}
  onValueChange={v => handleUpdate({ align: v })}
>
  <SelectTrigger>
    <SelectValue placeholder="Alignment" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="left">Left</SelectItem>
    <SelectItem value="center">Center</SelectItem>
    <SelectItem value="right">Right</SelectItem>
  </SelectContent>
</Select>

// Slider
<Slider
  value={[getCommonValue('opacity') ?? 100]}
  onValueChange={([v]) => handleUpdate({ opacity: v })}
  min={0}
  max={100}
  step={1}
/>

// Checkbox
<Checkbox
  checked={getCommonValue('visible') ?? true}
  onCheckedChange={v => handleUpdate({ visible: v })}
/>
```

---

### 5. Asset Categories Management

Dynamic categories:

```tsx
const [categories, setCategories] = useState<string[]>([
  'Basic Shapes',
  'Text',
  'Images',
  'Components'
])

const handleAddCategory = (name: string) => {
  setCategories(prev => [...prev, name])
}

const handleDeleteCategory = (name: string) => {
  setCategories(prev => prev.filter(c => c !== name))
  // Also update assets in this category
  setAssets(prev =>
    prev.map(asset =>
      asset.category === name ? { ...asset, category: 'Uncategorized' } : asset
    )
  )
}
```

---

## 📊 State Management

### Using Context for Global State

```tsx
// contexts/editor-context.tsx
import { createContext, useContext } from 'react'

interface EditorContextType {
  shapes: Shape[]
  selectedIds: string[]
  assets: Asset[]
  updateShape: (id: string, updates: Partial<Shape>) => void
  updateMultiple: (ids: string[], updates: Partial<Shape>) => void
  addAsset: (asset: Asset) => void
  deleteAsset: (id: string) => void
}

const EditorContext = createContext<EditorContextType | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  // State management logic here
  return (
    <EditorContext.Provider value={...}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) throw new Error('useEditor must be used within EditorProvider')
  return context
}
```

---

## ⌨️ Keyboard Shortcuts

Add panel shortcuts:

```typescript
// Toggle panels
{ key: 'ctrl+shift+l', action: 'toggle-left-panel', description: 'Toggle assets panel' },
{ key: 'ctrl+shift+r', action: 'toggle-right-panel', description: 'Toggle settings panel' },

// Focus search
{ key: 'ctrl+shift+f', action: 'focus-asset-search', description: 'Focus asset search' },

// Asset operations
{ key: 'ctrl+shift+a', action: 'add-asset', description: 'Add new asset' }
```

---

## 🎨 Styling Customization

### Theme Support

```tsx
// Light/Dark theme compatible
<Card className="bg-background text-foreground">
  <CardHeader className="border-b border-border">
    {/* Content */}
  </CardHeader>
</Card>
```

### Custom Panel Width

```tsx
const [leftWidth, setLeftWidth] = useState(256) // 64 * 4 = 256px
const [rightWidth, setRightWidth] = useState(320) // 80 * 4 = 320px

<div style={{ width: leftWidth }}>
  <AssetsLibrary {...props} />
</div>
```

---

## 🐛 Common Issues

### Issue: Drag & drop không hoạt động
**Solution:** Ensure `draggable` attribute và `onDragStart` handler

### Issue: Settings không update
**Solution:** Check `selectedShapes` prop updates correctly

### Issue: Assets không filter
**Solution:** Verify `useMemo` dependencies

---

## ✅ Testing Checklist

- [ ] Settings panel updates on selection change
- [ ] Multi-select shows mixed values
- [ ] Collapsible sections work
- [ ] Tabs switch correctly
- [ ] Color pickers update shapes
- [ ] Number inputs validate
- [ ] Asset search filters correctly
- [ ] Asset tabs show correct counts
- [ ] Drag & drop from library to canvas
- [ ] Asset click adds to canvas
- [ ] Add new asset buttons work
- [ ] Empty states display
- [ ] Thumbnails load
- [ ] Panel collapse/expand

---

**Status:** Settings Panel Complete! ✅  
**Components:** 2  
**Lines of Code:** ~700  
**Ready for:** Phase 3 Integration

---

**Created:** October 22, 2025  
**Version:** 1.0.0
