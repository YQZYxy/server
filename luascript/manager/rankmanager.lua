-- ====================================================================
--  RankManager - 排行榜管理器
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = M
local Serializer = GLO.Serializer
local Utils = GLO.Utils
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local TimerManager = GLO.TimerManager
local MsgManager = GLO.MsgManager

-- ==================== 排行榜节点类 ====================

local RankNode = GLO.Class:Extend("RankNode")
M.RankNode = RankNode

function RankNode:Ctor(type, uid, name, value, extra_data)
    self.type = type or 0       -- 排行榜类型
    self.uid = uid or 0         -- 玩家uid
    self.name = name or ""      -- 玩家名字
    self.value = value or 0     -- 排行榜主值(用于排序)
    self.extra_data = extra_data or {}  -- 额外数据(自定义)
    self.rank = 0               -- 当前排名(动态计算)
end

function RankNode:Serialize()
    return {
        type = self.type,
        uid = self.uid,
        name = self.name,
        value = self.value,
        extra_data = self.extra_data,
    }
end

function RankNode:Deserialize(data)
    if not data then return end
    self.type = data.type or self.type
    self.uid = data.uid or self.uid
    self.name = data.name or self.name
    self.value = data.value or 0
    self.extra_data = data.extra_data or {}
end

-- ==================== 排行榜类型管理器 ====================

-- 注册表: rank_type -> {sort_fn, page_size, custom}
local s_rank_type_config = {}

-- 注册排行榜类型
-- @param rank_type: 排行榜类型id
-- @param config: {sort_fn, page_size, custom, battle_type}
--   sort_fn(a, b): 自定义排序函数,返回true表示a排在b前面
--   page_size: 每页数量(默认100)
--   custom: 是否自定义数据(默认false,使用基础数据)
--   battle_type: 指定后会在排行榜列表中补充该阵容的英雄数据(在线从Role取,离线从extra_data.heroes取)
function M.RegisterRankType(rank_type, config)
    config = config or {}
    s_rank_type_config[rank_type] = {
        sort_fn = config.sort_fn or nil,  -- 默认按score从大到小
        page_size = config.page_size or 100,
        custom = config.custom or false,
        battle_type = config.battle_type or nil,
    }
    LOG_INFO("RankManager: 注册排行榜类型 %d, page_size=%d", rank_type, config.page_size or 100)

    -- 注册后立即预加载数据库数据
    M.LoadRank(rank_type)
end

-- ==================== 数据管理 ====================

function LOC.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            -- [rank_type] = {[uid] = RankNode}
            m_ranks = {},
            -- 是否已加载
            m_is_loaded = {},
            -- 脏标记
            m_dirty = {},
        }
    end
    return M.m_data
end

-- 初始化(服务器启动时从数据库加载)
function M.Init()
    LOG_INFO("RankManager 初始化")
    -- 注册内置排行榜类型
    M.RegisterRankType(GLO.Const.RankType.MAIN_BATTLE, {
        page_size = 100,
        battle_type = GLO.Const.BattleType.MAIN_BATTLE,
    })
end

-- 加载指定类型的排行榜
function M.LoadRank(rank_type)
    local m_data = LOC.GetOrSetData()
    if m_data.m_is_loaded[rank_type] then
        return
    end

    m_data.m_is_loaded[rank_type] = false

    -- 从rank表加载
    GLO.Protobuf.SendDBMsg(MHT.MHT_RANK_DB_C, {
        req_type = 1,       -- 加载
        rank_type = rank_type,
    })
end

