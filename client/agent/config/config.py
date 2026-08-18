# -*- coding: utf-8 -*-
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AppConfig:
    """应用全局配置"""

    # 服务器
    m_host: str = "127.0.0.1"
    m_port: int = 9527
    m_debug: bool = False

    # AI 后端 API
    m_api_url: str = "http://127.0.0.1:8080/chat/completions"
    m_api_key: str = ""

    # LangChain Agent 默认配置
    m_agent_default_model: str = "XiaoYu"
    m_agent_max_iterations: int = 25
    m_agent_max_execution_time: int = 60  # 秒
    m_agent_temperature: float = 0.7
    m_agent_verbose: bool = True

    # 技能
    m_skills_max_prompt_chars: int = 800
    """技能目录在 system prompt 中的最大字符数, 超出自动切紧凑模式"""

    # 会话管理
    m_session_ttl: int = 3600  # 会话过期时间（秒）
    m_max_sessions: int = 1000
    m_memory_dir : str = field(default_factory=lambda: os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "agent", "session" , "memory"
    ))  # 会话持久化存储目录

    # 静态文件
    m_static_dir: str = field(default_factory=lambda: os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "static"
    ))

    @classmethod
    def from_env(cls) -> "AppConfig":
        """从环境变量加载配置"""
        config = cls()
        config.m_host = os.environ.get("WEBUI_HOST", config.m_host)
        config.m_port = int(os.environ.get("WEBUI_PORT", config.m_port))
        config.m_api_url = os.environ.get("WEBUI_LLM_API_URL", config.m_api_url)
        config.m_api_key = os.environ.get("WEBUI_LLM_API_KEY", config.m_api_key)
        config.m_memory_dir  = os.environ.get(
            "WEBUI_MEMORY_DIR", config.m_memory_dir 
        )
        return config


# 全局单例
_g_config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    """获取全局配置单例"""
    global _g_config
    if _g_config is None:
        _g_config = AppConfig.from_env()
    return _g_config


def set_config(config: AppConfig) -> None:
    """设置全局配置"""
    global _g_config
    _g_config = config