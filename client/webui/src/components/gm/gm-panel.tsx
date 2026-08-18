// ====================================================================
//  GM指令面板
// ====================================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import PanelShell from '@/components/panel-shell'

const HISTORY_KEY = 'gm_history'
const MAX_HISTORY = 50
const SHORTCUTS = [
  { label: '热更lua', cmd: 'reloadlua' },
  { label: 'lua状态', cmd: 'luastatus' },
]

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function saveHistory(cmd: string): void {
  let list = loadHistory()
  list = [cmd, ...list.filter(c => c !== cmd)]
  if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

export default function GMPanel() {
  const logs = gameStore((s) => s.gmLogs)
  const addGMLog = gameStore((s) => s.addGMLog)
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const history = loadHistory()

  useEffect(() => {
    const handler = (body: any) => addGMLog(JSON.stringify(body, null, 2))
    gameSocket.onMsg(MHT.MHT_GM_SC, handler)
    return () => gameSocket.offMsg(MHT.MHT_GM_SC, handler)
  }, [addGMLog])

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [logs])

  const send = useCallback((cmd?: string) => {
    const params = (cmd || input).trim()
    if (!params) return
    setInput('')
    setHistoryIndex(-1)
    saveHistory(params)
    addGMLog('> ' + params)
    gameSocket.sendMsg(MHT.MHT_GM_CS, { params })
  }, [input, addGMLog])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { send(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = loadHistory()
      if (h.length === 0) return
      const idx = historyIndex > 0 ? historyIndex - 1 : (historyIndex === -1 && h.length > 0 ? 0 : -1)
      setHistoryIndex(idx)
      setInput(idx >= 0 ? h[idx] : '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = loadHistory()
      if (h.length === 0) return
      if (historyIndex >= h.length - 1) { setHistoryIndex(-1); setInput(''); return }
      const idx = historyIndex < 0 ? 0 : historyIndex + 1
      setHistoryIndex(idx)
      setInput(h[idx] || '')
      return
    }
  }

  return (
    <PanelShell title="GM 指令" className="gm-panel">
      <div className="gm-panel-output" ref={containerRef}>
        {logs.map((log, i) => <pre key={i}>{log}</pre>)}
      </div>

      <div className="gm-shortcuts gm-panel-shortcuts">
        {SHORTCUTS.map((s) => (
          <button key={s.cmd} className="gm-shortcut-btn" onClick={() => send(s.cmd)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="gm-input-area" style={{ position: 'relative' }}>
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowHistory(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          placeholder="输入 GM 指令 (↑↓ 历史)..."
        />
        <button onClick={() => send()}>发送</button>
        {showHistory && history.length > 0 && (
          <div className="gm-history-dropdown">
            {history.map((cmd, i) => (
              <div key={i} className={`gm-history-item ${i === historyIndex ? 'active' : ''}`}
                   onMouseDown={() => { setInput(cmd); setShowHistory(false) }}>
                {cmd}
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  )
}
