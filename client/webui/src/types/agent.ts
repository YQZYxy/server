// ============================================================
//  Agent / 小鱼 相关类型
// ============================================================

export interface AgentConfig {
  apiUrl: string
  apiKey: string
  model: string
  agentHost: string
  agentPort: number
  temperature: number
  maxTokens: number
  agentMode: 'chat' | 'agent'
  customInstructions: string
  skillFilterMode: 'all' | 'tag' | 'manual'
  skillTags: string[] | null
  skillNames: string[] | null
  toolFilterMode: 'all' | 'tag' | 'manual'
  toolTags: string[] | null
  toolNames: string[] | null
}

export interface SessionInfo {
  session_id: string
  title: string
  message_count: number
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool'
  content?: string
  reasoning_content?: string
  tool_call_id?: string
  name?: string
  tool_input?: string
}

export interface SkillInfo {
  name: string
  description: string
  tags: string[]
  source: string
}

export interface ToolInfo {
  name: string
  description: string
  tags: string[]
}

export interface SSEData {
  type: string
  content?: string
  tool?: string
  input?: string
  output?: string
  full_reasoning?: string
}

export interface SSEHandlers {
  onStart?: () => void
  onReasoningContent?: (data: { content: string }) => void
  onReasoningDone?: (data: { full_reasoning: string }) => void
  onContent?: (content: string) => void
  onToolStart?: (data: { tool: string; input?: string }) => void
  onToolEnd?: (data: { tool: string; type?: string; output?: string }) => void
  onDone?: (data: { content?: string }) => void
  onError?: (message: string) => void
  onHeartbeat?: () => void
}

export interface ToolCallRecord {
  name: string
  status: 'running' | 'done' | 'error'
  output?: string
  input?: string
}
