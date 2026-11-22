-- ====================================================================
--  Lineup - 英雄阵容
-- ====================================================================

local GLO = GLO
local M = {}
local BattleDef = GLO.BattleDef

-- 默认阵容最大英雄数
local DEFAULT_LINEUP_MAX = 5
-- 每个战斗类型最大阵容槽位数(多阵容nvn用)
local DEFAULT_LINEUP_SLOT_MAX = 3

-- 英雄模块
local s_hero_module = nil

-- 初始化
-- hero_module HeroModule, 提供角色英雄数据访问
function M.Init(hero_module)
    if not hero_module then
        LOG_ERROR("Lineup.Init: 英雄模块未加载")
        return false
    end

    s_hero_module = hero_module
    return true
end

-- 取英雄模块
local function GetHeroModule()
    if not s_hero_module then
        LOG_ERROR("Lineup: 英雄模块未初始化")
    end
    return s_hero_module
end

-- 取角色英雄与阵容数据
local function GetOrSetHeroData(role)
    local hero_module = GetHeroModule()
    if not hero_module then
        return nil
    end
    return hero_module.GetOrSetHeroData(role)
end

-- ==================== 阵容管理 ====================

-- 初始化默认主线阵容
function M.InitDefaultLineup(role)
    local data = GetOrSetHeroData(role)
    if not data then
        return
    end
    if not M.GetLineup(role, BattleDef.BattleType.MAIN_BATTLE) and s_hero_module then
        if not s_hero_module.DEFAULT_HERO_ID then
            error("heromodule 缺少 DEFAULT_HERO_ID 配置")
        end
        table.insert(data.lineup.lineups, {
            battle_type = BattleDef.BattleType.MAIN_BATTLE,
            slot = 0,
            hero_ids = {s_hero_module.DEFAULT_HERO_ID},
        })
    end
end

-- 按战斗类型+槽位查找阵容(slot默认0)
function M.GetLineup(role, battle_type, slot)
    local data = GetOrSetHeroData(role)
    if not data or not data.lineup then
        return nil
    end
    slot = slot or 0
    for _, lineup in ipairs(data.lineup.lineups or {}) do
        if lineup.battle_type == battle_type and lineup.slot == slot then
            return lineup
        end
    end
    return nil
end

-- 获取某战斗类型的所有阵容(按slot升序)
function M.GetLineups(role, battle_type)
    local data = GetOrSetHeroData(role)
    if not data or not data.lineup then
        return {}
    end
    local result = {}
    for _, lineup in ipairs(data.lineup.lineups or {}) do
        if lineup.battle_type == battle_type then
            table.insert(result, lineup)
        end
    end
    table.sort(result, function(a, b) return a.slot < b.slot end)
    return result
end

-- 获取阵容英雄id列表
function M.GetLineupHeroIds(role, battle_type, slot)
    local lineup = M.GetLineup(role, battle_type, slot)
    if not lineup then
        return nil
    end
    return lineup.hero_ids
end

-- 设置阵容
function M.SetLineup(role, battle_type, slot, hero_ids)
    if type(slot) == "table" then
        hero_ids = slot
        slot = 0
    end
    slot = slot or 0

    if not battle_type or not hero_ids then
        LOG_ERROR("设置阵容参数无效")
        return false
    end
    local data = GetOrSetHeroData(role)
    if not data then
        return false
    end
    if slot >= DEFAULT_LINEUP_SLOT_MAX then
        LOG_WARN("阵容槽位超过上限 %d, 当前:%d", DEFAULT_LINEUP_SLOT_MAX, slot)
        return false
    end
    if #hero_ids > DEFAULT_LINEUP_MAX then
        LOG_WARN("阵容英雄数量超过上限 %d, 当前:%d", DEFAULT_LINEUP_MAX, #hero_ids)
        return false
    end
    -- 过滤掉0(空位),验证非空英雄
    local filtered = {}
    for _, hid in ipairs(hero_ids) do
        if hid and hid > 0 then
            table.insert(filtered, hid)
        end
    end
    local seen = {}
    local heroes = data.hero and data.hero.heroes
    for _, hid in ipairs(filtered) do
        if seen[hid] then
            LOG_WARN("阵容中存在重复英雄 hero_id:%d", hid)
            return false
        end
        seen[hid] = true
        -- 直接用已取的 data 查英雄, 不再每次都走 GetOrSetHeroData
        if not s_hero_module or not s_hero_module.FindHeroInList(heroes, hid) then
            LOG_WARN("阵容中的英雄未拥有 hero_id:%d", hid)
            return false
        end
    end
    -- 多阵容间英雄不能重复(同一战斗类型下)
    for _, other in ipairs(data.lineup.lineups or {}) do
        if other.battle_type == battle_type and other.slot ~= slot then
            for _, hid in ipairs(other.hero_ids or {}) do
                if seen[hid] then
                    LOG_WARN("英雄已在其它阵容上阵 hero_id:%d", hid)
                    return false
                end
            end
        end
    end
    -- 保存(更新或新增)
    local lineup = nil
    for _, other in ipairs(data.lineup.lineups or {}) do
        if other.battle_type == battle_type and other.slot == slot then
            lineup = other
            break
        end
    end
    if lineup then
        lineup.hero_ids = hero_ids
        lineup.slot = slot
    else
        table.insert(data.lineup.lineups, {
            battle_type = battle_type,
            slot = slot,
            hero_ids = hero_ids,
        })
    end

    -- 主线阵容变更时更新主线战力排行榜
    if BattleDef.BattleType.MAIN_BATTLE == battle_type then
        s_hero_module.UpdateMainBattleRank(role)
    end

    return true
end

-- 获取角色已使用的所有战斗类型
function M.GetAllLineupTypes(role)
    local data = GetOrSetHeroData(role)
    if not data or not data.lineup then
        return {}
    end
    local types = {}
    for _, lineup in ipairs(data.lineup.lineups or {}) do
        table.insert(types, lineup.battle_type)
    end
    return types
end

LOG_INFO(" Lineup 加载完成")

return M
