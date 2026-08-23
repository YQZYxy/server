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

    -- 单场与多场统一: 单场 = 总场次1的系列, 按场次逐场构建并发送
    local total_matches = self:GetMatchCount(role, msg_data) or 1
    for match_index = 1, total_matches do
        local participants = self:BuildMatchParticipants(role, msg_data, match_index, total_matches)
        if not participants then
            LOG_ERROR('第%d场参与者构建失败: uid=%d', match_index, role.uid)
            return false
        end

        local exec_req = self:BuildProtoReq(role, msg_data, participants, match_index, total_matches)
        if not exec_req then
            LOG_ERROR('第%d场请求构建失败: uid=%d', match_index, role.uid)
            return false
        end

        -- 统一透传场次上下文
        exec_req.match_index = match_index
        exec_req.total_matches = total_matches

        local encoded = Protobuf.Encode(exec_req, "PB_BattleExecuteReq")
        if not encoded or not cpp_ExecuteBattle(role:GetNetid(), encoded) then
            LOG_ERROR('第%d场发送失败: uid=%d', match_index, role.uid)
            return false
        end
    end

    LOG_INFO('战斗已发送: %s, uid=%d, total=%d', self.module_name, role.uid, total_matches)
    return true
end

-- ==================== 系列战斗(nvn多场1v1) ====================

-- 系列战斗场次数, 子类可重写(例如按阵容槽位数返回)
function BattleModule:GetMatchCount(role, msg_data)
    return 1
end

-- 构建第match_index场参战双方(多场战斗每场独立构建, 子类必须重写)
function BattleModule:BuildMatchParticipants(role, msg_data, match_index, total_matches)
    LOG_ERROR('BuildMatchParticipants 需要被子类重写: %s', self.module_name)
    return nil
end

-- 战斗总结果回调
-- @param series: 系列聚合数据 {battle_type, param_id, total, win, lose, match_results, report_keys}
-- @param series_result: Const.BattleResultType 总胜负
function BattleModule:OnBattleResult(role, series, series_result)
    -- 默认空实现, 子类重写处理系列奖励
end

function BattleModule:BuildProtoReq(role, msg_data, participants, match_index, total_matches)
    local am = participants.attacker_members or {}
    local dm = participants.defender_members or {}
    local exec_req = {
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
    return exec_req
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
