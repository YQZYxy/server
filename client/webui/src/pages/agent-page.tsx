import { useState, useEffect, useRef, useCallback } from 'react'
import { SseParser } from '@/services/sse'
import * as agentApi from '@/services/agent'
import { loadConfig, saveConfig, getAgentBaseUrl } from '@/services/agent-config'
import type { AgentConfig, ToolCallRecord, SkillInfo, ToolInfo, SessionInfo } from '@/types'
import type { MessageData, AssistantBlock } from '@/components/agent/message-list-panel'
import SessionPanel from '@/components/agent/session-panel'
import SidebarPanel from '@/components/agent/sidebar-panel'
import MessageListPanel from '@/components/agent/message-list-panel'

// 提取标签列表
function extractTags(items: Array<{ tags?: string[] }>): string[] {
  const set = new Set<string>()
  items.forEach((item) => (item.tags || []).forEach((t) => set.add(t)))
  return Array.from(set).sort()
}

// 根据筛选模式解析实际要发送的工具/技能配置
function resolveAgentConfig(
  cfg: AgentConfig,
  allSkillTags: string[],
  allToolTags: string[]
): {
  skillTags: string[] | null
  skillNames: string[] | null
  toolTags: string[] | null
  toolNames: string[] | null
} {
  if (cfg.agentMode !== 'agent') {
    return { skillTags: null, skillNames: null, toolTags: null, toolNames: null }
  }

  let skillTags: string[] | null = null
  let skillNames: string[] | null = null
  const skillMode = cfg.skillFilterMode || 'all'
  if (skillMode === 'tag') {
    skillTags = (cfg.skillTags && cfg.skillTags.length > 0) ? cfg.skillTags : null
  } else if (skillMode === 'manual') {
    skillNames = (cfg.skillNames && cfg.skillNames.length > 0) ? cfg.skillNames : null
  } else {
    // all 模式: 发送全部标签
    skillTags = (allSkillTags && allSkillTags.length > 0) ? allSkillTags : null
  }

  let toolTags: string[] | null = null
  let toolNames: string[] | null = null
  const toolMode = cfg.toolFilterMode || 'all'
  if (toolMode === 'tag') {
    toolTags = (cfg.toolTags && cfg.toolTags.length > 0) ? cfg.toolTags : null
  } else if (toolMode === 'manual') {
    toolNames = (cfg.toolNames && cfg.toolNames.length > 0) ? cfg.toolNames : null
  } else {
    // all 模式: 发送全部标签
    toolTags = (allToolTags && allToolTags.length > 0) ? allToolTags : null
  }

  return { skillTags, skillNames, toolTags, toolNames }
}

