-- ====================================================================
--  HeroModule
--  管理英雄列表、阵容、英雄升级/分解等业务
-- ====================================================================

local GLO = GLO
local M = {}
local Utils = GLO.Utils
local Const = GLO.Const
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager
local Hero = GLO.Hero

-- 默认英雄ID(首次创建时使用)
local DEFAULT_HERO_ID = 1
-- 默认阵容最大英雄数
local DEFAULT_LINEUP_MAX = 5

-- ==================== 数据访问 ====================

-- 获取hero数据(从role的lua_role_data中)
function M.GetOrSetHeroData(role)
    local data = role:GetLuaRoleData()
    if not data then
        return nil
    end
    if not data.hero_data then
        data.hero_data = {
            owned_heroes = {},
            lineups = {},
        }
    end
    return data.hero_data
end

-- 获取已拥有英雄列表
function M.GetOwnedHeroes(role)
    local data = M.GetOrSetHeroData(role)
    return data and data.owned_heroes or {}
end

-- 获取指定英雄的持久化数据
function M.GetOwnedHero(role, hero_id)
    local heroes = M.GetOwnedHeroes(role)
    return heroes[hero_id]
end

-- ==================== 初始化 ====================

function M.Init(role)
    local data = M.GetOrSetHeroData(role)
    if not data then
        LOG_ERROR("获取英雄数据失败 uid:%d", role.uid)
        return false
    end
    if not data.owned_heroes or not data.owned_heroes[DEFAULT_HERO_ID] then
        M.CreateDefaultHero(role)
        M.CreateHero(role, 2)
        M.CreateHero(role, 3)
        M.CreateHero(role, 4)
    end
    if not data.lineups or not next(data.lineups) then
        M.InitDefaultLineup(role)
    end
    LOG_INFO("HeroModule初始化完成 uid:%d, 英雄数量:%d",
        role.uid, M.GetHeroCount(role))
    return true
end

-- ==================== 英雄管理 ====================

function M.CreateDefaultHero(role)
    local data = M.GetOrSetHeroData(role)
    if not data then
        return nil
    end
    if data.owned_heroes[DEFAULT_HERO_ID] then
        return data.owned_heroes[DEFAULT_HERO_ID]
    end
    local config = Hero.GetHeroConfig(DEFAULT_HERO_ID)
    if not config then
        LOG_ERROR("默认英雄配置不存在 hero_id:%d", DEFAULT_HERO_ID)
        return nil
    end
    local hero_data = {
        hero_id = DEFAULT_HERO_ID,
        level = 1,
        exp = 0,
        learned_abilities = {},
    }
    if config.starting_abilities then
        for _, ability_id in ipairs(config.starting_abilities) do
            hero_data.learned_abilities[ability_id] = ability_id
        end
    end
    data.owned_heroes[DEFAULT_HERO_ID] = hero_data
    LOG_INFO("创建默认英雄 uid:%d, hero_id:%d, name:%s",
        role.uid, DEFAULT_HERO_ID, config.name or "未知")
    return hero_data
end

function M.CreateHero(role, hero_id)
    local data = M.GetOrSetHeroData(role)
    if not data then
        return nil
    end
    if data.owned_heroes[hero_id] then
        LOG_WARN("英雄已存在 uid:%d, hero_id:%d", role.uid, hero_id)
        return nil
    end
    local config = Hero.GetHeroConfig(hero_id)
    if not config then
        LOG_ERROR("英雄配置不存在 hero_id:%d", hero_id)
        return nil
    end
    local hero_data = {
        hero_id = hero_id,
        level = 1,
        exp = 0,
        learned_abilities = {},
    }
    if config.starting_abilities then
        for _, ability_id in ipairs(config.starting_abilities) do
            hero_data.learned_abilities[ability_id] = ability_id
        end
    end
    data.owned_heroes[hero_id] = hero_data
    LOG_INFO("创建新英雄 uid:%d, hero_id:%d, name:%s",
        role.uid, hero_id, config.name or "未知")
    return hero_data
end

function M.AddHeroExp(role, hero_id, add_exp)
    if 0 >= hero_id then
        return
    end
    local hero_data = M.GetOwnedHero(role, hero_id)
    if not hero_data then
        LOG_ERROR("英雄不存在 uid:%d, hero_id:%d", role.uid, hero_id)
        return
    end
    hero_data.exp = (hero_data.exp or 0) + add_exp
    local exp_to_next = M.CalcHeroExpToNextLevel(hero_data.hero_id, hero_data.level)
    while hero_data.exp >= exp_to_next do
        M.HeroLevelUp(role, hero_data)
        exp_to_next = M.CalcHeroExpToNextLevel(hero_data.hero_id, hero_data.level)
    end
end

