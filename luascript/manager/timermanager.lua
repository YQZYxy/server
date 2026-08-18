
-- 定时器管理器
local M = {}

function M.CreateTimer(interval, callback, loop, immediate)
	return TimerCreate(interval, callback, loop, immediate)
end

function M.RemoveTimer(timer_id)
	TimerRemove(timer_id)
end

LOG_INFO("TimerManager 加载完成")

return M