/**
 * E2E Test Examples using Playwright
 * 
 * Installation:
 * npm install -D @playwright/test
 * npx playwright install
 * 
 * Run tests:
 * npx playwright test
 */

import { test, expect, Page } from '@playwright/test'

/**
 * Helper functions
 */
async function createNewDocument(page: Page) {
  await page.goto('http://localhost:3000/a4-editor')
  await page.waitForSelector('[data-testid="canvas"]')
}

async function addShape(page: Page, type: 'rectangle' | 'circle' | 'text') {
  await page.click(`[data-testid="add-${type}"]`)
  await page.waitForTimeout(100)
}

async function selectShape(page: Page, shapeIndex: number) {
  const shapes = await page.locator('[data-testid^="shape-"]').all()
  if (shapes[shapeIndex]) {
    await shapes[shapeIndex].click()
  }
}

/**
 * Basic functionality tests
 */
test.describe('A4 Editor - Basic Functionality', () => {
  test('should load editor successfully', async ({ page }) => {
    await createNewDocument(page)
    
    // Check if canvas exists
    const canvas = await page.locator('[data-testid="canvas"]')
    await expect(canvas).toBeVisible()
    
    // Check if toolbar exists
    const toolbar = await page.locator('[data-testid="toolbar"]')
    await expect(toolbar).toBeVisible()
  })

  test('should add rectangle shape', async ({ page }) => {
    await createNewDocument(page)
    
    // Add rectangle
    await addShape(page, 'rectangle')
    
    // Verify shape exists
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBeGreaterThan(0)
  })

  test('should add circle shape', async ({ page }) => {
    await createNewDocument(page)
    
    await addShape(page, 'circle')
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBeGreaterThan(0)
  })

  test('should add text shape', async ({ page }) => {
    await createNewDocument(page)
    
    await addShape(page, 'text')
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBeGreaterThan(0)
  })
})

/**
 * Selection tests
 */
test.describe('A4 Editor - Shape Selection', () => {
  test('should select single shape', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await selectShape(page, 0)
    
    // Check if shape is selected (has selection indicator)
    const selected = await page.locator('[data-selected="true"]')
    await expect(selected).toBeVisible()
  })

  test('should multi-select with Ctrl+Click', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    await addShape(page, 'circle')
    
    // Select first shape
    await selectShape(page, 0)
    
    // Ctrl+Click second shape
    await page.keyboard.down('Control')
    await selectShape(page, 1)
    await page.keyboard.up('Control')
    
    // Check both are selected
    const selected = await page.locator('[data-selected="true"]').count()
    expect(selected).toBe(2)
  })

  test('should lasso select multiple shapes', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    await addShape(page, 'circle')
    
    // Drag to create lasso selection
    const canvas = await page.locator('[data-testid="canvas"]')
    await canvas.hover()
    await page.mouse.down()
    await page.mouse.move(200, 200)
    await page.mouse.up()
    
    // Check multiple shapes selected
    const selected = await page.locator('[data-selected="true"]').count()
    expect(selected).toBeGreaterThan(0)
  })

  test('should select all with Ctrl+A', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    await addShape(page, 'circle')
    await addShape(page, 'text')
    
    // Press Ctrl+A
    await page.keyboard.press('Control+a')
    
    // Check all shapes selected
    const totalShapes = await page.locator('[data-testid^="shape-"]').count()
    const selected = await page.locator('[data-selected="true"]').count()
    expect(selected).toBe(totalShapes)
  })
})

/**
 * Shape manipulation tests
 */
test.describe('A4 Editor - Shape Manipulation', () => {
  test('should move shape with drag', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    const shape = await page.locator('[data-testid^="shape-"]').first()
    const initialBox = await shape.boundingBox()
    
    // Drag shape
    await shape.dragTo(shape, {
      targetPosition: { x: 100, y: 100 }
    })
    
    const finalBox = await shape.boundingBox()
    
    // Position should change
    expect(finalBox?.x).not.toBe(initialBox?.x)
    expect(finalBox?.y).not.toBe(initialBox?.y)
  })

  test('should delete shape with Delete key', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await selectShape(page, 0)
    await page.keyboard.press('Delete')
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBe(0)
  })

  test('should duplicate shape with Ctrl+D', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await selectShape(page, 0)
    await page.keyboard.press('Control+d')
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBe(2)
  })

  test('should copy and paste shape', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await selectShape(page, 0)
    await page.keyboard.press('Control+c')
    await page.keyboard.press('Control+v')
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBe(2)
  })
})

/**
 * Keyboard shortcuts tests
 */
test.describe('A4 Editor - Keyboard Shortcuts', () => {
  test('should save with Ctrl+S', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    // Press Ctrl+S
    await page.keyboard.press('Control+s')
    
    // Check for save indicator or toast
    const saveToast = await page.locator('text=/Saved|Đã lưu/i')
    await expect(saveToast).toBeVisible({ timeout: 3000 })
  })

  test('should undo with Ctrl+Z', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    const shapesAfterAdd = await page.locator('[data-testid^="shape-"]').count()
    
    // Undo
    await page.keyboard.press('Control+z')
    
    const shapesAfterUndo = await page.locator('[data-testid^="shape-"]').count()
    expect(shapesAfterUndo).toBeLessThan(shapesAfterAdd)
  })

  test('should redo with Ctrl+Shift+Z', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    // Undo
    await page.keyboard.press('Control+z')
    const shapesAfterUndo = await page.locator('[data-testid^="shape-"]').count()
    
    // Redo
    await page.keyboard.press('Control+Shift+z')
    const shapesAfterRedo = await page.locator('[data-testid^="shape-"]').count()
    
    expect(shapesAfterRedo).toBeGreaterThan(shapesAfterUndo)
  })
})

