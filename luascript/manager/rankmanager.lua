-- ====================================================================
--  RankManager - 排行榜管理器
--  排序:
--    按节点自身数值排序, 顺序为 主值 -> param1 -> param2 -> param3 -> 更新时间 -> uid
--    前 4 个键的方向由注册时的 orders 决定,更新时间固定升序(同键值时先达到的靠前)
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = M
local Serializer = GLO.Serializer
local MHT = GLO.MHT
local TimerManager = GLO.TimerManager
local MsgManager = GLO.MsgManager
local RankDef = GLO.RankDef

-- 排序键数量: 主值 + 3 个参数(RANK_ORDER_COUNT 保持一致)
local RANK_ORDER_COUNT = 4
-- 缺省排序只按主值降序
local DEFAULT_ORDERS = { "desc" }

-- ==================== 排行榜类型管理器 ====================

-- 注册表: rank_type -> {page_size, battle_type, orders}
local s_rank_type_config = {}

-- 生成下发给 C++ 的排序方向: { "desc", "asc", ... }, 下标即比较优先级
function LOC.BuildOrders(rank_config)
    local orders = rank_config.orders or DEFAULT_ORDERS

    local specs = {}
    for i = 1, math.min(#orders, RANK_ORDER_COUNT) do
        specs[i] = orders[i]
    end
    if #specs == 0 then
        specs[1] = "desc"
    end
    return specs
end

-- 注册排行榜类型
-- rank_type: 排行榜类型id
-- config: {
--   page_size = 100,                 -- 每页数量
--   battle_type = ,                  -- 指定后排行榜列表会附带该阵容的英雄数据
--   orders = { "desc", "asc" },      -- 排序方向, 依次对应 主值/param1/param2/param3
-- }
function M.RegisterRankType(rank_type, config)
    config = config or {}

    local rank_config = {
        page_size = config.page_size or 100,
        battle_type = config.battle_type or nil,
        orders = config.orders or DEFAULT_ORDERS,
    }
    s_rank_type_config[rank_type] = rank_config

    cpp_RankConfigure(rank_type, LOC.BuildOrders(rank_config))
    cpp_RankClear(rank_type)

    -- 数据已重置,加载状态与本地缓存一并作废,等待数据库重新拉取
    local m_data = LOC.GetOrSetData()
    m_data.m_is_loaded[rank_type] = nil
    LOC.ClearNodeCache(rank_type)

    LOG_INFO("RankManager: 注册排行榜类型 %d, page_size=%d, orders=%d",
        rank_type, rank_config.page_size, #rank_config.orders)

    M.LoadRank(rank_type)
end

-- ==================== 数据管理 ====================

function LOC.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            -- [rank_type] = 加载状态: nil=未请求 false=请求中 true=已加载
            m_is_loaded = {},
            -- [rank_type] = 脏标记
            m_dirty = {},
            -- [rank_type] = {[uid] = {time = 节点更新时间, node = 解析后的节点数据}}
            m_node_cache = {},
        }
    end
    return M.m_data
end

-- 加载指定类型的排行榜
-- m_is_loaded 状态: nil=未请求 false=请求中 true=已加载
function M.LoadRank(rank_type)
    local m_data = LOC.GetOrSetData()
    if nil ~= m_data.m_is_loaded[rank_type] then
        return
    end

    m_data.m_is_loaded[rank_type] = false

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
    local m_data = LOC.GetOrSetData()

    -- 重新加载会覆盖整张榜,旧的节点缓存全部作废
    LOC.ClearNodeCache(rank_type)

    local load_count = 0
    for _, node in ipairs(msg_data.datas or {}) do
        -- 落库时扩展数据存在 power/heroes, 这里还原成通用排行榜组件使用的字符串
        local extra_data = {
            power = node.power or 0,
            heroes = node.heroes or {},
        }
        local rank = cpp_RankLoadNode(rank_type, node.uid, node.name or "",
            node.value or 0, node.param1 or 0, node.param2 or 0, node.param3 or 0,
            node.update_time or 0, Serializer.Simple.Serialize(extra_data))
        if not rank or rank <= 0 then
            LOG_ERROR("RankManager: 加载排行榜节点失败 rank_type=%d uid=%s",
                rank_type, tostring(node.uid))
        else
            load_count = load_count + 1
        end
    end

    m_data.m_is_loaded[rank_type] = true

    LOG_INFO("RankManager: 加载排行榜类型 %d, 共 %d 条数据", rank_type, load_count)
end

-- ==================== 节点数据解析 ====================

-- 把 C++ 返回的节点转成表
-- 以节点更新时间判断缓存是否可用,内容没变时直接复用,避免重复解析附加数据
-- entry: cpp_Rank* 返回的节点 {rank, uid, name, value, param1..3, time, data}
function LOC.DecodeEntry(rank_type, entry)
    local m_data = LOC.GetOrSetData()
    local node_cache = m_data.m_node_cache[rank_type]
    if not node_cache then
        node_cache = {}
        m_data.m_node_cache[rank_type] = node_cache
    end

    local cached = node_cache[entry.uid]
    if cached and cached.time == entry.time then
        cached.node.rank = entry.rank
        return cached.node
    end

    local node = {
        type = rank_type,
        uid = entry.uid,
        name = entry.name or "",
        value = entry.value or 0,
        param1 = entry.param1 or 0,
        param2 = entry.param2 or 0,
        param3 = entry.param3 or 0,
        update_time = entry.time or 0,
        extra_data = LOC.DecodeExtraData(rank_type, entry),
        rank = entry.rank,
    }

    node_cache[entry.uid] = { time = entry.time, node = node }
    return node
end

-- 解析附加数据
-- extra_data: 反序列化失败时返回空表
function LOC.DecodeExtraData(rank_type, entry)
    if not entry.data or entry.data == "" then
        return {}
    end

    local ok, decoded = pcall(Serializer.Simple.Deserialize, entry.data)
    if not ok or type(decoded) ~= "table" then
        LOG_ERROR("RankManager: 排行榜数据解析失败 rank_type=%d uid=%s",
            rank_type, tostring(entry.uid))
        return {}
    end
    return decoded
end

-- 清理节点缓存
-- uid: 指定 uid 只清该节点,传 nil 清空整个排行榜类型
function LOC.ClearNodeCache(rank_type, uid)
    local m_data = LOC.GetOrSetData()
    local node_cache = m_data.m_node_cache[rank_type]
    if not node_cache then
        return
    end

    if uid then
        node_cache[uid] = nil
    else
        m_data.m_node_cache[rank_type] = nil
    end
end

-- ==================== 节点操作 ====================

-- 添加或更新节点
-- rank_type: 排行榜类型
-- value: 排行榜主值
-- params: {param1, param2, param3} 自定义排序参数(可选)
-- extra_data: 业务数据
-- node: 排行榜节点, 写入失败返回 nil
function M.AddNode(rank_type, uid, name, value, params, extra_data)
    local m_data = LOC.GetOrSetData()

    if not m_data.m_is_loaded[rank_type] then
        M.LoadRank(rank_type)
    end

    uid = uid or 0
    if uid <= 0 then
        LOG_ERROR("RankManager.AddNode: uid 无效 rank_type=%d", rank_type)
        return nil
    end

    local param1 = params and params[1] or 0
    local param2 = params and params[2] or 0
    local param3 = params and params[3] or 0
    local data_bytes = Serializer.Simple.Serialize(extra_data or {})

    -- 更新排行榜节点
    local rank, update_time = cpp_RankUpsert(rank_type, uid, name or "", value or 0,
        param1, param2, param3, data_bytes)
    if not rank or rank <= 0 then
        LOG_ERROR("RankManager.AddNode: 写入排行榜失败 rank_type=%d uid=%d", rank_type, uid)
        return nil
    end

    m_data.m_dirty[rank_type] = true

    -- 刚落库的节点与 C++ 中数据一致,直接更新缓存
    local node = {
        type = rank_type,
        uid = uid,
        name = name or "",
        value = value or 0,
        param1 = param1,
        param2 = param2,
        param3 = param3,
        update_time = update_time,
        extra_data = extra_data or {},
        rank = rank,
    }
    m_data.m_node_cache[rank_type] = m_data.m_node_cache[rank_type] or {}
    m_data.m_node_cache[rank_type][uid] = { time = update_time, node = node }

    return node
end

-- 删除节点
function M.RemoveNode(rank_type, uid)
    local m_data = LOC.GetOrSetData()

    if not cpp_RankRemove(rank_type, uid) then
        return false
    end

    m_data.m_dirty[rank_type] = true
    LOC.ClearNodeCache(rank_type, uid)
    return true
end

-- 获取节点 不存在返回 nil
function M.GetNode(rank_type, uid)
    if not uid or uid <= 0 then
        return nil
    end

    local entry = cpp_RankGetNode(rank_type, uid)
    if not entry then
        return nil
    end
    return LOC.DecodeEntry(rank_type, entry)
end

-- 获取节点数量
function M.GetNodeCount(rank_type)
    return cpp_RankCount(rank_type) or 0
end

-- ==================== 排序和分页 ====================

-- 获取分段排行榜数据
-- offset: 偏移(从0开始)
-- limit: 数量(默认使用注册时的page_size)
-- 返回 nodes,has_more,total
function M.GetRankPage(rank_type, offset, limit)
    local rank_config = s_rank_type_config[rank_type]
    if not rank_config then
        LOG_ERROR("GetRankPage: 排行榜类型未注册 rank_type=" .. tostring(rank_type))
        return {}, false, 0
    end
    offset = offset or 0
    limit = limit or rank_config.page_size
    if limit <= 0 then
        limit = rank_config.page_size
    end

    local result = cpp_RankGetPage(rank_type, offset, limit)
    if not result then
        LOG_ERROR("GetRankPage: 排行榜数据获取失败 rank_type=" .. tostring(rank_type))
        return {}, false, 0
    end
    -- 榜单为空时协议不下发对应字段, 这里按空集处理
    local list = result.list
    if not list then
        list = {}
    end
    local total = result.total
    if not total then
        total = 0
    end
    local nodes = {}
    for _, entry in ipairs(list) do
        table.insert(nodes, LOC.DecodeEntry(rank_type, entry))
    end

    return nodes, result.has_more == true, total
end

-- 获取排序后的完整列表
-- rank_type: 排行榜类型
-- sorted_list: 排序后的节点列表
function M.GetSortedList(rank_type)
    local total = M.GetNodeCount(rank_type)
    if total <= 0 then
        return {}
    end
    return M.GetRankPage(rank_type, 0, total) or {}
end

-- 获取指定玩家的排名
-- @return rank: 排名(从1开始),0表示未找到
function M.GetPlayerRank(rank_type, uid)
    if not uid or uid <= 0 then
        return 0
    end
    return cpp_RankGetRank(rank_type, uid) or 0
end

-- ==================== 保存到数据库 ====================

-- 把 cpp_Rank* 返回的节点转成落库结构 PB_RankNode
function LOC.BuildDbNode(rank_type, entry)
    local extra_data = LOC.DecodeExtraData(rank_type, entry)
    return {
        uid = entry.uid,
        name = entry.name or "",
        value = entry.value or 0,
        param1 = entry.param1 or 0,
        param2 = entry.param2 or 0,
        param3 = entry.param3 or 0,
        update_time = entry.time or 0,
        power = extra_data.power or 0,
        heroes = extra_data.heroes or {},
    }
end

-- 保存指定类型的排行榜
function M.SaveRank(rank_type)
    local m_data = LOC.GetOrSetData()
    if not m_data.m_dirty[rank_type] then
        return
    end

    -- 还没从数据库加载完成时不能回写,否则会把库里已有的数据覆盖成空
    if not m_data.m_is_loaded[rank_type] then
        LOG_WARN("RankManager: 排行榜类型 %d 未加载完成, 跳过本次保存", rank_type)
        return
    end

    local datas = {}
    for _, entry in ipairs(cpp_RankGetAll(rank_type) or {}) do
        table.insert(datas, LOC.BuildDbNode(rank_type, entry))
    end

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
-- rank_type: 排行榜类型
-- uid: 玩家uid
-- name: 玩家名字
-- value: 新值
-- params: {param1, param2, param3} 自定义排序参数(可选)
-- extra_data: 业务数据
function M.UpdateValue(rank_type, uid, name, value, params, extra_data)
    return M.AddNode(rank_type, uid, name, value, params, extra_data)
end

-- 保存单个排行榜节点到数据库
-- rank_type: 排行榜类型
-- node: 业务节点(至少包含 uid)
function M.SaveSingleNode(rank_type, node)
    if not node or not node.uid then
        return
    end

    local entry = cpp_RankGetNode(rank_type, node.uid)
    if not entry then
        return
    end

    GLO.Protobuf.SendDBMsg(MHT.MHT_RANK_DB_C, {
        req_type = 3,   -- 保存单个
        rank_type = rank_type,
        datas = { LOC.BuildDbNode(rank_type, entry) },
    })
end

-- 批量更新排行榜
-- rank_type: 排行榜类型
-- nodes: {uid, name, value, params, extra_data}列表
function M.BatchUpdate(rank_type, nodes)
    for _, n in ipairs(nodes or {}) do
        M.AddNode(rank_type, n.uid, n.name, n.value, n.params, n.extra_data)
    end
end

-- 清理排行榜
function M.ClearRank(rank_type)
    local m_data = LOC.GetOrSetData()

    cpp_RankClear(rank_type)
    m_data.m_dirty[rank_type] = true
    LOC.ClearNodeCache(rank_type)

    LOG_INFO("RankManager: 清空排行榜类型 %d", rank_type)
end

-- ==================== 定时保存 ====================

TimerManager.CreateTimer(300, function()
    M.SaveAll()
end, true)

-- ==================== 排行榜协议路由 ====================

-- 排行榜类型自定义处理器注册表: rank_type -> handler_fn(netid, role, rank_offset)
local s_rank_handlers = {}

-- 注册排行榜类型自定义处理器
-- 当客户端请求该排行榜时,路由到自定义处理器而非通用排行榜逻辑
-- rank_type: 排行榜类型
-- handler_fn: function(netid, role, rank_offset) end
function M.RegisterRankHandler(rank_type, handler_fn)
    s_rank_handlers[rank_type] = handler_fn
    LOG_INFO("RankManager: 注册排行榜类型 %d 自定义处理器", rank_type)
end

-- 构建通用排行榜协议节点
-- rank_node: PB_RankNode 结构
function M.BuildRankNode(node, rank_config)
    local power = (node.extra_data and node.extra_data.power) or 0
    local heroes = {}

    -- 从extra_data直接取完整数据
    if rank_config.battle_type and node.extra_data and node.extra_data.heroes then
        heroes = node.extra_data.heroes
    end

    return {
        rank = node.rank,
        uid = node.uid,
        name = node.name or "",
        value = node.value or 0,
        param1 = node.param1 or 0,
        param2 = node.param2 or 0,
        param3 = node.param3 or 0,
        update_time = node.update_time or 0,
        power = power,
        heroes = heroes,
    }
end

-- 处理通用排行榜请求
MsgManager.RegisterMsg(MHT.MHT_RANK_CS,function(netid, role, msg_data)
    if not msg_data then
        LOG_ERROR("参数无效")
        return
    end

    local rank_type = msg_data.rank_type or RankDef.RankType.NONE
    local rank_offset = msg_data.rank_offset or 0

    if RankDef.RankType.NONE == rank_type then
        LOG_ERROR("参数无效 rank_type" .. rank_type)
        return
    end

    -- 检查是否有自定义处理器
    local handler = s_rank_handlers[rank_type]
    if handler then
        handler(netid, role, rank_offset)
        return
    end

    M.LoadRank(rank_type)
    local rank_config = s_rank_type_config[rank_type] or {}

    -- 获取分段数据
    local nodes, has_more, total = M.GetRankPage(rank_type, rank_offset)

    -- 构建通用排行榜节点列表
    local rank_list = {}
    for _, node in ipairs(nodes or {}) do
        table.insert(rank_list, M.BuildRankNode(node, rank_config))
    end

    GLO.Protobuf.SendMsg(netid, MHT.MHT_RANK_SC, {
        rank_type = rank_type,
        ret = 1,
        rank_list = rank_list,
        has_more = has_more or false,
        total = total or 0,
    })
end)

-- 注册数据库返回处理器
MsgManager.RegisterMsg(MHT.MHT_RANK_DB_S, function(netid, role, msg_data)
    M.LoadRet(msg_data)
end)

LOG_INFO(" RankManager 加载完成")
return M
