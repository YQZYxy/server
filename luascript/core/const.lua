
local M = {}

-- ==================系统相关===================

-- GM 权限等级
M.GmLevel = {
    NONE = 0,           -- 无
    JUNIOR = 1,         -- 初级
    SENIOR = 2,         -- 高级
    ADMIN = 3,          -- 管理员
    SUPER_ADMIN = 4     -- 超级管理员
}

-- ==================道具相关===================

-- 物品类型
M.ItemType = {
    NONE = 0,           -- 无
    WEAPON = 1,         -- 武器
    ARMOR = 2,          -- 盔甲
    CONSUMABLE = 3,     -- 消耗品
    MATERIAL = 4,       -- 材料
    QUEST_ITEM = 5,     -- 任务物品
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

-- ==================怪物相关===================

-- 怪物类型
M.MonsterType = {
    NONE = 0,           -- 无
    NORMAL = 1,         -- 普通
    ELITE = 2,          -- 精英
    BOSS = 3,           -- 首领
    RARE = 4,           -- 稀有
    WORLD_BOSS = 5      -- 世界BOSS
}

-- 怪物等级颜色(用于显示)
M.MonsterTypeColor = {
    [0] = "#808080",  -- none
    [1] = "#ffffff",  -- normal
    [2] = "#ffff00",  -- elite
    [3] = "#ff0000",  -- boss
    [4] = "#ff00ff",  -- rare
    [5] = "#ff8000"   -- world_boss
}

-- ==================任务相关===================

-- 任务类型
M.QuestType = {
    NONE = 0,       -- 无任务
    KILL = 1,       -- 消灭敌人
    COLLECT = 2,    -- 收集物品
    TALK = 3,       -- 对话
    EXPLORE = 4,    -- 探索
    USE_ITEM = 5    -- 使用物品
}

-- 子任务类型
M.QuestObjType = {
    NONE = 0,                        -- 无任务
    KILL_MONSTER_ID = 1,             -- 消灭指定id敌人
    COLLECT_ITEM_ID = 2,             -- 收集指定id道具
    TALK_NPC_ID = 3,                 -- 指定npcid对话
    EXPLORE_ID = 4,                  -- 探索指定地图id和区域id
    USE_ITEM_ID = 5,                 -- 使用指定id物品
    KILL_MONSTER_TYPE = 6,           -- 消灭指定类型敌人
    COLLECT_ITEM_QUALITY_TYPE = 7    -- 收集指定品质和类型道具
}


-- 任务状态
M.QuestStatus = {
    NOT_STARTED = 0,    -- 未开始
    IN_PROGRESS = 1,    -- 进行中
    COMPLETED = 2,      -- 已完成
    FAILED = 3,         -- 失败
    TURNED_IN = 4       -- 已提交
}

M.QuestAddType = {
    NONE = 0,        -- 无
    ADD = 1,         -- 增加
    REMOVE = 2,      -- 移除
}

-- ==================职业相关===================

M.Job = {
    NONE = 0,           -- 无
    WARRIOR = 1,        -- 战士
    MAGE = 2,           -- 法师
    ROGUE = 3,          -- 盗贼
    PRIEST = 4,         -- 牧师
}

-- =================== 属性 ===================

-- 属性定义常量
M.Attr = {

    MAX_HEALTH = -1,         -- 最大生命值
    MAX_MANA = -2,           -- 最大法力值

    NONE = 0,               -- == 上面是系统属性
    
    HEALTH = 1,             -- 生命值
    MANA = 2,               -- 法力值

    STRENGTH = 3,           -- 力量
    AGILITY = 4,            -- 敏捷
    INTELLIGENCE = 5,       -- 智力
    VITALITY = 6,           -- 体质
    LUCK = 7,               -- 幸运
    ARMOR = 8,              -- 护甲

    -- === 百分比属性 (100-1000) ===
    CRIT_CHANCE = 100,      -- 暴击率
    CRIT_DAMAGE = 101,      -- 暴击伤害
    ATTACK_SPEED = 102,     -- 攻击速度
    DODGE_CHANCE = 103,     -- 闪避率
    BLOCK_CHANCE = 104,     -- 格挡率
    DAMAGE_MULTIPLIER = 105,-- 伤害加成

}

-- 战斗结果类型
M.BattleResultType = {
    NONE = 0,           -- 无结果
    VICTORY = 1,        -- 胜利
    DEFEAT = 2,         -- 失败
    TIME_OUT = 3,       -- 超时
    DRAW = 4            -- 平局
}

M.VictoryCondition = {
    VICTORY_COND_NONE           = 0;    -- 胜利条件
    VICTORY_COND_DEFENDER_DEATH = 1;    -- 防守方全灭
    VICTORY_COND_ATTACKER_DEATH = 2;    -- 进攻方全灭
    VICTORY_COND_ELIMINATE_ALL  = 3;    -- 只剩一方存活
    VICTORY_COND_SURVIVE_TIME   = 4;    -- 防守方存活到时间结束
    VICTORY_COND_KILL_TARGET    = 5;    -- 击杀指定目标
    VICTORY_COND_SCORE_LIMIT    = 6;    -- 分数达到上限
}


-- 战斗副本模式
M.BattleType = {
    NONE = 0,           -- 无战斗
    MAIN_BATTLE = 1,    -- 主线副本
    ARENA = 2,          -- 竞技场
}

M.PlayerType = {
    NONE    = 0;
    HERO    = 1;   -- 英雄(玩家)
    MONSTER = 2;   -- 怪物(NPC)
}

M.BattleMode = {
    NONE        = 0;
    TURN_BASED  = 1;   -- 回合制
    REALTIME    = 2;   -- 实时
}

M.TeamSide = {
    NEUTRAL   = 0;
    ATTACKER  = 1;
    DEFENDER  = 2;
}

-- ==================排行榜===================
M.RankType = {
    NONE = 0,
    ARENA = 1,        -- 竞技场
    MAIN_BATTLE = 2,  -- 主线阵容战力
}

LOG_INFO("Const 加载完成")

-- 返回只读表
return M