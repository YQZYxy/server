-- ====================================================================
--  主线战斗
-- ====================================================================

local GLO = GLO
local M = {}
local BattleModule = GLO.BattleModule
local BattleDef = GLO.BattleDef
local Utils = GLO.Utils
local HeroModule = GLO.HeroModule
local ConfigManager = GLO.ConfigManager
local MHT = GLO.MHT

local MainBattleModule = BattleModule.BattleModule:Extend("MainBattleModule")
M.MainBattleModule = MainBattleModule
GLO.BattleManager.RegisterBattleModule(BattleDef.BattleType.MAIN_BATTLE, MainBattleModule)

function MainBattleModule:Ctor()
    self:CallSuper("Ctor")
    self.module_name = "主线"
    self.battle_type = BattleDef.BattleType.MAIN_BATTLE
end

-- 构建参与者
function MainBattleModule:BuildMatchParticipants(role, msg_data, match_index, total_matches)
    local level_id = msg_data.target_id or 0
    local monster_entries = self:GetMonsterEntries(level_id, msg_data)

    local heroes = HeroModule.CreateBattleHeroes(role, BattleDef.BattleType.MAIN_BATTLE)
    if not heroes or #heroes == 0 then
        LOG_ERROR("创建战斗英雄失败 role=%s", role:GetName())
        return nil
    end

    local attacker = {}
    for _, hero in ipairs(heroes) do
        table.insert(attacker, BattleModule.BuildProtoParticipant(hero))
    end

    local defender = {}
    for _, entry in ipairs(monster_entries) do
        local monster = GLO.Monster.CreateMonster(entry.monster_id)
        if monster then
            if entry.level and entry.level > 0 then monster:SetLevel(entry.level) end
            if entry.attr_scale and entry.attr_scale ~= 1.0 then monster:ScaleAttributes(entry.attr_scale) end
            table.insert(defender,BattleModule.BuildProtoParticipant(monster))
        end
    end

    return { attacker_members = attacker, defender_members = defender }
end

-- 防守方队伍名使用关卡名
function MainBattleModule:BuildProtoReq(role, msg_data, participants, match_index, total_matches)
    local req = self:CallSuper("BuildProtoReq", role, msg_data, participants, match_index, total_matches)
    req.battle_req.teams[2].team_name = "关卡" .. tostring(msg_data.target_id or 0)
    return req
end

function MainBattleModule:GetMonsterEntries(level_id, msg_data)
    local entries = {}
    if level_id > 0 then
        local cfg = ConfigManager.battlestageconfig[level_id]
        if cfg then
            for _, gid in ipairs(cfg.monster_group_ids or {}) do
                local grp = ConfigManager.battlemonstergroupconfig[gid]
                if grp then
                    for _, e in ipairs(grp.monster_ids or {}) do
                        for _ = 1, (e.count or 1) do
                            table.insert(entries, e)
                        end
                    end
                end
            end
        end
    end
    return entries
end

function MainBattleModule:OnBattleResult(role, series, series_result)
    local level_id = series.target_id or 0

    if series_result ~= BattleDef.BattleResultType.VICTORY then
        return
    end

    local stage_cfg = ConfigManager.battlestageconfig[level_id]
    if not stage_cfg then return end

    local total_exp = 0
    local loot = {}

    for _, gid in ipairs(stage_cfg.monster_group_ids or {}) do
        local grp = ConfigManager.battlemonstergroupconfig[gid]
        if grp then
            for _, entry in ipairs(grp.monster_ids or {}) do
                local mcfg = ConfigManager.monsterconfig[entry.monster_id]
                if mcfg then
                    total_exp = total_exp + (entry.level or 1) * 20 * (entry.count or 1)
                    if mcfg.loot_table then
                        GLO.Knapsack.MergeItems(loot, mcfg.loot_table)
                    end
                end
            end
        end
    end

    if #loot > 0 then
        GLO.Knapsack.AddItems(role, loot, GLO.Knapsack.ITEM_REASON.TASK_REWARD, "BattleLoot")
    end

    if total_exp > 0 then
        local hero_ids = HeroModule.GetLineupHeroIds(role, BattleDef.BattleType.MAIN_BATTLE)
        for _, hid in ipairs(hero_ids or {}) do
            HeroModule.AddHeroExp(role, hid, total_exp)
        end
        GLO.Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_HERO_DATA_SC,
            HeroModule.BuildHeroListProto(role))
    end
end

LOG_INFO(" MainBattleModule 加载完成")
return M
