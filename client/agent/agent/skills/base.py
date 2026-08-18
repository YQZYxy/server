# -*- coding: utf-8 -*-
"""
Agent Skill 基类体系
  - 即插即用: 在 skills/ 目录下加一个 .py 文件 = 加一个技能
  - 自描述: 每个 Skill 带元数据(name, description, version, author)
  - 可组合: Skill 可以注册多个 Tool, 注入自定义 Prompt
  - 有生命周期: activate / deactivate 钩子

使用方式:
    class MySkill(PromptSkill):
        m_name = "my_skill"
        m_description = "我的技能"
        m_instructions = "当用户问到XX时, 你需要先做A, 再做B..."

分层 Skill 类型:
  - PromptSkill:   最轻量, 只注入系统指令, 无自定义工具
  - ToolSkill:     注册自定义工具 + 可选注入指令
  - BaseSkill:     最灵活, 可自定义 on_activate / on_deactivate 行为
"""
from typing import List, Optional, Dict, Any
from langchain_core.tools import BaseTool


class BaseSkill:
    """
    Skill 基类

    子类覆盖以下类变量来自定义行为:
      m_name, m_description, m_version, m_author, m_instructions
    """

    # 元数据
    m_name: str = "untitled_skill"
    m_description: str = ""
    m_version: str = "1.0.0"
    m_author: str = "anonymous"
    m_tags: List[str] = []  # 标签, 用于分类筛选

    m_allowed_tools: List[str] = []
    """限制该技能可用的工具名列表, 空列表=不限制"""

    # Prompt 指令
    # 注入到 Agent 系统提示词中的额外指令
    # 告诉 LLM 何时以及如何使用这个技能
    m_instructions: str = ""

    # 依赖声明
    m_required_tools: List[str] = []  # 需要依赖的全局工具名列表
    m_required_skills: List[str] = []  # 需要依赖的其他技能名列表

    def __init__(self):
        self.m_active: bool = False

    def on_activate(self) -> None:
        """
        技能激活时的回调

        可在此处进行初始化操作, 如加载配置, 建立连接等。
        默认 no-op。
        """
        pass

    def on_deactivate(self) -> None:
        """
        技能停用时的回调

        可在此处进行清理操作, 如释放连接, 保存状态等。
        默认 no-op。
        """
        pass

    def get_tools(self) -> List[BaseTool]:
        """
        返回此 Skill 提供的 LangChain Tool 列表

        子类可重写此方法注册自定义工具。
        默认返回空列表。
        """
        return []

    def activate(self) -> None:
        """激活技能（外部调用）"""
        if self.m_active:
            return
        self.on_activate()
        self.m_active = True

    def deactivate(self) -> None:
        """停用技能（外部调用）"""
        if not self.m_active:
            return
        self.on_deactivate()
        self.m_active = False

    def to_dict(self) -> Dict[str, Any]:
        """返回技能元数据字典"""
        d = {
            "name": self.m_name,
            "description": self.m_description,
            "version": self.m_version,
            "author": self.m_author,
            "tags": list(self.m_tags),
            "active": self.m_active,
            "has_instructions": bool(self.m_instructions),
            "tool_count": len(self.get_tools()),
            "type": self.__class__.__name__,
            "allowed_tools": list(self.m_allowed_tools),
        }
        # Markdown 技能附加信息
        source = getattr(self, "m_source", None)
        if source:
            d["source"] = source
        source_file = getattr(self, "m_source_file", None)
        if source_file:
            d["source_file"] = source_file
        return d


class PromptSkill(BaseSkill):
    """
    纯 Prompt 型技能

    只向 Agent 注入系统指令, 不注册自定义工具。
    适合: 角色扮演, 行为约束, 特定领域的对话策略。

    使用方式:
        class MathTutorSkill(PromptSkill):
            m_name = "math_tutor"
            m_description = "数学辅导技能"
            m_instructions = "你是一位耐心的数学老师..."
    """
    pass


class ToolSkill(BaseSkill):
    """
    工具型技能

    注册自定义工具, 并可附带指令说明。
    适合: 需要新增工具能力的场景。

    使用方式:
        class WeatherSkill(ToolSkill):
            m_name = "weather"
            m_description = "天气查询技能"
            m_instructions = "当用户询问天气时..."

            def get_tools(self) -> List[BaseTool]:
                return [weather_tool, forecast_tool]
    """
    pass
