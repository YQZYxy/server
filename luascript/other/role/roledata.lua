-- ====================================================================
-- RoleData - 角色数据访问层
--   数据权威在 C++
--   Get<Name>(uid) 取该子结构的 table (首次访问从 C++ 拉取)
--   定时只回写"被访问过且版本变化"的模块, 由 C++ 判断内容是否变化并落库
--   停服/登出时把未回写的模块统一推回 C++
--   绑定名由 C++ 的 ROLE_DATA_BIND_LIST 决定, 这里自动生成接口
-- ====================================================================

local GLO = GLO
local M = {}
local LOC = {}

-- 时间预算使用单调时钟(微秒)
local function NowUs()
    return GLO.Utils.NowUs()
end

-- 回写调度间隔(秒), 每次只处理一批角色
local FLUSH_INTERVAL = 0.1
-- 单次回写的时间预算(微秒), 超过就让出主循环
local FLUSH_TIME_BUDGET_US = 2000
-- 单批最少处理的角色数, 实际会按在线数自适应, 保证 1 秒内能轮完一遍
local MIN_ROLE_PER_UPDATE = 100
-- 回写失败的重试退避(秒)
local RETRY_BASE_DELAY = 1
local RETRY_MAX_DELAY = 60
-- 同一模块失败日志的最小间隔(秒)
local FAIL_LOG_INTERVAL = 60

-- 已解码数据缓存 [uid][name] = table
local m_cache = {}
-- 访问版本 [uid][name] = 自增序号, Get 时递增
local m_touch = {}
-- 已回写版本 [uid][name] = 回写成功时的访问版本
local m_saved = {}
-- 失败退避 [uid][name] = { count = 连续失败次数, retry_at = 下次重试时间, log_at = 上次日志时间 }
local m_fail = {}
-- 已回写的内容 [uid][name] = 编码后的字符串, 用来跳过内容没变化的模块
local m_last_encoded = {}
-- 绑定信息 [name] = { get = 函数, set = 函数, type = proto类型名 }
local m_binds = {}

-- 分批轮转用的角色列表(删除时留 nil 洞, 定期压缩)
local m_uids = {}
local m_uid_pos = {}
local m_uid_slots = 0
local m_uid_count = 0
local m_uid_cursor = 1

-- 取绑定的编码后数据
function LOC.Encode(name, data)
    local bind = m_binds[name]
    if not bind then
        return nil
    end
    return GLO.Protobuf.Encode(data or {}, bind.type)
end

-- 从 C++ 读取并解码某个子结构
function LOC.Load(uid, name)
    local bind = m_binds[name]
    if not bind then
        LOG_ERROR("RoleData: 未注册的数据绑定 " .. tostring(name))
        return nil
    end

    local raw = bind.get(uid)
    if raw == nil then
        -- 角色不在线(C++ 没有对应 RoleModule)
        return nil
    end

    local data = nil
    if raw ~= "" then
        data = GLO.Protobuf.Decode(raw, bind.type)
        if not data then
            LOG_ERROR(string.format("RoleData: 解码失败 uid=%d name=%s", uid, name))
            return nil
        end
    end
    data = data or {}

    if not m_cache[uid] then
        -- 首次加载该角色, 加入分批轮转列表
        m_cache[uid] = {}
        m_uid_count = m_uid_count + 1
        m_uid_slots = m_uid_slots + 1
        m_uids[m_uid_slots] = uid
        m_uid_pos[uid] = m_uid_slots
    end
    m_cache[uid][name] = data
    -- 刚从 C++ 读出来的内容就是 C++ 里的内容, 下次回写可直接跳过
    m_last_encoded[uid] = m_last_encoded[uid] or {}
    m_last_encoded[uid][name] = raw
    return data
end

