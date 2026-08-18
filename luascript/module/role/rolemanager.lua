-- ====================================================================
--  RoleManager - 角色管理器
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = {}
local Utils = GLO.Utils
local Serializer = GLO.Serializer
local ProtoBuf = GLO.Protobuf
local TimerManager = GLO.TimerManager
local EventManager = GLO.EventManager
local MHT = GLO.MHT

-- 离线角色缓存TTL(秒)
local OFFLINE_CACHE_TTL = 600  -- 10分钟无访问自动清除

-- 获取或初始化数据
function LOC.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            m_roles = {
                --[[
                [uid] = {
                    -- role   = {} Role实例
                    -- m_roledata = {} 角色原始数据
                }
                --]]
            },
            -- 离线角色缓存(仅保留roledata,无Role实例)
            -- [uid] = {m_roledata = {}, last_access_time = timestamp}
            m_offline_cache = {},
            -- 正在加载中的uid(避免重复发送FIND请求)
            m_pending_find = {},
            -- netid反向索引 [netid] = Role实例,用于查找
            m_netid_map = {},
        }
    end
    
    return M.m_data
end

-- 创建角色数据内容部分(lua_role_data字段, 后续模块再表内加数据)
function LOC.CreateLuaRoleData(uid)
    return {
        -- 基础信息
        uid = uid or 0,
        level = 1,
        exp = 0,

        -- 时间戳
        last_login_time = 0,
    }
end

-- 创建完整角色数据结构
function LOC.CreateRoleData(uid, name, level)
    return {
        base_info = {
            uid = uid or 0,
            name = name or "",
            user_name = "",
        },
        lua_role_data = LOC.CreateLuaRoleData(uid),
    }
end

-- 获取完整角色数据
function LOC.GetOrSetRoleData(uid)
    local data = LOC.GetOrSetData()
    local entry = data.m_roles[uid]
    if not entry then
        return nil
    end
    if entry.m_roledata then
        return entry.m_roledata
    end
    local role_data = LOC.LoadRoleDataFromCpp(uid)
    if role_data and entry then
        entry.m_roledata = role_data
    end
    return role_data
end

-- ==================初始化和清理==================

-- 清理角色管理器
function M.Shutdown()
    LOG_INFO("开始清理")

    -- 强制保存所有数据
    M.SaveAllRoleData()

    -- 清理所有角色
    M.RemoveAllRoles()

    -- 清理所有数据
    M.RemoveAllRoleData()

    LOG_INFO("清理完成")
end

-- ==================角色实例==================

-- 创建角色
function LOC.CreateRole(uid)
    local data = LOC.GetOrSetData()
    
    -- 检查是否已存在
    if data.m_roles[uid] and data.m_roles[uid].role then
        LOG_ERROR("角色已存在 uid:" .. tostring(uid))
        return data.m_roles[uid].role
    end

    -- 从C++加载数据
    local role_data, netid = LOC.LoadRoleDataFromCpp(uid)
    if not role_data then
        LOG_ERROR("加载角色数据失败 uid:" .. tostring(uid))
        return nil
    end

    if not netid then
        LOG_ERROR("C++返回netid为空 uid:" .. tostring(uid))
        return nil
    end

    -- 创建角色实例
    local role = GLO.Role.Role:New(uid, netid)
    if not role then
        LOG_ERROR("创建角色实例失败 uid:" .. tostring(uid))
        return nil
    end

    -- 先存入缓存
    local entry = {
        role = role,
        m_roledata = role_data
    }
    data.m_roles[uid] = entry
    data.m_netid_map[netid] = role

    -- 初始化角色子模块
    if not role:Init(uid) then
        LOG_ERROR("初始化角色实例失败 uid:" .. tostring(uid) .. " netid:" .. netid)
        data.m_roles[uid] = nil
        data.m_netid_map[netid] = nil
        return nil
    end

    -- 启动该角色的独立定时保存
    TimerManager.CreateTimer(60, function()
        local d = LOC.GetOrSetData()
        if d.m_roles[uid] and d.m_roles[uid].m_roledata then
            M.SaveRoleData(uid)
        end
    end, true)

    LOG_INFO("创建角色成功 uid:" .. tostring(uid) .. " name:" .. role:GetName())
    return role
end

-- 获取角色
function M.GetRole(uid)
    local data = LOC.GetOrSetData()
    local entry = data.m_roles[uid]
    if entry and entry.role then
        return entry.role
    end
    -- 缓存未命中,尝试C++加载
    return LOC.CreateRole(uid)
end

-- 通过netid获取角色(索引查找)
function M.GetRoleByNetid(netid)
    local data = LOC.GetOrSetData()
    return data.m_netid_map[netid]
