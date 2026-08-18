# -*- coding: utf-8 -*-
import json
import time
import queue
import re
import functools
from typing import Any, Dict, List, Optional, Generator, Mapping
from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.outputs import LLMResult
from langchain_core.messages.base import BaseMessageChunk

# ---------------------------------------------------------------------------
# Monkey-patch: 让 LangChain 从 OpenAI delta 中提取 reasoning_content
# LangChain 的 _convert_delta_to_message_chunk 默认丢弃 reasoning_content,
# 导致 on_llm_new_token 无法获取思考过程 token. 这里 patch 使其将
# reasoning_content 写入 additional_kwargs.
# ---------------------------------------------------------------------------
import langchain_openai.chat_models.base as _openai_base

_original_convert_delta = _openai_base._convert_delta_to_message_chunk


@functools.wraps(_original_convert_delta)
def _patched_convert_delta_to_message_chunk(
    _dict: Mapping[str, Any], default_class: type[BaseMessageChunk]
) -> BaseMessageChunk:
    """包装原函数, 将 reasoning_content 提取到 additional_kwargs 中"""
    # 先提取 reasoning_content (原函数会丢弃它)
    reasoning_content = _dict.get("reasoning_content")
    # 调用原函数构造 message_chunk
    message_chunk = _original_convert_delta(_dict, default_class)
    # 将 reasoning_content 注入 additional_kwargs
    if reasoning_content:
        message_chunk.additional_kwargs["reasoning_content"] = reasoning_content
    return message_chunk


_openai_base._convert_delta_to_message_chunk = _patched_convert_delta_to_message_chunk

# ---------------------------------------------------------------------------
# 过滤 LLM 返回的 XML 工具调用标签(某些模型会输出 <tool_call> 等 XML 格式)
# 这些标签无法被 LangChain 解析为结构化 tool_calls, 直接作为文本泄露到输出
_XML_TOOL_TAG_PATTERN = re.compile(
    r'</?(?:tool_call|tool_result|thinking|result|invoke|parameter)[^>]*>',
    re.IGNORECASE,
)


def _clean_xml_tags(text: str) -> str:
    """去掉 LLM 输出中的 XML 工具调用标签"""
    return _XML_TOOL_TAG_PATTERN.sub('', text)

# ---------------------------------------------------------------------------


class AgentStreamCallback(BaseCallbackHandler):
    """
    LangChain 回调处理器 - 将 Agent 执行事件推入队列, 同时增量保存会话历史

    事件类型:
      - "content":    普通文本
      - "reasoning_content":   思考文本
      - "reasoning_done": 思考结束
      - "tool_start": 工具开始执行
      - "tool_end":   工具执行完成
      - "error":      错误信息
      - "done":       完成标记

    会话历史增量保存:
      在 agent.invoke() 执行过程中, 每当 LLM 生成消息或工具返回结果时,
      立即将中间消息(AIMessage 含 tool_calls / ToolMessage)写入会话存储器,
      使得会话历史始终反映最新状态, 有利于 LLM 服务端前缀缓存命中.
    """

    def __init__(
        self,
        event_queue: queue.Queue,
        session_store: Any = None,
        session_id: str = "",
        initial_messages: Optional[List] = None,
    ):
        super().__init__()
        self.m_queue = event_queue
        self.m_current_tool: Optional[str] = None
        self.m_store = session_store
        self.m_session_id = session_id
        self.m_messages: List = list(initial_messages) if initial_messages else []
        # 推理/思考过程追踪
        self.m_has_reasoning_started = False
        self.m_reasoning_buffer = ""
        self.m_last_reasoning_buffer = ""

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """
        LLM 输出新文本

        如果 chunk 中包含 reasoning_content, 则作为 reasoning 事件发出
        否则作为普通文本发出.

        当从 reasoning_content 切换到普通 content 时, 发送
        reasoning_done 事件通知前端思考阶段结束.
        后续再出现 reasoning_content 表示新一轮思考, 前端会创建新气泡.
        """
        # 检查 chunk 中是否有 reasoning_content
        chunk = kwargs.get("chunk")
        reasoning_content = None
        if chunk is not None:
            msg = getattr(chunk, "message", None)
            if msg is not None:
                reasoning_content = msg.additional_kwargs.get("reasoning_content")

        if reasoning_content:
            # 思考开始
            if not self.m_has_reasoning_started:
                self.m_has_reasoning_started = True

            self.m_reasoning_buffer += reasoning_content
            self.m_queue.put({
                "type": "reasoning_content",
                "content": reasoning_content,
            })
        else:
            # 从思考切换到普通文本, 说明本轮思考结束
            if self.m_has_reasoning_started:
                self.m_has_reasoning_started = False
                self.m_last_reasoning_buffer = self.m_reasoning_buffer
                self.m_queue.put({
                    "type": "reasoning_done",
                    "full_reasoning": self.m_reasoning_buffer,
                })
                self.m_reasoning_buffer = ""

            cleaned = _clean_xml_tags(token)
            if cleaned:
                self.m_queue.put({"type": "content", "content": cleaned})

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """
        LLM 生成完毕 - 推入队列, 同时将 AIMessage(可能含 tool_calls) 保存到历史
        """
        generations = response.generations
        if not generations or not generations[0]:
            return

        chat_gen = generations[0][0]
        msg = getattr(chat_gen, "message", None)
        if msg is None or not isinstance(msg, AIMessage):
            return

        # 将本轮推理内容注入 AIMessage(用于历史保存)
        if self.m_last_reasoning_buffer:
            msg.additional_kwargs["reasoning_content"] = self.m_last_reasoning_buffer
            self.m_last_reasoning_buffer = ""

        # 清理 content 中的 XML 标签(如 </tool_call>), 这些是 LLM 工具调用格式的残留
        if msg.content:
            msg.content = _clean_xml_tags(msg.content)

        self.m_messages.append(msg)
        if self.m_store:
            self.m_store.set_messages(self.m_session_id, self.m_messages)

    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        """工具开始执行"""
        tool_name = serialized.get("name", "unknown")
        self.m_current_tool = tool_name
        self.m_queue.put({
            "type": "tool_start",
            "tool": tool_name,
            "input": input_str[:500],
        })

    def on_tool_end(self, output: ToolMessage, **kwargs: Any) -> None:
        """
        工具执行完成 - 推入队列, 同时将 ToolMessage 保存到历史
        """
        tool_name = self.m_current_tool or "unknown"
        self.m_queue.put({
            "type": "tool_end",
            "tool": tool_name,
            "output": output.content[:1000],
        })
        self.m_current_tool = None
        self._save_tool_message(output)

    def on_tool_error(self, error: BaseException, **kwargs: Any) -> None:
        """
        工具执行出错 - 推入队列, 同时将错误 ToolMessage 保存到历史
        """
        tool_name = self.m_current_tool or "unknown"
        self.m_queue.put({
            "type": "error",
            "tool": tool_name,
            "content": str(error),
        })
        self.m_current_tool = None

        err_msg = ToolMessage(
            content=f"Error: {error}",
            tool_call_id="",
            name=tool_name,
            status="error",
        )
        self._save_tool_message(err_msg)

    def _save_tool_message(self, tool_msg: ToolMessage) -> None:
        """将 ToolMessage 注入 tool_input 后保存到会话历史"""
        if not self.m_store:
            return

        # 从最后一条 AIMessage 的 tool_calls 中提取输入参数
        for msg in reversed(self.m_messages):
            if isinstance(msg, AIMessage):
                for tc in msg.tool_calls:
                    if tc.get("name") == tool_msg.name:
                        tool_input = str(tc.get("args", {}))
                        if tool_input:
                            tool_msg.additional_kwargs["tool_input"] = tool_input
                        break
                break

        self.m_messages.append(tool_msg)
        self.m_store.set_messages(self.m_session_id, self.m_messages)


