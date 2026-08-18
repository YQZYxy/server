// ============================================================
//  战报复盘
// ============================================================

// ===== 事件数据接口 =====
export interface BattleEvent {
  type: number     // 事件类型 (对应 EventType)
  fields: (number | string)[] // 原始字段值 (按 SCHEMA 定义顺序)
  line: string     // 原始文本行
}

export interface BattleHeroState {
  pid: number
  name: string
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  teamSide: number  // 1=己方 2=敌方
  isMonster: boolean
  alive: boolean
  level?: number
  playerType?: number  // 参与者类型(如ENTITY_TYPE_HERO/ENTITY_TYPE_MONSTER)
  playerId?: number    // 模板ID
  teamId?: number   // 队伍ID(玩家UID/怪物ID)
  teamName?: string // 队伍名称
}

export interface AnimationFrame {
  events: BattleEvent[]
  turn: number
  description: string
}

export interface NameMap {
  [pid: number]: string
}

// ===== 事件类型枚举 =====
export const EventType = {
  BATTLE:           1,  // 战斗开始/结束
  TURN:             10, // 回合开始/结束
  ABILITY_ACTIVATE: 20, // 能力激活
  DAMAGE:           30, // 伤害事件
  HEAL:             31, // 治疗事件
  EFFECT_APPLIED:   40, // 效果应用
  EFFECT_REMOVED:   41, // 效果移除
  EFFECT_TICK:      42, // 效果周期触发
  DEATH:            50, // 死亡事件
  STATUS_CHANGE:    60, // 状态变化
  ATTR_CHANGE:      61, // 属性变化
  CUSTOM:           100,  // 自定义事件
} as const

export type EventTypeValue = (typeof EventType)[keyof typeof EventType]

// ===== Schema 字段定义 (对应 replay.lua 的 RegisterRecordSchema) =====
export const SCHEMA_FIELDS: Record<number, string[]> = {
  [EventType.BATTLE]:           ['type', 'battle_type', 'victory_condition', 'max_turns', 'seed', 'result_type', 'winner_team', 'total_turns', 'duration'],
  [EventType.TURN]:             ['type', 'turn'],
  [EventType.ABILITY_ACTIVATE]: ['source', 'target', 'ability_id', 'success'],
  [EventType.DAMAGE]:           ['source', 'target', 'damage', 'damage_type', 'is_crit', 'hp_before', 'hp_after'],
  [EventType.HEAL]:             ['source', 'target', 'amount', 'hp_before', 'hp_after'],
  [EventType.EFFECT_APPLIED]:   ['target', 'effect_name', 'duration', 'stack'],
  [EventType.EFFECT_REMOVED]:   ['target', 'effect_name'],
  [EventType.EFFECT_TICK]:      ['target', 'effect_name', 'value'],
  [EventType.DEATH]:            ['victim', 'killer'],
  [EventType.STATUS_CHANGE]:    ['pid', 'status_name', 'added'],
  [EventType.ATTR_CHANGE]:      ['pid', 'attr_id', 'old', 'new'],
  [EventType.CUSTOM]:           ['ext_type', 'data'],
}

// ===== 事件名映射 =====
export const EVENT_NAMES: Record<number, string> = {
  [EventType.BATTLE]: 'BATTLE',
  [EventType.TURN]: 'TURN',
  [EventType.ABILITY_ACTIVATE]: 'ABILITY_ACTIVATE',
  [EventType.DAMAGE]: 'DAMAGE',
  [EventType.HEAL]: 'HEAL',
  [EventType.EFFECT_APPLIED]: 'EFFECT_APPLY',
  [EventType.EFFECT_REMOVED]: 'EFFECT_REMOVE',
  [EventType.EFFECT_TICK]: 'EFFECT_TICK',
  [EventType.DEATH]: 'DEATH',
  [EventType.STATUS_CHANGE]: 'STATUS_CHANGE',
  [EventType.ATTR_CHANGE]: 'ATTR_CHANGE',
  [EventType.CUSTOM]: 'CUSTOM',
}
