-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  id - ID (int)
  name - 职业名称 (string)
  description - 描述 (string)
  job - 职业类型 (int)
  max_level - 最大等级 (int)
  base_exp - 基础经验 (int)
  exp_multiplier - 经验倍率 (double)
  starting_abilities - 起始技能 ((array#sep=;),int)
  equip_types - 可装备类型 ((array#sep=;),int)
  base_attr - 基础属性 ((map#sep=,;),int,double)
  attr_growth - 成长属性 ((map#sep=,;),int,double)
--]]

local M = {
    [1] = {
        id = 1,
        name = "战士",
        description = "近战物理职业,擅长使用武器和重甲",
        job = 1,
        max_level = 100,
        base_exp = 100,
        exp_multiplier = 1.5,
        starting_abilities = { 1, 2, 1002, },
        equip_types = { 1, 2, 3, 4, 5, 6, 7, },
        base_attr = {
            [1] = 100.0,
            [2] = 50.0,
            [3] = 15.0,
        },
        attr_growth = {
            [1] = 30.0,
            [2] = 8.0,
            [3] = 3.0,
        },
    },

    [2] = {
        id = 2,
        name = "法师",
        description = "远程魔法职业,擅长使用元素魔法",
        job = 2,
        max_level = 100,
        base_exp = 100,
        exp_multiplier = 1.5,
        starting_abilities = { 1, 3001, 3002, 1001, },
        equip_types = { 1, 2, 3, 4, 5, 6, 7, },
        base_attr = {
            [1] = 80.0,
            [2] = 100.0,
            [3] = 5.0,
        },
        attr_growth = {
            [1] = 20.0,
            [2] = 30.0,
            [3] = 1.0,
        },
    },

    [3] = {
        id = 3,
        name = "盗贼",
        description = "敏捷刺客,擅长快速攻击和暴击",
        job = 3,
        max_level = 100,
        base_exp = 100,
        exp_multiplier = 1.5,
        starting_abilities = { 1, 3, },
        equip_types = { 1, 2, 3, 4, 5, 6, 7, },
        base_attr = {
            [1] = 100.0,
            [2] = 50.0,
            [3] = 10.0,
        },
        attr_growth = {
            [1] = 25.0,
            [2] = 6.0,
            [3] = 2.0,
        },
    },

    [4] = {
        id = 4,
        name = "牧师",
        description = "治疗辅助职业,擅长恢复和增益",
        job = 4,
        max_level = 100,
        base_exp = 100,
        exp_multiplier = 1.5,
        starting_abilities = { 1, 1001, 1003, 3001, },
        equip_types = { 1, 2, 3, 4, 5, 6, 7, },
        base_attr = {
            [1] = 100.0,
            [2] = 80.0,
            [3] = 6.0,
        },
        attr_growth = {
            [1] = 25.0,
            [2] = 20.0,
            [3] = 1.0,
        },
    },

}

LOG_INFO(" 加载完成")

return M