def sse_event_generator(
    event_queue: queue.Queue,
    timeout: float = 60.0,
) -> Generator[str, None, None]:
    """
    从事件队列生成 SSE 格式的数据流

    用于 Flask Response stream_with_context

    Args:
        event_queue: 事件队列
        timeout: 队列读取超时(秒)
    """
    # 发送开始事件
    yield _format_sse({"type": "start", "timestamp": time.time()})

    full_response = ""
    tool_calls = []

    while True:
        try:
            event = event_queue.get(timeout=timeout)
        except queue.Empty:
            # 超时，发送心跳
            yield _format_sse({"type": "heartbeat"})
            continue

        event_type = event.get("type", "")

        if event_type == "content":
            full_response += event["content"]
            yield _format_sse({
                "type": "content",
                "content": event["content"],
            })

        elif event_type == "reasoning_content":
            yield _format_sse({
                "type": "reasoning_content",
                "content": event.get("content", ""),
            })

        elif event_type == "reasoning_done":
            yield _format_sse({
                "type": "reasoning_done",
                "full_reasoning": event.get("full_reasoning", ""),
            })

        elif event_type == "tool_start":
            tool_info = {
                "name": event["tool"],
                "input": event.get("input", ""),
                "status": "running",
            }
            tool_calls.append(tool_info)
            yield _format_sse({
                "type": "tool_start",
                "tool": event["tool"],
                "action": "start",
                "input": event.get("input", ""),
            })

        elif event_type == "tool_end":
            # 更新工具状态
            for tc in tool_calls:
                if tc["name"] == event["tool"] and tc["status"] == "running":
                    tc["status"] = "done"
                    tc["output"] = event.get("output", "")
                    break
            yield _format_sse({
                "type": "tool_end",
                "tool": event["tool"],
                "output": event.get("output", ""),
            })

        elif event_type == "error":
            yield _format_sse({
                "type": "error",
                "content": event.get("content", ""),
                "tool": event.get("tool", ""),
            })

        elif event_type == "__done__":
            break

        elif event_type == "__cancelled__":
            # httpx 连接被关闭, LLM 已中止, 直接退出
            return

        elif event_type == "__error__":
            yield _format_sse({
                "type": "error",
                "content": event.get("content", "未知错误"),
            })
            break

    # 发送完成事件
    yield _format_sse({
        "type": "done",
        "content": full_response,
        "tool_calls": tool_calls,
    })


def _format_sse(data: dict) -> str:
    """格式化为 SSE data 行"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"