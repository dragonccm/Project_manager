# Tích Hợp A4 Designer - Hướng Dẫn Sử Dụng

## ✅ Đã Hoàn Thành

### 1. Menu Navigation
- ✅ Thêm nút "A4 Designer" vào menu chính
- ✅ Icon: Layout (📐)
- ✅ Vị trí: Giữa "Notes" và "Email Composer"
- ✅ Click để chuyển đến trang `/a4-editor`

### 2. Tích Hợp với Notes Manager
- ✅ Component `A4TemplateSelector` 
- ✅ Hiển thị trong form tạo/edit note
- ✅ Vị trí: Giữa phần "Nội dung" và "Tags"
- ✅ Tự động lưu `linked_a4_template` ID vào database

### 3. Database Schema
- ✅ Thêm field `linked_a4_template: String` vào CodeComponent schema
- ✅ Thêm field `linked_a4_template?: string` vào CodeComponent interface
- ✅ Thêm field `_id?: string` vào A4Template interface

### 4. Component Features
- ✅ **Chưa liên kết**: Hiển thị 2 nút
  - "Chọn Template có sẵn" - Mở dialog chọn
  - "Tạo Template mới" - Mở `/a4-editor` trong tab mới
- ✅ **Đã liên kết**: Hiển thị thông tin template
  - Tên template
  - Mô tả
  - Số lượng shapes
  - Nút "Mở trong Editor"
  - Nút "Đổi Template"
  - Nút "Hủy liên kết"

## 🚀 Cách Sử Dụng

### Từ Dashboard Chính

#### Bước 1: Truy cập A4 Designer
1. Mở dashboard tại `http://localhost:3000`
2. Tìm menu item "A4 Designer" (icon 📐)
3. Click để chuyển đến trang thiết kế A4

#### Bước 2: Tạo Template Mới
1. Trong trang A4 Designer, click "New Template"
2. Nhập tên và mô tả
3. Click "Create Template"
4. Thiết kế template trên canvas
5. Click "Save" hoặc `Ctrl+S` để lưu

### Từ Notes Manager

#### Tạo Note Mới với Template

1. **Mở Notes Manager**
   - Click menu "Notes" trên dashboard
   - Click "Tạo ghi chú mới"

2. **Điền thông tin cơ bản**
   - Nhập tên note
   - Chọn danh mục
   - Chọn loại ghi chú

3. **Liên kết Template A4**
   - Scroll xuống phần "📄 Template A4"
   - Có 2 lựa chọn:
   
   **Option A: Chọn template có sẵn**
   - Click "Chọn Template có sẵn"
   - Chọn template từ danh sách
   - Click "Liên kết Template"
   
   **Option B: Tạo template mới**
   - Click "Tạo Template mới"
   - Trang A4 Editor mở trong tab mới
   - Tạo và lưu template
   - Quay lại note và chọn template vừa tạo

4. **Lưu Note**
   - Click "Tạo mới" ở cuối form
   - Template đã được liên kết với note

#### Edit Note và Quản Lý Template

1. **Mở Note đã tồn tại**
   - Click icon ✏️ trên note card
   
2. **Xem Template đã liên kết**
   - Scroll đến phần "📄 Template A4"
   - Thấy thông tin template đã liên kết

3. **Thao tác với Template**
   
   **Mở trong Editor:**
   - Click "Mở trong Editor"
   - Template mở trong tab mới
   - Chỉnh sửa và lưu
   
   **Đổi Template:**
   - Click "Đổi Template"
   - Chọn template khác từ danh sách
   - Click "Liên kết Template"
   
   **Hủy liên kết:**
   - Click "Hủy liên kết" (màu đỏ)
   - Template bị tách khỏi note (template vẫn tồn tại)

4. **Cập nhật Note**
   - Click "Cập nhật" ở cuối form
   - Thay đổi được lưu vào database

## 📊 Workflow Example

### Scenario: Tạo Report Template cho Project

```
1. Tạo Template
   Dashboard → A4 Designer → New Template
   - Name: "Project Report Template"
   - Add: Title text, Logo rectangle, Data cards
   - Save template

2. Tạo Note Report
   Dashboard → Notes → Tạo ghi chú mới
   - Name: "Q4 Project Report"
   - Type: Document
   - Link template: "Project Report Template"
   - Save note

3. Sử dụng trong Project
   - Note đã có template A4 gắn liền
   - Click "Mở trong Editor" để điền data
   - Export PDF khi hoàn thành
```

