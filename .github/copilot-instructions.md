# Dragonccm Project Manager — AI Coding Agent Instructions

## Tổng quan
Ứng dụng quản lý dự án: dự án, tài khoản, task (bảng Trello), ghi chú, email,
trình thiết kế trang A4, và chia sẻ qua link công khai.

### Tech stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS + Radix UI (shadcn) trong `components/ui/`
- **Database**: MongoDB Atlas, truy cập bằng driver `mongodb` thô
- **Auth**: tự viết — JWT trong cookie `auth-token`, bcrypt, session lưu DB
- **Email**: Nodemailer qua SMTP
- **Canvas**: Konva / react-konva (trình thiết kế A4)
- **Export**: jsPDF (PDF), CSV

### Cấu trúc
```
├── app/
│   ├── api/               # REST routes
│   ├── admin/, share/, email-designer/
│   ├── layout.tsx         # providers gốc
│   └── page.tsx           # dashboard SPA, đổi màn hình bằng state activeTab
├── components/
│   ├── ui/                # shadcn — dùng lại, không chứa nghiệp vụ
│   ├── layout/            # Sidebar, Header
│   └── auth/              # AuthModal
├── features/<domain>/     # nghiệp vụ: projects, tasks, accounts, notes,
│                          # emails, a4-editor, admin, auth, settings, share
├── hooks/                 # use-api (hook dữ liệu chính), use-auth, use-language…
├── lib/                   # mongo-database.ts, auth-*, email, pdf-export, utils
└── types/                 # interface dùng chung
```

## Quy tắc bắt buộc

### 1. Chỉ có MỘT lớp database: `lib/mongo-database.ts`
Trước đây dự án có 3 lớp DB song song (`lib/database.ts` dùng Mongoose,
`lib/api/database.ts` gọi fetch) — chúng đã bị xoá vì tạo ra các collection
trùng lặp trong Atlas (`codecomponents` vs `code_components`). **Không tạo lại
lớp truy cập DB thứ hai.** Mọi truy vấn đi qua `lib/mongo-database.ts`.

### 2. Mọi hàm DB thao tác dữ liệu người dùng PHẢI nhận `userId` và đưa vào filter
Đây là lỗi từng tồn tại trong dự án: một số hàm query theo `_id` mà không kèm
`user_id`, cho phép user A đọc/sửa/xoá dữ liệu của user B.

```typescript
// ĐÚNG
export async function deleteThing(id: string, userId: string) {
  const result = await db.collection('things')
    .deleteOne({ _id: new ObjectId(id), user_id: userId })
  return result.deletedCount > 0
}

// SAI — thiếu user_id trong filter
export async function deleteThing(id: string) {
  await db.collection('things').deleteOne({ _id: new ObjectId(id) })
}
```
Ngoài ra: luôn `ObjectId.isValid(id)` trước khi `new ObjectId(id)` (chuỗi rác
sẽ ném lỗi 500), và loại `user_id` khỏi payload update để client không tự đổi
chủ sở hữu bản ghi.

### 3. Mọi route thao tác dữ liệu PHẢI bọc `withAuth`
```typescript
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  const data = await getThings(request.user.id)
  return NextResponse.json(data)
})
```

### 4. Next.js 16: `params` là Promise
```typescript
type RouteContext = { params: Promise<{ id: string }> }

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: RouteContext) => {
  const { id } = await params   // BẮT BUỘC await
})
```
Đọc thẳng `params.id` sẽ ra `undefined` và handler chạy sai mà không báo lỗi.

### 5. Không log dữ liệu nhạy cảm, không trả `password_hash` về client

### 6. Khoá AI chỉ tồn tại ở server
`lib/ai/inference-client.ts` mở đầu bằng `import 'server-only'` — build sẽ FAIL
nếu có component client lỡ import nó. Mọi lệnh gọi model đi qua `/api/ai/*`.
**Không bao giờ** đặt prefix `NEXT_PUBLIC_` cho `AI_API_KEY`.

## Trình vẽ sơ đồ

