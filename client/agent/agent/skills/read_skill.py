# -*- coding: utf-8 -*-
"""
技能按需加载工具 (系统级隐藏技能)

当 LLM 判断任务匹配某个技能时, 用此工具加载技能的完整指令。
避免将所有技能指令一次性注入 system prompt, 节省 token。

此技能为系统内部技能, 不会出现在技能列表和目录中。
"""
from langchain_core.tools import tool

from .base import ToolSkill
from .registry import get_skill_registry


@tool
def read_skill(skill_name: str) -> str:
    """
    按需加载指定技能的完整指令

    参数:
        skill_name: 技能名称, 如 stock_assistant、writing_assistant

    返回技能的完整指令内容, 包含使用规则和注意事项。
    调用后请严格按照指令执行任务。
    """
    registry = get_skill_registry()
    skill = registry.get_skill(skill_name)
    if skill is None:
        available = ", ".join(
            n for n in registry.get_skill_names()
        )
        return (
            f"未找到技能 '{skill_name}'。"
            f"可用技能: [{available}]"
        )

    instructions = skill.m_instructions
    if not instructions:
        return f"技能 '{skill_name}' 没有额外的指令内容, 直接使用其提供的工具即可。"

    result = (
        f"===== 技能: {skill_name} =====\n"
        f"描述: {skill.m_description}\n"
        f"工具数: {len(skill.get_tools())}\n\n"
        f"{instructions}"
    )

    # 工具限制声明
    if skill.m_allowed_tools:
        result += (
            f"\n\n【工具限制】\n"
            f"此技能仅允许使用以下工具: {', '.join(skill.m_allowed_tools)}\n"
            f"禁止使用列表以外的工具。"
        )

    return result


class ReadSkillTool(ToolSkill):
    m_name = "read_skill"
    m_description = "技能按需加载工具, 用于按需读取技能的完整指令"
    m_version = "1.0.0"
    m_author = "小鱼"
    m_tags = ["__system__"]  # 系统标记, 用于 registry 排除

    m_instructions = ""

    def get_tools(self):
        return [read_skill]
