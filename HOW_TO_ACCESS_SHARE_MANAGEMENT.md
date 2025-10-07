# 🎯 Cách Truy Cập Share Management (Quản Lý Chia Sẻ)

## 📍 Truy Cập Từ Dashboard Chính:

### **Cách Duy Nhất: Từ Sidebar (Menu Chính)** ✨
1. Mở ứng dụng: `http://localhost:3000`
2. Nhìn vào sidebar bên trái
3. Tìm và click vào **"Admin Panel"** (icon hình cái khiên 🛡️)
4. Share Management sẽ hiển thị ngay trong dashboard (không redirect)

> **Lưu ý**: Share Management hiện đã được tích hợp vào dashboard chính, sử dụng cùng layout với các tính năng khác (Projects, Accounts, Tasks, etc.)

---

## 🎨 Vị Trí Menu Item

Menu "Admin Panel" nằm ở **cuối cùng** trong sidebar, sau:
- Dashboard
- Projects
- Accounts
- Daily Tasks
- Task Overview
- Reports
- Notes
- Settings
- Email Composer
- Email Settings
- **👉 Admin Panel** ← ĐÂY NÈ! 🛡️

---

## 🌐 Hỗ Trợ Đa Ngôn Ngữ

- **English**: "Admin Panel"
- **Tiếng Việt**: "Quản trị"

---

## ⚡ Tính Năng Khi Click:

Khi click vào "Admin Panel" trong sidebar:
1. ✅ Dashboard chuyển sang tab Share Management
2. ✅ Giữ nguyên layout và navigation
3. ✅ Hiển thị ngay giao diện quản lý share

---

## 📊 Share Management Có Gì?

Khi vào tab này, bạn sẽ thấy:

### **Sidebar Navigation** 🔝
- Sidebar bên trái với tất cả menu items
- Admin Panel được highlight khi active
- Logo và theme toggle ở trên cùng

### **Statistics Cards** 📈
- **Total Shares**: Tổng số share đã tạo
- **Active Shares**: Số share đang hoạt động (màu xanh)
- **Inactive Shares**: Số share đã tắt (màu đỏ)

### **Filters & Search** 🔍
- **Search Box**: Tìm kiếm theo token, tên, hoặc ID
- **Resource Type Dropdown**: Lọc theo loại (Task/Note/Account/Project/Report)
- **Status Dropdown**: Lọc theo trạng thái (All/Active/Inactive)

### **Data Table** 📋
Hiển thị tất cả shares với các cột:
- **Resource Type**: Loại tài nguyên (badge màu)
- **Token**: Mã share (8 ký tự đầu)
- **Views**: Số lượt xem + thời gian truy cập cuối
- **Created**: Ngày tạo
- **Expires**: Ngày hết hạn
- **Status**: Active (xanh) / Inactive (đỏ)
- **Actions**: Các nút hành động

### **Action Buttons** ⚡
Mỗi share có 5 nút:
1. 📋 **Copy Link**: Sao chép URL share
2. 🔗 **Open Link**: Mở share trong tab mới
3. 📅 **Update Expiry**: Đổi thời hạn
4. 🔌 **Enable/Disable**: Bật/tắt share
5. 🗑️ **Delete**: Xóa share

### **Pagination** 📄
- Hiển thị: "Showing 1 - 20 of 100"
- Nút Previous/Next để chuyển trang

---

## 🎬 Demo Flow Hoàn Chỉnh

```
1. Mở Dashboard (http://localhost:3000)
   ↓
2. Click "Admin Panel" 🛡️ trong sidebar
   ↓
3. Dashboard chuyển sang tab Share Management (instant, không reload)
   ↓
4. Xem toàn bộ shares trong table
   ↓
5. Dùng filters để tìm share cụ thể
   ↓
6. Click actions để quản lý shares
```

---

## ✅ Checklist Kiểm Tra

- [x] Sidebar có item "Admin Panel" với icon Shield
- [x] Click vào "Admin Panel" chuyển tab ngay lập tức
- [x] Share Management hiển thị trong layout chính (không tách biệt)
- [x] Hiển thị statistics cards
- [x] Filters và search hoạt động
- [x] Table hiển thị dữ liệu
- [x] Action buttons hoạt động
- [x] Pagination hoạt động
- [x] Hỗ trợ cả tiếng Anh và tiếng Việt
- [x] Layout nhất quán với các tính năng khác (Projects, Accounts, etc.)

---

## 🐛 Troubleshooting

### **Không thấy menu "Admin Panel"?**
- Đảm bảo đã refresh trang
- Xóa cache trình duyệt (Ctrl + Shift + R)
- Kiểm tra file `app/page.tsx` có import ShareManagement component

### **Click vào nhưng không hiển thị?**
- Mở Browser Console (F12)
- Kiểm tra có lỗi JavaScript không
- Đảm bảo server đang chạy
- Kiểm tra component `features/admin/share-management.tsx` tồn tại

### **Component không render đúng?**
- Kiểm tra file `features/admin/share-management.tsx`
- Đảm bảo export function ShareManagement() đúng
- Restart development server: `npm run dev`

---

## 🎉 Kết Luận

**Share Management hiện đã được tích hợp vào Dashboard chính!**

Truy cập bằng cách:
- **Qua sidebar**: Click "Admin Panel" 🛡️ (Tab switching - không reload)

Tính năng Share Management cho phép bạn:
- ✅ Xem tất cả shares
- ✅ Lọc và tìm kiếm
- ✅ Quản lý (copy, open, update, disable, delete)
- ✅ Xem analytics (views, access time)
- ✅ Sử dụng bằng tiếng Anh hoặc tiếng Việt
- ✅ Layout nhất quán với các tính năng khác

**Enjoy! 🚀**
