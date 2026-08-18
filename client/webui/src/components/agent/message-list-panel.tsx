import { useState, useRef, useEffect } from 'react'
import type { ToolCallRecord } from '@/types'

interface ReasoningSection {
  label: string
  content: string
}

// 有序块: 保持 思考→工具→思考→工具→... 的顺序
type AssistantBlock =
  | { type: 'reasoning'; id: number; label: string; content: string }
  | { type: 'tool_call'; tool: ToolCallRecord }

interface AssistantMsgState {
  content: string
  blocks: AssistantBlock[]
  streaming: boolean
}

interface MessageData {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  blocks?: AssistantBlock[]
  // 向下兼容
  reasoning?: ReasoningSection | null
  toolCalls?: ToolCallRecord[]
}

function ToolCard({ tool }: { tool: ToolCallRecord }) {
  const [collapsed, setCollapsed] = useState(true)

  const statusText =
    tool.status === 'running' ? '⏳ 执行中...'
    : tool.status === 'error' ? '❌ 失败'
    : '✅ 完成'

  return (
    <div className={`agent-tool-call-card`} data-status={tool.status}>
      <div className="agent-tool-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="agent-tool-icon">🔧</span>
        <span className="agent-tool-name">{tool.name}</span>
        <span className={`agent-tool-status ${tool.status}`}>{statusText}</span>
        <span className="agent-tool-call-toggle">{collapsed ? '▶' : '▼'}</span>
      </div>
      {!collapsed && (
        <div className="agent-tool-details">
          {tool.input && (
            <div className="agent-tool-input-section">
              <span className="agent-tool-label">输入:</span>
              <div className="agent-tool-input">{tool.input}</div>
            </div>
          )}
          {tool.output && (
            <div className="agent-tool-output-section">
              <span className="agent-tool-label">输出:</span>
              <div className="agent-tool-output">{tool.output}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReasoningSection({ label, content }: ReasoningSection) {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="agent-reasoning-section">
      <div className="agent-reasoning-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="agent-reasoning-icon">🧠</span>
        <span className="agent-reasoning-label">{label}</span>
        <span className="agent-reasoning-toggle">{collapsed ? '▶' : '▼'}</span>
      </div>
      {!collapsed && (
        <div className="agent-reasoning-content">{content}</div>
      )}
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="agent-message user">
      <div className="agent-message-avatar">👤</div>
      <div className="agent-message-body">
        <div className="agent-message-content">{content}</div>
      </div>
    </div>
  )
}

function AssistantMessage({ msg }: { msg: AssistantMsgState }) {
  return (
    <div className="agent-message assistant">
      <div className="agent-message-avatar">🐟</div>
      <div className="agent-message-body">
        {msg.blocks.length > 0 ? (
          // 使用有序 blocks 渲染 (多轮思考/工具)
          msg.blocks.map((block, i) =>
            block.type === 'reasoning' ? (
              <ReasoningSection key={`r-${block.id}`} label={block.label} content={block.content} />
            ) : (
              <ToolCard key={`t-${i}`} tool={block.tool} />
            )
          )
        ) : (
          // 向下兼容: 旧格式直接渲染
          <>
            {msg.content && (
              <div
                className={`agent-message-content${msg.streaming ? ' streaming' : ''}`}
              >
                {msg.content}
              </div>
            )}
          </>
        )}
        {/* 当有 blocks 时, 文本内容始终在最后; 无内容时不显示空气泡 */}
        {msg.blocks.length > 0 && msg.content && (
          <div
            className={`agent-message-content${msg.streaming ? ' streaming' : ''}`}
          >
            {msg.content}
          </div>
        )}
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: MessageData[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export default function MessageListPanel({ messages, scrollRef }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  return (
    <div className="agent-message-list" id="messageList" ref={scrollRef}>
      <div className="agent-scroll-toggle" onClick={() => setAutoScroll(!autoScroll)}>
        {autoScroll ? '🔽 自动滚动' : '⏸ 暂停'}
      </div>
      {messages.map((msg, i) =>
        msg.role === 'user' ? (
          <UserMessage key={i} content={msg.content} />
        ) : (
          <AssistantMessage
            key={i}
            msg={{
              content: msg.content,
              blocks: msg.blocks ?? [],
              streaming: msg.isStreaming ?? false,
            }}
          />
        )
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export type { MessageData, AssistantMsgState, ReasoningSection, AssistantBlock }
