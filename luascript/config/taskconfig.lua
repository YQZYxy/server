-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  task_id - 任务ID (int)
  name - 名称 (string)
  description - 描述 (string)
  type - 类型 (int)
  level - 等级 (int)
  required_level - 需求等级 (int)
  reward_items - 奖励物品 ((array#sep=;),ItemType)
  repeatable - 可重复 (bool)
  daily - 每日 (bool)
  time_limit - 时间限制 (int)
  objectives - 子任务 ((array#sep=,),int)
--]]

local M = {
    [1001] = {
        task_id = 1001,
        name = "哥布林杀手",
        description = "击败森林中的哥布林",
        type = 1,
        level = 1,
        required_level = 1,
        reward_items = {
            {
                item_id = 1,
                num = 50,
            },
            {
                item_id = 2,
                num = 100,
            },
            {
                item_id = 3001,
                num = 1,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100100, },
    },

    [1002] = {
        task_id = 1002,
        name = "采药",
        description = "采集魔法草药",
        type = 2,
        level = 1,
        required_level = 1,
        reward_items = {
            {
                item_id = 1,
                num = 30,
            },
            {
                item_id = 2,
                num = 80,
            },
            {
                item_id = 3001,
                num = 1,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100200, },
    },

    [1003] = {
        task_id = 1003,
        name = "精英狩猎",
        description = "击败精英巨魔",
        type = 1,
        level = 5,
        required_level = 5,
        reward_items = {
            {
                item_id = 1,
                num = 200,
            },
            {
                item_id = 2,
                num = 500,
            },
            {
                item_id = 1002,
                num = 1,
            },
            {
                item_id = 3003,
                num = 1,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100300, },
    },

    [1004] = {
        task_id = 1004,
        name = "清理森林",
        description = "击败各种怪物清理森林",
        type = 1,
        level = 3,
        required_level = 3,
        reward_items = {
            {
                item_id = 1,
                num = 100,
            },
            {
                item_id = 2,
                num = 300,
            },
            {
                item_id = 2001,
                num = 1,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100400, 100401, 100402, },
    },

    [1005] = {
        task_id = 1005,
        name = "日常巡逻",
        description = "完成日常巡逻任务",
        type = 1,
        level = 1,
        required_level = 1,
        reward_items = {
            {
                item_id = 1,
                num = 20,
            },
            {
                item_id = 2,
                num = 50,
            },
        },
        repeatable = true,
        daily = true,
        time_limit = 0,
        objectives = { 100500, },
    },

    [1007] = {
        task_id = 1007,
        name = "怪物猎人",
        description = "击败任意精英怪物",
        type = 1,
        level = 5,
        required_level = 5,
        reward_items = {
            {
                item_id = 1,
                num = 150,
            },
            {
                item_id = 2,
                num = 300,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100700, },
    },

    [1008] = {
        task_id = 1008,
        name = "宝物收集家",
        description = "收集稀有品质的装备",
        type = 2,
        level = 10,
        required_level = 10,
        reward_items = {
            {
                item_id = 1,
                num = 300,
            },
            {
                item_id = 2,
                num = 500,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100800, },
    },

    [1009] = {
        task_id = 1009,
        name = "城镇导览",
        description = "与城镇中的NPC对话",
        type = 3,
        level = 1,
        required_level = 1,
        reward_items = {
            {
                item_id = 1,
                num = 10,
            },
            {
                item_id = 2,
                num = 50,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 100900, 100901, },
    },

    [1010] = {
        task_id = 1010,
        name = "探索黑暗森林",
        description = "前往黑暗森林探索",
        type = 4,
        level = 3,
        required_level = 3,
        reward_items = {
            {
                item_id = 1,
                num = 100,
            },
            {
                item_id = 2,
                num = 200,
            },
        },
        repeatable = false,
        daily = false,
        time_limit = 0,
        objectives = { 101000, },
    },

}

LOG_INFO(" 加载完成")

return M
