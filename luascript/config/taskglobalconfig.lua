-- ====================================================================
-- 自动生成配置 :
-- ====================================================================

--[[
字段结构说明:

  max_active_tasks - 最大接取任务 (int)
  max_daily_tasks - 最大每日任务 (int)
  repeat_task_cooldown - 重复任务刷新时间 (int)
--]]

local M = 
{
    max_active_tasks = 25,
    max_daily_tasks = 10,
    repeat_task_cooldown = 86400,
}

LOG_INFO(" 加载完成")

return M
