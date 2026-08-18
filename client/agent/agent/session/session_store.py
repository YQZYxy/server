# -*- coding: utf-8 -*-
import json
import os
import time
import threading
from typing import Dict, List, Optional
from collections import OrderedDict
from langchain_core.messages import (
    HumanMessage, AIMessage, ToolMessage,
    message_to_dict, messages_from_dict,
)
from config.config import get_config


class SessionStore:
    """
    会话存储管理器

    特性:
      - 基于 OrderedDict 的 LRU 淘汰
      - 会话 TTL 自动过期
      - 线程安全
    """

    def __init__(self):
        config = get_config()
        self.m_sessions: OrderedDict[str, dict] = OrderedDict()
        self.m_lock = threading.RLock()
        self.m_max_sessions = config.m_max_sessions
        self.m_ttl = config.m_session_ttl

        # 文件同步标志: load 期间抑制重复保存
        self._skip_save = False

        # 持久化: 确保存储目录存在, 启动时从文件恢复
        self.m_data_dir = config.m_memory_dir 
        self.m_data_file = os.path.join(self.m_data_dir, "sessions.json")
        os.makedirs(self.m_data_dir, exist_ok=True)
        self._skip_save = True
        try:
            self._load()
        finally:
            self._skip_save = False

    def get_messages(self, session_id: str) -> List:
        """
        获取会话的消息历史 (LangChain Message 对象列表)

        Returns:
            [HumanMessage, AIMessage, ...]
        """
        with self.m_lock:
            self._cleanup_expired()

            if session_id in self.m_sessions:
                session = self.m_sessions[session_id]
                session["last_access"] = time.time()
                self.m_sessions.move_to_end(session_id)
                return list(session["messages"])

            # 新会话
            self.m_sessions[session_id] = {
                "messages": [],
                "config": {},  # 会话模式配置(agent_mode, tool_tags)
                "title": "新对话",
                "created_at": time.time(),
                "last_access": time.time(),
            }
            self._evict_if_needed()
            return []

    def get_config(self, session_id: str) -> dict:
        """
        获取会话的配置(模式/工具/技能等)

        Returns:
            dict, 不存在时返回空 dict
        """
        with self.m_lock:
            if session_id in self.m_sessions:
                return dict(self.m_sessions[session_id].get("config", {}))
            return {}

    def update_config(self, session_id: str, config: dict) -> None:
        """
        更新会话的配置, 合并写入(不清除历史消息)

        Args:
            session_id: 会话 ID
            config:     要合并的配置字典
        """
        with self.m_lock:
            if session_id not in self.m_sessions:
                self.m_sessions[session_id] = {
                    "messages": [],
                    "config": {},
                    "title": "新对话",
                    "created_at": time.time(),
                    "last_access": time.time(),
                }
            session = self.m_sessions[session_id]
            session["config"].update(config)
            session["last_access"] = time.time()
            self.m_sessions.move_to_end(session_id)
            self._evict_if_needed()
            self._save()

    def set_messages(self, session_id: str, messages: List) -> None:
        """
        直接设置会话的消息历史（替换旧历史）

        包含了 HumanMessage / AIMessage(含 tool_calls) / ToolMessage 等
        所有中间消息, 确保会话历史完整.

        Args:
            session_id: 会话 ID
            messages:   完整的 LangChain Message 对象列表
        """
        with self.m_lock:
            if session_id not in self.m_sessions:
                self.m_sessions[session_id] = {
                    "messages": [],
                    "config": {},
                    "title": "新对话",
                    "created_at": time.time(),
                    "last_access": time.time(),
                }
            session = self.m_sessions[session_id]
            session["messages"] = list(messages)
            session["last_access"] = time.time()

            # 从首条用户消息自动生成标题
            if not session.get("title") or session["title"] == "新对话":
                for m in messages:
                    if isinstance(m, HumanMessage) and m.content:
                        title = m.content.strip()[:40]
                        if len(m.content.strip()) > 40:
                            title += "..."
                        session["title"] = title
                        break
            self.m_sessions.move_to_end(session_id)
            self._evict_if_needed()
            self._save()

    def delete(self, session_id: str) -> bool:
        """删除会话"""
        with self.m_lock:
            if session_id in self.m_sessions:
                del self.m_sessions[session_id]
                self._save()
                return True
            return False

    def list_sessions(self) -> List[dict]:
        """
        列出所有活跃会话的摘要信息 供界面会话面板使用

        Returns:
            [{session_id, title, created_at, last_access, message_count, config}, ...]
            按 last_access 降序排列
        """
        with self.m_lock:
            self._cleanup_expired()
            result = []
            for sid, s in self.m_sessions.items():
                result.append({
                    "session_id": sid,
                    "title": s.get("title", "新对话"),
                    "created_at": s["created_at"],
                    "last_access": s["last_access"],
                    "message_count": len(s["messages"]),
                    "config": dict(s.get("config", {})),
                })
            # 按最后访问降序
            result.sort(key=lambda x: x["last_access"], reverse=True)
            return result

    def get_history(self, session_id: str) -> List[dict]:
        """
        获取会话的对话历史（字典格式，供前端 API 使用）
        """
        with self.m_lock:
            if session_id not in self.m_sessions:
                return []
            result = []
            for msg in self.m_sessions[session_id]["messages"]:
                if isinstance(msg, HumanMessage):
                    result.append({"role": "user", "content": msg.content})
                elif isinstance(msg, AIMessage):
                    entry = {
                        "role": "assistant",
                        "content": msg.content,
                    }
                    reasoning = msg.additional_kwargs.get("reasoning_content")
                    if reasoning:
                        entry["reasoning_content"] = reasoning
                    result.append(entry)
                elif isinstance(msg, ToolMessage):
                    entry = {
                        "role": "tool",
                        "content": msg.content,
                        "name": msg.name,
                        "tool_call_id": msg.tool_call_id,
                    }
                    tool_input = msg.additional_kwargs.get("tool_input")
                    if tool_input:
                        entry["tool_input"] = tool_input
                    result.append(entry)
            return result

    def clear(self) -> None:
        """清空所有会话"""
        with self.m_lock:
            self.m_sessions.clear()
            self._save()

    def stats(self) -> dict:
        """获取会话统计"""
        with self.m_lock:
            self._cleanup_expired()
            return {
                "active_sessions": len(self.m_sessions),
                "max_sessions": self.m_max_sessions,
            }

    def _cleanup_expired(self) -> None:
        """清理过期会话, 有淘汰则同步到磁盘"""
        now = time.time()
        expired = [
            sid for sid, s in self.m_sessions.items()
            if now - s["last_access"] > self.m_ttl
        ]
        if not expired:
            return
        for sid in expired:
            del self.m_sessions[sid]
        if not self._skip_save:
            self._save()

    def _evict_if_needed(self) -> None:
        """LRU 淘汰最旧会话, 有淘汰则同步到磁盘"""
        evicted = False
        while len(self.m_sessions) > self.m_max_sessions:
            self.m_sessions.popitem(last=False)
            evicted = True
        if evicted and not self._skip_save:
            self._save()

    def _save(self) -> None:
        """
        将会话数据序列化写入 JSON 文件.

        使用 message_to_dict 将 LangChain Message 转为可 JSON 序列化的 dict,
        重启后可调用 _load() 恢复.
        """
        data = {}
        for sid, session in self.m_sessions.items():
            data[sid] = {
                "messages": [
                    message_to_dict(msg) for msg in session["messages"]
                ],
                "config": session.get("config", {}),
                "title": session.get("title", "新对话"),
                "created_at": session["created_at"],
                "last_access": session["last_access"],
            }
        tmp_file = self.m_data_file + ".tmp"
        try:
            with open(tmp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(tmp_file, self.m_data_file)
        except Exception:
            # 写入失败时清理临时文件
            try:
                os.remove(tmp_file)
            except OSError:
                pass
            raise

    def _load(self) -> None:
        """
        从 JSON 文件加载会话数据, 并反序列化为 LangChain Message 对象.

        如果文件不存在或损坏, 静默忽略.
        """
        if not os.path.isfile(self.m_data_file):
            return
        try:
            with open(self.m_data_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return  # 文件损坏, 忽略
        for sid, raw in data.items():
            try:
                messages = messages_from_dict(raw.get("messages", []))
            except Exception:
                messages = []
            self.m_sessions[sid] = {
                "messages": messages,
                "config": raw.get("config", {}),
                "title": raw.get("title", "新对话"),
                "created_at": raw.get("created_at", time.time()),
                "last_access": raw.get("last_access", time.time()),
            }
        # 清理过期 & LRU 淘汰
        self._cleanup_expired()
        self._evict_if_needed()


# 全局单例
_g_session_store: Optional[SessionStore] = None


def get_session_store() -> SessionStore:
    """获取全局会话存储"""
    global _g_session_store
    if _g_session_store is None:
        _g_session_store = SessionStore()
    return _g_session_store