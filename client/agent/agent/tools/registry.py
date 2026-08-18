# -*- coding: utf-8 -*-
from typing import Dict, List, Callable, Optional
from langchain_core.tools import BaseTool


class ToolRegistry:
    """
    工具注册中心

    使用方式:
        registry = ToolRegistry()
        registry.register(my_tool)
        tools = registry.get_tools()
    """

    def __init__(self):
        self.m_tools: Dict[str, BaseTool] = {}
        self.m_tags: Dict[str, List[str]] = {}  # 标签 -> 工具名列表

    def register(self, tool: BaseTool, tag: str = "default") -> None:
        """注册一个工具"""
        self.m_tools[tool.name] = tool
        if tag not in self.m_tags:
            self.m_tags[tag] = []
        if tool.name not in self.m_tags[tag]:
            self.m_tags[tag].append(tool.name)

    def unregister(self, tool_name: str) -> None:
        """注销一个工具"""
        self.m_tools.pop(tool_name, None)
        for tag_tools in self.m_tags.values():
            if tool_name in tag_tools:
                tag_tools.remove(tool_name)

    def get_tool(self, name: str) -> Optional[BaseTool]:
        """获取指定工具"""
        return self.m_tools.get(name)

    def get_tools(
        self,
        tag: Optional[str] = None,
        tags: Optional[List[str]] = None,
        names: Optional[List[str]] = None,
    ) -> List[BaseTool]:
        """
        获取工具列表, 支持多种筛选方式

        Args:
            tag:   单个标签筛选
            tags:  多个标签筛选 (与 tag 互斥, 优先级更高)
            names: 精确工具名列表筛选 (优先级最高)

        Returns:
            匹配的工具列表
        """
        # 按精确名称筛选 (优先级最高)
        if names is not None:
            return [self.m_tools[n] for n in names if n in self.m_tools]

        # 按多个标签筛选
        if tags:
            name_set: set[str] = set()
            for g in tags:
                if g in self.m_tags:
                    name_set.update(self.m_tags[g])
            return [self.m_tools[n] for n in name_set if n in self.m_tools]

        # 按单个标签筛选
        if tag and tag in self.m_tags:
            return [self.m_tools[n] for n in self.m_tags[tag] if n in self.m_tools]

        # 返回全部
        return list(self.m_tools.values())

    def get_tool_names(
        self,
        tag: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> List[str]:
        """获取工具名列表"""
        if tags:
            result: set[str] = set()
            for g in tags:
                if g in self.m_tags:
                    result.update(self.m_tags[g])
            return list(result)
        if tag and tag in self.m_tags:
            return list(self.m_tags[tag])
        return list(self.m_tools.keys())

    def list_tags(self) -> List[str]:
        """列出所有工具标签"""
        return list(self.m_tags.keys())

    def clear(self) -> None:
        """清空所有工具"""
        self.m_tools.clear()
        self.m_tags.clear()


# 全局单例
_g_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """获取全局工具注册中心"""
    global _g_registry
    if _g_registry is None:
        _g_registry = ToolRegistry()
        # 注册内置工具
        from .builtin import register_builtin_tools
        register_builtin_tools(_g_registry)
    return _g_registry