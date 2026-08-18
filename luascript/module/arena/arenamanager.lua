-- ====================================================================
--  ArenaManager - 竞技场管理器
--  管理所有ArenaUser
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = M
local ArenaUser = GLO.ArenaUser
local Serializer = GLO.Serializer
local Utils = GLO.Utils
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local MsgManager = GLO.MsgManager
local EventManager = GLO.EventManager
local TimerManager = GLO.TimerManager
local Const = GLO.Const
local Hero = GLO.Hero

-- 对手列表显示数量
local OPPONENT_LIST_COUNT = 5

-- 积分相关常量
local SCORE_BASE = 1000           -- 基础积分
local SCORE_MIN = 100             -- 最低积分
local SCORE_MAX = 999999999       -- 最高积分

-- ==================== 数据管理 ====================

function LOC.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            -- [uid] = ArenaUser实例
            m_arena_users = {},
            -- 是否已从数据库加载
            m_is_loaded = false,
        }
    end
    return M.m_data
end

-- 注册跨天事件
EventManager.RegisterListener(EventManager.cpp_OnDayChange, function(event_data)
    M.OnDayChange()
end)

-- 初始化(服务器启动时从数据库加载)
function M.Init()
    LOG_INFO("开始初始化...")

    -- 注册排行榜类型
    GLO.RankManager.RegisterRankType(Const.RankType.ARENA, {
        page_size = 100,  -- 每页100条
    })

    -- 竞技场用户数据
    M.LoadArena()

    LOG_INFO("初始化完成, 已加载 %d 个竞技场用户", M.GetRegisteredCount())
end

-- 从数据库加载
function M.LoadArena()
    local m_data = LOC.GetOrSetData()

    -- 从arena表加载
    m_data.m_is_loaded = false
    GLO.Protobuf.SendDBMsg(MHT.MHT_ARENA_DB_C, {
        req_type = 1,   -- 加载所有
    })
end

-- 数据库加载回调(由C++调用)
function M.LoadRet(msg_data)
    if not msg_data then
        LOG_ERROR("数据为空")
        return
    end

    local m_data = LOC.GetOrSetData()

    local datas = msg_data.datas
    if not datas then
        LOG_INFO("没有竞技场数据需要加载")
        m_data.m_is_loaded = true
        return
    end

    local load_count = 0
    for _, node in ipairs(datas) do
        local arena_data = Serializer.Simple.Deserialize(node.data)
        if arena_data then
            local user = ArenaUser.ArenaUser:New()
            user:Deserialize(arena_data)

            -- 数据库中的score覆盖
            if node.score and node.score ~= 0 then
                user.score = node.score
            end
            
            m_data.m_arena_users[user.uid] = user
            load_count = load_count + 1
        end
    end

    m_data.m_is_loaded = true
    LOG_INFO("从数据库加载 %d 个竞技场用户", load_count)
end

-- ==================== 注册/反注册 ====================

-- 注册ArenaUser(玩家进入竞技场界面时调用)
-- @param uid: 玩家uid
-- @param name: 玩家名字
-- @param user_name: 玩家用户名
-- @return ArenaUser实例
function M.Register(uid, name, user_name)
    if not uid or uid == 0 then
        LOG_ERROR("无效uid")
        return nil
    end

    local m_data = LOC.GetOrSetData()

    -- 检查是否已注册
    local user = m_data.m_arena_users[uid]
    if user then
        -- 更新信息
        user:UpdateName(name or "")
        user.is_registered = true
        LOG_INFO("用户已存在,更新信息 uid=%d", uid)
        return user
    end

    -- 创建新用户
    user = ArenaUser.ArenaUser:New(uid, name or "", user_name or "")
    user.is_registered = true

    -- 检查每日重置
    local day_id = GLO.Utils.GetServerDayId()
    user:CheckDailyReset(day_id)

    m_data.m_arena_users[uid] = user

    LOG_INFO("注册新用户 uid=%d, name=%s", uid, name or "未知")
    return user
end

-- 获取ArenaUser
function M.GetArenaUser(uid)
    local m_data = LOC.GetOrSetData()
    return m_data.m_arena_users[uid]
