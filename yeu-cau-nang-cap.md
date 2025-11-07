Mục tiêu: Hoàn thiện module "Thiết kế A4" thành một editor hoàn chỉnh, linh hoạt, dễ dùng và tích hợp được với Note / Mail / Account / Project / Task.

Yêu cầu chức năng (chi tiết, đầy đủ)
1. Canvas A4
  - A4 là một vùng in ấn có kích thước cố định theo template nhưng có thể lưu thành mẫu.
  - Sau khi lưu mẫu phải có khả năng "link" (liên kết) mẫu này tới Note, Mail, Account, Project, Task (ví dụ: kéo thẻ mẫu vào note hoặc đính kèm vào email).
  - Ngoại lệ: người dùng có thể chuyển sang chế độ "linh hoạt" (non-A4) để vẽ tự do.

2. Shapes & Widgets
  - Hỗ trợ đa dạng shapes (chữ nhật, elip, đường thẳng, mũi tên, hình đa giác, text box, hình ảnh...), không chỉ 1 hình chữ nhật mặc định.
  - Cung cấp widget đặc biệt dạng "thẻ" để gắn dữ liệu hệ thống: Note, Account, Project, Task. Thẻ này:
    - Hiển thị tóm tắt (title, id, nhãn).
    - Có hành động kéo-thả vào/ra khỏi vùng A4 hoặc canvas linh hoạt.
    - Có cấu hình hiển thị (size, color, icon, border, padding).

3. Editor & UX
  - Editor phải hoạt động như một trình soạn/thiết kế hoàn chỉnh (select, resize, align, group, layer, undo/redo, snap to grid).
  - Thanh điều chỉnh (toolbox / panel thiết lập design) không để phía dưới nữa mà đặt cố định ở bên trái (left toolbar) theo mặc định.
  - Có nút Full Screen: khi bật thì editor sẽ mở rộng, chiếm luôn khu vực sidebar mặc định (sidebar bị ẩn lùi) để có diện tích làm việc lớn hơn.
  - Cho phép bật/tắt lưới (grid) và chế độ snap-to-grid.

4. Cấu hình thẻ (inside/outside A4)
  - Mỗi thẻ (widget) có nhiều setting: size, font, màu nền, border, shadow, data binding (liên kết đến Note/Account/Project/Task), permission (read-only/edit), metadata (tags, dates).
  - Cài đặt này áp dụng cho thẻ nằm trong A4 và thẻ ngoài A4; phải có UI để chuyển nhanh giữa hai trạng thái và giữ consistency khi kéo thẻ qua lại.

5. Canvas linh hoạt & tự mở rộng
  - Chế độ "linh hoạt" hoạt động giống draw.io:
    - Khi vẽ/chèn phần tử chạm đến viền canvas, grid tự động mở rộng về bên đó.
    - Hỗ trợ pan/zoom, auto-scroll khi kéo phần tử ra khỏi vùng nhìn thấy.
  - Hỗ trợ chuyển đổi giữa chế độ A4 cố định và canvas linh hoạt mà giữ nguyên vị trí phần tử tương đối.

6. Mermaid UML Use Case Diagram
  - Thêm tuỳ chọn nhập mã Mermaid (UML Use Case Diagram).
  - Hệ thống parse và render biểu đồ từ mã Mermaid trong editor.
  - Sau khi render, biểu đồ có thể chuyển thành một "thẻ" (draggable card) trên grid/canvas; kéo thả card vào vùng A4 sẽ hiển thị biểu đồ tương ứng trong vùng đó.
  - Hỗ trợ chỉnh sửa mã Mermaid và rerender tức thì.

7. Lưu mẫu & tích hợp
  - Có chức năng lưu mẫu thiết kế A4 (template) với tất cả settings và widget đính kèm.
  - Mẫu đã lưu có thể:
    - Đính kèm/linked vào Note, Mail, Account, Project, Task.
    - Import/Export (JSON template) để chia sẻ.
  - Phiên bản mẫu cần lưu lịch sử (versioning) và khả năng phục hồi.

8. Các tính năng bổ trợ (tối thiểu)
  - Xuất PDF/PNG của trang A4.
  - Preview before export/print.
  - Accessibility: keyboard shortcuts cho thao tác phổ biến.
  - Hiệu suất: lazy render cho canvas lớn, tối ưu memoria khi nhiều widget.

Yêu cầu phi chức năng
- Tương thích với responsive layout (nhưng A4 in theo kích thước cố định khi in).
- Mức độ bảo mật: khi gắn dữ liệu (note/account/project/task) phải tuân theo quyền truy cập của người dùng.
- Ghi log thao tác quan trọng (save template, export, link/unlink).

Kết quả mong đợi
- Editor A4 đa dụng, cho phép thiết kế in ấn lẫn thiết kế linh hoạt, tích hợp sâu với hệ thống Note/Mail/Project/Task, hỗ trợ Mermaid và có UX trực quan (left toolbar, full-screen, grid auto-expand).

Ghi chú: tất cả yêu cầu trên phải được implement sao cho dễ test (unit/integration) và có API/endpoint để lưu/mượn template, render mermaid và liên kết dữ liệu.