function M.HeroLevelUp(role, hero_data)
    local config = Hero.GetHeroConfig(hero_data.hero_id)
    if not config then
        return
    end
    local exp_to_next = M.CalcHeroExpToNextLevel(hero_data.hero_id, hero_data.level)
    hero_data.exp = hero_data.exp - exp_to_next
    hero_data.level = hero_data.level + 1
    LOG_INFO("🌟 英雄升级 uid:%d, hero_id:%d, Lv.%d -> Lv.%d, name:%s",
        role.uid, hero_data.hero_id,
        hero_data.level - 1, hero_data.level,
        config.name or "未知")
    if EventManager then
        EventManager.TriggerEvent(EventManager.lua_OnHeroLevelUp, {
            role = role,
            hero_id = hero_data.hero_id,
            new_level = hero_data.level,
        })
    end

    -- 英雄升级后,若该英雄在主线阵容中则刷新战力排行榜
    local main_ids = M.GetLineupHeroIds(role, Const.BattleType.MAIN_BATTLE)
    for _, hid in ipairs(main_ids or {}) do
        if 0 ~= hid and hid == hero_data.hero_id then
            M.UpdateMainBattleRank(role)
            break
        end
    end
end

function M.CalcHeroExpToNextLevel(hero_id, level)
    local config = Hero.GetHeroConfig(hero_id)
    if not config then
        return 0
    end
    return math.floor(config.base_exp * (config.exp_multiplier ^ (level - 1)))
end

function M.DecomposeHero(role, hero_id)
    if 0 >= hero_id then
        return false
    end
    local data = M.GetOrSetHeroData(role)
    if not data then
        return false
    end
    if not data.owned_heroes[hero_id] then
        LOG_WARN("英雄不存在 uid:%d, hero_id:%d", role.uid, hero_id)
        return false
    end
    for lineup_type, lineup in pairs(data.lineups) do
        if lineup.hero_ids then
            for _, hid in ipairs(lineup.hero_ids) do
                if hid == hero_id then
                    LOG_WARN("英雄正在上阵中,不可分解 uid:%d, hero_id:%d, lineup:%s",
                        role.uid, hero_id, lineup_type)
                    return false
                end
            end
        end
    end
    local config = Hero.GetHeroConfig(hero_id)
    data.owned_heroes[hero_id] = nil
    LOG_INFO("英雄分解 uid:%d, hero_id:%d, name:%s",
        role.uid, hero_id, config and config.name or "未知")
    return true
end

function M.GetHeroCount(role)
    local heroes = M.GetOwnedHeroes(role)
    local count = 0
    for _ in pairs(heroes) do
        count = count + 1
    end
    return count
end

-- ==================== 阵容管理 ====================

function M.InitDefaultLineup(role)
    local data = M.GetOrSetHeroData(role)
    if not data then
        return
    end
    if not data.lineups[Const.BattleType.MAIN_BATTLE] then
        data.lineups[Const.BattleType.MAIN_BATTLE] = {
            hero_ids = {DEFAULT_HERO_ID},
        }
    end
end

function M.GetLineup(role, battle_type)
    local data = M.GetOrSetHeroData(role)
    if not data or not data.lineups then
        return nil
    end
    return data.lineups[battle_type]
end

function M.GetLineupHeroIds(role, battle_type)
    local lineup = M.GetLineup(role, battle_type)
    return lineup and lineup.hero_ids or nil
end

function M.SetLineup(role, battle_type, hero_ids)
    if not battle_type or not hero_ids then
        LOG_ERROR("设置阵容参数无效")
        return false
    end
    local data = M.GetOrSetHeroData(role)
    if not data then
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
    for _, hid in ipairs(filtered) do
        if seen[hid] then
            LOG_WARN("阵容中存在重复英雄 hero_id:%d", hid)
            return false
        end
        seen[hid] = true
        if not data.owned_heroes[hid] then
            LOG_WARN("阵容中的英雄未拥有 hero_id:%d", hid)
            return false
        end
    end
    data.lineups[battle_type] = {
        hero_ids = hero_ids,
    }
    LOG_INFO("设置阵容 uid:%d, battle_type:%s, hero_ids:%s",
        role.uid, battle_type, table.concat(hero_ids, ","))

    -- 主线阵容变更时更新主线战力排行榜
    if Const.BattleType.MAIN_BATTLE == battle_type then
        M.UpdateMainBattleRank(role)
    end

    return true
end

-- ==================== 主线战力排行榜 ====================

-- 更新主线战力排行榜
-- @param role: 角色实例
function M.UpdateMainBattleRank(role)
    if not role then
        return
    end
    local snapshot = GLO.RoleSnapshot.Snapshot(role)
    local total_power = GLO.RoleSnapshot.CalcTeamPower(snapshot, GLO.Const.BattleType.MAIN_BATTLE)
    if GLO.RankManager then
        GLO.RankManager.UpdateRankWithLineup(role,
            GLO.Const.RankType.MAIN_BATTLE,
            total_power,
            {},
            GLO.Const.BattleType.MAIN_BATTLE)
    end
end

function M.GetAllLineupTypes(role)
    local data = M.GetOrSetHeroData(role)
    if not data or not data.lineups then
        return {}
    end
    local types = {}
    for t, _ in pairs(data.lineups) do
        table.insert(types, t)
    end
    return types
