import 'server-only'

/**
 * Client cho inference stack tự host (vLLM, tương thích OpenAI API).
 *
 * `import 'server-only'` khiến build FAIL ngay nếu có component client nào lỡ
 * import file này — đó là hàng rào chống lộ AI_API_KEY ra bundle trình duyệt.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  /** Ép model trả về JSON hợp lệ (vLLM hỗ trợ response_format của OpenAI) */
  json?: boolean
  signal?: AbortSignal
}

export class AiConfigError extends Error {}
export class AiRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
  }
}

function config() {
  const baseUrl = process.env.AI_BASE_URL
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL

  if (!baseUrl || !apiKey || !model) {
    throw new AiConfigError(
      'Chưa cấu hình AI. Cần AI_BASE_URL, AI_API_KEY và AI_MODEL trong .env'
    )
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    apiKey,
    model,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 120_000,
  }
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY && process.env.AI_MODEL)
}

export async function chatCompletion(options: ChatOptions): Promise<string> {
  const { baseUrl, apiKey, model, timeoutMs } = config()

  // Timeout riêng, đồng thời vẫn tôn trọng signal của caller
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  options.signal?.addEventListener('abort', () => controller.abort())

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4096,
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      // Không đưa nguyên body lỗi upstream ra ngoài — có thể chứa cấu hình nội bộ
      const detail = await res.text().catch(() => '')
      console.error('AI upstream error', res.status, detail.slice(0, 500))
      throw new AiRequestError(`AI trả về lỗi ${res.status}`, res.status)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content

    if (typeof content !== 'string' || !content.trim()) {
      throw new AiRequestError('AI trả về phản hồi rỗng')
    }

    return content
  } catch (err) {
    if (err instanceof AiConfigError || err instanceof AiRequestError) throw err
    if ((err as Error)?.name === 'AbortError') {
      throw new AiRequestError(`AI không phản hồi trong ${timeoutMs / 1000}s`)
    }
    throw new AiRequestError(`Không kết nối được tới AI: ${(err as Error).message}`)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Bóc JSON từ phản hồi của model.
 *
 * Kể cả khi đã bật response_format, model nhỏ vẫn hay bọc kết quả trong ```json
 * hoặc thêm lời dẫn. Hàm này gỡ các lớp đó rồi mới parse.
 */
export function extractJson<T = unknown>(raw: string): T {
  let text = raw.trim()

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()

  // Cắt từ dấu { đầu tiên tới dấu } cuối cùng
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) text = text.slice(start, end + 1)

  try {
    return JSON.parse(text) as T
  } catch {
    throw new AiRequestError('AI trả về JSON không hợp lệ')
  }
}
