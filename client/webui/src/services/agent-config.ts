import type { AgentConfig } from '@/types'

const STORAGE_KEY = 'xiaoyu_config'

const DEFAULT_CONFIG: AgentConfig = {
  apiUrl: 'http://127.0.0.1:8080/chat/completions',
  apiKey: '',
  model: 'XiaoYu',
  agentHost: '127.0.0.1',
  agentPort: 9527,
  temperature: 0.7,
  maxTokens: 4096,
  agentMode: 'chat',
  customInstructions: '',
  skillFilterMode: 'all',
  skillTags: null,
  skillNames: null,
  toolFilterMode: 'all',
  toolTags: null,
  toolNames: null,
}

let cachedConfig: AgentConfig | null = null

export function loadConfig(): AgentConfig {
  if (cachedConfig) return { ...cachedConfig }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const saved: Partial<AgentConfig> = raw ? JSON.parse(raw) : {}
    cachedConfig = { ...DEFAULT_CONFIG, ...saved }
  } catch {
    cachedConfig = { ...DEFAULT_CONFIG }
  }
  return { ...cachedConfig! }
}

export function saveConfig(config: AgentConfig): void {
  cachedConfig = { ...config }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (e) {
    console.warn('Config save failed:', e)
  }
}

export function getDefaultConfig(): AgentConfig {
  return { ...DEFAULT_CONFIG }
}

// Agent服务地址, 客户端可自行配置 agent 的 IP/端口进行直连
export function getAgentBaseUrl(): string {
  const cfg = loadConfig()
  const host = cfg.agentHost || '127.0.0.1'
  const port = cfg.agentPort || 9527
  return `http://${host}:${port}`
}

// 历史输入记录存储 (URL / Key / Model)
function getHistory(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToHistory(storageKey: string, value: string): void {
  if (!value) return
  try {
    const history = getHistory(storageKey)
    const updated = [value, ...history.filter(v => v !== value)].slice(0, 10)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  } catch (e) {
    console.warn(`History save failed (${storageKey}):`, e)
  }
}

const URL_HISTORY_KEY = 'xiaoyu_url_history'
const KEY_HISTORY_KEY = 'xiaoyu_key_history'
const MODEL_HISTORY_KEY = 'xiaoyu_model_history'

export function getUrlHistory(): string[] { return getHistory(URL_HISTORY_KEY) }
export function saveUrlToHistory(url: string): void { saveToHistory(URL_HISTORY_KEY, url) }

export function getApiKeyHistory(): string[] { return getHistory(KEY_HISTORY_KEY) }
export function saveApiKeyToHistory(key: string): void { saveToHistory(KEY_HISTORY_KEY, key) }

export function getModelHistory(): string[] { return getHistory(MODEL_HISTORY_KEY) }
export function saveModelToHistory(model: string): void { saveToHistory(MODEL_HISTORY_KEY, model) }

export async function syncConfigToServer(
  apiUrl: string,
  apiKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(getAgentBaseUrl() + '/agent/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_url: apiUrl, api_key: apiKey }),
    })
    const data = await res.json()
    if (res.ok) return { ok: true }
    return { ok: false, error: data.error || '同步失败' }
  } catch (err: any) {
    return { ok: false, error: `连接失败: ${err.message}` }
  }
}
