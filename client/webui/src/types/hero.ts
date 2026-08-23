// ============================================================
//  英雄/阵容类型
// ============================================================

//  职业
export enum Job {
  NONE = 0,
  WARRIOR = 1,
  MAGE = 2,
  ROGUE = 3,
  PRIEST = 4,
}

/** 职业图标映射 */
export const JOB_ICONS: Partial<Record<Job, string>> = {
  [Job.NONE]: '🧙',
  [Job.WARRIOR]: '🗡️',
  [Job.MAGE]: '🔮',
  [Job.ROGUE]: '🔪',
  [Job.PRIEST]: '✨',
}

/** 默认英雄图标 */
export const DEFAULT_HERO_ICON = '🧙'

/** 阵容最大槽位数(单个阵容英雄数上限) */
export const MAX_LINEUP_SLOTS = 5

/** 每个战斗类型的最大阵容数量*/
export const MAX_LINEUP_SLOT_COUNT = 3


import { getCachedConfig } from '@/services/configmanager'
import type { HeroConfig, HeroLevelConfig } from './config'

/** 获取角色配置(同步,需已缓存) */
export function getHeroConfig(): HeroConfig[] | undefined {
  return getCachedConfig<HeroConfig[]>('heroconfig')
}

/** 获取角色等级配置(同步) */
export function getHeroLevelConfig(): HeroLevelConfig[] | undefined {
  return getCachedConfig<HeroLevelConfig[]>('herolevelconfig')
}