| Module | Vai trò |
|---|---|
| `lib/diagram/layout.ts` | Auto-layout phân tầng (Sugiyama rút gọn), xử lý được đồ thị có chu trình |
| `lib/diagram/edge-routing.ts` | Định tuyến cạnh vuông góc, tách làn, vòng tránh vật cản |
| `lib/diagram/spec-to-shapes.ts` | Đồ thị logic → `Shape[]` cho canvas |
| `lib/ai/diagram-schema.ts` | Zod schema + prompt cho 3 preset sơ đồ |
| `components/ai-diagram-dialog.tsx` | UI nhập yêu cầu, xem trước, chèn, xuất task |

**Cạnh là quan hệ, không phải toạ độ.** `ArrowShape`/`LineShape` có `source`/
`target` trỏ tới id hình. Renderer tính lại đường đi mỗi lần vẽ, nên kéo node là
mũi tên đi theo. Đừng lưu toạ độ cứng vào `points` cho cạnh đã gắn node.

**Nhãn node nằm trong hộp** (`BaseShape.label`), không phải shape text riêng.
Text riêng đè lên hộp sẽ chắn click và bị bỏ lại khi kéo hộp.

**Konva cần ghi ngược state.** Mọi hình kéo được phải có `onDragEnd` và
`onTransformEnd` cập nhật `shapes`; Konva chỉ dịch chuyển node trên canvas, không
tự đồng bộ với React.

**Đừng dịch cạnh bằng lệnh.** Cạnh gắn node render ở `x=0, y=0` với toạ độ tuyệt
đối trong `points`. Nếu gọi `node.position()` lên nó, react-konva sẽ KHÔNG hoàn
tác (prop x/y vẫn là 0 nên nó coi như không đổi) và cạnh kẹt ở chỗ sai. Mọi thao
tác di chuyển nhóm phải lọc bỏ cạnh trước.

**Thao tác chuột nhanh cần ref, không dùng state.** Với kéo-thả rất nhanh,
`mouseup` có thể chạy trước khi React re-render, khiến handler đọc state vẫn thấy
giá trị cũ. Trạng thái nối hình và khung quét chọn giữ trong `useRef`, state chỉ
để vẽ.

**Vùng chọn là `selectedIds: string[]`.** `selectedId` chỉ là giá trị dẫn xuất
cho bảng thuộc tính (có nghĩa khi chọn đúng một hình). Shift+click thêm/bớt,
kéo trên nền trống để quét chọn, Ctrl+A chọn tất cả.

## Bảng ánh xạ collection

| Khái niệm trong UI | Collection MongoDB | Ghi chú |
|---|---|---|
| Note | `code_components` | Dùng chung với code component, phân biệt bằng `component_type` |
| Project | `projects` | |
| Account | `accounts` | |
| Task | `tasks` | |
| Report template | `report_templates` | |
| A4 template | `a4templates` | |
| Share link | `shares` | |
| User / Session | `users` / `sessions` | |

## Lệnh

```bash
npm run dev        # dev server
npm run build      # build production
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Biến môi trường: copy `.env.example` → `.env`. Bắt buộc có `MONGODB_URI` và
`JWT_SECRET`. Muốn dùng sinh sơ đồ bằng AI thì cần thêm `AI_BASE_URL`,
`AI_API_KEY`, `AI_MODEL` (thông số hạ tầng ở `INFERENCE_STACK.md`, file này đã
được gitignore vì chứa key). Kiểm tra kết nối DB: `GET /api/test-db`, kiểm tra
app: `GET /api/health`, kiểm tra AI đã cấu hình chưa: `GET /api/ai/diagram`.

## Điểm cần biết

- `next.config.mjs` đang đặt `eslint.ignoreDuringBuilds` và
  `typescript.ignoreBuildErrors` = true, nên `npm run build` **không** chặn lỗi
  type. Chạy `npm run typecheck` thủ công trước khi commit.
- Còn lỗi type tồn đọng ở `features/a4-editor/a4-editor.tsx` (react-konva 19
  không khai báo prop `children`), `components/shape-settings-panel.tsx` (type
  `Shape` thiếu field), `features/settings/settings-panel.tsx`.
- `components/ui/` còn một số component shadcn chưa dùng đến — giữ lại làm thư viện.
- Chưa có realtime: `lib/socket-server.ts` đã bị xoá vì không được nối vào app.
  Nếu cần collaboration thì phải làm lại từ đầu (Next.js trên Vercel không chạy
  được Socket.io server trong cùng process).
