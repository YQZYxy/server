-- 任务模块
-- 管理任务系统和玩家任务追踪
local GLO = GLO 
local TaskDef = GLO.TaskDef
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local ConfigManager = GLO.ConfigManager
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT

local LOC = {}

local M = {}

-- 子任务匹配处理器注册表 obj_type -> function(conditions, event_data) -> bool
local s_obj_handlers = {}

-- 注册子任务匹配处理器
function M.RegisterObjHandler(obj_type, handler)
    if not obj_type or type(handler) ~= "function" then
        LOG_ERROR("Task.RegisterObjHandler: 参数无效 " .. tostring(obj_type))
        return false
    end

    s_obj_handlers[obj_type] = handler
    return true
end

-- 取子任务匹配处理器
function M.GetObjHandler(obj_type)
    if not obj_type or TaskDef.TaskObjType.NONE == obj_type then
        return nil
    end
    return s_obj_handlers[obj_type]
end

-- 角色登录事件
GLO.EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        return
    end

    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        LOG_ERROR("获取任务数据失败 uid:" .. tostring(role.uid))
        return
    end

    -- 构建任务协议数据
    local active_tasks = {}
    for task_id, save_data in pairs(task_data.active_tasks or {}) do
        local objectives = {}
        for _, obj_data in ipairs(save_data.objectives or {}) do
            table.insert(objectives, {
                current_count = obj_data.current_count,
                completed = obj_data.completed
            })
        end
        active_tasks[task_id] = {
            status = save_data.status,
            start_time = save_data.start_time or 0,
            complete_time = save_data.complete_time or 0,
            objectives = objectives
        }
    end

    -- 下发任务数据
    Protobuf.SendMsgToRole(role, MHT.MHT_SYNC_TASK_DATA_SC,
    {
        task_data = {
            max_active = task_data.max_active,
            active_tasks = active_tasks,
            completed_tasks = task_data.completed_tasks or {}
        }
    })
end)

-- ===============任务配置===================

-- 获取全局任务配置（只读）
function M.GetTaskGlobalConfig()
    return ConfigManager.taskglobalconfig
end

-- 获取主任务配置（只读）
function M.GetTaskConfig(task_id)
    local configs = ConfigManager.taskconfig
    return configs[task_id]
end

-- 获取目标任务配置（只读）
function M.GetTaskObjConfig(task_obj_id)
    local configs = ConfigManager.taskobjconfig
    return configs[task_obj_id]
end

-- ==================== 获取角色数据 ==============================
function LOC.GetOrSetTaskData(role)
    if not role then
        LOG_ERROR("角色实例为空")
        return nil
    end

    local task_data = GLO.RoleData.GetTask(role.uid)
    if not task_data then
        LOG_ERROR("角色数据为空")
        return nil
    end

    -- 确保任务数据结构存在
    if not task_data.max_active then
        local global_config = M.GetTaskGlobalConfig()
        if not global_config or not global_config.max_active_tasks then
            LOG_ERROR("任务全局配置缺少 max_active_tasks")
            return nil
        end
        task_data.max_active = global_config.max_active_tasks
    end
    if not task_data.active_tasks then
        task_data.active_tasks = {}     -- {[task_id] = {status, start_time, complete_time, objectives}}
    end
    if not task_data.completed_tasks then
        task_data.completed_tasks = {}   -- {task_id, ...}
    end

    return task_data
end

-- ==================== 公共接口 ==============================

-- 初始化任务系统（在角色创建或加载时调用）
function M.InitTask(role)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return false
    end
    
    -- 验证已有任务数据
    local valid_count = 0
    for task_id, save_data in pairs(task_data.active_tasks) do
        local task_config = M.GetTaskConfig(task_id)
        if task_config then
            valid_count = valid_count + 1
        else
            LOG_WARN("无法找到任务配置 ID: " .. tostring(task_id))
            task_data.active_tasks[task_id] = nil
        end
    end

    return true
end

-- 接受任务
function M.AcceptTask(role, task_id)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return false
    end
    
    -- 检查是否已达上限
    local active_count = 0
    for _ in pairs(task_data.active_tasks) do
        active_count = active_count + 1
    end
    
    if active_count >= task_data.max_active then
        return false
    end
    
    -- 检查是否已接取
    if task_data.active_tasks[task_id] then
        return false
    end
    
    -- 获取任务配置
    local task_config = M.GetTaskConfig(task_id)
    if not task_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(task_id))
        return false
    end
    
    -- 检查等级要求
    if role.level < task_config.required_level then
        return false
    end
    
    -- 初始化任务进度数据
    local objectives_data = {}
    if task_config.objectives then
        for i, obj_id in ipairs(task_config.objectives) do
            local obj_config = M.GetTaskObjConfig(obj_id)
            if obj_config then
                objectives_data[i] = {
                    current_count = 0,
                    completed = false
                }
            else
                LOG_WARN("未找到子任务配置 ID:" .. tostring(obj_id))
            end
        end
    end
    
    -- 保存任务数据
    task_data.active_tasks[task_id] = {
        status = TaskDef.TaskStatus.IN_PROGRESS,
        start_time = Utils.GetServerTime(),
        complete_time = 0,
        objectives = objectives_data
    }
    
    LOG_INFO("接受任务: " .. task_config.name)
    LOG_INFO(task_config.description)
    LOG_INFO("任务目标:")
    
    if task_config.objectives then
        for i, obj_id in ipairs(task_config.objectives) do
            local obj_config = M.GetTaskObjConfig(obj_id)
            if obj_config then
                LOG_INFO("  " .. tostring(i) .. ". " .. obj_config.description .. 
                    " (0/" .. tostring(obj_config.required_count) .. ")")
            end
        end
    end
        
    -- 触发事件
    EventManager.TriggerEvent(EventManager.lua_OnTaskAccepted, {
        role = role,
        task_id = task_id,
        task_name = task_config.name
    })
    
    return true
