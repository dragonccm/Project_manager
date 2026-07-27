import { z } from 'zod'

/**
 * Hợp đồng dữ liệu giữa LLM và trình vẽ.
 *
 * Model chỉ mô tả đồ thị ở mức logic (node + cạnh); toàn bộ toạ độ do
 * auto-layout tính. Bắt model tự đặt x/y luôn cho ra sơ đồ chồng chéo.
 */

export const NODE_KINDS = [
  'start',      // điểm bắt đầu
  'end',        // điểm kết thúc
  'process',    // bước xử lý thông thường
  'decision',   // điểm rẽ nhánh (câu hỏi có/không)
  'data',       // dữ liệu, kho lưu trữ
  'milestone',  // cột mốc dự án
  'external',   // hệ thống/bên thứ ba
] as const

export type NodeKind = (typeof NODE_KINDS)[number]

export const DIAGRAM_KINDS = ['system-flow', 'project-timeline', 'seo-campaign'] as const
export type DiagramKind = (typeof DIAGRAM_KINDS)[number]

const nodeSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  kind: z.enum(NODE_KINDS).default('process'),
  /** Mô tả chi tiết, hiện ở tooltip và dùng làm nội dung task khi xuất */
  detail: z.string().max(500).optional(),
  /** Ước lượng thời gian (phút) — dùng khi xuất sang task */
  estimateMinutes: z.number().int().min(0).max(100000).optional(),
})

const edgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  /** Nhãn nhánh, ví dụ "Đạt" / "Không đạt" */
  label: z.string().max(60).optional(),
})

export const diagramSchema = z.object({
  title: z.string().min(1).max(160),
  summary: z.string().max(600).optional(),
  nodes: z.array(nodeSchema).min(1).max(60),
  edges: z.array(edgeSchema).max(150).default([]),
})

export type DiagramNode = z.infer<typeof nodeSchema>
export type DiagramEdge = z.infer<typeof edgeSchema>
export type DiagramSpec = z.infer<typeof diagramSchema>

/**
 * Chuẩn hoá kết quả từ model.
 *
 * Model hay bịa cạnh trỏ tới node không tồn tại, hoặc lặp id. Thay vì ném lỗi
 * và bắt người dùng sinh lại, ta lọc bỏ phần hỏng và báo cáo lại — sơ đồ 90%
 * đúng vẫn dùng được, còn ném lỗi thì mất trắng.
 */
export interface NormalizeResult {
  spec: DiagramSpec
  warnings: string[]
}

export function normalizeDiagram(raw: unknown): NormalizeResult {
  const parsed = diagramSchema.parse(raw)
  const warnings: string[] = []

  // Loại id trùng, giữ node xuất hiện trước
  const seen = new Set<string>()
  const nodes: DiagramNode[] = []
  for (const n of parsed.nodes) {
    if (seen.has(n.id)) {
      warnings.push(`Bỏ node trùng id "${n.id}"`)
      continue
    }
    seen.add(n.id)
    nodes.push(n)
  }

  // Loại cạnh trỏ tới node không tồn tại và cạnh lặp
  const edgeKeys = new Set<string>()
  const edges: DiagramEdge[] = []
  for (const e of parsed.edges) {
    if (!seen.has(e.source) || !seen.has(e.target)) {
      warnings.push(`Bỏ cạnh ${e.source} → ${e.target} (node không tồn tại)`)
      continue
    }
    const key = `${e.source}->${e.target}->${e.label ?? ''}`
    if (edgeKeys.has(key)) continue
    edgeKeys.add(key)
    edges.push(e)
  }

  return {
    spec: { title: parsed.title, summary: parsed.summary, nodes, edges },
    warnings,
  }
}