-- 排行榜数据库加载回调(由C++调用)
function M.LoadRet(msg_data)
    if not msg_data then
        LOG_ERROR("RankManager.LoadRet: 数据为空")
        return
    end

    local rank_type = msg_data.rank_type or 0
    local datas = msg_data.datas

    local m_data = LOC.GetOrSetData()

    if not m_data.m_ranks[rank_type] then
        m_data.m_ranks[rank_type] = {}
    end

    local rank_map = m_data.m_ranks[rank_type]

    if datas then
        for _, node_raw in ipairs(datas) do
            local node_data = Serializer.Simple.Deserialize(node_raw.data)
            if node_data then
                local node = RankNode:New()
                node:Deserialize(node_data)
                rank_map[node.uid] = node
            end
        end
    end

    m_data.m_is_loaded[rank_type] = true

    LOG_INFO("RankManager: 加载排行榜类型 %d, 共 %d 条数据",
        rank_type, M.GetNodeCount(rank_type))
end

-- ==================== 节点操作 ====================

-- 添加或更新节点
-- @param rank_type: 排行榜类型
-- @param uid: 玩家uid
-- @param name: 玩家名字
-- @param value: 排行榜主值
-- @param extra_data: 额外数据(可选)
function M.AddNode(rank_type, uid, name, value, extra_data)
    local m_data = LOC.GetOrSetData()

    -- 确保已加载
    if not m_data.m_is_loaded[rank_type] then
        M.LoadRank(rank_type)
    end

    if not m_data.m_ranks[rank_type] then
        m_data.m_ranks[rank_type] = {}
    end

    local rank_map = m_data.m_ranks[rank_type]
    local existing = rank_map[uid]

    if existing then
        -- 更新
        existing.name = name or existing.name
        existing.value = value or existing.value
        existing.extra_data = extra_data or existing.extra_data
    else
        -- 新增
        local node = RankNode:New(rank_type, uid, name or "", value or 0, extra_data or {})
        rank_map[uid] = node
    end

    -- 标记脏
    m_data.m_dirty[rank_type] = true

    return rank_map[uid]
end

-- 删除节点
function M.RemoveNode(rank_type, uid)
    local m_data = LOC.GetOrSetData()
    if not m_data.m_ranks[rank_type] then
        return false
    end

    if m_data.m_ranks[rank_type][uid] then
        m_data.m_ranks[rank_type][uid] = nil
        m_data.m_dirty[rank_type] = true
        return true
    end
    return false
end

-- 获取节点
function M.GetNode(rank_type, uid)
    local m_data = LOC.GetOrSetData()
    if not m_data.m_ranks[rank_type] then
        return nil
    end
    return m_data.m_ranks[rank_type][uid]
end

-- 获取节点数量
function M.GetNodeCount(rank_type)
    local m_data = LOC.GetOrSetData()
    if not m_data.m_ranks[rank_type] then
        return 0
    end
    local count = 0
    for _ in pairs(m_data.m_ranks[rank_type]) do
        count = count + 1
    end
    return count
end

-- ==================== 排序和分页 ====================

-- 获取排序后的列表
-- @param rank_type: 排行榜类型
-- @return sorted_list: 排序后的RankNode列表(带rank字段)
function M.GetSortedList(rank_type)
    local m_data = LOC.GetOrSetData()
    local rank_map = m_data.m_ranks[rank_type]
    if not rank_map then
        return {}
    end

    local config = s_rank_type_config[rank_type] or {}
    local sort_fn = config.sort_fn

    -- 收集所有节点
    local list = {}
    for _, node in pairs(rank_map) do
        table.insert(list, node)
    end

    -- 排序
    if sort_fn then
        -- 自定义排序
        table.sort(list, sort_fn)
    else
        -- 默认排序: 按value从大到小,相同value按uid从小到大
        table.sort(list, function(a, b)
            if a.value ~= b.value then
                return a.value > b.value
            end
            return a.uid < b.uid
        end)
    end

    -- 设置排名
    for i, node in ipairs(list) do
        node.rank = i
    end

    return list
end

