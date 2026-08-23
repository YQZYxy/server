-- ====================================================================
--  RoleBattleSnapshot - 角色战斗快照
-- ====================================================================

local GLO = GLO
local M = {}
local Utils = GLO.Utils
local Hero = GLO.Hero

-- 从在线角色创建战斗快照
-- @param role: 在线Role实例
-- @return snapshot: PB_RoleBattleSnapshot结构 {base_info, hero={heroes=...}, lineup={lineups=...}}
function M.Snapshot(role)
    if not role then
        LOG_ERROR("RoleBattleSnapshot: role为空")
        return nil
    end

    local role_data = role:GetRoleData()
    if not role_data then
        LOG_ERROR("RoleBattleSnapshot: 角色 %d 无数据", role.uid)
        return nil
    end
    local growth = role_data.growth
    return {
        base_info = Utils.DeepCopy(role_data.base_info or {}),
        hero = Utils.DeepCopy(growth.hero or { heroes = {} }),
        lineup = Utils.DeepCopy(growth.lineup or { lineups = {} }),
    }
end

-- 在快照英雄列表中按 hero_id 查找
-- @param snapshot: role_battle_snapshot
-- @param hero_id: 英雄id
-- @return hero_data 或 nil
function M.FindHero(snapshot, hero_id)
    local owned = snapshot and snapshot.hero or {}
    for _, hd in ipairs(owned.heroes or {}) do
        if hd.hero_id == hero_id then
            return hd
        end
    end
    return nil
end

-- 从快照获取阵容英雄id列表
-- @param snapshot: role_battle_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @param slot: 阵容槽位(可选,默认0)
-- @return hero_ids: 英雄id数组
function M.GetLineupHeroIds(snapshot, battle_type, slot)
    if not snapshot then
        return {}
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    slot = slot or 0
    local lineups = snapshot.lineup
    if not lineups then
        return {}
    end

    -- 优先取指定战斗类型+槽位的阵容
    for _, lineup in ipairs(lineups.lineups or {}) do
        if lineup.battle_type == battle_type and (lineup.slot or 0) == slot
            and lineup.hero_ids and #lineup.hero_ids > 0 then
            return lineup.hero_ids
        end
    end

    -- 兼容旧数据: slot0 匹配无 slot 字段的阵容
    if slot == 0 then
        for _, lineup in ipairs(lineups.lineups or {}) do
            if lineup.battle_type == battle_type and lineup.hero_ids and #lineup.hero_ids > 0 then
                return lineup.hero_ids
            end
        end

        -- 降级取主线阵容
        for _, lineup in ipairs(lineups.lineups or {}) do
            if lineup.battle_type == GLO.Const.BattleType.MAIN_BATTLE and lineup.hero_ids and #lineup.hero_ids > 0 then
                return lineup.hero_ids
            end
        end
    end

    return {}
end

-- 从快照获取某战斗类型所有阵容的英雄id列表(多阵容nvn用)
-- @param snapshot: role_battle_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @return lineups: {{slot=..., hero_ids=...}, ...} 按slot升序, 已过滤空阵容
function M.GetAllLineupHeroIds(snapshot, battle_type)
    if not snapshot then
        return {}
    end
    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local lineups = snapshot.lineup
    if not lineups then
        return {}
    end
    local result = {}
    for _, lineup in ipairs(lineups.lineups or {}) do
        if lineup.battle_type == battle_type and lineup.hero_ids and #lineup.hero_ids > 0 then
            table.insert(result, {
                slot = lineup.slot or 0,
                hero_ids = lineup.hero_ids,
            })
        end
    end
    table.sort(result, function(a, b) return a.slot < b.slot end)
    return result
end

-- 从快照获取指定英雄的等级
-- @param snapshot: role_battle_snapshot
-- @param hero_id: 英雄id
-- @return level: 等级,默认1
function M.GetHeroLevel(snapshot, hero_id)
    local hd = M.FindHero(snapshot, hero_id)
    return (hd and hd.level) or 1
