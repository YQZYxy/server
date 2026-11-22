-- ====================================================================
-- 任务相关常量定义
-- ====================================================================

local M = {}

-- 任务类型
M.TaskType = {
    NONE = 0,       -- 无任务
    KILL = 1,       -- 消灭敌人
    COLLECT = 2,    -- 收集物品
    TALK = 3,       -- 对话
    EXPLORE = 4,    -- 探索
    USE_ITEM = 5    -- 使用物品
}

-- 子任务类型
M.TaskObjType = {
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
M.TaskStatus = {
    NOT_STARTED = 0,    -- 未开始
    IN_PROGRESS = 1,    -- 进行中
    COMPLETED = 2,      -- 已完成
    FAILED = 3,         -- 失败
    TURNED_IN = 4       -- 已提交
}

-- 任务增减类型
M.TaskAddType = {
    NONE = 0,        -- 无
    ADD = 1,         -- 增加
    REMOVE = 2,      -- 移除
}

return M
