// ============================================================
//  战斗系统类型与常量
// ============================================================

import { getCachedConfig } from '@/services/configmanager'
import type { BattlestageConfig, BattlemonstergroupConfig } from './config'

// ==================== 战斗类型 ====================

export enum BattleType {
  NONE = 0,
  /** 主线副本 (PVE) */
  MAIN_BATTLE = 1,
  /** 竞技场 (PVP) */
  ARENA = 2,
}

/** 战斗类型显示配置 */
export interface BattleTypeConfig {
  id: BattleType
  label: string
  icon: string
}

/** 所有战斗类型的显示配置列表 */
export const BATTLE_TYPE_CONFIGS: BattleTypeConfig[] = [
  { id: BattleType.MAIN_BATTLE, label: '主线', icon: '📖' },
  { id: BattleType.ARENA,       label: '竞技场', icon: '⚔️' },
]

/** 根据数值获取显示配置 */
export function getBattleTypeConfig(id: BattleType): BattleTypeConfig | undefined {
  return BATTLE_TYPE_CONFIGS.find(c => c.id === id)
}

// ==================== 战斗模式/关卡配置 ====================

export type BattleModeType = 'main' | 'arena' | 'team_pve' | 'team_pvp'

export interface BattleLevel {
  id: number
  label: string
  desc?: string
}

export interface BattleModeConfig {
  id: BattleModeType
  /** 对应 BattleType 枚举值 */
  battle_type: BattleType
  label: string
  icon: string
  levels: BattleLevel[]
}

// ==================== 战斗结果类型 ====================

/** 战斗结果类型 (与服务端 replay.lua 保持一致) */
export enum BattleResult {
  UNKNOWN = 0,
  VICTORY = 1,
  DEFEAT = 2,
  TIMEOUT = 3,
  DRAW = 4,
}

/** 战斗动画播放间隔(毫秒) */
export const ANIMATION_SPEED = 800

/** 战斗结果显示标签 */
export const RESULT_LABELS: Record<BattleResult, string> = {
  [BattleResult.UNKNOWN]: '未知',
  [BattleResult.VICTORY]: '胜利 🎉',
  [BattleResult.DEFEAT]: '失败 💀',
  [BattleResult.TIMEOUT]: '超时 ⏰',
  [BattleResult.DRAW]: '平局 🤝',
}

/** 战斗模式基础模板(不携带关卡数据,由buildBattleModes动态填充) */
const BATTLE_MODE_TEMPLATES: BattleModeConfig[] = [
  {
    id: 'main',
    battle_type: BattleType.MAIN_BATTLE,
    label: '主线',
    icon: '📖',
    levels: [],
  },
  {
    id: 'arena',
    battle_type: BattleType.ARENA,
    label: '竞技场',
    icon: '⚔️',
    levels: [],
  },
]

/** 当前战斗模式列表(运行时动态构建) */
export let BATTLE_MODES: BattleModeConfig[] = [...BATTLE_MODE_TEMPLATES]

/** 获取关卡配置(同步,需已缓存) */
export function getBattlestageConfig(): BattlestageConfig[] | undefined {
  return getCachedConfig<BattlestageConfig[]>('battlestageconfig')
}

/** 获取怪物组配置(同步) */
export function getBattlemonstergroupConfig(): BattlemonstergroupConfig[] | undefined {
  return getCachedConfig<BattlemonstergroupConfig[]>('battlemonstergroupconfig')
}

/** 从配置构建战斗模式关卡列表 */
export async function buildBattleModes(): Promise<BattleModeConfig[]> {
  try {
    const stages = getBattlestageConfig()

    const modes: BattleModeConfig[] = BATTLE_MODE_TEMPLATES.map(t => ({ ...t, levels: [] }))

    if (stages && stages.length > 0) {
      const mainMode = modes.find(m => m.id === 'main')
      if (mainMode) {
        mainMode.levels = stages.map(s => ({
          id: s.id,
          label: s.name,
          desc: s.desc,
        }))
      }
    }

    // 过滤掉没有关卡的模式
    BATTLE_MODES = modes.filter(m => m.levels.length > 0)
    return BATTLE_MODES
  } catch (err) {
    console.warn('buildBattleModes加载配置失败,使用默认模式', err)
    BATTLE_MODES = BATTLE_MODE_TEMPLATES.filter(m => m.id === 'main')
    return BATTLE_MODES
  }
}
