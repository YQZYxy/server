#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Windows 无控制台启动入口.

双击本文件会使用 pythonw.exe 启动, 不会出现控制台黑框.
命令行调试仍然使用 server_tool.py.
"""

import os
import sys

# 仓库根目录, 保证从任意工作目录启动都能导入 config.script
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from server_tool import main  # noqa: E402

if __name__ == "__main__":
    sys.exit(main())
