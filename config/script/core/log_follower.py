#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""日志跟随.

服务端日志按天轮转, 命名规则为 server%Y%m%d.log.
跟随器需要处理:
    文件延迟创建
    文件被截断或重建
    跨天切换新文件
    可选的正则过滤
"""

import os
import re
import sys
from datetime import datetime

from .console import ColorizeLogLine, StripAnsi

# 日志文件命名规则
LOG_FILE_BASE = "server"
LOG_DATE_FORMAT = "%Y%m%d"


def CurrentLogFile(log_dir):
    """当天日志文件路径"""
    file_name = LOG_FILE_BASE + datetime.now().strftime(LOG_DATE_FORMAT) + ".log"
    return os.path.join(log_dir, file_name)


class LogFollower(object):
    """跟随单个日志文件并输出新增内容"""

    def __init__(self, resolve_path, tail_lines=0, strip_color=False,
                 console=None, pattern=""):
        self.m_resolve_path = resolve_path
        self.m_tail_lines = max(int(tail_lines), 0)
        self.m_strip_color = strip_color
        self.m_console = console
        self.m_pattern = re.compile(pattern, re.IGNORECASE) if pattern else None
        self.m_current_path = ""
        self.m_offset = 0
        # 只处理完整行, 不完整的最后一段留到下一次
        self.m_pending = ""

    def Poll(self):
        """读取新增内容并输出, 每次轮询调用一次"""
        path = self.m_resolve_path()
        if path != self.m_current_path:
            self.m_current_path = path
            self.m_offset = 0
            self.m_pending = ""
            self._Info("跟随日志: %s" % path)
            if not os.path.exists(path):
                self._Info("日志文件还没生成, 等待服务写入 ...")
                return
            self.m_offset = self._TailOffset(path)

        if not os.path.exists(path):
            return

        try:
            size = os.path.getsize(path)
            # 文件被截断或重建时从头读
            if size < self.m_offset:
                self.m_offset = 0
            if size == self.m_offset:
                return
            with open(path, "rb") as handle:
                handle.seek(self.m_offset)
                data = handle.read()
                self.m_offset = handle.tell()
        except OSError:
            return

        self._Emit(data)

    def _TailOffset(self, path):
        """定位到最后 tail_lines 行, 首屏只显示最近内容"""
        try:
            with open(path, "rb") as handle:
                handle.seek(0, os.SEEK_END)
                size = handle.tell()
                if self.m_tail_lines <= 0:
                    return size

                block_size = 64 * 1024
                position = size
                data = b""
                while position > 0 and data.count(b"\n") <= self.m_tail_lines:
                    step = min(block_size, position)
                    position -= step
                    handle.seek(position)
                    data = handle.read(step) + data

                lines = data.splitlines(keepends=True)
                if len(lines) > self.m_tail_lines:
                    data = b"".join(lines[-self.m_tail_lines:])
                return size - len(data)
        except OSError:
            return 0

    def _Emit(self, data):
        """按行输出, 支持过滤与日志级别着色"""
        text = data.decode("utf-8", errors="replace")
        if self.m_strip_color:
            text = StripAnsi(text)

        combined = self.m_pending + text
        lines = combined.split("\n")
        self.m_pending = lines.pop()

        output = []
        for line in lines:
            if self.m_pattern is not None and not self.m_pattern.search(line):
                continue
            if self.m_strip_color:
                output.append(line + "\n")
            else:
                output.append(ColorizeLogLine(line) + "\n")

        if not output:
            return
        try:
            sys.stdout.write("".join(output))
            sys.stdout.flush()
        except (OSError, ValueError):
            pass

    def _Info(self, message):
        if self.m_console is not None:
            self.m_console.Info("[tail] " + message)
        else:
            print("[tail] " + message)
