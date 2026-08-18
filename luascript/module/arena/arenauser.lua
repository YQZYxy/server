-- ====================================================================
--  ArenaUser - 竞技场用户数据模型
--  管理单个玩家的竞技场数据
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = {}
local Serializer = GLO.Serializer
local Utils = GLO.Utils

-- ArenaUser类
local ArenaUser = GLO.Class:Extend("ArenaUser")
M.ArenaUser = ArenaUser

-- ==================== 构造函数 ====================

-- @param uid: 玩家uid
-- @param name: 玩家名字
-- @param user_name: 玩家用户名
function ArenaUser:Ctor(uid, name, user_name)
    self.uid = uid or 0
    self.name = name or ""
    self.user_name = user_name or ""

    -- 竞技场基础数据
    self.score = 1000                 -- 积分,默认1000
    self.power = 0                    -- 战力(阵容英雄战力之和)

    -- 角色快照(注册竞技场时从在线角色复制,用于对手展示和战斗)
    -- 结构: {base_info={uid,name,user_name}, hero_data={owned_heroes={...}, lineups={...}}}
    self.role_snapshot = nil

    -- 每日数据(跨天重置)
    self.daily_challenge_count = 0    -- 今日已挑战次数
    self.daily_refresh_count = 0      -- 今日已刷新次数
    self.last_day_id = 0              -- 上次重置的dayid

    -- 每日限制
    self.max_daily_challenge = 5      -- 每日最大挑战次数
    self.max_daily_free_refresh = 3   -- 每日免费刷新次数

    -- 当前对手列表(uid列表)
    self.opponent_uids = {}

    -- 上次匹配时间戳(用于刷新冷却)
    self.last_match_time = 0

    -- 战斗日志(最近N条)
    self.battle_logs = {}

    -- 最大日志条数
    self.max_battle_logs = 20

    -- 是否在竞技场中(已注册)
    self.is_registered = false
end

-- ==================== 序列化/反序列化 ====================

-- 序列化到table(用于存储到MySQL)
function ArenaUser:Serialize()
    return {
        uid = self.uid,
        name = self.name,
        user_name = self.user_name,
        score = self.score,
        power = self.power,
        role_snapshot = self.role_snapshot,
        daily_challenge_count = self.daily_challenge_count,
        daily_refresh_count = self.daily_refresh_count,
        last_day_id = self.last_day_id,
        max_daily_challenge = self.max_daily_challenge,
        max_daily_free_refresh = self.max_daily_free_refresh,
        opponent_uids = self.opponent_uids,
        last_match_time = self.last_match_time,
        battle_logs = self.battle_logs,
        is_registered = self.is_registered,
    }
end

-- 反序列化(从MySQL加载)
-- @param data_table: 从数据库反序列化的table
function ArenaUser:Deserialize(data_table)
    if not data_table then
        return
    end
    self.uid = data_table.uid or self.uid
    self.name = data_table.name or self.name
    self.user_name = data_table.user_name or self.user_name
    self.score = data_table.score or 1000
    self.power = data_table.power or 0
    self.role_snapshot = data_table.role_snapshot
    self.daily_challenge_count = data_table.daily_challenge_count or 0
    self.daily_refresh_count = data_table.daily_refresh_count or 0
    self.last_day_id = data_table.last_day_id or 0
    self.max_daily_challenge = data_table.max_daily_challenge or 5
    self.max_daily_free_refresh = data_table.max_daily_free_refresh or 3
    self.opponent_uids = data_table.opponent_uids or {}
    self.last_match_time = data_table.last_match_time or 0
    self.battle_logs = data_table.battle_logs or {}
    self.max_battle_logs = 20
    self.is_registered = data_table.is_registered or false
end

-- ==================== 每日重置 ====================

-- 检查并重置每日数据
function ArenaUser:CheckDailyReset(day_id)
    if self.last_day_id ~= day_id then
        self.daily_challenge_count = 0
        self.daily_refresh_count = 0
        self.last_day_id = day_id
        LOG_INFO("ArenaUser每日重置: uid=%d, new_day_id=%d", self.uid, day_id)
        return true
    end
    return false
end

-- ==================== 数据访问 ====================

-- 获取剩余挑战次数
function ArenaUser:GetRemainingChallenges()
    return math.max(0, self.max_daily_challenge - self.daily_challenge_count)
end

-- 获取剩余免费刷新次数
function ArenaUser:GetRemainingFreeRefreshes()
    return math.max(0, self.max_daily_free_refresh - self.daily_refresh_count)
end

-- 是否还有挑战次数
function ArenaUser:CanChallenge()
    return self:GetRemainingChallenges() > 0
end

-- 是否还可以免费刷新
function ArenaUser:CanFreeRefresh()
    return self:GetRemainingFreeRefreshes() > 0
end

-- ==================== 操作接口 ====================

-- 消耗一次挑战次数
function ArenaUser:ConsumeChallenge()
    if self:CanChallenge() then
        self.daily_challenge_count = self.daily_challenge_count + 1
        return true
    end
    return false
end

-- 消耗一次免费刷新
function ArenaUser:ConsumeFreeRefresh()
    if self:CanFreeRefresh() then
        self.daily_refresh_count = self.daily_refresh_count + 1
        return true
    end
    return false
end

-- 添加战斗日志
-- @param log: PArenaBattleLog结构table
function ArenaUser:AddBattleLog(log)
    table.insert(self.battle_logs, log)
    -- 超出数量删除最旧的
    while #self.battle_logs > self.max_battle_logs do
        table.remove(self.battle_logs, 1)
    end
end

-- 更新战力
function ArenaUser:UpdatePower(new_power)
    self.power = new_power
end

function ArenaUser:GetPower(new_power)
    return self.power
end

-- 更新名字(登录时同步)
function ArenaUser:UpdateName(name)
    if name and name ~= "" then
        self.name = name
    end
end

-- ==================== GM ====================

GLO.Gm.RegisterCommand("arena", "竞技场", function (args, role)
    if #args < 1 then
        return false,"用法:arena <req_type>"
    end

    local uid = role and role:GetUid() or 0
    local user =  GLO.ArenaManager.GetArenaUser(uid)
    local req_type = tonumber(args[1])
    if 1 == req_type and user then
        user.daily_challenge_count = 0
        user.daily_refresh_count = 0
        LOG_INFO("重置挑战次数和刷新次数")
    end

    return true, "成功"
end)

LOG_INFO(" ArenaUser 加载完成")
return M
