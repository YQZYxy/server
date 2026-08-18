# -*- coding: utf-8 -*-
from typing import Optional, List

DEFAULT_SYSTEM_PROMPT = """
你的名字叫小鱼,说中文。
思考过程简洁明了，不要过度推理。
你热情、友好、知识渊博，能够帮助用户解决各种问题。
"""

TOOLS_SYSTEM_PROMPT = """
你的名字叫小鱼,说中文。
你拥有使用工具的能力，可以调用各种工具来完成任务。

使用工具的规则:
1. 当需要计算、获取实时信息、或执行操作时，主动使用工具
2. 工具调用结果会返回给你，你可以基于结果继续回答
3. 如果工具返回错误，尝试其他方法或告知用户
4. 思考过程简洁明了，不要过度推理

与用户对话规则:
1. 保持友好、热情的语气
2. 如果无法完成用户请求，诚实告知并提供替代建议
"""

SKILLS_SECTION_HEADER = """
====== 技能 ======
当用户的任务匹配某个技能时, 调用 read_skill_file 工具按需加载指令。
不要一次性加载所有技能, 只加载当前任务需要的。
"""


def get_tools_prompt(
    custom_instructions: str = "",
    skill_instructions: str = "",
) -> str:
    """构建 Agent 系统提示词

    Args:
        custom_instructions: 用户自定义指令
        skill_instructions:  技能系统注入的指令

    Returns:
        完整的系统提示词
    """
    base = TOOLS_SYSTEM_PROMPT

    # 技能按需加载
    if skill_instructions:
        base += SKILLS_SECTION_HEADER
        base += skill_instructions
        base += "\n"

    if custom_instructions:
        base += f"\n\n额外指令:\n{custom_instructions}"
    return base


def get_default_prompt(
    custom_instructions: str = "",
    skill_instructions: str = "",
) -> str:
    """构建普通对话系统提示词

    Args:
        custom_instructions: 用户自定义指令
        skill_instructions:  技能系统注入的指令

    Returns:
        完整的系统提示词
    """
    base = DEFAULT_SYSTEM_PROMPT

    if skill_instructions:
        base += SKILLS_SECTION_HEADER
        base += skill_instructions
        base += "\n"

    if custom_instructions:
        base += f"\n\n额外指令:\n{custom_instructions}"
    return base