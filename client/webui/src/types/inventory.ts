// ============================================================
//  背包/道具类型
//  对应 share/protobuf/data.proto, roledata.proto
// ============================================================

import { getCachedConfig } from '@/services/configmanager'
import type { ItemConfig, ItemGlobalConfig } from './config'

/** 获取道具配置(同步,需已缓存) */
export function getItemConfig(): ItemConfig[] | undefined {
  return getCachedConfig<ItemConfig[]>('itemconfig')
}

/** 获取道具全局配置(同步) */
export function getItemGlobalConfig(): ItemGlobalConfig | undefined {
  return getCachedConfig<ItemGlobalConfig>('itemglobalconfig')
}

//  物品类型枚举
export enum ItemType {
  NONE = 0,
  WEAPON = 1,
  ARMOR = 2,
  CONSUMABLE = 3,
  MATERIAL = 4,
  QUEST_ITEM = 5,
}

/** 物品类型显示配置 */
export const ITEM_TYPES: Record<ItemType, { label: string; icon: string }> = {
  [ItemType.NONE]:       { label: '全部', icon: '📦' },
  [ItemType.WEAPON]:    { label: '武器', icon: '⚔️' },
  [ItemType.ARMOR]:     { label: '盔甲', icon: '🛡️' },
  [ItemType.CONSUMABLE]: { label: '消耗品', icon: '🧪' },
  [ItemType.MATERIAL]:  { label: '材料', icon: '🔨' },
  [ItemType.QUEST_ITEM]: { label: '任务物品', icon: '📜' },
}

/** 所有物品类型标签列表 */
export const ITEM_TYPE_TABS = [
  ItemType.NONE,
  ItemType.WEAPON,
  ItemType.ARMOR,
  ItemType.CONSUMABLE,
  ItemType.MATERIAL,
  ItemType.QUEST_ITEM,
]
