'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, AlertTriangle, Workflow, CalendarRange, TrendingUp, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { DiagramSpec, DiagramKind, NodeKind } from '@/lib/ai/diagram-schema'
import type { Shape } from '@/types/database'
import { specToShapes, taskableNodes } from '@/lib/diagram/spec-to-shapes'

interface Project {
  id: string
  name: string
}

interface AiDiagramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chèn các hình đã sinh vào canvas */
  onInsert: (shapes: Shape[], meta: { title: string; width: number; height: number }) => void
}

const PRESETS: Array<{
  kind: DiagramKind
  label: string
  hint: string
  icon: typeof Workflow
}> = [
  {
    kind: 'system-flow',
    label: 'Luồng chức năng hệ thống',
    hint: 'Người dùng và hệ thống tương tác thế nào, gồm cả nhánh lỗi',
    icon: Workflow,
  },
  {
    kind: 'project-timeline',
    label: 'Tiến trình dự án',
    hint: 'Chia giai đoạn, có mốc bàn giao và ước lượng thời gian',
    icon: CalendarRange,
  },
  {
    kind: 'seo-campaign',
    label: 'Quy trình chiến dịch SEO',
    hint: 'Từ nghiên cứu từ khoá tới đo lường, có vòng lặp cải tiến',
    icon: TrendingUp,
  },
]

const KIND_LABEL: Record<NodeKind, string> = {
  start: 'Bắt đầu',
  end: 'Kết thúc',
  process: 'Xử lý',
  decision: 'Rẽ nhánh',
  data: 'Dữ liệu',
  milestone: 'Cột mốc',
  external: 'Bên ngoài',
}

const KIND_COLOR: Record<NodeKind, string> = {
  start: 'bg-green-100 text-green-800 border-green-300',
  end: 'bg-red-100 text-red-800 border-red-300',
  process: 'bg-blue-100 text-blue-800 border-blue-300',
  decision: 'bg-amber-100 text-amber-800 border-amber-300',
  data: 'bg-violet-100 text-violet-800 border-violet-300',
  milestone: 'bg-teal-100 text-teal-800 border-teal-300',
  external: 'bg-slate-100 text-slate-700 border-slate-300',
}

