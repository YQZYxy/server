-- ====================================================================
-- 道具相关常量定义
-- ====================================================================

local M = {}

-- 物品类型
M.ItemType = {
    NONE = 0,           -- 无
    WEAPON = 1,         -- 武器
    ARMOR = 2,          -- 盔甲
    CONSUMABLE = 3,     -- 消耗品
    MATERIAL = 4,       -- 材料
    TASK_ITEM = 5,      -- 任务物品
}

-- 物品子类型
M.ItemSubType = {
    NONE = 0,           -- 无
    MATERIAL_ORE = 1,             -- 矿石
    MATERIAL_HERB = 2,            -- 草药
    MATERIAL_LEATHER = 3,         -- 皮革
    MATERIAL_CLOTH = 4,           -- 布料
    MATERIAL_WOOD = 5,            -- 木材
    MATERIAL_STONE = 6,           -- 石头
    CONSUMABLE_HEAL_REGEN = 7,           -- 治疗类消耗品
    CONSUMABLE_MANA_REGEN = 8,           -- 法力类消耗品
    CONSUMABLE_STRENGTH_BUFF = 9,        -- 力量增益类消耗品
    CONSUMABLE_AGILITY_BUFF = 10,        -- 敏捷增益类消耗品
}

-- 物品品质
M.ItemQuality = {
    NONE = 0,           -- 无
    POOR = 1,           -- 差
    COMMON = 2,         -- 普通
    UNCOMMON = 3,       -- 优秀
    RARE = 4,           -- 稀有
    EPIC = 5,           -- 史诗
    LEGENDARY = 6       -- 传说
}

-- 品质颜色(用于显示)
M.ItemQualityColor = {
    [0] = "#808080",  -- none
    [1] = "#9d9d9d",  -- poor
    [2] = "#ffffff",  -- common
    [3] = "#1eff00",  -- uncommon
    [4] = "#0070dd",  -- rare
    [5] = "#a335ee",  -- epic
    [6] = "#ff8000"   -- legendary
}

-- 装备槽位
M.EquipSlot = {
    NONE = 0,           -- 无
    HEAD = 1,           -- 头部
    CHEST = 2,          -- 胸部
    LEGS = 3,           -- 腿部
    HANDS = 4,          -- 手部
    FEET = 5,           -- 脚部
    WEAPON = 6,         -- 武器
    SHIELD = 7,         -- 盾牌
    RING_1 = 8,         -- 戒指1
    RING_2 = 9,         -- 戒指2
    NECKLACE = 10       -- 项链
}

return M
