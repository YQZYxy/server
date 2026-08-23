// ====================================================================
//  阵容面板
// ====================================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT, BattleType, BATTLE_TYPE_CONFIGS, getHeroConfig, Job, JOB_ICONS, DEFAULT_HERO_ICON, MAX_LINEUP_SLOTS, MAX_LINEUP_SLOT_COUNT } from '@/types'
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
  inOtherLineup,
  selectedSlot,
  onClick,
}: {
  heroId: number
  level: number
  linedUpIds: Set<number>
  inOtherLineup: boolean
  selectedSlot: number
  onClick: (heroId: number) => void
}) {
  const inLineup = linedUpIds.has(heroId)
  const { ref } = useDraggable(`hero-${heroId}`, heroId)

  return (
    <div
      ref={ref}
      className={`lineup-hero-card ${inLineup ? 'in-lineup' : ''} ${inOtherLineup ? 'in-other-lineup' : ''} ${selectedSlot >= 0 && !inLineup ? 'selectable' : ''}`}
      onClick={() => onClick(heroId)}
    >
      <span className="lineup-hero-icon">{getHeroIcon(heroId)}</span>
      <span className="lineup-hero-name">{getHeroName(heroId)}</span>
      <span className="lineup-hero-level">Lv.{level}</span>
      {inLineup && <span className="lineup-hero-badge">已上阵</span>}
      {inOtherLineup && <span className="lineup-hero-badge other">他队</span>}
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

  // 当前选中的阵容槽位(第几队, 0-based)
  const [selectedLineupSlot, setSelectedLineupSlot] = useState(0)
  const lineupSlotRef = useRef(selectedLineupSlot)
  lineupSlotRef.current = selectedLineupSlot

  // 将hero_id数组转为固定5格数组(0=空位)
  const toFixedSlots = (ids: number[]): number[] => {
    const slots: number[] = []
    for (let i = 0; i < MAX_LINEUP_SLOTS; i++) slots.push(ids[i] || 0)
    return slots
  }

  const [localSlots, setLocalSlots] = useState<number[]>(() => {
    const lineup = lineups.find(l => l.battle_type === selectedBattleType && (l.slot ?? 0) === 0)
    return toFixedSlots(lineup?.hero_ids ?? [])
  })

  const [isDirty, setIsDirty] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(-1)

  // 当前阵容已上阵英雄ID集合
  const linedUpIds = useMemo(() => new Set(localSlots.filter(id => id > 0)), [localSlots])

  // 其它阵容槽位已上阵英雄ID集合
  const otherLineupIds = useMemo(() => {
    const s = new Set<number>()
    for (const l of lineups) {
      if (l.battle_type === selectedBattleType && (l.slot ?? 0) !== selectedLineupSlot) {
        for (const id of l.hero_ids ?? []) if (id > 0) s.add(id)
      }
    }
    return s
  }, [lineups, selectedBattleType, selectedLineupSlot])

  // 加载指定 (battle_type, slot) 阵容到本地编辑
  const loadLineup = useCallback((bt: BattleType, slotIdx: number) => {
    const lineup = lineups.find(l => l.battle_type === bt && (l.slot ?? 0) === slotIdx)
    setLocalSlots(toFixedSlots(lineup?.hero_ids ?? []))
    setSelectedSlot(-1)
    setIsDirty(false)
  }, [lineups])

  // 切换到指定战斗类型(重置为第1队)
  const switchBattleType = useCallback((bt: BattleType) => {
    setSelectedBattleType(bt)
    setActiveTab(bt)
    battleTypeRef.current = bt
    setSelectedLineupSlot(0)
    loadLineup(bt, 0)
  }, [loadLineup])

  // 切换阵容槽位(第几队)
  const switchLineupSlot = useCallback((slotIdx: number) => {
    setSelectedLineupSlot(slotIdx)
    loadLineup(selectedBattleType, slotIdx)
  }, [selectedBattleType, loadLineup])

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
    // 该英雄已在其它阵容上阵, 拒绝
    if (otherLineupIds.has(heroId)) {
      gameStore.getState().showToast('该英雄已在其它阵容上阵', 'error')
      return
    }
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
  }, [otherLineupIds])

  // 点击英雄列表中的英雄
  const handleHeroClick = useCallback((heroId: number) => {
    // 该英雄已在其它阵容上阵
    if (otherLineupIds.has(heroId)) {
      gameStore.getState().showToast('该英雄已在其它阵容上阵', 'error')
      return
    }

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
  }, [linedUpIds, otherLineupIds, selectedSlot, localSlots])

  // 保存
  const handleSave = useCallback(() => {
    gameSocket.sendMsg(MHT.MHT_SYNC_LINEUP_UPDATE_CS, {
      battle_type: selectedBattleType,
      slot: selectedLineupSlot,
      hero_ids: localSlots,
    })
    setIsDirty(false)
    gameStore.getState().showToast(`阵容已保存(第${selectedLineupSlot + 1}队)`, 'success')
  }, [selectedBattleType, selectedLineupSlot, localSlots])

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
        const slotIdx = lineupSlotRef.current
        const lineup = body.lineup_data.lineups.find(
          (l: any) => l.battle_type === bt && (l.slot ?? 0) === slotIdx,
        )
        if (lineup) {
          setSelectedBattleType(bt)
          setSelectedLineupSlot(slotIdx)
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
            onClick={() => switchBattleType(bt.id)}
          >
            <span className="lineup-type-icon">{bt.icon}</span>
            <span className="lineup-type-label">{bt.label}</span>
          </div>
        ))}
      </div>

      {/* 阵容槽位切换 */}
      <div className="lineup-slot-bar">
        {Array.from({ length: MAX_LINEUP_SLOT_COUNT }, (_, i) => (
          <button
            key={i}
            className={`lineup-slot-tab ${i === selectedLineupSlot ? 'active' : ''}`}
            onClick={() => switchLineupSlot(i)}
          >
            第{i + 1}队
          </button>
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
                  inOtherLineup={otherLineupIds.has(heroId)}
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
