-- ====================================================================
--  活动业务分发
--  C++ 只管时间规则与状态机, 这里按 activity_id 分发业务回调
-- ====================================================================

local GLO = GLO
local M = {}

local EventManager = GLO.EventManager

-- 与 C++ ACTIVITY_STATE 保持一致
local STATE_CLOSED = 0
local STATE_PREPARE = 1
local STATE_RUNNING = 2
local STATE_SETTLE = 3
local STATE_FINISHED = 4

M.STATE_CLOSED = STATE_CLOSED
M.STATE_PREPARE = STATE_PREPARE
M.STATE_RUNNING = STATE_RUNNING
M.STATE_SETTLE = STATE_SETTLE
M.STATE_FINISHED = STATE_FINISHED

-- 与 C++ ACTIVITY_JOIN_RESULT 保持一致
M.JOIN_OK = 0
M.JOIN_NOT_OPEN = 1
M.JOIN_PLAYER_FULL = 2
M.JOIN_LEVEL_LOW = 3
M.JOIN_LEVEL_HIGH = 4
M.JOIN_ROLE_DAYS_LOW = 5
M.JOIN_ROLE_DAYS_HIGH = 6

-- [activity_id] = { on_prepare, on_start, on_settle, on_finish }
local m_handlers = {}

-- 注册活动业务回调
function M.Register(activity_id, handler)
    if not activity_id or type(handler) ~= "table" then
        LOG_ERROR("活动回调注册失败 activity_id:" .. tostring(activity_id))
        return false
    end
    m_handlers[activity_id] = handler
    return true
end

-- 状态变化分发
local function OnStateChange(event_data)
    local handler = m_handlers[event_data.activity_id]
    if not handler then
        return
    end

    local state = event_data.state
    if state == STATE_PREPARE and handler.on_prepare then
        handler.on_prepare(event_data)
    elseif state == STATE_RUNNING and handler.on_start then
        handler.on_start(event_data)
    elseif state == STATE_SETTLE and handler.on_settle then
        handler.on_settle(event_data)
    elseif state == STATE_FINISHED and handler.on_finish then
        handler.on_finish(event_data)
    elseif state == STATE_CLOSED and handler.on_closed then
        handler.on_closed(event_data)
    end
end

-- 查询活动当前状态, 返回 C++ 状态值, -1 表示活动不存在
function M.GetState(activity_id)
    return cpp_ActivityGetState(activity_id)
end

-- 活动是否正在进行
function M.IsOpen(activity_id)
    return cpp_ActivityGetState(activity_id) == STATE_RUNNING
end

-- 查询活动完整信息
function M.GetInfo(activity_id)
    return cpp_ActivityGetInfo(activity_id)
end

-- 所有活动
function M.GetAll()
    return cpp_ActivityGetAll()
end

-- 参与限制检查, 返回 ACTIVITY_JOIN_RESULT
function M.CanEnter(activity_id, uid)
    return cpp_ActivityCheckJoin(activity_id, uid)
end

-- 参与活动, 个人数据由 activitydata 模块维护
function M.Enter(activity_id, uid)
    if not cpp_ActivityEnter(activity_id, uid) then
        return false
    end
    GLO.ActivityData.Update(uid, activity_id, function(node)
        if node.count == nil then
            node.count = 0
        end
        node.count = node.count + 1
        node.last_time = os.time()
    end)
    return true
end

-- 退出活动
function M.Leave(activity_id, uid)
    return cpp_ActivityLeave(activity_id, uid)
end

-- 手动开关(GM)
function M.Start(activity_id)
    return cpp_ActivityStart(activity_id)
end

function M.Stop(activity_id)
    return cpp_ActivityStop(activity_id)
end

-- 按配置行手动开关(GM)
function M.StartByConfig(config_id)
    return cpp_ActivityStartByConfig(config_id)
end

function M.StopByConfig(config_id)
    return cpp_ActivityStopByConfig(config_id)
end

function M.Init()
    EventManager.RegisterListener(EventManager.cpp_OnActivityStateChange, OnStateChange)
    LOG_INFO("活动业务分发初始化完成")
end

return M
