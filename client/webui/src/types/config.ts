
import { getCachedConfig } from '@/services/configmanager'

// ============================================================
//  配置表类型 (从 Luban 导出的 JSON 配置)
// ============================================================

// 角色配置 (heroconfig.json)
export interface HeroConfig {
  id: number
  name: string
  description: string
  job: number
  max_level: number
  base_exp: number
  exp_multiplier: number
  starting_abilities: number[]
  equip_types: number[]
  /** [attr_id, value][] */
  base_attr: [number, number][]
  /** [attr_id, value][] */
  attr_growth: [number, number][]
}

// 怪物配置 (monsterconfig.json)
export interface MonsterConfig {
  id: number
  name: string
  level: number
  monster_type: number
  base_attr: [number, number][]
  attr_growth: [number, number][]
  abilities: number[]
  ability_weights: Record<number, number>
  ai_behavior: Record<string, number>
  loot_table: any[]
  phase_triggers: any[]
}

// 能力配置 (abilityconfig.json)
export interface AbilityConfig {
  id: number
  name: string
  description: string
  ability_type: number
  level: number
  activation_policy: number
  net_execution_policy: number
  cooldown_duration: number
  cooldown_tags: string[]
  cost_attrs: [number, number][]
  targeting_type: number
  range: number
  can_crit: boolean
  base_value: number
  /** [attr_id, coefficient][] */
  attr_adds: [number, number][]
  effect_ids: number[]
  extra_params: number[]
  damage_tags: string[]
  ability_tags: string[]
  cancel_abilities_with_tags: string[]
  block_abilities_with_tags: string[]
  activation_owned_tags: string[]
  activation_required_tags: string[]
  activation_blocked_tags: string[]
  target_required_tags: string[]
  target_blocked_tags: string[]
  [key: string]: any
}

// 效果配置 (effectconfig.json)
export interface EffectConfig {
  id: number
  name: string
  description: string
  effect_type: number
  duration: number
  periodic_interval: number
  max_stack: number
  base_value: number
  attr_adds: [number, number][]
  extra_params: number[]
  [key: string]: any
}

// 道具配置 (itemconfig.json)
export interface ItemConfig {
  id: number
  name: string
  description: string
  /** 道具类型 (对应 Lua Const.ItemType) */
  type: number
  sub_type: number
  quality: number
  level: number
  auto_use: boolean
  discard: boolean
  max_stack: number
  sell_price: number
  buy_price: number
  gas_effects: number[]
  damage: number
  attack_speed: number
  armor: number
  slot: number
  [key: string]: any
}

// 物品全局配置 (itemglobalconfig.json)
export interface ItemGlobalConfig {
  max_inventory_slots: number
  max_bag_types: number
  [key: string]: any
}

// 属性配置 (attrconfig.json)
export interface AttrConfig {
  id: number
  name: string
  base: number
}

// 任务配置 (questconfig.json)
export interface QuestConfig {
  id: number
  name: string
  description: string
  quest_type: number
  min_level: number
  objectives: number[]
  rewards: any[]
  [key: string]: any
}

// 任务全局配置 (questglobalconfig.json)
export interface QuestGlobalConfig {
  max_active_quests: number
  [key: string]: any
}

// 任务目标配置 (questobjconfig.json)
export interface QuestObjConfig {
  id: number
  name: string
  description: string
  target_type: number
  target_id: number
  need_count: number
  [key: string]: any
}

// 角色等级配置 (herolevelconfig.json)
export interface HeroLevelConfig {
  level: number
  exp_required: number
  rewards: any[]
  [key: string]: any
}

// 怪物组条目(每个怪物实例的属性)
export interface MonsterGroupEntry {
  monster_id: number
  count: number
  level: number
  attr_scale: number
}

// 主线关卡配置 (battlestageconfig.json)
export interface BattlestageConfig {
  id: number
  name: string
  desc: string
  monster_group_ids: number[]
}

// 怪物组配置 (battlemonstergroupconfig.json)
export interface BattlemonstergroupConfig {
  id: number
  desc: string
  monster_ids: MonsterGroupEntry[]
}

/** 获取怪物配置(同步,需已缓存) */
export function getMonsterConfig(): MonsterConfig[] | undefined {
  return getCachedConfig<MonsterConfig[]>('monsterconfig')
}

/** 获取能力配置(同步) */
export function getAbilityConfig(): AbilityConfig[] | undefined {
  return getCachedConfig<AbilityConfig[]>('abilityconfig')
}

/** 获取效果配置(同步) */
export function getEffectConfig(): EffectConfig[] | undefined {
  return getCachedConfig<EffectConfig[]>('effectconfig')
}

/** 获取属性配置(同步) */
export function getAttrConfig(): AttrConfig[] | undefined {
  return getCachedConfig<AttrConfig[]>('attrconfig')
}
