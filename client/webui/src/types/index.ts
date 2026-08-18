// ============================================================
//  类型索引 - 统一导出所有类型
// ============================================================

// 协议
export * from './protobuf'

// 背包
export {
  ItemType,
  ITEM_TYPES,
  ITEM_TYPE_TABS,  getItemConfig,
  getItemGlobalConfig,
} from './inventory'

// 属性
export { Attr, ATTR_NAMES_FALLBACK } from './attr'


// 英雄/阵容
export {
  Job,
  JOB_ICONS,
  DEFAULT_HERO_ICON,
  MAX_LINEUP_SLOTS,
  getHeroConfig,
  getHeroLevelConfig,} from './hero'


// 敌人
export {
  ENEMY_ICONS,
  DEFAULT_ENEMY_ICONS,
} from './enemy'

// 任务
export {
  QuestStatus,
  QUEST_STATUS,
  getQuestConfig,
  getQuestGlobalConfig,
  getQuestObjConfig,
} from './quest'

// 战斗
export {
  BattleType,
  ANIMATION_SPEED,
  BATTLE_TYPE_CONFIGS,
  getBattleTypeConfig,
  BATTLE_MODES,
  buildBattleModes,
  BattleResult,
  RESULT_LABELS,  getBattlestageConfig,
  getBattlemonstergroupConfig,} from './battle'
export type {
  BattleModeType,
  BattleLevel,
  BattleModeConfig,
  BattleTypeConfig,
} from './battle'

// 排行榜
export { RANK_PAGE_SIZE, RankType } from './rank'

// 额外配置表
export {
  getMonsterConfig,
  getAbilityConfig,
  getEffectConfig,
  getAttrConfig,
} from './config'
export type {
  HeroConfig,
  MonsterConfig,
  AbilityConfig,
  EffectConfig,
  ItemConfig,
  ItemGlobalConfig,
  AttrConfig,
  QuestConfig,
  QuestGlobalConfig,
  QuestObjConfig,
  HeroLevelConfig,
  BattlestageConfig,
  BattlemonstergroupConfig,
  MonsterGroupEntry,
} from './config'

// 大厅面板
export type { PanelSlot } from './hall'

// 战报
export {
  EventType,
  SCHEMA_FIELDS,
  EVENT_NAMES,
} from './battle-replay'
export type {
  EventTypeValue,
  BattleEvent,
  BattleHeroState,
  AnimationFrame,
  NameMap,
} from './battle-replay'

// 聊天
export {
  ChatChannelType,
  CHAT_CHANNELS,
} from './chat'
export type {
  ChatChannelDef,
} from './chat'

// Agent
export type {
  AgentConfig,
  SessionInfo,
  AgentMessage,
  SkillInfo,
  ToolInfo,
  SSEData,
  SSEHandlers,
  ToolCallRecord,
} from './agent'

