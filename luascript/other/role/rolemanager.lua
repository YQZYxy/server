-- ====================================================================
--  RoleManager - 角色管理器
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = {}
local EventManager = GLO.EventManager

-- 获取或初始化数据
function LOC.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            m_roles = {
                --[[
                [uid] = {
                    -- role   = {} Role实例
                }
                --]]
            },
        }
    end
    
    return M.m_data
end

-- ==================初始化和清理==================

-- 清理角色管理器
function M.Shutdown()

    -- 回写所有未保存的角色数据(忽略退避, C++ 随后落库)
    GLO.RoleData.Update(true)

    -- 清理所有角色
    M.RemoveAllRoles()
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

    -- 角色数据由 C++ 持有, 这里只校验 C++ 是否已创建角色模块
    if not GLO.RoleData.GetBaseInfo(uid) then
        LOG_ERROR("角色数据不存在 uid:" .. tostring(uid))
        return nil
    end

    -- 创建角色实例
    local role = GLO.Role.Role:New(uid)
    if not role then
        LOG_ERROR("创建角色实例失败 uid:" .. tostring(uid))
        return nil
    end

    -- 先存入缓存
    local entry = {
        role = role,
    }
    data.m_roles[uid] = entry

    -- 初始化角色子模块
    if not role:Init(uid) then
        LOG_ERROR("初始化角色实例失败 uid:" .. tostring(uid))
        data.m_roles[uid] = nil
        return nil
    end

    LOG_INFO("创建角色 uid:" .. tostring(uid) .. " name:" .. role:GetName())
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

-- 删除角色
function M.RemoveRole(uid)
    local data = LOC.GetOrSetData()
    local entry = data.m_roles[uid]
    if not entry or not entry.role then
        LOG_WARN("角色不存在,无法删除 uid:" .. tostring(uid))
        return false
    end

    -- 回写该角色的脏数据(C++ 在 OnLogout 里随后落库)
    GLO.RoleData.Remove(uid)

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

-- =================注册事件监听器===============
-- 角色登录事件
EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid

    local role = M.GetRole(uid)
    if not role then
        role = LOC.CreateRole(uid) -- 创建角色实例
    end
    if not role then
        LOG_ERROR("角色登录结束 失败 uid:" .. tostring(uid))
    end
end,EventManager.EVENT_PRIORITY_ROLE_LOGIN_CREATE_ROLE)

-- 断线重连: 复用登录事件重推数据
EventManager.RegisterListener(EventManager.cpp_OnRoleReconnect, function(event_data)
    local uid = event_data.uid

    local role = M.GetRole(uid)
    if not role then
        LOG_ERROR("断线重连角色不存在 uid:" .. tostring(uid))
        return
    end

    -- 复用登录事件的数据下发(各业务模块监听 cpp_OnRoleLogin), 重连不做首次登录副作用
    EventManager.TriggerEvent(EventManager.cpp_OnRoleLogin, { uid = uid })

    LOG_INFO("断线重连完成 uid:" .. tostring(uid))
end,EventManager.EVENT_PRIORITY_ROLE_LOGIN_CREATE_ROLE)

-- 角色登出事件
EventManager.RegisterListener(EventManager.cpp_OnRoleLogout, function(event_data)
    local uid = event_data.uid

    -- 删除角色实例
    M.RemoveRole(uid)
end,EventManager.EVENT_PRIORITY_ROLE_LOGOUT_SAVE_ROLE_DATA)

LOG_INFO("RoleManager 加载完成")
return M