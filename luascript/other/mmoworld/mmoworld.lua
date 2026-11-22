-- ====================================================================
--  MMO 世界
-- ====================================================================

local GLO = GLO
local M = {}

local EventManager = GLO.EventManager
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT

-- 本服场景id, 与 mapconfig 的 map_id 一一对应(2 = 本服 30x30 小地图)
-- 场景服上的跨服场景id由进场快照决定, 客户端不可指定
local LOCAL_SCENE_ID = 2

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

-- 与 C++ MMO_EVENT 保持一致
local EVENT_ENTER = 1
local EVENT_LEAVE = 2
local EVENT_MOVE = 3
local EVENT_DAMAGE = 4
local EVENT_DEAD = 5
local EVENT_REVIVE = 6
local EVENT_SETTLE = 7

-- 移动速度(世界单位/秒), 与客户端 5格/秒 x 32 一致
local DEFAULT_MOVE_SPEED = 160.0
-- 实体类型: 1=玩家
local ENTITY_TYPE_PLAYER = 1

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

-- 通过实体id找角色uid
local function GetOwnerUid(obj_id)
    return MmoWorld.GetOwnerUid(obj_id)
end

-- 组装出战英雄数据(含实时算好的属性), 供进场与跨服共用
local function BuildMmoHero(role)
    local base_info = GLO.RoleData.GetBaseInfo(role.uid)
    if not base_info then
        LOG_ERROR("MMO取角色基础数据失败 uid:" .. tostring(role.uid))
        return nil
    end

    local snapshot = GLO.RoleBattleSnapshot.SnapshotRef(role)
    if not snapshot then
        LOG_ERROR("MMO取角色战斗快照失败 uid:" .. tostring(role.uid))
        return nil
    end

    local hero_id = base_info.hero_id
    if not hero_id or hero_id <= 0 then
        local hero_ids = GLO.RoleBattleSnapshot.GetLineupHeroIds(snapshot,
            GLO.BattleDef.BattleType.MAIN_BATTLE, 0)
        if not hero_ids or #hero_ids == 0 then
            LOG_ERROR("MMO绑定出战英雄失败, 主战阵容为空 uid:" .. tostring(role.uid))
            return nil
        end
        hero_id = hero_ids[1]
        base_info.hero_id = hero_id
        LOG_INFO("角色 %d 首次绑定MMO出战英雄 hero_id:%d", role.uid, hero_id)
    end

    local hero_data = GLO.RoleBattleSnapshot.FindHero(snapshot, hero_id)
    if not hero_data then
        LOG_ERROR("MMO出战英雄不在角色数据中 uid:" .. tostring(role.uid)
            .. " hero_id:" .. tostring(hero_id))
        return nil
    end
    if not hero_data.level or hero_data.level <= 0 then
        LOG_ERROR("MMO出战英雄等级无效 uid:" .. tostring(role.uid)
            .. " hero_id:" .. tostring(hero_id))
        return nil
    end

    local attrs = GLO.Hero.GetAttrsAndPower(snapshot, hero_id)
    local attr_pairs = {}
    for attr_id, value in pairs(attrs) do
        attr_pairs[#attr_pairs + 1] = { attr_id = attr_id, value = value }
    end
    if #attr_pairs == 0 then
        LOG_ERROR("MMO出战英雄属性为空 uid:" .. tostring(role.uid)
            .. " hero_id:" .. tostring(hero_id))
        return nil
    end

    local ability_ids = {}
    if hero_data.abilities and hero_data.abilities.ability_ids then
        for _, ability_id in ipairs(hero_data.abilities.ability_ids) do
            ability_ids[#ability_ids + 1] = ability_id
        end
    end

    return {
        hero_id = hero_id,
        level = hero_data.level,
        exp = hero_data.exp,
        attrs = attr_pairs,
        ability_ids = ability_ids,
    }
end

-- 取进场位置: 同一场景优先用上次存档, 否则用客户端上报的首次位置
local function GetEnterPosition(role, scene_id, msg_data)
    local mmo_data = GLO.RoleData.GetMmo(role.uid)
    if mmo_data and mmo_data.scene_id == scene_id
        and mmo_data.x and mmo_data.y and mmo_data.z then
        return mmo_data.x, mmo_data.y, mmo_data.z
    end
    return msg_data.x, msg_data.y, msg_data.z
end

-- 离开场景时把最后位置写进角色数据
local function SaveMmoPosition(event_data)
    local uid = event_data.role_uid
    if not uid then
        return
    end
    -- 跨服场景服上的角色是临时数据, 位置由归属服结算时合并
    if cpp_IsCrossRole(uid) then
        return
    end
    local mmo_data = GLO.RoleData.GetMmo(uid)
    if not mmo_data then
        LOG_ERROR("MMO离场保存失败, 取不到角色MMO数据 uid:" .. tostring(uid))
        return
    end
    mmo_data.scene_id = event_data.scene_id
    mmo_data.x = event_data.x
    mmo_data.y = event_data.y
    mmo_data.z = event_data.z
end

local function OnMmoEvent(event_data)
    local event_type = event_data.event_type

    if event_type == EVENT_ENTER then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_ENTITY_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            obj_type = ENTITY_TYPE_PLAYER,
            role_name = event_data.role_name,
            level = event_data.level,
            hp = event_data.hp,
            max_hp = event_data.max_hp,
            dead = event_data.dead,
            x = event_data.x,
            y = event_data.y,
            z = event_data.z,
        })
    elseif event_type == EVENT_LEAVE then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_LEAVE_ENTITY_SC, {
            obj_id = event_data.obj_id,
        })
        -- 离场即存档位置, 下次进场原地恢复
        SaveMmoPosition(event_data)
    elseif event_type == EVENT_MOVE then
        SendToViewers(event_data, MHT.MHT_MMO_SYNC_MOVE_SC, {
            obj_id = event_data.obj_id,
            x = event_data.x,
            y = event_data.y,
            z = event_data.z,
        })
    elseif event_type == EVENT_DAMAGE then
        SendToViewers(event_data, MHT.MHT_MMO_DAMAGE_SC, {
            obj_id = event_data.obj_id,
            attacker_uid = event_data.target_uid,
            damage = event_data.value,
            hp = event_data.hp,
            dead = event_data.dead,
        })
    elseif event_type == EVENT_DEAD then
        SendToViewers(event_data, MHT.MHT_MMO_ROLE_STATE_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            hp = 0,
            max_hp = event_data.max_hp,
            dead = true,
            value = event_data.value,
        })
    elseif event_type == EVENT_REVIVE then
        SendToViewers(event_data, MHT.MHT_MMO_ROLE_STATE_SC, {
            obj_id = event_data.obj_id,
            owner_uid = event_data.role_uid,
            hp = event_data.hp,
            max_hp = event_data.max_hp,
            dead = false,
            value = event_data.value,
        })
    elseif event_type == EVENT_SETTLE then
        local role = GLO.RoleManager.GetRole(event_data.role_uid)
        if not role then
            LOG_ERROR("MMO结算失败, 角色不在线 uid:" .. tostring(event_data.role_uid))
            return
        end
        GLO.HeroModule.AddHeroExp(role, event_data.hero_id, event_data.value)
    end
