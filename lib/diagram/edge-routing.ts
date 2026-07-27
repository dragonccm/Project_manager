import type { Shape, EdgeAnchor, EdgeBinding } from '@/types/database'

/**
 * Định tuyến cạnh cho sơ đồ luồng.
 *
 * Mô hình cũ lưu toạ độ thô trong `points`, nên kéo một khối thì mũi tên đứng
 * yên tại chỗ. Ở đây cạnh chỉ giữ tham chiếu `source`/`target` tới id hình, còn
 * đường đi được tính lại mỗi lần render từ vị trí thật của hai hình.
 */

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
  cx: number
  cy: number
}

const DEFAULT_W = 120
const DEFAULT_H = 60

export function getShapeBounds(shape: Shape): Bounds {
  const width = shape.width ?? DEFAULT_W
  const height = shape.height ?? DEFAULT_H
  return {
    x: shape.x,
    y: shape.y,
    width,
    height,
    cx: shape.x + width / 2,
    cy: shape.y + height / 2,
  }
}

export type Side = 'top' | 'right' | 'bottom' | 'left'

/**
 * Toạ độ điểm neo trên chu vi hình.
 *
 * `offset` dịch điểm neo dọc theo chính cạnh đó. Cần thiết khi hai hình có
 * nhiều hơn một cạnh nối: nếu đều cắm vào điểm giữa thì các mũi tên chồng khít
 * lên nhau và không đọc được. Offset bị kẹp lại để không trượt khỏi cạnh.
 */
export function anchorPoint(b: Bounds, side: Side, offset = 0): { x: number; y: number } {
  const limitX = Math.max(0, b.width / 2 - 12)
  const limitY = Math.max(0, b.height / 2 - 10)
  const dx = Math.max(-limitX, Math.min(limitX, offset))
  const dy = Math.max(-limitY, Math.min(limitY, offset))

  switch (side) {
    case 'top': return { x: b.cx + dx, y: b.y }
    case 'bottom': return { x: b.cx + dx, y: b.y + b.height }
    case 'left': return { x: b.x, y: b.cy + dy }
    case 'right': return { x: b.x + b.width, y: b.cy + dy }
  }
}

/**
 * Chọn cặp cạnh vào/ra khi anchor để 'auto'.
 * Trục nào chênh lệch nhiều hơn thì đi theo trục đó — cùng cách draw.io quyết
 * định "floating connection", và nhờ vậy cạnh tự đổi hướng khi kéo khối.
 */
function autoSides(s: Bounds, t: Bounds): { from: Side; to: Side } {
  const dx = t.cx - s.cx
  const dy = t.cy - s.cy

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0 ? { from: 'right', to: 'left' } : { from: 'left', to: 'right' }
  }
  return dy >= 0 ? { from: 'bottom', to: 'top' } : { from: 'top', to: 'bottom' }
}

function resolveSide(anchor: EdgeAnchor | undefined, fallback: Side): Side {
  return !anchor || anchor === 'auto' ? fallback : anchor
}

const isVertical = (side: Side) => side === 'top' || side === 'bottom'

/**
 * Sinh đường gấp khúc 90° giữa hai điểm neo.
 * `stub` là đoạn thẳng ngắn nhô ra khỏi hình trước khi bẻ góc, giúp mũi tên
 * không dính sát mép và nhìn ra được nó xuất phát từ cạnh nào.
 */
function orthogonalPath(
  from: { x: number; y: number },
  fromSide: Side,
  to: { x: number; y: number },
  toSide: Side,
  stub = 20
): number[] {
  const push = (p: { x: number; y: number }, side: Side, d: number) => {
    switch (side) {
      case 'top': return { x: p.x, y: p.y - d }
      case 'bottom': return { x: p.x, y: p.y + d }
      case 'left': return { x: p.x - d, y: p.y }
      case 'right': return { x: p.x + d, y: p.y }
    }
  }

  const a = push(from, fromSide, stub)
  const b = push(to, toSide, stub)

  const pts: Array<{ x: number; y: number }> = [from, a]

  if (isVertical(fromSide) && isVertical(toSide)) {
    // Cùng đi theo trục dọc: bẻ ngang ở khoảng giữa
    const midY = (a.y + b.y) / 2
    pts.push({ x: a.x, y: midY }, { x: b.x, y: midY })
  } else if (!isVertical(fromSide) && !isVertical(toSide)) {
    // Cùng trục ngang: bẻ dọc ở khoảng giữa
    const midX = (a.x + b.x) / 2
    pts.push({ x: midX, y: a.y }, { x: midX, y: b.y })
  } else if (isVertical(fromSide)) {
    // Ra theo dọc, vào theo ngang → một góc vuông
    pts.push({ x: a.x, y: b.y })
  } else {
    pts.push({ x: b.x, y: a.y })
  }

  pts.push(b, to)

  // Bỏ các điểm trùng nhau và các điểm thẳng hàng thừa
  return simplify(pts)
}

