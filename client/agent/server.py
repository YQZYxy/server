# -*- coding: utf-8 -*-
"""
主入口
"""

import sys
import os
import argparse
import threading
from flask import Flask
from flask_cors import CORS
from waitress import serve
from datetime import datetime

# 确保项目根目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from logger import get_logger
log = get_logger(__name__)

from config.config import get_config, set_config, AppConfig
from routes import register_all_routes


class WebUIApp:
    """
    WebUI Flask 应用封装
    """

    def __init__(self, host: str = "127.0.0.1", port: int = 9527):
        self.m_host = host
        self.m_port = port
        self.m_app = Flask(__name__)
        self.m_thread: threading.Thread | None = None
        self.m_start_time = datetime.now()

        # 更新全局配置
        config = get_config()
        config.m_host = host
        config.m_port = port
        set_config(config)

        # 启用 CORS
        CORS(self.m_app)

        # 注册所有路由
        register_all_routes(self.m_app)

        # 注册启动日志
        self._register_startup_log()

    def _register_startup_log(self) -> None:
        """注册启动日志钩子"""

        @self.m_app.before_request
        def log_request():
            from flask import request
            # 跳过静态文件日志
            if not request.path.startswith("/static"):
                pass  # 可以在这里添加请求日志

    def _discover_skills(self) -> None:
        """启动时自动发现技能"""
        try:
            from agent.skills.registry import discover_skills, get_skill_registry
            count = discover_skills()
            registry = get_skill_registry()
            registry.activate_all()
            if count > 0:
                log.info(f"已加载 {count} 个技能:")
                for skill in registry.get_skills():
                    log.info(f"  - [{skill.m_name}] {skill.m_description}")
        except Exception as e:
            log.warning(f"技能加载异常: {e}")

    def Start(self) -> None:
        """启动服务器"""
        log.info(f"=" * 60)
        log.info(f"🐟 小鱼 Agent v3.7.2.3")
        log.info(f"📡 地址: http://{self.m_host}:{self.m_port}")
        log.info(f"=" * 60)
        log.info(f"API 端点:")
        log.info(f"  POST /agent               Agent 流式对话(工具+技能)")
        log.info(f"  POST /agent/cancel         取消流式对话")
        log.info(f"  GET  /agent/session        获取会话历史")
        log.info(f"  PATCH /agent/session       更新会话配置")
        log.info(f"  DELETE /agent/session      删除会话")
        log.info(f"  GET  /agent/sessions       列出所有会话")
        log.info(f"  GET  /agent/tools          查看可用工具")
        log.info(f"  GET  /agent/stats          Agent 统计")
        log.info(f"  GET  /agent/skills         查看已加载技能")
        log.info(f"  POST /agent/skills/discover 发现技能")
        log.info(f"  POST /agent/skills/reload   重新加载技能")
        log.info(f"  GET  /agent/skills/<name>   技能详情")
        log.info(f"  GET  /agent/status         服务器状态")
        log.info(f"  POST /agent/config         更新配置")
        log.info(f"=" * 60)
        self._discover_skills()

        self.m_thread = threading.Thread(
            target=serve,
            kwargs={
                "app": self.m_app,
                "host": self.m_host,
                "port": self.m_port,
            },
            daemon=True,
        )
        self.m_thread.start()

    def Stop(self) -> None:
        """停止服务器"""
        log.info("服务器已停止")


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="小鱼 Agent 平台")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址")
    parser.add_argument("--port", type=int, default=9527, help="监听端口")
    parser.add_argument("--api-url", default="", help="LLM API 地址")
    parser.add_argument("--api-key", default="", help="LLM API Key")
    return parser.parse_args()


def main():
    """主函数"""
    args = parse_args()

    # 初始化配置
    config = AppConfig.from_env()
    config.m_host = args.host
    config.m_port = args.port
    if args.api_url:
        config.m_api_url = args.api_url
    if args.api_key:
        config.m_api_key = args.api_key
    set_config(config)

    # 启动服务器
    server = WebUIApp(host=args.host, port=args.port)
    server.Start()

    try:
        import time
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        server.Stop()
        log.info("小鱼已下线，再见！")


if __name__ == "__main__":
    main()