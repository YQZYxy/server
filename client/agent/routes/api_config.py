# -*- coding: utf-8 -*-
from flask import request, jsonify
from config.config import get_config
from agent.llm_factory import _extract_base_url
import httpx


def _check_llm_connection() -> bool:
    """实际检测 LLM 服务器是否可连接"""
    config = get_config()

    if config.m_api_url:
        base_url = _extract_base_url(config.m_api_url)
    else:
        return False

    headers = {
        "Authorization": f"Bearer {config.m_api_key}"
    }
    try:
        # 轻量检测: GET {base_url}/models, 3秒超时
        resp = httpx.get(
            f"{base_url.rstrip('/')}/models",
            timeout=3.0,
            headers=headers
        )
        return resp.is_success
    except Exception:
        return False


def register_config_routes(app):
    """注册配置相关路由"""
    config = get_config()

    @app.route("/agent/status", methods=["GET"])
    def api_status():
        """服务器状态查询"""
        import datetime
        return jsonify({
            "server_name": "WebUI Agent Server",
            "version": "2.0.0",
            "ai_api_configured": bool(config.m_api_url),
            "llm_connected": _check_llm_connection(),
            "host": config.m_host,
            "port": config.m_port,
            "timestamp": datetime.datetime.now().isoformat(),
        })

    @app.route("/agent/config", methods=["GET", "POST"])
    def api_config():
        """获取或更新配置"""
        if request.method == "GET":
            return jsonify({
                "api_url": config.m_api_url,
                "agent_temperature": config.m_agent_temperature,
            })

        # POST: 更新配置
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "请求数据为空"}), 400

            if "api_url" in data:
                config.m_api_url = data["api_url"]
            if "api_key" in data:
                config.m_api_key = data["api_key"]
            if "agent_max_iterations" in data:
                config.m_agent_max_iterations = int(data["agent_max_iterations"])

            return jsonify({"success": True, "message": "配置已更新"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500