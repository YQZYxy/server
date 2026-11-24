-- ====================================================================
--  MMO 世界框架层
--  只做 C++ 世界绑定与视野事件到协议的同步
-- ====================================================================

local GLO = GLO
local M = {}

local EventManager = GLO.EventManager
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local MmoDef = GLO.MmoWorldDef

-- 用惰性调用, 因为本文件在 Lua 绑定注册之前就会被 main.lua 加载
local MmoWorld = {}

function MmoWorld.Enter(init_table)
    return cpp_MmoEnter(init_table)
end

function MmoWorld.Leave(role_uid)
    return cpp_MmoLeave(role_uid)
end

function MmoWorld.Move(role_uid, x, y, z, speed)
    return cpp_MmoMove(role_uid, x, y, z, speed)
end

function MmoWorld.Attack(role_uid, target_uid)
    return cpp_MmoAttack(role_uid, target_uid)
end

function MmoWorld.CastSkill(role_uid, skill_id, target_uid)
    return cpp_MmoCastSkill(role_uid, skill_id, target_uid)
end

function MmoWorld.Revive(role_uid, hp)
    return cpp_MmoRevive(role_uid, hp)
end

function MmoWorld.GetRole(role_uid)
    return cpp_MmoGetRole(role_uid)
end

function MmoWorld.GetSceneRoles(scene_id)
    return cpp_MmoGetSceneRoles(scene_id)
end

function MmoWorld.GetObjId(role_uid)
    return cpp_MmoGetObjId(role_uid)
end

function MmoWorld.GetOwnerUid(obj_id)
    return cpp_MmoGetOwnerUid(obj_id)
end

GLO.MmoWorld = MmoWorld

-- 按视野列表下发
local function SendToViewers(event_data, msg_type, body)
    local viewers = event_data.viewers
    if not viewers or viewers == "" then
        return
    end
    for uid_text in string.gmatch(viewers, "[^,]+") do
        local uid = tonumber(uid_text)
        if uid and uid > 0 then
            Protobuf.SendMsgToUid(uid, msg_type, body)
        end
    end
end

-- 视野内实体增删移动与状态变化同步给客户端
-- 离场存档与战斗结算属于业务, 由 mmoworldrole 处理
local function SyncMmoEvent(event_data)
    local event_type = event_data.event_type

    if event_type == MmoDef.EVENT_ENTER then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_ENTITY_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            obj_type = MmoDef.ENTITY_TYPE_PLAYER,
            role_name = event_data.role_name,
            level = event_data.level,
            hp = event_data.hp,
            max_hp = event_data.max_hp,
            dead = event_data.dead,
            pos = { x = event_data.x, y = event_data.y, z = event_data.z },
        })
    elseif event_type == MmoDef.EVENT_LEAVE then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_LEAVE_ENTITY_SC, {
            obj_id = event_data.obj_id,
        })
    elseif event_type == MmoDef.EVENT_LEAVE_VIEW then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_LEAVE_ENTITY_SC, {
            obj_id = event_data.obj_id,
        })
    elseif event_type == MmoDef.EVENT_MOVE then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_MOVE_SC, {
            obj_id = event_data.obj_id,
            pos = { x = event_data.x, y = event_data.y, z = event_data.z },
        })
    elseif event_type == MmoDef.EVENT_DAMAGE then
        SendToViewers(event_data, MHT.MHT_MMO_DAMAGE_SC, {
            obj_id = event_data.obj_id,
            attacker_uid = event_data.target_uid,
            damage = event_data.value,
            hp = event_data.hp,
            dead = event_data.dead,
        })
    elseif event_type == MmoDef.EVENT_DEAD then
        SendToViewers(event_data, MHT.MHT_MMO_ROLE_STATE_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            hp = 0,
            max_hp = event_data.max_hp,
            dead = true,
            value = event_data.value,
        })
    elseif event_type == MmoDef.EVENT_REVIVE then
        SendToViewers(event_data, MHT.MHT_MMO_ROLE_STATE_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            hp = event_data.hp,
            max_hp = event_data.max_hp,
            dead = false,
            value = event_data.value,
        })
    end
end

function M.Init()
    EventManager.RegisterListener(EventManager.cpp_OnMmoEvent, SyncMmoEvent)
    LOG_INFO("MMO 框架协议注册完成")
end

return M
