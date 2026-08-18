#include "protobufmanager.hpp"
#include "google/protobuf/descriptor.h"
#include "google/protobuf/message.h"


ProtoManager::~ProtoManager()
{
	for (auto& it : m_cache)
	{
		if (nullptr != it.second.msg)
		{
			delete it.second.msg;
			it.second.msg = nullptr;
		}
	}
	m_cache.clear();

	for (auto& it : m_prototypes)
	{
		if (nullptr != it.second)
		{
			delete it.second;
			it.second = nullptr;
		}
	}
	m_prototypes.clear();
}


ProtoManager& ProtoManager::Instance()
{
	static ProtoManager instance;
	return instance;
}

ProtoMsg* ProtoManager::GetCachedMessage(int msg_type)
{
	if (m_cache.end() == m_cache.find(msg_type))
	{
		std::shared_lock<std::shared_mutex> lock(m_proto_mutex);
		m_cache[msg_type].use_count = 0;
		auto it = m_prototypes.find(msg_type);
		m_cache[msg_type].msg = (m_prototypes.end() == it) ? nullptr : it->second->New();
	}

	auto& cache = m_cache[msg_type];
	if (nullptr == cache.msg)
	{
		return nullptr;
	}

	// 多次使用后重建, 避免内部缓存膨胀
	if (64 < ++cache.use_count)
	{
		ProtoMsg* new_msg = cache.msg->New();
		delete cache.msg;
		cache.msg = new_msg;
		cache.use_count = 0;
	}

	cache.msg->Clear();
	return cache.msg;
}

// 自动注册所有消息类型到 ProtoManager
// 由 _generate_msgheaddef.py 生成, 修改 .proto 重新生成即可
#include "protocol/protobufregister.cpp"