end

-- 获取所有注册用户数量
function M.GetRegisteredCount()
    local m_data = LOC.GetOrSetData()
    local count = 0
    for _ in pairs(m_data.m_arena_users) do
        count = count + 1
    end
    return count
end

-- ==================== 对手匹配 ====================

-- 为指定玩家匹配对手列表
-- @param uid: 玩家uid
-- @return opponent_uids: 对手uid列表
function M.MatchOpponents(uid)
    local m_data = LOC.GetOrSetData()
    local user = m_data.m_arena_users[uid]
    if not user then
        LOG_ERROR("用户不存在 uid=%d", uid)
        return {}
    end

    -- 收集所有其他竞技场用户(排除自己)
    local candidates = {}
    for other_uid, other_user in pairs(m_data.m_arena_users) do
        if other_uid ~= uid and other_user.is_registered then
            table.insert(candidates, {
                uid = other_uid,
                score = other_user.score,
            })
        end
    end

    -- 如果候选对手不足,返回所有可用对手
    if #candidates <= OPPONENT_LIST_COUNT then
        local result = {}
        for _, c in ipairs(candidates) do
            table.insert(result, c.uid)
        end
        user.opponent_uids = result
        user.last_match_time = GLO.Utils.GetServerTime()
        return result
    end

    -- 按分数差异排序(选择分数相近的对手)
    table.sort(candidates, function(a, b)
        local diff_a = math.abs(a.score - user.score)
        local diff_b = math.abs(b.score - user.score)
        if diff_a == diff_b then
            return a.score > b.score
        end
        return diff_a < diff_b
    end)

    -- 从最近的候选中随机选择OPPONENT_LIST_COUNT个
    local pool_size = math.min(#candidates, OPPONENT_LIST_COUNT * 3)
    local pool = {}
    for i = 1, pool_size do
        table.insert(pool, candidates[i])
    end

    -- 随机打乱后取前N个
    local selected = Utils.ShuffleTable(pool)
    local result = {}
    for i = 1, math.min(OPPONENT_LIST_COUNT, #selected) do
        table.insert(result, selected[i].uid)
    end

    user.opponent_uids = result
    user.last_match_time = GLO.Utils.GetServerTime()

    LOG_INFO("为玩家 %d 匹配了 %d 个对手", uid, #result)
    return result
end

-- 刷新对手列表
function M.RefreshOpponents(uid)
    local user = LOC.GetOrSetData().m_arena_users[uid]
    if not user then
        LOG_ERROR("用户不存在 uid=%d", uid)
        return nil
    end

    -- 检查免费刷新次数
    if not user:CanFreeRefresh() then
        LOG_WARN("用户 %d 免费刷新次数已用完", uid)
        return nil
    end

    user:ConsumeFreeRefresh()
    return M.MatchOpponents(uid)
end

-- ==================== 战斗逻辑 ====================

-- 计算对战积分变化
-- @param attacker: 攻击方 ArenaUser
-- @param defender: 防守方 ArenaUser
-- @param attacker_win: 攻击方是否胜利
-- @return score_change: 攻击方积分变化量
function M.CalculateScoreChange(attacker, defender, attacker_win)
    local attacker_score = attacker.score
    local defender_score = defender.score
    local attacker_power = attacker.power or 0
    local defender_power = defender.power or 0

    if attacker_win then
        -- 攻击方胜利
        local score_diff = defender_score - attacker_score
        local power_ratio = 1.0

        -- 战力影响: 以弱胜强加分更多
        if defender_power > 0 and attacker_power > 0 then
            power_ratio = defender_power / attacker_power
            -- 限制范围
            if power_ratio > 2.0 then power_ratio = 2.0 end
            if power_ratio < 0.5 then power_ratio = 0.5 end
        end

        -- 基础加分
        local base_gain = 25
        -- 分数差加成: 战胜高分对手额外加分
        local diff_bonus = 0
        if score_diff > 0 then
            diff_bonus = math.floor(score_diff * 0.05)
            if diff_bonus > 30 then diff_bonus = 30 end
        end

        local change = math.floor((base_gain + diff_bonus) * power_ratio)
        -- 最低加分
        if change < 10 then change = 10 end
        if change > 60 then change = 60 end

        return change
    else
        -- 攻击方失败
        local score_diff = defender_score - attacker_score
        local power_ratio = 1.0

        -- 战力影响: 战力高却输扣分更多
        if defender_power > 0 and attacker_power > 0 then
            power_ratio = attacker_power / defender_power
            if power_ratio > 1.5 then power_ratio = 1.5 end
            if power_ratio < 0.5 then power_ratio = 0.5 end
        end

        local base_loss = 15
        -- 分数差减免: 挑战高分玩家失败扣分更少
        local diff_reduction = 0
        if score_diff < 0 then
            diff_reduction = math.floor(math.abs(score_diff) * 0.03)
            if diff_reduction > 15 then diff_reduction = 15 end
        end

        local change = -math.floor((base_loss - diff_reduction) * power_ratio)
        -- 最低扣分
        if change > -5 then change = -5 end
        if change < -30 then change = -30 end

        return change
    end
end

-- 从快照构建英雄信息列表
-- @param snapshot: role_snapshot
-- @param battle_type: Const.BattleType
-- @return list: 英雄信息列表 {hero_id, level, hp, attack, defense, speed, power, ability_ids}
function M.BuildHeroInfoListFromSnapshot(snapshot, battle_type)
    if not snapshot or not snapshot.hero_data then
        return {}
    end
    local hero_ids = GLO.RoleSnapshot.GetLineupHeroIds(snapshot, battle_type or Const.BattleType.ARENA)
    local owned = snapshot.hero_data.owned_heroes or {}
    local list = {}
    for _, hid in ipairs(hero_ids) do
        local hd = owned[hid]
        if hd then
            local info = {
                hero_id = hid,
                level = hd.level or 1,
                hp = 0,
                attack = 0,
                defense = 0,
                speed = 0,
                power = 0,
                ability_ids = {},
            }
            local attr_map, combat_power = Hero.GetAttrsAndPower(snapshot, hid)
            info.power = combat_power or 0
            if attr_map then
                info.hp = attr_map[Const.Attr.HEALTH] or 0
                info.attack = attr_map[Const.Attr.STRENGTH] or 0
                info.defense = attr_map[Const.Attr.VITALITY] or 0
                info.speed = attr_map[Const.Attr.AGILITY] or 0
            end
            -- 从快照获取技能id
            if hd.learned_abilities then
                for ability_id, _ in pairs(hd.learned_abilities) do
                    table.insert(info.ability_ids, ability_id)
                end
            end
            table.insert(list, info)
        end
    end
    return list
end

-- ==================== 脏数据标记 ====================

-- 标记ArenaUser数据为脏
function M.MarkDirty(uid)
    local m_data = LOC.GetOrSetData()
    local user = m_data.m_arena_users[uid]
    if not user then
        return
    end
    -- 单个保存到MySQL arena表
    local serialized = user:Serialize()
    local data_bytes = Serializer.Simple.Serialize(serialized)
    GLO.Protobuf.SendDBMsg(MHT.MHT_ARENA_DB_C, {
        req_type = 3,   -- 保存单个
        datas = {{
            uid = uid,
            score = user.score,
            data = data_bytes,
        }},
    })
end

-- ==================== 每日重置 ====================

function M.OnDayChange()
    local m_data = LOC.GetOrSetData()
    local day_id = GLO.Utils.GetServerDayId()

    for uid, user in pairs(m_data.m_arena_users) do
        user:CheckDailyReset(day_id)
    end
    LOG_INFO("每日重置完成, %d 个用户", M.GetRegisteredCount())
end

-- ==================== 消息处理 ====================

-- 处理竞技场请求
function M.HandleArenaReq(netid, msg_data, role)
    if not role or not msg_data then
        LOG_ERROR("处理请求失败,参数无效")
        return
    end

    local req_type = msg_data.req_type or 0

    if req_type == 1 then
        -- 注册/进入竞技场
        M.HandleRegister(netid, role)
    elseif req_type == 2 then
        -- 刷新对手
        M.HandleRefresh(netid, role)
    elseif req_type == 3 then
        -- 请求战斗日志
        M.HandleBattleLogReq(netid, msg_data, role)
    else
        LOG_WARN("未知请求类型 %d", req_type)
    end
end

-- ==================== 注册处理 ====================

function M.HandleRegister(netid, role)
    local uid = role.uid
    local name = role:GetName()
    local user_name = role:GetUserName()

    local user = M.Register(uid, name, user_name)
    if not user then
        Protobuf.SendMsg(netid, MHT.MHT_ARENA_SC, {
            req_type = 1,
            ret = 0,
        })
        return
    end

    -- 检查每日重置
    local day_id = GLO.Utils.GetServerDayId()
    user:CheckDailyReset(day_id)

    -- 从在线角色复制快照(包含阵容英雄数据,用于对手展示和战斗)
    user.role_snapshot = GLO.RoleSnapshot.Snapshot(role)

    -- 从快照计算初始战力并同步到排行榜(保证离线展示时也有战力数据)
    local init_power = GLO.RoleSnapshot.CalcTeamPower(user.role_snapshot, Const.BattleType.ARENA)
    user:UpdatePower(init_power)
    GLO.RankManager.UpdateValue(Const.RankType.ARENA, uid, name, user.score, { power = init_power })

    -- 匹配对手
    local opponent_uids = M.MatchOpponents(uid)

    -- 构建对手信息列表
    local opponents = M.BuildOpponentInfoList(opponent_uids, uid)

    Protobuf.SendMsg(netid, MHT.MHT_ARENA_SC, {
        req_type = 1,
        ret = 1,
        score = user.score,
        daily_challenge_count = user.daily_challenge_count,
        daily_refresh_count = user.daily_refresh_count,
        opponents = opponents,
    })

    LOG_INFO("用户 %d 进入竞技场, 分数=%d, 对手=%d",
        uid, user.score, #opponents)
end

-- ==================== 刷新处理 ====================

function M.HandleRefresh(netid, role)
    local uid = role.uid
    local user = LOC.GetOrSetData().m_arena_users[uid]

    if not user then
        Protobuf.SendMsg(netid, MHT.MHT_ARENA_SC, {
            req_type = 2,
            ret = 0,
        })
        return
    end

    -- 刷新对手
    local opponent_uids = M.RefreshOpponents(uid)
    if not opponent_uids then
        -- 免费次数用完
        Protobuf.SendMsg(netid, MHT.MHT_ARENA_SC, {
            req_type = 2,
            ret = 0,
        })
        return
    end

    -- 更新快照
    user.role_snapshot = GLO.RoleSnapshot.Snapshot(role)

    -- 从快照重新计算战力并同步到排行榜
    local refresh_power = GLO.RoleSnapshot.CalcTeamPower(user.role_snapshot, Const.BattleType.ARENA)
    user:UpdatePower(refresh_power)
    GLO.RankManager.UpdateValue(Const.RankType.ARENA, uid, user.name, user.score, { power = refresh_power })

    local opponents = M.BuildOpponentInfoList(opponent_uids, uid)

    Protobuf.SendMsg(netid, MHT.MHT_ARENA_SC, {
        req_type = 2,
        ret = 1,
        score = user.score,
        daily_challenge_count = user.daily_challenge_count,
        daily_refresh_count = user.daily_refresh_count,
        opponents = opponents,
    })
end

-- ==================== 战后处理 ====================

-- 竞技场战斗结束回调
-- @param attacker_uid: 攻击方uid
-- @param defender_uid: 防守方uid
-- @param battle_result: Const.BattleResultType (VICTORY/DEFEAT等)
-- @param report_key: 战报key
-- @return arena_result: {is_win, score_change, attacker_score_after, defender_score_after}
function M.OnArenaBattleEnd(attacker_uid, defender_uid, battle_result, report_key)
    local m_data = LOC.GetOrSetData()
    local attacker = m_data.m_arena_users[attacker_uid]
    local defender = m_data.m_arena_users[defender_uid]

    if not attacker or not defender then
        LOG_ERROR("玩家不存在 atk=%d, def=%d",
            attacker_uid, defender_uid)
        return nil
    end

    -- 判断胜负
    local is_attacker_win = (battle_result == Const.BattleResultType.VICTORY)

    local attacker_power = attacker.power or 0
    local defender_power = defender.power or 0

    -- 计算积分变化
    local score_change = M.CalculateScoreChange(attacker, defender, is_attacker_win)

    -- 更新积分
    local old_attacker_score = attacker.score
    local old_defender_score = defender.score

    attacker.score = math.max(SCORE_MIN, math.min(SCORE_MAX, attacker.score + score_change))
    if is_attacker_win then
        -- 防守方扣分(攻击方加分的约60%)
        local def_loss = math.floor(math.abs(score_change) * 0.6)
        if def_loss < 1 then def_loss = 1 end
        defender.score = old_defender_score - def_loss
        if defender.score < SCORE_MIN then defender.score = SCORE_MIN end
    else
        -- 防守方加分(攻击方扣分的约50%)
        local def_gain = math.floor(math.abs(score_change) * 0.5)
        if def_gain < 1 then def_gain = 1 end
        defender.score = defender.score + def_gain
        if defender.score > SCORE_MAX then defender.score = SCORE_MAX end
    end

    -- 更新排行榜(战力一并存入extra_data,以便离线玩家排行榜展示)
    GLO.RankManager.UpdateValue(Const.RankType.ARENA, attacker_uid, attacker.name or "",
        attacker.score, { power = attacker_power })
    GLO.RankManager.UpdateValue(Const.RankType.ARENA, defender_uid, defender.name or "",
        defender.score, { power = defender_power })

    -- 从快照构建战斗日志英雄信息
    local attacker_hero_infos = M.BuildHeroInfoListFromSnapshot(
        attacker.role_snapshot, Const.BattleType.ARENA)
    local defender_hero_infos = M.BuildHeroInfoListFromSnapshot(
        defender.role_snapshot, Const.BattleType.ARENA)

    -- 构建战斗日志 攻击方视角
    local log = {
        time = GLO.Utils.GetServerTime(),
        report_key = report_key,
        my_heroes = attacker_hero_infos,
        opponent_uid = defender_uid,
        opponent_name = defender.name or "",
        opponent_heroes = defender_hero_infos,
        is_win = is_attacker_win,
        score_change = score_change,
        score_after = attacker.score,
    }

    -- 添加到攻击方日志
    attacker:AddBattleLog(log)

    -- 防守方日志 从防守方视角
    local def_log = {
        time = GLO.Utils.GetServerTime(),
        report_key = report_key,
        my_heroes = defender_hero_infos,
        opponent_uid = attacker_uid,
        opponent_name = attacker.name or "",
        opponent_heroes = attacker_hero_infos,
        is_win = not is_attacker_win,
        score_change = defender.score - old_defender_score,
        score_after = defender.score,
    }
    defender:AddBattleLog(def_log)

    -- 标记数据为脏(需要保存)
    M.MarkDirty(attacker_uid)
    M.MarkDirty(defender_uid)

    LOG_INFO("战斗结果: atk=%d(%s) vs def=%d(%s), win=%s, score_change=%d, atk_score=%d->%d",
        attacker_uid, attacker.name or "", defender_uid, defender.name or "",
        tostring(is_attacker_win), score_change,
        old_attacker_score, attacker.score)

    return {
        is_win = is_attacker_win,
        score_change = score_change,
        attacker_score_after = attacker.score,
        defender_score_after = defender.score,
        report_key = report_key,
    }
end

-- ==================== 战斗日志处理 ====================

-- 处理战斗日志请求
function M.HandleBattleLogReq(netid, msg_data, role)
    if not role then
        LOG_ERROR("参数无效")
        return
    end

    local uid = role.uid
    local user = LOC.GetOrSetData().m_arena_users[uid]

    if not user then
        Protobuf.SendMsg(netid, MHT.MHT_ARENA_BATTLE_LOG_SC, {
            ret = 0,
        })
        return
    end

    local battle_logs = user.battle_logs or {}

    Protobuf.SendMsg(netid, MHT.MHT_ARENA_BATTLE_LOG_SC, {
        ret = 1,
        battle_logs = battle_logs,
    })

    LOG_INFO("用户 %d 请求战斗日志, 共 %d 条", uid, #battle_logs)
end

-- ==================== 竞技场排行榜处理 ====================

-- 竞技场排行榜处理器
function M.HandleArenaRankReq(netid, rank_offset, role)
    local rank_type = Const.RankType.ARENA

    -- 确保排行榜已加载
    GLO.RankManager.LoadRank(rank_type)

    -- 获取分段数据
    local nodes, has_more, total = GLO.RankManager.GetRankPage(rank_type, rank_offset)

    -- 构建竞技场排行榜节点列表
    local rank_list = {}
    for _, node in ipairs(nodes or {}) do
        local power = (node.extra_data and node.extra_data.power) or 0

        -- 如果该用户在线,从快照获取实时阵容英雄
        local arena_user = LOC.GetOrSetData().m_arena_users[node.uid]
        local heroes = {}
        if arena_user and arena_user.role_snapshot then
            heroes = GLO.RoleSnapshot.BuildProtoHeroDataList(arena_user.role_snapshot, Const.BattleType.ARENA)
        end

        table.insert(rank_list, {
            base = {
                rank = node.rank,
                uid = node.uid,
                name = node.name or "",
                value = node.value or 0,
                power = power,
                heroes = heroes,
            },
        })
    end

    Protobuf.SendMsg(netid, MHT.MHT_ARENA_RANK_SC, {
        ret = 1,
        rank_list = rank_list,
        has_more = has_more or false,
        total = total or 0,
    })
end

-- 构建对手信息列表(使用PBHeroData复用协议)
function M.BuildOpponentInfoList(opponent_uids, exclude_uid)
    local list = {}

    for _, ouid in ipairs(opponent_uids or {}) do
        if ouid ~= exclude_uid then
            local other_user = LOC.GetOrSetData().m_arena_users[ouid]
            if other_user then
                -- 从快照构建PBHeroData列表(含属性和战力)
                local heroes = GLO.RoleSnapshot.BuildProtoHeroDataList(other_user.role_snapshot, Const.BattleType.ARENA)

                table.insert(list, {
                    uid = ouid,
                    name = other_user.name or "",
                    user_name = other_user.user_name or "",
                    score = other_user.score,
                    heroes = heroes,
                })
            end
        end
    end

    return list
end

-- ==================== 定时保存 ====================

-- 保存所有竞技场数据到MySQL arena表
function M.SaveAllToDB()
    local m_data = LOC.GetOrSetData()

    -- 收集所有用户数据
    local datas = {}
    for uid, user in pairs(m_data.m_arena_users) do
        local serialized = user:Serialize()
        local data_bytes = Serializer.Simple.Serialize(serialized)
        table.insert(datas, {
            uid = uid,
            score = user.score,
            data = data_bytes,
        })
    end

    -- 通过PArenaDb消息保存到MySQL arena表
    GLO.Protobuf.SendDBMsg(MHT.MHT_ARENA_DB_C, {
        req_type = 2,       -- 保存所有
        datas = datas,
    })
    -- LOG_INFO("保存 %d 个竞技场用户数据到arena表", #datas)
end

-- ==================== 初始化 ====================

-- 注册协议处理器
MsgManager.RegisterMsg(MHT.MHT_ARENA_CS, M.HandleArenaReq)

-- 注册竞技场排行榜自定义处理器到RankManager
GLO.RankManager.RegisterRankHandler(Const.RankType.ARENA, M.HandleArenaRankReq)

-- 注册数据库返回处理器
MsgManager.RegisterMsg(MHT.MHT_ARENA_DB_S, function(netid, msg_data, role)
    M.LoadRet(msg_data)
end)

-- 注册定时保存(每300秒)
TimerManager.CreateTimer(300, function()
    M.SaveAllToDB()
end, true)

LOG_INFO(" ArenaManager 加载完成")
return M