end

local function OnEnterScene(netid, role, msg_data)
    if not role then
        LOG_WARN("MMO进入场景失败, 角色未绑定连接 netid:" .. tostring(netid))
        return
    end

    -- 场景id一律由服务端决定, 不信任客户端上报
    local scene_id
    local current = MmoWorld.GetRole(role.uid)
    if current and current.scene_id and current.scene_id > 0 then
        -- 已在场景里: 跨服角色按进场快照建好场景, 归属服角色在本地场景
        scene_id = current.scene_id
    elseif cpp_IsCrossRole(role.uid) then
        LOG_ERROR("跨服角色进入场景失败, 场景服没有该角色的场景数据 uid:" .. tostring(role.uid))
        return
    else
        scene_id = LOCAL_SCENE_ID
    end
    if scene_id == 0 then
        LOG_ERROR("MMO进入场景失败, 场景id无效 uid:" .. tostring(role.uid))
        return
    end

    -- 坐标缺失属于客户端协议错误
    if msg_data.x == nil or msg_data.y == nil or msg_data.z == nil then
        LOG_ERROR("MMO进入场景失败, 坐标缺失 uid:" .. tostring(role.uid))
        return
    end

    local hero = BuildMmoHero(role)
    if not hero and not cpp_IsCrossRole(role.uid) then
        return
    end

    -- 同一场景优先用上次存档位置
    local x, y, z = GetEnterPosition(role, scene_id, msg_data)

    local ok
    if hero then
        ok = MmoWorld.Enter({
            role_uid = role.uid,
            role_name = role:GetName(),
            scene_id = scene_id,
            x = x,
            y = y,
            z = z,
            hero = hero,
        })
    else
        -- 场景服的跨服角色没有本服阵容数据, 按进场快照重新进场以补发视野
        ok = cpp_CrossReenterWorld(role.uid)
        if ok then
            LOG_INFO("跨服角色按快照重新进场 uid:" .. tostring(role.uid))
        end
    end

    if not ok then
        LOG_ERROR("进入场景失败 uid:" .. tostring(role.uid))
        return
    end

    -- 回一份自己的真实状态
    local self_info = MmoWorld.GetRole(role.uid)
    if not self_info then
        LOG_ERROR("MMO进入场景后取不到角色状态 uid:" .. tostring(role.uid))
        return
    end
    Protobuf.SendMsgToUid(role.uid, MHT.MHT_MMO_ROLE_STATE_SC, {
        obj_id = MmoWorld.GetObjId(role.uid),
        owner_uid = role.uid,
        hp = self_info.hp,
        max_hp = self_info.max_hp,
        dead = false,
        value = 0,
    })
