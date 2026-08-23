// ====================================================================
//  战斗结果面板
// ====================================================================

import { useCallback } from 'react'
import { BattleResult, RESULT_LABELS, type PB_BattleMatchResult } from '@/types'
import { computeFinalHeroes } from '@/services/battle'
import PanelShell from '@/components/panel-shell'

interface ResultPanelProps {
  onClose?: () => void
  /** 由BattleFieldPanel通过registry传入(PB_BattleMatchResult 单场详情) */
  data?: PB_BattleMatchResult
}

export function ResultPanel({ onClose, data: propData }: ResultPanelProps = {}) {
  const rawText = (propData?.battle_report as string) || ''
  const heroList = rawText ? computeFinalHeroes(rawText) : []

  const resultType = (propData?.result_type ?? 0) as BattleResult
  const label = RESULT_LABELS[resultType] || '未知'

  // 统计
  const playerHeroes = heroList.filter(h => h.teamSide === 1)
  const enemyHeroes = heroList.filter(h => h.teamSide === 2)
  const playerAlive = playerHeroes.filter(h => h.hp > 0).length
  const enemyAlive = enemyHeroes.filter(h => h.hp > 0).length

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <PanelShell title="战斗结果" onClose={handleClose}>
      <div className="battle-result-panel">
        {/* 结果标题 */}
        <div className={`result-title ${resultType === BattleResult.VICTORY ? 'victory' : resultType === BattleResult.DEFEAT ? 'defeat' : ''}`}>
          {label}
        </div>

        {/* 统计信息 */}
        <div className="panel-section">
          <h3>统计</h3>
          <div className="result-stats">
            <div>存活: 己方 {playerAlive}/{playerHeroes.length} | 敌方 {enemyAlive}/{enemyHeroes.length}</div>
          </div>
        </div>

        {/* 英雄列表 */}
        <div className="panel-section">
          <h3>英雄状态</h3>
          <div className="result-hero-list">
            {heroList.map(h => (
              <div key={h.pid} className={`result-hero-item ${h.hp <= 0 ? 'dead' : ''}`}>
                <span className="hero-name">{h.name}</span>
                <span className="hero-hp">HP: {Math.max(0, Math.floor(h.hp))}/{Math.floor(h.maxHp)}</span>
                <span className="hero-mp">MP: {Math.max(0, Math.floor(h.mp))}/{Math.floor(h.maxMp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="panel-section result-actions">
          <button className="btn-primary" onClick={handleClose}>
            返回
          </button>
        </div>
      </div>
    </PanelShell>
  )
}
