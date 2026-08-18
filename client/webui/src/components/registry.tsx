// ============================================================
//  面板注册表
// ============================================================

import type { ComponentType } from 'react'
import type { PanelSlot } from '@/types'
import RolePanel from './role/role-panel'
import InventoryPanel from './inventory/inventory-panel'
import QuestPanel from './quest/quest-panel'
import GMPanel from './gm/gm-panel'
import { HeroPanel } from './hero'
import { LineupPanel } from './lineup'
import RankListPanel from './rank/rank-list-panel'
import { ModePanel } from './battle/mode-panel'
import { ResultPanel } from './battle/result-panel'
import { ReportPanel } from './battle/report-panel'

// 面板组件的基础props（可被子集扩展）
export interface PanelProps {
  onClose?: () => void
  /** 面板需要的业务数据 */
  data?: any
}

export interface PanelDef {
  id: string
  label: string
  icon: string
  /** 覆盖层面板组件(导航按钮无component) */
  component?: ComponentType<PanelProps>
  /** 按钮位置 */
  slot: PanelSlot
  /** 所属页面标识 */
  page: string
  /** 导航路径(导航按钮使用,非覆盖层) */
  navigateTo?: string
}

/** 所有面板注册表 */
export const PANEL_REGISTRY: PanelDef[] = [
  // 大厅页面
  { id: 'role', label: '角色信息', icon: '🧙', component: RolePanel, slot: 'left', page: 'hall' },
  { id: 'hero', label: '英雄', icon: '⭐', component: HeroPanel, slot: 'left', page: 'hall' },
  { id: 'lineup', label: '阵容', icon: '⚔️', component: LineupPanel, slot: 'left', page: 'hall' },
  { id: 'inventory', label: '背包', icon: '📦', component: InventoryPanel, slot: 'left', page: 'hall' },
  { id: 'quest', label: '任务', icon: '📜', component: QuestPanel, slot: 'right', page: 'hall' },
  { id: 'rank', label: '排行榜', icon: '🏆', component: RankListPanel, slot: 'right', page: 'hall' },
  { id: 'gm', label: 'GM', icon: '', component: GMPanel, slot: 'top', page: 'hall' },

  // 战斗页面
  { id: 'mode', label: '选关', icon: '📋', component: ModePanel, slot: 'top', page: 'battle' },
  { id: 'result', label: '战斗结果', icon: '⭐', component: ResultPanel, slot: 'top', page: 'battle_field' }, 
  { id: 'report', label: '战报', icon: '📋', component: ReportPanel, slot: 'top', page: 'battle_field' },
  { id: 'arena', label: '竞技场', icon: '🏆', slot: 'left', page: 'battle', navigateTo: '/arena' },
]

/** 获取指定页面的所有面板 */
export function getPagePanels(page: string): PanelDef[] {
  return PANEL_REGISTRY.filter((p) => p.page === page)
}

/** 获取指定页面指定位置的面板按钮数据 */
export function getPanelsBySlot(
  page: string,
  slot: PanelSlot,
): { panel: string; icon: string; label: string }[] {
  return getPagePanels(page)
    .filter((p) => p.slot === slot)
    .map((p) => ({ panel: p.id, icon: p.icon, label: p.label }))
}

/** 获取指定页面指定位置的组件面板(仅覆盖层,排除导航) */
export function getOverlayPanelsBySlot(
  page: string,
  slot: PanelSlot,
): { panel: string; icon: string; label: string }[] {
  return getPagePanels(page)
    .filter((p) => p.slot === slot && p.component)
    .map((p) => ({ panel: p.id, icon: p.icon, label: p.label }))
}

// 注册面板覆盖层
export function registerActivePanel(
  activePanel: string,
  setActivePanel: (id: string) => void,
  data: any,
) {
  if (activePanel === 'none') return null;
  const def = PANEL_REGISTRY.find((p) => p.id === activePanel && p.component);
  const Comp = def?.component;
  return Comp ? <Comp onClose={() => setActivePanel('none')} data={data} /> : null;
}