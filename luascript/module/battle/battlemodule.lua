-- ====================================================================
--  回合战斗模块基类
-- ====================================================================

local GLO = GLO
local M = {}
local Protobuf = GLO.Protobuf
local Const = GLO.Const
local MHT = GLO.MHT

local BattleModule = GLO.Class:Extend('BattleModule')
M.BattleModule = BattleModule

function BattleModule:Ctor()
    self.module_name = 'SubBattleModule'
    self.battle_type = 0
end

function BattleModule:OnBattleReq(role, msg_data)
    if not msg_data then return false end

    LOG_INFO('========== %s 战斗请求 ==========', self.module_name)

    local participants = self:BuildParticipants(role, msg_data)
    if not participants then return false end

    local exec_req = self:BuildProtoReq(role, msg_data, participants)
    if not exec_req then return false end

    if not Protobuf.SendBattleMsg(role:GetNetid(), MHT.MHT_BATTLE_EXECUTE_REQ, exec_req) then
        LOG_ERROR('发送战斗请求失败: 无可用战斗服')
        return false
    end

    LOG_INFO('战斗已发送: %s, uid=%d', self.module_name, role.uid)
    return true
end

-- 战斗结果回调
function BattleModule:OnBattleResult(role, event)
    -- 默认空实现, 子类重写处理结算等
end

function BattleModule:BuildParticipants(role, msg_data)
    LOG_ERROR('BuildParticipants 需要被子类重写')
    return nil
end

function BattleModule:BuildProtoReq(role, msg_data, participants)
    local am = participants.attacker_members or {}
    local dm = participants.defender_members or {}
    return {
        uid = role.uid,
        battle_req = {
            battle_id = 0,
            mode = 1,   -- 回合制
            battle_type = self.battle_type,
            random_seed = math.random(1, 999999),
            rules = {
                victory_condition = Const.VictoryCondition.VICTORY_COND_DEFENDER_DEATH, -- 默认防守方全灭,进攻方胜利
                max_turns = 20,
                max_duration = 300,
                allow_flee = false,
                score_limit = 0,
                target_member_id = 0
            },
            teams = {
                {
                    team_id = role.uid,
                    team_name = role:GetName(),
                    side = Const.TeamSide.ATTACKER,
                    members = am
                },
                {
                    team_id = msg_data.id or -1,
                    team_name = '防守方',
                    side = Const.TeamSide.DEFENDER,
                    members = dm
                },
            },
            req_type = msg_data.req_type or 0,
            req_id = msg_data.id or 0,
        },
    }
end

function M.BuildProtoParticipant(entity, team_id, team_name, team_side)
    local attrs = {}
    if entity.attrs then
        for attr_id, val in pairs(entity.attrs) do
            if val and val ~= 0 then
                table.insert(attrs, {attr_id = attr_id, value = val})
            end
        end
    end
    local abilities = {}
    local entity_abs = entity:GetAbilities()
    if entity_abs then
        for _, ab in pairs(entity_abs) do
            table.insert(abilities, { ability_id = ab.id, level = ab.level or 1 })
        end
    end
    return {
        player_id = entity.player_id or 0,
        player_type = entity.player_type or Const.PlayerType.NONE,
        name = entity.name or 'Unknown',
        level = entity.level or 1,
        team_id = team_id,
        team_name = team_name, 
        side = team_side,
        initial_attrs = attrs,
        abilities = abilities,
        init_tags = {},
    }
end

LOG_INFO(' BattleModule 加载完成')
return M