end

-- ==================== 战斗相关 ====================

function M.CreateBattleHeroes(role, battle_type)
    local hero_ids = M.GetLineupHeroIds(role, battle_type)
    if not hero_ids or #hero_ids == 0 then
        LOG_WARN("阵容为空,使用默认英雄 uid:%d, battle_type:%s",
            role.uid, battle_type or "unknown")
        hero_ids = {DEFAULT_HERO_ID}
    end

    local heroes = {}
    local snapshot = GLO.RoleSnapshot.Snapshot(role)
    for _, hero_id in ipairs(hero_ids) do
        local hero_data = M.GetOwnedHero(role, hero_id)
        if hero_data then
            local hero = Hero.CreateHeroForBattle(
                hero_data.hero_id,
                hero_data.level,
                hero_data.learned_abilities,
                role,  -- 传入所属Role,用于事件回调
                snapshot  -- 传入快照用于属性计算
            )
            if hero then
                table.insert(heroes, hero)
            else
                LOG_ERROR("创建英雄战斗实例失败 hero_id:%d", hero_id)
            end
        elseif 0 ~= hero_id then
            LOG_ERROR("英雄数据不存在,跳过 hero_id:%d", hero_id)
        end
    end

    return heroes
end

-- ==================== 协议下发 ====================

-- 构建英雄列表协议数据
function M.BuildHeroListProto(role)
    local snapshot = GLO.RoleSnapshot.Snapshot(role)
    local owned = snapshot and snapshot.hero_data and snapshot.hero_data.owned_heroes or {}
    local hero_list = {}
    for hero_id, _ in pairs(owned) do
        local entry = GLO.RoleSnapshot.BuildSingleHeroProtoData(snapshot, hero_id)
        if entry then
            table.insert(hero_list, entry)
        end
    end
    return { hero_data = { heroes = hero_list } }
end

-- 构建阵容列表协议数据
function M.BuildLineupListProto(role)
    local data = M.GetOrSetHeroData(role)
    if not data or not data.lineups then
        return { lineup_data = { lineups = {} } }
    end

    local lineup_list = {}
    local snapshot = GLO.RoleSnapshot.Snapshot(role)
    for battle_type, lineup in pairs(data.lineups) do
        local total_power = 0
        local hero_ids = lineup.hero_ids or {}
        for _, hid in ipairs(hero_ids) do
            if hid and hid > 0 then
                local hd = M.GetOwnedHero(role, hid)
                if hd then
                    local _, power = Hero.GetAttrsAndPower(snapshot, hid)
                    total_power = total_power + power
                end
            end
        end
        table.insert(lineup_list, {
            battle_type = battle_type,
            hero_ids = hero_ids,
            combat_power = total_power,
        })
    end
    return { lineup_data = { lineups = lineup_list } }
end

-- 发送英雄数据给客户端
function M.SyncHeroDataToClient(role)
    local netid = role:GetNetid()
    if not netid then
        return
    end

    local hero_proto = M.BuildHeroListProto(role)
    Protobuf.SendMsg(netid, MHT.MHT_SYNC_HERO_DATA_SC, hero_proto)

    local lineup_proto = M.BuildLineupListProto(role)
    Protobuf.SendMsg(netid, MHT.MHT_SYNC_LINEUP_DATA_SC, lineup_proto)
end

-- ==================== 事件监听 ====================

-- 角色登录事件(发送数据到客户端)
GLO.EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        return
    end

    -- 同步数据
    M.SyncHeroDataToClient(role)
end)

-- ==================== 消息处理器 ====================

-- 阵容变更请求(MHT_SYNC_LINEUP_UPDATE_CS)
GLO.MsgManager.RegisterMsg(GLO.MHT.MHT_SYNC_LINEUP_UPDATE_CS, function(netid, msg_data, role)
    if not role then
        LOG_ERROR("处理阵容变更消息失败: 无角色")
        return
    end
    if not msg_data then
        LOG_ERROR("阵容变更消息数据为空")
        return
    end

    local battle_type = msg_data.battle_type
    local hero_ids = msg_data.hero_ids or {}

    LOG_INFO("阵容变更请求: uid=%d, battle_type=%s, hero_ids=%s",
        role.uid, tostring(battle_type), table.concat(hero_ids, ","))

    -- 应用阵容变更
    local success = M.SetLineup(role, battle_type, hero_ids)
    if not success then
        LOG_WARN("阵容变更失败 uid=%d, battle_type=%s", role.uid, tostring(battle_type))
    end

    -- 构建阵容同步数据
    local lineup_proto = M.BuildLineupListProto(role)

    -- 复用阵容同步协议下发最新阵容
    Protobuf.SendMsg(netid, MHT.MHT_SYNC_LINEUP_DATA_SC, lineup_proto)

    LOG_INFO("阵容变更完成 uid=%d, battle_type=%s, success=%s",
        role.uid, tostring(battle_type), tostring(success))
end)

LOG_INFO("HeroModule 加载完成")
return M
