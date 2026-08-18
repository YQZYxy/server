local M = {}

-- =============================表相关===============================================

-- 只读代理与原表的映射(弱引用key,自动GC)
local proxy_source_map = setmetatable({}, {__mode = "k"})

local readonly_mt = {
    __index = function(t, k)            -- 读取操作映射到原表
        return proxy_source_map[t][k]
    end,
    __newindex = function()              -- 禁止写入
        error("试图修改只读表", 2)
    end,
    __pairs = function(t)                -- 确保 pairs 正常工作
        return pairs(proxy_source_map[t])
    end,
    __len = function(t)                  -- 确保 # 操作正常
        return #proxy_source_map[t]
    end,
}

-- 返回一个只读的表(deep=true 时递归保护嵌套子表)
function M.ReadOnly(t, deep)
    deep = deep or false

    -- 深度模式:先把嵌套子表递归替换为只读代理
    if deep then
        for k, v in pairs(t) do
            if type(v) == "table" then
                t[k] = M.ReadOnly(v, true)
            end
        end
    end

    local proxy = {}
    proxy_source_map[proxy] = t
    setmetatable(proxy, readonly_mt)
    return proxy
end

-- 深拷贝表
function M.DeepCopy(original, cache)
	cache = cache or {}
	
	if type(original) ~= "table" then
		return original
	end
	
	-- 防止循环引用
	if cache[original] then
		return cache[original]
	end
	
	local copy = {}
	cache[original] = copy
	
	for k, v in pairs(original) do
		copy[M.DeepCopy(k, cache)] = M.DeepCopy(v, cache)
	end
	
	-- 复制元表(跳过 __gc 避免 double-free)
	local mt = getmetatable(original)
	if mt then
		local new_mt = {}
		for k, v in pairs(mt) do
			if k ~= "__gc" then
				new_mt[k] = v
			end
		end
		setmetatable(copy, new_mt)
	end
	return copy
end

-- 合并表
function M.Merge(target, source, deep)
	deep = deep or false
	
	for k, v in pairs(source) do
		if deep and type(v) == "table" and type(target[k]) == "table" then
			M.Merge(target[k], v, true)
		else
			target[k] = v
		end
	end
	
	return target
end

-- 表过滤
function M.Filter(tbl, predicate)
	local result = {}
	for k, v in pairs(tbl) do
		if predicate(k, v) then
			result[k] = v
		end
	end
	return result
end

-- 表映射
function M.Map(tbl, transform)
	local result = {}
	for k, v in pairs(tbl) do
		result[k] = transform(k, v)
	end
	return result
end

-- 数组去重
function M.Unique(array)
	local seen = {}
	local result = {}
	for _, v in ipairs(array) do
		if not seen[v] then
			seen[v] = true
			table.insert(result, v)
		end
	end
	return result
end

-- 查找满足条件的元素
function M.Find(tbl, predicate)
	for k, v in pairs(tbl) do
		if predicate(k, v) then
			return v, k
		end
	end
	return nil
end

-- 打印表内容
function M.PrintTable(tbl, max_depth, indent)
	max_depth = max_depth or 3
    indent = indent or 0
    
	local filename = ""
	local funcname = ""
	local line = 0

    -- 首次调用时打印调用信息
    if indent == 0 then
        local info = debug.getinfo(2, "Snl")
        filename = info.source
        -- 去除路径,只保留文件名
        if filename:sub(1, 1) == "@" then
            filename = filename:sub(2)
        end
        filename = filename:match("([^/\\]+)$") or filename
        
        funcname = info.name or "anonymous"
        line = info.currentline or 0
        
        LOG_I("=============[%s:%s:%d:表打印开始]=============", filename, funcname, line)
    end

	if type(tbl) ~= "table" then
		LOG_I(tostring(tbl))
		LOG_I("=============[%s:%s:%d:表打印结束]=============", filename, funcname, line)
		return
	end
    
    if indent > max_depth then
        LOG_I(string.rep("  ", indent) .. "...")
        return
    end
    
    local prefix = string.rep("  ", indent)
    
    for k, v in pairs(tbl) do
        if type(v) == "table" then
            LOG_I(prefix .. tostring(k) .. " = {")
            M.PrintTable(v, max_depth, indent + 1)
            LOG_I(prefix .. "}")
        else
            LOG_I(prefix .. tostring(k) .. " = " .. tostring(v))
        end
    end

	if indent == 0 then
        LOG_I("=============[%s:%s:%d:表打印结束]=============", filename, funcname, line)
    end
