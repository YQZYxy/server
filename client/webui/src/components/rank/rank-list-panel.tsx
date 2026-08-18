// ====================================================================
//  通用排行榜列表面板
// ====================================================================

import { useState } from 'react'
import { MHT, RankType } from '@/types'
import type { PB_RankNode, P_Rank_SC } from '@/types'
import type { PB_ArenaRankNode, P_ArenaRank_SC } from '@/types'
import PanelShell from '@/components/panel-shell'
import RankPanel from '@/components/rank/rank-panel'
import type { PB_HeroData } from '@/types'

// ==================== 排行榜选项卡定义 ====================

interface RankTabDef {
  type: RankType
  label: string
  responseMsgId: number
  transformResponse: (data: any) => { list: any[]; hasMore: boolean; total: number }
  getHeroes?: (item: any) => PB_HeroData[] | undefined
}

const RANK_TABS: RankTabDef[] = [
  {
    type: RankType.MAIN_BATTLE,
    label: '主线战力',
    responseMsgId: MHT.MHT_RANK_SC,
    transformResponse: (data: P_Rank_SC) => ({
      list: data.rank_list ?? [],
      hasMore: data.has_more ?? false,
      total: data.total ?? 0,
    }),
    getHeroes: (item: PB_RankNode) => item.heroes?.filter(h => h.hero_id),
  },
  {
    type: RankType.ARENA,
    label: '竞技场',
    responseMsgId: MHT.MHT_ARENA_RANK_SC,
    transformResponse: (data: P_ArenaRank_SC) => ({
      list: data.rank_list ?? [],
      hasMore: data.has_more ?? false,
      total: data.total ?? 0,
    }),
    getHeroes: (item: PB_ArenaRankNode) => item.base?.heroes?.filter(h => h.hero_id),
  },
]


function getItemName(item: any): string {
  return item.name || item.base?.name || ''
}

function getItemValue(item: any): number {
  return item.value ?? item.base?.value ?? 0
}

function getItemPower(item: any): number {
  return item.power ?? item.base?.power ?? 0
}

interface RankListPanelProps {
  onClose?: () => void
}

export default function RankListPanel({ onClose }: RankListPanelProps) {
  const [activeTab, setActiveTab] = useState<RankType>(RankType.MAIN_BATTLE)
  const currentTab = RANK_TABS.find(t => t.type === activeTab) ?? RANK_TABS[0]

  return (
    <PanelShell title="排行榜" onClose={onClose}>
      <RankPanel
        key={activeTab}
        title={currentTab.label}
        rankType={activeTab}
        responseMsgId={currentTab.responseMsgId}
        transformResponse={currentTab.transformResponse}
        getHeroes={currentTab.getHeroes}
        noShell
        onClose={onClose}
        renderItem={({ item }) => (
          <>
            <div className="rank-avatar">🎭</div>
            <div className="rank-info">
              <div className="rank-name">{getItemName(item) || '未知'}</div>
              <div className="rank-uid">UID: {item.uid ?? item.base?.uid}</div>
            </div>
            <div className="rank-value">
              <span className="rank-value-num">{getItemValue(item)}</span>
              <span className="rank-value-label"></span>
            </div>
            <div className="arena-rank-power">
              战力: {getItemPower(item)?.toLocaleString() || 0}
            </div>
          </>
        )}
      />

      {/* ---- 底部标签栏 ---- */}
      <div className="rank-tab-bar-wrapper">
        <div className="rank-tab-bar">
          {RANK_TABS.map((tab) => (
            <button
              key={tab.type}
              className={`rank-tab-btn ${activeTab === tab.type ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.type)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </PanelShell>
  )
}
