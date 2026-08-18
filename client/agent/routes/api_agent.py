# -*- coding: utf-8 -*-
from flask import request, Response, stream_with_context, jsonify
from services.agent_service import get_agent_service
from agent.chat_options import ChatOptions


def register_agent_routes(app):
    """注册 Agent 相关路由"""
    agent_service = get_agent_service()

    @app.route("/agent", methods=["POST"])
    def api_agent_chat():
        """
        Agent 流式对话

        请求体:
        {
            "message": "用户消息",
            "session_id": "唯一会话id",
            "new_session": false,
            "opts": ChatOptions 参数字典
        }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "请求数据为空"}), 400

            user_input = data.get("message", "")
            if not user_input:
                return jsonify({"error": "消息不能为空"}), 400

            # 会话 ID: 使用客户端提供的或从请求头生成
            session_id = data.get("session_id") or _make_session_id(request)
            new_session = data.get("new_session", False)
            tool_tags = data.get("tool_tags")    # list or None
            tool_names = data.get("tool_names")  # list or None
            custom_instructions = data.get("custom_instructions", "")
            temperature = data.get("temperature", 0.0)
            max_tokens = data.get("maxTokens", 0)
            model = data.get("model", "")
            skill_names = data.get("skill_names")  # list or None
            skill_tags = data.get("skill_tags")    # list or None

            # 构建参数字典
            opts = ChatOptions(
                m_model=model or None,
                m_tool_tags=tool_tags,
                m_tool_names=tool_names,
                m_custom_instructions=custom_instructions,
                m_temperature=temperature,
                m_max_tokens=max_tokens,
                m_skill_names=skill_names,
                m_skill_tags=skill_tags,
            )

            def generate(): 
                yield from agent_service.chat(
                    session_id=session_id,
                    user_input=user_input,
                    new_session=new_session,
                    opts=opts,
                )

            return Response(
                stream_with_context(generate()),
                mimetype="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "X-Accel-Buffering": "no",
                    "X-Session-Id": session_id,
                },
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/agent/cancel", methods=["POST"])
    def api_agent_cancel():
        """
        取消正在进行的流式对话

        客户端发送此请求通知服务端停止 LLM 生成,
        配合 AbortController 双重保障(服务端取消 + 客户端断连)
        """
        data = request.get_json(silent=True) or {}
        session_id = data.get("session_id") or request.args.get("session_id") or _make_session_id(request)
        cancelled = agent_service.cancel_stream(session_id)
        return jsonify({
            "success": True,
            "cancelled": cancelled,
            "message": "已发送取消信号" if cancelled else "没有正在进行的对话",
        })

    @app.route("/agent/session", methods=["DELETE"])
    def api_agent_delete_session():
        """删除 Agent 会话"""
        session_id = request.args.get("session_id") or _make_session_id(request)
        agent_service.destroy_session(session_id)
        return jsonify({"success": True, "message": "会话已销毁"})

    @app.route("/agent/session", methods=["GET"])
    def api_agent_get_session():
        """获取会话历史"""
        session_id = request.args.get("session_id") or _make_session_id(request)
        history = agent_service.get_session_history(session_id)
        config = agent_service.get_session_config(session_id)
        return jsonify({"session_id": session_id, "messages": history, "config": config})

    @app.route("/agent/session", methods=["PATCH"])
    def api_agent_update_session():
        """
        更新会话配置

        用于模式切换时更新会话的模式/工具/技能等配置,
        让服务端在下次对话时使用正确的上下文.

        请求体:
        {
            "session_id": "唯一会话id",
            "config": {
                "agent_mode": true,
                "tool_tags": [...],
                "skill_tags": [...]
            }
        }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "请求数据为空"}), 400

            session_id = data.get("session_id") or _make_session_id(request)
            config = data.get("config", {})
            if not isinstance(config, dict):
                return jsonify({"error": "config 必须是字典"}), 400

            agent_service.update_session_config(session_id, config)
            return jsonify({
                "success": True,
                "session_id": session_id,
                "config": config,
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/agent/tools", methods=["GET"])
    def api_agent_list_tools():
        """列出可用工具"""
        tools = agent_service.list_tools()
        return jsonify({"tools": tools})

    @app.route("/agent/sessions", methods=["GET"])
    def api_agent_list_sessions():
        """列出所有活跃会话"""
        sessions = agent_service.list_sessions()
        return jsonify({"sessions": sessions, "total": len(sessions)})

    @app.route("/agent/stats", methods=["GET"])
    def api_agent_stats():
        """获取 Agent 统计"""
        return jsonify(agent_service.get_session_stats())

    # 技能相关

    @app.route("/agent/skills/discover", methods=["POST"])
    def api_agent_skills_discover():
        """发现并加载所有技能"""
        result = agent_service.discover_skills()
        return jsonify(result)

    @app.route("/agent/skills/reload", methods=["POST"])
    def api_agent_reload_skills():
        """重新加载所有技能"""
        result = agent_service.reload_skills()
        return jsonify(result)

    @app.route("/agent/skills", methods=["GET"])
    def api_agent_list_skills():
        """列出所有已加载的技能"""
        skills = agent_service.list_skills()
        return jsonify({"skills": skills, "total": len(skills)})

    @app.route("/agent/skills/<name>", methods=["GET"])
    def api_agent_get_skill(name):
        """获取技能详情"""
        detail = agent_service.get_skill_detail(name)
        return jsonify(detail)


def _make_session_id(request) -> str:
    """根据请求生成会话 ID"""
    import hashlib
    raw = f"{request.remote_addr}|{request.headers.get('User-Agent', '')}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]