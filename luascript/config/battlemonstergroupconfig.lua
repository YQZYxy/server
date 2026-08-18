-- ====================================================================
-- 自动生成配置 :怪物组配置
-- ====================================================================

--[[
字段结构说明:

  id - 怪物组ID (int)
  desc - 描述 (string)
  monster_ids - 怪物条目列表(monster_id,count,level,attr_scale) ((array#sep=;),MonsterGroupEntry)
--]]

local M = {
    [1] = {
        id = 1,
        desc = "1只哥布林",
        monster_ids = {
            {
                monster_id = 1001,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [2] = {
        id = 2,
        desc = "2只哥布林",
        monster_ids = {
            {
                monster_id = 1001,
                count = 2,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [3] = {
        id = 3,
        desc = "1只巨魔",
        monster_ids = {
            {
                monster_id = 1002,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [4] = {
        id = 4,
        desc = "冰霜元素",
        monster_ids = {
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [5] = {
        id = 5,
        desc = "暗影领主",
        monster_ids = {
            {
                monster_id = 1003,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [6] = {
        id = 6,
        desc = "巨魔(强化)+冰霜",
        monster_ids = {
            {
                monster_id = 1002,
                count = 1,
                level = 8,
                attr_scale = 1.2,
            },
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [7] = {
        id = 7,
        desc = "2只巨魔",
        monster_ids = {
            {
                monster_id = 1002,
                count = 2,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [8] = {
        id = 8,
        desc = "哥布林+冰霜",
        monster_ids = {
            {
                monster_id = 1001,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [9] = {
        id = 9,
        desc = "3只哥布林",
        monster_ids = {
            {
                monster_id = 1001,
                count = 3,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [10] = {
        id = 10,
        desc = "哥布林+巨魔",
        monster_ids = {
            {
                monster_id = 1001,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
            {
                monster_id = 1002,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [11] = {
        id = 11,
        desc = "冰霜+巨魔",
        monster_ids = {
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
            {
                monster_id = 1002,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [12] = {
        id = 12,
        desc = "强化哥布林x3",
        monster_ids = {
            {
                monster_id = 1001,
                count = 3,
                level = 3,
                attr_scale = 1.2,
            },
        },
    },

    [13] = {
        id = 13,
        desc = "巨魔+暗影领主",
        monster_ids = {
            {
                monster_id = 1002,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
            {
                monster_id = 1003,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [14] = {
        id = 14,
        desc = "3只巨魔(强化)",
        monster_ids = {
            {
                monster_id = 1002,
                count = 3,
                level = 6,
                attr_scale = 1.15,
            },
        },
    },

    [15] = {
        id = 15,
        desc = "冰霜+暗影领主",
        monster_ids = {
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
            {
                monster_id = 1003,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [16] = {
        id = 16,
        desc = "混合军团",
        monster_ids = {
            {
                monster_id = 1001,
                count = 2,
                level = 5,
                attr_scale = 1.3,
            },
            {
                monster_id = 1002,
                count = 1,
                level = 8,
                attr_scale = 1.2,
            },
            {
                monster_id = 1004,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [17] = {
        id = 17,
        desc = "精英哥布林x5",
        monster_ids = {
            {
                monster_id = 1001,
                count = 5,
                level = 5,
                attr_scale = 1.2,
            },
        },
    },

    [18] = {
        id = 18,
        desc = "元素大军",
        monster_ids = {
            {
                monster_id = 1004,
                count = 3,
                level = 8,
                attr_scale = 1.2,
            },
        },
    },

    [19] = {
        id = 19,
        desc = "暗影护卫队",
        monster_ids = {
            {
                monster_id = 1002,
                count = 2,
                level = 10,
                attr_scale = 1.2,
            },
            {
                monster_id = 1003,
                count = 1,
                level = 0,
                attr_scale = 1.0,
            },
        },
    },

    [20] = {
        id = 20,
        desc = "最终Boss战",
        monster_ids = {
            {
                monster_id = 1003,
                count = 1,
                level = 15,
                attr_scale = 1.5,
            },
            {
                monster_id = 1002,
                count = 2,
                level = 12,
                attr_scale = 1.3,
            },
            {
                monster_id = 1004,
                count = 1,
                level = 10,
                attr_scale = 1.2,
            },
        },
    },

}

LOG_INFO(" 加载完成")

return M
