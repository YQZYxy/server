// ====================================================================
//  阵容面板
// ====================================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT, BattleType, BATTLE_TYPE_CONFIGS, getHeroConfig, Job, JOB_ICONS, DEFAULT_HERO_ICON, MAX_LINEUP_SLOTS } from '@/types'
import PanelShell from '@/components/panel-shell'
import { useDraggable } from '@/hooks/use-drag-system'
import LineupSlotPanel from './lineup-slot-panel'

// 阵容类型选择列表
const BATTLE_TYPES = BATTLE_TYPE_CONFIGS

// 获取英雄图标(从配置的角色职业映射)
function getHeroIcon(heroId: number): string {
  const configs = getHeroConfig()
  const job = configs?.find(c => c.id === heroId)?.job
  return JOB_ICONS[(job ?? 0) as Job] ?? DEFAULT_HERO_ICON
}

function getHeroName(heroId: number): string {
  const configs = getHeroConfig()
  return configs?.find(c => c.id === heroId)?.name || `英雄#${heroId}`
}

// ---- 可拖拽英雄卡片子组件 ----
function HeroCard({
  heroId,
  level,
  linedUpIds,
  selectedSlot,
  onClick,
}: {
  heroId: number
  level: number
  linedUpIds: Set<number>
  selectedSlot: number
  onClick: (heroId: number) => void
}) {
  const inLineup = linedUpIds.has(heroId)
  const { ref } = useDraggable(`hero-${heroId}`, heroId)

  return (
    <div
      ref={ref}
      className={`lineup-hero-card ${inLineup ? 'in-lineup' : ''} ${selectedSlot >= 0 && !inLineup ? 'selectable' : ''}`}
      onClick={() => onClick(heroId)}
    >
      <span className="lineup-hero-icon">{getHeroIcon(heroId)}</span>
      <span className="lineup-hero-name">{getHeroName(heroId)}</span>
      <span className="lineup-hero-level">Lv.{level}</span>
      {inLineup && <span className="lineup-hero-badge">已上阵</span>}
    </div>
  )
}

