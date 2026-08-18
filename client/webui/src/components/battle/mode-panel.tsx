// ====================================================================
//  战斗选关面板 (嵌入战斗页面)
// ====================================================================

import { gameStore } from '@/store/game-store'
import { BATTLE_MODES } from '@/types'
import PanelShell from '@/components/panel-shell'

export function ModePanel() {
  const modeIdx = gameStore(s => s.battleModeIndex)
  const levelIdx = gameStore(s => s.battleLevelIndex)
  const setBattleModeIndex = gameStore(s => s.setBattleModeIndex)
  const setBattleLevelIndex = gameStore(s => s.setBattleLevelIndex)

  const mode = BATTLE_MODES[modeIdx]
  const level = mode?.levels[levelIdx]

  return (
    <PanelShell title="选择关卡">
      <div className="battle-mode-panel">
        {/* 模式列表 */}
        <div className="panel-section">
          <h3>战斗模式</h3>
          <div className="battle-mode-list">
            {BATTLE_MODES.map((m, i) => (
              <button
                key={m.id}
                className={`battle-mode-btn ${i === modeIdx ? 'active' : ''}`}
                onClick={() => setBattleModeIndex(i)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 关卡列表 */}
                  <div className="panel-section">
          <h3>{mode?.label} - 关卡</h3>
            <div className="battle-level-grid">
            {mode?.levels.map((l, i) => (
                <button
                  key={l.id}
                  className={`battle-level-btn ${i === levelIdx ? 'active' : ''}`}
                  onClick={() => setBattleLevelIndex(i)}
                >
                <span className="level-label">{l.label}</span>
                </button>
              ))}
            </div>
          </div>

        {/* 当前选择 */}
        {level && (
          <div className="panel-section battle-selection-info">
            <div>已选择: {mode.label} - {level.label}</div>
            <div>关卡ID: {level.id}</div>
          </div>
        )}
      </div>
    </PanelShell>
  )
}