end

-- 删除角色
function M.RemoveRole(uid)
    local data = LOC.GetOrSetData()
    local entry = data.m_roles[uid]
    if not entry or not entry.role then
        LOG_WARN("角色不存在,无法删除 uid:" .. tostring(uid))
        return false
    end

    -- 保存数据
    M.SaveRoleData(uid)

    -- 清理netid索引
    if entry.role then
        local old_netid = entry.role:GetNetid()
        if old_netid and data.m_netid_map[old_netid] == entry.role then
            data.m_netid_map[old_netid] = nil
        end
    end

    -- 清理缓存
    data.m_roles[uid] = nil

    LOG_INFO("删除角色 uid:" .. tostring(uid))
    return true
end

-- 获取所有角色
function M.GetAllRoles()
    local data = LOC.GetOrSetData()
    return data.m_roles
end

-- 获取角色数量
function M.GetRoleCount()
    local data = LOC.GetOrSetData()
    local count = 0
    for _ in pairs(data.m_roles) do
        count = count + 1
    end
    return count
end

-- 清理所有角色
function M.RemoveAllRoles()
    local data = LOC.GetOrSetData()
    local uids = {}
    for uid,_ in pairs(data.m_roles) do
        table.insert(uids,uid)
    end

    for _,uid in ipairs(uids) do
        M.RemoveRole(uid)
    end

    LOG_INFO("清理所有角色,数量:" .. #uids)
end

-- 通过ASC获取角色
function M.GetRoleByASC(asc)
    local data = LOC.GetOrSetData()
    for _,entry in pairs(data.m_roles) do
        if entry.role and entry.role.asc == asc then
            return entry.role
        end
    end
    return nil
end

-- ==================离线角色缓存==================

-- 从C++加载角色数据(不创建Role实例,用于离线缓存)
-- @param uid: 玩家uid
-- @return role_data: PBRoleData结构table,失败返回nil
function LOC.LoadRoleDataDirect(uid)
    local data = LOC.GetOrSetData()

    -- 避免重复发送FIND请求
    if data.m_pending_find[uid] then
        return nil
    end
    data.m_pending_find[uid] = true

    -- 发送PE_INIT_TYPE_FIND请求到DB服务器异步查询
    -- 查询结果通过cpp_OnInitRoleDataFindRet事件回调处理
    GLO.Protobuf.SendDBMsg(MHT.MHT_INIT_ROLE_DATA_C, {
        req_type = 2,   -- PE_INIT_TYPE_FIND
        uid = uid,
    })
    return nil
end

-- 获取角色完整数据(优先在线,其次离线缓存)
-- @param uid: 玩家uid
-- @return role_data: PBRoleData结构table(包含base_info,lua_role_data等)
function M.GetRoleDataEx(uid)
    local data = LOC.GetOrSetData()

    -- 优先找在线角色
    local entry = data.m_roles[uid]
    if entry and entry.m_roledata then
        return entry.m_roledata
    end

    -- 尝试离线缓存
    local cached = data.m_offline_cache[uid]
    if cached and cached.m_roledata then
        -- 更新访问时间
        cached.last_access_time = GLO.Utils.GetServerTime()
        return cached.m_roledata
    end

    -- 从数据库异步加载(结果通过 cpp_OnInitRoleDataFindRet 事件回调处理)
    LOC.LoadRoleDataDirect(uid)

    -- 异步加载尚未完成,返回nil会让调用方等待事件回调后重试
    return nil
end

-- 获取角色Lua数据(优先在线缓存)
-- @param uid: 玩家uid
-- @return lua_role_data: table
function M.GetLuaRoleDataEx(uid)
    local role_data = M.GetRoleDataEx(uid)
    if not role_data or not role_data.lua_role_data then
        LOG_ERROR("获取角色Lua数据失败 uid:" .. tostring(uid))
        return nil
    end
    return role_data.lua_role_data
end

-- 获取或创建临时角色(用于竞技场、查看等,不加入在线管理器)
-- @param uid: 玩家uid
-- @return role: Role实例(临时,不会触发登录事件)
function M.GetOrCreateTempRole(uid)
    local data = LOC.GetOrSetData()

    -- 检查是否在线
    local entry = data.m_roles[uid]
    if entry and entry.role then
        return entry.role
    end

    -- 获取角色完整数据
    local role_data = M.GetRoleDataEx(uid)
    if not role_data then
        LOG_ERROR("创建临时角色失败: 无法获取数据 uid:%d", uid)
        return nil
    end

    -- 创建临时Role实例(不触发登录事件)
    local role = GLO.Role.Role:New(uid, 0)
    if not role then
        return nil
    end

    -- 初始化(不通过事件系统)
    if not role:Init(uid) then
        LOG_ERROR("初始化临时角色失败 uid:%d", uid)
        return nil
    end

    LOG_INFO("创建临时角色 uid:%d, name:%s", uid, role:GetName())
    return role
end

-- 从离线缓存中移除(角色登录时调用)
function M.RemoveOfflineCache(uid)
    local data = LOC.GetOrSetData()
    if data.m_offline_cache[uid] then
        data.m_offline_cache[uid] = nil
        LOG_INFO("离线缓存: 移除角色 uid:%d (已登录)", uid)
    end
end

-- 清理过期的离线缓存
function M.CleanExpiredOfflineCache()
    local data = LOC.GetOrSetData()
    local now = GLO.Utils.GetServerTime()
    local clean_count = 0

    for uid, cached in pairs(data.m_offline_cache) do
        if now - cached.last_access_time > OFFLINE_CACHE_TTL then
            data.m_offline_cache[uid] = nil
            clean_count = clean_count + 1
        end
    end

    if clean_count > 0 then
        LOG_INFO("离线缓存: 清理 %d 个过期缓存", clean_count)
    end
end

-- 获取离线缓存数量
function M.GetOfflineCacheCount()
    local data = LOC.GetOrSetData()
    local count = 0
    for _ in pairs(data.m_offline_cache) do
        count = count + 1
    end
    return count
end

-- 定时清理过期离线缓存(每60秒)
TimerManager.CreateTimer(60, function()
    M.CleanExpiredOfflineCache()
end, true)


-- 从C++加载角色数据到Lua
function LOC.LoadRoleDataFromCpp(uid)
    local role_data_str, netid = cpp_GetRoleData(uid)
    if not role_data_str or role_data_str == "" then
        LOG_ERROR("从C++加载角色数据失败 uid:" .. tostring(uid))
        return nil
    end

    local role_data = ProtoBuf.Decode(role_data_str,"PB_RoleData")
    if not role_data then
        LOG_ERROR("解析角色数据失败 uid:" .. tostring(uid))
        return nil
    end

    -- 反序列化lua_role_data 二进制字符串为lua表字段
    if role_data.lua_role_data and role_data.lua_role_data ~= "" then
        role_data.lua_role_data = Serializer.Simple.Deserialize(role_data.lua_role_data)
    else
        role_data.lua_role_data = LOC.CreateLuaRoleData(uid)
    end

    LOG_INFO("加载角色数据 uid:" .. tostring(uid) .. " netid:" .. netid)
    return role_data, netid
end

-- 保存角色数据到C++
function LOC.SaveRoleDataToCpp(uid)
    local data = LOC.GetOrSetData()
    local entry = data.m_roles[uid]
    if not entry or not entry.m_roledata then
        LOG_ERROR("没有角色数据 uid:" .. tostring(uid))
        return false
    end

    -- 序列化lua_role_data lua表字段为二进制字符串
    local save_data = Utils.DeepCopy(entry.m_roledata)
    if save_data.lua_role_data then
        save_data.lua_role_data = Serializer.Simple.Serialize(save_data.lua_role_data)
    end

    -- 编码为protobuf
    local pb_role_data = ProtoBuf.Encode(save_data, "PB_RoleData")
    if not pb_role_data then
        LOG_ERROR("编码角色数据失败 uid:" .. tostring(uid))
        return false
    end

    -- 调用C++保存
    cpp_SaveRoleData(pb_role_data)
    -- LOG_INFO("保存角色数据 uid:" .. tostring(uid))
    return true
end

function M.SaveRoleData(uid)
    return LOC.SaveRoleDataToCpp(uid)
end

-- 获取完整角色数据
function M.GetRoleData(uid)
    local role_data = LOC.GetOrSetRoleData(uid)
    if not role_data then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(uid))
        return nil
    end
    return role_data
