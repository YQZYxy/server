-- ====================================================================
--  DirtyTracker - 自动脏追踪模块
--  通过元表代理,自动检测对表的修改并标记脏,递归处理嵌套子表
--    local proxy = DirtyTracker.Wrap(raw_table, on_dirty_callback)
--    proxy.some_field = new_value  -- 自动标记脏,触发回调
--    proxy.nested.field = value    -- 嵌套修改也会标记脏
--    DirtyTracker.IsDirty(proxy)   -- 检查脏状态
--    DirtyTracker.ClearDirty(proxy) -- 清除脏标记
--    DirtyTracker.GetRaw(proxy)    -- 获取原始表
-- ====================================================================

local M = {}

-- 代理数据存储(弱引用key,自动GC)
local proxy_data = setmetatable({}, {__mode = "k"})

-- 创建脏追踪代理
-- @param t: 源表
-- @param on_dirty: 可选回调,当表首次被标记为脏时调用
-- @return: 脏追踪代理
function M.Wrap(t, on_dirty)
    if type(t) ~= "table" then
        return t
    end

    -- 已包装过则直接返回缓存的代理
    local cached = proxy_data[t]
    if cached and cached.proxy then
        return cached.proxy
    end

    local proxy = {}
    local info = {
        source = t,
        dirty = false,
        on_dirty = on_dirty,
        nested_cache = {},  -- 子代理缓存 { [key] = proxy, ... }
        proxy = proxy,
    }
    proxy_data[proxy] = info
    -- 反向映射: 源表 -> info(用于快速查找已包装的表)
    proxy_data[t] = info

    -- 标记当前链为脏,传播到根
    local function mark_dirty()
        if not info.dirty then
            info.dirty = true
            if info.on_dirty then
                info.on_dirty()
            end
        end
    end

    local mt = {
        __index = function(_, k)
            local v = t[k]
            if type(v) == "table" then
                -- 返回缓存的子代理,避免重复创建
                if info.nested_cache[k] then
                    return info.nested_cache[k]
                end
                -- 创建子代理并缓存,传播脏回父级
                local nested = M.Wrap(v, mark_dirty)
                info.nested_cache[k] = nested
                return nested
            end
            return v
        end,

        __newindex = function(_, k, v)
            t[k] = v
            -- 清除旧子代理缓存(如果key被覆盖)
            info.nested_cache[k] = nil
            mark_dirty()
        end,

        __pairs = function()
            return pairs(t)
        end,

        __ipairs = function()
            return ipairs(t)
        end,

        __len = function()
            return #t
        end,
    }
    setmetatable(proxy, mt)
    return proxy
end

-- 检查代理是否脏
function M.IsDirty(proxy)
    local pd = proxy_data[proxy]
    return pd and pd.dirty or false
end

-- 清除脏标记(递归清理子代理)
function M.ClearDirty(proxy)
    local pd = proxy_data[proxy]
    if not pd then
        return
    end
    pd.dirty = false
    for _, nested in pairs(pd.nested_cache) do
        M.ClearDirty(nested)
    end
end

-- 获取原始表
function M.GetRaw(proxy)
    local pd = proxy_data[proxy]
    return pd and pd.source or proxy
end

-- 像 next() 一样遍历代理(兼容 proxy 上 next 失效的问题)
-- @param proxy: 脏追踪代理或普通表
-- @param key: 可选,上一个key
-- @return next_key, value
function M.Next(proxy, key)
    local pd = proxy_data[proxy]
    local t = pd and pd.source or proxy
    return next(t, key)
end

-- 统计代理表中的元素数量(安全版 pairs count)
-- @param proxy: 脏追踪代理或普通表
-- @return number
function M.Count(proxy)
    local pd = proxy_data[proxy]
    local t = pd and pd.source or proxy
    local n = 0
    for _ in pairs(t) do
        n = n + 1
    end
    return n
end

-- 强制标记脏(用于不需要修改数据但需要触发保存的场景)
function M.MarkDirty(proxy)
    local pd = proxy_data[proxy]
    if not pd then
        return
    end
    if not pd.dirty then
        pd.dirty = true
        if pd.on_dirty then
            pd.on_dirty()
        end
    end
end

LOG_INFO("DirtyTracker 加载完成")
return M
