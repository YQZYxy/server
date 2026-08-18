-- msgmanager.lua
-- 消息管理器 - 处理C++发送到Lua的消息回调

local GLO = GLO
local M = {}

-- 消息处理函数注册表 {msg_type: callback_function}
local m_msg_func_list = {}

-- ================注册消息处理函数==============================
-- msg_type: 消息类型
-- func: 处理函数 function(netid, msg_data, role)  role参数只有用户消息才有,战斗服和内部协议没有role参数
function M.RegisterMsg(msg_type, func)
    if not msg_type or type(func) ~= "function" then
        LOG_ERROR("错误参数 .. msg_type: " .. tostring(msg_type) .. ", func: " .. tostring(func))
        return false
    end
    
    m_msg_func_list[msg_type] = func
    
    return true
end

-- ================处理消息==============================
-- netid: 网络连接ID
-- msg_type: 消息类型
-- msg_str: 消息字符串 (protobuf序列化后的数据)
-- uid: 用户ID (只有用户消息才有uid,战斗服和内部协议没有uid)
function M.OnRecv(netid, msg_type, msg_str, uid)
    local t0 = os.clock()
    local t = t0

    -- 查找消息处理函数
    local handler_func = m_msg_func_list[msg_type]
    
    if not handler_func then
        LOG_WARN("未找到消息处理函数: msg_type=%d", msg_type)
        return
    end
    
    -- 直接解码包体 (C++已经解析过消息头, 只传了包体数据)
    local msg_data = GLO.Protobuf.DecodeBody(msg_type, msg_str)
    if not msg_data then
        LOG_ERROR("解码包体失败: msg_type=%d", msg_type)
        return
    end
    local t_decode = os.clock()

    if GLO.MHT.MHT_BATTLE_MSG_TYPE_MAX < msg_type then

        local role = GLO.RoleManager.GetRole(uid)
        if not role then
            LOG_ERROR("未找到角色处理消息: msg_type=%d, uid=%d", msg_type, uid)
            return
        end

        -- 调用处理函数
        local success, err = pcall(handler_func, netid, msg_data, role)
        if not success then
            LOG_ERROR("消息处理函数执行失败: msg_type=%d, error=%s", msg_type, tostring(err))
        end
    else
        -- 调用处理函数
        local success, err = pcall(handler_func, netid, msg_data, nil)
        if not success then
            LOG_ERROR("消息处理函数执行失败: msg_type=%d, error=%s", msg_type, tostring(err))
        end
    end

    local cost = (os.clock() - t0) * 1000
    if cost > 10 then
        local decode_ms = (t_decode - t) * 1000
        local handler_ms = (os.clock() - t_decode) * 1000
        local info = debug.getinfo(handler_func, "S")
        local src = info and info.source or "?"
        local linedef = info and info.linedefined or "?"
        LOG_INFO("msg_type=%d, 耗时: %.2f ms (解码: %.3f ms + 处理: %.2f ms),  handler=%s:%s",
            msg_type, cost, decode_ms, handler_ms, src, linedef)
    end
end

return M