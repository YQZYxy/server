//  竞技场对手详情面板

import { useState } from 'react'
import { arenaStore } from '@/store/arena/arena-store'
import PanelShell from '@/components/panel-shell'
import HeroDetailPanel from '@/components/hero/hero-detail-panel'
import { LineupSlotListPanel } from '@/components/lineup/lineup-slot-list-panel'
import type { PB_HeroData } from '@/types'

interface OpponentDetailPanelProps {
  onChallenge: (uid: number) => void
}

export default function OpponentDetailPanel({ onChallenge }: OpponentDetailPanelProps) {
  const opponent = arenaStore(s => s.selectedOpponent)
  const setShowOpponentDetail = arenaStore(s => s.setShowOpponentDetail)
  const [detailHero, setDetailHero] = useState<PB_HeroData | null>(null)

  if (!opponent) return null

  const totalPower = opponent.heroes?.reduce((sum, h) => sum + (h.combat_power || 0), 0) || 0

  // 如果有选中的英雄详情,显示英雄详情面板
  if (detailHero) {
    return <HeroDetailPanel hero={detailHero} onBack={() => setDetailHero(null)} />
  }

  return (
    <PanelShell
      title={`${opponent.name} - 详细情报`}
      onClose={() => setShowOpponentDetail(null)}
    >
      <div className="arena-detail-content">
        {/* 基础信息 */}
        <div className="arena-detail-header">
          <div className="arena-detail-avatar">🎭</div>
          <div className="arena-detail-basic">
            <div className="arena-detail-name">{opponent.name}</div>
            <div className="arena-detail-score">积分: {opponent.score}</div>
            <div className="arena-detail-power">战力: {totalPower.toLocaleString()}</div>
          </div>
        </div>

        {/* 阵容英雄 */}
        <div className="arena-detail-section">
          <h4>阵容英雄 ({opponent.heroes?.length || 0})</h4>
          <LineupSlotListPanel heroes={opponent.heroes ?? undefined} onHeroClick={(h) => setDetailHero(h)} />
        </div>

        {/* 挑战按钮 */}
        <div className="arena-detail-action">
          <button
            className="arena-challenge-btn"
            onClick={() => onChallenge(opponent.uid ?? 0)}
          >
            ⚔️ 挑战
          </button>
        </div>
      </div>
    </PanelShell>
  )
}
