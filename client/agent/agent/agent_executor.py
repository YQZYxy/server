# -*- coding: utf-8 -*-
import queue
import threading
import httpx
from typing import Generator, Optional, List
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import BaseTool

from .llm_factory import create_llm
from .streaming import AgentStreamCallback, sse_event_generator
from .tools.registry import get_tool_registry
from .skills.registry import get_skill_registry, discover_skills
from .session.session_store import get_session_store
from .prompts.templates import get_tools_prompt, get_default_prompt
from .chat_options import ChatOptions
from config.config import get_config


class AgentExecutor:
    """
    Agent 执行器
    """

    def __init__(self):
        self.m_config = get_config()
        self.m_tool_registry = get_tool_registry()
        self.m_session_store = get_session_store()
        # 会话 httpx 客户端: session_id -> httpx.Client (关闭它以中止 LLM HTTP 请求)
        self.m_http_clients: dict[str, httpx.Client] = {}
        self.m_http_clients_lock = threading.Lock()

    def _build_agent(
        self,
        opts: ChatOptions,
        http_client: Optional[httpx.Client] = None,
    ):
        """
        构建 LangGraph Agent
        Args:
            opts: 聊天选项
            http_client: 可选 httpx.Client, 用于支持取消 LLM HTTP 请求
        return:
            CompiledStateGraph
        """
        # 创建 LLM
        llm = create_llm(
            model=opts.m_model,
            temperature=opts.m_temperature,
            streaming=True,
            max_tokens=opts.m_max_tokens,
            http_client=http_client,
        )

        tools = None
        system_prompt = None
        skill_instructions = ""
        skill_tools: List[BaseTool] = []

        # 始终发现技能(确保 registry 填充)
        skill_registry = get_skill_registry()
        if not skill_registry.m_discovered:
            discover_skills()
            skill_registry.activate_all()

        # 技能指令 仅当指定了 names/tags 时才注入到 system prompt
        if opts.m_skill_names is not None or opts.m_skill_tags is not None:
            skill_instructions = skill_registry.build_instructions(
                names=opts.m_skill_names,
                tags=opts.m_skill_tags,
                max_chars=self.m_config.m_skills_max_prompt_chars,
            )
            skill_tools = skill_registry.collect_tools(
                names=opts.m_skill_names,
                tags=opts.m_skill_tags,
            )
            # 有技能时自动带上系统级工具(read_skill_file 等)
            system_tools = skill_registry.collect_system_tools()
            if system_tools:
                skill_tools = list(skill_tools) + system_tools

        # 工具 仅当指定了 names/tags 时才加载
        has_tools = opts.m_tool_names is not None or opts.m_tool_tags is not None
        if has_tools:
            if opts.m_tool_names is not None:
                tools = self.m_tool_registry.get_tools(names=opts.m_tool_names)
            else:
                tools = self.m_tool_registry.get_tools(tags=opts.m_tool_tags)

        # 合并技能工具
        if skill_tools:
            if tools is None:
                tools = list(skill_tools)
            else:
                existing_names = {t.name for t in tools}
                for st in skill_tools:
                    if st.name not in existing_names:
                        tools.append(st)
                        existing_names.add(st.name)

        if has_tools or skill_instructions or skill_tools:
            system_prompt = get_tools_prompt(
                custom_instructions=opts.m_custom_instructions,
                skill_instructions=skill_instructions,
            )
        else:
            system_prompt = get_default_prompt(
                custom_instructions=opts.m_custom_instructions,
                skill_instructions=skill_instructions,
            )

        agent = create_agent(
            model=llm,
            tools=tools,
            system_prompt=system_prompt,
        )

        return agent

    def cancel_stream(self, session_id: str) -> bool:
        """
        取消正在进行的流式对话

        关闭 httpx 客户端以立即中止 LLM HTTP 请求,
        _run 线程捕获 httpx 异常后向队列投递 __cancelled__ 通知 SSE 生成器退出.

        Args:
            session_id: 会话 ID

        Returns:
            bool: 是否有对应的流需要取消
        """
        with self.m_http_clients_lock:
            client = self.m_http_clients.pop(session_id, None)
            if client is not None:
                try:
                    client.close()
                except Exception:
                    pass
                return True
        return False

    def run_streaming(
        self,
        session_id: str,
        user_input: str,
        opts: ChatOptions,
    ) -> Generator[str, None, None]:
        """
        流式执行 Agent

        Args:
            session_id: 会话 ID
            user_input: 用户输入
            opts: ChatOptions 对象

        yield:
            SSE 格式的事件字符串
        """
        event_queue = queue.Queue()

        # 为本次请求创建可取消的 httpx 客户端
        http_client = httpx.Client(timeout=httpx.Timeout(300.0, connect=30.0))
        with self.m_http_clients_lock:
            self.m_http_clients[session_id] = http_client

        try:
            # 根据 opts 同步会话配置, 记录当前模式
            has_tools = opts.m_tool_names is not None or opts.m_tool_tags is not None
            has_skills = opts.m_skill_names is not None or opts.m_skill_tags is not None
            self.m_session_store.update_config(session_id, {
                "agent_mode": "agent" if (has_tools or has_skills) else "chat",
                "has_tools": has_tools,
                "has_skills": has_skills,
            })

            agent = self._build_agent(opts, http_client=http_client)

            # 获取历史消息
            history = self.m_session_store.get_messages(session_id)

            # Chat 模式下过滤掉工具调用相关消息, 避免 LLM 看到残留的 tool call/result
            if not has_tools and not has_skills:
                filtered = [
                    m for m in history
                    if not isinstance(m, ToolMessage)
                    and not (isinstance(m, AIMessage) and m.tool_calls)
                ]
                if len(filtered) != len(history):
                    history = filtered
                    # 同步更新存储, 清理过期的工具消息
                    self.m_session_store.set_messages(session_id, list(history))
            # 追加当前用户消息
            messages = list(history) + [HumanMessage(content=user_input)]

            # 先将用户消息保存到会话历史(让 invoke 过程中能被立即看到)
            self.m_session_store.set_messages(session_id, messages)

            callback = AgentStreamCallback(
                event_queue,
                session_store=self.m_session_store,
                session_id=session_id,
                initial_messages=messages,
            )

            def _run():
                try:
                    result = agent.invoke(
                        {"messages": messages},
                        config={
                            "callbacks": [callback],
                            "recursion_limit": self.m_config.m_agent_max_iterations,
                        },
                    )

                    event_queue.put({"type": "__done__", "result": result})
                except (httpx.RemoteProtocolError, httpx.ReadError):
                    # httpx 连接被关闭(取消时主动关闭), 通知 SSE 生成器退出
                    event_queue.put({"type": "__cancelled__"})
                except Exception as e:
                    event_queue.put({"type": "__error__", "content": str(e)})

            thread = threading.Thread(target=_run, daemon=True)
            thread.start()

            yield from sse_event_generator(event_queue)

            thread.join(timeout=5)

        except Exception as e:
            yield from sse_event_generator(
                _error_queue(str(e))
            )
        finally:
            # 清理 httpx 客户端
            with self.m_http_clients_lock:
                client = self.m_http_clients.pop(session_id, None)
                if client is not None:
                    try:
                        client.close()
                    except Exception:
                        pass

    def run_sync(
        self,
        session_id: str,
        user_input: str,
        opts: ChatOptions,
    ) -> str:
        """
        同步执行 Agent（非流式）

        Args:
            session_id: 会话 ID
            user_input: 用户输入
            opts: ChatOptions 对象

        Returns:
            Agent 的最终回复文本
        """
        agent = self._build_agent(opts)

        history = self.m_session_store.get_messages(session_id)
        messages = list(history) + [HumanMessage(content=user_input)]

        # 先将用户消息保存到会话历史
        self.m_session_store.set_messages(session_id, messages)

        result = agent.invoke(
            {"messages": messages},
            config={"recursion_limit": self.m_config.m_agent_max_iterations},
        )

        all_messages = result.get("messages", [])
        # 提取最后一条 AI 消息作为返回文本
        output_text = ""
        for msg in reversed(all_messages):
            if hasattr(msg, "content") and getattr(msg, "type", "") == "ai":
                output_text = msg.content
                break
        return output_text

    def reset_session(self, session_id: str) -> None:
        """重置会话（清空记忆）"""
        self.m_session_store.delete(session_id)


def _error_queue(error_msg: str) -> queue.Queue:
    """创建包含错误的事件队列"""
    q = queue.Queue()
    q.put({"type": "__error__", "content": error_msg})
    return q