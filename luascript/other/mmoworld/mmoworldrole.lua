-- ====================================================================
--  MMO 角色
--  角色进出场/移动/攻击/技能/跨服申请以及位置存档等
-- ====================================================================

local GLO = GLO
local M = {}

local EventManager = GLO.EventManager
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local MmoDef = GLO.MmoWorldDef
local MmoWorld = GLO.MmoWorld

-- 本服场景id, 与 mapconfig 的 map_id 一一对应(2 = 本服 30x30 小地图)
-- 跨服上的跨服场景id由进场快照决定, 客户端不可指定
local LOCAL_SCENE_ID = 2

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
    local saved_pos = mmo_data and mmo_data.pos
    if mmo_data and mmo_data.scene_id == scene_id
        and saved_pos and saved_pos.x and saved_pos.y and saved_pos.z then
        return saved_pos.x, saved_pos.y, saved_pos.z
    end
    return msg_data.place.pos.x, msg_data.place.pos.y, msg_data.place.pos.z
end

-- 离开场景时把最后位置写进角色数据
local function SaveMmoPosition(event_data)
    local uid = event_data.role_uid
    if not uid or uid <= 0 then
        return
    end
    -- 跨服上的角色是临时数据, 位置由归属服结算时合并
    if cpp_IsCrossRole(uid) then
        return
    end
    local mmo_data = GLO.RoleData.GetMmo(uid)
    if not mmo_data then
        LOG_ERROR("MMO离场保存失败, 取不到角色MMO数据 uid:" .. tostring(uid))
        return
    end
    mmo_data.scene_id = event_data.scene_id
    mmo_data.pos = { x = event_data.x, y = event_data.y, z = event_data.z }
end

-- 离场存档位置与战斗结算加经验
local function OnRoleMmoEvent(event_data)
    local event_type = event_data.event_type

    if event_type == MmoDef.EVENT_LEAVE then
        -- 离场即存档位置, 下次进场原地恢复
        SaveMmoPosition(event_data)
    elseif event_type == MmoDef.EVENT_SETTLE then
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
    local scene_id = 0
    local x, y, z
    if cpp_IsCrossRole(role.uid) then
        -- 跨服: 场景与落点都用归属服进场时带来的会话信息
        local enter_info = cpp_CrossEnterInfo(role.uid)
        if not enter_info or enter_info.activity_id <= 0 then
            LOG_ERROR("跨服角色进入场景失败, 没有跨服会话信息 uid:" .. tostring(role.uid))
            return
        end
        scene_id = enter_info.activity_id
        x, y, z = enter_info.x, enter_info.y, enter_info.z
    else
        local current = MmoWorld.GetRole(role.uid)
        if current and current.scene_id and current.scene_id > 0 then
            -- 已在场景里: 沿用当前场景
            scene_id = current.scene_id
        else
            scene_id = LOCAL_SCENE_ID
        end

        -- 坐标缺失属于客户端协议错误
        local client_pos = msg_data.place and msg_data.place.pos
        if not client_pos or client_pos.x == nil or client_pos.y == nil or client_pos.z == nil then
            LOG_ERROR("MMO进入场景失败, 坐标缺失 uid:" .. tostring(role.uid))
            return
        end
        -- 同一场景优先用上次存档位置
        x, y, z = GetEnterPosition(role, scene_id, msg_data)
    end
    if scene_id == 0 then
        LOG_ERROR("MMO进入场景失败, 场景id无效 uid:" .. tostring(role.uid))
        return
    end

    local hero = BuildMmoHero(role)
    if not hero then
        LOG_ERROR("MMO进入场景失败, 出战英雄数据无效 uid:" .. tostring(role.uid))
        return
    end

    local ok = MmoWorld.Enter({
        role_uid = role.uid,
        role_name = role:GetName(),
        scene_id = scene_id,
        x = x,
        y = y,
        z = z,
        hero = hero,
    })

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
    local pos = msg_data.pos
    if not pos or pos.x == nil or pos.y == nil or pos.z == nil then
        LOG_ERROR("MMO移动失败, 坐标缺失 uid:" .. tostring(role.uid))
        return
    end
    if not msg_data.speed or msg_data.speed <= 0 then
        LOG_ERROR("MMO移动失败, 速度无效 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.Move(role.uid, pos.x, pos.y, pos.z, msg_data.speed)
end

local function OnStopMove(netid, role, msg_data)
    if not role then
        return
    end
    local pos = msg_data.pos
    if not pos or pos.x == nil or pos.y == nil or pos.z == nil then
        LOG_ERROR("MMO停止移动失败, 坐标缺失 uid:" .. tostring(role.uid))
        return
    end
    MmoWorld.Move(role.uid, pos.x, pos.y, pos.z, 0)
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

    local cross_type = msg_data.cross_type
    if not cross_type or cross_type <= 0 then
        cross_type = 1
    end
    local activity_id = msg_data.activity_id or 0
    if activity_id <= 0 then
        activity_id = 1
    end

    LOG_INFO("申请进入跨服 uid:%d cross_type:%d activity:%d", role.uid, cross_type, activity_id)
    if not cpp_CrossApplyEnter(role.uid, cross_type, activity_id) then
        Protobuf.SendMsgToUid(role.uid, MHT.MHT_CROSS_ENTER_SC,
            { success = false, error = "跨服申请失败" })
    end
end

-- 归属服: 跨服申请结果, 下发跨服地址与令牌给客户端
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
    EventManager.RegisterListener(EventManager.cpp_OnMmoEvent, OnRoleMmoEvent)
    EventManager.RegisterListener(EventManager.cpp_OnCrossEnterResult, OnCrossEnterResult)

    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_ENTER_SCENE_CS, OnEnterScene)
    GLO.MsgManager.RegisterMsg(MHT.MHT_CROSS_ENTER_CS, OnCrossEnterRequest)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_LEAVE_SCENE_CS, OnLeaveScene)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_MOVE_CS, OnMove)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_STOP_MOVE_CS, OnStopMove)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_ATTACK_CS, OnAttack)
    GLO.MsgManager.RegisterMsg(MHT.MHT_MMO_SKILL_CS, OnCastSkill)
    LOG_INFO("MMO 业务协议注册完成")
end

return M
