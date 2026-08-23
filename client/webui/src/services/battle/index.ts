// 帧动画
export { groupEventsByTurn as groupEventsByTurnAnim} from './animator'

// replay-parser (战报复盘解析)
export {
  getField,
  getStrField,
  parseReplayText,
  parseHeroesFromReport,
  groupEventsByTurn,
  logParsedReport,
  describeEvent,
  computeFinalHeroes,
} from './replay-parser'

// use-battle (统一战斗流程)
export { onBattleResult, offBattleResult, sendBattle ,setBattleNavigate} from './use-battle'

export type { BattleSeriesResult } from './use-battle'

export {
  EventType,
  SCHEMA_FIELDS,
  EVENT_NAMES,
} from '@/types'

export type {
  BattleEvent,
  BattleHeroState,
  AnimationFrame,
  NameMap,
} from '@/types'
