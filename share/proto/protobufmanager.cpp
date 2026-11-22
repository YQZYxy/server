#include "protobufmanager.hpp"
#include "google/protobuf/descriptor.h"
#include "google/protobuf/message.h"


ProtoManager::~ProtoManager()
{
	for (int msg_type = 0; msg_type < MSG_HEAD_TYPE_MAX; ++msg_type)
	{
		if (nullptr != m_cache[msg_type].msg)
		{
			delete m_cache[msg_type].msg;
			m_cache[msg_type].msg = nullptr;
		}

		if (nullptr != m_prototypes[msg_type])
		{
			delete m_prototypes[msg_type];
			m_prototypes[msg_type] = nullptr;
		}
	}
}


ProtoManager& ProtoManager::Instance()
{
	static ProtoManager instance;
	return instance;
}

ProtoMsg* ProtoManager::GetCachedMessage(int msg_type)
{
	// 非法消息类型直接返回, 避免数组越界
	if (msg_type < 0 || msg_type >= MSG_HEAD_TYPE_MAX)
	{
		return nullptr;
	}

	auto& cache = m_cache[msg_type];
	if (nullptr == cache.msg)
	{
		std::shared_lock<std::shared_mutex> lock(m_proto_mutex);
		cache.use_count = 0;
		ProtoMsg* prototype = m_prototypes[msg_type];
		cache.msg = (nullptr == prototype) ? nullptr : prototype->New();
	}

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