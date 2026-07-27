import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-session'
import {
  chatCompletion,
  extractJson,
  isAiConfigured,
  AiConfigError,
  AiRequestError,
} from '@/lib/ai/inference-client'
import {
  buildPrompt,
  normalizeDiagram,
  DIAGRAM_KINDS,
  type DiagramKind,
} from '@/lib/ai/diagram-schema'
import { ZodError } from 'zod'

// Sinh sơ đồ mất hàng chục giây — vượt giới hạn mặc định của serverless function
export const maxDuration = 120

export const GET = withAuth(async () => {
  // Cho UI biết có bật được nút AI không, mà không lộ endpoint hay key
  return NextResponse.json({ configured: isAiConfigured() })
})

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const kind = body?.kind as DiagramKind
    const input = typeof body?.input === 'string' ? body.input.trim() : ''
    const projectContext =
      typeof body?.projectContext === 'string' ? body.projectContext.slice(0, 4000) : undefined
    const direction = body?.direction === 'LR' ? 'LR' : 'TB'

    if (!DIAGRAM_KINDS.includes(kind)) {
      return NextResponse.json(
        { error: `Loại sơ đồ không hợp lệ. Chọn một trong: ${DIAGRAM_KINDS.join(', ')}` },
        { status: 400 }
      )
    }

    if (input.length < 10) {
      return NextResponse.json(
        { error: 'Mô tả quá ngắn. Hãy nêu rõ ý tưởng hoặc yêu cầu (ít nhất 10 ký tự).' },
        { status: 400 }
      )
    }

    if (input.length > 8000) {
      return NextResponse.json(
        { error: 'Mô tả quá dài (tối đa 8000 ký tự).' },
        { status: 400 }
      )
    }

    const { system, user } = buildPrompt(kind, input, projectContext)

    const raw = await chatCompletion({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.25,
      maxTokens: 4096,
      json: true,
    })

    const { spec, warnings } = normalizeDiagram(extractJson(raw))

    return NextResponse.json({ success: true, spec, warnings, direction })
  } catch (error) {
    if (error instanceof AiConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    if (error instanceof ZodError) {
      console.error('AI diagram schema mismatch:', error.issues.slice(0, 5))
      return NextResponse.json(
        { error: 'AI trả về cấu trúc không đúng định dạng. Thử mô tả lại rõ hơn.' },
        { status: 422 }
      )
    }

    if (error instanceof AiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    console.error('AI diagram error:', error)
    return NextResponse.json({ error: 'Không sinh được sơ đồ' }, { status: 500 })
  }
})
