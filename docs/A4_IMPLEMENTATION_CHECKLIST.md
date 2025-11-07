# ✅ A4 Designer Implementation Checklist

## Hướng Dẫn Triển Khai Từng Bước

Use this checklist để đảm bảo tất cả các tính năng được tích hợp đúng cách.

---

## Phase 1: Setup & Preparation

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Project đã clone và npm install
- [ ] Database connection working
- [ ] Dev server chạy được (`npm run dev`)

### Review Code
- [ ] Đọc `A4_IMPROVEMENTS_README.md`
- [ ] Đọc `A4_IMPROVEMENTS_REPORT.md`
- [ ] Đọc `A4_INTEGRATION_COMPLETE.md`
- [ ] Review các file mới tạo

---

## Phase 2: Template Manager Integration

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: Import (Line ~1-50)
```tsx
- [ ] Import TemplateManager component
- [ ] Import Dialog components if needed
```

#### Step 2: State (Line ~100-150)
```tsx
- [ ] Add showTemplateManager state
- [ ] Add currentTemplate state
```

#### Step 3: Handlers (Line ~200-300)
```tsx
- [ ] Create handleSelectTemplate function
- [ ] Create handleCreateNew function
- [ ] Add template loading logic
```

#### Step 4: UI (Line ~800-900, trong toolbar)
```tsx
- [ ] Add Templates button
- [ ] Add Dialog với TemplateManager
- [ ] Style properly
```

#### Step 5: Test
- [ ] Click Templates button → dialog opens
- [ ] Search works
- [ ] Filter works
- [ ] Clone creates copy
- [ ] Delete removes template
- [ ] Version history shows
- [ ] Rollback works

---

## Phase 3: Keyboard Shortcuts Integration

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: Import (Line ~1-50)
```tsx
- [ ] Import keyboardShortcutManager
- [ ] Import DEFAULT_SHORTCUTS
- [ ] Import KeyboardShortcutsDialog
```

#### Step 2: State (Line ~100-150)
```tsx
- [ ] Add shortcutsDialogOpen state
```

#### Step 3: Actions Object (NEW, Line ~200)
```tsx
- [ ] Create actions object mapping shortcut IDs to functions
- [ ] Include all 35+ actions
- [ ] Handle missing actions gracefully
```

#### Step 4: Registration Hook (NEW, Line ~300)
```tsx
- [ ] Create useEffect for registration
- [ ] Register all shortcuts with actions
- [ ] Call startListening()
- [ ] Cleanup stopListening()
```

#### Step 5: Keyboard Handler (NEW, Line ~400)
```tsx
- [ ] Create useEffect for keyboard events
- [ ] Call manager.handleKeyDown(e)
- [ ] Cleanup event listener
```

#### Step 6: UI Button (Line ~800-900)
```tsx
- [ ] Add Keyboard icon button
- [ ] Open shortcuts dialog
- [ ] Style properly
```

#### Step 7: Dialog (Line ~1400)
```tsx
- [ ] Render KeyboardShortcutsDialog
- [ ] Pass manager prop
- [ ] Handle open/close
```

#### Step 8: Tooltips (Throughout toolbar)
```tsx
- [ ] Add keyboard shortcut hints to tooltips
- [ ] Format: "⌘ S" style
- [ ] Update all major buttons
```

#### Step 9: Implement Missing Actions
```tsx
- [ ] handleGroup
- [ ] handleUngroup
- [ ] handleLayerOrder (front/back/forward/backward)
- [ ] handleSelectAll
- [ ] handleFitToScreen
- [ ] handlePan (up/down/left/right)
```

#### Step 10: Test
- [ ] Ctrl+S saves
- [ ] Ctrl+Z/Y undo/redo
- [ ] Ctrl+C/V/X copy/paste/cut
- [ ] Ctrl+D duplicates
- [ ] Delete removes
- [ ] V/R/C/T/L/A switch tools
- [ ] Ctrl++/- zoom
- [ ] Dialog opens and works
- [ ] Customization persists
- [ ] Reset works

---

