// ============================================================
//  任务类型
//  对应 share/protobuf/roledata.proto
// ============================================================

import { getCachedConfig } from '@/services/configmanager'
import type { QuestConfig, QuestGlobalConfig, QuestObjConfig } from './config'

/** 获取任务配置(同步,需已缓存) */
export function getQuestConfig(): QuestConfig[] | undefined {
  return getCachedConfig<QuestConfig[]>('questconfig')
}

/** 获取任务全局配置(同步) */
export function getQuestGlobalConfig(): QuestGlobalConfig | undefined {
  return getCachedConfig<QuestGlobalConfig>('questglobalconfig')
}

/** 获取任务目标配置(同步) */
export function getQuestObjConfig(): QuestObjConfig[] | undefined {
  return getCachedConfig<QuestObjConfig[]>('questobjconfig')
}

//  任务状态枚举
export enum QuestStatus {
  NONE = 0,
  /** 进行中 */
  IN_PROGRESS = 1,
  /** 已完成(待提交) */
  COMPLETED = 2,
  /** 失败 */
  FAILED = 3,
  /** 已提交 */
  SUBMITTED = 4,
}

/** 任务状态显示配置 */
export const QUEST_STATUS: Record<QuestStatus, { label: string; color: string }> = {
  [QuestStatus.NONE]:       { label: '未开始', color: '#9090A8' },
  [QuestStatus.IN_PROGRESS]: { label: '进行中', color: '#4F6EF7' },
  [QuestStatus.COMPLETED]:   { label: '已完成', color: '#4CAF50' },
  [QuestStatus.FAILED]:      { label: '失败', color: '#F44336' },
  [QuestStatus.SUBMITTED]:   { label: '已提交', color: '#9090A8' },
}
