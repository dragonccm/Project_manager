import type { Shape, ArrowShape, EdgeBinding } from '@/types/database'
import type { DiagramSpec, NodeKind } from '@/lib/ai/diagram-schema'
import { layeredLayout, type LayoutNode, type LayoutEdge } from './layout'

/**
 * Chuyển đồ thị logic (do AI sinh) thành Shape[] vẽ được trên canvas.
 *
 * Mỗi node → 1 hình chữ nhật có nhãn vẽ bên trong (một shape duy nhất).
 * Mỗi cạnh  → 1 arrow gắn source/target, nên kéo hình là mũi tên đi theo.
 */

interface KindStyle {
  fill: string
  stroke: string
  textColor: string
  width: number
  height: number
  cornerRadius: number
}

/** Bảng màu theo vai trò của node, đủ tương phản trên nền trắng */
const KIND_STYLES: Record<NodeKind, KindStyle> = {
  start:     { fill: '#dcfce7', stroke: '#16a34a', textColor: '#14532d', width: 150, height: 52, cornerRadius: 26 },
  end:       { fill: '#fee2e2', stroke: '#dc2626', textColor: '#7f1d1d', width: 150, height: 52, cornerRadius: 26 },
  process:   { fill: '#dbeafe', stroke: '#2563eb', textColor: '#1e3a8a', width: 180, height: 64, cornerRadius: 8 },
  decision:  { fill: '#fef3c7', stroke: '#d97706', textColor: '#78350f', width: 180, height: 72, cornerRadius: 8 },
  data:      { fill: '#ede9fe', stroke: '#7c3aed', textColor: '#4c1d95', width: 170, height: 60, cornerRadius: 8 },
  milestone: { fill: '#ccfbf1', stroke: '#0d9488', textColor: '#134e4a', width: 180, height: 64, cornerRadius: 8 },
  external:  { fill: '#f1f5f9', stroke: '#64748b', textColor: '#334155', width: 170, height: 60, cornerRadius: 8 },
}

/** Nhãn dài thì hộp phải cao thêm, nếu không chữ sẽ tràn ra ngoài */
function heightFor(style: KindStyle, label: string): number {
  const charsPerLine = Math.floor((style.width - 16) / 7.2)
  const lines = Math.max(1, Math.ceil(label.length / Math.max(charsPerLine, 1)))
  return Math.max(style.height, 28 + lines * 18)
}

export interface SpecToShapesOptions {
  direction?: 'TB' | 'LR'
  /** Tiền tố id để chèn nhiều sơ đồ vào cùng canvas mà không đụng id */
  idPrefix?: string
}

export interface SpecToShapesResult {
  shapes: Shape[]
  /** Kích thước canvas tối thiểu để chứa hết sơ đồ */
  width: number
  height: number
  /** Ánh xạ id node trong spec → id hình chữ nhật trên canvas */
  nodeShapeIds: Map<string, string>
}

export function specToShapes(
  spec: DiagramSpec,
  options: SpecToShapesOptions = {}
): SpecToShapesResult {
  const { direction = 'TB', idPrefix = `ai${Date.now().toString(36)}` } = options

  const layoutNodes: LayoutNode[] = spec.nodes.map(n => {
    const style = KIND_STYLES[n.kind] ?? KIND_STYLES.process
    return { id: n.id, width: style.width, height: heightFor(style, n.label) }
  })

  const layoutEdges: LayoutEdge[] = spec.edges.map(e => ({
    source: e.source,
    target: e.target,
  }))

  const layout = layeredLayout(layoutNodes, layoutEdges, {
    direction,
    rankGap: direction === 'TB' ? 80 : 110,
    nodeGap: 44,
  })

  const shapes: Shape[] = []
  const nodeShapeIds = new Map<string, string>()
  const sizeById = new Map(layoutNodes.map(n => [n.id, n]))

  // ---- Node: hộp + nhãn ----
  spec.nodes.forEach((node, i) => {
    const style = KIND_STYLES[node.kind] ?? KIND_STYLES.process
    const size = sizeById.get(node.id)!
    const pos = layout.positions.get(node.id) ?? { x: 60, y: 60 }
    const boxId = `${idPrefix}-n${i}`
    nodeShapeIds.set(node.id, boxId)

    // Một shape duy nhất cho mỗi node: nhãn nằm trong hộp.
    // Tách nhãn thành shape text riêng sẽ chắn click vào hộp và bị rớt lại
    // khi kéo hộp đi.
    shapes.push({
      id: boxId,
      type: 'rectangle',
      x: pos.x,
      y: pos.y,
      width: size.width,
      height: size.height,
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: 2,
      cornerRadius: style.cornerRadius,
      label: node.label,
      labelColor: style.textColor,
      labelFontSize: 13,
      draggable: true,
      zIndex: 10 + i,
    })
  })

  // ---- Cạnh: arrow gắn vào hai hộp ----
  spec.edges.forEach((edge, i) => {
    const sourceId = nodeShapeIds.get(edge.source)
    const targetId = nodeShapeIds.get(edge.target)
    if (!sourceId || !targetId) return

    shapes.push({
      id: `${idPrefix}-e${i}`,
      type: 'arrow',
      // Cạnh đã gắn node nên x/y/points chỉ là giá trị khởi tạo;
      // renderer tính lại từ vị trí thật của hai hộp.
      x: 0,
      y: 0,
      points: [0, 0, 0, 0],
      source: { shapeId: sourceId, anchor: 'auto' },
      target: { shapeId: targetId, anchor: 'auto' },
      router: 'orthogonal',
      label: edge.label,
      stroke: '#475569',
      strokeWidth: 2,
      pointerLength: 9,
      pointerWidth: 9,
      draggable: false,
      zIndex: 5,
    } as ArrowShape & EdgeBinding)
  })

  return {
    shapes,
    width: layout.width,
    height: layout.height,
    nodeShapeIds,
  }
}

/** Node nào đáng chuyển thành task theo dõi tiến độ */
export function taskableNodes(spec: DiagramSpec) {
  return spec.nodes.filter(
    n => n.kind === 'process' || n.kind === 'milestone'
  )
}
