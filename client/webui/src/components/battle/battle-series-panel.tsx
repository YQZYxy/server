// ====================================================================
//  系列战斗容器(nvn多场1v1)
//  顶部: 总胜负徽章 + 胜场统计 + 场次切换
//  主体: 复用 BattleFieldPanel 渲染当前场次
// ====================================================================

import { useState } from 'react'
import { gameStore } from '@/store/game-store'
import type { PB_BattleMatchResult } from '@/types'
import type { BattleSeriesResult } from '@/services/battle'
import BattleFieldPanel from './battle-field-panel'

// 系列总结果文案(对应 PB_BattleResultType)
const SERIES_RESULT_META: Record<number, { text: string; cls: string }> = {
  1: { text: '系列胜利', cls: 'series-win' },
  2: { text: '系列失败', cls: 'series-lose' },
  4: { text: '系列平局', cls: 'series-draw' },
}

interface BattleSeriesPanelProps {
  series: BattleSeriesResult
  onBack: () => void
}

export default function BattleSeriesPanel({ series, onBack }: BattleSeriesPanelProps) {
  // 当前展示的场次(0-based)
  const [cur, setCur] = useState(0)
  const setActivePanel = gameStore(s => s.setActivePanel)

  const total = series.total || 1
  // 防止越界
  const safeCur = Math.min(cur, total - 1)
  const meta = SERIES_RESULT_META[series.seriesResult]
  // 当前场次详情
  const currentMatch = ((series.sc as any).matches?.[safeCur] as PB_BattleMatchResult) ?? null

  // 切换场次: 关闭覆盖层面板并重置当前场次
  const switchMatch = (i: number) => {
    setActivePanel('none')
    setCur(i)
  }

  return (
    <div className="battle-series-page">
      {/* 总结果 胜场 场次切换 */}
      <div className="battle-series-topbar">
        <div className="battle-series-left">
          <button className="arena-back-btn" onClick={onBack}>← 返回</button>
        </div>
        <div className="battle-series-center">
          {meta ? <span className={`series-result-badge ${meta.cls}`}>{meta.text}</span> : null}
          <span className="series-score">胜场 {series.win}/{total}</span>
        </div>
        <div className="battle-series-right">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              className={`series-tab-btn ${i === safeCur ? 'active' : ''}`}
              onClick={() => switchMatch(i)}
            >
              第{i + 1}场
            </button>
          ))}
        </div>
      </div>

      {/* 当前场次战斗 */}
      {currentMatch ? (
        <BattleFieldPanel key={safeCur} result={currentMatch} onBack={onBack} />
      ) : (
        <div className="series-empty">该场战报缺失</div>
      )}
    </div>
  )
}
