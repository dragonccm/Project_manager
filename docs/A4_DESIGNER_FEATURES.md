# 📋 Danh Sách Chức Năng A4 Designer

## 🎯 Tổng Quan
A4 Designer là một trình soạn thảo tài liệu trực quan mạnh mẽ, cho phép người dùng tạo và quản lý các template tài liệu A4 với khả năng kéo-thả (drag & drop) các hình dạng và thành phần.

---

## 1️⃣ QUẢN LÝ TEMPLATE

### 1.1 Tạo Template Mới
- ✅ Tạo template mới với tên và mô tả
- ✅ Chọn chế độ canvas (A4 cố định / Flexible)
- ✅ Thiết lập cấu hình ban đầu (lưới, màu nền, v.v.)
- ✅ Phân loại template theo category
- ✅ Thêm tags để tổ chức

### 1.2 Quản Lý Template
- ✅ Xem danh sách tất cả templates (Gallery View)
- ✅ Tìm kiếm templates theo tên, mô tả
- ✅ Lọc templates theo category, tags
- ✅ Xem thông tin chi tiết template
- ✅ Chỉnh sửa template hiện có
- ✅ Xóa template
- ✅ Sao chép/Clone template

### 1.3 Lưu Trữ & Phiên Bản
- ✅ Tự động lưu template
- ✅ Lưu thủ công (Ctrl+S)
- ✅ Theo dõi lịch sử phiên bản
- ✅ Khôi phục phiên bản cũ (Version History)
- ✅ Undo/Redo operations

---

## 2️⃣ CANVAS - KHU VỰC LÀM VIỆC

### 2.1 Chế Độ Canvas
- ✅ **Chế độ A4 Cố Định**: 794x1123px (chuẩn A4 ở 96 DPI)
- ✅ **Chế độ Flexible**: Canvas tự động mở rộng theo nội dung
- ✅ Chuyển đổi giữa các chế độ dễ dàng
- ✅ Padding tùy chỉnh xung quanh canvas

### 2.2 Hệ Thống Lưới (Grid)
- ✅ Bật/tắt hiển thị lưới
- ✅ Tùy chỉnh kích thước lưới (grid size)
- ✅ Tùy chỉnh màu lưới
- ✅ Snap-to-Grid (hít vào lưới khi di chuyển)
- ✅ Tùy chỉnh độ nhạy snap (tolerance)

### 2.3 Màu Sắc & Nền
- ✅ Thay đổi màu nền canvas
- ✅ Tùy chỉnh màu cho từng hình dạng
- ✅ Màu stroke (viền) tùy chỉnh
- ✅ Độ trong suốt (opacity)

### 2.4 Zoom & View
- ✅ Zoom in (phóng to) - Tăng từ 10% đến 300%
- ✅ Zoom out (thu nhỏ)
- ✅ Fullscreen mode (toàn màn hình)
- ✅ Fit to screen
- ✅ Kéo canvas để di chuyển view

---

## 3️⃣ CÔNG CỤ VẼ (DRAWING TOOLS)

### 3.1 Hình Dạng Cơ Bản
- ✅ **Rectangle (Hình Chữ Nhật)**
  - Tạo hình chữ nhật
  - Tùy chỉnh kích thước, màu fill, màu stroke
  - Bo góc (corner radius)
  
- ✅ **Ellipse/Circle (Hình Tròn/Elip)**
  - Tạo hình tròn hoặc elip
  - Tùy chỉnh bán kính theo chiều ngang/dọc
  
- ✅ **Polygon (Đa Giác)**
  - Tạo đa giác tùy chỉnh (ngũ giác, lục giác, v.v.)
  - Điều chỉnh số cạnh
  - Chỉnh sửa các điểm (points)

### 3.2 Đường & Kết Nối
- ✅ **Line (Đường Thẳng)**
  - Vẽ đường thẳng
  - Tùy chỉnh độ dày, màu sắc
  - Điểm đầu/cuối có thể kéo thả
  
- ✅ **Arrow (Mũi Tên)**
  - Vẽ mũi tên
  - Tùy chỉnh kích thước đầu mũi tên
  - Hỗ trợ kết nối giữa các hình dạng
  - Điểm đầu và điểm cuối có thể điều chỉnh độc lập

### 3.3 Văn Bản
- ✅ **Text (Chữ)**
  - Thêm văn bản tùy chỉnh
  - Chọn font chữ (fontFamily)
  - Tùy chỉnh kích thước chữ (fontSize)
  - Màu chữ tùy chỉnh
  - Căn chỉnh (align left/center/right)
  - In đậm, in nghiêng (fontStyle)
  - Chỉnh sửa text trực tiếp trên canvas

