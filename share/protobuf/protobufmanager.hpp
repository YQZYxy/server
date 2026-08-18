#ifndef __PROTOBUF_MANAGER_HPP__
#define __PROTOBUF_MANAGER_HPP__

#include "google/protobuf/message.h"
#include "module/network.hpp"
#include <map>
#include <shared_mutex>

#include "protocol/protobufmht.hpp"
#include "protocol/protobuftemplate.hpp"
#include "protocol/protocol.pb.h"
#include "protocol/data.pb.h"
#include "protocol/battledata.pb.h"

typedef google::protobuf::Message ProtoMsg;


class ProtoManager
{
public:
	static ProtoManager& Instance();

	// 获取一个按 msg_type 缓存的消息对象 (创建对应PB类型 非线程安全)
	ProtoMsg* GetCachedMessage(int msg_type);

	// 注册 msg_type -> 具体消息类型的映射 (进程启动自动注册完全的协议 线程安全)
	// 使用: REGISTER_PROTO_MSG(MHT_LOGIN_CS, P_LoginReq_CS);
	template <typename T>
	void Register(int msg_type)
	{
		std::lock_guard<std::shared_mutex> lock(m_proto_mutex);
		m_prototypes[msg_type] = T::default_instance().New();
	}

	// 根据 msg_type 创建对应类型的消息 (线程安全, 不缓存)
	std::shared_ptr<ProtoMsg> CreateMessage(int msg_type)
	{
		std::shared_lock<std::shared_mutex> lock(m_proto_mutex);
		auto it = m_prototypes.find(msg_type);
		if (m_prototypes.end() == it)
		{
			return nullptr;
		}
		return std::shared_ptr<ProtoMsg>(it->second->New());
	}

	// 构建并发送 protobuf 消息
	template<typename T>
	static bool SendMsg(int netid, const T* body_msg, const std::string& token = "");

private:
	struct ProtoMsgCache
	{
		int use_count = 0;
		ProtoMsg* msg = nullptr;
	};
	
	std::map<int, ProtoMsgCache> m_cache;
	mutable std::shared_mutex m_proto_mutex;
	std::map<int, ProtoMsg*> m_prototypes;	// 每个类型一个原型对象

	ProtoManager() = default;
	~ProtoManager();

	// 禁用深拷贝
	ProtoManager(const ProtoManager&) = delete;
	ProtoManager& operator=(const ProtoManager&) = delete;
	ProtoManager(ProtoManager&&) = delete;
	ProtoManager& operator=(ProtoManager&&) = delete;
};

// 快捷注册宏: REGISTER_PROTO_MSG(P_LoginReq_CS)
#define REGISTER_PROTO_MSG(MsgClass) \
	ProtoManager::Instance().Register<MsgClass>(ProtoMsgType<MsgClass>::type);

// 获取缓存的消息对象并自动转型 (非线程安全 单线程下使用)
// 用法: auto* pb_msg = GET_PROTO_MESSAGE(P_LoginReq_CS);
#define GET_PROTO_MESSAGE(MsgClass) \
	dynamic_cast<MsgClass*>(ProtoManager::Instance().GetCachedMessage(ProtoMsgType<MsgClass>::type))

// 创建新的消息对象并自动转型 (线程安全, 不缓存)
// 用法: auto pb_msg = CREATE_PROTO_MESSAGE(P_LoginReq_CS);
#define CREATE_PROTO_MESSAGE(MsgClass) \
	std::dynamic_pointer_cast<MsgClass>(ProtoManager::Instance().CreateMessage(ProtoMsgType<MsgClass>::type))

// 构建 protobuf 数据包: [2B headLen][PB_MessageHead][body]
// msg_type 消息类型
// body_msg protobuf消息体
// token 消息头令牌(可选)
// return 序列化后的数据包字符串
template<typename T>
std::string BuildProtoPacket(const T* body_msg, const std::string& token = "") {
	int msg_type = ProtoMsgType<T>::type;
	if(nullptr == body_msg)
	{
		return "";
	}

	// 构造消息头
	PB_MessageHead head;
	head.set_msg_type(msg_type);
	if(!token.empty())
	{
		head.set_token(token);
	}

	// 序列化: [2字节头部长度][消息头字节][消息体字节]
	std::string head_str = head.SerializeAsString();
	std::string body_str = body_msg->SerializeAsString();
	uint16_t head_len = (uint16_t)head_str.size();
	std::string data;
	data.reserve(sizeof(head_len) + head_str.size() + body_str.size());
	data.append((const char*)&head_len, sizeof(head_len));
	data += head_str;
	data += body_str;

	return data;
}

// 构建 protobuf 数据包 (直接传序列化后的包体字节, 调用需要使用移动语义避免拷贝)
inline std::string BuildProtoPacket(int msg_type, std::string body_data, const std::string& token = "")
{
	// 构造消息头
	PB_MessageHead head;
	head.set_msg_type(msg_type);
	if(!token.empty())
	{
		head.set_token(token);
	}

	// 序列化: [2字节头部长度][消息头字节][消息体字节]
	std::string head_str = head.SerializeAsString();
	uint16_t head_len = (uint16_t)head_str.size();
	std::string data;
	data.reserve(sizeof(head_len) + head_str.size() + body_data.size());
	data.append((const char*)&head_len, sizeof(head_len));
	data += head_str;
	data += std::move(body_data);

	return data;
}

// 发送 protobuf 消息
template<typename T>
bool ProtoManager::SendMsg(int netid, const T* body_msg, const std::string& token)
{
	auto data = BuildProtoPacket(body_msg, token);
	return !data.empty() && Network::Instance().SendMsg(netid, std::move(data));
}

#endif // __PROTOBUF_MANAGER_HPP__
