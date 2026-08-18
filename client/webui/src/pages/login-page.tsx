// ====================================================================
//  登录页面
// ====================================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const navigate = useNavigate()
  const store = gameStore()
  const isLoggingInRef = useRef(false)

  // 恢复上次登录的用户名
  useEffect(() => {
    const saved = localStorage.getItem('login_username_storage')
    if (saved) setUsername(saved)
  }, [])

  // 网关在 WS 连接后自动创建 TCP, 等待连接结果后发登录
  const doLogin = useCallback(() => {
    if (isLoggingInRef.current) return

    if (!username.trim()) {
      store.showToast('请输入用户名', 'error')
      return
    }

    setLoggingIn(true)
    isLoggingInRef.current = true
    store.setLoading(true)
    store.setUsername(username)

    const doSendLogin = () => {
      setStatus('已连接, 正在登录...')
      gameSocket.sendMsg(MHT.MHT_LOGIN_CS, { login_user_name: username })
      setStatus('登录已发起, 等待服务器响应...')
    }

    // TCP 已连, 直接发登录
    if (gameSocket.gameConnected) {
      doSendLogin()
      return
    }

    gameSocket.onceMsg(MHT.MHT_SERVER_CONNECT_RESULT, (body: any) => {
      if (body.success) {
        doSendLogin()
      } else {
        setLoggingIn(false)
        isLoggingInRef.current = false
        store.setLoading(false)
        setStatus(body.error || '连接服务器失败')
        store.showToast('连接失败: ' + (body.error || '未知错误'), 'error')
      }
    })

    if (!gameSocket.connected) {
      setStatus('正在连接服务器...')
      gameSocket.once('connected', () => {
        // 网关自动创建 TCP, onceMsg 会收到结果
      })
      gameSocket.connect()
    }
    // 如果 WS 已连但 TCP 未连, onceMsg 会自动收到结果
  }, [username, store])

  // 登录结果
  useEffect(() => {
    const handler = (body: any) => {
      store.setLoading(false)
      const err = body?.error_message
      const token = body?.token
      if (token) {
        navigate('/hall')
      } else if (err) {
        setStatus('登录失败: ' + err)
        store.showToast('登录失败: ' + err, 'error')
      }
    }
    gameSocket.onMsg(MHT.MHT_LOGIN_SC, handler)
    return () => gameSocket.offMsg(MHT.MHT_LOGIN_SC, handler)
  }, [navigate, store])


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doLogin()
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>我的小鱼</h1>
        <input
          id="login-username"
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <input
          id="login-password"
          type="password"
          placeholder="密码 (暂未启用鉴权)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={doLogin} disabled={loggingIn}>
          {loggingIn ? '登录中...' : '登录'}
        </button>
        <p id="login-status" className="login-status">{status}</p>
        <div className="login-divider" />
        <button
          className="btn-agent"
          onClick={() => navigate('/agent')}
        >
          🐟 小鱼(免登录)
        </button>
      </div>
    </div>
  )
}