export function AiDiagramDialog({ open, onOpenChange, onInsert }: AiDiagramDialogProps) {
  const { toast } = useToast()

  const [kind, setKind] = useState<DiagramKind>('system-flow')
  const [direction, setDirection] = useState<'TB' | 'LR'>('TB')
  const [input, setInput] = useState('')
  const [projectId, setProjectId] = useState<string>('none')
  const [projects, setProjects] = useState<Project[]>([])

  const [loading, setLoading] = useState(false)
  const [spec, setSpec] = useState<DiagramSpec | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [createTasks, setCreateTasks] = useState(false)
  const [inserting, setInserting] = useState(false)

  // Nạp danh sách dự án để gắn bối cảnh và để biết tạo task vào đâu
  useEffect(() => {
    if (!open) return
    fetch('/api/projects', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
  }, [open])

  // Dọn kết quả cũ khi đóng, tránh lần mở sau thấy sơ đồ của lần trước
  useEffect(() => {
    if (!open) {
      setSpec(null)
      setWarnings([])
      setCreateTasks(false)
    }
  }, [open])

  const selectedProject = projects.find(p => p.id === projectId)

  const handleGenerate = async () => {
    if (input.trim().length < 10) {
      toast({
        title: 'Mô tả quá ngắn',
        description: 'Hãy nêu rõ ý tưởng hoặc yêu cầu của bạn.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setSpec(null)
    setWarnings([])

    try {
      const res = await fetch('/api/ai/diagram', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          input,
          direction,
          projectContext: selectedProject ? `Dự án: ${selectedProject.name}` : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Không sinh được sơ đồ',
          description: data?.error || `Lỗi ${res.status}`,
          variant: 'destructive',
        })
        return
      }

      setSpec(data.spec)
      setWarnings(data.warnings || [])
    } catch (err) {
      toast({
        title: 'Lỗi kết nối',
        description: (err as Error).message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = async () => {
    if (!spec) return
    setInserting(true)

    try {
      const result = specToShapes(spec, { direction })
      onInsert(result.shapes, {
        title: spec.title,
        width: result.width,
        height: result.height,
      })

      if (createTasks && projectId !== 'none') {
        const created = await createTasksFromSpec(spec, projectId)
        toast({
          title: 'Đã chèn sơ đồ',
          description: `${spec.nodes.length} node, ${spec.edges.length} liên kết. Đã tạo ${created} công việc.`,
        })
      } else {
        toast({
          title: 'Đã chèn sơ đồ',
          description: `${spec.nodes.length} node, ${spec.edges.length} liên kết.`,
        })
      }

      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Chèn sơ đồ thất bại',
        description: (err as Error).message,
        variant: 'destructive',
      })
    } finally {
      setInserting(false)
    }
  }

  const taskCount = spec ? taskableNodes(spec).length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sinh sơ đồ bằng AI
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-2">
            {/* Chọn loại sơ đồ */}
            <div className="space-y-2">
              <Label>Loại sơ đồ</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {PRESETS.map(preset => {
                  const Icon = preset.icon
                  const active = kind === preset.kind
                  return (
                    <button
                      key={preset.kind}
                      type="button"
                      onClick={() => setKind(preset.kind)}
                      className={`text-left rounded-lg border p-3 transition-colors ${
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-sm font-medium leading-tight">{preset.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="ai-input">Ý tưởng / yêu cầu</Label>
              <Textarea
                id="ai-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={4}
                placeholder="Nêu rõ vai trò, các bước và điều kiện rẽ nhánh. Càng cụ thể, sơ đồ càng sát."
                className="resize-none"
              />
            </div>

            {/* Dự án + hướng */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Gắn với dự án</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không gắn</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hướng bố cục</Label>
                <Select value={direction} onValueChange={v => setDirection(v as 'TB' | 'LR')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TB">Trên xuống dưới</SelectItem>
                    <SelectItem value="LR">Trái sang phải</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kết quả */}
            {spec && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold truncate">{spec.title}</div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {spec.nodes.length} node · {spec.edges.length} liên kết
                  </div>
                </div>

                {warnings.length > 0 && (
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                    <div className="flex items-center gap-1 font-medium mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Đã lược bỏ phần không hợp lệ:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="space-y-1 max-h-60 overflow-auto">
                  {spec.nodes.map(n => (
                    <div key={n.id} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] px-1.5 py-0 ${KIND_COLOR[n.kind]}`}
                      >
                        {KIND_LABEL[n.kind]}
                      </Badge>
                      <span className="flex-1 leading-snug">{n.label}</span>
                      {n.estimateMinutes ? (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatMinutes(n.estimateMinutes)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {taskCount > 0 && (
                  <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={createTasks}
                      onCheckedChange={v => setCreateTasks(v === true)}
                      disabled={projectId === 'none'}
                      className="mt-0.5"
                    />
                    <span className={projectId === 'none' ? 'text-muted-foreground' : ''}>
                      Tạo {taskCount} công việc trong dự án
                      {projectId === 'none' && (
                        <span className="block text-xs text-muted-foreground">
                          Chọn dự án ở trên trước
                        </span>
                      )}
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading || inserting}>
            Đóng
          </Button>
          <Button onClick={handleGenerate} disabled={loading || inserting} variant={spec ? 'outline' : 'default'}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang sinh...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />{spec ? 'Sinh lại' : 'Sinh sơ đồ'}</>
            )}
          </Button>
          {spec && (
            <Button onClick={handleInsert} disabled={inserting}>
              {inserting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang chèn...</>
              ) : (
                'Chèn vào canvas'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m}p`
  const h = Math.round((m / 60) * 10) / 10
  return h >= 8 ? `${Math.round(h / 8)} ngày` : `${h}h`
}

/**
 * Tạo task thật từ các node process/milestone.
 *
 * Gửi tuần tự chứ không Promise.all: API tasks ghi thẳng vào Mongo, bắn 15
 * request song song dễ chạm giới hạn pool kết nối.
 */
async function createTasksFromSpec(spec: DiagramSpec, projectId: string): Promise<number> {
  const nodes = taskableNodes(spec)
  const today = new Date().toISOString().slice(0, 10)
  let created = 0

  for (const node of nodes) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: node.label,
          description: node.detail || `Từ sơ đồ: ${spec.title}`,
          project_id: projectId,
          priority: node.kind === 'milestone' ? 'high' : 'medium',
          date: today,
          estimated_time: node.estimateMinutes || 0,
          status: 'todo',
          completed: false,
        }),
      })
      if (res.ok) created++
    } catch {
      // Bỏ qua task lỗi, vẫn tạo tiếp các task còn lại
    }
  }

  return created
}
