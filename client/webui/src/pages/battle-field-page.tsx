// ====================================================================
//  战斗场景页
// ====================================================================

import { useNavigate, useLocation } from 'react-router-dom'
import type { P_GasBattle_SC } from '@/types'
import BattleFieldPanel from '@/components/battle/battle-field-panel'

export default function BattleFieldPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = (location.state as any)?.battleResult as P_GasBattle_SC | undefined

  // 没有战斗数据时跳回
  if (!result) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <BattleFieldPanel
      result={result}
      onBack={() => navigate(-1)}
    />
  )
}
