-- ====================================================================
--  HeroModule
-- ====================================================================

local GLO = GLO
local M = {}
local Utils = GLO.Utils
local BattleDef = GLO.BattleDef
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager
local Hero = GLO.Hero

-- 默认英雄ID(首次创建时使用)
local DEFAULT_HERO_ID = 1
-- 对外暴露给阵容模块使用
M.DEFAULT_HERO_ID = DEFAULT_HERO_ID

-- ==================== 数据访问 ====================

function M.GetOrSetHeroData(role)
    if not role then
        return nil
    end

    local hero_data = GLO.RoleData.GetHero(role.uid)
    local lineup_data = GLO.RoleData.GetLineup(role.uid)
    if not hero_data or not lineup_data then
        return nil
    end

    if not hero_data.heroes then
        hero_data.heroes = {}
    end
    if not lineup_data.lineups then
        lineup_data.lineups = {}
    end
    return {
        hero = hero_data,
        lineup = lineup_data,
    }
end

-- 获取已拥有英雄列表
function M.GetOwnedHeroes(role)
    local data = M.GetOrSetHeroData(role)
    return (data and data.hero and data.hero.heroes) or {}
end

-- 在英雄数组中按 hero_id 查找
function M.FindHeroInList(heroes, hero_id)
    for _, hd in ipairs(heroes or {}) do
        if hd.hero_id == hero_id then
            return hd
        end
    end
    return nil
end

-- 获取指定英雄的持久化数据
function M.GetOwnedHero(role, hero_id)
    local heroes = M.GetOwnedHeroes(role)
    return M.FindHeroInList(heroes, hero_id)
end

-- ==================== 初始化 ====================

function M.Init(role)
    local data = M.GetOrSetHeroData(role)
    if not data then
        LOG_ERROR("获取英雄数据失败 uid:%d", role.uid)
        return false
    end
    if not M.GetOwnedHero(role, DEFAULT_HERO_ID) then
        M.CreateDefaultHero(role)
        M.CreateHero(role, 2)
        M.CreateHero(role, 3)
        M.CreateHero(role, 4)
    end
    if not data.lineup or not next(data.lineup.lineups or {}) then
        M.InitDefaultLineup(role)
    end
    return true
end

-- ==================== 英雄管理 ====================

function M.CreateDefaultHero(role)
    local data = M.GetOrSetHeroData(role)
    if not data then
        return nil
    end
    local exist = M.GetOwnedHero(role, DEFAULT_HERO_ID)
    if exist then
        return exist
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
    }
    if config.starting_abilities then
        hero_data.abilities = { ability_ids = {} }
        for _, ability_id in ipairs(config.starting_abilities) do
            table.insert(hero_data.abilities.ability_ids, ability_id)
        end
    end
    table.insert(data.hero.heroes, hero_data)

    return hero_data
end

