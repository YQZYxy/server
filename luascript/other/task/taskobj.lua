-- ====================================================================
-- 任务子任务匹配实现
-- 每种 obj_type 对应一个匹配处理器, 任务进度更新时由 task.lua 回调
-- 新增子任务类型只需要在本文件注册, 不用改动 task.lua
-- ====================================================================

local GLO = GLO
local M = {}

-- 注册全部子任务类型处理器
-- task Task 模块, 由 main.lua 在加载任务模块后调用
function M.Init(task)
    if not task then
        LOG_ERROR("TaskObj.Init: 任务模块未加载")
        return false
    end

    local TaskDef = GLO.TaskDef

    -- 消灭指定id敌人
    task.RegisterObjHandler(TaskDef.TaskObjType.KILL_MONSTER_ID, function(conditions, event_data)
        if not event_data.monster_id then
            return false
        end

        local target_monster_id = conditions[1]
        return target_monster_id == event_data.monster_id
    end)

    -- 收集指定id道具
    task.RegisterObjHandler(TaskDef.TaskObjType.COLLECT_ITEM_ID, function(conditions, event_data)
        if not event_data.item_id then
            return false
        end

        local target_item_id = conditions[1]
        return target_item_id == event_data.item_id
    end)

    -- 指定npcid对话
    task.RegisterObjHandler(TaskDef.TaskObjType.TALK_NPC_ID, function(conditions, event_data)
        if not event_data.npc_id then
            return false
        end

        local target_npc_id = conditions[1]
        return target_npc_id == event_data.npc_id
    end)

    -- 探索指定地图id和区域id
    task.RegisterObjHandler(TaskDef.TaskObjType.EXPLORE_ID, function(conditions, event_data)
        if not event_data.map_id or not event_data.zone_id then
            return false
        end

        local target_map_id = conditions[1]
        local target_zone_id = conditions[2]

        return target_map_id == event_data.map_id and target_zone_id == event_data.zone_id
    end)

    -- 使用指定id物品
    task.RegisterObjHandler(TaskDef.TaskObjType.USE_ITEM_ID, function(conditions, event_data)
        if not event_data.item_id then
            return false
        end

        local target_item_id = conditions[1]
        return target_item_id == event_data.item_id
    end)

    -- 消灭指定类型敌人
    task.RegisterObjHandler(TaskDef.TaskObjType.KILL_MONSTER_TYPE, function(conditions, event_data)
        if not event_data.monster_type then
            return false
        end

        local target_monster_type = conditions[1]
        return target_monster_type == event_data.monster_type
    end)

    -- 收集指定品质和类型道具
    task.RegisterObjHandler(TaskDef.TaskObjType.COLLECT_ITEM_QUALITY_TYPE, function(conditions, event_data)
        if not event_data.item_quality or not event_data.item_type then
            return false
        end

        local target_quality = conditions[1]
        local target_type = conditions[2]

        return target_quality == event_data.item_quality and target_type == event_data.item_type
    end)

    return true
end

LOG_INFO("TaskObj 加载完成")

return M
