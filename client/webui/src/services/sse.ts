import type { SSEHandlers, SSEData } from '@/types'

const EVENT_TYPES = {
  START: 'start',
  REASONING_CONTENT: 'reasoning_content',
  REASONING_DONE: 'reasoning_done',
  CONTENT: 'content',
  TOOL_START: 'tool_start',
  TOOL_END: 'tool_end',
  DONE: 'done',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat',
} as const

export class SseParser {
  private handlers: SSEHandlers
  private aborted = false
  private fullContent = ''
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  constructor(handlers: SSEHandlers) {
    this.handlers = handlers
  }

  async parse(
    stream: ReadableStream<Uint8Array>,
    signal?: AbortSignal
  ): Promise<string> {
    this.aborted = false
    this.fullContent = ''

    const reader = stream.getReader()
    this.reader = reader
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        if (signal?.aborted || this.aborted) break

        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          this.processLine(line)
        }
      }

      if (buffer.trim()) {
        this.processLine(buffer)
      }
    } catch (error: any) {
      if (!(signal?.aborted || this.aborted) && error.name !== 'AbortError') {
        this.fire('onError', `流解析错误: ${error.message}`)
      }
    } finally {
      this.reader = null
      try { reader.releaseLock() } catch { /* ignore */ }
    }

    return this.fullContent
  }

  abort(): void {
    this.aborted = true
    if (this.reader) {
      try { this.reader.cancel() } catch { /* ignore */ }
    }
  }

  getFullContent(): string {
    return this.fullContent
  }

  private processLine(line: string): void {
    const trimmed = line.trim()
    if (!trimmed) return

    let dataStr: string | null = null

    if (trimmed.startsWith('data: ')) {
      dataStr = trimmed.slice(6)
      if (!dataStr || dataStr === '[DONE]') return
    } else if (trimmed.startsWith(':')) {
      return
    } else {
      dataStr = trimmed
    }

    if (!dataStr) return

    try {
      const data: SSEData = JSON.parse(dataStr)
      this.dispatch(data)
    } catch {
      if (dataStr.trim()) {
        this.fullContent += dataStr
        this.fire('onContent', dataStr)
      }
    }
  }

  private dispatch(data: SSEData): void {
    switch (data.type) {
      case EVENT_TYPES.START:
        this.fire('onStart')
        break
      case EVENT_TYPES.REASONING_CONTENT:
        this.fire('onReasoningContent', { content: data.content || '' })
        break
      case EVENT_TYPES.REASONING_DONE:
        this.fire('onReasoningDone', { full_reasoning: data.full_reasoning || '' })
        break
      case EVENT_TYPES.CONTENT:
        this.fullContent += (data.content || '')
        this.fire('onContent', data.content || '')
        break
      case EVENT_TYPES.TOOL_START:
        this.fire('onToolStart', { tool: data.tool || '', input: data.input })
        break
      case EVENT_TYPES.TOOL_END:
        this.fire('onToolEnd', { tool: data.tool || '', type: data.type, output: data.output })
        break
      case EVENT_TYPES.DONE:
        this.fire('onDone', { content: data.content })
        break
      case EVENT_TYPES.ERROR:
        this.fire('onError', data.content || '未知错误')
        break
      case EVENT_TYPES.HEARTBEAT:
        this.fire('onHeartbeat')
        break
    }
  }

  private fire(handler: string, ...args: any[]): void {
    const fn = (this.handlers as any)[handler]
    if (fn) {
      fn(...args)
    }
  }
}