-- 取某个子结构, 首次访问时从 C++ 拉取
function M.Get(uid, name)
    uid = tonumber(uid)
    if not uid or uid <= 0 then
        LOG_ERROR("RoleData: uid 无效 " .. tostring(uid))
        return nil
    end

    local uid_cache = m_cache[uid]
    local data = nil
    if uid_cache and uid_cache[name] ~= nil then
        data = uid_cache[name]
    else
        data = LOC.Load(uid, name)
        if not data then
            return nil
        end
    end

    -- 记录访问版本, Update 时只回写版本变化过的模块
    m_touch[uid] = m_touch[uid] or {}
    m_touch[uid][name] = (m_touch[uid][name] or 0) + 1
    return data
end

-- 该模块自上次回写后是否又被访问过
-- force: 忽略失败退避
function LOC.IsChanged(uid, name, now, force)
    local uid_touch = m_touch[uid]
    local touch = (uid_touch and uid_touch[name]) or 0
    if touch <= 0 then
        -- 从未访问过, 跳过
        return false
    end
    local uid_saved = m_saved[uid]
    local saved = (uid_saved and uid_saved[name]) or 0
    if touch <= saved then
        return false
    end
    if not force then
        local uid_fail = m_fail[uid]
        local fail = uid_fail and uid_fail[name]
        if fail and fail.retry_at and now < fail.retry_at then
            -- 还在退避期
            return false
        end
    end
    return true
end

-- 记录一次回写失败, 指数退避并限制日志频率
function LOC.OnFail(uid, name, now)
    m_fail[uid] = m_fail[uid] or {}
    local fail = m_fail[uid][name]
    if not fail then
        fail = { count = 0 }
        m_fail[uid][name] = fail
    end

    fail.count = fail.count + 1
    local delay = RETRY_BASE_DELAY
    for _ = 2, fail.count do
        delay = delay * 2
        if delay >= RETRY_MAX_DELAY then
            break
        end
    end
    if delay > RETRY_MAX_DELAY then
        delay = RETRY_MAX_DELAY
    end
    fail.retry_at = now + delay

    if not fail.log_at or now - fail.log_at >= FAIL_LOG_INTERVAL then
        fail.log_at = now
        LOG_ERROR(string.format("RoleData: 回写失败 uid=%d name=%s 连续失败=%d 次, %d 秒后重试",
            uid, tostring(name), fail.count, delay))
    end
end

-- 回写成功后清除失败状态
function LOC.OnSuccess(uid, name)
    local uid_fail = m_fail[uid]
    if not uid_fail then
        return
    end
    uid_fail[name] = nil
    if next(uid_fail) == nil then
        m_fail[uid] = nil
    end
end

-- 把单个角色访问过的模块写回 C++
-- force: true 时忽略失败退避(停服/登出用)
-- 编码结果和上次回写的一致就直接跳过, 省掉一次 C++ 调用
-- C++ 侧也会比较内容, 没变化就不置脏, 也不会落库
function M.Flush(uid, force, now)
    uid = tonumber(uid)
    local uid_cache = uid and m_cache[uid]
    if not uid_cache then
        return true
    end

    now = now or GLO.Utils.GetServerTime()
    local is_all_ok = true
    for name, data in pairs(uid_cache) do
        if LOC.IsChanged(uid, name, now, force) then
            local bind = m_binds[name]
            local touch = m_touch[uid][name]
            local encoded = LOC.Encode(name, data)
            if not bind or encoded == nil then
                is_all_ok = false
                LOC.OnFail(uid, name, now)
            else
                local last_encoded = m_last_encoded[uid] and m_last_encoded[uid][name]
                if encoded == last_encoded then
                    -- 内容没变, 不必再调 C++, 只更新已保存版本
                    m_saved[uid] = m_saved[uid] or {}
                    m_saved[uid][name] = touch
                    LOC.OnSuccess(uid, name)
                elseif bind.set(uid, encoded) then
                    m_saved[uid] = m_saved[uid] or {}
                    m_saved[uid][name] = touch
                    m_last_encoded[uid] = m_last_encoded[uid] or {}
                    m_last_encoded[uid][name] = encoded
                    LOC.OnSuccess(uid, name)
                else
                    is_all_ok = false
                    LOC.OnFail(uid, name, now)
                end
            end
        end
    end
    return is_all_ok
