/**
 * Auto-layout phân tầng (Sugiyama rút gọn) cho sơ đồ luồng.
 *
 * Không có bước này thì sơ đồ AI sinh ra chỉ là một đống hộp chồng lên nhau.
 * Ba bước kinh điển:
 *   1. Xếp hạng  — mỗi node vào một tầng, cạnh luôn đi từ tầng thấp lên cao
 *   2. Sắp thứ tự — hoán vị trong tầng theo trọng tâm (barycenter) để giảm giao cắt
 *   3. Gán toạ độ — quy đổi (tầng, thứ tự) ra pixel
 */

export interface LayoutNode {
  id: string
  width: number
  height: number
}

export interface LayoutEdge {
  source: string
  target: string
}

export interface LayoutOptions {
  /** 'TB' trên xuống dưới (mặc định cho flowchart), 'LR' trái sang phải */
  direction?: 'TB' | 'LR'
  /** Khoảng cách giữa hai tầng */
  rankGap?: number
  /** Khoảng cách giữa hai node cùng tầng */
  nodeGap?: number
  /** Lề trên/trái của toàn sơ đồ */
  marginX?: number
  marginY?: number
}

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>
  width: number
  height: number
}

/**
 * Bước 1 — xếp hạng bằng longest-path trên đồ thị đã loại chu trình.
 *
 * Sơ đồ luồng thực tế hay có vòng lặp ("thất bại → thử lại"), mà thuật toán
 * phân tầng đòi hỏi DAG. Ta duyệt DFS và bỏ qua các cạnh quay ngược (back edge)
 * khi tính hạng — cạnh vẫn được vẽ, chỉ là không tham gia quyết định tầng.
 */
function assignRanks(
  nodeIds: string[],
  edges: LayoutEdge[]
): Map<string, number> {
  const outgoing = new Map<string, string[]>()
  nodeIds.forEach(id => outgoing.set(id, []))
  for (const e of edges) {
    if (e.source === e.target) continue
    if (!outgoing.has(e.source) || !outgoing.has(e.target)) continue
    outgoing.get(e.source)!.push(e.target)
  }

  // Tìm cạnh quay ngược bằng DFS với 3 trạng thái
  const WHITE = 0, GREY = 1, BLACK = 2
  const color = new Map<string, number>(nodeIds.map(id => [id, WHITE]))
  const backEdges = new Set<string>()

  const dfs = (u: string) => {
    color.set(u, GREY)
    for (const v of outgoing.get(u) || []) {
      const c = color.get(v)
      if (c === GREY) backEdges.add(`${u}->${v}`)
      else if (c === WHITE) dfs(v)
    }
    color.set(u, BLACK)
  }
  for (const id of nodeIds) if (color.get(id) === WHITE) dfs(id)

  const dag = edges.filter(
    e => e.source !== e.target && !backEdges.has(`${e.source}->${e.target}`)
  )

  // Longest-path: hạng của node = 1 + hạng lớn nhất của các node trỏ tới nó
  const incoming = new Map<string, string[]>()
  const outDeg = new Map<string, string[]>()
  nodeIds.forEach(id => { incoming.set(id, []); outDeg.set(id, []) })
  for (const e of dag) {
    if (!incoming.has(e.target) || !outDeg.has(e.source)) continue
    incoming.get(e.target)!.push(e.source)
    outDeg.get(e.source)!.push(e.target)
  }

  const rank = new Map<string, number>()
  const pending = new Map<string, number>(
    nodeIds.map(id => [id, incoming.get(id)!.length])
  )
  const queue = nodeIds.filter(id => pending.get(id) === 0)
  queue.forEach(id => rank.set(id, 0))

  while (queue.length) {
    const u = queue.shift()!
    for (const v of outDeg.get(u) || []) {
      rank.set(v, Math.max(rank.get(v) ?? 0, (rank.get(u) ?? 0) + 1))
      pending.set(v, pending.get(v)! - 1)
      if (pending.get(v) === 0) queue.push(v)
    }
  }

  // Node còn sót (nằm trong cụm chu trình kín) — xếp vào tầng 0
  for (const id of nodeIds) if (!rank.has(id)) rank.set(id, 0)

  return rank
}

