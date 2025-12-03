/**
 * =================================================================
 * GLARE HOVER EFFECT - USAGE EXAMPLES
 * =================================================================
 * 
 * Hướng dẫn sử dụng hiệu ứng glare hover cho các thẻ card và components
 */

import { GlareHover } from '@/components/glare-hover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// =================================================================
// EXAMPLE 1: Basic Usage với Card Component
// =================================================================
export function BasicGlareCard() {
  return (
    <Card glareEffect={true}>
      <CardHeader>
        <CardTitle>Card với Glare Effect</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Di chuyển chuột để thấy hiệu ứng ánh sáng!</p>
      </CardContent>
    </Card>
  )
}

// =================================================================
// EXAMPLE 2: Custom Glare Color (Primary Blue)
// =================================================================
export function BlueGlareCard() {
  return (
    <Card 
      glareEffect={true} 
      glareColor="#3B82F6"  // Primary blue color
      glareOpacity={0.2}
    >
      <CardHeader>
        <CardTitle>Card với ánh sáng xanh</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Glare effect màu xanh dương</p>
      </CardContent>
    </Card>
  )
}

// =================================================================
// EXAMPLE 3: Direct GlareHover Component Usage
// =================================================================
export function DirectGlareUsage() {
  return (
    <GlareHover
      glareColor="#ffffff"
      glareOpacity={0.3}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      playOnce={false}
    >
      <div className="p-8 bg-card rounded-lg border">
        <h2 className="text-3xl font-bold">Hover Me</h2>
        <p>Any content can have glare effect!</p>
      </div>
    </GlareHover>
  )
}

// =================================================================
// EXAMPLE 4: Grid of Cards with Glare
// =================================================================
export function GlareCardGrid() {
  const items = [
    { id: 1, title: 'Card 1', description: 'Mô tả 1' },
    { id: 2, title: 'Card 2', description: 'Mô tả 2' },
    { id: 3, title: 'Card 3', description: 'Mô tả 3' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card 
          key={item.id}
          glareEffect={true}
          glareColor="#ffffff"
          glareOpacity={0.2}
          className="hover:shadow-lg transition-shadow"
        >
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// =================================================================
// THÔNG SỐ CÓ THỂ TÙY CHỈNH (Customizable Parameters)
// =================================================================
/**
 * glareColor: Màu của ánh sáng (default: tự động theo theme)
 *   - Light mode: "#ffffff" (trắng)
 *   - Dark mode: "#ffffff" (trắng với opacity cao hơn)
 * 
 * glareOpacity: Độ trong suốt (0-1)
 *   - Light mode default: 0.2
 *   - Dark mode default: 0.25
 *   - Recommended range: 0.1 - 0.4
 * 
 * glareAngle: Góc xoay của ánh sáng (degrees)
 *   - Default: -30
 *   - Try: -45, -30, 0, 30, 45
 * 
 * glareSize: Kích thước vùng sáng (pixels)
 *   - Default: 300
 *   - Small cards: 200-250
 *   - Large cards: 300-400
 * 
 * transitionDuration: Thời gian chuyển động (ms)
 *   - Default: 800
 *   - Fast: 400-600
 *   - Smooth: 800-1000
 * 
 * playOnce: Chỉ chạy 1 lần (boolean)
 *   - Default: false (chạy mỗi lần hover)
 *   - true: chỉ chạy lần đầu hover
 */

// =================================================================
// MẸO SỬ DỤNG (Usage Tips)
// =================================================================
/**
 * 1. Cho Project Cards (như trong project-form.tsx):
 *    glareColor="#ffffff", glareOpacity={0.2}
 * 
 * 2. Cho Form Cards (card màu xanh):
 *    glareColor="#3B82F6", glareOpacity={0.15}
 * 
 * 3. Cho Dark Mode:
 *    Component tự động tăng opacity lên 0.25
 * 
 * 4. Performance:
 *    - Dùng willChange: 'left, top' (đã tích hợp)
 *    - Tránh dùng quá nhiều cards với glare cùng lúc
 *    - Với danh sách dài, chỉ áp dụng cho cards trong viewport
 * 
 * 5. Accessibility:
 *    - Không ảnh hưởng keyboard navigation
 *    - Không ảnh hưởng screen readers
 *    - Works với touch devices (mobile)
 */
