#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""编译器诊断输出压缩.

error 级别的诊断始终完整输出, 避免丢失候选列表等排查信息.
屏蔽程度由 COMPACT_LEVEL 控制, 0 表示不屏蔽.
"""

import re
import unicodedata

# 诊断头与 note 行, 例如 /path/a.cpp:177:58: warning: ...
RE_DIAGNOSTIC = re.compile(
    r"^(?P<file>.+?):(?P<line>\d+)(?::(?P<column>\d+))?: "
    r"(?P<kind>warning|error|fatal error|note): (?P<message>.*)$"
)

# include 栈的首行与后续行, 例如 "In file included from xx:12:" 与 "                 from yy:3:"
RE_INCLUDE_STACK = re.compile(r"^(?:In file included from |\s+from ).*")

# 源码片段与 caret 指向图, 例如 "   20 | if (x)" 与 "      |        ^~~~"
RE_SOURCE_LINE = re.compile(r"^\s*(?:\d+ \||\|)")

# 构建工具的失败行, 例如 "gmake[2]: *** [...] Error 1", "FAILED: ...", "CMake Error at ..."
RE_BUILD_FAILURE = re.compile(
    r"^(?:.*make(?:\[\d+\])?: \*\*\*|FAILED:|ninja: build stopped|CMake Error at )"
)

# 需要原样透传的诊断类型
PASSTHROUGH_KINDS = ("error", "fatal error")

# 诊断压缩等级
# 0 不屏蔽, 完全按编译器原始输出打印, 只按级别上色
# 1 丢弃 include 栈(In file included from ...)
# 2 再丢弃警告头自带的源码片段和中间 note 块, 只保留警告头与最后一个 note 块
# 3 再把警告头合并到最后一个 note 的位置上, 不再出现宏定义处的行
COMPACT_LEVEL_NONE = 0
COMPACT_LEVEL_INCLUDE = 1
COMPACT_LEVEL_NOTE = 2
COMPACT_LEVEL_SUMMARY = 3

# 当前压缩等级, 取值 0 ~ 3
COMPACT_LEVEL = COMPACT_LEVEL_SUMMARY

# 折行宽度上限: 0 表示跟随终端列宽, 其它值强制按该列宽折行
MAX_LINE_WIDTH = 0

# 自动折行的最大宽度: 终端更宽也按这个宽度折行, 避免长行超出可视区域被裁掉
AUTO_LINE_WIDTH = 160

# 按两列计算的东亚宽字符
WIDE_CHAR_WIDTHS = ("W", "F")


def DisplayWidth(text):
    """按终端列数计算显示宽度, 中文等全角字符占两列"""
    width = 0
    for char in text:
        width += 2 if unicodedata.east_asian_width(char) in WIDE_CHAR_WIDTHS else 1
    return width


def WrapDisplayLine(text, max_width):
    """超过指定显示宽度时硬折成多行, 保证内容不被终端裁掉

    max_width <= 0 表示不折行, 折行后的续行不额外缩进.
    """
    if not text or max_width <= 0 or DisplayWidth(text) <= max_width:
        return [text]

    lines = []
    current = []
    current_width = 0
    for char in text:
        char_width = 2 if unicodedata.east_asian_width(char) in WIDE_CHAR_WIDTHS else 1
        if current_width + char_width > max_width and current:
            lines.append("".join(current))
            current = []
            current_width = 0
        current.append(char)
        current_width += char_width
    if current:
        lines.append("".join(current))
    return lines

# 输出级别, 由调用方决定是否上色
LEVEL_NORMAL = "normal"
LEVEL_WARNING = "warning"
LEVEL_ERROR = "error"


class GccDiagnosticFilter(object):
    """按诊断块压缩 GCC / Clang 输出, Feed 返回本次应当打印的 (级别, 行) 列表"""

    def __init__(self, level=None):
        self.m_level = int(COMPACT_LEVEL if level is None else level)
        self.m_kind = ""
        self.m_error_context = False
        self.m_head_location = ""
        self.m_head_message = ""
        self.m_note_groups = []
        self.m_current_group = None

    def Feed(self, text):
        """送入一行原始输出, 返回需要打印的 (级别, 行文本) 列表"""
        if self.m_level <= COMPACT_LEVEL_NONE:
            return self._FeedRaw(text)

        # 1 级只去掉 include 栈, 其余内容照搬
        if self.m_level == COMPACT_LEVEL_INCLUDE:
            if RE_INCLUDE_STACK.match(text):
                return []
            return self._FeedRaw(text)

        match = RE_DIAGNOSTIC.match(text)
        if match is not None:
            return self._HandleDiagnostic(match, text)

        # include 栈只服务于多行排版, 诊断头本身已带绝对路径, 直接丢弃
        if RE_INCLUDE_STACK.match(text):
            return []

        # note 块里的源码片段与 caret 图一起保留, 警告头自带的片段没有定位价值
        if RE_SOURCE_LINE.match(text):
            if self.m_current_group is not None:
                self.m_current_group.append(text)
                return []
            # error 块保留片段作为上下文
            if self.m_error_context:
                return [(LEVEL_ERROR, text)]
            return []

        # 其它输出(构建进度, make 报错等)必须先结束当前警告块再原样打印
        self.m_error_context = False
        level = LEVEL_ERROR if RE_BUILD_FAILURE.match(text) else LEVEL_NORMAL
        return self._Flush() + [(level, text)]

    def Flush(self):
        """命令结束时输出尚未打印的诊断块"""
        return self._Flush()

    def _FeedRaw(self, text):
        """不压缩时只负责上色, 内容完全照搬编译器输出"""
        match = RE_DIAGNOSTIC.match(text)
        if match is not None:
            kind = match.group("kind")
            if kind in PASSTHROUGH_KINDS:
                self.m_error_context = True
                return [(LEVEL_ERROR, text)]
            if kind == "warning":
                self.m_error_context = False
                return [(LEVEL_WARNING, text)]
            return [(self._ContextLevel(), text)]

        if RE_SOURCE_LINE.match(text) or RE_INCLUDE_STACK.match(text):
            return [(self._ContextLevel(), text)]

        self.m_error_context = False
        level = LEVEL_ERROR if RE_BUILD_FAILURE.match(text) else LEVEL_NORMAL
        return [(level, text)]

    def _HandleDiagnostic(self, match, text):
        """按诊断类型分流: note 开启一个分组, error 透传"""
        location = self._BuildLocation(match)
        kind = match.group("kind")
        message = match.group("message")

        if kind == "note":
            if self.m_kind == "warning":
                self.m_current_group = ["%s: note: %s" % (location, message)]
                self.m_note_groups.append(self.m_current_group)
                return []
            return [(self._ContextLevel(), text)]

        pending = self._Flush()
        if kind in PASSTHROUGH_KINDS:
            # error 块后续内容全部原样输出, 由 Feed 里的其它分支自然透传
            self.m_error_context = True
            return pending + [(LEVEL_ERROR, text)]

        self.m_kind = "warning"
        self.m_error_context = False
        self.m_head_location = location
        self.m_head_message = message
        self.m_note_groups = []
        self.m_current_group = None
        return pending

    def _ContextLevel(self):
        """error 块的后续行沿用 error 级别, 整块一起标红"""
        return LEVEL_ERROR if self.m_error_context else LEVEL_NORMAL

    def _Flush(self):
        """结束当前警告块: 摘要行改用 note 的位置, 后面跟 note 块的源码片段"""
        if not self.m_kind:
            return []

        note_lines = self.m_note_groups[-1] if self.m_note_groups else []
        outputs = []
        body = note_lines
        if note_lines and self.m_level >= COMPACT_LEVEL_SUMMARY:
            # note 首行只提供位置, 换成警告消息后不再重复打印
            location = note_lines[0].split(": note: ", 1)[0]
            outputs.append(
                (LEVEL_WARNING, "%s: warning: %s" % (location, self.m_head_message))
            )
            body = note_lines[1:]
        else:
            outputs.append(
                (
                    LEVEL_WARNING,
                    "%s: warning: %s" % (self.m_head_location, self.m_head_message),
                )
            )

        for line in body:
            outputs.append((LEVEL_WARNING, line))

        self.m_kind = ""
        self.m_head_location = ""
        self.m_head_message = ""
        self.m_note_groups = []
        self.m_current_group = None
        return outputs

    @staticmethod
    def _BuildLocation(match):
        """拼回 file:line[:column] 形式的位置"""
        column = match.group("column")
        if column is None:
            return "%s:%s" % (match.group("file"), match.group("line"))
        return "%s:%s:%s" % (match.group("file"), match.group("line"), column)
