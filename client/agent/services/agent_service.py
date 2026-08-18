# -*- coding: utf-8 -*-
from typing import Optional, Generator
from agent.agent_executor import AgentExecutor
from agent.chat_options import ChatOptions
from agent.session.session_store import get_session_store


class AgentService:
    """
    Agent 服务层

    在 AgentExecutor 之上提供业务级功能:
      - 会话生命周期管理
      - Agent 状态查询
      - 多 Agent 路由
    """

    def __init__(self):
        self.m_executor = AgentExecutor()
        self.m_session_store = get_session_store()

    def chat(
        self,
        session_id: str,
        user_input: str,
        new_session: bool = False,
        opts: ChatOptions = None,
    ) -> Generator[str, None, None]:
        """
        Agent 流式对话

        Args:
            session_id: 会话 ID
            user_input: 用户输入
            new_session: 是否创建新会话
            opts: ChatOptions 对象

        Yields:
            SSE 事件流
        """
        if opts is None:
            opts = ChatOptions()

        if new_session:
            self.m_executor.reset_session(session_id)

        yield from self.m_executor.run_streaming(
            session_id=session_id,
            user_input=user_input,
            opts=opts,
        )

    def cancel_stream(self, session_id: str) -> bool:
        """取消正在进行的流式对话"""
        return self.m_executor.cancel_stream(session_id)

    def destroy_session(self, session_id: str) -> bool:
        """销毁会话"""
        return self.m_session_store.delete(session_id)

    def list_sessions(self) -> list:
        """列出所有活跃会话"""
        return self.m_session_store.list_sessions()

    def get_session_history(self, session_id: str) -> list:
        """获取会话历史"""
        return self.m_session_store.get_history(session_id)

    def get_session_config(self, session_id: str) -> dict:
        """获取会话配置"""
        return self.m_session_store.get_config(session_id)

    def update_session_config(self, session_id: str, config: dict) -> None:
        """
        更新会话配置

        用于模式切换时告知服务端当前会话的模式,
        以便服务端在下次对话时使用正确的上下文构建.

        Args:
            session_id: 会话 ID
            config:     配置字典, 如 {"agent_mode": true, "tool_tags": [...]}
        """
        self.m_session_store.update_config(session_id, config)

    def get_session_stats(self) -> dict:
        """获取会话统计"""
        return self.m_session_store.stats()

    def list_tools(self) -> list:
        """列出可用工具"""
        from agent.tools.registry import get_tool_registry
        registry = get_tool_registry()
        return [
            {
                "name": tool.name,
                "description": tool.description[:200],
                "tags": [
                    g for g, names in registry.m_tags.items()
                    if tool.name in names
                ],
            }
            for tool in registry.get_tools()
        ]

    # 技能相关

    def discover_skills(self) -> dict:
        """发现并加载所有技能"""
        from agent.skills.registry import get_skill_registry, discover_skills
        registry = get_skill_registry()
        count = discover_skills()
        registry.activate_all()
        return {
            "discovered": count,
            "total": len(registry.get_skills()),
            "skills": registry.to_dict(),
        }

    def list_skills(self) -> list:
        """列出所有已加载的技能"""
        from agent.skills.registry import get_skill_registry
        registry = get_skill_registry()
        return registry.to_dict()

    def get_skill_detail(self, name: str) -> dict:
        """获取技能详情"""
        from agent.skills.registry import get_skill_registry
        registry = get_skill_registry()
        skill = registry.get_skill(name)
        if skill is None:
            return {"error": f"技能 '{name}' 未找到"}
        info = skill.to_dict()
        info["instructions"] = skill.m_instructions
        info["tools"] = [
            {"name": t.name, "description": t.description[:200]}
            for t in skill.get_tools()
        ]
        return info

    def reload_skills(self) -> dict:
        """重新加载所有技能(热更新: 清除模块缓存后重新发现)"""
        import sys
        from agent.skills.registry import get_skill_registry
        registry = get_skill_registry()
        registry.deactivate_all()
        # 清空并重新发现
        for name in list(registry.get_skill_names()):
            registry.unregister(name)
        registry.m_discovered = False

        # 清除技能模块的 sys.modules 缓存, 确保下次 import 加载新代码
        _skill_prefixes = ("agent.skills.impl.", "agent.skills.read_skill",)
        for mod_name in list(sys.modules.keys()):
            if mod_name.startswith(_skill_prefixes):
                del sys.modules[mod_name]

        return self.discover_skills()


# 全局单例
_g_agent_service: Optional[AgentService] = None


def get_agent_service() -> AgentService:
    """获取 AgentService 单例"""
    global _g_agent_service
    if _g_agent_service is None:
        _g_agent_service = AgentService()
    return _g_agent_service