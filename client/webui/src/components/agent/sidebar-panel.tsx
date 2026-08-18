import { useState, useEffect, useCallback, useRef } from 'react'
import type { AgentConfig, SkillInfo, ToolInfo } from '@/types'
import * as agentApi from '@/services/agent'
import { loadConfig, saveConfig, syncConfigToServer, getUrlHistory, saveUrlToHistory, getApiKeyHistory, saveApiKeyToHistory, getModelHistory, saveModelToHistory } from '@/services/agent-config'
import { useDragResize } from '@/hooks/use-drag-resize'

interface SidebarPanelProps {
  config: AgentConfig
  onConfigChange: (config: AgentConfig) => void
  onClose: () => void
  onSyncSuccess?: () => void
  collapsed?: boolean
}

function extractTags(items: Array<{ tags?: string[] }>): string[] {
  const set = new Set<string>()
  items.forEach((item) => (item.tags || []).forEach((t) => set.add(t)))
  return Array.from(set).sort()
}

const DEFAULT_URLS = [
  'https://api.deepseek.com',
  'http://127.0.0.1:8080/chat/completions',
  'https://api.openai.com/v1',
  'https://api.moonshot.cn/v1',
]

const DEFAULT_MODELS = [
  'XiaoYu', 'deepseek-v4-flash', 'deepseek-v4-pro',
  'gpt-4o', 'gpt-4o-mini', 'claude-4.6-opus',
]

