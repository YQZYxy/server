// ====================================================================
//  聊天频道切换组件
// ====================================================================

import { ChatChannelType, CHAT_CHANNELS } from '@/types'

interface ChatTypeSwitchPanelProps {
  current: ChatChannelType
  onChange: (type: ChatChannelType) => void
}

export default function ChatTypeSwitchPanel({ current, onChange }: ChatTypeSwitchPanelProps) {
  return (
    <div className="chat-type-switch">
      {CHAT_CHANNELS.map((channel) => (
        <button
          key={channel.type}
          className={`chat-type-btn ${current === channel.type ? 'active' : ''}`}
          onClick={() => onChange(channel.type)}
        >
          <span className="chat-type-icon">{channel.icon}</span>
          <span className="chat-type-label">{channel.label}</span>
        </button>
      ))}
    </div>
  )
}
