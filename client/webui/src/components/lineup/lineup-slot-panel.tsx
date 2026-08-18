// ====================================================================
//  阵容槽位组件
// ====================================================================

import { useCallback } from 'react'
import { getHeroConfig } from '@/types'
import { Job, JOB_ICONS, DEFAULT_HERO_ICON } from '@/types'
import { useDroppable, useDraggable } from '@/hooks/use-drag-system'

interface LineupSlotPanelProps {
  slotIndex: number
  heroId: number | null
  onSlotClick: (slotIndex: number) => void
  onDropHero: (slotIndex: number, heroId: number) => void
}

function getHeroIcon(heroId: number): string {
  const configs = getHeroConfig()
  const job = configs?.find(c => c.id === heroId)?.job
  return JOB_ICONS[(job ?? 0) as Job] ?? DEFAULT_HERO_ICON
}

function getHeroName(heroId: number): string {
  const configs = getHeroConfig()
  return configs?.find(c => c.id === heroId)?.name || `英雄#${heroId}`
}

export default function LineupSlotPanel({ slotIndex, heroId, onSlotClick, onDropHero }: LineupSlotPanelProps) {
  // drop zone: 接收拖拽上阵/交换
  const handleDropData = useCallback(
    (data: unknown) => {
      onDropHero(slotIndex, data as number)
    },
    [slotIndex, onDropHero],
  )
  const { ref: dropRef, isOver } = useDroppable(`slot-${slotIndex}`, handleDropData)

  // 槽位内容可拖拽: 已上阵英雄拖动交换
  const { ref: contentDragRef } = useDraggable(`slot-content-${slotIndex}`, heroId ?? 0)

  const slotClass = [
    'lineup-slot',
    heroId != null ? 'filled' : 'empty',
    isOver ? 'drag-over' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={dropRef}
      className={slotClass}
      onClick={() => onSlotClick(slotIndex)}
    >
      {heroId != null ? (
        <div ref={contentDragRef} className="lineup-slot-content">
          <span className="lineup-slot-icon">{getHeroIcon(heroId)}</span>
          <span className="lineup-slot-name">{getHeroName(heroId)}</span>
          <span className="lineup-slot-remove" onClick={(e) => { e.stopPropagation(); onSlotClick(slotIndex) }}>✕</span>
        </div>
      ) : (
        <div className="lineup-slot-placeholder">
          <span className="lineup-slot-number">{slotIndex + 1}</span>
        </div>
      )}
    </div>
  )
}
