-- ====================================================================
--  主线战斗
-- ====================================================================

local GLO = GLO
local M = {}
local BattleModule = GLO.BattleModule
local Const = GLO.Const
local Utils = GLO.Utils
local HeroModule = GLO.HeroModule
local ConfigManager = GLO.ConfigManager
local MHT = GLO.MHT

local MainBattleModule = BattleModule.BattleModule:Extend("MainBattleModule")
M.MainBattleModule = MainBattleModule
GLO.BattleManager.RegisterBattleModule(Const.BattleType.MAIN_BATTLE, MainBattleModule)

function MainBattleModule:Ctor()
    self:CallSuper("Ctor")
    self.module_name = "主线"
    self.battle_type = Const.BattleType.MAIN_BATTLE
end

-- 构建参与者
function MainBattleModule:BuildMatchParticipants(role, msg_data, match_index, total_matches)
    local stage_id = msg_data.id or 0
    local monster_entries = self:GetMonsterEntries(stage_id, msg_data)

    local heroes = HeroModule.CreateBattleHeroes(role, Const.BattleType.MAIN_BATTLE)
    if not heroes or #heroes == 0 then
        LOG_ERROR("创建战斗英雄失败 role=%s", role:GetName())
        return nil
    end

    local attacker = {}
    for _, hero in ipairs(heroes) do
        table.insert(attacker,
            BattleModule.BuildProtoParticipant(hero, role.uid, role:GetName(), 1))
    end

    local defender = {}
    local team_name = "关卡" .. tostring(stage_id)
    for _, entry in ipairs(monster_entries) do
        local monster = GLO.Monster.CreateMonster(entry.monster_id)
        if monster then
            if entry.level and entry.level > 0 then monster:SetLevel(entry.level) end
            if entry.attr_scale and entry.attr_scale ~= 1.0 then monster:ScaleAttributes(entry.attr_scale) end
            table.insert(defender,BattleModule.BuildProtoParticipant(monster, -1, team_name, 2))
        end
    end

    --LOG_INFO("主线PVE: stage_id=%d, 英雄=%d, 怪物=%d", stage_id, #attacker, #defender)
    return { attacker_members = attacker, defender_members = defender }
end

function MainBattleModule:GetMonsterEntries(stage_id, msg_data)
    local entries = {}
    if stage_id > 0 then
        local cfg = ConfigManager.battlestageconfig[stage_id]
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
    local param_id = series.param_id or 0

    LOG_INFO("主线战斗结果: uid=%d, result=%d, stage=%d",
        role.uid, series_result, param_id)

    if series_result ~= Const.BattleResultType.VICTORY then
        LOG_INFO("主线战斗未胜利,不发放奖励 uid=%d", role.uid)
        return
    end

    local stage_cfg = ConfigManager.battlestageconfig[param_id]
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
                        GLO.Inventory.MergeItems(loot, mcfg.loot_table)
                    end
                end
            end
        end
    end

    if #loot > 0 then
        GLO.Inventory.AddItems(role, loot)
        --LOG_INFO("战斗掉落: %s 获得 %d 种物品", role:GetName(), #loot)
    end

    if total_exp > 0 then
        local hero_ids = HeroModule.GetLineupHeroIds(role, Const.BattleType.MAIN_BATTLE)
        for _, hid in ipairs(hero_ids or {}) do
            HeroModule.AddHeroExp(role, hid, total_exp)
        end
        GLO.Protobuf.SendMsg(role:GetNetid(), MHT.MHT_SYNC_HERO_DATA_SC,
            HeroModule.BuildHeroListProto(role))
        --LOG_INFO("英雄获得 %d 经验", total_exp)
    end
end

LOG_INFO(" MainBattleModule 加载完成")
return M
