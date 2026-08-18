import { useEffect, useRef, useCallback, useState } from 'react'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { chatStore } from '@/store/chat-store'
import { ChatBubblePanel, ChatTypeSwitchPanel } from '@/components/chat'

/** 生成稳定 key: 有 id 用 id, 否则用时间戳+内容组合 */
let msgCounter = 0
function msgKey(msg: { id: number; chat_msg: string; time: number; uid: number }) {
  if (msg.id && msg.id > 0) return msg.id
  // id=0(服务器bug)时用自增计数器保证唯一
  msgCounter++
  return `m-${msg.uid}-${Date.now()}-${msgCounter}`
}

export default function ChatPage() {
  const channels = chatStore((s) => s.channels)
  const currentType = chatStore((s) => s.currentType)
  const switchChannel = chatStore((s) => s.switchChannel)
  const loadLatest = chatStore((s) => s.loadLatest)
  const loadMore = chatStore((s) => s.loadMore)

  const [input, setInput] = useState('')
  const [isAtBottom, setIsAtBottom] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMsgLenRef = useRef(0)
  const anchorMsgIdRef = useRef(0) // loadMore前可见的第一条消息id

  const channel = channels[currentType]
  const messages = channel?.messages ?? []
  const loading = channel?.loading ?? false
  const has_more = channel?.has_more ?? true

  // 每次进入都从服务器拉最新
  useEffect(() => {
    loadLatest(currentType)
  }, [currentType, loadLatest])

  // 前置插入后: 滚动到之前保存的anchor消息
  useEffect(() => {
    const anchorId = anchorMsgIdRef.current
    if (!anchorId) return

    // 只有第一条消息id比锚点更旧(前置插入发生),才消费锚点
    const firstId = messages[0]?.id
    if (!firstId || firstId >= anchorId) return

    anchorMsgIdRef.current = 0
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector(`[data-msg-id="${anchorId}"]`)
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    })
  }, [messages])

  // 自动滚到底部(广播/自己发送)
  useEffect(() => {
    const len = messages.length
    if (len > prevMsgLenRef.current && isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    } else if (len === 0) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView()
      })
    }
    prevMsgLenRef.current = len
  }, [messages, isAtBottom])

  // 监视滚动位置
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const atBottom = scrollHeight - scrollTop - clientHeight < 60
    setIsAtBottom(atBottom)

    // 滚动到顶部附近时触发加载历史
    if (scrollTop < 80 && has_more && !loading) {
      // 找到当前可见的第一条消息id作为锚点
      const msgEls = el.querySelectorAll<HTMLElement>('[data-msg-id]')
      for (const child of msgEls) {
        if (child.offsetTop + child.offsetHeight > scrollTop) {
          anchorMsgIdRef.current = Number(child.getAttribute('data-msg-id'))
          break
        }
      }
      loadMore(currentType)
    }
  }, [has_more, loading, loadMore, currentType])

  // 发送消息
  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return

    setInput('')
    gameSocket.sendMsg(MHT.MHT_CHAT_CS, {
      req_type: 0,
      type: currentType,
      chat_msg: text,
      begin_id: 0,
      get_count: 0,
    })
  }, [input, currentType])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 快捷导航按钮
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsAtBottom(true)
  }, [])

  return (
    <div className="chat-page">
      {/* 消息列表 */}
      <div className="chat-messages" ref={listRef} onScroll={handleScroll}>
        {/* 顶部加载指示器 */}
        {loading && (
          <div className="chat-loading">
            <span className="chat-loading-dot" />
            <span>加载中...</span>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="empty-hint">暂无聊天消息</div>
        )}

        {messages.map((msg) => (
          <div key={msgKey(msg as any)} data-msg-id={(msg as any).id}>
            <ChatBubblePanel message={msg} />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* 快捷导航按钮(浮动) */}
      {messages.length > 0 && (
        <div className="chat-nav-btns">
          {!isAtBottom && (
            <button className="chat-nav-btn chat-nav-btn--bottom" onClick={scrollToBottom} title="回到最新">
              ↓
            </button>
          )}
          <button className="chat-nav-btn chat-nav-btn--top" onClick={scrollToTop} title="翻到最上面">
            ↑
          </button>
        </div>
      )}

      {/* 频道切换 + 输入区 */}
      <div className="chat-input-wrapper">
        <ChatTypeSwitchPanel
          current={currentType}
          onChange={(type) => switchChannel(type)}
        />

        <div className="chat-input-area">
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入聊天消息..."
          />
          <button onClick={sendMessage}>发送</button>
        </div>
      </div>
    </div>
  )
}