### 3.4 Hình Ảnh
- ✅ **Image (Ảnh)**
  - Thêm ảnh từ URL
  - Upload ảnh từ máy tính
  - Resize ảnh
  - Crop và adjust
  - Placeholder hiển thị khi đang tải
  - Xử lý lỗi khi ảnh không tải được

### 3.5 Thành Phần Nâng Cao
- 🔄 **Data Card (Thẻ Dữ Liệu)**
  - Liên kết với các entity (Task, Project, Account, Note)
  - Hiển thị thông tin động từ database
  - Icon và màu sắc theo loại entity
  - Compact mode và full mode
  - Click để chọn entity cần liên kết
  - Cảnh báo nếu chưa liên kết
  
- 🔄 **Mermaid Diagram (Sơ Đồ Mermaid)**
  - Vẽ các loại sơ đồ từ code:
    - Flowchart (sơ đồ luồng)
    - Sequence diagram (sơ đồ tuần tự)
    - Class diagram (sơ đồ lớp)
    - State diagram (sơ đồ trạng thái)
    - ER Diagram (sơ đồ thực thể quan hệ)
    - Gantt chart (biểu đồ Gantt)
  - Editor code Mermaid tích hợp
  - Preview real-time
  - Syntax highlighting
  - Theme customization

---

## 4️⃣ THAO TÁC VỚI HÌNH DẠNG

### 4.1 Chọn & Di Chuyển
- ✅ **Select Tool**: Chọn hình dạng
- ✅ Click để chọn một hình
- ✅ Deselect bằng Escape hoặc click ngoài
- ✅ **Drag (Kéo)**: Di chuyển hình dạng tự do
- ✅ Snap to grid khi di chuyển
- ✅ Multi-select (chọn nhiều) - planned

### 4.2 Biến Đổi (Transform)
- ✅ **Resize**: Thay đổi kích thước
  - Kéo các điểm góc
  - Giữ tỷ lệ hoặc tự do
  - Nhập kích thước chính xác
  
- ✅ **Rotate**: Xoay hình dạng
  - Xoay bằng transformer handle
  - Nhập góc xoay chính xác (degrees)
  - Xoay theo bội số 15°/45° với Shift
  
- ✅ **Scale**: Thu phóng
  - Scale đồng đều
  - Scale theo chiều ngang/dọc riêng

### 4.3 Sao Chép & Xóa
- ✅ **Copy (Ctrl+C)**: Sao chép hình dạng
- ✅ **Duplicate (Ctrl+D)**: Nhân đôi hình dạng
- ✅ **Delete**: Xóa hình dạng
  - Phím Delete hoặc Backspace
  - Nút xóa trên toolbar

### 4.4 Căn Chỉnh & Phân Bố
- 🔄 Align Left/Center/Right (Căn trái/giữa/phải)
- 🔄 Align Top/Middle/Bottom (Căn trên/giữa/dưới)
- 🔄 Distribute Horizontally (Phân bố ngang)
- 🔄 Distribute Vertically (Phân bố dọc)
- 🔄 Group/Ungroup shapes (Nhóm/Bỏ nhóm)

### 4.5 Z-Index (Thứ Tự Lớp)
- ✅ Bring to Front (Đưa lên trên cùng)
- ✅ Send to Back (Đưa xuống dưới cùng)
- ✅ Bring Forward (Đưa lên 1 lớp)
- ✅ Send Backward (Đưa xuống 1 lớp)
- ✅ Tự động tracking zIndex cho các shapes mới

---

## 5️⃣ PANEL SETTINGS (BẢNG THIẾT LẬP)

### 5.1 Left Toolbar - Tools Tab
- ✅ Danh sách công cụ vẽ
- ✅ Drag & drop shapes vào canvas
- ✅ Click để kích hoạt tool
- ✅ Icon trực quan cho từng tool
- ✅ Tooltips hiển thị tên công cụ

### 5.2 Left Toolbar - Settings Tab
- ✅ Canvas Mode Toggle (A4/Flexible)
- ✅ Grid Settings
  - Enable/Disable Grid
  - Grid Size slider
  - Grid Color picker
- ✅ Snap to Grid Toggle
- ✅ Snap Tolerance slider
- ✅ Background Color picker
- ✅ Auto Expand toggle (flexible mode)

### 5.3 Left Toolbar - Layers Tab
- ✅ Danh sách tất cả shapes trên canvas
- ✅ Hiển thị icon theo loại shape
- ✅ Tên shape (có thể rename)
- ✅ **Visibility Toggle** (Eye icon)
  - Show/Hide shapes
  - Không ảnh hưởng đến data
- ✅ **Lock Toggle** (Lock icon)
  - Lock/Unlock dragging
  - Ngăn chỉnh sửa vô tình
