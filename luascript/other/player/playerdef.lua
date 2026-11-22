-- ====================================================================
-- 玩家基类相关常量定义
-- ====================================================================

local M = {}

-- 对象类型
M.ObjType = {
    NONE    = 0;
    HERO    = 1;   -- 英雄(玩家)
    MONSTER = 2;   -- 怪物(NPC)
}

-- 属性总数
M.ATTR_MAX = 16;

-- 属性id
M.Attr = {
    HEALTH = 0,             -- 生命值
    MAX_HEALTH = 1,         -- 最大生命值
    MANA = 2,               -- 法力值
    MAX_MANA = 3,           -- 最大法力值

    STRENGTH = 4,           -- 力量
    AGILITY = 5,            -- 敏捷
    INTELLIGENCE = 6,       -- 智力
    VITALITY = 7,           -- 体质
    LUCK = 8,               -- 幸运
    ARMOR = 9,              -- 护甲

    CRIT_CHANCE = 10,       -- 暴击率
    CRIT_DAMAGE = 11,       -- 暴击伤害
    ATTACK_SPEED = 12,      -- 攻击速度
    DODGE_CHANCE = 13,      -- 闪避率
    BLOCK_CHANCE = 14,      -- 格挡率
    DAMAGE_MULTIPLIER = 15, -- 伤害加成
}

return M
