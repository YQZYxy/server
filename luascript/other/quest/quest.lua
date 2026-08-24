-- 任务模块
-- 管理任务系统和玩家任务追踪
local GLO = GLO 
local Const = GLO.Const
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT

local LOC = {}

local M = {}


-- 角色登录事件
GLO.EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid
    local netid = event_data.netid

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        return
    end

    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        LOG_ERROR("获取任务数据失败 uid:" .. tostring(role.uid))
        return
    end

    -- 构建任务协议数据
    local active_quests = {}
    for quest_id, save_data in pairs(quest_data.active_quests or {}) do
        local objectives = {}
        for _, obj_data in ipairs(save_data.objectives or {}) do
            table.insert(objectives, {
                current_count = obj_data.current_count,
                completed = obj_data.completed
            })
        end
        active_quests[quest_id] = {
            status = save_data.status,
            start_time = save_data.start_time or 0,
            complete_time = save_data.complete_time or 0,
            objectives = objectives
        }
    end

    -- 下发任务数据
    Protobuf.SendMsg(netid, MHT.MHT_SYNC_QUEST_DATA_SC,
    {
        quest_data = {
            max_active = quest_data.max_active,
            active_quests = active_quests,
            completed_quests = quest_data.completed_quests or {}
        }
    })
end)

-- ===============任务配置===================

-- 获取全局任务配置（只读）
function M.GetQuestGlobaConfig()
    return ConfigManager.questglobalconfig
end

-- 获取主任务配置（只读）
function M.GetQuestConfig(quest_id)
    local configs = ConfigManager.questconfig
    return configs[quest_id]
end

-- 获取目标任务配置（只读）
function M.GetQuestObjConfig(quest_obj_id)
    local configs = ConfigManager.questobjconfig
    return configs[quest_obj_id]
end

-- ==================== 获取角色数据 ==============================
function LOC.GetOrSetQuestData(role)
    if not role then
        LOG_ERROR("角色实例为空")
        return nil
    end
    
    local role_data = role:GetRoleData()
    if not role_data then
        LOG_ERROR("角色数据为空")
        return nil
    end
    local growth = role_data.growth
    
    -- 确保任务数据结构存在
    if not growth.quest then
        local global_config = M.GetQuestGlobaConfig()
        growth.quest = {
            max_active = (global_config and global_config.max_active_quests) or 10,
            active_quests = {},     -- {[quest_id] = {status, start_time, complete_time, objectives}}
            completed_quests = {}   -- {quest_id, ...}
        }
    end
    
    return growth.quest
end

-- ==================== 公共接口 ==============================

-- 初始化任务系统（在角色创建或加载时调用）
function M.InitQuest(role)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return false
    end
    
    -- 验证已有任务数据
    local valid_count = 0
    for quest_id, save_data in pairs(quest_data.active_quests) do
        local quest_config = M.GetQuestConfig(quest_id)
        if quest_config then
            valid_count = valid_count + 1
        else
            LOG_WARN("无法找到任务配置 ID: " .. tostring(quest_id))
            quest_data.active_quests[quest_id] = nil
        end
    end
    
    LOG_INFO("初始化任务系统: %s (%d 个进行中的任务，已完成 %d 个)", 
        role.name, 
        valid_count,
        #quest_data.completed_quests)
    
    return true
end

-- 接受任务
function M.AcceptQuest(role, quest_id)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return false
    end
    
    -- 检查是否已达上限
    local active_count = 0
    for _ in pairs(quest_data.active_quests) do
        active_count = active_count + 1
    end
    
    if active_count >= quest_data.max_active then
        LOG_INFO("❌ 已达到任务接取上限! (" .. tostring(quest_data.max_active) .. ")")
        return false
    end
    
    -- 检查是否已接取
    if quest_data.active_quests[quest_id] then
        LOG_INFO("❌ 已经接取了该任务")
        return false
    end
    
    -- 获取任务配置
    local quest_config = M.GetQuestConfig(quest_id)
    if not quest_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(quest_id))
        return false
    end
    
    -- 检查等级要求
    if role.level < quest_config.required_level then
        LOG_INFO("无法接受任务: 等级不足 (需要 Lv." .. tostring(quest_config.required_level) .. ")")
        return false
    end
    
    -- 初始化任务进度数据
    local objectives_data = {}
    if quest_config.objectives then
        for i, obj_id in ipairs(quest_config.objectives) do
            local obj_config = M.GetQuestObjConfig(obj_id)
            if obj_config then
                objectives_data[i] = {
                    current_count = 0,
                    completed = false
                }
            else
                LOG_WARN("未找到子任务配置 ID:" .. tostring(obj_id))
            end
        end
    end
    
    -- 保存任务数据
    quest_data.active_quests[quest_id] = {
        status = Const.QuestStatus.IN_PROGRESS,
        start_time = Utils.GetServerTime(),
        complete_time = 0,
        objectives = objectives_data
    }
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("📜 接受任务: " .. quest_config.name)
    LOG_INFO(quest_config.description)
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("📋 任务目标:")
    
    if quest_config.objectives then
        for i, obj_id in ipairs(quest_config.objectives) do
            local obj_config = M.GetQuestObjConfig(obj_id)
            if obj_config then
                LOG_INFO("  " .. tostring(i) .. ". " .. obj_config.description .. 
                    " (0/" .. tostring(obj_config.required_count) .. ")")
            end
        end
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    -- 触发事件
    EventManager.TriggerEvent(EventManager.lua_OnQuestAccepted, {
        role = role,
        quest_id = quest_id,
        quest_name = quest_config.name
    })
    
    return true