- ✅ Click để select shape
- ✅ Reorder layers (drag & drop) - planned

### 5.4 Right Sidebar - Shape Settings Panel
Hiển thị khi có shape được chọn:

**Position & Size:**
- ✅ X position (px)
- ✅ Y position (px)
- ✅ Width (px)
- ✅ Height (px)
- ✅ Rotation (degrees)

**Appearance:**
- ✅ Fill Color picker
- ✅ Stroke Color picker
- ✅ Stroke Width (px)
- ✅ Opacity slider

**Text-specific (cho Text shapes):**
- ✅ Text content textarea
- ✅ Font Family dropdown
- ✅ Font Size slider
- ✅ Font Style (bold/italic)
- ✅ Text Align (left/center/right)

**Image-specific (cho Image shapes):**
- ✅ Image URL input
- ✅ Upload button
- ✅ Fit/Fill options

**Line/Arrow-specific:**
- ✅ Start Point (x, y)
- ✅ End Point (x, y)
- ✅ Pointer Length (cho Arrow)
- ✅ Pointer Width (cho Arrow)

**Data Card specific:**
- ✅ Entity Type selector
- ✅ Entity ID input
- ✅ Display Config options
- ✅ Link/Unlink entity button

**Mermaid-specific:**
- ✅ Code editor button
- ✅ Theme selector
- ✅ Diagram type display

---

## 6️⃣ TOP TOOLBAR (THANH CÔNG CỤ TRÊN)

### 6.1 File Operations
- ✅ **Save Button**: Lưu template (Ctrl+S)
- ✅ **Auto-save indicator**: Hiển thị trạng thái lưu
- ✅ Template name display
- ✅ Last saved timestamp

### 6.2 Export Options
- ✅ **Export PNG**: Xuất ảnh PNG chất lượng cao
  - PixelRatio 2x cho sharp export
  - Download trực tiếp
  
- 🔄 **Export PDF**: Xuất file PDF
  - Structure ready với jsPDF
  - Multi-page support
  - Vector graphics preservation

### 6.3 View Controls
- ✅ **Zoom In** (+): Phóng to canvas
- ✅ **Zoom Out** (-): Thu nhỏ canvas
- ✅ **Zoom Level Display**: Hiển thị % zoom hiện tại
- ✅ **Reset Zoom**: Về 100%
- ✅ **Fullscreen Toggle**: Chế độ toàn màn hình

### 6.4 History Controls
- ✅ **Undo** (Ctrl+Z): Hoàn tác
- ✅ **Redo** (Ctrl+Shift+Z): Làm lại
- ✅ History steps counter
- ✅ History limit (50 steps)

---

## 7️⃣ PHÍM TẮT (KEYBOARD SHORTCUTS)

### 7.1 File Operations
- ✅ `Ctrl + S` - Save template
- ✅ `Ctrl + N` - New template (planned)
- ✅ `Ctrl + O` - Open template (planned)

### 7.2 Edit Operations
- ✅ `Ctrl + Z` - Undo
- ✅ `Ctrl + Shift + Z` - Redo
- ✅ `Ctrl + C` - Copy shape
- ✅ `Ctrl + V` - Paste shape (planned)
- ✅ `Ctrl + D` - Duplicate shape
- ✅ `Delete` / `Backspace` - Delete selected shape

### 7.3 Selection & View
- ✅ `Escape` - Deselect all / Exit tool
- ✅ `Ctrl + A` - Select all (planned)
- ✅ `Ctrl + +` - Zoom in (planned)
- ✅ `Ctrl + -` - Zoom out (planned)
- ✅ `F11` - Fullscreen (planned)

### 7.4 Alignment (Planned)
- 🔄 `Ctrl + Shift + L` - Align Left
- 🔄 `Ctrl + Shift + C` - Align Center
- 🔄 `Ctrl + Shift + R` - Align Right
- 🔄 `Ctrl + [` - Send Backward
- 🔄 `Ctrl + ]` - Bring Forward

---

## 8️⃣ TÍCH HỢP VỚI HỆ THỐNG

### 8.1 Entity Linking
- ✅ **Link to Notes**: Liên kết template với ghi chú
- ✅ **Link to Projects**: Gắn template vào dự án
- ✅ **Link to Tasks**: Template cho task specification
- ✅ **Link to Accounts**: Thiết kế form tài khoản
- ✅ **Link to Emails**: Template email design

### 8.2 Permissions & Sharing
- ✅ Template visibility (Public/Private)
- ✅ Share template with users
- ✅ Permission levels:
  - View only
  - Can edit
  - Can manage (delete, share)
- ✅ Template ownership tracking