## Phase 4: Multi-Select Implementation

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: State (Line ~100-150)
```tsx
- [ ] Add selectedIds: string[] state
- [ ] Add selectionRect state
- [ ] Add isSelecting state
```

#### Step 2: Stage Handlers (Line ~600-700)
```tsx
- [ ] handleStageMouseDown
- [ ] handleStageMouseMove
- [ ] handleStageMouseUp
- [ ] Handle Shift+Click for multi-select
```

#### Step 3: Helper Functions (NEW, Line ~500)
```tsx
- [ ] isShapeInRect function
- [ ] getSelectedShapes function
```

#### Step 4: Transformer Update (Line ~180)
```tsx
- [ ] Update transformer to handle multiple nodes
- [ ] Group transform logic
```

#### Step 5: Render Selection Rect (Line ~1200)
```tsx
- [ ] Render Konva Rect for selection
- [ ] Style: blue semi-transparent
- [ ] listening={false}
```

#### Step 6: Keyboard Support
```tsx
- [ ] Shift+Click adds to selection
- [ ] Ctrl+A selects all
- [ ] Esc clears selection
```

#### Step 7: Test
- [ ] Click-drag creates selection rect
- [ ] Shapes inside rect get selected
- [ ] Shift+Click adds to selection
- [ ] Transform works on all selected
- [ ] Delete removes all selected
- [ ] Ctrl+A selects all

---

## Phase 5: Alignment Tools Integration

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: Import (Line ~1-50)
```tsx
- [ ] Import AlignmentToolbar
- [ ] Import alignmentManager
- [ ] Import SmartGuide type
```

#### Step 2: State (Line ~100-150)
```tsx
- [ ] Add smartGuides: SmartGuide[] state
```

#### Step 3: Drag Handlers (Line ~700-800)
```tsx
- [ ] Update handleShapeDragMove
- [ ] Get smart guides during drag
- [ ] Snap to guides if enabled
- [ ] Update handleShapeDragEnd
- [ ] Clear guides on drag end
```

#### Step 4: Render Guides (Line ~1200)
```tsx
- [ ] Map smartGuides to Konva Lines
- [ ] Style: green for alignment, magenta for spacing
- [ ] Dashed lines
- [ ] listening={false}
```

#### Step 5: Alignment Toolbar (Line ~1100)
```tsx
- [ ] Show when 2+ shapes selected
- [ ] Position: top center
- [ ] Pass selectedShapes
- [ ] Handle onShapesUpdate
```

#### Step 6: Update Shapes Handler
```tsx
- [ ] Merge aligned shapes with existing
- [ ] Maintain other properties
- [ ] Trigger history update
```

#### Step 7: Test
- [ ] Drag shape → guides appear
- [ ] Snap works
- [ ] Select 2+ → toolbar shows
- [ ] Align left works
- [ ] Distribute works (3+)
- [ ] Same size works
- [ ] Smart guides accurate

---

## Phase 6: Auto-Save Implementation

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: State (Line ~100-150)
```tsx
- [ ] Add lastSaved: Date | null state
- [ ] Add hasUnsavedChanges: boolean state
- [ ] Add isSaving: boolean state
```

#### Step 2: Track Changes (NEW, Line ~300)
```tsx
- [ ] useEffect on shapes change
- [ ] useEffect on canvasSettings change
- [ ] Set hasUnsavedChanges = true
```

#### Step 3: Auto-Save Interval (NEW, Line ~350)
```tsx
- [ ] useEffect with setInterval
- [ ] Call handleAutoSave every 30s
- [ ] Only if hasUnsavedChanges
- [ ] Cleanup interval
```

#### Step 4: Save Handler (Update existing)
```tsx
- [ ] Update handleSave to accept silent flag
- [ ] Version history logic
- [ ] Set lastSaved on success
- [ ] Clear hasUnsavedChanges
- [ ] Error handling
```

#### Step 5: UI Indicator (Line ~900)
```tsx
- [ ] Show "Unsaved changes" badge
- [ ] Show "Saved X ago" text
- [ ] Show saving spinner when isSaving
```

#### Step 6: Prevent Data Loss
```tsx
- [ ] beforeunload event listener
- [ ] Warn if hasUnsavedChanges
- [ ] Save on unmount
```