-- 获取分段排行榜数据
-- @param rank_type: 排行榜类型
-- @param offset: 偏移(从0开始)
-- @param limit: 数量(默认使用注册时的page_size)
-- @return nodes, has_more, total
--   nodes: RankNode列表
--   has_more: 是否还有更多
--   total: 总节点数
function M.GetRankPage(rank_type, offset, limit)
    local config = s_rank_type_config[rank_type] or {}
    limit = limit or config.page_size or 100
    offset = offset or 0

    local sorted = M.GetSortedList(rank_type)
    local total = #sorted

    -- 计算分页
    local start_idx = offset + 1
    local end_idx = math.min(offset + limit, total)

    local page = {}
    if start_idx <= end_idx then
        for i = start_idx, end_idx do
            table.insert(page, sorted[i])
        end
    end

    local has_more = end_idx < total

    return page, has_more, total
end

-- 获取指定玩家的排名
-- @param rank_type: 排行榜类型
-- @param uid: 玩家uid
-- @return rank: 排名(从1开始), 0表示未找到
function M.GetPlayerRank(rank_type, uid)
    local sorted = M.GetSortedList(rank_type)
    for _, node in ipairs(sorted) do
        if node.uid == uid then
            return node.rank
        end
    end
    return 0
end

-- ==================== 保存到数据库 ====================

