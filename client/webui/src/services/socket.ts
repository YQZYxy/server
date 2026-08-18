import { gameStore } from '@/store/game-store'
import { MHT, PROTO_BODY_TYPE, PB_MessageHead } from '@/types'
import * as allTypes from '@/types'

// 不打印日志的消息类型 
const SILENT_MSGTYPES = new Set<number>([
  MHT.MHT_USER_HEARTBEAT,
])


// 心跳间隔 (ms) 
const HEARTBEAT_INTERVAL = 10000
// 最大重连次数 
const MAX_RECONNECT_ATTEMPTS = 10
// 重连基础间隔 (ms) 
const RECONNECT_BASE_DELAY = 2000
// 重连最大间隔 (ms) 
const RECONNECT_MAX_DELAY = 10000

// 协议消息体类型, 从 PROTO_BODY_TYPE 映射中查找 
let typeCache: Record<number, any> = {}
function getProtoType(msgType: number): any {
  const name = PROTO_BODY_TYPE[msgType]
  if (!name) return null
  if (!typeCache[msgType]) {
    const cls = (allTypes as any)[name]
    if (cls) typeCache[msgType] = cls
    else console.warn('[Proto] 未找到类型:', name, 'for msgType:', msgType)
  }
  return typeCache[msgType] || null
}

// 清理类型缓存 (协议热更新时调用) 
export function clearProtoTypeCache(): void {
  typeCache = {}
}

// 通用回调 
type EventCallback = (data: any) => void
// 协议消息回调 
type MsgHandler = (body: any) => void

// 连接状态 
export enum ConnectionState {
  Disconnected = 0,
  Connecting,
  Connected,
  GameConnecting,
  GameConnected,
}


class GameSocket {
  private ws: WebSocket | null = null
  private state: ConnectionState = ConnectionState.Disconnected

  private listeners = new Map<string, EventCallback[]>()
  private msgHandlers = new Map<number, Set<MsgHandler>>()

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectAttempts = 0
  private intentionalDisconnect = false

  // 当前连接状态 
  get connectionState(): ConnectionState { return this.state }

  // WebSocket 是否已连接 
  get connected(): boolean {
    return this.state >= ConnectionState.Connected
  }

  // 游戏 TCP 是否已连接 
  get gameConnected(): boolean {
    return this.state >= ConnectionState.GameConnected
  }