### 8.3 API Integration
REST API endpoints đầy đủ:
- ✅ `GET /api/a4-templates` - List templates
- ✅ `GET /api/a4-templates?id={id}` - Get template
- ✅ `POST /api/a4-templates` - Create template
- ✅ `PUT /api/a4-templates?id={id}` - Update template
- ✅ `DELETE /api/a4-templates?id={id}` - Delete template
- ✅ Authentication middleware tích hợp
- ✅ Error handling chuẩn

### 8.4 Usage Analytics
- ✅ Track usage count
- ✅ Last used timestamp
- ✅ Most popular templates
- ✅ User activity tracking

---

## 9️⃣ RESPONSIVE & UX

### 9.1 User Interface
- ✅ Clean, modern interface
- ✅ Dark/Light theme support (theo theme hệ thống)
- ✅ Tooltip hints for tools
- ✅ Loading states
- ✅ Error messages with toast notifications
- ✅ Success confirmations

### 9.2 Performance
- ✅ Canvas optimization với Konva
- ✅ Image caching system
- ✅ Lazy loading shapes
- ✅ Debounced auto-save
- ✅ Optimistic UI updates

### 9.3 Accessibility
- 🔄 Keyboard navigation
- 🔄 Screen reader support
- 🔄 High contrast mode
- 🔄 Focus indicators
- 🔄 ARIA labels

---

## 🔟 TÍNH NĂNG BỔ SUNG (PLANNED)

### 10.1 Advanced Features
- 🔄 **Templates Library**: Thư viện mẫu có sẵn
- 🔄 **Collaboration**: Chỉnh sửa real-time với nhiều người
- 🔄 **Comments**: Bình luận trên shapes
- 🔄 **Version Compare**: So sánh các phiên bản
- 🔄 **Import**: Nhập từ SVG, PDF
- 🔄 **Smart Guides**: Hỗ trợ căn chỉnh thông minh
- 🔄 **Snap to Objects**: Hít vào objects khác
- 🔄 **Rulers**: Thước đo trên canvas

### 10.2 Shape Enhancements
- 🔄 **Custom Shapes**: Vẽ tự do
- 🔄 **Path Tool**: Tạo đường cong Bezier
- 🔄 **Text on Path**: Chữ theo đường cong
- 🔄 **Gradient Fill**: Tô màu gradient
- 🔄 **Pattern Fill**: Tô pattern
- 🔄 **Shadow Effects**: Hiệu ứng đổ bóng
- 🔄 **Blur Effects**: Làm mờ

### 10.3 Professional Tools
- 🔄 **Master Pages**: Trang mẫu cho document nhiều trang
- 🔄 **Styles Library**: Thư viện style có sẵn
- 🔄 **Symbol System**: Tạo và tái sử dụng symbols
- 🔄 **Variables**: Biến động cho text/colors
- 🔄 **Conditional Visibility**: Hiện/ẩn theo điều kiện

---

## 📊 TỔNG KẾT

### Tính Năng Đã Hoàn Thành: ✅ ~85%
- ✅ Core editor functionality
- ✅ All basic shapes
- ✅ Canvas management
- ✅ Template CRUD operations
- ✅ Database & API
- ✅ Settings panels
- ✅ Export PNG
- ✅ Keyboard shortcuts
- ✅ History (Undo/Redo)
- ✅ Layer management

### Đang Phát Triển: 🔄 ~10%
- 🔄 Data Cards UI implementation
- 🔄 Mermaid diagram rendering
- 🔄 PDF export completion
- 🔄 Advanced alignment tools

### Kế Hoạch Tương Lai: 📝 ~5%
- 📝 Real-time collaboration
- 📝 Advanced effects
- 📝 Template marketplace
- 📝 Mobile responsive

---

## 🎯 SỬ DỤNG THỰC TẾ

A4 Designer có thể được sử dụng cho:

1. **Business Documents**
   - Invoices (Hóa đơn)
   - Proposals (Đề xuất)
   - Reports (Báo cáo)
   - Certificates (Chứng chỉ)

2. **Project Management**
   - Project documentation templates
   - Sprint planning boards
   - Workflow diagrams
   - Timeline visualizations

3. **Design & Presentation**
   - Presentation slides
   - Infographics
   - Marketing materials
   - Social media graphics

4. **Documentation**
   - Technical specifications
   - User manuals
   - Training materials
   - Process diagrams

---

## 📞 Support & Documentation

- 📖 Implementation Guide: `docs/A4_EDITOR_IMPLEMENTATION.md`
- 🚀 Quick Start: `docs/A4_QUICK_START.md`
- 🔗 Integration Guide: `docs/A4_INTEGRATION_GUIDE.md`
- ✅ Test Plan: `docs/A4_EDITOR_TEST_PLAN.md`

---

**Last Updated**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Production Ready (Core Features)
