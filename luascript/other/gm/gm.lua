-- GM 模块
-- 管理所有 GM 指令和管理员功能
local GLO = GLO 
local Utils = GLO.Utils
local LOC = {}
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local EventManager = GLO.EventManager

-- 临时数据 热更重新注册
local M = {
	m_commands = {},
	m_command_history = {},
	m_max_history = 100
}

-- =================注册事件监听==================
EventManager.RegisterListener(EventManager.cpp_OnGmCommand, function(event_data)
	local command = event_data.command
	local netid = event_data.netid

	local start_time = os.clock()
	local success, result = M.ExecuteCommand(command, netid)
	local end_time = os.clock()
	local duration = (end_time - start_time) * 1000 -- 转换为毫秒

	if success then
		LOG_INFO("【事件】 GM 耗时:%.2fms 命令执行: %s - %s ", duration, command, result or "完成")
	else
		LOG_WARN("【事件】 GM 耗时:%.2fms 指令失败: %s - %s ", duration, command, result or "未知错误")
	end

	M.SendMsg(netid, command, success, result)
end,EventManager.EVENT_PRIORITY_GM_MAIN)

-- ===================注册 GM 指令============
function M.RegisterCommand(command_name, description, handler_func)
	local command_name_lower = string.lower(command_name)
	
	if M.m_commands[command_name_lower] then
		LOG_WARN("GM 命令已存在，覆盖: " .. command_name)
	end
	
	M.m_commands[command_name_lower] = {
		name = command_name,
		description = description or "",
		handler = handler_func,
	}
	-- LOG_INFO("注册 GM: " .. command_name)
	return true
end

-- ===============执行 GM 指令==============
function M.ExecuteCommand(command_string, netid)
	if not command_string or command_string == "" then
		return false, "空指令"
	end
	
	-- 解析指令
	local parts = Utils.StringSplit(command_string, " ")
	if #parts == 0 then
		return false, "无效指令"
	end
	
	local command_name = string.lower(parts[1])
	local args = {}
	for i = 2, #parts do
		table.insert(args, parts[i])
	end
	
	-- 查找指令
	local command = M.m_commands[command_name]
	if not command then
		return false, "错误指令: " .. command_name
	end
	
	-- 记录指令历史
	M.RecordCommand(command_string)
	
	-- 执行指令
	local role = GLO.RoleManager.GetRoleByNetid(netid)
	local success, result = command.handler(args,role)
	if not success then
		if result then
			return false, "指令执行失败: " .. tostring(result)
		end
		return true, "" -- 如果没写return默认为执行完成
	end
	
	return true, result
end

-- ================ 发送GM执行是否成功 =================
function M.SendMsg(netid, command_string, success, result)
	Protobuf.SendMsg(netid, MHT.MHT_GM_SC, {
		params = command_string .. "  ==> ".. tostring(result),
		ret = success and 0 or -1
	})
end

-- ==============记录指令历史===================
function M.RecordCommand(command_string)

	LOG_INFO("记录GM指令: " .. command_string)

	local record = {
		command = command_string,
		timestamp = Utils.GetServerTime()
	}
	
	table.insert(M.m_command_history, record)
	
	-- 限制历史记录数量
	while #M.m_command_history > M.m_max_history do
		table.remove(M.m_command_history, 1)
	end
end


-- ===============================
function M.Cmd_Help(args)
	if #args > 0 then
		-- 显示指定指令的帮助
		local command_name = string.lower(args[1])
		local command = M.m_commands[command_name]
		
		if not command then
			return "错误指令名: " .. command_name
		end
		
		local help_text = {
			"Command: " .. command.name,
			"Description: " .. command.description,
		}
		
		return table.concat(help_text, "\n")
	else
		-- 显示所有可用指令
		local result = {"\n============ 可用的GM命令 ==============\n"}
		
		for command_name, command in pairs(M.m_commands) do
			table.insert(result, string.format("%s - %s", command.name, command.description))
		end
		
		table.insert(result, "\n====== 使用 'help <command>' 详尽阅读 =========")
		
		return table.concat(result, "\n")
	end
end
-- 注册示例 GM 指令
M.RegisterCommand("help", "显示帮助", M.Cmd_Help)

LOG_INFO("Gm 加载完成")


return M