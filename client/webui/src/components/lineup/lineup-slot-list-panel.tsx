//  通用阵容英雄展示组件
//  纯展示用,不影响 lineup-panel 的上下阵功能

import { getHeroConfig, Job, JOB_ICONS, DEFAULT_HERO_ICON } from '@/types'
import type { PB_HeroData } from '@/types'

function getHeroIcon(heroId: number): string {
  const configs = getHeroConfig()
  const job = configs?.find(c => c.id === heroId)?.job
  return JOB_ICONS[(job ?? 0) as Job] ?? DEFAULT_HERO_ICON
}

function getHeroName(heroId: number): string {
  const configs = getHeroConfig()
  return configs?.find(c => c.id === heroId)?.name || `英雄#${heroId}`
}

interface LineupSlotListPanelProps {
  /** 英雄列表 */
  heroes?: PB_HeroData[]
  /** 点击英雄回调(可选,不传则不可点击) */
  onHeroClick?: (hero: PB_HeroData) => void
  /** 自定义空状态提示 */
  emptyText?: string
}

export function LineupSlotListPanel({ heroes, onHeroClick, emptyText }: LineupSlotListPanelProps) {
  const validHeroes = heroes?.filter(h => h.hero_id) || []

  if (validHeroes.length === 0) {
    return <div className="arena-empty-hint">{emptyText || '暂无阵容数据'}</div>
  }

  return (
    <div className="lineup-hero-grid" style={{ justifyContent: 'center' }}>
      {validHeroes.map((hero, idx) => (
        <div
          key={idx}
          className="lineup-hero-card"
          onClick={() => onHeroClick?.(hero)}
          style={onHeroClick ? { cursor: 'pointer' } : undefined}
        >
          <span className="lineup-hero-icon">{getHeroIcon(hero.hero_id!)}</span>
          <span className="lineup-hero-name">{getHeroName(hero.hero_id!)}</span>
          <span className="lineup-hero-level">Lv.{hero.level}</span>
        </div>
      ))}
    </div>
  )
}
