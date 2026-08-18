// ====================================================================
//  断线重连模块
// ====================================================================

import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { gameStore } from '@/store/game-store'

/** 登录成功时调用 */
export function resetReconnect(): void {
}

// ---- 注册全局重连事件监听 (模块加载时执行) ----

// WS 连接后: 检测是否需要重连, 网关会自动创建 TCP, 等待连接结果即可
gameSocket.on('connected', () => {
  const s = gameStore.getState()
  const needReconnect = s.reconnecting
    ? s.username
    : sessionStorage.getItem('reconnect_username')

  if (!needReconnect) return
  if (s.connected && !s.reconnecting) {
    console.log('[Reconnect] 已登录, 忽略 WS 重连事件')
    return
  }

  if (!s.reconnecting) {
    s.setReconnecting(true)
    s.setUsername(needReconnect)
    s.setConnected(true)
  }
  console.log('[Reconnect] WS已恢复, 等待网关自动创建 TCP 连接...')
})

// WS 断开: 标记重连状态
gameSocket.on('disconnected', () => {
  if (gameStore.getState().connected) {
    gameStore.getState().setReconnecting(true)
  }
})

// 游戏 TCP 连接结果 / 断线通知 (JSON 控制消息, 统一走 msgHandlers)
gameSocket.onMsg(MHT.MHT_SERVER_CONNECT_RESULT, (body: any) => {
  const s = gameStore.getState()

  // TCP 断线: 标记重连, 等 WS 重连后网关自动重建
  if (body?.disconnect) {
    if (s.connected) {
      console.log('[Reconnect] 游戏TCP断线, 等待 WS 重连后自动恢复')
      s.setReconnecting(true)
    }
    return
  }

  // 重连模式下的 TCP 连接结果
  if (s.reconnecting) {
    if (body?.success) {
      const uname = s.username
      if (uname) {
        console.log('[Reconnect] TCP已恢复, 自动发送登录')
        gameSocket.sendMsg(MHT.MHT_LOGIN_CS, { login_user_name: uname })
      }
    } else {
      // TCP 连接失败时, WS 仍连, 需断 WS 触发自动重连来重建 TCP
      console.log('[Reconnect] TCP连接失败, 断开 WS 触发重连')
      gameSocket.closeAndReconnect()
      s.setConnected(false)
    }
  }
})

// 登录成功: 恢复连接状态 (自动登录和首次登录都走这里)
gameSocket.onMsg(MHT.MHT_LOGIN_SC, (body: any) => {
  const token = body?.token
  if (!token) return

  const s = gameStore.getState()
  s.setToken(token)
  s.setConnected(true)
  s.setReconnecting(false)
  localStorage.setItem('login_username_storage', s.username)
  if (s.username) sessionStorage.setItem('reconnect_username', s.username)
})

console.log('[Reconnect] 重连模块已初始化')

// F5 刷新后自动连接 WS
if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('reconnect_username')) {
  gameSocket.connect()
}