#### Step 7: Test
- [ ] Make change → badge shows
- [ ] Wait 30s → auto-saves
- [ ] Badge clears → "Saved X ago"
- [ ] Refresh → data persists
- [ ] Navigate away → warning

---

## Phase 7: Context Menu (Optional)

### File: `features/a4-editor/a4-editor.tsx`

#### Step 1: State
```tsx
- [ ] Add contextMenu state: { x, y, shapeId } | null
```

#### Step 2: Handler
```tsx
- [ ] handleContextMenu on shapes
- [ ] Show custom menu at position
- [ ] Hide on click outside
```

#### Step 3: Menu Items
```tsx
- [ ] Copy, Paste, Cut, Delete
- [ ] Duplicate, Group, Ungroup
- [ ] Bring to Front, Send to Back
- [ ] Align Left, Center, Right
- [ ] Make Same Size
```

#### Step 4: Render
```tsx
- [ ] Position at cursor
- [ ] Portal rendering
- [ ] Click outside to close
```

---

## Phase 8: Testing & Validation

### Unit Tests
```bash
- [ ] Template Manager CRUD
- [ ] Keyboard shortcuts registration
- [ ] Alignment calculations
- [ ] Smart guides detection
- [ ] Multi-select logic
```

### Integration Tests
```bash
- [ ] Template → Keyboard → works
- [ ] Multi-select → Alignment → works
- [ ] Save → Load → persists
- [ ] Undo → Redo → consistent
```

### E2E Tests
```bash
- [ ] Full workflow: create → edit → save → reload
- [ ] Performance with 100 shapes
- [ ] Performance with 500 shapes
- [ ] Memory leaks check
```

### Browser Testing
```bash
- [ ] Chrome (Windows)
- [ ] Chrome (Mac)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (Mac)
```

---

## Phase 9: Performance Optimization

### Metrics
```bash
- [ ] Measure FPS during drag
- [ ] Measure render time for 500 shapes
- [ ] Check memory usage
- [ ] Profile hotspots
```

### Optimizations
```tsx
- [ ] Memoize expensive calculations
- [ ] Debounce smart guides
- [ ] Virtual scrolling for template list
- [ ] Lazy load components
- [ ] Code splitting
```

---

## Phase 10: Documentation & Deployment

### Code Documentation
```bash
- [ ] Add JSDoc comments
- [ ] Update type definitions
- [ ] Document edge cases
- [ ] Add usage examples
```

### User Documentation
```bash
- [ ] Update user guide
- [ ] Create video tutorial
- [ ] Add tooltips/help text
- [ ] FAQ section
```

### Deployment
```bash
- [ ] Version bump
- [ ] Changelog update
- [ ] Build production
- [ ] Run smoke tests
- [ ] Deploy to staging
- [ ] Final tests
- [ ] Deploy to production
- [ ] Monitor errors
```

---

## ✅ Final Verification

### Feature Completeness
- [ ] Template Manager: 100%
- [ ] Keyboard Shortcuts: 100%
- [ ] Alignment Tools: 100%
- [ ] Multi-Select: 100%
- [ ] Auto-Save: 100%

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility OK

### User Experience
- [ ] All tooltips present
- [ ] Loading states smooth
- [ ] Error messages clear
- [ ] Keyboard navigation works
- [ ] Responsive layout OK

---

## 🎉 Completion

When all checkboxes are checked:
- [ ] Merge to main branch
- [ ] Tag release
- [ ] Notify team
- [ ] Celebrate! 🎉

---

**Progress Tracker:**
- Phase 1: ⬜ Not Started
- Phase 2: ⬜ Not Started
- Phase 3: ⬜ Not Started
- Phase 4: ⬜ Not Started
- Phase 5: ⬜ Not Started
- Phase 6: ⬜ Not Started
- Phase 7: ⬜ Not Started (Optional)
- Phase 8: ⬜ Not Started
- Phase 9: ⬜ Not Started
- Phase 10: ⬜ Not Started

**Estimated Time:** 2-3 weeks full-time  
**Priority:** High  
**Difficulty:** Medium-High
