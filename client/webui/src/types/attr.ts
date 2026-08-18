// ============================================================
//  属性枚举
// ============================================================

export enum Attr {
  MAX_MANA = -2,
  MAX_HEALTH = -1,
  NONE = 0,
  HEALTH = 1,
  MANA = 2,
  STRENGTH = 3,
  AGILITY = 4,
  INTELLIGENCE = 5,
  VITALITY = 6,
  LUCK = 7,
  ARMOR = 8,
  CRIT_CHANCE = 100,
  CRIT_DAMAGE = 101,
  ATTACK_SPEED = 102,
  DODGE_CHANCE = 103,
  BLOCK_CHANCE = 104,
  DAMAGE_MULTIPLIER = 105,
}

/** 属性名映射 */
export const ATTR_NAMES_FALLBACK: Record<Attr, string> = {
  [Attr.MAX_MANA]: '最大法力',
  [Attr.MAX_HEALTH]: '最大生命',
  [Attr.NONE]: '无',
  [Attr.HEALTH]: '生命值',
  [Attr.MANA]: '法力值',
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
