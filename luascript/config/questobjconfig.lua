-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  id - 目标ID (int)
  quest_id - 任务ID (int)
  obj_type - 类型 (int)
  required_count - 需求数量 (int)
  description - 描述 (string)
  conditions - obj_type对应多条件 ((array#sep=,),int)
--]]

local M = {
    [100100] = {
        id = 100100,
        quest_id = 1001,
        obj_type = 1,
        required_count = 10,
        description = "击败 10 只哥布林",
        conditions = { 1001, },
    },

    [100200] = {
        id = 100200,
        quest_id = 1002,
        obj_type = 2,
        required_count = 5,
        description = "采集 5 个魔法草药",
        conditions = { 4002, },
    },

    [100300] = {
        id = 100300,
        quest_id = 1003,
        obj_type = 1,
        required_count = 1,
        description = "击败 1 只精英巨魔",
        conditions = { 1002, },
    },

    [100400] = {
        id = 100400,
        quest_id = 1004,
        obj_type = 1,
        required_count = 5,
        description = "击败 5 只哥布林",
        conditions = { 1001, },
    },

    [100401] = {
        id = 100401,
        quest_id = 1004,
        obj_type = 1,
        required_count = 3,
        description = "击败 3 只精英巨魔",
        conditions = { 1002, },
    },

    [100402] = {
        id = 100402,
        quest_id = 1004,
        obj_type = 2,
        required_count = 3,
        description = "采集 3 个兽皮",
        conditions = { 4003, },
    },

    [100500] = {
        id = 100500,
        quest_id = 1005,
        obj_type = 1,
        required_count = 3,
        description = "击败 3 只哥布林",
        conditions = { 1001, },
    },

    [100700] = {
        id = 100700,
        quest_id = 1007,
        obj_type = 6,
        required_count = 5,
        description = "击败 5 只精英怪物",
        conditions = { 2, },
    },

    [100800] = {
        id = 100800,
        quest_id = 1008,
        obj_type = 7,
        required_count = 3,
        description = "收集 3 件稀有武器",
        conditions = { 4, 1, },
    },

    [100900] = {
        id = 100900,
        quest_id = 1009,
        obj_type = 3,
        required_count = 1,
        description = "与铁匠对话",
        conditions = { 2001, },
    },

    [100901] = {
        id = 100901,
        quest_id = 1009,
        obj_type = 3,
        required_count = 1,
        description = "与药剂师对话",
        conditions = { 2002, },
    },

    [101000] = {
        id = 101000,
        quest_id = 1010,
        obj_type = 4,
        required_count = 1,
        description = "探索黑暗森林深处",
        conditions = { 1001, 101, },
    },

}

LOG_INFO(" 加载完成")

return M