## 🔧 Technical Details

### Component Location
```
components/a4-template-selector.tsx
```

### Usage in Code
```tsx
import { A4TemplateSelector } from '@/components/a4-template-selector'

<A4TemplateSelector
  linkedTemplateId={formData.linked_a4_template}
  entityType="note"
  entityId={editingNote?.id}
  onTemplateLink={(templateId) => {
    setFormData(prev => ({ ...prev, linked_a4_template: templateId }))
  }}
  onTemplateUnlink={() => {
    setFormData(prev => ({ ...prev, linked_a4_template: undefined }))
  }}
/>
```

### Props
- `linkedTemplateId?: string` - ID của template đã liên kết
- `onTemplateLink?: (templateId: string) => void` - Callback khi link
- `onTemplateUnlink?: () => void` - Callback khi unlink
- `entityType?: 'note' | 'mail' | 'task' | 'project' | 'account'` - Loại entity
- `entityId?: string` - ID của entity (note, mail, etc.)

### Database Schema
```typescript
// CodeComponent (Note)
{
  ...existing fields,
  linked_a4_template?: string  // A4Template ID
}

// A4Template
{
  _id?: string,
  id: string,
  ...existing fields,
  linkedEntities: [
    {
      entityType: 'note',
      entityId: 'note123',
      linkedAt: Date
    }
  ]
}
```

## 🎯 Next Steps (Optional)

### Tích hợp với các module khác

Có thể thêm `A4TemplateSelector` vào:

1. **Email Composer** (`features/emails/email-composer.tsx`)
   - Dùng template cho email formatting
   
2. **Project Form** (`features/projects/project-form.tsx`)
   - Gắn template proposal/documentation
   
3. **Task Form** (`features/tasks/`)
   - Template cho task specifications
   
4. **Account Manager** (`features/accounts/account-manager.tsx`)
   - Template cho account reports

### Cách tích hợp nhanh

```tsx
// 1. Import component
import { A4TemplateSelector } from '@/components/a4-template-selector'

// 2. Add field to formData state
const [formData, setFormData] = useState({
  ...existing,
  linked_a4_template: undefined as string | undefined
})

// 3. Add component to form
<A4TemplateSelector
  linkedTemplateId={formData.linked_a4_template}
  entityType="task" // or "mail", "project", "account"
  entityId={editingItem?.id}
  onTemplateLink={(id) => 
    setFormData(prev => ({ ...prev, linked_a4_template: id }))
  }
  onTemplateUnlink={() => 
    setFormData(prev => ({ ...prev, linked_a4_template: undefined }))
  }
/>

// 4. Update database schema
// Add linked_a4_template field to corresponding model
```

## 📝 Notes

- Template chỉ có thể liên kết sau khi entity (note) đã được lưu
- Template có thể link với nhiều entities khác nhau
- Xóa template không xóa entities đã link (chỉ bỏ link)
- Template được lưu độc lập, có thể reuse

## ✅ Verification Checklist

- [x] Menu "A4 Designer" xuất hiện trong dashboard
- [x] Click menu chuyển đến `/a4-editor`
- [x] Component hiển thị trong Notes form
- [x] Component hiển thị trạng thái "Chưa liên kết"
- [x] Có thể chọn template từ danh sách
- [x] Có thể tạo template mới (open new tab)
- [x] Template ID được lưu vào database
- [x] Khi edit note, template được load lại
- [x] Có thể mở template trong editor
- [x] Có thể đổi template
- [x] Có thể hủy liên kết
- [x] Không có TypeScript errors
- [x] Build thành công

## 🎉 Hoàn Thành

Hệ thống tích hợp A4 Designer đã hoàn tất! Người dùng giờ có thể:
- ✅ Truy cập A4 Designer từ menu chính
- ✅ Tạo và quản lý templates
- ✅ Liên kết templates với notes
- ✅ Mở templates trong editor
- ✅ Quản lý liên kết templates

---

**Last Updated:** October 22, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
