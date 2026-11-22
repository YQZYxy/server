-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  level - 等级 (int)
  level_rewards - 等级奖励 ((array#sep=;),ItemType)
--]]

local M = {
    [5] = {
        level = 5,
        level_rewards = {
            {
                item_id = 3001,
                num = 1,
            },
            {
                item_id = 3003,
                num = 1,
            },
        },
    },

    [10] = {
        level = 10,
        level_rewards = {
            {
                item_id = 3003,
                num = 1,
            },
        },
    },

    [15] = {
        level = 15,
        level_rewards = {
            {
                item_id = 3005,
                num = 1,
            },
        },
    },

    [20] = {
        level = 20,
        level_rewards = {
            {
                item_id = 3005,
                num = 2,
            },
        },
    },

}

LOG_INFO(" 加载完成")

return M
