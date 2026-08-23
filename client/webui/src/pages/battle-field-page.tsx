// ====================================================================
//  战斗场景页
// ====================================================================

import { useNavigate, useLocation } from 'react-router-dom'
import type { PB_BattleMatchResult } from '@/types'
import type { BattleSeriesResult } from '@/services/battle'
import BattleFieldPanel from '@/components/battle/battle-field-panel'
import BattleSeriesPanel from '@/components/battle/battle-series-panel'

export default function BattleFieldPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as any) ?? {}
  const result = state.battleResult as PB_BattleMatchResult | undefined
  const series = state.battleSeries as BattleSeriesResult | undefined

  // nvn多场1v1 场次切换容器
  if (series) {
    return (
      <BattleSeriesPanel
        series={series}
        onBack={() => navigate(-1)}
      />
    )
  }

  // 没有单场战斗数据时跳回
  if (!result) {
    navigate('/', { replace: true })
    return null
  }

  // 单场战斗
  return (
    <BattleFieldPanel
      result={result}
      onBack={() => navigate(-1)}
    />
  )
}