end

-- 获取角色基础数据
function M.GetRoleBaseData(uid)
    local role_data = LOC.GetOrSetRoleData(uid)
    if not role_data or not role_data.base_info then
        LOG_ERROR("获取角色基础数据失败 uid:" .. tostring(uid))
        return nil
    end
    return role_data.base_info
end

-- 获取角色Lua数据
function M.GetLuaRoleData(uid)
    local role_data = LOC.GetOrSetRoleData(uid)
    if not role_data or not role_data.lua_role_data then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(uid))
        return nil
    end
    return role_data.lua_role_data
end

-- 清理角色数据
function M.RemoveRoleData(uid)
    local data = LOC.GetOrSetData()
    if data.m_roles[uid] then
        data.m_roles[uid].m_roledata = nil
    end
    LOG_INFO("清理角色数据 uid:" .. tostring(uid))
end

-- 清理所有角色数据
function M.RemoveAllRoleData()
    local data = LOC.GetOrSetData()
    local count = 0
    for uid,_ in pairs(data.m_roles) do
        if data.m_roles[uid] then
            data.m_roles[uid].m_roledata = nil
        end
        count = count + 1
    end
    LOG_INFO("清理所有角色数据,数量:" .. count)
end


-- 保存所有角色数据
function M.SaveAllRoleData()
    local data = LOC.GetOrSetData()
    local save_count = 0
    for uid,_ in pairs(data.m_roles) do
        if M.SaveRoleData(uid) then
            save_count = save_count + 1
        end
    end