end

-- 压缩轮转列表: 删除过半时重建, 避免空槽越来越多
function LOC.CompactUidList()
    if m_uid_count > 0 and (m_uid_slots - m_uid_count) < m_uid_count then
        return
    end
    if m_uid_count <= 0 then
        m_uids = {}
        m_uid_pos = {}
        m_uid_slots = 0
        m_uid_cursor = 1
        return
    end

    local new_uids = {}
    local new_pos = {}
    for index = 1, m_uid_slots do
        local uid = m_uids[index]
        if uid and m_cache[uid] then
            new_uids[#new_uids + 1] = uid
            new_pos[uid] = #new_uids
        end
    end
    m_uids = new_uids
    m_uid_pos = new_pos
    m_uid_slots = #new_uids
    m_uid_count = #new_uids
    m_uid_cursor = 1
end

-- 定时调用: 分批轮转处理角色, 只回写访问版本变化过的模块
-- force: true 时忽略退避并一次处理完(停服用)
function M.Update(force)
    if force then
        local now = GLO.Utils.GetServerTime()
        for uid, _ in pairs(m_cache) do
            M.Flush(uid, true, now)
        end
        return
    end

    LOC.CompactUidList()
    if m_uid_slots <= 0 then
        return
    end

    -- 按在线数自适应批大小, 保证 1 秒内能轮完一遍
    local tick_count = 1 / FLUSH_INTERVAL
    local batch = math.ceil(m_uid_count / tick_count)
    if batch < MIN_ROLE_PER_UPDATE then
        batch = MIN_ROLE_PER_UPDATE
    end

    local start_us = NowUs()
    local now = GLO.Utils.GetServerTime()
    local processed = 0
    local scanned = 0
    while scanned < m_uid_slots and processed < batch do
        if m_uid_cursor > m_uid_slots then
            m_uid_cursor = 1
        end
        local uid = m_uids[m_uid_cursor]
        m_uid_cursor = m_uid_cursor + 1
        scanned = scanned + 1

        if uid and m_cache[uid] then
            M.Flush(uid, false, now)
            processed = processed + 1
            if NowUs() - start_us >= FLUSH_TIME_BUDGET_US then
                break
            end
        end
    end
end

-- 清理角色缓存
function M.ClearCache(uid)
    uid = tonumber(uid)
    if not uid then
        return
    end
    m_cache[uid] = nil
    m_touch[uid] = nil
    m_saved[uid] = nil
    m_fail[uid] = nil
    m_last_encoded[uid] = nil

    local pos = m_uid_pos[uid]
    if pos then
        m_uids[pos] = nil
        m_uid_pos[uid] = nil
        m_uid_count = m_uid_count - 1
    end
end

-- 回写并清理角色缓存(登出时忽略退避)
function M.Remove(uid)
    M.Flush(uid, true)
    M.ClearCache(uid)
end

-- 按 C++ 的绑定表生成 Get<Name>
function LOC.InitBinds()
    for _, bind in ipairs(cpp_RoleDataListBinds()) do
        local get_func = _G["cpp_RoleGet_" .. bind.name]
        local set_func = _G["cpp_RoleSet_" .. bind.name]
        if get_func and set_func then
            local name = bind.name
            m_binds[name] = {
                get = get_func,
                set = set_func,
                type = bind.type,
            }
            M["Get" .. name] = function(uid)
                return M.Get(uid, name)
            end
        else
            LOG_ERROR("RoleData: C++ 绑定缺失 " .. tostring(bind.name))
        end
    end
end

LOC.InitBinds()

GLO.TimerManager.CreateTimer(FLUSH_INTERVAL, function()
    M.Update()
end, true)

LOG_INFO("RoleData 加载完成")

return M