function simplify(pts: Array<{ x: number; y: number }>): number[] {
  const out: Array<{ x: number; y: number }> = []

  for (const p of pts) {
    const last = out[out.length - 1]
    if (last && Math.abs(last.x - p.x) < 0.5 && Math.abs(last.y - p.y) < 0.5) continue
    out.push(p)
  }

  // Gộp 3 điểm thẳng hàng thành 2
  for (let i = out.length - 2; i > 0; i--) {
    const a = out[i - 1]
    const b = out[i]
    const c = out[i + 1]
    const collinear =
      (Math.abs(a.x - b.x) < 0.5 && Math.abs(b.x - c.x) < 0.5) ||
      (Math.abs(a.y - b.y) < 0.5 && Math.abs(b.y - c.y) < 0.5)
    if (collinear) out.splice(i, 1)
  }

  return out.flatMap(p => [p.x, p.y])
}

/**
 * Cạnh quay ngược (node đích nằm PHÍA TRÊN node nguồn trong luồng dọc).
 *
 * Đi thẳng lên sẽ xuyên qua mọi node nằm giữa và chồng lên cạnh xuôi. Thay vào
 * đó vòng hẳn ra bên phải cột — đúng cách draw.io và dagre vẽ vòng lặp.
 */
/** Đoạn thẳng đứng/nằm ngang có xuyên qua hình chữ nhật không */
function segmentHitsBox(
  x1: number, y1: number, x2: number, y2: number, b: Bounds
): boolean {
  // Chừa 3px để hai đầu mút nằm sát mép node không bị tính là va chạm
  const pad = 3
  const L = b.x + pad, R = b.x + b.width - pad
  const T = b.y + pad, B = b.y + b.height - pad

  if (Math.abs(x1 - x2) < 0.5) {
    return x1 > L && x1 < R && Math.min(y1, y2) < B && Math.max(y1, y2) > T
  }
  if (Math.abs(y1 - y2) < 0.5) {
    return y1 > T && y1 < B && Math.min(x1, x2) < R && Math.max(x1, x2) > L
  }
  return false
}

function pathHitsAny(points: number[], obstacles: Bounds[]): boolean {
  for (let i = 0; i + 3 < points.length; i += 2) {
    for (const o of obstacles) {
      if (segmentHitsBox(points[i], points[i + 1], points[i + 2], points[i + 3], o)) {
        return true
      }
    }
  }
  return false
}

/**
 * Đường vòng qua bên hông.
 *
 * Dùng cho hai trường hợp đều khiến đường đi thẳng bị hỏng:
 *  - Cạnh quay ngược (vòng lặp "làm lại") — đi thẳng lên sẽ đè lên cạnh xuôi.
 *  - Cạnh dài nhảy nhiều tầng — đi thẳng xuống sẽ xuyên qua node ở tầng giữa.
 *
 * Va chạm được tính lại mỗi lần render nên khi người dùng kéo node, đường vòng
 * tự điều chỉnh theo.
 */
function detourPath(
  s: Bounds,
  t: Bounds,
  lane: number,
  obstacles: Bounds[]
): number[] {
  const top = Math.min(s.cy, t.cy)
  const bottom = Math.max(s.cy, t.cy)
  const blocking = obstacles.filter(o => o.y < bottom && o.y + o.height > top)

  const rightmost = Math.max(s.x + s.width, t.x + t.width, ...blocking.map(o => o.x + o.width))
  const leftmost = Math.min(s.x, t.x, ...blocking.map(o => o.x))

  // Chọn bên nào phải đi vòng ít hơn
  const costRight = rightmost - Math.min(s.x + s.width, t.x + t.width)
  const costLeft = Math.max(s.x, t.x) - leftmost
  const useRight = costRight <= costLeft

  const side: Side = useRight ? 'right' : 'left'
  const sideX = useRight
    ? rightmost + 44 + lane * 26
    : leftmost - 44 - lane * 26

  const from = anchorPoint(s, side)
  const to = anchorPoint(t, side)

  return simplify([
    from,
    { x: sideX, y: from.y },
    { x: sideX, y: to.y },
    to,
  ])
}

/** Cạnh trỏ về chính nó — vẽ vòng nhỏ bên phải hình */
function selfLoop(b: Bounds): number[] {
  const right = b.x + b.width
  const out = right + 40
  const yTop = b.y + b.height * 0.3
  const yBottom = b.y + b.height * 0.7
  return [right, yTop, out, yTop, out, yBottom, right, yBottom]
}

export interface RoutedEdge {
  /** Toạ độ TUYỆT ĐỐI trên canvas (render với x=0, y=0) */
  points: number[]
  /** Vị trí đặt nhãn, là điểm giữa của đường gấp khúc */
  labelX: number
  labelY: number
}

/**
 * Tính đường đi của một cạnh đã gắn source/target.
 * Trả về null nếu cạnh chưa gắn hoặc hình tham chiếu không còn tồn tại — khi đó
 * caller giữ nguyên hành vi cũ (dùng `points` thô).
 */