end

-- 打印角色管理器状态
function M.PrintStatus()
    local data = LOC.GetOrSetData()
    local role_count = M.GetRoleCount()
    local data_count = 0

    for _, entry in pairs(data.m_roles) do
        if entry.m_roledata then
            data_count = data_count + 1
        end
    end

    LOG_INFO("========== 角色管理器状态 ==========")
    LOG_INFO("角色实例数: %d", role_count)
    LOG_INFO("数据缓存数: %d", data_count)
    LOG_INFO("====================================")
end

-- =================注册事件监听器===============
-- 角色登录事件
EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid
    local netid = event_data.netid

    -- 从离线缓存中移除(角色已上线)
    M.RemoveOfflineCache(uid)

    local role = M.GetRole(uid)
    if role then
        if role:GetNetid() ~= netid then
            -- 更新netid索引
            local data = LOC.GetOrSetData()
            data.m_netid_map[role:GetNetid()] = nil
            data.m_netid_map[netid] = role
            role:SetNetid(netid)
        end
    else
        role = LOC.CreateRole(uid) -- 创建角色实例
    end
    if not role then
        LOG_ERROR("角色登录结束 失败 uid:" .. uid .. " netid:" .. netid)
    end
end,EventManager.EVENT_PRIORITY_ROLE_LOGIN_CREATE_ROLE)

-- 角色登出事件
EventManager.RegisterListener(EventManager.cpp_OnRoleLogout, function(event_data)
    local uid = event_data.uid
    local netid = event_data.netid

    -- 删除角色实例
    M.RemoveRole(uid)
end,EventManager.EVENT_PRIORITY_ROLE_LOGOUT_SAVE_ROLE_DATA)

-- 跨天
EventManager.RegisterListener(EventManager.cpp_OnDayChange, function(event_data)
    LOG_INFO("跨天事件")
end)

-- 跨周
EventManager.RegisterListener(EventManager.cpp_OnWeekChange, function(event_data)
    LOG_INFO("跨周事件")
end)

-- 跨月
EventManager.RegisterListener(EventManager.cpp_OnMonthChange, function(event_data)
    LOG_INFO("跨月事件")
end)

-- 查找角色数据返回事件(PE_INIT_TYPE_FIND异步回调)
EventManager.RegisterListener(EventManager.cpp_OnInitRoleDataFindRet, function(event_data)
    local data_str = event_data.data_str
    if not data_str or data_str == "" then
        LOG_ERROR("查找角色数据返回: 数据为空")
        return
    end

    local pb_response = GLO.Protobuf.DecodeBody(MHT.MHT_INIT_ROLE_DATA_S, data_str)
    if not pb_response then
        LOG_ERROR("查找角色数据返回: 解析失败")
        return
    end

    local uid = pb_response.uid or 0
    if uid == 0 then
        LOG_WARN("查找角色数据返回: uid为0")
        return
    end

    -- 清除pending标记
    local m_data = LOC.GetOrSetData()
    m_data.m_pending_find[uid] = nil

    local ret = pb_response.ret or 0
    if ret == 0 then
        LOG_ERROR("查找角色数据返回: 查询失败 uid=%d", uid)
        return
    end

    local role_data = pb_response.role_data
    if not role_data then
        LOG_ERROR("查找角色数据返回: 角色数据为空 uid=%d", uid)
        return
    end

    -- 反序列化lua_role_data
    if role_data.lua_role_data and role_data.lua_role_data ~= "" then
        role_data.lua_role_data = Serializer.Simple.Deserialize(role_data.lua_role_data)
    else
        role_data.lua_role_data = LOC.CreateLuaRoleData(uid)
    end

    -- 存入离线缓存
    m_data.m_offline_cache[uid] = {
        m_roledata = role_data,
        last_access_time = GLO.Utils.GetServerTime(),
    }

    local name = (role_data.base_info and role_data.base_info.name) or "未知"
    LOG_INFO("查找角色数据返回: uid=%d, name=%s", uid, name)
end)

LOG_INFO("RoleManager 加载完成")
return M