// ====================================================================
//  其他页面
// ====================================================================

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { getAgentBaseUrl } from '@/services/agent-config'

export default function InfoPage() {
  const navigate = useNavigate()
  const connected = gameStore((s) => s.connected)
  const username = gameStore((s) => s.username)
  const [serverStatus, setServerStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    fetch(getAgentBaseUrl() + '/agent/status')
      .then((r) => r.json())
      .then((data) => setServerStatus(data.llm_connected ? 'ok' : 'error'))
      .catch(() => setServerStatus('error'))
  }, [])

  return (
    <div className="info-page">
      <h2>我的</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">游戏连接</span>
          <span className="info-value" style={{ color: connected ? 'var(--success)' : 'var(--danger)' }}>
            {connected ? '已连接' : '未连接'}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">用户名</span>
          <span className="info-value">{username || '-'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">小鱼</span>
          <span className="info-value" style={{
            color: serverStatus === 'ok' ? 'var(--success)' : serverStatus === 'error' ? 'var(--danger)' : 'var(--text-muted)'
          }}>
            {serverStatus === 'ok' ? '在线' : serverStatus === 'error' ? '离线' : '检测中...'}
          </span>
        </div>
      </div>
      <button className="info-logout-btn" onClick={() => {
        gameSocket.disconnect()
        navigate('/login')
      }}>
        🚪 退出登录
      </button>
    </div>
  )
}