export default function AgentPage() {
  // 会话状态
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [config, setConfig] = useState<AgentConfig>({
    apiUrl: '',
    apiKey: '',
    model: '',
    agentHost: '127.0.0.1',
    agentPort: 9527,
    temperature: 0,
    maxTokens: 0,
    agentMode: 'chat',
    customInstructions: '',
    skillFilterMode: 'all',
    skillTags: null,
    skillNames: null,
    toolFilterMode: 'all',
    toolTags: null,
    toolNames: null,
  })
  const [isStreaming, setIsStreaming] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showSessionPanel, setShowSessionPanel] = useState(false)
  const [allSkillTags, setAllSkillTags] = useState<string[]>([])
  const [allToolTags, setAllToolTags] = useState<string[]>([])
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [serverReady, setServerReady] = useState(false)
  const [llmConnected, setLlmConnected] = useState(false)

  // 流式解析器引用
  const parserRef = useRef<SseParser | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  // 当前正在构建的 assistant 消息 (blocks 保持 思考→工具→思考→工具→... 的顺序)
  const currentAssistantRef = useRef<{
    content: string
    blocks: AssistantBlock[]
    streaming: boolean
  } | null>(null)

  // 加载配置
  useEffect(() => {
    setConfig(loadConfig())

    // 初次尝试加载技能和工具列表
    loadSkillsAndTools()
  }, [])

  // 加载技能和工具列表
  const loadSkillsAndTools = useCallback(async () => {
    const [skillList, toolList] = await Promise.all([
      agentApi.fetchSkills(),
      agentApi.fetchTools(),
    ])
    setSkills(skillList)
    setAllSkillTags(extractTags(skillList))
    setTools(toolList)
    setAllToolTags(extractTags(toolList))
  }, [])

  // 定期检查服务器连接状态
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(getAgentBaseUrl() + '/agent/status')
      if (res.ok) {
        const data = await res.json()
        setLlmConnected(data.llm_connected || false)
        if (!serverReady) {
          setServerReady(true)
          loadSkillsAndTools()
          setConfig(loadConfig())
        }
      } else {
        setLlmConnected(false)
      }
    } catch {
      setLlmConnected(false)
    }
  }, [serverReady, loadSkillsAndTools])

  useEffect(() => {
    checkStatus()
    const timer = setInterval(checkStatus, 30000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 初始化会话
  useEffect(() => {
    const init = async () => {
      const sessions = await agentApi.listSessions()
      if (sessions.length > 0) {
        switchToSession(sessions[0].session_id)
      } else {
        const id = agentApi.createSession()
        switchToSession(id, true)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 切换会话
  const switchToSession = useCallback(async (id: string, skipHistory = false) => {
    if (id === sessionId) return
    stopStreaming()

    setSessionId(id)
    agentApi.setSessionId(id)
    setMessages([])

    if (!skipHistory) {
      const history = await agentApi.getHistory(id)
      const rendered: MessageData[] = []

      // 遍历历史消息，将连续的 assistant 消息合并成一个组
      let assistantBuffer: any[] = []
      for (const msg of history) {
        if (msg.role === 'user') {
          if (assistantBuffer.length > 0) {
            rendered.push(renderAssistantGroup(assistantBuffer))
            assistantBuffer = []
          }
          rendered.push({ role: 'user', content: msg.content || '' })
        } else {
          assistantBuffer.push(msg)
        }
      }
      if (assistantBuffer.length > 0) {
        rendered.push(renderAssistantGroup(assistantBuffer))
      }

      setMessages(rendered)
    }

    syncConfig()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const renderAssistantGroup = (msgs: any[]): MessageData => {
    const blocks: AssistantBlock[] = []
    let finalContent = ''

    for (const m of msgs) {
      if (m.role === 'assistant' && m.reasoning_content) {
        // 思考过程 添加一个 reasoning block
        blocks.push({
          type: 'reasoning',
          id: blocks.length,
          label: '思考完成',
          content: m.reasoning_content,
        })
      } else if (m.role === 'tool') {
        // 工具调用 添加一个 tool_call block
        blocks.push({
          type: 'tool_call',
          tool: {
            name: m.name || m.tool_call_id || 'tool',
            input: m.tool_input,
            output: m.content || '',
            status: 'done',
          },
        })
      }
      // 保留最终回复
      if (m.role === 'assistant' && m.content) {
        finalContent = m.content
      }
    }

    return {
      role: 'assistant',
      content: finalContent,
      blocks,
    }
  }

  // 新建会话
  const newSession = useCallback(async () => {
    const id = agentApi.createSession()
    await switchToSession(id)
  }, [switchToSession])

  // 同步模式配置
  const syncConfig = useCallback(() => {
    const cfg = config
    if (!cfg.agentMode) return

    const resolved = resolveAgentConfig(cfg, allSkillTags, allToolTags)

    if (cfg.agentMode === 'agent') {
      agentApi.updateSessionConfig({
        agent_mode: 'agent',
        tool_tags: resolved.toolTags,
        tool_names: resolved.toolNames,
        skill_tags: resolved.skillTags,
        skill_names: resolved.skillNames,
      })
    } else {
      agentApi.updateSessionConfig({
        agent_mode: 'chat',
        tool_tags: null,
        tool_names: null,
        skill_tags: null,
        skill_names: null,
      })
    }
  }, [config, allSkillTags, allToolTags])

  // 停止流式
  const stopStreaming = useCallback(() => {
    if (currentAssistantRef.current) {
      const msg = currentAssistantRef.current
      setMessages((prev) => {
        const next = [...prev]
        if (next.length > 0) {
          next[next.length - 1] = {
            role: 'assistant',
            content: msg.content || '已取消',
            isStreaming: false,
            blocks: [...msg.blocks],
          }
        }
        return next
      })
    }

    setIsStreaming(false)
    parserRef.current?.abort()
    agentApi.cancelReq()
    abortRef.current?.abort()
    parserRef.current = null
    abortRef.current = null
    currentAssistantRef.current = null
  }, [])

  // 发送消息
  const sendMessage = useCallback(async () => {
    const input = inputRef.current
    if (!input) return
    const text = input.value.trim()
    if (!text || isStreaming) return

    input.value = ''
    input.style.height = 'auto'

    // 添加用户消息
    setMessages((prev) => [...prev, { role: 'user', content: text }])

    // 创建 assistant 占位
    let reasoningIdCounter = 0
    const assistantMsg = {
      content: '',
      blocks: [] as AssistantBlock[],
      streaming: true,
    }
    currentAssistantRef.current = assistantMsg
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', isStreaming: true },
    ])

    setIsStreaming(true)
    abortRef.current = new AbortController()

    try {
      const cfg = config
      const resolved = resolveAgentConfig(cfg, allSkillTags, allToolTags)
      const response = await agentApi.sendChatMessage(text, {
        toolTags: resolved.toolTags,
        toolNames: resolved.toolNames,
        customInstructions: cfg.customInstructions || '',
        temperature: cfg.temperature ?? 0.0,
        maxTokens: cfg.maxTokens ?? 0,
        model: cfg.model || '',
        skillNames: resolved.skillNames,
        skillTags: resolved.skillTags,
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`
        try {
          const err = await response.json()
          errorMsg = err.error || errorMsg
        } catch { /* ignore */ }
        throw new Error(errorMsg)
      }

      const parser = new SseParser({
        onReasoningContent: (data) => {
          const msg = currentAssistantRef.current
          if (!msg) return
          // 如果最后一个 block 不是 reasoning, 新增一个
          const lastBlock = msg.blocks[msg.blocks.length - 1]
          if (!lastBlock || lastBlock.type !== 'reasoning') {
            reasoningIdCounter++
            msg.blocks.push({
              type: 'reasoning' as const,
              id: reasoningIdCounter,
              label: '正在思考...',
              content: data.content,
            })
          } else {
            lastBlock.content += data.content
          }
          flushAssistantMsg()
        },
        onReasoningDone: (data) => {
          const msg = currentAssistantRef.current
          if (!msg) return
          // 找到最后一个 reasoning block 并标记完成
          for (let i = msg.blocks.length - 1; i >= 0; i--) {
            const block = msg.blocks[i]
            if (block.type === 'reasoning') {
              block.label = '思考完成'
              if (data.full_reasoning) {
                block.content = data.full_reasoning
              }
              break
            }
          }
          flushAssistantMsg()
        },
        onContent: (content) => {
          const msg = currentAssistantRef.current
          if (!msg) return
          msg.content += content
          flushAssistantMsg()
        },
        onToolStart: (data) => {
          const msg = currentAssistantRef.current
          if (!msg) return
          msg.blocks.push({
            type: 'tool_call' as const,
            tool: {
              name: data.tool,
              status: 'running',
              input: data.input,
            },
          })
          flushAssistantMsg()
        },
        onToolEnd: (data) => {
          const msg = currentAssistantRef.current
          if (!msg) return
          // 从后往前找最后一个同名 running 的 tool block
          for (let i = msg.blocks.length - 1; i >= 0; i--) {
            const block = msg.blocks[i]
            if (block.type === 'tool_call' && block.tool.name === data.tool && block.tool.status === 'running') {
              block.tool.status = data.type === 'error' ? 'error' : 'done'
              block.tool.output = data.output
              break
            }
          }
          flushAssistantMsg()
        },
        onDone: (data) => {
          const msg = currentAssistantRef.current
          if (msg && data.content && data.content.length > msg.content.length) {
            msg.content = data.content
          }
          if (msg) msg.streaming = false
          flushAssistantMsg()
          setIsStreaming(false)
          currentAssistantRef.current = null
        },
        onError: (errorMsg) => {
          const msg = currentAssistantRef.current
          if (msg) {
            msg.content = `❌ ${errorMsg}`
            msg.streaming = false
            flushAssistantMsg()
          }
          setIsStreaming(false)
          currentAssistantRef.current = null
        },
      })

      parserRef.current = parser
      await parser.parse(response.body!, abortRef.current.signal)

      // 空响应
      const msg = currentAssistantRef.current
      if (msg && !msg.content) {
        msg.content = '(无响应)'
        msg.streaming = false
        flushAssistantMsg()
        setIsStreaming(false)
        currentAssistantRef.current = null
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // 已由 stopStreaming 处理
      } else {
        const msg = currentAssistantRef.current
        if (msg) {
          msg.content = `❌ ${error.message}`
          msg.streaming = false
          flushAssistantMsg()
        }
        setIsStreaming(false)
        currentAssistantRef.current = null
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
      parserRef.current = null
    }
  }, [config, isStreaming, allSkillTags, allToolTags])

  // 刷新 assistant 消息到 state
  const flushAssistantMsg = useCallback(() => {
    const msg = currentAssistantRef.current
    if (!msg) return
    setMessages((prev) => {
      const next = [...prev]
      if (next.length > 0) {
        next[next.length - 1] = { // 更新最后一条消息 占位消息
          role: 'assistant',
          content: msg.content,
          isStreaming: msg.streaming,
          blocks: [...msg.blocks],
        }
      }
      return next
    })
  }, [])

  // 处理 Enter 发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 切换模式
  const toggleMode = (mode: 'chat' | 'agent') => {
    const next = { ...config, agentMode: mode }
    setConfig(next)
    saveConfig(next)
    syncConfig()
  }

  // 获取当前启用的技能列表
  const getActiveSkills = useCallback(() => {
    if (config.agentMode !== 'agent') return []
    const mode = config.skillFilterMode || 'all'
    if (mode === 'all') return skills
    if (mode === 'tag') {
      const tags = config.skillTags || []
      return skills.filter((s) => (s.tags || []).some((t) => tags.includes(t)))
    }
    const names = config.skillNames || []
    return skills.filter((s) => names.includes(s.name))
  }, [config, skills])

  // 获取当前启用的工具列表
  const getActiveTools = useCallback(() => {
    if (config.agentMode !== 'agent') return []
    const mode = config.toolFilterMode || 'all'
    if (mode === 'all') return tools
    if (mode === 'tag') {
      const tags = config.toolTags || []
      return tools.filter((t) => (t.tags || []).some((g) => tags.includes(g)))
    }
    const names = config.toolNames || []
    return tools.filter((t) => names.includes(t.name))
  }, [config, tools])

  const activeSkills = getActiveSkills()
  const activeTools = getActiveTools()

  // 清理聊天
  const clearChat = () => {
    stopStreaming()
    setMessages([])
  }

  return (
    <div className="agent-root">
      {/* 导航栏 */}
      <div className="agent-navbar">
        <div className="agent-status-indicator">
          <span className={`agent-status-dot${llmConnected ? '' : ' disconnected'}`} />
          <span>{llmConnected ? '已连接' : '未连接'}</span>
        </div>
        <div className="agent-mode-switch">
          <button
            className={`agent-mode-btn${config.agentMode === 'chat' ? ' active' : ''}`}
            onClick={() => toggleMode('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`agent-mode-btn${config.agentMode === 'agent' ? ' active' : ''}`}
            onClick={() => toggleMode('agent')}
          >
            🧠 Agent
          </button>
        </div>
        <div className="agent-navbar-actions">
          <button
            className="agent-btn agent-btn-secondary agent-btn-sm"
            onClick={() => setShowSessionPanel(!showSessionPanel)}
            title="会话列表"
          >
            ☰ 会话
          </button>
          <button
            className="agent-btn agent-btn-secondary agent-btn-sm"
            onClick={() => setShowSidebar(!showSidebar)}
            title="设置"
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="agent-main-content">
        {/* 侧边栏 (设置) — 常驻 DOM, 通过 collapsed 控制显隐 */}
        <SidebarPanel
          config={config}
          collapsed={!showSidebar || !config.agentMode}
          onConfigChange={(c) => { setConfig(c); saveConfig(c) }}
          onClose={() => setShowSidebar(false)}
          onSyncSuccess={loadSkillsAndTools}
        />

        {/* 会话面板 — 常驻 DOM, 通过 collapsed 控制显隐 */}
        <SessionPanel
          currentSessionId={sessionId}
          collapsed={!showSessionPanel}
          onSwitchSession={(id) => switchToSession(id)}
          onNewSession={newSession}
        />

        {/* 聊天区域 */}
        <main className="agent-chat-area">
          <div className="agent-chat-header">
            <div className="agent-chat-header-info" id="chatHeaderInfo">
              {config.agentMode === 'agent' ? (
                <>
                  {activeTools.length > 0 && (
                    <div style={{ marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>工具: </span>
                      {activeTools.map((t) => (
                        <span
                          key={t.name} className="agent-chat-skill-badge"
                          style={{ background: 'var(--warning)', color: 'var(--bg-primary)' }}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {activeSkills.length > 0 && (
                    <div style={{ marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>技能: </span>
                      {activeSkills.map((s) => (
                        <span key={s.name} className="agent-chat-skill-badge">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {activeTools.length === 0 && activeSkills.length === 0 && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> 无工具</span>
                  )}
                </>
              ) : (
                '纯聊天'
              )}
            </div>
            <div className="agent-chat-header-actions">
              <button
                className="agent-btn agent-btn-danger agent-btn-sm"
                onClick={clearChat}
              >
                🗑️ 清空
              </button>
              <button
                className="agent-btn agent-btn-secondary agent-btn-sm"
                onClick={newSession}
              >
                ＋ 新建会话
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <MessageListPanel messages={messages} scrollRef={messageListRef} />

          {/* 输入区域 */}
          <div className="agent-input-area">
            <div className="agent-input-wrapper">
              <textarea
                ref={inputRef}
                id="messageInput"
                placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                rows={1}
                onKeyDown={handleKeyDown}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
                }}
              />
            </div>
            <button
              className="agent-btn-send"
              onClick={sendMessage}
              disabled={isStreaming}
            >
              {isStreaming ? (
                <span
                  className="agent-spinner"
                  style={{ width: 16, height: 16, borderWidth: 2, display: 'inline-block' }}
                />
              ) : '发送'}
            </button>
            <button
              className="agent-btn-send agent-btn-stop"
              style={{ display: isStreaming ? 'flex' : 'none' }}
              onClick={stopStreaming}
            >
              ⏹ 停止
            </button>
          </div>
        </main>
      </div>

      {/* 移动端遮罩 */}
      <div
        className={`agent-backdrop${showSidebar || showSessionPanel ? ' show' : ''}`}
        onClick={() => { setShowSidebar(false); setShowSessionPanel(false) }}
      />
    </div>
  )
}
