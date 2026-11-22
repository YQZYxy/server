-- ====================================================================
-- 任务进度事件
-- ====================================================================

local GLO = GLO
local M = {}

-- 从事件对象解析出在线角色
-- 战斗单位中 Hero 需要通过 owner_role 关联角色, 快照战斗中的 Hero 没有 owner_role
local function ResolveRole(unit)
    if not unit then
        return nil
    end

    local role = unit.owner_role or unit
    if type(role) == "table" and role.uid and role.uid > 0 then
        return role
    end
    return nil
end

-- 注册全部任务进度事件源
function M.Init(task)
    if not task then
        LOG_ERROR("TaskEvent.Init: 任务模块未加载")
        return false
    end

    local EventManager = GLO.EventManager

    -- 物品获取事件
    EventManager.RegisterListener(EventManager.lua_OnAddItem, function(event_data)
        local role = ResolveRole(event_data.role)
        local item_id = event_data.item_id
        local num = event_data.num or 1

        if role and item_id then
            local item_config = GLO.Item.GetItemConfig(item_id)
            if item_config then
                task.UpdateTaskByEvent(role, {
                    item_id = item_id,
                    item_type = item_config.type,
                    item_quality = item_config.quality,
                    num = num
                })
            end
        end
    end)

    -- 怪物死亡事件(击杀怪物)
    EventManager.RegisterListener(EventManager.lua_OnPlayerDeath, function(event_data)
        local player = event_data.player
        local killer = event_data.killer

        if killer and player and player.monster_type and not killer.monster_type then
            local role = ResolveRole(killer)
            if role then
                task.UpdateTaskByEvent(role, {
                    monster_id = player.monster_id,
                    monster_level = player.level,
                    monster_type = player.type
                })
            end
        end
    end)

    -- 战斗结束事件
    EventManager.RegisterListener(EventManager.lua_OnBattleEnd, function(event_data)
        local battle = event_data.battle
        local winner = event_data.winner

        if not battle or not winner then
            return
        end

        local loser_team = (winner == battle.team1) and battle.team2 or battle.team1

        if loser_team and loser_team.members then
            for _, loser in ipairs(loser_team.members) do
                if loser.monster_id then
                    local kill_event = {
                        monster_id = loser.monster_id,
                        monster_level = loser.level,
                        monster_type = loser.type
                    }

                    if winner.members then
                        for _, member in ipairs(winner.members) do
                            local role = ResolveRole(member)
                            if role then
                                task.UpdateTaskByEvent(role, kill_event)
                            end
                        end
                    end
                end
            end
        end
    end)

    -- NPC对话事件
    EventManager.RegisterListener(EventManager.lua_OnNPCTalk, function(event_data)
        local role = ResolveRole(event_data.role)
        local npc_id = event_data.npc_id

        if role and npc_id then
            task.UpdateTaskByEvent(role, {
                npc_id = npc_id
            })
        end
    end)

    -- 探索事件
    EventManager.RegisterListener(EventManager.lua_OnZoneEnter, function(event_data)
        local role = ResolveRole(event_data.role)
        local map_id = event_data.map_id
        local zone_id = event_data.zone_id

        if role then
            task.UpdateTaskByEvent(role, {
                map_id = map_id,
                zone_id = zone_id
            })
        end
    end)

    -- 物品使用事件
    EventManager.RegisterListener(EventManager.lua_OnUseItem, function(event_data)
        local role = ResolveRole(event_data.role)
        local item_id = event_data.item_id

        if role and item_id then
            task.UpdateTaskByEvent(role, {
                item_id = item_id
            })
        end
    end)

    return true
end

LOG_INFO("TaskEvent 加载完成")

return M
