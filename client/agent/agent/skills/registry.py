# -*- coding: utf-8 -*-
"""
Skill 注册中心
    - 自动发现(按文件扫描)
    - 元数据查询
    - 指令组合(多个 Skill 的 instructions 合并到系统提示词)
    - 技能依赖解析

使用方式:
    registry = get_skill_registry()
    registry.discover()           # 自动扫描发现
    skills = registry.get_skills(tags=["web"])
    instructions = registry.build_instructions()  # 合并所有技能指令
    tools = registry.collect_tools()              # 收集所有技能的工具
"""
import os
import sys
import importlib
import inspect
import pkgutil
from typing import Dict, List, Optional, Set
from langchain_core.tools import BaseTool

from .base import BaseSkill

from logger import get_logger
log = get_logger(__name__)

class SkillRegistry:
    """
    Skill 注册中心
    """

    def __init__(self):
        self.m_skills: Dict[str, BaseSkill] = {}        # name -> Skill 实例
        self.m_tags_index: Dict[str, Set[str]] = {}      # tag -> skill name set
        self.m_discovered: bool = False

    def register(self, skill: BaseSkill) -> None:
        """注册一个 Skill 实例, 自动解析依赖"""
        name = skill.m_name
        if name in self.m_skills:
            old = self.m_skills[name]
            if old.m_active:
                old.deactivate()
        self.m_skills[name] = skill
        # 更新标签索引
        for tag in skill.m_tags:
            if tag not in self.m_tags_index:
                self.m_tags_index[tag] = set()
            self.m_tags_index[tag].add(name)
        # 解析依赖
        self._resolve_skill_dependencies(skill)

    def _resolve_skill_dependencies(self, skill: BaseSkill) -> None:
        """解析技能的依赖关系 (工具依赖 + 技能依赖)"""
        # 解析工具依赖:从 ToolRegistry 获取
        if skill.m_required_tools:
            try:
                from ..tools.registry import get_tool_registry
                tool_registry = get_tool_registry()
                resolved = []
                for name in skill.m_required_tools:
                    t = tool_registry.get_tool(name)
                    if t:
                        resolved.append(t)
                    else:
                        log.error(f"技能 {skill.m_name} 依赖的工具不存在: {name}")
            except Exception as e:
                log.error(f"解析 {skill.m_name} 的工具依赖失败: {e}")

        # 解析技能依赖:确保依赖的技能已注册
        if skill.m_required_skills:
            for dep_name in skill.m_required_skills:
                if dep_name not in self.m_skills:
                    log.error(
                        f"技能 {skill.m_name} 依赖的技能未注册: {dep_name}"
                    )

    def unregister(self, name: str) -> bool:
        """注销指定技能"""
        skill = self.m_skills.pop(name, None)
        if skill is None:
            return False
        if skill.m_active:
            try:
                skill.deactivate()
            except Exception:
                pass
        # 清理标签索引
        for tag in list(self.m_tags_index.keys()):
            self.m_tags_index[tag].discard(name)
            if not self.m_tags_index[tag]:
                del self.m_tags_index[tag]
        return True

    def discover(self, package_path: Optional[str] = None) -> int:
        """
        自动扫描 skills 目录, 发现并注册所有技能

        同时支持:
          Python 模块中的 BaseSkill 子类 (.py)
          Markdown 文件定义的技能 (.md)

        Args:
            package_path: 可选, 指定扫描的 Python 包路径, 默认扫描 skills 包下所有模块

        Returns:
            新发现的技能数量
        """
        count = 0
        if package_path is None:
            package_path = "agent.skills"

        # 扫描 Python 模块
        _ensure_package_loaded(package_path)
        pkg = importlib.import_module(package_path)
        pkg_path = os.path.dirname(pkg.__file__)

        for importer, modname, ispkg in pkgutil.walk_packages(
            path=[pkg_path],
            prefix=f"{package_path}.",
            onerror=lambda x: None,
        ):
            if ispkg:
                continue
            if modname.endswith("__init__"):
                continue
            try:
                module = importlib.import_module(modname)
                count += self._scan_module(module)
            except Exception as e:
                log.error(f"加载模块 {modname} 失败: {e}")

        # 扫描 Markdown 文件
        try:
            from .md_loader import discover_markdown_skills

            # markdown 技能目录: skills/markdown/
            md_dir = os.path.join(pkg_path, "markdown")
            md_skills = discover_markdown_skills(md_dir)
            for skill in md_skills:
                self.register(skill)
                count += 1
        except Exception as e:
            log.error(f"扫描 Markdown 技能失败: {e}")

        # 排除基类自身
        self.m_skills.pop("untitled_skill", None)
        self.m_discovered = True
        return count

    def _scan_module(self, module) -> int:
        """扫描一个模块, 找出所有 BaseSkill 非抽象子类"""
        count = 0
        for name, obj in inspect.getmembers(module, inspect.isclass):
            if (
                issubclass(obj, BaseSkill)
                and obj is not BaseSkill
                and obj is not type(  # 排除抽象基类的子类?
                    BaseSkill
                )
            ):
                # 排除基类自身
                if obj.__name__ in ("BaseSkill", "PromptSkill", "ToolSkill"):
                    continue
                try:
                    instance = obj()
                    self.register(instance)
                    count += 1
                except Exception as e:
                    log.error(f"实例化 {obj.__name__} 失败: {e}")
        return count

    def get_skill(self, name: str) -> Optional[BaseSkill]:
        """按名称获取技能"""
        return self.m_skills.get(name)

    def get_skills(
        self,
        tags: Optional[List[str]] = None,
        names: Optional[List[str]] = None,
    ) -> List[BaseSkill]:
        """
        按条件筛选技能

        Args:
            tags:  筛选包含任意指定标签的技能
            names: 筛选指定名称的技能

        Returns:
            匹配的技能实例列表
        """
        if names:
            result = []
            for name in names:
                skill = self.m_skills.get(name)
                if skill:
                    result.append(skill)
            return result

        if tags:
            matched = set()
            for tag in tags:
                if tag in self.m_tags_index:
                    matched.update(self.m_tags_index[tag])
            return [self.m_skills[n] for n in matched if n in self.m_skills]

        return list(self.m_skills.values())

    def get_skill_names(self) -> List[str]:
        """返回所有已注册的技能名称(排除系统技能)"""
        return [
            n for n in self.m_skills.keys()
            if not self.m_skills[n].m_tags or "__system__" not in self.m_skills[n].m_tags
        ]

    def list_tags(self) -> List[str]:
        """返回所有标签"""
        return list(self.m_tags_index.keys())

    def activate_all(self) -> None:
        """激活所有已注册的技能"""
        for skill in self.m_skills.values():
            try:
                skill.activate()
            except Exception as e:
                log.error(f"激活技能 {skill.m_name} 失败: {e}")

    def deactivate_all(self) -> None:
        """停用所有已注册的技能"""
        for skill in self.m_skills.values():
            try:
                skill.deactivate()
            except Exception as e:
                log.error(f"停用技能 {skill.m_name} 失败: {e}")

    def build_instructions(
        self,
        names: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        max_chars: Optional[int] = None,
    ) -> str:
        """
        合并指定技能的 instructions 为一段系统提示词

        Args:
            names: 技能名称列表
            tags:  标签筛选
            max_chars: 最大字符数, 超时自动切紧凑模式

        Returns:
            合并后的指令文本
        """
        skills = self.get_skills(tags=tags, names=names)
        # 排除系统技能
        skills = [
            s for s in skills
            if not s.m_tags or "__system__" not in s.m_tags
        ]
        if not skills:
            return ""

        # 紧凑模式: 仅列名称
        def _compact() -> str:
            names_only = ", ".join(s.m_name for s in skills)
            return (
                f"可用技能: [{names_only}]\n"
                f"使用 read_skill(skill_name) 加载指令后执行。"
            )

        # 完整模式: 名称 + 描述 + 标签
        parts = []
        for s in skills:
            tags_str = f" [{', '.join(s.m_tags)}]" if s.m_tags else ""
            parts.append(f"- {s.m_name}: {s.m_description}{tags_str}")
        parts.append(
            "\n使用方式: read_skill(skill_name='技能名') 加载指令, "
            "然后严格按照指令执行。"
        )
        result = "\n".join(parts)

        # Token 预算控制
        if max_chars and len(result) > max_chars:
            result = _compact()

        return result

    def collect_tools(
        self,
        names: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
    ) -> List[BaseTool]:
        """
        收集指定技能提供的所有工具

        Args:
            names: 技能名称列表
            tags:  标签筛选

        Returns:
            工具列表
        """
        skills = self.get_skills(tags=tags, names=names)
        return self._collect_tools_from_skills(skills)

    def collect_system_tools(self) -> List[BaseTool]:
        """
        收集所有系统技能(__system__标签)的工具

        系统技能自动注入, 无需用户手动配置。
        """
        skills = [
            s for s in self.m_skills.values()
            if s.m_tags and "__system__" in s.m_tags
        ]
        return self._collect_tools_from_skills(skills)

    @staticmethod
    def _collect_tools_from_skills(skills: List[BaseSkill]) -> List[BaseTool]:
        """从技能列表中收集工具并去重"""
        tools: List[BaseTool] = []
        seen_names: Set[str] = set()
        for skill in skills:
            for tool in skill.get_tools():
                if tool.name not in seen_names:
                    tools.append(tool)
                    seen_names.add(tool.name)
        return tools

    def to_dict(self) -> List[dict]:
        """返回所有技能元数据列表(排除系统技能)"""
        return [
            skill.to_dict() for skill in self.m_skills.values()
            if not skill.m_tags or "__system__" not in skill.m_tags
        ]


def _ensure_package_loaded(package_path: str) -> None:
    """确保包已导入到 sys.modules 中"""
    if package_path not in sys.modules:
        importlib.import_module(package_path)


# 全局单例
_g_skill_registry: Optional["SkillRegistry"] = None


def get_skill_registry() -> SkillRegistry:
    """获取全局 Skill 注册中心单例"""
    global _g_skill_registry
    if _g_skill_registry is None:
        _g_skill_registry = SkillRegistry()
    return _g_skill_registry


def discover_skills() -> int:
    """
    一键发现并注册所有技能

    快捷方式, 等价于:
        registry = get_skill_registry()
        registry.discover()
    """
    registry = get_skill_registry()
    return registry.discover()
