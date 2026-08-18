//  竞技场对手卡片组

import type { PB_ArenaOpponentInfo } from '@/types'

interface OpponentCardPanelProps {
  opponent: PB_ArenaOpponentInfo
  onClick: (opponent: PB_ArenaOpponentInfo) => void
}

export default function OpponentCardPanel({ opponent, onClick }: OpponentCardPanelProps) {
  const mainHero = opponent.heroes?.[0]
  const totalPower = opponent.heroes?.filter(h => h.hero_id).reduce((sum, h) => sum + (h.combat_power || 0), 0) || 0

  return (
    <div className="arena-opponent-card" onClick={() => onClick(opponent)}>
      <div className="arena-opponent-avatar">
        {mainHero ? (
          <span className="arena-opponent-hero-icon">⚔️</span>
        ) : (
          <span className="arena-opponent-hero-icon">🎭</span>
        )}
      </div>
      <div className="arena-opponent-info">
        <div className="arena-opponent-name">{opponent.name || '未知'}</div>
        <div className="arena-opponent-detail">
          <span>积分: {opponent.score}</span>
          <span>战力: {totalPower.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