end



-- ==================== 任务进度更新接口 ==============================
function M.UpdateTaskByEvent(role, event_data)
    -- 只处理在线角色, 避免把战斗单位当成角色传入
    if type(role) ~= "table" or not role.uid or role.uid <= 0 then
        return
    end

    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return
    end

    local progress = event_data.num or 1
    local add_type = event_data.add_type or TaskDef.TaskAddType.ADD  -- 默认增加
    
    for task_id, save_data in pairs(task_data.active_tasks) do
        if save_data.status == TaskDef.TaskStatus.IN_PROGRESS then
            local task_config = M.GetTaskConfig(task_id)
            if not task_config then
                LOG_WARN("未找到任务配置 ID: " .. tostring(task_id))
                goto continue
            end
            
            local updated = false

            if task_config.objectives then
                for i, obj_id in ipairs(task_config.objectives) do
                    local obj_config = M.GetTaskObjConfig(obj_id)
                    if obj_config and save_data.objectives[i] then
                        local obj_data = save_data.objectives[i]
                        
                        if not obj_data.completed then
                            local match_func = M.GetObjHandler(obj_config.obj_type)
                            
                            if match_func then
                                if match_func(obj_config.conditions or {}, event_data) then

                                    if TaskDef.TaskAddType.ADD == add_type then
                                        obj_data.current_count = math.max(obj_data.current_count, obj_data.current_count + progress)
                                    elseif TaskDef.TaskAddType.REMOVE == add_type then
                                        obj_data.current_count = math.max(obj_data.current_count, progress)
                                    end
                                    
                                    if obj_data.current_count >= obj_config.required_count then
                                        obj_data.current_count = obj_config.required_count
                                        obj_data.completed = true
                                    end
                                    
                                    updated = true
                                end
                            end
                        end
                    end
                end
            end
            
            if updated then
                -- 检查是否完成
                local all_completed = true
                for i, obj_data in pairs(save_data.objectives) do
                    if not obj_data.completed then
                        all_completed = false
                        break
                    end
                end
                
                if all_completed then
                    save_data.status = TaskDef.TaskStatus.COMPLETED
                    save_data.complete_time = Utils.GetServerTime()
                                        
                    EventManager.TriggerEvent(EventManager.lua_OnTaskCompleted, {
                        role = role,
                        task_id = task_id,
                        task_name = task_config.name
                    })
                end
            end
        end
        
        ::continue::
    end
end

-- 提交任务
function M.TurnInTask(role, task_id)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return false
    end
    
    local save_data = task_data.active_tasks[task_id]
    if not save_data then
        LOG_ERROR("未找到该任务")
        return false
    end
    
    if save_data.status ~= TaskDef.TaskStatus.COMPLETED then
        LOG_ERROR("任务尚未完成")
        return false
    end
    
    local task_config = M.GetTaskConfig(task_id)
    if not task_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(task_id))
        return false
    end
    
    -- 发放奖励
    if task_config.reward_items and #task_config.reward_items > 0 then
        for _, item_data in ipairs(task_config.reward_items) do
            local item_id = item_data.item_id
            local num = item_data.num or 1
            GLO.Knapsack.AddItem(role, item_id, num, GLO.Knapsack.ITEM_REASON.TASK_REWARD, "TaskReward")
            
            local item_config = GLO.Item.GetItemConfig(item_id)
            if item_config then
                LOG_INFO("    - " .. item_config.name .. " x" .. tostring(num))
            end
        end
    end
        
    save_data.status = TaskDef.TaskStatus.TURNED_IN
    
    -- 移动到完成列表
    task_data.active_tasks[task_id] = nil
    table.insert(task_data.completed_tasks, task_id)
    
    -- 触发事件
    EventManager.TriggerEvent(EventManager.lua_OnTaskTurnedIn, {
        role = role,
        task_id = task_id,
        task_name = task_config.name
    })
    
    return true
end

