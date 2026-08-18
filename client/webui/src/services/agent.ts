import type { SessionInfo, AgentMessage, SkillInfo, ToolInfo } from '@/types'
import { getAgentBaseUrl } from '@/services/agent-config'

let sessionId: string | null = null

// 构造 agent 服务请求地址
function agentUrl(path: string): string {
  return getAgentBaseUrl() + '/agent' + path
}

function generateId(): string {
  return 'session_' + Date.now().toString(36) + '_' +
    Math.random().toString(36).substring(2, 8)
}

export function getSessionId(): string | null {
  return sessionId
}

export function setSessionId(id: string): void {
  sessionId = id
}

export function createSession(): string {
  const id = generateId()
  sessionId = id
  return id
}

export async function listSessions(): Promise<SessionInfo[]> {
  try {
    const res = await fetch(agentUrl('/sessions'))
    const data = await res.json()
    return data.sessions || []
  } catch {
    return []
  }
}

export async function getHistory(sid?: string): Promise<AgentMessage[]> {
  const id = sid || sessionId
  if (!id) return []
  try {
    const res = await fetch(agentUrl(`/session?session_id=${id}`))
    const data = await res.json()
    return data.messages || []
  } catch {
    return []
  }
}

export async function updateSessionConfig(
  config: Record<string, any>,
  sid?: string
): Promise<void> {
  const id = sid || sessionId
  if (!id) return
  try {
    await fetch(agentUrl('/session'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: id, config }),
    })
  } catch {
    // silent
  }
}

export async function deleteSession(sid?: string): Promise<void> {
  const id = sid || sessionId
  if (!id) return
  try {
    await fetch(agentUrl(`/session?session_id=${id}`), { method: 'DELETE' })
  } catch {
    // silent
  }
}

export async function sendChatMessage(
  message: string,
  options: {
    toolTags?: string[] | null
    toolNames?: string[] | null
    customInstructions?: string
    temperature?: number
    maxTokens?: number
    model?: string
    skillNames?: string[] | null
    skillTags?: string[] | null
    signal?: AbortSignal
  }
): Promise<Response> {
  const body = {
    message,
    session_id: sessionId,
    new_session: false,
    tool_tags: options.toolTags ?? null,
    tool_names: options.toolNames ?? null,
    custom_instructions: options.customInstructions || '',
    temperature: options.temperature ?? 0.0,
    maxTokens: options.maxTokens ?? 0,
    model: options.model || '',
    skill_names: options.skillNames ?? null,
    skill_tags: options.skillTags ?? null,
  }

  return fetch(agentUrl(''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: options.signal ?? null,
  })
}

export async function fetchTools(): Promise<ToolInfo[]> {
  try {
    const res = await fetch(agentUrl('/tools'))
    const data = await res.json()
    return data.tools || []
  } catch {
    return []
  }
}

export async function fetchSkills(): Promise<SkillInfo[]> {
  try {
    const res = await fetch(agentUrl('/skills'))
    const data = await res.json()
    return data.skills || []
  } catch {
    return []
  }
}

export async function reloadSkills(): Promise<{ discovered: number; skills: SkillInfo[] }> {
  try {
    const res = await fetch(agentUrl('/skills/reload'), { method: 'POST' })
    return await res.json()
  } catch {
    return { discovered: 0, skills: [] }
  }
}

export async function cancelReq(sid?: string): Promise<void> {
  const id = sid || sessionId
  if (!id) return
  try {
    await fetch(agentUrl('/cancel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: id }),
      keepalive: true,
    })
  } catch {
    // silent
  }
}