end


-- ================目标匹配函数==============================
local OBJ_TYPE_FUNC = {}
-- 子任务类型 1: 消灭指定id敌人
OBJ_TYPE_FUNC[Const.QuestObjType.KILL_MONSTER_ID] = function(conditions, event_data)
    if not event_data.monster_id then
        return false
    end
    
    local target_monster_id = conditions[1]
    return target_monster_id == event_data.monster_id
end

-- 子任务类型 2: 收集指定id道具
OBJ_TYPE_FUNC[Const.QuestObjType.COLLECT_ITEM_ID] = function(conditions, event_data)
    if not event_data.id then
        return false
    end
    
    local target_item_id = conditions[1]
    return target_item_id == event_data.id
end

-- 子任务类型 3: 指定npcid对话
OBJ_TYPE_FUNC[Const.QuestObjType.TALK_NPC_ID] = function(conditions, event_data)
    if not event_data.npc_id then
        return false
    end
    
    local target_npc_id = conditions[1]
    return target_npc_id == event_data.npc_id
end

-- 子任务类型 4: 探索指定地图id和区域id
OBJ_TYPE_FUNC[Const.QuestObjType.EXPLORE_ID] = function(conditions, event_data)
    if not event_data.map_id or not event_data.zone_id then
        return false
    end
    
    local target_map_id = conditions[1]
    local target_zone_id = conditions[2]
    
    return target_map_id == event_data.map_id and target_zone_id == event_data.zone_id
end

-- 子任务类型 5: 使用指定id物品
OBJ_TYPE_FUNC[Const.QuestObjType.USE_ITEM_ID] = function(conditions, event_data)
    if not event_data.id then
        return false
    end
    
    local target_item_id = conditions[1]
    return target_item_id == event_data.id
end

-- 子任务类型 6: 消灭指定类型敌人
OBJ_TYPE_FUNC[Const.QuestObjType.KILL_MONSTER_TYPE] = function(conditions, event_data)
    if not event_data.monster_type then
        return false
    end
    
    local target_monster_type = conditions[1]
    return target_monster_type == event_data.monster_type
end

-- 子任务类型 7: 收集指定品质和类型道具
OBJ_TYPE_FUNC[Const.QuestObjType.COLLECT_ITEM_QUALITY_TYPE] = function(conditions, event_data)
    if not event_data.item_quality or not event_data.item_type then
        return false
    end
    
    local target_quality = conditions[1]
    local target_type = conditions[2]
    
    return target_quality == event_data.item_quality and target_type == event_data.item_type
end