end

-- 从快照构建战斗英雄列表
-- @param snapshot: role_battle_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @param slot: 阵容槽位(可选,默认0)
-- @return heroes: Hero实例列表
function M.CreateBattleHeroes(snapshot, battle_type, slot)
    if not snapshot then
        return {}
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local hero_ids = M.GetLineupHeroIds(snapshot, battle_type, slot)
    if #hero_ids == 0 then
        LOG_WARN("RoleBattleSnapshot.CreateBattleHeroes: 阵容为空 slot=%d", slot or 0)
        return {}
    end

    local heroes = {}
    for _, hid in ipairs(hero_ids) do
        local hd = M.FindHero(snapshot, hid)
        if hd then
            local hero = GLO.Hero.CreateHeroForBattle(
                hd.hero_id,
                hd.level or 1,
                hd.abilities and hd.abilities.ability_ids or {},
                nil,  -- 无owner_role,快照场景不需要角色事件回调
                snapshot  -- 传入快照用于属性计算
            )
            if hero then
                table.insert(heroes, hero)
            else
                LOG_ERROR("RoleBattleSnapshot.CreateBattleHeroes: 创建英雄失败 hero_id=%d", hid)
            end
        else
            if 0 ~= hid then
                LOG_WARN("RoleBattleSnapshot.CreateBattleHeroes: 英雄数据不存在 hero_id=%d", hid)
            end
        end
    end
    return heroes
end

-- 从快照构建单条PBHeroData
-- @param snapshot: role_battle_snapshot
-- @param hero_id: 英雄id
-- @return entry: {hero_id, level, exp, abilities, attrs, combat_power} 或 nil
function M.BuildSingleHeroProtoData(snapshot, hero_id)
    if not snapshot then
        return nil
    end
    local hd = M.FindHero(snapshot, hero_id)
    if not hd then
        return nil
    end
    local entry = {
        hero_id = hero_id,
        level = hd.level or 1,
        exp = hd.exp or 0,
    }
    -- abilities
    if hd.abilities and hd.abilities.ability_ids and next(hd.abilities.ability_ids) then
        entry.abilities = { ability_ids = hd.abilities.ability_ids }
    end
    -- attrs + combat_power
    local attr_map, combat_power = Hero.GetAttrsAndPower(snapshot, hero_id)
    entry.combat_power = combat_power
    local attr_pairs = {}
    for attr_id, val in pairs(attr_map) do
        table.insert(attr_pairs, { attr_id = attr_id, value = val })
    end
    entry.attrs = { attrs = attr_pairs }
    return entry
end

-- 从快照构建PBHeroData列表
-- @param snapshot: role_battle_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @return hero_list: PBHeroData结构数组 {hero_id, level, abilities, attrs, combat_power}
function M.BuildProtoHeroDataList(snapshot, battle_type)
    if not snapshot then
        return {}
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local hero_ids = M.GetLineupHeroIds(snapshot, battle_type)
    if #hero_ids == 0 then
        return {}
    end

    local list = {}
    for _, hid in ipairs(hero_ids) do
        local entry = M.BuildSingleHeroProtoData(snapshot, hid)
        if entry then
            table.insert(list, entry)
        end
    end
    return list
end

-- 从快照计算阵容总战力
-- @param snapshot: role_battle_snapshot
-- @param battle_type: Const.BattleType(默认MAIN_BATTLE)
-- @return total_power: 队伍总战力
function M.CalcTeamPower(snapshot, battle_type)
    if not snapshot then
        return 0
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local hero_ids = M.GetLineupHeroIds(snapshot, battle_type)
    local total = 0
    for _, hid in ipairs(hero_ids) do
        if M.FindHero(snapshot, hid) then
            local _, combat_power = Hero.GetAttrsAndPower(snapshot, hid)
            total = total + (combat_power or 0)
        end
    end
    return math.floor(total)
end

LOG_INFO(" RoleBattleSnapshot 加载完成")
return M
