-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  id - 怪物ID (int)
  name - 名称 (string)
  level - 等级 (int)
  monster_type - 怪物类型 (int)
  base_attr - 基础属性 ((map#sep=,;),int,double)
  attr_growth - 每级成长属性 ((map#sep=,;),int,double)
  abilities - 初始技能 ((array#sep=,),int)
  ability_weights - 技能权重 ((map#sep=,;),int,double)
  ai_behavior - 策略 ((map#sep=,;),string,double)
  loot_table - 掉落 ((array#sep=;),ItemType)
  phase_triggers - 阶段 ((list#sep=|),((map#sep=:;),string,string))
--]]

local M = {
    [1001] = {
        id = 1001,
        name = "哥布林",
        level = 1,
        monster_type = 1,
        base_attr = {
            [1] = 50.0,
            [2] = 50.0,
            [3] = 8.0,
        },
        attr_growth = {
            [1] = 25.0,
            [2] = 20.0,
        },
        abilities = { 1, 2, },
        ability_weights = {
            [1] = 60.0,
            [2] = 40.0,
        },
        ai_behavior = {
            ["aggressive"] = 70.0,
            ["defensive"] = 20.0,
            ["balanced"] = 10.0,
        },
        loot_table = {
            {
                id = 2,
                num = 100,
            },
            {
                id = 3001,
                num = 1,
            },
            {
                id = 3003,
                num = 1,
            },
        },
        phase_triggers = {},
    },

    [1002] = {
        id = 1002,
        name = "巨魔",
        level = 5,
        monster_type = 2,
        base_attr = {
            [1] = 100.0,
            [2] = 50.0,
            [3] = 20.0,
        },
        attr_growth = {
            [1] = 25.0,
            [2] = 20.0,
        },
        abilities = { 1, 2, 2002, 2003, },
        ability_weights = {
            [1] = 25.0,
            [2] = 25.0,
            [2002] = 20.0,
            [2003] = 10.0,
        },
        ai_behavior = {
            ["aggressive"] = 80.0,
            ["defensive"] = 15.0,
            ["balanced"] = 5.0,
        },
        loot_table = {
            {
                id = 2,
                num = 50,
            },
            {
                id = 3001,
                num = 1,
            },
            {
                id = 3003,
                num = 1,
            },
        },
        phase_triggers = {},
    },

    [1003] = {
        id = 1003,
        name = "暗影领主",
        level = 10,
        monster_type = 3,
        base_attr = {
            [1] = 100.0,
            [2] = 50.0,
            [3] = 30.0,
        },
        attr_growth = {
            [1] = 50.0,
            [2] = 30.0,
        },
        abilities = { 1, 2, 1001, 2002, 2003, },
        ability_weights = {
            [1] = 25.0,
            [2] = 25.0,
            [1001] = 20.0,
            [2002] = 10.0,
            [2003] = 10.0,
        },
        ai_behavior = {
            ["aggressive"] = 60.0,
            ["defensive"] = 25.0,
            ["balanced"] = 15.0,
        },
        loot_table = {
            {
                id = 2,
                num = 200,
            },
            {
                id = 3001,
                num = 1,
            },
            {
                id = 3003,
                num = 1,
            },
        },
        phase_triggers = {
            {
                ["health_percent"] = "50",
                ["ability_id"] = "2003",
                ["message"] = "🔥 暗影领主进入狂暴状态!",
            },
            {
                ["health_percent"] = "25",
                ["ability_id"] = "2001",
                ["message"] = "💀 暗影领主陷入绝望,开始吸取生命!",
            },
        },
    },

    [1004] = {
        id = 1004,
        name = "冰霜元素",
        level = 7,
        monster_type = 2,
        base_attr = {
            [1] = 100.0,
            [2] = 50.0,
            [3] = 5.0,
        },
        attr_growth = {
            [1] = 30.0,
            [2] = 25.0,
        },
        abilities = { 1, 2, 3001, 3002, 3003, },
        ability_weights = {
            [1] = 25.0,
            [2] = 25.0,
            [3001] = 10.0,
            [3002] = 20.0,
            [3003] = 10.0,
        },
        ai_behavior = {
            ["aggressive"] = 70.0,
            ["defensive"] = 20.0,
            ["balanced"] = 10.0,
        },
        loot_table = {
            {
                id = 2,
                num = 80,
            },
            {
                id = 3001,
                num = 1,
            },
            {
                id = 3003,
                num = 1,
            },
        },
        phase_triggers = {},
    },

}

LOG_INFO(" 加载完成")

return M