-- ==================== 任务进度更新接口 ==============================
function M.UpdateQuestByEvent(role, event_data)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return
    end

    local progress = event_data.num or 1
    local add_type = event_data.add_type or Const.QuestAddType.ADD  -- 默认增加
    
    for quest_id, save_data in pairs(quest_data.active_quests) do
        if save_data.status == Const.QuestStatus.IN_PROGRESS then
            local quest_config = M.GetQuestConfig(quest_id)
            if not quest_config then
                LOG_WARN("未找到任务配置 ID: " .. tostring(quest_id))
                goto continue
            end
            
            local updated = false

            if quest_config.objectives then
                for i, obj_id in ipairs(quest_config.objectives) do
                    local obj_config = M.GetQuestObjConfig(obj_id)
                    if obj_config and save_data.objectives[i] then
                        local obj_data = save_data.objectives[i]
                        
                        if not obj_data.completed then
                            local match_func = OBJ_TYPE_FUNC[obj_config.obj_type]
                            
                            if match_func then
                                if match_func(obj_config.conditions or {}, event_data) then

                                    if Const.QuestAddType.ADD == add_type then
                                        obj_data.current_count = math.max(obj_data.current_count, obj_data.current_count + progress)
                                    elseif Const.QuestAddType.REMOVE == add_type then
                                        obj_data.current_count = math.max(obj_data.current_count, progress)
                                    end
                                    
                                    if obj_data.current_count >= obj_config.required_count then
                                        obj_data.current_count = obj_config.required_count
                                        obj_data.completed = true
                                        
                                        LOG_INFO("✅ 任务目标完成: " .. obj_config.description)
                                    else
                                        LOG_INFO("📝 任务进度更新: " .. obj_config.description .. 
                                            " (" .. tostring(obj_data.current_count) .. "/" .. tostring(obj_config.required_count) .. ")")
                                    end
                                    
                                    updated = true
                                end
                            end
                        end
                    end
                end
            end
            
            if updated then
                -- 检查是否完成
                local all_completed = true
                for i, obj_data in pairs(save_data.objectives) do
                    if not obj_data.completed then
                        all_completed = false
                        break
                    end
                end
                
                if all_completed then
                    save_data.status = Const.QuestStatus.COMPLETED
                    save_data.complete_time = Utils.GetServerTime()
                    
                    LOG_INFO("★★★ 任务完成: " .. quest_config.name .. " ★★★")
                    
                    EventManager.TriggerEvent(EventManager.lua_OnQuestCompleted, {
                        role = role,
                        quest_id = quest_id,
                        quest_name = quest_config.name
                    })
                end
            end
        end
        
        ::continue::
    end
end

-- 提交任务
function M.TurnInQuest(role, quest_id)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return false
    end
    
    local save_data = quest_data.active_quests[quest_id]
    if not save_data then
        LOG_INFO("未找到该任务")
        return false
    end
    
    if save_data.status ~= Const.QuestStatus.COMPLETED then
        LOG_INFO("任务尚未完成")
        return false
    end
    
    local quest_config = M.GetQuestConfig(quest_id)
    if not quest_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(quest_id))
        return false
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("🎉 提交任务: " .. quest_config.name)
    
    -- 发放奖励
    if quest_config.reward_items and #quest_config.reward_items > 0 then
        LOG_INFO("  🎁 物品奖励:")
        for _, item_data in ipairs(quest_config.reward_items) do
            local id = item_data.id
            local num = item_data.num or 1
            GLO.Inventory.AddItem(role, id, num)
            
            local item_config = GLO.Item.GetItemConfig(id)
            if item_config then
                LOG_INFO("    - " .. item_config.name .. " x" .. tostring(num))
            end
        end
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    save_data.status = Const.QuestStatus.TURNED_IN
    
    -- 移动到完成列表
    quest_data.active_quests[quest_id] = nil
    table.insert(quest_data.completed_quests, quest_id)
    
    -- 触发事件
    EventManager.TriggerEvent(EventManager.lua_OnQuestTurnedIn, {
        role = role,
        quest_id = quest_id,
        quest_name = quest_config.name
    })
    
    return true
end