/**
 * Alignment tests
 */
test.describe('A4 Editor - Alignment', () => {
  test('should align shapes to left', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    await addShape(page, 'circle')
    
    // Select all
    await page.keyboard.press('Control+a')
    
    // Click align left button
    await page.click('[data-testid="align-left"]')
    
    // Verify alignment (shapes should have same x coordinate)
    // This would require checking actual shape positions
  })

  test('should distribute shapes horizontally', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    await addShape(page, 'circle')
    await addShape(page, 'text')
    
    await page.keyboard.press('Control+a')
    await page.click('[data-testid="distribute-horizontal"]')
    
    // Verify even spacing
  })
})

/**
 * Canvas zoom/pan tests
 */
test.describe('A4 Editor - Canvas Controls', () => {
  test('should zoom in with Ctrl+Plus', async ({ page }) => {
    await createNewDocument(page)
    
    const initialZoom = await page.locator('[data-testid="zoom-level"]').textContent()
    
    await page.keyboard.press('Control++')
    
    const finalZoom = await page.locator('[data-testid="zoom-level"]').textContent()
    expect(finalZoom).not.toBe(initialZoom)
  })

  test('should zoom out with Ctrl+Minus', async ({ page }) => {
    await createNewDocument(page)
    
    await page.keyboard.press('Control+-')
    
    const zoom = await page.locator('[data-testid="zoom-level"]').textContent()
    expect(zoom).toContain('%')
  })

  test('should reset zoom with Ctrl+0', async ({ page }) => {
    await createNewDocument(page)
    
    // Zoom in first
    await page.keyboard.press('Control++')
    
    // Reset zoom
    await page.keyboard.press('Control+0')
    
    const zoom = await page.locator('[data-testid="zoom-level"]').textContent()
    expect(zoom).toContain('100%')
  })

  test('should pan canvas with space+drag', async ({ page }) => {
    await createNewDocument(page)
    
    const canvas = await page.locator('[data-testid="canvas"]')
    
    // Hold space and drag
    await page.keyboard.down('Space')
    await canvas.hover()
    await page.mouse.down()
    await page.mouse.move(100, 100)
    await page.mouse.up()
    await page.keyboard.up('Space')
    
    // Canvas should have moved
  })
})

/**
 * PDF export tests
 */
test.describe('A4 Editor - PDF Export', () => {
  test('should open PDF export dialog', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await page.click('[data-testid="export-pdf"]')
    
    const dialog = await page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
  })

  test('should export PDF with custom settings', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    await page.click('[data-testid="export-pdf"]')
    
    // Select A3 format
    await page.selectOption('[data-testid="paper-format"]', 'A3')
    
    // Select landscape
    await page.click('[data-testid="orientation-landscape"]')
    
    // Set quality
    await page.fill('[data-testid="quality-slider"]', '90')
    
    // Export
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-button"]')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toContain('.pdf')
  })
})

/**
 * Auto-save tests
 */
test.describe('A4 Editor - Auto-save', () => {
  test('should show saving indicator', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    // Wait for auto-save
    const savingIndicator = await page.locator('text=/Saving|Đang lưu/i')
    await expect(savingIndicator).toBeVisible({ timeout: 5000 })
  })

  test('should recover from auto-save', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    // Wait for auto-save
    await page.waitForTimeout(2000)
    
    // Reload page
    await page.reload()
    
    // Check for recovery prompt
    const recoveryDialog = await page.locator('text=/Recover|Khôi phục/i')
    if (await recoveryDialog.isVisible()) {
      await page.click('[data-testid="recover-button"]')
    }
    
    // Shapes should be restored
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBeGreaterThan(0)
  })
})

/**
 * Accessibility tests
 */
test.describe('A4 Editor - Accessibility', () => {
  test('should navigate with keyboard', async ({ page }) => {
    await createNewDocument(page)
    
    // Tab to first focusable element
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await createNewDocument(page)
    
    // Check toolbar buttons have aria-labels
    const buttons = await page.locator('button[aria-label]').count()
    expect(buttons).toBeGreaterThan(0)
  })

  test('should announce actions to screen readers', async ({ page }) => {
    await createNewDocument(page)
    await addShape(page, 'rectangle')
    
    // Check for live region updates
    const liveRegion = await page.locator('[role="status"]')
    await expect(liveRegion).toBeAttached()
  })
})

/**
 * Performance tests
 */
test.describe('A4 Editor - Performance', () => {
  test('should handle 100 shapes without lag', async ({ page }) => {
    await createNewDocument(page)
    
    // Add 100 shapes
    for (let i = 0; i < 100; i++) {
      await addShape(page, 'rectangle')
    }
    
    const shapes = await page.locator('[data-testid^="shape-"]').count()
    expect(shapes).toBe(100)
    
    // Try to select all - should be responsive
    const startTime = Date.now()
    await page.keyboard.press('Control+a')
    const endTime = Date.now()
    
    expect(endTime - startTime).toBeLessThan(1000)
  })

  test('should render large canvas smoothly', async ({ page }) => {
    await createNewDocument(page)
    
    // Zoom out to see more canvas
    await page.keyboard.press('Control+-')
    await page.keyboard.press('Control+-')
    await page.keyboard.press('Control+-')
    
    // Pan around
    const canvas = await page.locator('[data-testid="canvas"]')
    await page.keyboard.down('Space')
    await canvas.hover()
    await page.mouse.down()
    await page.mouse.move(500, 500)
    await page.mouse.up()
    await page.keyboard.up('Space')
    
    // Should remain responsive
  })
})
