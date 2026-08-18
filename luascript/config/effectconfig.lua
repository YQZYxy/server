-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  id - ID (int)
  name - 效果名 (string)
  description - 描述 (string)
  duration_policy - 持续类型 (int)
  duration - 持续时间 (double)
  periodic_policy - 周期策略 (int)
  period - 周期时间 (double)
  stacking_policy - 堆叠策略 (int)
  max_stack_count - 最大堆叠 (int)
  stack_duration_refresh - 堆叠刷新时间策略 (int)
  granted_tags - 授予标签 ((array#sep=,),string)
  application_tag_requirements - 应用要求存在的标签 ((array#sep=,),string)
  ongoing_tag_requirements - 持续要求存在的标签 ((array#sep=,),string)
  remove_effects_with_tags - 移除带这些标签的效果 ((array#sep=,),string)
  modifiers - 属性修改器 ((array#sep=;),AttrModifierType)
--]]

local M = {
    [1] = {
        id = 1,
        name = "战吼",
        description = "",
        duration_policy = 2,
        duration = 5.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = { "State.Buff.Strength", },
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 3,
                op = 1,
                value = 15.0,
            },
            {
                attr_id = 8,
                op = 1,
                value = 10.0,
            },
        },
    },

    [2] = {
        id = 2,
        name = "力量祝福",
        description = "",
        duration_policy = 2,
        duration = 10.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = { "State.Buff.Strength", },
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 3,
                op = 1,
                value = 15.0,
            },
        },
    },

    [3] = {
        id = 3,
        name = "暗影护盾",
        description = "",
        duration_policy = 2,
        duration = 15.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = { "State.Buff.Shield", },
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 8,
                op = 1,
                value = 30.0,
            },
        },
    },

    [4] = {
        id = 4,
        name = "冰霜箭",
        description = "",
        duration_policy = 2,
        duration = 3.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = { "State.Debuff.Slow", },
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 102,
                op = 2,
                value = 0.7,
            },
            {
                attr_id = 4,
                op = 2,
                value = 0.8,
            },
        },
    },

    [5] = {
        id = 5,
        name = "冰盾",
        description = "",
        duration_policy = 2,
        duration = 10.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = { "State.Buff.Shield", },
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 8,
                op = 1,
                value = 30.0,
            },
        },
    },

    [6] = {
        id = 6,
        name = "生命药水",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 1,
                op = 1,
                value = 50.0,
            },
        },
    },

    [7] = {
        id = 7,
        name = "魔法药水",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 2,
                op = 1,
                value = 30.0,
            },
        },
    },

    [8] = {
        id = 8,
        name = "超级生命",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 1,
                op = 1,
                value = 150.0,
            },
        },
    },

    [9] = {
        id = 9,
        name = "超级魔法药水",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 2,
                op = 1,
                value = 100.0,
            },
        },
    },

    [10] = {
        id = 10,
        name = "力量药水",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 3,
                op = 1,
                value = 30.0,
            },
        },
    },

    [11] = {
        id = 11,
        name = "敏捷药水",
        description = "",
        duration_policy = 1,
        duration = 0.0,
        periodic_policy = 0,
        period = 0.0,
        stacking_policy = 0,
        max_stack_count = 0,
        stack_duration_refresh = 0,
        granted_tags = {},
        application_tag_requirements = {},
        ongoing_tag_requirements = {},
        remove_effects_with_tags = {},
        modifiers = {
            {
                attr_id = 4,
                op = 1,
                value = 25.0,
            },
        },
    },

}

LOG_INFO(" 加载完成")

return M