end

local function OnLeaveScene(netid, role, msg_data)
    if not role then
        return
    end
    MmoWorld.Leave(role.uid)
end

local function OnMove(netid, role, msg_data)
    if not role then
        return
    end
    if msg_data.x == nil or msg_data.y == nil or msg_data.z == nil then
        LOG_ERROR("MMO移动失败, 坐标缺失 uid:" .. tostring(role.uid))
        return
    end
    if not msg_data.speed or msg_data.speed <= 0 then
        LOG_ERROR("MMO移动失败, 速度无效 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.Move(role.uid, msg_data.x, msg_data.y, msg_data.z, msg_data.speed)
end

local function OnStopMove(netid, role, msg_data)
    if not role then
        return
    end
    if msg_data.x == nil or msg_data.y == nil or msg_data.z == nil then
        LOG_ERROR("MMO停止移动失败, 坐标缺失 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.Move(role.uid, msg_data.x, msg_data.y, msg_data.z, 0)
end

local function OnAttack(netid, role, msg_data)
    if not role then
        return
    end
    local target_uid = GetOwnerUid(msg_data.target_obj_id)
    if not target_uid or target_uid <= 0 then
        LOG_ERROR("MMO攻击失败, 目标不存在 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.Attack(role.uid, target_uid)
end

local function OnCastSkill(netid, role, msg_data)
    if not role then
        return
    end
    local target_uid = GetOwnerUid(msg_data.target_obj_id)
    if not target_uid or target_uid <= 0 then
        LOG_ERROR("MMO技能失败, 目标不存在 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.CastSkill(role.uid, msg_data.skill_id, target_uid)
end

-- 归属服: 客户端申请进入跨服玩法
local function OnCrossEnterRequest(netid, role, msg_data)
    if not role then
        LOG_WARN("跨服进场失败, 角色未绑定连接 netid:" .. tostring(netid))
        return
    end

    local hero = BuildMmoHero(role)
    if not hero then
        Protobuf.SendMsgToUid(role.uid, MHT.MHT_CROSS_ENTER_SC,
            { success = false, error = "出战英雄数据无效" })
        return
    end

    local cross_type = msg_data.cross_type
    if not cross_type or cross_type <= 0 then
        cross_type = 1
    end
    local activity_id = msg_data.activity_id or 0
    if activity_id <= 0 then
        activity_id = 1
    end

    LOG_INFO("申请进入跨服 uid:%d cross_type:%d activity:%d", role.uid, cross_type, activity_id)
    if not cpp_CrossApplyEnter(role.uid, cross_type, activity_id, hero) then
        Protobuf.SendMsgToUid(role.uid, MHT.MHT_CROSS_ENTER_SC,
            { success = false, error = "跨服申请失败" })
    end
end

-- 归属服: 跨服申请结果, 下发场景服地址与令牌给客户端
local function OnCrossEnterResult(event_data)
    local role_uid = event_data.role_uid
    if not role_uid or role_uid <= 0 then
        return
    end

    Protobuf.SendMsgToUid(role_uid, MHT.MHT_CROSS_ENTER_SC, {
        success = event_data.success == 1,
        error = event_data.error or "",
        scene_ip = event_data.scene_ip or "",
        scene_port = event_data.scene_port or 0,
        token = event_data.token or "",
        expire_time = event_data.expire_time or 0,
        cross_type = event_data.cross_type or 0,
    })
end

function M.Init()
    EventManager.RegisterListener(EventManager.cpp_OnMmoEvent, OnMmoEvent)
    EventManager.RegisterListener(EventManager.cpp_OnCrossEnterResult, OnCrossEnterResult)

    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_ENTER_SCENE_CS, OnEnterScene)
    GLO.MsgManager.RegisterMsg(MHT.MHT_CROSS_ENTER_CS, OnCrossEnterRequest)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_LEAVE_SCENE_CS, OnLeaveScene)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_MOVE_CS, OnMove)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_STOP_MOVE_CS, OnStopMove)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_ATTACK_CS, OnAttack)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_SKILL_CS, OnCastSkill)
    LOG_INFO("MMO 协议注册完成")
end

return M