export default function LineupPanel() {
  const heroData = gameStore(s => s.heroData)
  const lineupData = gameStore(s => s.lineupData)

  const heroes = useMemo(() => heroData?.hero_data?.heroes ?? [], [heroData])
  const lineups = useMemo(() => lineupData?.lineup_data?.lineups ?? [], [lineupData])

  // 当前选中的战斗类型
  const [selectedBattleType, setSelectedBattleType] = useState<BattleType>(BattleType.MAIN_BATTLE)
  const [activeTab, setActiveTab] = useState<BattleType>(BattleType.MAIN_BATTLE)
  const battleTypeRef = useRef(selectedBattleType)
  battleTypeRef.current = selectedBattleType

  // 将hero_id数组转为固定5格数组(0=空位)
  const toFixedSlots = (ids: number[]): number[] => {
    const slots: number[] = []
    for (let i = 0; i < MAX_LINEUP_SLOTS; i++) slots.push(ids[i] || 0)
    return slots
  }

  const [localSlots, setLocalSlots] = useState<number[]>(() => {
    const lineup = lineups.find(l => l.battle_type === selectedBattleType)
    return toFixedSlots(lineup?.hero_ids ?? [])
  })

  const [isDirty, setIsDirty] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(-1)

  // 已上阵英雄ID集合
  const linedUpIds = useMemo(() => new Set(localSlots.filter(id => id > 0)), [localSlots])

  // 切换到指定阵容
  const switchBattleType = useCallback((bt: BattleType) => {
    const lineup = lineups.find(l => l.battle_type === bt)
    setLocalSlots(toFixedSlots(lineup?.hero_ids ?? []))
    setSelectedSlot(-1)
    setIsDirty(false)
  }, [lineups])

  // 点击槽位
  const handleSlotClick = useCallback((slotIndex: number) => {
    if (localSlots[slotIndex] > 0) {
      // 有英雄 -> 下阵
      setLocalSlots(prev => {
        const next = [...prev]
        next[slotIndex] = 0
        return next
      })
      setIsDirty(true)
      setSelectedSlot(-1)
    } else {
      setSelectedSlot(prev => prev === slotIndex ? -1 : slotIndex)
    }
  }, [localSlots])

  // 拖拽英雄到槽位
  const handleDropHero = useCallback((slotIndex: number, heroId: number) => {
    setLocalSlots(prev => {
      const next = [...prev]
      const fromIdx = next.indexOf(heroId)
      if (fromIdx >= 0 && fromIdx !== slotIndex) {
        const targetHero = next[slotIndex]
        if (targetHero > 0 && targetHero !== heroId) {
          next[fromIdx] = targetHero
          next[slotIndex] = heroId
        } else {
          next[fromIdx] = 0
          next[slotIndex] = heroId
        }
      } else if (fromIdx < 0) {
        next[slotIndex] = heroId
      }
      return next
    })
    setIsDirty(true)
    setSelectedSlot(-1)
  }, [])

  // 点击英雄列表中的英雄
  const handleHeroClick = useCallback((heroId: number) => {
    if (linedUpIds.has(heroId)) {
      // 已上阵 -> 下阵
      setLocalSlots(prev => {
        const next = [...prev]
        const idx = next.indexOf(heroId)
        if (idx >= 0) next[idx] = 0
        return next
      })
      setIsDirty(true)
      return
    }

    if (selectedSlot >= 0) {
      // 上阵到指定槽位
      setLocalSlots(prev => {
        const next = [...prev]
        const existingIdx = next.indexOf(heroId)
        if (existingIdx >= 0) next[existingIdx] = 0
        next[selectedSlot] = heroId
        return next
      })
      setIsDirty(true)
      setSelectedSlot(-1)
    } else {
      // 添加到第一个空位
      const emptyIdx = localSlots.indexOf(0)
      if (emptyIdx < 0) {
        gameStore.getState().showToast('阵容已满', 'error')
        return
      }
      setLocalSlots(prev => {
        const next = [...prev]
        next[emptyIdx] = heroId
        return next
      })
      setIsDirty(true)
    }
  }, [linedUpIds, selectedSlot, localSlots])

  // 保存
  const handleSave = useCallback(() => {
    gameSocket.sendMsg(MHT.MHT_SYNC_LINEUP_UPDATE_CS, {
      battle_type: selectedBattleType,
      hero_ids: localSlots,
    })
    setIsDirty(false)
    gameStore.getState().showToast('阵容已保存', 'success')
  }, [selectedBattleType, localSlots])

  // 还原
  const handleReset = useCallback(() => {
    setLocalSlots(toFixedSlots([]))
    setIsDirty(true)
  }, [])

  // 监听阵容变更响应
  useEffect(() => {
    const handler = (body: any) => {
      if (body?.lineup_data?.lineups) {
        gameStore.setState({ lineupData: body })
        const bt = battleTypeRef.current
        const lineup = body.lineup_data.lineups.find((l: any) => l.battle_type === bt)
        if (lineup) {
          setSelectedBattleType(bt)
          setLocalSlots(toFixedSlots(lineup.hero_ids ?? []))
          setIsDirty(false)
        }
      }
    }
    gameSocket.onMsg(MHT.MHT_SYNC_LINEUP_DATA_SC, handler)
    return () => { gameSocket.offMsg(MHT.MHT_SYNC_LINEUP_DATA_SC, handler) }
  }, [])

  return (
    <PanelShell title="阵容" className="lineup-panel">
      {/* 顶部战斗类型选择 */}
      <div className="lineup-type-bar">
        {BATTLE_TYPES.map((bt) => (
          <div
            key={bt.id}
            className={`lineup-type-tab ${bt.id === activeTab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(bt.id)
              battleTypeRef.current = bt.id
              setSelectedBattleType(bt.id)
              switchBattleType(bt.id)
            }}
          >
            <span className="lineup-type-icon">{bt.icon}</span>
            <span className="lineup-type-label">{bt.label}</span>
          </div>
        ))}
      </div>

      {/* 站位格子 */}
      <div className="lineup-slots-area">
        <div className="lineup-slots-grid">
          {localSlots.map((heroId, idx) => (
            <LineupSlotPanel
              key={idx}
              slotIndex={idx}
              heroId={heroId > 0 ? heroId : null}
              onSlotClick={handleSlotClick}
              onDropHero={handleDropHero}
            />
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="lineup-actions">
        <button className="lineup-action-btn primary" onClick={handleSave} disabled={!isDirty}>
          💾 保存
        </button>
        <button className="lineup-action-btn" onClick={handleReset}>
          🔄 清空
        </button>
      </div>

      {/* 英雄选择列表 */}
      <div className="lineup-hero-list">
        <div className="lineup-hero-list-title">可选英雄</div>
        {heroes.length === 0 ? (
          <div className="empty-hint">暂无英雄</div>
        ) : (
          <div className="lineup-hero-grid">
            {heroes.map((h) => {
              const heroId = h.hero_id ?? 0
              return (
                <HeroCard
                  key={heroId}
                  heroId={heroId}
                  level={h.level ?? 1}
                  linedUpIds={linedUpIds}
                  selectedSlot={selectedSlot}
                  onClick={handleHeroClick}
                />
              )
            })}
          </div>
        )}
      </div>

    </PanelShell>
  )
}
