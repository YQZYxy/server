-- ============================================================
-- Protobuf 模块
-- ============================================================

local M = {}


-- 根据 msg_type 获取消息体 proto 类型名
function M.GetBodyType(msg_type)
	return cpp_ProtoGetBodyType(msg_type)
end

-- 编码消息体
function M.EncodeBody(msg_type, data)
	return cpp_ProtoEncodeBody(msg_type, data)
end

-- 解码消息体
function M.DecodeBody(msg_type, data)
	return cpp_ProtoDecodeBody(msg_type, data)
end

-- 发送消息 (C++ 负责构造消息头, Lua 只传包体)
function M.SendMsg(netid, msg_type, body, token)
	if not netid or netid <= 0 then
		return false
	end
	local body_encoded = M.EncodeBody(msg_type, body)
	if not body_encoded then return end
	return cpp_SendMsg(netid, msg_type, body_encoded, token or "")
end

-- 按角色 uid 发送消息
function M.SendMsgToUid(uid, msg_type, body)
	if not uid or uid <= 0 then
		return false
	end
	local body_encoded = M.EncodeBody(msg_type, body)
	if not body_encoded then return end
	return cpp_SendMsgToUid(uid, msg_type, body_encoded)
end

-- 按角色role发送消息
function M.SendMsgToRole(role, msg_type, body)
	if not role or not role.uid or role.uid <= 0 then
		return false
	end
	return M.SendMsgToUid(role.uid, msg_type, body)
end

-- 发送数据库消息 (C++ 负责构造消息头, Lua 只传包体)
function M.SendDBMsg(msg_type, body)
	local body_encoded = M.EncodeBody(msg_type, body)
	if not body_encoded then return end
	return cpp_SendDBMsg(msg_type, body_encoded)
end

-- 直接编码指定 proto 类型 (用于序列化 PB_RoleData 等数据消息, 无需 msg_type)
function M.Encode(data, message_type)
	return cpp_ProtoEncode(message_type, data)
end

-- 直接解码指定 proto 类型
function M.Decode(data, message_type)
	return cpp_ProtoDecode(message_type, data)
end

-- 列出所有已加载的消息类型
function M.ListTypes()
	return cpp_ProtoListTypes()
end

-- 列出指定消息类型的所有字段
function M.ListFields(message_type)
	return cpp_ProtoListFields(message_type)
end

LOG_INFO("Protobuf 加载完成")

return M