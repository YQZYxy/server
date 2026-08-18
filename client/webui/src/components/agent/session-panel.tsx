import { useEffect, useState, useCallback, useRef } from 'react'
import * as agentApi from '@/services/agent'
import type { SessionInfo } from '@/types'
import { useDragResize } from '@/hooks/use-drag-resize'

interface SessionPanelProps {
  currentSessionId: string | null
  onSwitchSession: (id: string) => void
  onNewSession: () => void
  collapsed?: boolean
}

export default function SessionPanel({
  currentSessionId,
  onSwitchSession,
  onNewSession,
  collapsed,
}: SessionPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDragResize('sessionResizeHandle', panelRef, 160, 400)

  const [sessions, setSessions] = useState<SessionInfo[]>([])

  const loadSessions = useCallback(async () => {
    const list = await agentApi.listSessions()
    setSessions((prev) => {
      // 用服务端数据更新已有会话
      const merged = prev.map((s) => {
        const server = list.find((l) => l.session_id === s.session_id)
        return server ? { ...s, ...server } : s
      })
      // 追加服务端有但本地没有的会话
      for (const s of list) {
        if (!merged.find((m) => m.session_id === s.session_id)) {
          merged.push(s)
        }
      }
      return merged
    })
  }, [])

  // 挂载时加载一次会话列表
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // 刷新已有会话的标题/消息数(不覆盖列表顺序)
  const refreshSessionData = useCallback(async () => {
    const list = await agentApi.listSessions()
    setSessions((prev) =>
      prev.map((s) => {
        const server = list.find((l) => l.session_id === s.session_id)
        return server ? { ...s, ...server } : s
      })
    )
  }, [])

  // 当前会话不在列表中时插入到顶部, 同时刷新已有会话数据
  useEffect(() => {
    if (!currentSessionId) return
    setSessions((prev) => {
      if (prev.find((s) => s.session_id === currentSessionId)) return prev
      return [
        {
          session_id: currentSessionId,
          title: '新对话',
          message_count: 0,
        },
        ...prev,
      ]
    })
    // 切换会话时刷新老会话的标题/消息数
    refreshSessionData()
  }, [currentSessionId, refreshSessionData])

  // 新建会话包装
  const handleNewSession = useCallback(async () => {
    await onNewSession()
    // onNewSession -> newSession -> switchToSession -> setSessionId
    // 会触发上面的 useEffect(currentSessionId), 自动刷新数据
  }, [onNewSession])

  // 删除会话
  const handleDelete = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation()
    // 在删除前记录当前列表, 用于计算下一个会话
    const prevList = sessions
    const idx = prevList.findIndex((s) => s.session_id === sid)

    // 立即从本地列表中移除
    setSessions((p) => p.filter((s) => s.session_id !== sid))
    await agentApi.deleteSession(sid)

    if (sid === currentSessionId) {
      // 找下一个会话: 优先同一位置(后一个), 否则前一个
      const remaining = prevList.filter((s) => s.session_id !== sid)
      let nextId: string | null = null
      if (remaining.length > 0) {
        nextId = idx < remaining.length
          ? remaining[idx].session_id
          : remaining[remaining.length - 1].session_id
      }

      if (nextId) {
        onSwitchSession(nextId)
      } else {
        // 没有剩余会话, 创建新会话
        handleNewSession()
      }
    } else {
      loadSessions()
    }
  }

  return (
    <aside className={`agent-session-panel${collapsed ? ' collapsed' : ''}`} id="sessionPanel" ref={panelRef}>
      <div className="agent-resize-handle" id="sessionResizeHandle" />
      <div className="agent-session-header">
        <span>📋 会话</span>
        <button
          className="agent-btn agent-btn-sm agent-btn-secondary"
          onClick={handleNewSession}
        >
          ＋ 新建
        </button>
      </div>
      <div className="agent-session-list" id="sessionList">
        {sessions.length === 0 ? (
          <div className="agent-filter-placeholder" style={{ textAlign: 'center', padding: 20 }}>
            暂无会话
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.session_id}
              className={`agent-session-item${s.session_id === currentSessionId ? ' active' : ''}`}
              data-session-id={s.session_id}
              onClick={() => onSwitchSession(s.session_id)}
            >
              <span className="agent-session-title" title={s.title}>
                {s.title || '新对话'}
              </span>
              <span className="agent-session-msg-count">{s.message_count || 0}</span>
              <button
                className="agent-session-delete-btn"
                title="删除"
                onClick={(e) => handleDelete(e, s.session_id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
