# 🚀 Hướng Dẫn Test EmailComposer với Tasks

## Vấn Đề Hiện Tại
Trong trang gửi email không hiển thị các task để lựa chọn.

## ✅ Giải Pháp Đã Thực Hiện

### 1. Sửa Main Page
- ✅ Đã thêm `tasks={tasks}` vào EmailComposer component trong `app/page.tsx`
- ✅ EmailComposer giờ đã nhận được danh sách tasks từ database

### 2. Cải Thiện EmailComposer UI  
- ✅ Thêm hiển thị số lượng tasks: "Chọn Task (X task có sẵn)"
- ✅ Thêm thông báo khi không có tasks: "Không có task nào. Hãy tạo task trong mục Daily Tasks trước."
- ✅ Thêm debug logging để kiểm tra data

### 3. Debug Tools
- ✅ Tạo scripts test tự động
- ✅ Tạo script tạo sample tasks

## 🧪 Cách Test

### Bước 1: Tạo Tasks
1. Mở http://localhost:3000
2. Chạy script tạo sample tasks trong browser console:

```javascript
// Copy và paste script từ file create-sample-tasks.js vào console
```

Hoặc tạo tasks thủ công:
1. Click "Daily Tasks" trong sidebar
2. Điền form tạo task mới
3. Click "Add Task" 
4. Lặp lại để tạo 2-3 tasks

### Bước 2: Test EmailComposer
1. Click "Email Composer" trong sidebar  
2. Trong dropdown "Loại Email", chọn "🆕 Thông báo task mới"
3. Kiểm tra xem có hiển thị:
   - "Chọn Task (X task có sẵn)" 
   - Dropdown với danh sách tasks

### Bước 3: Debug (Nếu Vẫn Không Hiển thị)
1. Mở Developer Console (F12)
2. Tìm log: "📧 EmailComposer - Received tasks: X [...]"
3. Nếu tasks = 0, vấn đề ở việc truyền data từ main page
4. Nếu tasks > 0 nhưng không hiển thị, vấn đề ở UI

## 🔍 Debugging Commands

### Check Tasks Data in Console:
```javascript
// Kiểm tra tasks trong localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('task') || key.includes('Task')) {
    console.log(key, localStorage.getItem(key));
  }
});

// Kiểm tra React component state (trong dev mode)
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

### Manual UI Test:
```javascript
// Chạy script test-email-tasks-ui.js để test UI tự động
```

## 📊 Expected Results

### Khi Có Tasks:
- Dropdown "Loại Email" có option "🆕 Thông báo task mới"
- Khi chọn option này, hiển thị "Chọn Task (3 task có sẵn)"
- Click vào dropdown task sẽ thấy danh sách:
  - "Email Test Task 1 - Project Name"
  - "Email Test Task 2 - Project Name"
  - "Email Test Task 3 - Project Name"

### Khi Không Có Tasks:
- Hiển thị "Chọn Task (0 task có sẵn)"
- Alert box: "Không có task nào. Hãy tạo task trong mục Daily Tasks trước."
- Dropdown placeholder: "Không có task nào"

## 🐛 Troubleshooting

### Nếu tasks vẫn không hiển thị:

1. **Check Console Logs:**
   ```
   📧 EmailComposer - Received tasks: 0 []
   ```
   → Vấn đề: Không có tasks trong database

2. **Check Component Props:**
   - Kiểm tra `app/page.tsx` line ~150
   - Đảm bảo có `tasks={tasks}` trong EmailComposer

3. **Check Database:**
   - Đảm bảo tasks được lưu vào database/localStorage
   - Check Daily Tasks component có hoạt động không

4. **Check UI Logic:**
   - Đảm bảo chọn đúng email type: "task_created" hoặc "task_completed"
   - Tasks chỉ hiển thị khi chọn 2 email types này

## 🎯 Test Scripts

1. **create-sample-tasks.js** - Tự động tạo 3 sample tasks
2. **test-email-tasks-ui.js** - Test UI hiển thị tasks  
3. **debug-email-tasks.js** - Debug tổng quát

## 📝 Files Modified

- ✅ `app/page.tsx` - Added tasks prop to EmailComposer
- ✅ `components/email-composer.tsx` - Enhanced UI with task count and alerts
- 📄 `test-*.js` - Created debugging scripts

Sau khi follow các bước trên, bạn sẽ thấy tasks hiển thị trong EmailComposer!