/** Hướng dẫn chung, áp cho mọi loại sơ đồ */
const BASE_RULES = `Bạn là trợ lý lập kế hoạch cho một công cụ quản lý dự án. Nhiệm vụ: chuyển yêu cầu của người dùng thành MỘT sơ đồ có cấu trúc.

Chỉ trả về JSON hợp lệ, không kèm giải thích, không bọc trong markdown. Đúng dạng:
{
  "title": "tiêu đề ngắn gọn",
  "summary": "1-2 câu tóm tắt",
  "nodes": [
    { "id": "n1", "label": "Tên bước", "kind": "process", "detail": "mô tả", "estimateMinutes": 120 }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "label": "nhãn nhánh nếu cần" }
  ]
}

Quy tắc bắt buộc:
- "kind" chỉ nhận: start, end, process, decision, data, milestone, external
- Mỗi sơ đồ có đúng 1 node "start". Có ít nhất 1 node "end".
- Node "decision" phải có ÍT NHẤT 2 cạnh đi ra, mỗi cạnh có "label" rõ ràng (ví dụ "Đạt"/"Không đạt").
- "id" ngắn, không dấu, không khoảng trắng (n1, n2, ...).
- "label" viết TIẾNG VIỆT có dấu đầy đủ, tối đa 8 từ, là động từ hành động.
- "detail" mô tả cụ thể việc cần làm, tiếng Việt có dấu.
- "estimateMinutes" là ước lượng thực tế theo phút, chỉ đặt cho node process/milestone.
- Đồ thị phải liên thông: mọi node đều đến được từ "start".
- KHÔNG tự đặt toạ độ x/y. Vị trí do hệ thống tự tính.
- Số node: 8-20. Đủ chi tiết để làm việc, không liệt kê vụn vặt.`

const KIND_RULES: Record<DiagramKind, string> = {
  'system-flow': `Loại sơ đồ: LUỒNG CHỨC NĂNG HỆ THỐNG.
Mô tả cách người dùng và hệ thống tương tác để hoàn thành nghiệp vụ.
- Dùng "external" cho dịch vụ bên thứ ba (cổng thanh toán, API, email).
- Dùng "data" cho nơi đọc/ghi dữ liệu (CSDL, cache, file).
- Dùng "decision" cho mọi điểm kiểm tra: xác thực, phân quyền, validate.
- Phải thể hiện cả nhánh THẤT BẠI, đừng chỉ vẽ đường đi lý tưởng.`,

  'project-timeline': `Loại sơ đồ: TIẾN TRÌNH DỰ ÁN.
Chia dự án thành các giai đoạn tuần tự để theo dõi tiến độ.
- Dùng "milestone" cho mốc bàn giao/nghiệm thu.
- Dùng "process" cho công việc thực thi.
- Dùng "decision" cho điểm duyệt (review, phê duyệt của khách hàng).
- "estimateMinutes" BẮT BUỘC có ở mọi node process và milestone — đây là cơ sở để lập lịch.
- Sắp xếp theo thứ tự thời gian thực hiện.`,

  'seo-campaign': `Loại sơ đồ: QUY TRÌNH CHIẾN DỊCH SEO.
Vạch quy trình tối ưu SEO từ khảo sát tới đo lường.
- Bao phủ đủ: nghiên cứu từ khoá, audit kỹ thuật, tối ưu on-page, nội dung, backlink, đo lường.
- Dùng "data" cho bước thu thập/phân tích dữ liệu (Search Console, Analytics, công cụ từ khoá).
- Dùng "decision" cho điểm đánh giá kết quả (thứ hạng có cải thiện không, có cần điều chỉnh không).
- Phải có vòng lặp cải tiến: từ bước đo lường quay lại bước tối ưu.
- "estimateMinutes" BẮT BUỘC có ở mọi node process.`,
}

export function buildPrompt(kind: DiagramKind, userInput: string, projectContext?: string) {
  const context = projectContext?.trim()
    ? `\n\nBối cảnh dự án hiện tại:\n${projectContext.trim()}`
    : ''

  return {
    system: `${BASE_RULES}\n\n${KIND_RULES[kind]}`,
    user: `Yêu cầu của người dùng:\n${userInput.trim()}${context}\n\nTrả về JSON theo đúng cấu trúc trên.`,
  }
}