  // 连接到网关 WebSocket 
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${location.host}/ws`
    console.log('[WS] 连接:', url)

    this.state = ConnectionState.Connecting
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onopen = () => {
      console.log('[WS] 已连接')
      this.state = ConnectionState.Connected
      this.reconnectAttempts = 0
      this.emit('connected')
    }

    this.ws.onclose = () => {
      console.log('[WS] 断开')
      this.state = ConnectionState.Disconnected
      gameStore.getState().setWsConnected(false)
      this.stopHeartbeat()
      this.emit('disconnected')

      // 主动断开时不触发重连
      if (this.intentionalDisconnect) {
        this.intentionalDisconnect = false
        return
      }
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.emit('connect_error')
    }

    this.ws.onmessage = (event) => {
      this.handleMessage(event)
    }
  }

  // 主动断开所有连接 (退出登录时使用)
  disconnect(): void {
    this.stopHeartbeat()
    this.cancelReconnect()

    const s = gameStore.getState()
    s.setConnected(false)
    s.setReconnecting(false)
    sessionStorage.removeItem('reconnect_username')

    this.intentionalDisconnect = true
    this.state = ConnectionState.Disconnected
    this.reconnectAttempts = 0

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // 断开 WS 并允许自动重连 (TCP 失败时触发网关重新创建 TCP)
  closeAndReconnect(): void {
    this.stopHeartbeat()
    this.state = ConnectionState.Disconnected
    if (this.ws) {
      this.ws.close()   // onclose 会触发 scheduleReconnect
      this.ws = null
    }
  }

  // 发送协议消息 (protobuf 编码 → 二进制 WebSocket) 
  sendMsg(msgType: number, bodyObj: Record<string, any> = {}): void {
    if (!SILENT_MSGTYPES.has(msgType)) {
      console.log('[C]', msgType, bodyObj)
    }
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    try {
      // 编码消息头
      const headObj: any = { msg_type: msgType }
      const token = gameStore.getState().token
      if (token) headObj.token = token
      const headBytes = PB_MessageHead.encode(PB_MessageHead.create(headObj)).finish()

      // 编码消息体
      let bodyBytes = new Uint8Array(0)
      if (bodyObj) {
        const bt = getProtoType(msgType)
        if (bt) {
          const msg = bt.fromObject(bodyObj)
          bodyBytes = new Uint8Array(bt.encode(msg).finish())
        }
      }

      // 组包: [2B headLen(LE)][headBytes][bodyBytes]
      const payloadLen = 2 + headBytes.length + bodyBytes.length
      const packet = new Uint8Array(payloadLen)
      const dv = new DataView(packet.buffer, packet.byteOffset, packet.byteLength)

      dv.setUint16(0, headBytes.length, true)      // headLen (LE)
      packet.set(headBytes, 2)
      packet.set(bodyBytes, 2 + headBytes.length)

      this.ws.send(packet)
    } catch (e: any) {
      console.error('[C] 编码失败:', e.message)
    }
  }

  // 注册协议消息回调 
  onMsg(msgType: number, handler: MsgHandler): void {
    if (!this.msgHandlers.has(msgType)) {
      this.msgHandlers.set(msgType, new Set())
    }
    this.msgHandlers.get(msgType)!.add(handler)
  }

  // 移除协议消息回调 
  offMsg(msgType: number, handler: MsgHandler): void {
    this.msgHandlers.get(msgType)?.delete(handler)
  }

  // 注册通用事件回调 
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(callback)
  }

  // 移除通用事件回调 
  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.listeners.delete(event)
      return
    }
    const cbs = this.listeners.get(event)
    if (cbs) {
      this.listeners.set(event, cbs.filter(cb => cb !== callback))
    }
  }

  // 注册一次性通用事件回调 
  once(event: string, callback: EventCallback): void {
    const wrapper = (data: any) => {
      this.off(event, wrapper)
      callback(data)
    }
    this.on(event, wrapper)
  }

  // 注册一次性协议消息回调
  onceMsg(msgType: number, handler: MsgHandler): void {
    const wrapper = (body: any) => {
      this.offMsg(msgType, wrapper)
      handler(body)
    }
    this.onMsg(msgType, wrapper)
  }

  // 心跳
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.sendMsg(MHT.MHT_USER_HEARTBEAT, {
        time: Math.floor(Date.now() / 1000),
      })
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 重连
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return
    this.reconnectAttempts++
    const delay = Math.min(
      RECONNECT_BASE_DELAY * this.reconnectAttempts,
      RECONNECT_MAX_DELAY,
    )
    console.log(`[WS] ${delay}ms 后重连 (第${this.reconnectAttempts}次)`)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // 处理 WebSocket 消息
  private handleMessage(event: MessageEvent): void {
    if (typeof event.data === 'string') {
      // 不支持 JSON 消息
      return
    }
    this.handleBinaryMessage(event.data)
  }

  // 处理二进制协议消息 (WebSocket 帧已包含完整数据包)
  private handleBinaryMessage(data: ArrayBuffer): void {
    const buf = new Uint8Array(data)
    if (buf.length < 2) return // 至少 [2B headLen]

    const headLen = buf[0] | (buf[1] << 8)  // LE
    if (headLen <= 0 || 2 + headLen > buf.length) return

    try {
      // 解析消息头
      const headBytes = buf.slice(2, 2 + headLen)
      const head = PB_MessageHead.decode(headBytes)
      const msgType = head.msg_type ?? 0

      // 解析消息体
      let body: any = {}
      const bodyStart = 2 + headLen
      if (bodyStart < buf.length) {
        const bt = getProtoType(msgType)
        if (bt) {
          try {
            const decoded = bt.decode(buf.slice(bodyStart))
            body = bt.toObject(decoded, {
              longs: Number,
              enums: Number,
              defaults: true,
              arrays: true,
              objects: true,
            })
          } catch (decodeErr: any) {
            console.error('[S] protobuf解码失败 msgType=%d len=%d bodyStart=%d: %s',
              msgType, buf.length, bodyStart, decodeErr.message)
            // 尝试用 verify 检查数据
            const verifyErr = bt.verify(buf.slice(bodyStart))
            if (verifyErr) console.error('[S] verify错误:', verifyErr)
            return
          }
        }
      }

      if (!SILENT_MSGTYPES.has(msgType)) {
        console.log('[S]', msgType, body)
      }

      // 分发到注册的回调
      const handlers = this.msgHandlers.get(msgType)
      if (handlers) {
        handlers.forEach(fn => fn(body))
      }

      // 连接状态管理
      if (msgType === MHT.MHT_SERVER_CONNECT_RESULT) {
        if (body.success) {
          console.log('[WS] 游戏 TCP 连接成功')
          this.state = ConnectionState.GameConnected
          gameStore.getState().setWsConnected(true)
          this.startHeartbeat()
        } else if (body.disconnect) {
          console.log('[WS] 游戏 TCP 断开')
          this.state = ConnectionState.Connected
          gameStore.getState().setWsConnected(false)
          this.stopHeartbeat()
        }
      }
    } catch (e: any) {
      console.error('[S] 解码失败:', e.message)
    }
  }

  // 触发通用事件 (内部) 
  private emit(event: string, data?: any): void {
    const cbs = this.listeners.get(event)
    if (cbs) {
      cbs.forEach(cb => cb(data))
    }
  }
}

export const gameSocket = new GameSocket()
export default gameSocket
