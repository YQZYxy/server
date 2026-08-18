// ============================================================
//  聊天系统类型
// ============================================================

// ==================== 聊天频道类型 ====================

export enum ChatChannelType {
  WORLD = 0,
  // 后续扩展: PRIVATE = 1, TEAM = 2, GUILD = 3
}

// 聊天频道定义
export interface ChatChannelDef {
  type: ChatChannelType
  label: string
  icon: string
}

/** 所有可用的聊天频道 */
export const CHAT_CHANNELS: ChatChannelDef[] = [
  { type: ChatChannelType.WORLD, label: '世界', icon: '🌍' },
  // 后续在此追加新频道
]