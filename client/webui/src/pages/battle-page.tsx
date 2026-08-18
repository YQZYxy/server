// ====================================================================
//  通用选战斗关卡页面
// ====================================================================

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import { BattleType, BATTLE_MODES, buildBattleModes } from '@/types'
import { getPagePanels, getPanelsBySlot, registerActivePanel } from '@/components/registry'
import { sendBattle } from '@/services/battle'

// 各位置按钮
const BATTLE_PANELS = getPagePanels('battle')
const BATTLE_TOP_BTNS = getPanelsBySlot('battle', 'top')
const BATTLE_LEFT_BTNS = getPanelsBySlot('battle', 'left')
const BATTLE_RIGHT_BTNS = getPanelsBySlot('battle', 'right')

export default function BattlePage() {
  const navigate = useNavigate()
  const modeIdx = gameStore(s => s.battleModeIndex)
  const levelIdx = gameStore(s => s.battleLevelIndex)
  const username = gameStore(s => s.username)

  const setBattleModeIndex = gameStore(s => s.setBattleModeIndex)
  const setBattleLevelIndex = gameStore(s => s.setBattleLevelIndex)
  const activePanel = gameStore((s) => s.activePanel)
  const setActivePanel = gameStore(s => s.setActivePanel)
  const setLoading = gameStore(s => s.setLoading)

  const [modesReady, setModesReady] = useState(false)

  // 构建战斗模式
  useEffect(() => {
    buildBattleModes().then(() => setModesReady(true))
  }, [])

  const mode = modesReady ? BATTLE_MODES[modeIdx] : undefined
  const level = mode?.levels[levelIdx]

  // ---- 触摸滑动 ----
  const modeTouchY = useRef(0)
  const levelTouchX = useRef(0)

  const onModeTouchStart = useCallback((e: React.TouchEvent) => {
    modeTouchY.current = e.touches[0].clientY
  }, [])
  const onModeTouchEnd = useCallback((e: React.TouchEvent) => {
    const len = BATTLE_MODES.length
    if (len === 0) return
    const diff = modeTouchY.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 50) {
      setBattleModeIndex(diff > 0
        ? (modeIdx + 1) % len    // 上滑 → 下一个
        : (modeIdx - 1 + len) % len)  // 下滑 → 上一个
    }
  }, [modeIdx, setBattleModeIndex])

  const onLevelTouchStart = useCallback((e: React.TouchEvent) => {
    levelTouchX.current = e.touches[0].clientX
  }, [])
  const onLevelTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!mode) return
    const diff = e.changedTouches[0].clientX - levelTouchX.current
    if (Math.abs(diff) > 50) {
      setBattleLevelIndex(diff < 0
        ? (levelIdx + 1) % mode.levels.length
        : (levelIdx - 1 + mode.levels.length) % mode.levels.length)
    }
  }, [mode, levelIdx, setBattleLevelIndex])

  const reqBattle = useCallback(() => {
    if (!level) return
    sendBattle(mode?.battle_type ?? BattleType.MAIN_BATTLE, level.id)
    setLoading(true)
  }, [level, mode, setLoading])

  // 配置未加载完成时显示加载状态
  if (!modesReady || BATTLE_MODES.length === 0) {
    return (
      <div className="battle-select-page">
        <div className="battle-topbar">
          <div className="battle-topbar-left"><h2>{username ? `${username} 的战斗` : '战斗'}</h2></div>
        </div>
        <div className="battle-body" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <span>加载关卡配置中...</span>
        </div>
      </div>
    )
  }

  const modeLen = BATTLE_MODES.length

  return (
    <div className="battle-select-page">

      {/* ---- 注册面板覆盖层 ---- */}
      {registerActivePanel(activePanel, setActivePanel, {})}

      {/* ---- 顶部栏 ---- */}
      <div className="battle-topbar">
        <div className="battle-topbar-left"><h2>{username ? `${username}` : '战斗'}</h2></div>
        <div className="battle-topbar-right">
          {BATTLE_TOP_BTNS
            .filter((btn) => btn.panel === 'mode')
            .map((btn) => (
            <button
              key={btn.panel}
              className="btn-more"
              onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- 主体区域 ---- */}
      <div className="battle-body">
        {/* 左侧功能按钮位 */}
        <div className="battle-side left">
          {BATTLE_LEFT_BTNS.map((btn) => {
            const def = BATTLE_PANELS.find((p) => p.id === btn.panel)
            return (
              <button
                key={btn.panel}
                className="side-btn"
                onClick={() => {
                  if (def?.navigateTo) {
                    navigate(def.navigateTo)
                  }
                }}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            )
          })}
        </div>

        {/* 中间主选区 */}
        <div className="battle-center-area">
          {/* 模式切换：上下滑动 */}
          <div
            className="battle-mode-switcher"
            onTouchStart={onModeTouchStart}
            onTouchEnd={onModeTouchEnd}
          >
            {/* 上箭头 */}
            <button className="battle-arrow battle-arrow-up" onClick={() =>
              modeLen > 0 && setBattleModeIndex((modeIdx - 1 + modeLen) % modeLen)
            }>▲</button>

            {/* 当前模式大图标 */}
            <div className="battle-mode-icon-wrap">
              <span className="battle-mode-icon">{mode?.icon || '⚔️'}</span>
              <span className="battle-mode-label">{mode?.label || '未知'}</span>
            </div>

            {/* 下箭头 */}
            <button className="battle-arrow battle-arrow-down" onClick={() =>
              modeLen > 0 && setBattleModeIndex((modeIdx + 1) % modeLen)
            }>▼</button>

            {/* 模式指示点 */}
            {modeLen > 1 && (
              <div className="battle-dots">
                {BATTLE_MODES.map((_, i) => (
                  <div key={i} className={`battle-dot ${i === modeIdx ? 'active' : ''}`} />
                ))}
              </div>
            )}
          </div>

          {/* 关卡切换：中间大两边小 */}
          {mode && (
            <div
              className="battle-level-switcher"
              onTouchStart={onLevelTouchStart}
              onTouchEnd={onLevelTouchEnd}
            >
              <button className="battle-arrow battle-arrow-left" onClick={() =>
                mode.levels.length > 0 && setBattleLevelIndex((levelIdx - 1 + mode.levels.length) % mode.levels.length)
              }>◀</button>

              <div className="battle-level-strip">
                {mode.levels.map((l, i) => {
                  const offset = i - levelIdx
                  const isCenter = offset === 0
                  const isVisible = Math.abs(offset) <= 1
                  return (
                    <div
                      key={l.id}
                      className={`battle-level-card ${isCenter ? 'active' : ''} ${isVisible ? '' : 'hidden'}`}
                      onClick={() => setBattleLevelIndex(i)}
                      style={{
                        transform: `scale(${isCenter ? 1 : 0.85})`,
                        opacity: isCenter ? 1 : 0.5,
                        order: offset + 1,
                      }}
                    >
                      <span className="blc-name">{l.label}</span>
                      <span className="blc-monsters">{l.id > 0 ? `关卡${l.id}` : ''}</span>
                    </div>
                  )
                })}
              </div>

              <button className="battle-arrow battle-arrow-right" onClick={() =>
                mode.levels.length > 0 && setBattleLevelIndex((levelIdx + 1) % mode.levels.length)
              }>▶</button>
            </div>
          )}

          {/* 关卡指示点 */}
          {mode && mode.levels.length > 1 && (
            <div className="battle-dots">
              {mode.levels.map((_, i) => (
                <div key={i} className={`battle-dot ${i === levelIdx ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        {/* 右侧功能按钮位 */}
        <div className="battle-side right">
          {BATTLE_RIGHT_BTNS.map((btn) => {
            const def = BATTLE_PANELS.find((p) => p.id === btn.panel)
            return (
              <button
                key={btn.panel}
                className="side-btn"
                onClick={() => {
                  if (def?.navigateTo) {
                    navigate(def.navigateTo)
                  }
                }}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ---- 开始战斗 ---- */}
      <div className="battle-start-area">
          <button className="battle-start-btn" onClick={reqBattle}>
          ⚔️ 开始战斗
        </button>
      </div>
    </div>
  )
}