-- 放弃任务
function M.AbandonTask(role, task_id)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return false
    end
    
    local save_data = task_data.active_tasks[task_id]
    if not save_data then
        LOG_ERROR("未找到该任务")
        return false
    end
    
    if save_data.status ~= TaskDef.TaskStatus.IN_PROGRESS then
        LOG_ERROR("任务无法放弃")
        return false
    end
    
    local task_config = M.GetTaskConfig(task_id)
    local task_name = task_config and task_config.name or "未知任务"
    
    -- 从数据中移除
    task_data.active_tasks[task_id] = nil
        
    return true
end

-- 检查是否有任务
function M.HasTask(role, task_id)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return false
    end
    
    return task_data.active_tasks[task_id] ~= nil
end

-- 获取任务保存数据
function M.GetTaskSaveData(role, task_id)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return nil
    end
    
    return task_data.active_tasks[task_id]
end

-- 获取所有激活任务
function M.GetActiveTasks(role)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return {}
    end
    
    local tasks = {}
    
    for task_id, save_data in pairs(task_data.active_tasks) do
        local task_config = M.GetTaskConfig(task_id)
        if task_config then
            table.insert(tasks, {
                task_id = task_id,
                task_config = task_config,
                save_data = save_data
            })
        end
    end
    
    return tasks
end

-- 获取已完成任务数量
function M.GetCompletedTasksCount(role)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return 0
    end
    
    return #task_data.completed_tasks
end

-- 获取任务进度
function M.GetTaskProgress(role, task_id)
    local save_data = M.GetTaskSaveData(role, task_id)
    if not save_data then
        return 0, 0
    end
    
    local completed = 0
    local total = 0
    
    for _, obj_data in pairs(save_data.objectives) do
        total = total + 1
        if obj_data.completed then
            completed = completed + 1
        end
    end
    
    return completed, total
end

-- 打印任务日志
function M.PrintTaskLog(role)
    local task_data = LOC.GetOrSetTaskData(role)
    if not task_data then
        return
    end
    
    local active_count = 0
    for _ in pairs(task_data.active_tasks) do
        active_count = active_count + 1
    end
    
    LOG_INFO("进行中: " .. tostring(active_count) .. "/" .. tostring(task_data.max_active))
    
    if active_count > 0 then
        for task_id, save_data in pairs(task_data.active_tasks) do
            local task_config = M.GetTaskConfig(task_id)
            if task_config then
                local completed, total = M.GetTaskProgress(role, task_id)
                local progress_bar = LOC.CreateProgressBar(completed, total, 10)
                LOG_INFO(task_config.name .. " " .. progress_bar .. 
                    " (" .. tostring(completed) .. "/" .. tostring(total) .. ")")
            end
        end
    end
    
    LOG_INFO("已完成: " .. tostring(#task_data.completed_tasks))
end

-- 打印任务详情
function M.PrintTaskStatus(role, task_id)
    local save_data = M.GetTaskSaveData(role, task_id)
    if not save_data then
        LOG_ERROR("未找到该任务")
        return
    end
    
    local task_config = M.GetTaskConfig(task_id)
    if not task_config then
        LOG_ERROR("未找到任务配置 ID:" .. tostring(task_id))
        return
    end
    
    LOG_INFO("任务: " .. task_config.name)
    LOG_INFO("状态: " .. LOC.GetTaskStatusName(save_data.status))
    LOG_INFO("等级: " .. tostring(task_config.level))
    LOG_INFO("描述: " .. task_config.description)
    LOG_INFO("任务目标:")
    
    if task_config.objectives then
        for i, obj_id in ipairs(task_config.objectives) do
            local obj_config = M.GetTaskObjConfig(obj_id)
            local obj_data = save_data.objectives[i]
            
            if obj_config and obj_data then
                local status_icon = obj_data.completed and "✅" or "⬜"
                LOG_INFO("  " .. status_icon .. " " .. obj_config.description .. 
                    " (" .. tostring(obj_data.current_count) .. "/" .. tostring(obj_config.required_count) .. ")")
            end
        end
    end
end

-- =============辅助函数===================

function LOC.GetTaskStatusName(status)
    if status == TaskDef.TaskStatus.NOT_STARTED then
        return "未开始"
    elseif status == TaskDef.TaskStatus.IN_PROGRESS then
        return "进行中"
    elseif status == TaskDef.TaskStatus.COMPLETED then
        return "已完成"
    elseif status == TaskDef.TaskStatus.FAILED then
        return "已失败"
    elseif status == TaskDef.TaskStatus.TURNED_IN then
        return "已提交"
    else
        return "未知"
    end
end

function LOC.CreateProgressBar(current, total, width)
    width = width or 10
    if total == 0 then
        return "[" .. string.rep("░", width) .. "]"
    end
    
    local filled = math.floor((current / total) * width)
    local empty = width - filled
    
    local bar = "["
    for i = 1, filled do
        bar = bar .. "█"
    end
    for i = 1, empty do
        bar = bar .. "░"
    end
    bar = bar .. "]"
    
    return bar
end

LOG_INFO("Task 加载完成")

return M
