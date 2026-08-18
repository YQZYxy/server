# -*- coding: utf-8 -*-
"""
WebUI 扩展包
提供基于 Flask 的 Web 客户端界面

功能：
- 完整的 Web 界面 (HTML5 + CSS3 + JavaScript)
- RESTful API
- 静态文件服务
- 多页面路由
"""

from .server import WebUIApp

__all__ = ["WebUIApp"]