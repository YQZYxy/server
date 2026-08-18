# -*- coding: utf-8 -*-
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ChatOptions:
    """
    聊天调用链中的可选参数

    Attributes:
        m_model:                模型名称, 为 None 时使用默认模型
        m_tool_tags:            按工具标签筛选, 非 None 时启用工具
        m_tool_names:           手动指定的工具名列表, 非 None 时启用工具
        m_custom_instructions:  自定义系统指令, 追加到 prompt 末尾
        m_temperature:          LLM 温度参数, 0.0 最确定, 1.0 最随机
        m_max_tokens:           最大生成长度, 0 表示不限制
        m_skill_names:          启用的技能名称列表, 非 None 时不启用技能
        m_skill_tags:           按标签启用技能, 与 m_skill_names 二选一
    """
    m_model: Optional[str] = None
    m_tool_tags: Optional[list] = None
    m_tool_names: Optional[list] = None
    m_custom_instructions: str = ""
    m_temperature: float = 0.0
    m_max_tokens: int = 0
    m_skill_names: Optional[list] = None
    m_skill_tags: Optional[list] = None