-- 放弃任务
function M.AbandonQuest(role, quest_id)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return false
    end
    
    local save_data = quest_data.active_quests[quest_id]
    if not save_data then
        LOG_INFO("未找到该任务")
        return false
    end
    
    if save_data.status ~= Const.QuestStatus.IN_PROGRESS then
        LOG_INFO("任务无法放弃")
        return false
    end
    
    local quest_config = M.GetQuestConfig(quest_id)
    local quest_name = quest_config and quest_config.name or "未知任务"
    
    -- 从数据中移除
    quest_data.active_quests[quest_id] = nil
    
    LOG_INFO("❌ 放弃任务: " .. quest_name)
    
    return true
end

-- 检查是否有任务
function M.HasQuest(role, quest_id)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return false
    end
    
    return quest_data.active_quests[quest_id] ~= nil
end

-- 获取任务保存数据
function M.GetQuestSaveData(role, quest_id)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return nil
    end
    
    return quest_data.active_quests[quest_id]
end

-- 获取所有激活任务
function M.GetActiveQuests(role)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return {}
    end
    
    local quests = {}
    
    for quest_id, save_data in pairs(quest_data.active_quests) do
        local quest_config = M.GetQuestConfig(quest_id)
        if quest_config then
            table.insert(quests, {
                quest_id = quest_id,
                quest_config = quest_config,
                save_data = save_data
            })
        end
    end
    
    return quests
end

-- 获取已完成任务数量
function M.GetCompletedQuestsCount(role)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return 0
    end
    
    return #quest_data.completed_quests
end

-- 获取任务进度
function M.GetQuestProgress(role, quest_id)
    local save_data = M.GetQuestSaveData(role, quest_id)
    if not save_data then
        return 0, 0
    end
    
    local completed = 0
    local total = 0
    
    for _, obj_data in pairs(save_data.objectives) do
        total = total + 1
        if obj_data.completed then
            completed = completed + 1
        end
    end
    
    return completed, total
end