export default function SidebarPanel({ config, onConfigChange, onClose, onSyncSuccess, collapsed }: SidebarPanelProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  useDragResize('sidebarResizeHandle', sidebarRef, 200, 600)

  const [localConfig, setLocalConfig] = useState<AgentConfig>({ ...config })
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [allSkillTags, setAllSkillTags] = useState<string[]>([])
  const [allToolTags, setAllToolTags] = useState<string[]>([])
  const [urlHistory, setUrlHistory] = useState<string[]>([])
  const [apiKeyHistory, setApiKeyHistory] = useState<string[]>([])
  const [modelHistory, setModelHistory] = useState<string[]>([])
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: string } | null>(null)

  useEffect(() => {
    agentApi.fetchSkills().then((list) => {
      setSkills(list)
      setAllSkillTags(extractTags(list))
    })
    agentApi.fetchTools().then((list) => {
      setTools(list)
      setAllToolTags(extractTags(list))
    })
  }, [])

  useEffect(() => {
    setLocalConfig({ ...config })
  }, [config])

  // 加载输入历史
  useEffect(() => {
    setUrlHistory(getUrlHistory())
    setApiKeyHistory(getApiKeyHistory())
    setModelHistory(getModelHistory())
  }, [])

  const doSync = useCallback(async (url: string, key: string) => {
    if (!url) return
    const result = await syncConfigToServer(url, key)
    setStatusMsg({
      text: result.ok ? '✅ 配置已同步' : `❌ ${result.error}`,
      type: result.ok ? 'success' : 'error',
    })
    if (result.ok && onSyncSuccess) {
      onSyncSuccess()
    }
    setTimeout(() => setStatusMsg(null), 3000)
  }, [onSyncSuccess])

  // URL 或 Key 变更时自动同步到服务端
  useEffect(() => {
    if (localConfig.apiUrl) {
      const timer = setTimeout(() => doSync(localConfig.apiUrl, localConfig.apiKey), 500)
      return () => clearTimeout(timer)
    }
  }, [localConfig.apiUrl, localConfig.apiKey, doSync])

  const update = (patch: Partial<AgentConfig>) => {
    const next = { ...localConfig, ...patch }
    setLocalConfig(next)
    saveConfig(next)
    onConfigChange(next)
    // 新输入自动加入历史
    if ('apiUrl' in patch && patch.apiUrl) {
      saveUrlToHistory(patch.apiUrl)
      setUrlHistory(getUrlHistory())
    }
    if ('apiKey' in patch && patch.apiKey) {
      saveApiKeyToHistory(patch.apiKey)
      setApiKeyHistory(getApiKeyHistory())
    }
    if ('model' in patch && patch.model) {
      saveModelToHistory(patch.model)
      setModelHistory(getModelHistory())
    }
  }

  const handleSync = useCallback(async () => {
    await doSync(localConfig.apiUrl, localConfig.apiKey)
  }, [localConfig.apiUrl, localConfig.apiKey, doSync])

  const handleReloadSkills = useCallback(async () => {
    const result = await agentApi.reloadSkills()
    setSkills(result.skills)
    setAllSkillTags(extractTags(result.skills))
  }, [])

  const handleRefreshTools = useCallback(async () => {
    const list = await agentApi.fetchTools()
    setTools(list)
    setAllToolTags(extractTags(list))
  }, [])

  // 筛选模式切换
  const handleSkillFilterMode = (mode: 'all' | 'tag' | 'manual') => {
    update({
      skillFilterMode: mode,
      skillNames: mode === 'manual' ? [] : null,
      skillTags: mode === 'tag' ? [] : null,
    })
  }

  const handleToolFilterMode = (mode: 'all' | 'tag' | 'manual') => {
    update({
      toolFilterMode: mode,
      toolNames: mode === 'manual' ? [] : null,
      toolTags: mode === 'tag' ? [] : null,
    })
  }

  const toggleTag = (key: 'skillTags' | 'toolTags', tag: string) => {
    const current = localConfig[key] || []
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag]
    update({ [key]: next.length > 0 ? next : null } as any)
  }

  const toggleName = (key: 'skillNames' | 'toolNames', name: string) => {
    const current = localConfig[key] || []
    const next = current.includes(name)
      ? current.filter((n) => n !== name)
      : [...current, name]
    update({ [key]: next.length > 0 ? next : null } as any)
  }

  const getActiveSkills = () => {
    const mode = localConfig.skillFilterMode
    if (mode === 'all') return skills
    if (mode === 'tag') {
      const tags = localConfig.skillTags || []
      return skills.filter((s) => (s.tags || []).some((t) => tags.includes(t)))
    }
    const names = localConfig.skillNames || []
    return skills.filter((s) => names.includes(s.name))
  }

  const getActiveTools = () => {
    const mode = localConfig.toolFilterMode
    if (mode === 'all') return tools
    if (mode === 'tag') {
      const tags = localConfig.toolTags || []
      return tools.filter((t) => (t.tags || []).some((g) => tags.includes(g)))
    }
    const names = localConfig.toolNames || []
    return tools.filter((t) => names.includes(t.name))
  }

  return (
    <aside className={`agent-sidebar${collapsed ? ' collapsed' : ''}`} id="sidebar" ref={sidebarRef}>
      <div className="agent-resize-handle" id="sidebarResizeHandle" />
      <div className="agent-sidebar-header">⚙️ 设置</div>
      <div className="agent-sidebar-content">
        {/* Agent 服务地址(客户端自行配置 IP/端口直连) */}
        <div className="agent-sidebar-section">
          <label> Agent 服务 IP/端口</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              style={{ flex: 2 }}
              value={localConfig.agentHost}
              onChange={(e) => update({ agentHost: e.target.value })}
              placeholder="127.0.0.1"
            />
            <input
              type="number"
              style={{ flex: 1 }}
              value={localConfig.agentPort}
              onChange={(e) => update({ agentPort: Number(e.target.value) || 9527 })}
              placeholder="9527"
            />
          </div>
        </div>

        {/* LLM 后端配置 */}
        <div className="agent-sidebar-section">
          <label>🔗 API Url</label>
          <input
            type="url"
            value={localConfig.apiUrl}
            list="apiUrlList"
            onChange={(e) => update({ apiUrl: e.target.value })}
            placeholder="http://127.0.0.1:8080/chat/completions"
          />
          <datalist id="apiUrlList">
            {urlHistory.filter(u => u && !DEFAULT_URLS.includes(u)).map((url, i) => (
              <option key={i} value={url} />
            ))}
            {DEFAULT_URLS.map((url, i) => <option key={`d${i}`} value={url} />)}
          </datalist>
        </div>

        <div className="agent-sidebar-section">
          <label>🔑 API Key（可选）</label>
          <input
            type="text"
            value={localConfig.apiKey}
            list="apiKeyList"
            onChange={(e) => update({ apiKey: e.target.value })}
            placeholder="sk-..."
          />
          <datalist id="apiKeyList">
            <option value="sk-" />
            {apiKeyHistory.filter(k => k).map((key, i) => (
              <option key={i} value={key} />
            ))}
          </datalist>
        </div>

        <div className="agent-sidebar-section">
          <label>🧩 模型</label>
          <input
            type="text"
            value={localConfig.model}
            list="modelList"
            onChange={(e) => update({ model: e.target.value })}
            placeholder="输入模型名称, 如 小鱼 或者 deepseek"
          />
          <datalist id="modelList">
            {modelHistory.filter(m => m && !DEFAULT_MODELS.includes(m)).map((model, i) => (
              <option key={i} value={model} />
            ))}
            {DEFAULT_MODELS.map((m, i) => <option key={`d${i}`} value={m} />)}
          </datalist>
        </div>

        <div className="agent-sidebar-section">
          <label>🌡️ 温度: {localConfig.temperature}</label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={localConfig.temperature}
            onChange={(e) => update({ temperature: parseFloat(e.target.value) })}
          />
        </div>

        <div className="agent-sidebar-section">
          <label>📏 最大 Token</label>
          <input
            type="number"
            value={localConfig.maxTokens}
            min={1}
            max={32768}
            onChange={(e) => update({ maxTokens: parseInt(e.target.value) || 4096 })}
          />
        </div>

        {/* Agent 专属配置 */}
        {localConfig.agentMode === 'agent' && (
          <>
            <div className="agent-sidebar-section">
              <label>🧠 技能加载</label>
              <div className="agent-filter-bar">
                <select
                  value={localConfig.skillFilterMode}
                  onChange={(e) => handleSkillFilterMode(e.target.value as any)}
                >
                  <option value="all">全部技能</option>
                  <option value="tag">按标签筛选</option>
                  <option value="manual">手动选择</option>
                </select>
              </div>

              {localConfig.skillFilterMode === 'tag' && allSkillTags.length > 0 && (
                <div className="agent-tag-chips">
                  {allSkillTags.map((tag) => (
                    <span
                      key={tag}
                      className={`agent-tag-chip${(localConfig.skillTags || []).includes(tag) ? ' selected' : ''}`}
                      onClick={() => toggleTag('skillTags', tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {localConfig.skillFilterMode === 'manual' && skills.length > 0 && (
                <div className="agent-filter-checkboxes">
                  {skills.map((s) => (
                    <label key={s.name} className="agent-filter-checkbox-item" title={s.description}>
                      <input
                        type="checkbox"
                        checked={(localConfig.skillNames || []).includes(s.name)}
                        onChange={() => toggleName('skillNames', s.name)}
                      />
                      <span>{s.name}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {s.source === 'markdown' ? '📄' : '🐍'}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* 已选技能徽章 */}
              <div className="agent-tag-chips" id="skillChips">
                {getActiveSkills().length > 0
                  ? getActiveSkills().map((s) => (
                      <span key={s.name} className="agent-filter-badge" title={s.description}>
                        {s.source === 'markdown' ? '📄' : '🐍'} {s.name}
                      </span>
                    ))
                  : <span className="agent-filter-placeholder">未加载技能</span>}
              </div>

              <button
                className="agent-btn agent-btn-secondary agent-btn-sm"
                style={{ marginTop: 8, width: '100%' }}
                onClick={handleReloadSkills}
              >
                🔄 重新加载技能
              </button>
            </div>

            <div className="agent-sidebar-section">
              <label>🧰 工具</label>
              <div className="agent-filter-bar">
                <select
                  value={localConfig.toolFilterMode}
                  onChange={(e) => handleToolFilterMode(e.target.value as any)}
                >
                  <option value="all">全部工具</option>
                  <option value="tag">按标签筛选</option>
                  <option value="manual">手动选择</option>
                </select>
              </div>

              {localConfig.toolFilterMode === 'tag' && allToolTags.length > 0 && (
                <div className="agent-tag-chips">
                  {allToolTags.map((tag) => (
                    <span
                      key={tag}
                      className={`agent-tag-chip${(localConfig.toolTags || []).includes(tag) ? ' selected' : ''}`}
                      onClick={() => toggleTag('toolTags', tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {localConfig.toolFilterMode === 'manual' && tools.length > 0 && (
                <div className="agent-filter-checkboxes">
                  {tools.map((t) => (
                    <label key={t.name} className="agent-filter-checkbox-item" title={t.description}>
                      <input
                        type="checkbox"
                        checked={(localConfig.toolNames || []).includes(t.name)}
                        onChange={() => toggleName('toolNames', t.name)}
                      />
                      <span>{t.name}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {(t.tags || []).join(', ')}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="agent-tag-chips" id="toolChips">
                {getActiveTools().length > 0
                  ? getActiveTools().map((t) => (
                      <span key={t.name} className="agent-filter-badge" title={t.description}>
                        🔧 {t.name}
                      </span>
                    ))
                  : <span className="agent-filter-placeholder">未选择工具</span>}
              </div>

              <button
                className="agent-btn agent-btn-secondary agent-btn-sm"
                style={{ marginTop: 8, width: '100%' }}
                onClick={handleRefreshTools}
              >
                🔄 重新加载工具
              </button>
            </div>
          </>
        )}

        <div className="agent-sidebar-section">
          <label>📝 额外系统指令</label>
          <textarea
            value={localConfig.customInstructions}
            onChange={(e) => update({ customInstructions: e.target.value })}
            placeholder="系统指令..."
            rows={3}
          />
        </div>

        <button className="agent-btn agent-btn-primary" onClick={handleSync}>
          💾 保存并同步配置
        </button>

        {statusMsg && (
          <div className={`agent-status-msg ${statusMsg.type} show`}>
            {statusMsg.text}
          </div>
        )}
      </div>
    </aside>
  )
}