-- 保存指定类型的排行榜
function M.SaveRank(rank_type)
    local m_data = LOC.GetOrSetData()
    if not m_data.m_dirty[rank_type] then
        return
    end

    local rank_map = m_data.m_ranks[rank_type]
    if not rank_map then
        return
    end

    local datas = {}
    for uid, node in pairs(rank_map) do
        local serialized = node:Serialize()
        local data_bytes = Serializer.Simple.Serialize(serialized)
        table.insert(datas, {
            uid = uid,
            name = node.name or "",
            data = data_bytes,
        })
    end

    -- 通过PRankDb消息保存到MySQL rank表
    GLO.Protobuf.SendDBMsg(MHT.MHT_RANK_DB_C, {
        req_type = 2,       -- 保存
        rank_type = rank_type,
        datas = datas,
    })
    LOG_INFO("RankManager: 保存排行榜类型 %d, %d 条数据", rank_type, #datas)

    m_data.m_dirty[rank_type] = false
end

-- 保存所有排行榜
function M.SaveAll()
    local m_data = LOC.GetOrSetData()
    for rank_type, _ in pairs(m_data.m_dirty) do
        M.SaveRank(rank_type)
    end
end

-- ==================== 辅助函数 ====================

-- 更新玩家排行榜值
-- @param rank_type: 排行榜类型
-- @param uid: 玩家uid
-- @param name: 玩家名字
-- @param value: 新值
function M.UpdateValue(rank_type, uid, name, value, extra_data)
    local node = M.AddNode(rank_type, uid, name, value, extra_data)
    -- -- 立即单个保存到数据库
    -- if node then
    --     M.SaveSingleNode(rank_type, node)
    -- end
    return node
end

-- 更新排行榜(带阵容数据,自动将阵容英雄信息合并到extra_data)
-- @param role: 角色实例
-- @param rank_type: 排行榜类型
-- @param value: 排行榜主值
-- @param extra_data: 额外数据(可选,会自动合并power和heroes)
-- @param battle_type: 阵容类型(Const.BattleType),构建阵容数据合并到extra_data
function M.UpdateRankWithLineup(role, rank_type, value, extra_data, battle_type)
    if not role or not rank_type or not battle_type then
        LOG_ERROR("RankManager.UpdateRankWithLineup: 参数无效")
        return
    end
    extra_data = extra_data or {}
    local snapshot = GLO.RoleBattleSnapshot.Snapshot(role)
    if snapshot then
        extra_data.power = value
        extra_data.heroes = GLO.RoleBattleSnapshot.BuildProtoHeroDataList(snapshot, battle_type)
    end
    M.UpdateValue(rank_type, role.uid, role:GetName() or "", value, extra_data)
end

-- 保存单个排行榜节点到数据库
-- @param rank_type: 排行榜类型
-- @param node: RankNode实例
function M.SaveSingleNode(rank_type, node)
    if not node then
        return
    end
    local serialized = node:Serialize()
    local data_bytes = Serializer.Simple.Serialize(serialized)
    GLO.Protobuf.SendDBMsg(MHT.MHT_RANK_DB_C, {
        req_type = 3,   -- 保存单个
        rank_type = rank_type,
        datas = {{
            uid = node.uid,
            name = node.name or "",
            value = node.value or 0,
            data = data_bytes,
        }},
    })
end

-- 批量更新排行榜
-- @param rank_type: 排行榜类型
-- @param nodes: {uid, name, value, extra_data}列表
function M.BatchUpdate(rank_type, nodes)
    for _, n in ipairs(nodes or {}) do
        M.AddNode(rank_type, n.uid, n.name, n.value, n.extra_data)
    end
end

-- 清理排行榜
function M.ClearRank(rank_type)
    local m_data = LOC.GetOrSetData()
    m_data.m_ranks[rank_type] = {}
    m_data.m_dirty[rank_type] = true
    LOG_INFO("RankManager: 清空排行榜类型 %d", rank_type)
end

-- ==================== 定时保存 ====================

TimerManager.CreateTimer(300, function()
    M.SaveAll()
end, true)

-- ==================== 排行榜协议路由 ====================

-- 排行榜类型自定义处理器注册表: rank_type -> handler_fn(netid, rank_offset, role)
local s_rank_handlers = {}

-- 注册排行榜类型自定义处理器
-- 当客户端请求该排行榜时,路由到自定义处理器而非通用排行榜逻辑
-- @param rank_type: 排行榜类型
-- @param handler_fn: function(netid, rank_offset, role) end
function M.RegisterRankHandler(rank_type, handler_fn)
    s_rank_handlers[rank_type] = handler_fn
    LOG_INFO("RankManager: 注册排行榜类型 %d 自定义处理器", rank_type)
end

-- 处理通用排行榜请求(PRank_CS / MHT_RANK_CS)
function M.HandleRankReq(netid, msg_data, role)
    if not msg_data then
        LOG_ERROR("参数无效")
        return
    end

    local rank_type = msg_data.rank_type or GLO.Const.RankType.NONE
    local rank_offset = msg_data.rank_offset or 0

    if GLO.Const.RankType.NONE == rank_type then
        LOG_ERROR("参数无效 rank_type" .. rank_type)
        return
    end

    -- 检查是否有自定义处理器
    local handler = s_rank_handlers[rank_type]
    if handler then
        handler(netid, rank_offset, role)
        return
    end

    -- 默认通用排行榜逻辑
    M.LoadRank(rank_type)
    local config = s_rank_type_config[rank_type] or {}

    -- 获取分段数据
    local nodes, has_more, total = M.GetRankPage(rank_type, rank_offset)

    -- 构建通用排行榜节点列表
    local rank_list = {}
    for _, node in ipairs(nodes or {}) do
        local power = (node.extra_data and node.extra_data.power) or 0
        local heroes = {}

        -- 从extra_data直接取完整英雄数据
        if config.battle_type and node.extra_data and node.extra_data.heroes then
            heroes = node.extra_data.heroes
        end

        table.insert(rank_list, {
            rank = node.rank,
            uid = node.uid,
            name = node.name or "",
            value = node.value or 0,
            power = power,
            heroes = heroes,
        })
    end

    GLO.Protobuf.SendMsg(netid, MHT.MHT_RANK_SC, {
        rank_type = rank_type,
        ret = 1,
        rank_list = rank_list,
        has_more = has_more or false,
        total = total or 0,
    })

    -- LOG_INFO("RankManager: 通用排行榜请求 type=%d, offset=%d, count=%d, total=%d",
    --     rank_type, rank_offset, #rank_list, total or 0)
end

-- 注册通用排行榜协议处理器
MsgManager.RegisterMsg(MHT.MHT_RANK_CS, M.HandleRankReq)

-- 注册数据库返回处理器
MsgManager.RegisterMsg(MHT.MHT_RANK_DB_S, function(netid, msg_data, role)
    M.LoadRet(msg_data)
end)

LOG_INFO(" RankManager 加载完成")
return M
