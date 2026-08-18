-- globaldata.lua
-- 全局数据管理器

local GLO = GLO
local M = {}
local save_interval = 300  -- 5分钟自动保存一次

-- 获取数据
function M.GetOrSetData()
    if not M.m_data then
        M.m_data = {
            m_dirty_keys = {},  -- 记录脏数据的key,保存时会根据这个表来更新数据库
            m_is_loaded = false,
            m_last_save_time = 0,
            m_global_data = {
                -- 示例数据  ["key_name"] = table
            }
        }
    end

    return M.m_data
end

-- 初始化
function M.Load()

    local m_data = M.GetOrSetData()

    if not m_data.m_is_loaded then
        LOG_INFO("开始加载全局数据...")

        GLO.Protobuf.SendDBMsg(GLO.MHT.MHT_GLOBAL_DATA_DB_C, { req_type = 1 })
    end

    LOG_INFO("GlobalDataManager 初始化")
end


-- 数据加载完成回调(由C++调用)
function M.LoadRet(msg_data)
    if not msg_data then
        LOG_ERROR("数据为空")
        return
    end

    local m_data = M.GetOrSetData()
    m_data.m_dirty_keys = {}  
    m_data.m_is_loaded = true
    m_data.m_last_save_time = os.time()

    for _, node in ipairs(msg_data.datas) do 
        m_data.m_global_data[node.id] = GLO.Serializer.Simple.Deserialize(node.data)   -- 反序列化数据 字符串转表
    end

    LOG_INFO("全局数据加载成功, 数据数量: " .. tostring(M.GetCount()))
    
end

-- 强制保存所有数据
function M.SaveForce()
    local m_data = M.GetOrSetData()

    if not m_data.m_is_loaded then
        return
    end

    -- 如果没有脏数据,跳过保存
    local dirty_count = 0
    for _ in pairs(m_data.m_dirty_keys) do
        dirty_count = dirty_count + 1
    end

    LOG_INFO("开始保存全局数据, 脏数据数量: %d", dirty_count)

    local datas = {}
    for key, value in pairs(m_data.m_global_data) do
        table.insert(datas, {id = key, data = GLO.Serializer.Simple.Serialize(value)}) -- 序列化数据 表转字符串
    end

    GLO.Protobuf.SendDBMsg(GLO.MHT.MHT_GLOBAL_DATA_DB_C, {
        req_type = 2, -- 2=保存数据
        datas = datas
    })
end

-- 保存全局数据
function M.Save()
    local m_data = M.GetOrSetData()

   if not m_data.m_is_loaded then
        return
    end
    
    -- 如果没有脏数据,跳过保存
    local dirty_count = 0
    for _ in pairs(m_data.m_dirty_keys) do
        dirty_count = dirty_count + 1
    end
    
    if dirty_count == 0 then
        return
    end
    
    M.SaveForce()
end

-- 更新(定期自动保存)
function M.Update(delta_time)

    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        return
    end
    
    local now = os.time()
    if now - m_data.m_last_save_time >= save_interval then
        M.Save()
    end
end

-- 获取数据
function M.Get(key)

    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        LOG_ERROR("Warning: m_data not loaded yet")
        return nil
    end
    
    return m_data.m_global_data[key]
end

-- 设置数据
function M.Set(key, data)
    local global_data = M.GetOrSetData()
    local dirty_keys = global_data.m_dirty_keys
    if not global_data.m_is_loaded then
        LOG_ERROR("Warning: data not loaded yet")
        return false
    end
    
    if key == nil or key == "" then
        LOG_ERROR("Error: Invalid key")
        return false
    end
    
    global_data.m_global_data[key] = data
    dirty_keys[key] = true
    
    return true
end

-- 删除数据
function M.Delete(key)
    local global_data = M.GetOrSetData()
    local dirty_keys = global_data.m_dirty_keys
    if not global_data.m_is_loaded then
        LOG_ERROR("Warning: m_data not loaded yet")
        return false
    end
    
    if key == nil or key == "" then
        LOG_ERROR("Error: Invalid key")
        return false
    end
    
    global_data.m_global_data[key] = nil
    dirty_keys[key] = true  -- 标记为脏,保存时会删除数据库中的记录
    
    return true
end

-- 检查key是否存在
function M.Has(key)

    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        return false
    end
    
    return m_data.m_global_data[key] ~= nil
end

-- 获取所有key
function M.GetAllKeys()

    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        return {}
    end
    
    local keys = {}
    for key, _ in pairs(m_data.m_global_data) do
        table.insert(keys, key)
    end
    
    return keys
end

-- 获取数据数量
function M.GetCount()
    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        return 0
    end
    
    local count = 0
    for _ in pairs(m_data.m_global_data) do
        count = count + 1
    end
    
    return count
end

-- 清空所有数据(慎用)
function M.Clear()
    local m_data = M.GetOrSetData()
    if not m_data.m_is_loaded then
        LOG_ERROR("Warning: m_data not loaded yet")
        return false
    end
    
    LOG_WARN("Warning: Clearing all global m_data...")
    
    -- 标记所有key为脏(保存时会删除)
    for key, _ in pairs(m_data.m_global_data) do
        m_data.m_dirty_keys[key] = true
    end
    
    m_data.m_global_data = {}
    
    return true
end

-- 打印状态信息
function M.PrintStatus()
    local m_data = M.GetOrSetData()
    LOG_INFO("========== GlobalDataManager Status ==========")
    LOG_INFO("Is Loaded: %s", tostring(m_data.m_is_loaded))
    LOG_INFO("Data Count: %d", M.GetCount())
    
    local dirty_count = 0
    for _ in pairs(m_data.m_dirty_keys) do
        dirty_count = dirty_count + 1
    end
    LOG_INFO("Dirty Keys: %d", dirty_count)
    
    LOG_INFO("Last Save Time: %s", os.date("%Y-%m-%d %H:%M:%S", m_data.m_last_save_time))
    LOG_INFO("================================================")
end

-- 注册数据库返回处理器
GLO.MsgManager.RegisterMsg(GLO.MHT.MHT_GLOBAL_DATA_DB_S, function(netid, msg_data, role)
    M.LoadRet(msg_data)
end)

return M