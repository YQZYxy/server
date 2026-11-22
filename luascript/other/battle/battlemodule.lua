-- ====================================================================
--  回合战斗模块基类
-- ====================================================================

local GLO = GLO
local M = {}
local Protobuf = GLO.Protobuf
local BattleDef = GLO.BattleDef
local PlayerDef = GLO.PlayerDef
local MHT = GLO.MHT

local BattleModule = GLO.Class:Extend('BattleModule')
M.BattleModule = BattleModule

function BattleModule:Ctor()
    self.module_name = 'SubBattleModule'
    self.battle_type = 0
end

function BattleModule:OnBattleReq(role, msg_data)
    if not msg_data then return false end

    -- 单场与多场统一: 单场 = 总场次1的系列, 按场次逐场构建并发送
    local total_matches = self:GetMatchCount(role, msg_data)
    if not total_matches or total_matches <= 0 then
        LOG_ERROR('战斗场次无效: uid=%d total=%s', role.uid, tostring(total_matches))
        return false
    end
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
        if not encoded or not cpp_ExecuteBattle(role.uid, encoded) then
            LOG_ERROR('第%d场发送失败: uid=%d', match_index, role.uid)
            return false
        end
    end

    LOG_INFO('战斗请求: %s, uid=%d, total=%d', self.module_name, role.uid, total_matches)
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
-- @param series: 系列聚合数据 {battle_type, target_id, total, win, lose, match_results, report_keys}
-- @param series_result: BattleDef.BattleResultType 总胜负
function BattleModule:OnBattleResult(role, series, series_result)
    -- 默认空实现, 子类重写处理系列奖励
end

function BattleModule:BuildProtoReq(role, msg_data, participants, match_index, total_matches)
    local am = participants.attacker_members
    local dm = participants.defender_members
    if not am or not dm then
        LOG_ERROR('战斗参与者缺失: uid=%d', role.uid)
        return nil
    end
    local target_id = msg_data.target_id
    local exec_req = {
        uid = role.uid,
        battle_req = {
            battle_id = 0,
            mode = 1,   -- 回合制
            battle_type = self.battle_type,
            target_id = target_id,
            random_seed = math.random(1, 999999),
            rules = {
                victory_condition = BattleDef.VictoryCondition.VICTORY_COND_DEFENDER_DEATH, -- 默认防守方全灭,进攻方胜利
                max_turns = 20,
                max_duration_sec = 300,
                allow_flee = false,
                score_limit = 0,
                target_member_id = 0
            },
            teams = {
                {
                    team_id = role.uid,
                    team_name = role:GetName(),
                    side = BattleDef.TeamSide.ATTACKER,
                    members = am
                },
                {
                    team_id = target_id,
                    team_name = '防守方',
                    side = BattleDef.TeamSide.DEFENDER,
                    members = dm
                },
            },
        },
    }
    return exec_req
end

function M.BuildProtoParticipant(entity)
    local attrs = {}
    for attr_id, val in pairs(entity.attrs) do
        if val and val ~= 0 then
            table.insert(attrs, {attr_id = attr_id, value = val})
        end
    end
    local abilities = {}
    local entity_abs = entity:GetAbilities()
    if entity_abs then
        for _, ab in pairs(entity_abs) do
            if not ab.level or ab.level <= 0 then
                LOG_ERROR('战斗能力等级无效 ability_id=%s', tostring(ab.ability_id))
                return nil
            end
            table.insert(abilities, { ability_id = ab.ability_id, level = ab.level })
        end
    end
    if not entity.level or entity.level <= 0 then
        LOG_ERROR('战斗参与者等级无效 name=%s', tostring(entity.name))
        return nil
    end
    return {
        obj_id = entity.obj_id,
        obj_type = entity.obj_type,
        name = entity.name,
        level = entity.level,
        attrs = attrs,
        abilities = abilities,
        tags = {},
    }
end

LOG_INFO(' BattleModule 加载完成')
return M