function M.CreateHero(role, hero_id)
    local data = M.GetOrSetHeroData(role)
    if not data then
        return nil
    end
    if M.GetOwnedHero(role, hero_id) then
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
    }
    if config.starting_abilities then
        hero_data.abilities = { ability_ids = {} }
        for _, ability_id in ipairs(config.starting_abilities) do
            table.insert(hero_data.abilities.ability_ids, ability_id)
        end
    end
    table.insert(data.hero.heroes, hero_data)

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
    LOG_INFO("英雄升级 uid:%d, hero_id:%d, Lv.%d -> Lv.%d, name:%s",
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
    local main_ids = M.GetLineupHeroIds(role, BattleDef.BattleType.MAIN_BATTLE)
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
    if not M.GetOwnedHero(role, hero_id) then
        LOG_WARN("英雄不存在 uid:%d, hero_id:%d", role.uid, hero_id)
        return false
    end
    -- 检查是否上阵
    for _, lineup in ipairs(data.lineup.lineups or {}) do
        for _, hid in ipairs(lineup.hero_ids or {}) do
            if hid == hero_id then
                LOG_WARN("英雄正在上阵中,不可分解 uid:%d, hero_id:%d, lineup:%s",
                    role.uid, hero_id, tostring(lineup.battle_type))
                return false
            end
        end
    end
    local config = Hero.GetHeroConfig(hero_id)
    -- 从数组移除
    local heroes = data.hero.heroes
    for i = #heroes, 1, -1 do
        if heroes[i].hero_id == hero_id then
            table.remove(heroes, i)
            break
        end
    end
    LOG_INFO("英雄分解 uid:%d, hero_id:%d, name:%s",
        role.uid, hero_id, config and config.name or "未知")
    return true
end

function M.GetHeroCount(role)
    local heroes = M.GetOwnedHeroes(role)
    return #heroes
end

-- ==================== MMO 出战英雄 ====================

-- 设置 MMO 出战英雄 只影响下次进入场景
function M.SetMmoHero(role, hero_id)
    if not role then
        LOG_ERROR("设置MMO出战英雄失败, 角色为空")
        return false
    end
    local hero_data = M.GetOwnedHero(role, hero_id)
    if not hero_data then
        LOG_ERROR("设置MMO出战英雄失败, 未拥有该英雄 uid:%d hero_id:%d", role.uid, hero_id)
        return false
    end

    local base_info = GLO.RoleData.GetBaseInfo(role.uid)
    if not base_info then
        LOG_ERROR("设置MMO出战英雄失败, 取不到角色数据 uid:%d", role.uid)
        return false
    end

    base_info.hero_id = hero_id
    LOG_INFO("角色 %d 切换MMO出战英雄 hero_id:%d", role.uid, hero_id)
    return true
end

-- 获取当前 MMO 出战英雄id
function M.GetMmoHeroId(role)
    if not role then
        return 0
    end
    local base_info = GLO.RoleData.GetBaseInfo(role.uid)
    if not base_info or not base_info.hero_id then
        return 0
    end
    return base_info.hero_id
end

-- ==================== 阵容管理 ====================

function M.InitDefaultLineup(role)
    return GLO.Lineup.InitDefaultLineup(role)
end

function M.GetLineup(role, battle_type, slot)
    return GLO.Lineup.GetLineup(role, battle_type, slot)
end

function M.GetLineups(role, battle_type)
    return GLO.Lineup.GetLineups(role, battle_type)
end

function M.GetLineupHeroIds(role, battle_type, slot)
    return GLO.Lineup.GetLineupHeroIds(role, battle_type, slot)
end

function M.SetLineup(role, battle_type, slot, hero_ids)
    return GLO.Lineup.SetLineup(role, battle_type, slot, hero_ids)
end

-- ==================== 主线战力排行榜 ====================

-- 更新主线战力排行榜
-- @param role: 角色实例
function M.UpdateMainBattleRank(role)
    if not role then
        return
    end
    GLO.MainBattleRank.Update(role)
end

-- 获取角色已使用的所有战斗类型
function M.GetAllLineupTypes(role)
    return GLO.Lineup.GetAllLineupTypes(role)
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
    local snapshot = GLO.RoleBattleSnapshot.Snapshot(role)
    for _, hero_id in ipairs(hero_ids) do
        local hero_data = M.GetOwnedHero(role, hero_id)
        if hero_data then
            local hero = Hero.CreateHeroForBattle(
                hero_data.hero_id,
                hero_data.level,
                hero_data.abilities and hero_data.abilities.ability_ids or {},
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
    local snapshot = GLO.RoleBattleSnapshot.Snapshot(role)
    local owned = snapshot and snapshot.hero or {}
    local hero_list = {}
    for _, hd in ipairs(owned.heroes or {}) do
        local entry = GLO.RoleBattleSnapshot.BuildSingleHeroProtoData(snapshot, hd.hero_id)
        if entry then
            table.insert(hero_list, entry)
        end
    end
    return { hero_data = { heroes = hero_list } }
end

-- 构建阵容列表协议数据
function M.BuildLineupListProto(role)
    local data = M.GetOrSetHeroData(role)
    if not data or not data.lineup then
        return { lineup_data = { lineups = {} } }
    end

    local lineup_list = {}
    -- 只读快照: 不深拷贝整份英雄和阵容数据
    local snapshot = GLO.RoleBattleSnapshot.SnapshotRef(role)
    -- 同一英雄会在多个阵容里出现, 战力只算一次
    local power_cache = {}
    local heroes = data.hero and data.hero.heroes
    for _, lineup in ipairs(data.lineup.lineups or {}) do
        local total_power = 0
        local hero_ids = lineup.hero_ids or {}
        for _, hid in ipairs(hero_ids) do
            if hid and hid > 0 then
                local power = power_cache[hid]
                if not power then
                    power = 0
                    if M.FindHeroInList(heroes, hid) then
                        local _, hero_power = Hero.GetAttrsAndPower(snapshot, hid)
                        power = hero_power or 0
                    end
                    power_cache[hid] = power
                end
                total_power = total_power + power
            end
        end
        table.insert(lineup_list, {
            battle_type = lineup.battle_type,
            slot = lineup.slot or 0,
            hero_ids = hero_ids,
            combat_power = total_power,
        })
    end
    return { lineup_data = { lineups = lineup_list } }
end

-- 发送英雄数据给客户端
function M.SyncHeroDataToClient(role)
    local hero_proto = M.BuildHeroListProto(role)
    Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_HERO_DATA_SC, hero_proto)

    local lineup_proto = M.BuildLineupListProto(role)
    Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_LINEUP_DATA_SC, lineup_proto)
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

-- 阵容变更请求
GLO.MsgManager.RegisterMsg(GLO.MHT.MHT_SYNC_LINEUP_UPDATE_CS, function(netid, role, msg_data)
    if not role then
        LOG_ERROR("处理阵容变更消息失败: 无角色")
        return
    end
    if not msg_data then
        LOG_ERROR("阵容变更消息数据为空")
        return
    end

    local battle_type = msg_data.battle_type
    local slot = msg_data.slot or 0
    local hero_ids = msg_data.hero_ids or {}

    -- 应用阵容变更
    local success = M.SetLineup(role, battle_type, slot, hero_ids)
    if not success then
        LOG_WARN("阵容变更失败 uid=%d, battle_type=%s, slot=%d", role.uid, tostring(battle_type), slot)
    end

    -- 构建阵容同步数据
    local lineup_proto = M.BuildLineupListProto(role)

    -- 复用阵容同步协议下发最新阵容
    Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_LINEUP_DATA_SC, lineup_proto)
end)

LOG_INFO("HeroModule 加载完成")
return M