-- 打印任务日志
function M.PrintQuestLog(role)
    local quest_data = LOC.GetOrSetQuestData(role)
    if not quest_data then
        return
    end
    
    local active_count = 0
    for _ in pairs(quest_data.active_quests) do
        active_count = active_count + 1
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("📖 " .. role.name .. " 的任务日志")
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("🔥 进行中: " .. tostring(active_count) .. "/" .. tostring(quest_data.max_active))
    
    if active_count > 0 then
        for quest_id, save_data in pairs(quest_data.active_quests) do
            local quest_config = M.GetQuestConfig(quest_id)
            if quest_config then
                local completed, total = M.GetQuestProgress(role, quest_id)
                local progress_bar = LOC.CreateProgressBar(completed, total, 10)
                LOG_INFO(quest_config.name .. " " .. progress_bar .. 
                    " (" .. tostring(completed) .. "/" .. tostring(total) .. ")")
            end
        end
    else
        LOG_INFO("  暂无进行中的任务")
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("✅ 已完成: " .. tostring(#quest_data.completed_quests))
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
end

-- 打印任务详情
function M.PrintQuestStatus(role, quest_id)
    local save_data = M.GetQuestSaveData(role, quest_id)
    if not save_data then
        LOG_INFO("未找到该任务")
        return
    end
    
    local quest_config = M.GetQuestConfig(quest_id)
    if not quest_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(quest_id))
        return
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("📜 任务: " .. quest_config.name)
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("状态: " .. LOC.GetQuestStatusName(save_data.status))
    LOG_INFO("等级: " .. tostring(quest_config.level))
    LOG_INFO("描述: " .. quest_config.description)
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    LOG_INFO("📋 任务目标:")
    
    if quest_config.objectives then
        for i, obj_id in ipairs(quest_config.objectives) do
            local obj_config = M.GetQuestObjConfig(obj_id)
            local obj_data = save_data.objectives[i]
            
            if obj_config and obj_data then
                local status_icon = obj_data.completed and "✅" or "⬜"
                LOG_INFO("  " .. status_icon .. " " .. obj_config.description .. 
                    " (" .. tostring(obj_data.current_count) .. "/" .. tostring(obj_config.required_count) .. ")")
            end
        end
    end
    
    LOG_INFO("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
end

-- =============辅助函数===================

function LOC.GetQuestStatusName(status)
    if status == Const.QuestStatus.NOT_STARTED then
        return "未开始"
    elseif status == Const.QuestStatus.IN_PROGRESS then
        return "进行中"
    elseif status == Const.QuestStatus.COMPLETED then
        return "已完成"
    elseif status == Const.QuestStatus.FAILED then
        return "已失败"
    elseif status == Const.QuestStatus.TURNED_IN then
        return "已提交"
    else
        return "未知"
    end
end

function LOC.CreateProgressBar(current, total, width)
    width = width or 10
    if total == 0 then
        return "[" .. string.rep("░", width) .. "]"
    end
    
    local filled = math.floor((current / total) * width)
    local empty = width - filled
    
    local bar = "["
    for i = 1, filled do
        bar = bar .. "█"
    end
    for i = 1, empty do
        bar = bar .. "░"
    end
    bar = bar .. "]"
    
    return bar
end

-- ================注册事件监听器==============================
-- 监听物品获取事件
EventManager.RegisterListener(EventManager.lua_OnAddItem, function(event_data)
    local role = event_data.role
    local item_id = event_data.id
    local num = event_data.num or 1

    if role and item_id then
        local item_config = GLO.Item.GetItemConfig(item_id)
        if item_config then
            local item_event = {
                id = item_id,
                item_type = item_config.type,
                item_quality = item_config.quality,
                num = num
            }

            M.UpdateQuestByEvent(role, item_event)
        end
    end
end)

-- 监听怪物死亡事件（击杀怪物）
EventManager.RegisterListener(EventManager.lua_OnPlayerDeath, function(event_data)
    local player = event_data.player
    local killer = event_data.killer

    if killer and player and player.monster_type and not killer.monster_type then
        -- 击杀者可能是Hero(携带owner_role)或普通Player
        local role = killer.owner_role or killer
        local kill_event = {
            monster_id = player.id,
            monster_level = player.level,
            monster_type = player.type
        }

        M.UpdateQuestByEvent(role, kill_event)
    end
end)

-- 监听战斗结束事件
EventManager.RegisterListener(EventManager.lua_OnBattleEnd, function(event_data)
    local battle = event_data.battle
    local winner = event_data.winner

    if not battle or not winner then
        return
    end

    local loser_team = (winner == battle.team1) and battle.team2 or battle.team1

    if loser_team and loser_team.members then
        for _, member in ipairs(loser_team.members) do
            if member.monster_id then
                local kill_event = {
                    monster_id = member.monster_id,
                    monster_level = member.level,
                    monster_type = member.type
                }

                if winner and winner.members then
                    for _, member in ipairs(winner.members) do
                        -- 可能是Hero(携带owner_role)或普通Player
                        local role = member.owner_role or member
                        M.UpdateQuestByEvent(role, kill_event)
                    end
                end
            end
        end
    end
end)

-- 监听NPC对话事件
EventManager.RegisterListener(EventManager.lua_OnNPCTalk, function(event_data)
    local role = event_data.role
    local npc_id = event_data.npc_id

    if role and npc_id then
        local talk_event = {
            npc_id = npc_id
        }

        M.UpdateQuestByEvent(role, talk_event)
    end
end)

-- 监听探索事件
EventManager.RegisterListener(EventManager.lua_OnZoneEnter, function(event_data)
    local role = event_data.role
    local map_id = event_data.map_id
    local zone_id = event_data.zone_id

    if role then
        local explore_event = {
            map_id = map_id,
            zone_id = zone_id
        }

        M.UpdateQuestByEvent(role, explore_event)
    end
end)

-- 监听物品使用事件
EventManager.RegisterListener(EventManager.lua_OnUseItem, function(event_data)
    local role = event_data.role
    local item_id = event_data.item_id

    if role and item_id then
        local use_event = {
            id = item_id
        }

        M.UpdateQuestByEvent(role, use_event)
    end
end)

LOG_INFO("Quest 加载完成")

return M