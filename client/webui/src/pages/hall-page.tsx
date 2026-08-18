// ====================================================================
//  大厅页面 - 角色主界面
// ====================================================================

import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import { getPagePanels, getPanelsBySlot, registerActivePanel } from '@/components/registry'

// 过滤出大厅页面的面板
const HALL_PANELS = getPagePanels('hall')

const MORE_CARDS = [
  { path: '/chat', icon: '💬', label: '聊天' },
  { path: '/agent', icon: '🐟', label: '小鱼' },
  { path: '/battle', icon: '⚔️', label: '战斗' },
  { path: '/info', icon: 'ℹ️', label: '我的' },
]

// 按 slot 分组
const TOP_BUTTONS = getPanelsBySlot('hall', 'top')
const LEFT_BUTTONS = getPanelsBySlot('hall', 'left')
const RIGHT_BUTTONS = getPanelsBySlot('hall', 'right')
const UP_BUTTONS = getPanelsBySlot('hall', 'up')
const DOWN_BUTTONS = getPanelsBySlot('hall', 'down')

export default function HallPage() {
  const navigate = useNavigate()
  const username = gameStore((s) => s.username)
  const activePanel = gameStore((s) => s.activePanel)
  const showMoreBubble = gameStore((s) => s.showMoreBubble)
  const setActivePanel = gameStore((s) => s.setActivePanel)
  const setShowMoreBubble = gameStore((s) => s.setShowMoreBubble)

  return (
    <div className="hall-page">

      {/* ---- 注册面板覆盖层 ---- */}
      {registerActivePanel(activePanel, setActivePanel, {})}  

      {/* ---- 顶部栏 ---- */}
      <div className="hall-topbar">
        <div className="hall-topbar-left">
          <h2>{username ? `${username}` : '未登录服务器!'}</h2>
        </div>
        <div className="hall-topbar-right">
          {TOP_BUTTONS.length > 0 && (
            <div className="hall-top-crosswise">
              {TOP_BUTTONS.map((btn) => (
                <button
                  key={btn.panel}
                  className={`btn-top ${activePanel === btn.panel ? 'active' : ''}`}
                  onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
                >
                  <span className="side-btn-label">{btn.label}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className="btn-more"
            onClick={() => setShowMoreBubble(!showMoreBubble)}
          >
            更多
          </button>
          {showMoreBubble && (
            <>
              <div className="bubble-backdrop" onClick={() => setShowMoreBubble(false)} />
              <div className="bubble-menu">
                {MORE_CARDS.map((card) => (
                  <div
                    key={card.path}
                    className="bubble-item"
                    onClick={() => { setShowMoreBubble(false); navigate(card.path) }}
                  >
                    <span className="bubble-icon">{card.icon}</span>
                    <span>{card.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- 主体区域 ---- */}
      <div className="hall-body">
        {UP_BUTTONS.length > 0 && (
          <div className="hall-sidebar-crosswise">
            {UP_BUTTONS.map((btn) => (
              <button
                key={btn.panel}
                className={`side-btn ${activePanel === btn.panel ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="hall-body-row">
          <div className="hall-sidebar-lengthways">
            {LEFT_BUTTONS.map((btn) => (
              <button
                key={btn.panel}
                className={`side-btn ${activePanel === btn.panel ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="hall-center">
            <div className="hall-standee">
              <div className="standee-placeholder">
                <span className="standee-icon"><img src="/vite.svg" alt="小鱼" style={{ width: 80, height: 80 }} /></span>
                <span className="standee-hint"></span>
              </div>
            </div>
          </div>

          <div className="hall-sidebar-lengthways">
            {RIGHT_BUTTONS.map((btn) => (
              <button
                key={btn.panel}
                className={`side-btn ${activePanel === btn.panel ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {DOWN_BUTTONS.length > 0 && (
          <div className="hall-sidebar-crosswise">
            {DOWN_BUTTONS.map((btn) => (
              <button
                key={btn.panel}
                className={`side-btn ${activePanel === btn.panel ? 'active' : ''}`}
                onClick={() => setActivePanel(activePanel === btn.panel ? 'none' : btn.panel as any)}
              >
                <span className="side-btn-icon">{btn.icon}</span>
                <span className="side-btn-label">{btn.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