/**
 * Bước 2 — giảm giao cắt bằng barycenter.
 * Lặp vài lượt xuôi/ngược: mỗi node dời về vị trí trung bình của các node
 * liền kề ở tầng trước, rồi sắp lại thứ tự trong tầng theo giá trị đó.
 */
function orderWithinRanks(
  layers: string[][],
  edges: LayoutEdge[],
  passes = 4
): void {
  const preds = new Map<string, string[]>()
  const succs = new Map<string, string[]>()
  for (const e of edges) {
    if (e.source === e.target) continue
    if (!preds.has(e.target)) preds.set(e.target, [])
    if (!succs.has(e.source)) succs.set(e.source, [])
    preds.get(e.target)!.push(e.source)
    succs.get(e.source)!.push(e.target)
  }

  const indexIn = (layer: string[]) =>
    new Map(layer.map((id, i) => [id, i]))

  for (let pass = 0; pass < passes; pass++) {
    const downward = pass % 2 === 0
    const range = downward
      ? [...layers.keys()].slice(1)
      : [...layers.keys()].slice(0, -1).reverse()

    for (const li of range) {
      const refLayer = layers[downward ? li - 1 : li + 1]
      const refIndex = indexIn(refLayer)
      const neighbours = downward ? preds : succs

      const scored = layers[li].map((id, i) => {
        const adj = (neighbours.get(id) || [])
          .map(n => refIndex.get(n))
          .filter((v): v is number => v !== undefined)
        // Node không có hàng xóm ở tầng tham chiếu thì giữ nguyên chỗ
        const bary = adj.length
          ? adj.reduce((a, b) => a + b, 0) / adj.length
          : i
        return { id, bary, i }
      })

      scored.sort((a, b) => a.bary - b.bary || a.i - b.i)
      layers[li] = scored.map(s => s.id)
    }
  }
}

export function layeredLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: LayoutOptions = {}
): LayoutResult {
  const {
    direction = 'TB',
    rankGap = 90,
    nodeGap = 48,
    marginX = 60,
    marginY = 60,
  } = options

  const positions = new Map<string, { x: number; y: number }>()
  if (!nodes.length) return { positions, width: 0, height: 0 }

  const byId = new Map(nodes.map(n => [n.id, n]))
  const ids = nodes.map(n => n.id)

  const rank = assignRanks(ids, edges)
  const maxRank = Math.max(...ids.map(id => rank.get(id) ?? 0))

  const layers: string[][] = Array.from({ length: maxRank + 1 }, () => [])
  for (const id of ids) layers[rank.get(id) ?? 0].push(id)

  orderWithinRanks(layers, edges)

  // Kích thước dọc theo trục "tầng" và trục "trong tầng"
  const alongRank = (n: LayoutNode) => (direction === 'TB' ? n.height : n.width)
  const acrossRank = (n: LayoutNode) => (direction === 'TB' ? n.width : n.height)

  // Vị trí bắt đầu của từng tầng trên trục tầng
  const layerOffsets: number[] = []
  let cursor = 0
  for (const layer of layers) {
    layerOffsets.push(cursor)
    const tallest = Math.max(...layer.map(id => alongRank(byId.get(id)!)), 0)
    cursor += tallest + rankGap
  }
  const totalAlong = Math.max(cursor - rankGap, 0)

  // Bề rộng mỗi tầng, để căn giữa các tầng với nhau
  const layerSpans = layers.map(layer =>
    layer.reduce((sum, id) => sum + acrossRank(byId.get(id)!), 0) +
    Math.max(layer.length - 1, 0) * nodeGap
  )
  const widestSpan = Math.max(...layerSpans, 0)

  layers.forEach((layer, li) => {
    let across = (widestSpan - layerSpans[li]) / 2
    for (const id of layer) {
      const n = byId.get(id)!
      const along = layerOffsets[li]

      positions.set(
        id,
        direction === 'TB'
          ? { x: Math.round(marginX + across), y: Math.round(marginY + along) }
          : { x: Math.round(marginX + along), y: Math.round(marginY + across) }
      )
      across += acrossRank(n) + nodeGap
    }
  })

  return direction === 'TB'
    ? {
        positions,
        width: Math.round(widestSpan + marginX * 2),
        height: Math.round(totalAlong + marginY * 2),
      }
    : {
        positions,
        width: Math.round(totalAlong + marginX * 2),
        height: Math.round(widestSpan + marginY * 2),
      }
}
