// ============================================================
//  任务类型
//  对应 share/protobuf/roledata.proto
// ============================================================

import { getCachedConfig } from '@/services/configmanager'
import type { TaskConfig, TaskGlobalConfig, TaskObjConfig } from './config'

/** 获取任务配置(同步,需已缓存) */
export function getTaskConfig(): TaskConfig[] | undefined {
  return getCachedConfig<TaskConfig[]>('taskconfig')
}

/** 获取任务全局配置(同步) */
export function getTaskGlobalConfig(): TaskGlobalConfig | undefined {
  return getCachedConfig<TaskGlobalConfig>('taskglobalconfig')
}

/** 获取任务目标配置(同步) */
export function getTaskObjConfig(): TaskObjConfig[] | undefined {
  return getCachedConfig<TaskObjConfig[]>('taskobjconfig')
}

//  任务状态枚举
export enum TaskStatus {
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
export const TASK_STATUS: Record<TaskStatus, { label: string; color: string }> = {
  [TaskStatus.NONE]:       { label: '未开始', color: '#9090A8' },
  [TaskStatus.IN_PROGRESS]: { label: '进行中', color: '#4F6EF7' },
  [TaskStatus.COMPLETED]:   { label: '已完成', color: '#4CAF50' },
  [TaskStatus.FAILED]:      { label: '失败', color: '#F44336' },
  [TaskStatus.SUBMITTED]:   { label: '已提交', color: '#9090A8' },
}
