// ====================================================================
//  聊天气泡组件
// ====================================================================

import { useState } from 'react'
import type { PB_ChatData } from '@/types'
import AvatarPopoverPanel from './avatar-popover-panel'
import { gameStore } from '@/store/game-store'

interface ChatBubblePanelProps {
  message: PB_ChatData
}

export default function ChatBubblePanel({ message }: ChatBubblePanelProps) {
  const [showPopover, setShowPopover] = useState(false)
  const uid = gameStore(s => s.roleInfo?.role_base_info?.uid ?? 0)

  const isSelf = message.uid === uid
  const timeStr = (message.time ?? 0) > 0
    ? new Date((message.time ?? 0) * 1000).toLocaleTimeString()
    : ''

  return (
    <div className={`chat-bubble ${isSelf ? 'chat-bubble--self' : 'chat-bubble--other'}`}>
      {/* 头像 */}
      <div
        className="chat-bubble-avatar"
        onClick={() => setShowPopover(true)}
      >
        🧙
      </div>

      <div className="chat-bubble-body">
        <div className="chat-bubble-name">
          {message.name || message.user_name || `UID:${message.uid}`}
          {timeStr && <span className="chat-bubble-time">{timeStr}</span>}
        </div>

        {/* 消息内容 */}
        <div className="chat-bubble-content">
          {message.chat_msg ? message.chat_msg : null}
        </div>
      </div>

      {/* 头像弹出信息 */}
      {showPopover && (
        <AvatarPopoverPanel
          data={message}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  )
}
