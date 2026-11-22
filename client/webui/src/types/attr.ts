// ============================================================
//  属性枚举
//  属性id 从 0 连续编号, 与 share/proto/battledata.proto 的 PB_Attr 保持一致
//  是否百分比由属性配置的 is_per 标记, 这里不分区
// ============================================================

export enum Attr {
  HEALTH = 0,
  MAX_HEALTH = 1,
  MANA = 2,
  MAX_MANA = 3,

  STRENGTH = 4,
  AGILITY = 5,
  INTELLIGENCE = 6,
  VITALITY = 7,
  LUCK = 8,
  ARMOR = 9,

  CRIT_CHANCE = 10,
  CRIT_DAMAGE = 11,
  ATTACK_SPEED = 12,
  DODGE_CHANCE = 13,
  BLOCK_CHANCE = 14,
  DAMAGE_MULTIPLIER = 15,
}

/** 属性总数 */
export const ATTR_MAX = 16

/** 属性名映射 */
export const ATTR_NAMES_FALLBACK: Record<Attr, string> = {
  [Attr.HEALTH]: '生命值',
  [Attr.MAX_HEALTH]: '最大生命',
  [Attr.MANA]: '法力值',
  [Attr.MAX_MANA]: '最大法力',
  [Attr.STRENGTH]: '力量',
  [Attr.AGILITY]: '敏捷',
  [Attr.INTELLIGENCE]: '智力',
  [Attr.VITALITY]: '体质',
  [Attr.LUCK]: '幸运',
  [Attr.ARMOR]: '护甲',
  [Attr.CRIT_CHANCE]: '暴击率',
  [Attr.CRIT_DAMAGE]: '暴击伤害',
  [Attr.ATTACK_SPEED]: '攻击速度',
  [Attr.DODGE_CHANCE]: '闪避率',
  [Attr.BLOCK_CHANCE]: '格挡率',
  [Attr.DAMAGE_MULTIPLIER]: '伤害加成',
}
