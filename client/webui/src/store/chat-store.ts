import { create } from 'zustand'
import type { PB_ChatData, ChatChannelType } from '@/types'
import { MHT } from '@/types'
import gameSocket from '@/services/socket'

const PAGE_SIZE = 20

interface ChannelState {
  messages: PB_ChatData[]        // 按时间升序(旧→新)
  oldest_loaded_id: number       // 已加载的最旧消息ID,0=无
  has_more: boolean              // 是否还有更旧的消息
  loading: boolean               // 正在加载历史
  prepended: boolean             // 当前消息是handleMore前置插入的结果
}

interface ChatState {
  channels: Record<number, ChannelState>
  currentType: ChatChannelType

  /** 切换频道 */
  switchChannel: (type: ChatChannelType) => void
  /** 加载最新消息 */
  loadLatest: (type: ChatChannelType) => void
  /** 加载更旧的消息 */
  loadMore: (type: ChatChannelType) => void
  /** 处理请求响应: 最新消息 */
  handleLatest: (type: ChatChannelType, messages: PB_ChatData[], begin_id: number, end_id: number) => void
  /** 处理请求响应: 更旧消息(前置) */
  handleMore: (type: ChatChannelType, messages: PB_ChatData[], begin_id: number) => void
}

function createEmptyChannel(): ChannelState {
  return {
    messages: [],
    oldest_loaded_id: 0,
    has_more: true,
    loading: false,
    prepended: false,
  }
}

// ==================== 请求跟踪 ====================
// 用于全局处理器区分"请求响应"和"服务器推送广播"

let _pendingReq: { type: number; mode: 'latest' | 'more' } | null = null

function setPendingReq(type: number, mode: 'latest' | 'more') {
  _pendingReq = { type, mode }
}

// ==================== Store ====================

export const chatStore = create<ChatState>((set, get) => ({
  channels: {},
  currentType: 0, // WORLD

  switchChannel: (type) => {
    const state = get()
    if (state.currentType === type) return
    // 切换频道: 重置并立即从服务器拉最新
    set(s => ({
      currentType: type,
      channels: {
        ...s.channels,
        [type]: createEmptyChannel(),
      },
    }))
    get().loadLatest(type)
  },

  loadLatest: (type) => {
    const ch = get().channels[type]
    // 防止重复请求
    if (ch?.loading) return

    set(s => ({
      channels: {
        ...s.channels,
        [type]: { messages: [], oldest_loaded_id: 0, has_more: true, loading: true, prepended: false },
      },
    }))
    setPendingReq(type, 'latest')
    gameSocket.sendMsg(MHT.MHT_CHAT_CS, {
      req_type: 1,
      type,
      begin_id: 0,
      get_count: PAGE_SIZE,
    })
  },

  loadMore: (type) => {
    const ch = get().channels[type]
    if (!ch || ch.loading || !ch.has_more || ch.oldest_loaded_id <= 0) return

    set(s => ({
      channels: {
        ...s.channels,
        [type]: { ...ch, loading: true },
      },
    }))
    setPendingReq(type, 'more')
    gameSocket.sendMsg(MHT.MHT_CHAT_CS, {
      req_type: 1,
      type,
      begin_id: ch.oldest_loaded_id,
      get_count: PAGE_SIZE,
    })
  },

  handleLatest: (type, messages, begin_id, end_id) => {
    set(s => {
      const ch = s.channels[type] || createEmptyChannel()
      const has_more = begin_id > 1
      const oldest = messages.length > 0 ? (messages[0].id ?? 0) : 0
      return {
        channels: {
          ...s.channels,
          [type]: {
            messages,
            oldest_loaded_id: oldest,
            has_more,
            loading: false,
            prepended: false,
          },
        },
      }
    })
  },

  handleMore: (type, messages, begin_id) => {
    set(s => {
      const ch = s.channels[type] || createEmptyChannel()
      const has_more = begin_id > 1
      const oldest = messages.length > 0 ? (messages[0].id ?? 0) : ch.oldest_loaded_id
      return {
        channels: {
          ...s.channels,
          [type]: {
            messages: [...messages, ...ch.messages],
            oldest_loaded_id: oldest,
            has_more,
            loading: false,
            prepended: true,
          },
        },
      }
    })
  },
}))

// ==================== 全局聊天消息处理器 ====================
// 处理两种场景:
// 其他玩家发送消息的服务器推送广播(仅当前频道追加)

gameSocket.onMsg(MHT.MHT_CHAT_SC, (body: any) => {
  const type = body.type ?? 0
  const msgs = body.chat_msgs as PB_ChatData[] | undefined

  // 请求响应
  if (_pendingReq && _pendingReq.type === type) {
    const mode = _pendingReq.mode
    _pendingReq = null
    // 服务器返回顺序为新→旧,翻转为旧→新
    const sorted = msgs ? [...msgs].reverse() : []
    if (mode === 'latest') {
      chatStore.getState().handleLatest(type, sorted, body.begin_id ?? 0, body.end_id ?? 0)
    } else {
      chatStore.getState().handleMore(type, sorted, body.begin_id ?? 0)
    }
    return
  }

  // 服务器推送广播 —— 仅当前在看的频道才追加,去重
  if (msgs && msgs.length > 0) {
    const state = chatStore.getState()
    if (state.currentType === type) {
      const newMsg = msgs[0]
      // 去重 避免请求响应和广播都包含同一条消息
      const ch = state.channels[type]
      if (ch && ch.messages.some(m => (m.id ?? 0) > 0 && m.id === newMsg.id)) {
        return
      }
      chatStore.setState(s => {
        const c = s.channels[type]
        if (!c) return s
        return {
          channels: {
            ...s.channels,
            [type]: {
              ...c,
              messages: [...c.messages, newMsg],
            },
          },
        }
      })
    }
  }
})

export type { ChatState }