end

-- 表是否为空
function M.IsTableEmpty(tbl)
	return next(tbl) == nil
end

-- 获取表大小
function M.GetTableSize(tbl)
	local count = 0
	for _ in pairs(tbl) do
		count = count + 1
	end
	return count
end

-- =================================数组工具===========================================

-- 查找元素
function M.ArrayFind(array, value)
	for i, v in ipairs(array) do
		if v == value then
			return i
		end
	end
	return nil
end

-- 移除元素
function M.ArrayRemove(array, value)
	local index = M.ArrayFind(array, value)
	if index then
		table.remove(array, index)
		return true
	end
	return false
end

-- 数组是否包含元素
function M.ArrayContains(array, value)
	return M.ArrayFind(array, value) ~= nil
end

-- =================================字符串工具===========================================

-- 分割字符串(支持多字符分隔符)
function M.StringSplit(str, delimiter)
	local result = {}
	local pattern = string.format("([^%s]+)", delimiter)
	for match in string.gmatch(str, pattern) do
		table.insert(result, match)
	end
	return result
end

-- 去除前后空格
function M.StringTrim(str)
	return str:match("^%s*(.-)%s*$")
end

-- 字符串是否为空
function M.StringIsEmpty(str)
	return str == nil or str == ""
end

-- 字符串模板替换
function M.StringTemplate(template, params)
	return (template:gsub("{(%w+)}", function(key)
		return tostring(params[key] or "")
	end))
end

-- 字符串首字母大写
function M.StringCapitalize(str)
	return str:sub(1, 1):upper() .. str:sub(2)
end

-- 判断是否以某字符串开头
function M.StringStartsWith(str, prefix)
	return str:sub(1, #prefix) == prefix
end

-- 判断是否以某字符串结尾
function M.StringEndsWith(str, suffix)
	return str:sub(-#suffix) == suffix
end


-- =================================数学工具===========================================

-- 限制数值范围
function M.Clamp(value, min_val, max_val)
	if value < min_val then return min_val end
	if value > max_val then return max_val end
	return value
end

-- 线性插值
function M.Lerp(a, b, t)
	return a + (b - a) * t
end

-- 随机范围
function M.Random(min_val, max_val)
    return math.random(min_val, max_val)
end

-- 随机浮点数
function M.RandomFloat(min_val, max_val)
	return min_val + math.random() * (max_val - min_val)
end

-- 百分比判定
function M.RandomChance(chance)
	return math.random() < chance
end

-- 概率权重随机
function M.WeightedRandom(weights)
	local total = 0
	for _, weight in ipairs(weights) do
		total = total + weight
	end
	
	local rand = math.random() * total
	local cumulative = 0
	
	for i, weight in ipairs(weights) do
		cumulative = cumulative + weight
		if rand <= cumulative then
			return i
		end
	end
	
	return #weights
end


-- =================================ID 生成器===========================================

local id_counter = 0

function M.GenerateID()
	id_counter = id_counter + 1
	return id_counter
end

function M.GenerateUUID()
	local template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
	return string.gsub(template, "[xy]", function(c)
		local v = (c == "x") and math.random(0, 0xf) or math.random(8, 0xb)
		return string.format("%x", v)
	end)
end

-- ===================================时间工具=========================================

function M.GetServerTime()
	return cpp_GetServerTime()
end

function M.TimeFormat(timestamp)
	-- 简化版时间格式化
	return os.date("%Y-%m-%d %H:%M:%S", timestamp)
end

-- 打乱数组(Fisher-Yates shuffle)
-- @param tbl: 数组table
-- @return 打乱后的数组
function M.ShuffleTable(tbl)
    if not tbl or #tbl == 0 then
        return tbl or {}
    end
    local result = {}
    for _, v in ipairs(tbl) do
        table.insert(result, v)
    end
    for i = #result, 2, -1 do
        local j = math.random(1, i)
        result[i], result[j] = result[j], result[i]
    end
    return result
end

-- 获取服务器day_id(用于每日重置判断)
function M.GetServerDayId()
    local ts = M.GetServerTime()
    if not ts or ts == 0 then
        ts = os.time()
    end
    return math.floor(ts / 86400)
end


LOG_INFO("Utils 加载完成")

return M