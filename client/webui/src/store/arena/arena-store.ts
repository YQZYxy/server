// ====================================================================
//  ArenaStore - 竞技场状态管理
// ====================================================================

import { create } from 'zustand'
import type {
  P_Arena_SC,
  PB_ArenaOpponentInfo,
  PB_ArenaBattleLog,
  P_ArenaBattleLog_SC,
  PB_ArenaRankNode,
  P_ArenaRank_SC,
} from '@/types'

interface ArenaState {
  // 基础数据
  score: number
  dailyChallengeCount: number
  dailyRefreshCount: number

  // 对手列表
  opponents: PB_ArenaOpponentInfo[]

  // 战斗日志
  battleLogs: PB_ArenaBattleLog[]

  // 竞技场排行榜
  rankList: PB_ArenaRankNode[]
  rankHasMore: boolean
  rankTotal: number

  // 界面状态
  showArena: boolean
  showRank: boolean
  showOpponentDetail: boolean
  selectedOpponent: PB_ArenaOpponentInfo | null
  showBattleLog: boolean

  // 动作
  setArenaInfo: (data: P_Arena_SC) => void
  setOpponents: (opponents: PB_ArenaOpponentInfo[]) => void
  setBattleLogsData: (data: P_ArenaBattleLog_SC) => void
  setRankListData: (data: P_ArenaRank_SC, append?: boolean) => void
  clearRankList: () => void
  setShowArena: (v: boolean) => void
  setShowRank: (v: boolean) => void
  setShowOpponentDetail: (opponent: PB_ArenaOpponentInfo | null) => void
  setShowBattleLog: (v: boolean) => void
  resetArena: () => void
}

export const arenaStore = create<ArenaState>((set, get) => ({
  score: 0,
  dailyChallengeCount: 0,
  dailyRefreshCount: 0,
  opponents: [],
  battleLogs: [],
  rankList: [],
  rankHasMore: false,
  rankTotal: 0,
  showArena: false,
  showRank: false,
  showOpponentDetail: false,
  showBattleLog: false,
  selectedOpponent: null,

  setArenaInfo: (data) => set({
    score: data.score ?? 0,
    dailyChallengeCount: data.daily_challenge_count ?? 0,
    dailyRefreshCount: data.daily_refresh_count ?? 0,
    opponents: data.opponents ?? [],
  }),

  setOpponents: (opponents) => set({ opponents }),

  // 从PPArenaBattleLog_SC设置战斗日志
  setBattleLogsData: (data) => set({
    battleLogs: data.battle_logs ?? [],
  }),

  // 从PPArenaRank_SC设置排行榜
  setRankListData: (data, append) => {
    if (append) {
      set(state => ({
        rankList: [...state.rankList, ...(data.rank_list ?? [])],
        rankHasMore: data.has_more ?? false,
        rankTotal: data.total ?? state.rankTotal,
      }))
    } else {
      set({
        rankList: data.rank_list ?? [],
        rankHasMore: data.has_more ?? false,
        rankTotal: data.total ?? 0,
      })
    }
  },

  clearRankList: () => set({
    rankList: [],
    rankHasMore: false,
    rankTotal: 0,
  }),

  setShowArena: (v) => set({ showArena: v }),
  setShowRank: (v) => set({ showRank: v }),
  setShowOpponentDetail: (opponent) => set({
    showOpponentDetail: opponent !== null,
    selectedOpponent: opponent,
  }),
  setShowBattleLog: (v) => set({ showBattleLog: v }),

  resetArena: () => set({
    score: 0,
    dailyChallengeCount: 0,
    dailyRefreshCount: 0,
    opponents: [],
    battleLogs: [],
    rankList: [],
    rankHasMore: false,
    rankTotal: 0,
    showRank: false,
    showOpponentDetail: false,
    showBattleLog: false,
    selectedOpponent: null,
  }),
}))
