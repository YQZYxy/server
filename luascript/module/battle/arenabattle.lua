-- ====================================================================
--  竞技场战斗
-- ====================================================================

local GLO = GLO
local M = {}
local BattleModule = GLO.BattleModule
local Const = GLO.Const

local ArenaBattleModule = BattleModule.BattleModule:Extend("ArenaBattleModule")
M.ArenaBattleModule = ArenaBattleModule
GLO.BattleManager.RegisterBattleModule(Const.BattleType.ARENA, ArenaBattleModule)

function ArenaBattleModule:Ctor()
    self:CallSuper("Ctor")
    self.module_name = "竞技场"
    self.battle_type = Const.BattleType.ARENA
end

function ArenaBattleModule:BuildMatchParticipants(role, msg_data, match_index, total_matches)
    local atk_uid = role.uid
    local def_uid = msg_data.id or 0

    if atk_uid == def_uid then
        LOG_ERROR("竞技场: 不能挑战自己 uid=%d", atk_uid)
        return nil
    end

    local attacker = GLO.ArenaManager.GetArenaUser(atk_uid)
    local defender = GLO.ArenaManager.GetArenaUser(def_uid)
    if not attacker or not defender then
        LOG_ERROR("竞技场: 用户未注册 atk=%d def=%d", atk_uid, def_uid)
        return nil
    end
    if not attacker:CanChallenge() then
        LOG_WARN("竞技场: 挑战次数已用完 uid=%d", atk_uid)
        return nil
    end
    attacker:ConsumeChallenge()
    attacker.role_snapshot = GLO.RoleBattleSnapshot.Snapshot(role)

    local atk_heroes = GLO.RoleBattleSnapshot.CreateBattleHeroes(attacker.role_snapshot, Const.BattleType.ARENA)
    local def_heroes = GLO.RoleBattleSnapshot.CreateBattleHeroes(defender.role_snapshot, Const.BattleType.ARENA)
    if not atk_heroes or #atk_heroes == 0 or not def_heroes or #def_heroes == 0 then
        LOG_ERROR("竞技场: 英雄为空")
        return nil
    end

    local atk_name = attacker.name or "攻击方"
    local def_name = defender.name or "防守方"

    local atk_members = {}
    for _, h in ipairs(atk_heroes) do
        table.insert(atk_members, BattleModule.BuildProtoParticipant(h, atk_uid, atk_name, 1))
    end

    local def_members = {}
    for _, h in ipairs(def_heroes) do
        table.insert(def_members, BattleModule.BuildProtoParticipant(h, def_uid, def_name, 2))
    end

    LOG_INFO("竞技场PVP: %s(%d) vs %s(%d), 英雄=%d vs %d",
        atk_name, atk_uid, def_name, def_uid, #atk_members, #def_members)

    return { attacker_members = atk_members, defender_members = def_members }
end

-- 重写: 使用对手uid作为defender team_id
function ArenaBattleModule:BuildProtoReq(role, msg_data, participants)
    local req = self:CallSuper("BuildProtoReq", role, msg_data, participants)
    req.battle_req.teams[2].team_id = msg_data.id or 0
    req.battle_req.teams[2].team_name = "对手"
    return req
end

-- 战斗结果回调
function ArenaBattleModule:OnBattleResult(role, series, series_result)
    local def_uid = series.param_id or 0
    local report_key = (series.report_keys and series.report_keys[1]) or ""

    -- 调用 ArenaManager 处理
    GLO.ArenaManager.OnArenaBattleEnd(role.uid, def_uid, series_result, report_key)
end

LOG_INFO(" ArenaBattleModule 加载完成")
return M
