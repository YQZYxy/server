// ====================================================================
//  英雄面板
// ====================================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { gameStore } from '@/store/game-store'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { getHeroConfig } from '@/types'
import { Job, JOB_ICONS, DEFAULT_HERO_ICON } from '@/types'
import PanelShell from '@/components/panel-shell'
import HeroDetailPanel from './hero-detail-panel'

// 注册协议
gameSocket.onMsg(MHT.MHT_SYNC_HERO_DATA_SC, (body) => gameStore.setState({ heroData: body }))
gameSocket.onMsg(MHT.MHT_SYNC_LINEUP_DATA_SC, (body) => gameStore.setState({ lineupData: body }))

/** 从配置获取英雄名 (同步) */
function getHeroName(heroId: number): string {
  const configs = getHeroConfig()
  return configs?.find(c => c.id === heroId)?.name || `英雄#${heroId}`
}

/** 从配置获取英雄图标 (角色职业映射) */
function getHeroIcon(heroId: number): string {
  const configs = getHeroConfig()
  const job = configs?.find(c => c.id === heroId)?.job
  return JOB_ICONS[(job ?? 0) as Job] ?? DEFAULT_HERO_ICON
}

export default function HeroPanel() {
  const heroData = gameStore(s => s.heroData)
  const heroes = useMemo(() => heroData?.hero_data?.heroes ?? [], [heroData])

  // 当前选中英雄索引
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDetail, setShowDetail] = useState(false)

  // 当英雄列表变化时,确保currentIndex有效
  useEffect(() => {
    if (heroes.length > 0 && currentIndex >= heroes.length) {
      setCurrentIndex(0)
    }
  }, [heroes.length, currentIndex])

  const currentHero = heroes[currentIndex] ?? null

  // 触摸滑动
  const touchStartX = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff < 0 && currentIndex < heroes.length - 1) {
        setCurrentIndex(i => i + 1)
      } else if (diff > 0 && currentIndex > 0) {
        setCurrentIndex(i => i - 1)
      }
    }
  }, [currentIndex, heroes.length])

  // 切换英雄
  const switchHero = useCallback((idx: number) => {
    if (idx >= 0 && idx < heroes.length) setCurrentIndex(idx)
  }, [heroes.length])

  // 经验进度百分比
  const expPercent = useMemo(() => {
    if (!currentHero?.exp) return 0
    const level = currentHero.level ?? 1
    const expForNext = Math.floor(100 * Math.pow(1.5, level - 1))
    if (expForNext <= 0) return 0
    return Math.min(100, ((currentHero.exp ?? 0) / expForNext) * 100)
  }, [currentHero])

  // 战斗力(以服务端下发的为准)
  const combatPower = useMemo(() => currentHero?.combat_power ?? 0, [currentHero])

  if (!currentHero) {
    return (
      <PanelShell title="英雄" className="hero-panel">
        <div className="empty-hint">暂无英雄</div>
      </PanelShell>
    )
  }

  return (
    <>
      <PanelShell title="英雄" className="hero-panel">
        <div
          className="hero-panel-content"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 英雄展示区 */}
          <div className="hero-display-area">
            <div className="hero-main-avatar">
              <span className="hero-main-icon">{getHeroIcon(currentHero.hero_id ?? 0)}</span>
            </div>
            <div className="hero-main-name">{getHeroName(currentHero.hero_id ?? 0)}</div>
          </div>

          {/* 等级/经验 */}
          <div className="hero-level-area">
            <div className="hero-level-row">
              <span className="hero-level-text">Lv.{currentHero.level ?? 1}</span>
              <button className="hero-detail-btn" onClick={() => setShowDetail(true)}>
                📋 详细信息
              </button>
            </div>
            <div className="hero-exp-bar">
              <div className="exp-bar-track">
                <div className="exp-bar-fill" style={{ width: `${expPercent}%` }} />
              </div>
              <span className="hero-exp-text">{currentHero.exp ?? 0} / {Math.floor(100 * Math.pow(1.5, (currentHero.level ?? 1) - 1))}</span>
            </div>
          </div>

          {/* 战斗力 */}
          <div className="hero-power-area">
            <span className="cp-label">战斗力</span>
            <span className="cp-value">{combatPower.toLocaleString()}</span>
          </div>

          {/* 英雄列表(切换用) */}
          <div className="hero-list-bar">
            <div className="hero-list-label">英雄</div>
            <div className="hero-list-icons">
              {heroes.map((h, idx) => (
                <div
                  key={h.hero_id ?? idx}
                  className={`hero-list-icon ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => switchHero(idx)}
                >
                  <span className="hero-list-emoji">{getHeroIcon(h.hero_id ?? 0)}</span>
                  <span className="hero-list-level">Lv.{h.level ?? 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanelShell>

      {showDetail && currentHero && (
        <HeroDetailPanel hero={currentHero} onBack={() => setShowDetail(false)} />
      )}
    </>
  )
}
