# -*- coding: utf-8 -*-
from .api_agent import register_agent_routes
from .api_config import register_config_routes


def register_all_routes(app):
    """注册所有路由到 Flask 应用"""
    register_agent_routes(app)
    register_config_routes(app)