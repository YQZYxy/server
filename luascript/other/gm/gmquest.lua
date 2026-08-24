-- ====================================================================
-- Quest GM测试指令
-- ====================================================================

local GLO = GLO
local M = {}
local Gm = GLO.Gm
local Role = GLO.Role
local Quest = GLO.Quest
local Item = GLO.Item
local Const = GLO.Const
local Utils = GLO.Utils
local RoleManager = GLO.RoleManager

-- 注册所有GM指令
function M.RegisterCommands()
    Gm.RegisterCommand("acceptquest", "接受任务", M.Cmd_AcceptQuest)
    
    Gm.RegisterCommand("turninquest", "提交任务", M.Cmd_TurnInQuest)
    
    Gm.RegisterCommand("abandonquest", "放弃任务", M.Cmd_AbandonQuest)
    
    Gm.RegisterCommand("completequest", "强制完成任务", M.Cmd_CompleteQuest)
    
    Gm.RegisterCommand("questlog", "打印任务日志", M.Cmd_PrintQuestLog)
    
    Gm.RegisterCommand("queststatus", "打印任务详情", M.Cmd_PrintQuestStatus)
    
    Gm.RegisterCommand("simcollect", "收集物品(更新任务进度)", M.Cmd_SimCollectItem)
    
    Gm.RegisterCommand("simtalk", "NPC对话(更新任务进度)", M.Cmd_SimTalkNpc)
    
    Gm.RegisterCommand("simexplore", "探索区域(更新任务进度)", M.Cmd_SimExplore)
    
    LOG_INFO("Quest GM指令注册完成")
end


-- 接受任务
function M.Cmd_AcceptQuest(args)
    if #args < 2 then
        return false,"用法: acceptquest <uid> <quest_id>"
    end
    
    local uid = tonumber(args[1])
    local quest_id = tonumber(args[2])
    
    if not quest_id then
        return false,"无效的任务ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local success = Quest.AcceptQuest(role, quest_id)
    return success,success and "接受任务成功" or "接受任务失败"
end

-- 提交任务
function M.Cmd_TurnInQuest(args)
    if #args < 2 then
        return false,"用法: turninquest <uid> <quest_id>"
    end
    
    local uid = tonumber(args[1])
    local quest_id = tonumber(args[2])
    
    if not quest_id then
        return false,"无效的任务ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local success = Quest.TurnInQuest(role, quest_id)
    return success, success and "提交任务成功" or "提交任务失败"
end

-- 放弃任务
function M.Cmd_AbandonQuest(args)
    if #args < 2 then
        return false,"用法: abandonquest <uid> <quest_id>"
    end
    
    local uid = tonumber(args[1])
    local quest_id = tonumber(args[2])
    
    if not quest_id then
        return false,"无效的任务ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local success = Quest.AbandonQuest(role, quest_id)
    return success, success and "放弃任务成功" or "放弃任务失败"
end

-- 强制完成任务
function M.Cmd_CompleteQuest(args)
    if #args < 2 then
        return false,"用法: completequest <uid> <quest_id>"
    end
    
    local uid = tonumber(args[1])
    local quest_id = tonumber(args[2])
    
    if not quest_id then
        return false,"无效的任务ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local save_data = Quest.GetQuestSaveData(role, quest_id)
    if not save_data then
        return false,"未找到该任务"
    end
    
    -- 强制完成所有目标
    local quest_config = Quest.GetQuestConfig(quest_id)
    if quest_config and quest_config.objectives then
        for i, obj_id in ipairs(quest_config.objectives) do
            local obj_config = Quest.GetQuestObjConfig(obj_id)
            if obj_config and save_data.objectives[i] then
                save_data.objectives[i].current_count = obj_config.required_count
                save_data.objectives[i].completed = true
            end
        end
    end
    
    save_data.status = Const.QuestStatus.COMPLETED
    save_data.complete_time = Utils.GetServerTime()
    
    return true,"任务强制完成"
end

-- 打印任务日志
function M.Cmd_PrintQuestLog(args)
    if #args < 1 then
        return false,"用法: questlog <uid>"
    end
    
    local uid = tonumber(args[1])
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    Quest.PrintQuestLog(role)
    return true
end

-- 打印任务详情
function M.Cmd_PrintQuestStatus(args)
    if #args < 2 then
        return false,"用法: queststatus <uid> <quest_id>"
    end
    
    local uid = tonumber(args[1])
    local quest_id = tonumber(args[2])
    
    if not quest_id then
        return false,"无效的任务ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    Quest.PrintQuestStatus(role, quest_id)
    return true
end

-- 收集物品
function M.Cmd_SimCollectItem(args)
    if #args < 2 then
        return false,"用法: simcollect <uid> <item_id> [count]"
    end
    
    local uid = tonumber(args[1])
    local item_id = tonumber(args[2])
    local count = tonumber(args[3]) or 1
    
    if not item_id then
        return false,"无效的物品ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local item_config = Item.GetItemConfig(item_id)
    if not item_config then
        return false,"未找到物品配置"
    end
    
    local item_event = {
        id = item_id,
        item_type = item_config.type,
        item_quality = item_config.quality,
        num = count
    }
    
    Quest.UpdateQuestByEvent(role, item_event)
    
    return true,string.format("收集物品: %s x%d", item_config.name, count)
end

-- NPC对话
function M.Cmd_SimTalkNpc(args)
    if #args < 2 then
        return false,"用法: simtalk <uid> <npc_id>"
    end
    
    local uid = tonumber(args[1])
    local npc_id = tonumber(args[2])
    
    if not npc_id then
        return false,"无效的NPC ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local talk_event = {
        npc_id = npc_id,
        num = 1
    }
    
    Quest.UpdateQuestByEvent(role, talk_event)
    
    return true,string.format("与NPC对话: ID=%d", npc_id)
end

-- 探索区域
function M.Cmd_SimExplore(args)
    if #args < 3 then
        return false,"用法: simexplore <uid> <map_id> <zone_id>"
    end
    
    local uid = tonumber(args[1])
    local map_id = tonumber(args[2])
    local zone_id = tonumber(args[3])
    
    if not map_id or not zone_id then
        return false,"无效的地图ID或区域ID"
    end
    
    local role = RoleManager.GetRole(uid)
    if not role then
        return false,"未找到角色 UID: " .. tostring(uid)
    end
    
    local explore_event = {
        map_id = map_id,
        zone_id = zone_id,
        num = 1
    }
    
    Quest.UpdateQuestByEvent(role, explore_event)
    
    return true,string.format("探索区域: 地图=%d 区域=%d", map_id, zone_id)
end

-- 注册Quest GM指令
M.RegisterCommands()
return M