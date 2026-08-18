-- =====================================================
-- Lua Table Serializer
-- 数据结构的序列化/反序列化
-- 不支持: 函数, userdata, thread, 循环引用, 元表
-- =====================================================

local M = {}
M.Simple = {}

-- 简单序列化: 表转字符串
-- 支持: nil, number, boolean, string, table (含嵌套)
-- @param data: 待序列化的数据
-- @return string: 序列化后的字符串（兼容 load() 解析格式）
function M.Simple.Serialize(data)
	return cpp_FastSerialize(data)
end

-- 简单反序列化: 字符串转表
-- @param str: 序列化的字符串或Lua表
-- @return table: 反序列化后的数据
function M.Simple.Deserialize(str)
	-- 如果已经是表，直接返回
	if type(str) == "table" then
		return str
	end

	if type(str) ~= "string" or str == "" then
		error("Deserialize expects a non-empty string")
		return nil
	end

	-- 清理可能的 return 前缀
	local cleanStr = str:gsub("^%s*return%s+", "")

	-- 标准表表达式处理
	local env = {}
	local func, err = load("return " .. cleanStr, "Deserialize", "t", env)
	if not func then
		local preview = cleanStr:sub(1, 200)
		error(string.format(
			"Failed to parse serialized data: %s\nData preview: %s",
			tostring(err), preview))
	end

	local success, result = pcall(func)
	if not success then
		error("Failed to execute deserialized data: " .. tostring(result))
	end

	return result
end

return M