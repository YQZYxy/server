# -*- coding: utf-8 -*-
"""
Markdown Skill 文件格式:
```markdown
---
name: skill_name                # 必填: 技能唯一标识名
description: 技能描述           # 必填: 简短描述
version: 1.0.0                  # 可选: 版本号, 默认 1.0.0
author: 作者名                  # 可选: 作者
tags: [tag1, tag2]              # 可选: 标签列表
tool_requires: [tool_name]      # 可选: 需要引用的全局工具名
---

## Instructions

Markdown 格式的技能指令...
可以包含 **加粗**, *斜体*, `代码`, 列表等。
```

设计思路:
  - 利用 YAML frontmatter (--- 分隔) 提取元数据
  - 正文 Markdown 内容作为技能的 instructions
  - 通过 type 字段动态创建 PromptSkill 或 ToolSkill
  - tool_requires 从全局 ToolRegistry 中引用已注册的工具
"""
import os
import re
from typing import Optional, List, Dict, Any
from langchain_core.tools import BaseTool

from .base import BaseSkill, PromptSkill

from logger import get_logger
log = get_logger(__name__)


_FRONTMATTER_PATTERN = re.compile(
    r"^---\s*\n(.*?\n)---\s*\n*(.*)",
    re.DOTALL,
)

def parse_markdown_skill(filepath: str) -> Optional[BaseSkill]:
    """
    解析一个 .md 文件, 返回 BaseSkill 实例

    Args:
        filepath: .md 文件的绝对路径

    Returns:
        BaseSkill 实例, 解析失败返回 None
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        log.error(f"读取文件失败 {filepath}: {e}")
        return None

    # 解析 frontmatter
    match = _FRONTMATTER_PATTERN.match(content)
    if not match:
        log.error(f"文件缺少 YAML frontmatter: {filepath}")
        return None

    yaml_text = match.group(1)
    body_text = match.group(2).strip()

    # 解析 YAML
    try:
        import yaml
        meta = yaml.safe_load(yaml_text)
    except Exception as e:
        log.error(f"YAML 解析失败 {filepath}: {e}")
        return None

    if not isinstance(meta, dict):
        log.error(f"YAML 格式错误 (非字典): {filepath}")
        return None

    # 提取必填字段
    name = meta.get("name", "").strip()
    if not name:
        # 用文件名作为 fallback
        name = os.path.splitext(os.path.basename(filepath))[0]
        name = name.replace(" ", "_").replace("-", "_").lower()

    description = meta.get("description", "").strip()
    version = str(meta.get("version", "1.0.0"))
    author = str(meta.get("author", "anonymous"))
    tags = meta.get("tags", [])
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",")]
    tool_requires = meta.get("tool_requires", [])
    if isinstance(tool_requires, str):
        tool_requires = [t.strip() for t in tool_requires.split(",")]


    allowed_tools = meta.get("allowed-tools", [])
    if isinstance(allowed_tools, str):
        allowed_tools = [t.strip() for t in allowed_tools.split(",")]

    # 动态创建 Skill 实例
    skill = _create_md_skill(
        name=name,
        description=description,
        version=version,
        author=author,
        tags=tags,
        instructions=body_text,
        tool_requires=tool_requires,

        allowed_tools=allowed_tools,
        source_file=filepath,
    )

    return skill


def _create_md_skill(
    name: str,
    description: str,
    version: str,
    author: str,
    tags: List[str],
    instructions: str,
    tool_requires: Optional[List[str]] = None,
    allowed_tools: Optional[List[str]] = None,
    source_file: str = "",
) -> BaseSkill:
    """
    动态创建一个由 Markdown 定义的 Skill 实例

    如果 tool_requires 不为空, 创建 ToolSkill 子类以支持工具引用;
    否则创建 PromptSkill 子类。
    """
    tool_requires = tool_requires or []

    # 动态创建类
    if tool_requires:
        # 需要引用工具 -> 创建 MarkdownToolSkill
        class _MarkdownToolSkill(BaseSkill):
            m_name = name
            m_description = description
            m_version = version
            m_author = author
            m_tags = tags
            m_instructions = instructions
            m_required_tools = tool_requires
            # 保存源文件路径
            m_source = "markdown"
            m_source_file = source_file
            m_allowed_tools = allowed_tools

            def get_tools(self):
                return _resolve_tools(self.m_required_tools)

        _MarkdownToolSkill.__name__ = f"MarkdownSkill_{name}"
        _MarkdownToolSkill.__qualname__ = _MarkdownToolSkill.__name__
        return _MarkdownToolSkill()
    else:
        # 纯指令技能 -> 创建 MarkdownPromptSkill
        class _MarkdownPromptSkill(PromptSkill):
            m_name = name
            m_description = description
            m_version = version
            m_author = author
            m_tags = tags
            m_instructions = instructions
            m_source = "markdown"
            m_source_file = source_file
            m_allowed_tools = allowed_tools

        _MarkdownPromptSkill.__name__ = f"MarkdownSkill_{name}"
        _MarkdownPromptSkill.__qualname__ = _MarkdownPromptSkill.__name__
        return _MarkdownPromptSkill()


def _resolve_tools(tool_names: List[str]) -> List[BaseTool]:
    """从全局 ToolRegistry 中解析工具名列表为 BaseTool 实例"""
    from agent.tools.registry import get_tool_registry
    registry = get_tool_registry()
    tools: List[BaseTool] = []
    for name in tool_names:
        tool = registry.get_tool(name)
        if tool is not None:
            tools.append(tool)
        else:
            log.error(f"引用的工具不存在: {name}")
    return tools


def discover_markdown_skills(directory: str) -> List[BaseSkill]:
    """
    扫描目录下的所有 .md 文件, 解析为 Skill 实例

    Args:
        directory: 要扫描的目录路径

    Returns:
        解析成功的 Skill 实例列表
    """
    if not os.path.isdir(directory):
        log.error(f"目录不存在: {directory}")
        return []

    skills: List[BaseSkill] = []
    for filename in sorted(os.listdir(directory)):
        if not filename.endswith(".md") and not filename.endswith(".md"):
            continue
        # 跳过 README 等非技能文件
        if filename.upper() in ("README.MD", "INDEX.MD", "TEMPLATE.MD"):
            continue

        filepath = os.path.join(directory, filename)
        if not os.path.isfile(filepath):
            continue

        skill = parse_markdown_skill(filepath)
        if skill is not None:
            skills.append(skill)
            log.info(f"加载: {filename} -> {skill.m_name}")

    return skills