export function routeEdge(
  edge: Shape & EdgeBinding,
  shapesById: Map<string, Shape>,
  /** Dịch ngang để nhiều cạnh giữa cùng cặp hình không đè lên nhau */
  lane = 0
): RoutedEdge | null {
  if (!edge.source?.shapeId || !edge.target?.shapeId) return null

  const sourceShape = shapesById.get(edge.source.shapeId)
  const targetShape = shapesById.get(edge.target.shapeId)
  if (!sourceShape || !targetShape) return null

  let points: number[]

  if (sourceShape.id === targetShape.id) {
    points = selfLoop(getShapeBounds(sourceShape))
  } else {
    const s = getShapeBounds(sourceShape)
    const t = getShapeBounds(targetShape)
    const dx = t.cx - s.cx
    const dy = t.cy - s.cy

    // Luồng dọc và node đích nằm phía trên → đây là vòng lặp, vòng ra bên hông
    const isBackward =
      edge.router !== 'straight' &&
      Math.abs(dy) >= Math.abs(dx) &&
      t.cy + t.height / 2 <= s.cy

    // Chỉ các hình đặc mới chắn đường; cạnh và nhãn text thì không.
    // Loại luôn node nguồn/đích, vì đường đi luôn chạm mép hai hình đó.
    const obstacles: Bounds[] = []
    for (const shape of shapesById.values()) {
      if (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'text') continue
      if (shape.id === sourceShape.id || shape.id === targetShape.id) continue
      obstacles.push(getShapeBounds(shape))
    }

    if (isBackward) {
      points = detourPath(s, t, Math.abs(lane), obstacles)
    } else {
      const auto = autoSides(s, t)
      const fromSide = resolveSide(edge.source.anchor, auto.from)
      const toSide = resolveSide(edge.target.anchor, auto.to)
      const spread = lane * 22
      const from = anchorPoint(s, fromSide, spread)
      const to = anchorPoint(t, toSide, spread)

      points =
        edge.router === 'straight'
          ? [from.x, from.y, to.x, to.y]
          : orthogonalPath(from, fromSide, to, toSide)

      // Cạnh nhảy nhiều tầng đi thẳng sẽ xuyên qua node ở giữa — vòng ra hông.
      // Không áp dụng cho router 'straight' vì đó là lựa chọn có chủ đích.
      if (edge.router !== 'straight' && pathHitsAny(points, obstacles)) {
        points = detourPath(s, t, Math.abs(lane), obstacles)
      }
    }
  }

  const mid = midpointOf(points)
  return { points, labelX: mid.x, labelY: mid.y }
}

/**
 * Gán "làn" cho từng cạnh: các cạnh nối cùng một cặp hình được rải đều sang hai
 * bên thay vì chồng lên nhau. Tính một lần cho cả sơ đồ rồi truyền vào routeEdge.
 */
export function computeEdgeLanes(shapes: Shape[]): Map<string, number> {
  const groups = new Map<string, string[]>()

  for (const s of shapes) {
    if (!isBoundEdge(s)) continue
    const e = s as Shape & EdgeBinding
    // Gộp theo cặp không phân biệt chiều: A→B và B→A phải tách nhau ra
    const [a, b] = [e.source!.shapeId, e.target!.shapeId].sort()
    const key = `${a}|${b}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s.id)
  }

  const lanes = new Map<string, number>()
  for (const ids of groups.values()) {
    ids.forEach((id, i) => lanes.set(id, i - (ids.length - 1) / 2))
  }
  return lanes
}

/** Điểm nằm giữa đường gấp khúc tính theo độ dài, không phải theo số đỉnh */
function midpointOf(points: number[]): { x: number; y: number } {
  const segs: Array<{ x1: number; y1: number; x2: number; y2: number; len: number }> = []
  let total = 0

  for (let i = 0; i + 3 < points.length; i += 2) {
    const [x1, y1, x2, y2] = [points[i], points[i + 1], points[i + 2], points[i + 3]]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segs.push({ x1, y1, x2, y2, len })
    total += len
  }

  if (!segs.length) return { x: points[0] ?? 0, y: points[1] ?? 0 }

  let walked = 0
  for (const s of segs) {
    if (walked + s.len >= total / 2) {
      const r = s.len === 0 ? 0 : (total / 2 - walked) / s.len
      return { x: s.x1 + (s.x2 - s.x1) * r, y: s.y1 + (s.y2 - s.y1) * r }
    }
    walked += s.len
  }

  const last = segs[segs.length - 1]
  return { x: last.x2, y: last.y2 }
}

/** Cạnh đã gắn node hay chưa */
export function isBoundEdge(shape: Shape): boolean {
  const e = shape as Shape & EdgeBinding
  return (
    (shape.type === 'arrow' || shape.type === 'line') &&
    Boolean(e.source?.shapeId && e.target?.shapeId)
  )
}
