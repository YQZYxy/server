-- ====================================================================
--  RoleSnapshot - 角色快照工具
--  从在线角色创建轻量级快照,包含阵容和英雄数据
--  用于竞技场、战报回放等需要角色数据但不依赖在线角色的场景
-- ====================================================================

local GLO = GLO
local M = {}
local Utils = GLO.Utils
local Hero = GLO.Hero

-- 从在线角色创建快照
-- @param role: 在线Role实例
-- @return snapshot: {base_info={...}, hero_data={owned_heroes={...}, lineups={...}}}
function M.Snapshot(role)
    if not role then
        LOG_ERROR("RoleSnapshot: role为空")
        return nil
    end

    local base_info = role:GetRoleBaseData()
    local lua_data = role:GetLuaRoleData()
    local hero_data = lua_data and lua_data.hero_data
    if not hero_data then
        LOG_WARN("RoleSnapshot: 角色 %d 无hero_data", role.uid)
        hero_data = { owned_heroes = {}, lineups = {} }
    end
    return {
        base_info = Utils.DeepCopy(base_info),
        hero_data = Utils.DeepCopy(hero_data),
    }
end

-- 从快照获取阵容英雄id列表
-- @param snapshot: role_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @return hero_ids: 英雄id数组
function M.GetLineupHeroIds(snapshot, battle_type)
    if not snapshot or not snapshot.hero_data then
        return {}
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local lineup = snapshot.hero_data.lineups
    if not lineup then
        return {}
    end

    -- 优先取指定战斗类型的阵容
    local target = lineup[battle_type]
    if target and target.hero_ids and #target.hero_ids > 0 then
        return target.hero_ids
    end

    -- 降级取主线阵容
    local main = lineup[GLO.Const.BattleType.MAIN_BATTLE]
    if main and main.hero_ids and #main.hero_ids > 0 then
        return main.hero_ids
    end

    return {}
end

-- 从快照获取指定英雄的等级
-- @param snapshot: role_snapshot
-- @param hero_id: 英雄id
-- @return level: 等级,默认1
function M.GetHeroLevel(snapshot, hero_id)
    if not snapshot or not snapshot.hero_data then
        return 1
    end
    local owned = snapshot.hero_data.owned_heroes or {}
    local hd = owned[hero_id]
    return (hd and hd.level) or 1
end

-- 从快照构建战斗英雄列表
-- @param snapshot: role_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @return heroes: Hero实例列表
function M.CreateBattleHeroes(snapshot, battle_type)
    if not snapshot or not snapshot.hero_data then
        return {}
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local hero_ids = M.GetLineupHeroIds(snapshot, battle_type)
    if #hero_ids == 0 then
        LOG_WARN("RoleSnapshot.CreateBattleHeroes: 阵容为空")
        return {}
    end

    local owned = snapshot.hero_data.owned_heroes or {}
    local heroes = {}
    for _, hid in ipairs(hero_ids) do
        local hd = owned[hid]
        if hd then
            local hero = GLO.Hero.CreateHeroForBattle(
                hd.hero_id,
                hd.level or 1,
                hd.learned_abilities or {},
                nil,  -- 无owner_role,快照场景不需要角色事件回调
                snapshot  -- 传入快照用于属性计算
            )
            if hero then
                table.insert(heroes, hero)
            else
                LOG_ERROR("RoleSnapshot.CreateBattleHeroes: 创建英雄失败 hero_id=%d", hid)
            end
        else
            if 0 ~= hid then
                LOG_WARN("RoleSnapshot.CreateBattleHeroes: 英雄数据不存在 hero_id=%d", hid)
            end
        end
    end
    return heroes
end

-- 从快照构建PBHeroData列表
-- @param snapshot: role_snapshot
-- 从快照构建单条PBHeroData
-- @param snapshot: role_snapshot
-- @param hero_id: 英雄id
-- @return entry: {hero_id, level, exp, abilities, attrs, combat_power} 或 nil
function M.BuildSingleHeroProtoData(snapshot, hero_id)
    if not snapshot or not snapshot.hero_data then
        return nil
    end
    local owned = snapshot.hero_data.owned_heroes or {}
    local hd = owned[hero_id]
    if not hd then
        return nil
    end
    local entry = {
        hero_id = hero_id,
        level = hd.level or 1,
        exp = hd.exp or 0,
    }
    -- abilities
    if hd.learned_abilities and next(hd.learned_abilities) then
        local ids = {}
        for aid, _ in pairs(hd.learned_abilities) do
            table.insert(ids, aid)
        end
        entry.abilities = { ability_ids = ids }
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
-- @param snapshot: role_snapshot
-- @param battle_type: Const.BattleType(可选,默认MAIN_BATTLE)
-- @return hero_list: PBHeroData结构数组 {hero_id, level, abilities, attrs, combat_power}
function M.BuildProtoHeroDataList(snapshot, battle_type)
    if not snapshot or not snapshot.hero_data then
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
-- @param snapshot: role_snapshot
-- @param battle_type: Const.BattleType(默认MAIN_BATTLE)
-- @return total_power: 队伍总战力
function M.CalcTeamPower(snapshot, battle_type)
    if not snapshot or not snapshot.hero_data then
        return 0
    end

    battle_type = battle_type or GLO.Const.BattleType.MAIN_BATTLE
    local hero_ids = M.GetLineupHeroIds(snapshot, battle_type)
    local owned = snapshot.hero_data.owned_heroes or {}
    local total = 0
    for _, hid in ipairs(hero_ids) do
        if owned[hid] then
            local _, combat_power = Hero.GetAttrsAndPower(snapshot, hid)
            total = total + (combat_power or 0)
        end
    end
    return math.floor(total)
end

LOG_INFO(" RoleSnapshot 加载完成")
return M
