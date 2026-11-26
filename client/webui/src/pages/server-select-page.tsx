// ====================================================================
//  选服页面
// ====================================================================

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import {
  fetchServerList,
  getSelectedServer,
  selectServer,
  serverBaseUrl,
} from '@/services/server-list'
import type { ServerInfo } from '@/services/server-list'

export default function ServerSelectPage()
{
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const showToast = gameStore((s) => s.showToast)

  // 从默认服拉取对外服列表
  const load = useCallback(() =>
  {
    setLoading(true)
    setError('')
    fetchServerList()
      .then(setServers)
      .catch((err: Error) => setError(err.message || '选服列表加载失败'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() =>
  {
    load()
  }, [load])

  const selected = getSelectedServer()

  // 选中服务器后把主连接切到该网关, 再进入登录页
  const handleSelect = (server: ServerInfo) =>
  {
    gameSocket.disconnect()
    selectServer(server)
    gameSocket.setBaseUrl(serverBaseUrl(server))
    showToast(`已选择服务器 ${server.name}`, 'success')
    navigate('/login')
  }

  return (
    <div className="server-select-page">
      <div className="server-select-box">
        <h1>选择服务器</h1>
        <p className="server-select-tip">默认服下发的可登录服务器</p>

        {loading && <p className="server-select-status">正在获取服务器列表...</p>}

        {!loading && error && (
          <div className="server-select-status server-select-error">
            <p>{error}</p>
            <button className="server-select-retry" onClick={load}>重试</button>
          </div>
        )}

        {!loading && !error && servers.length === 0 && (
          <p className="server-select-status">没有可登录的服务器</p>
        )}

        {!loading && !error && servers.length > 0 && (
          <div className="server-list">
            {servers.map((server) => (
              <button
                key={server.name}
                className={
                  'server-item' + (selected?.name === server.name ? ' server-item-current' : '')
                }
                onClick={() => handleSelect(server)}
              >
                <span className="server-item-name">{server.name}</span>
                <span className="server-item-id">服ID {server.server_id}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
