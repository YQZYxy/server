-- 事件管理器
-- 统一的事件分发系统（桥接到 C++ 事件系统）
local GLO = GLO 
local LOC = {}
-- 临时数据,热更新重新注册
local M = {
	m_listener_ids = {},  -- 存储 listener_id 用于移除
	m_initialized = false
}


-- ================= c++ 事件名 ===================

M.cpp_OnRoleLogin = "cpp_OnRoleLogin"
M.cpp_OnRoleLogout = "cpp_OnRoleLogout"
M.cpp_OnDayChange = "cpp_OnDayChange"
M.cpp_OnWeekChange = "cpp_OnWeekChange"
M.cpp_OnMonthChange = "cpp_OnMonthChange"
M.cpp_OnGmCommand = "cpp_OnGmCommand"
M.cpp_OnInitRoleDataFindRet = "cpp_OnInitRoleDataFindRet"
M.cpp_OnBattleResult = "cpp_OnBattleResult"

-- ================= lua 事件名 ===================
M.lua_OnRoleLevelUp = "lua_OnRoleLevelUp"
M.lua_OnHeroLevelUp = "lua_OnHeroLevelUp"

-- gas_battle
M.lua_OnBattleStart = "lua_OnBattleStart"
M.lua_OnBattleEnd = "lua_OnBattleEnd"
M.lua_OnGameplayTagChanged = "lua_OnGameplayTagChanged"
M.lua_OnAttrChange = "lua_OnAttrChange"
M.lua_OnPlayerDeath = "lua_OnPlayerDeath"

-- inventory
M.lua_OnAddItem = "lua_OnAddItem"
M.lua_OnRemoveItem = "lua_OnRemoveItem"
M.lua_OnUseItem = "lua_OnUseItem"

M.lua_OnNPCTalk = "lua_OnNPCTalk"
M.lua_OnZoneEnter = "lua_OnZoneEnter"

M.lua_OnQuestAccepted = "lua_OnQuestAccepted"
M.lua_OnQuestTurnedIn = "lua_OnQuestTurnedIn"
M.lua_OnQuestCompleted = "lua_OnQuestCompleted"

M.lua_OnAccept = "lua_OnAccept"
M.lua_OnDisconnect = "lua_OnDisconnect"


-- ================= 事件优先级 ===================

M.EVENT_PRIORITY_DEFAULT = 100	-- 默认事件优先级

-- cpp_OnRoleLogin 事件
M.EVENT_PRIORITY_ROLE_LOGIN_BASE = 200	-- 角色登录基础信息下发客户端
M.EVENT_PRIORITY_ROLE_LOGIN_CREATE_ROLE = 300 -- 角色登录创建角色实例

-- cpp_OnRoleLogout 事件
M.EVENT_PRIORITY_ROLE_LOGOUT_SAVE_ROLE_DATA = 1	-- 角色登出保存数据,放在最后,等其他模块处理后再执行

-- cpp_OnGmCommand 事件
M.EVENT_PRIORITY_GM_MAIN = 200	-- GM入口




-- =================注册监听器 默认优先级 EVENT_PRIORITY_DEFAULT = 100 优先级越高越先执行 ===================
function M.RegisterListener(event_name, callback, priority)
	priority = priority or M.EVENT_PRIORITY_DEFAULT
	
	-- 调用 C++ 的 RegisterEvent 函数
	local listener_id = RegisterEvent(event_name, callback, priority, false)
	
	-- 保存 listener_id 用于后续移除
	if not M.m_listener_ids[event_name] then
		M.m_listener_ids[event_name] = {}
	end
	
	table.insert(M.m_listener_ids[event_name], {
		listener_id = listener_id,
		callback = callback
	})
	
	return listener_id
end

-- =================触发事件 ============
function M.TriggerEvent(event_name, event_data)
	-- 调用 C++ 的 TriggerEvent 函数
	TriggerEvent(event_name, event_data or {})
end

-- ====================移除监听器==============
function M.RemoveListener(event_name, callback)
	local listeners = M.m_listener_ids[event_name]
	if not listeners then
		return
	end
	
	for i = #listeners, 1, -1 do
		if listeners[i].callback == callback then
			-- 调用 C++ 的 UnregisterEvent 函数
			UnregisterEvent(listeners[i].listener_id)
			table.remove(listeners, i)
		end
	end
end

-- ==================清除所有监听器===============
function M.ClearAllListeners()
	for event_name, listeners in pairs(M.m_listener_ids) do
		for _, listener_info in ipairs(listeners) do
			UnregisterEvent(listener_info.listener_id)
		end
	end
	
	M.m_listener_ids = {}
	LOG_INFO("已清除所有事件监听器")
end

LOG_INFO("EventManager 加载完成")

return M