// ====================================================================
//  GameStore - 全局游戏状态管理
// ====================================================================

import { create } from 'zustand'
import type {
  P_SyncRoleInfoRet_SC,
  P_SyncRoleExtraData_SC,
  P_SyncInventoryData_SC,
  P_SyncQuestData_SC,
  P_SyncHeroData_SC,
  P_SyncLineupData_SC,
} from '@/types'

interface GameState {
  // ---- 连接状态 ----
  connected: boolean       // 已连接到游戏服务器(登录成功)
  wsConnected: boolean     // WebSocket 连接状态
  reconnecting: boolean    // 正在重连中
  username: string
  token: string

  // ---- 游戏消息 ----
  gmLogs: string[]

  // ---- 通用面板(通过registry查找组件) ----
  activePanel: string
  showMoreBubble: boolean

  // ---- 角色同步数据 (来自服务器协议) ----
  roleInfo: P_SyncRoleInfoRet_SC | null
  roleExtra: P_SyncRoleExtraData_SC | null
  inventory: P_SyncInventoryData_SC | null
  quest: P_SyncQuestData_SC | null

  // ---- 英雄/阵容数据 ----
  heroData: P_SyncHeroData_SC | null
  lineupData: P_SyncLineupData_SC | null

  // ---- 战斗系统 ----
  battleModeIndex: number        // 当前选择战斗模式索引
  battleLevelIndex: number       // 当前选择关卡索引

  // ---- UI 通知 ----
  toast: { message: string; type: 'info' | 'error' | 'success' } | null
  loading: boolean

  // ---- 动作 ----
  setConnected: (v: boolean) => void
  setWsConnected: (v: boolean) => void
  setReconnecting: (v: boolean) => void
  setUsername: (v: string) => void
  setToken: (v: string) => void
  addGMLog: (log: string) => void
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void
  hideToast: () => void
  setLoading: (v: boolean) => void

  // 面板
  setActivePanel: (panel: string) => void
  setShowMoreBubble: (v: boolean) => void

  // 战斗动作
  setBattleModeIndex: (idx: number) => void
  setBattleLevelIndex: (idx: number) => void
}

export const gameStore = create<GameState>((set) => ({
  // ---- 连接状态 ----
  connected: false,
  wsConnected: false,
  reconnecting: false,
  username: '',
  token: '',

  // ---- 游戏消息 ----
  gmLogs: [],

  // ---- UI ----
  toast: null,
  loading: false,

  // ---- 通用面板 ----
  activePanel: 'none',
  showMoreBubble: false,

  // ---- 角色数据 ----
  roleInfo: null,
  roleExtra: null,
  inventory: null,
  quest: null,

  // ---- 英雄/阵容 ----
  heroData: null,
  lineupData: null,

  // ---- 战斗 ----
  battleModeIndex: 0,
  battleLevelIndex: 0,

  // ---- 动作实现 ----
  setConnected: (v) => set({ connected: v }),
  setWsConnected: (v) => set({ wsConnected: v }),
  setReconnecting: (v) => set({ reconnecting: v }),
  setUsername: (v) => set({ username: v }),
  setToken: (v) => set({ token: v }),
  addGMLog: (log) => set((s) => ({ gmLogs: [...s.gmLogs, log] })),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),
  setLoading: (v) => set({ loading: v }),

  setActivePanel: (panel) => set({ activePanel: panel, showMoreBubble: false }),
  setShowMoreBubble: (v) => set({ showMoreBubble: v }),

  setBattleModeIndex: (idx) => set({ battleModeIndex: idx, battleLevelIndex: 0 }),
  setBattleLevelIndex: (idx) => set({ battleLevelIndex: idx }),
}))
