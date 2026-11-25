#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""网关 GM 客户端.

热更模块通过它在不重启进程的前提下让逻辑服重新加载脚本与配置:
    1. 连接实例网关的 WebSocket
    2. 等网关回 P_ServerConnectResult, 确认已经连上逻辑服
    3. 用固定账号登录, 拿到 token
    4. 发送 GM 指令并等待 P_GM_SC

协议: [2B headLen 小端][PB_MessageHead][body]
"""

import asyncio

from .errors import ModuleError

# 网关 WebSocket 路径, 与压测工具保持一致
WS_PATH = "/ws"
# 等待网关连上逻辑服的超时(秒)
CONNECT_TIMEOUT = 10.0
# 登录与 GM 指令的响应超时(秒)
REQUEST_TIMEOUT = 10.0
# 热更固定使用的登录账号, 避免每次热更都在数据库里产生新角色
GM_LOGIN_NAME = "hotfix_bot"


def _ImportWebsockets():
    """延迟导入 websockets, 缺少依赖时给出明确安装提示"""
    try:
        import websockets
    except ImportError as error:
        raise ModuleError(
            "缺少 websockets 依赖, 无法发送 GM 指令: %s\n"
            "  请执行: pip install websockets protobuf" % error
        ) from error
    return websockets


class GmClient(object):
    """一次调用连接一次网关, 可连续发送多条 GM 指令"""

    def __init__(self, proto_dir, login_name=GM_LOGIN_NAME):
        self.m_proto_dir = proto_dir
        self.m_login_name = login_name
        self.m_codec = None

    def Codec(self):
        """按协议目录构建编解码器, 缺少依赖或描述符时报错"""
        if self.m_codec is not None:
            return self.m_codec
        try:
            from ..stress.protocol import ProtocolCodec
        except ImportError as error:
            raise ModuleError(
                "缺少 protobuf 依赖, 无法发送 GM 指令: %s\n"
                "  请执行: pip install protobuf websockets" % error
            ) from error
        try:
            self.m_codec = ProtocolCodec(proto_dir=self.m_proto_dir)
        except Exception as error:
            raise ModuleError("加载协议描述符失败: %s" % error) from error
        return self.m_codec

    def SendCommands(self, host, port, commands):
        """连接网关并依次发送 GM 指令, 返回与 commands 等长的响应列表"""
        if not commands:
            return []
        codec = self.Codec()
        try:
            return asyncio.run(self._SendCommands(codec, host, port, commands))
        except ModuleError:
            raise
        except OSError as error:
            raise ModuleError(
                "连接网关失败 %s:%d (%s)" % (host, port, error)
            ) from error
        except Exception as error:
            raise ModuleError(
                "发送 GM 指令失败 %s:%d (%s)" % (host, port, error)
            ) from error

    async def _SendCommands(self, codec, host, port, commands):
        websockets = _ImportWebsockets()
        uri = "ws://%s:%d%s" % (host, port, WS_PATH)
        async with websockets.connect(
            uri,
            max_size=None,
            ping_interval=None,
            open_timeout=CONNECT_TIMEOUT,
            close_timeout=2.0,
        ) as ws:
            await self._WaitGameConnect(ws, codec)
            token = await self._Login(ws, codec)
            responses = []
            for command in commands:
                responses.append(await self._RequestGm(ws, codec, token, command))
            return responses

    async def _WaitGameConnect(self, ws, codec):
        """网关在 WS 握手后才连游戏服, 连上之前的上行数据会被丢弃"""
        result_type = codec.msg_type("MHT_SERVER_CONNECT_RESULT")
        if not result_type:
            return
        while True:
            msg_type, _token, body = await self._Receive(ws, codec, CONNECT_TIMEOUT, "网关连接逻辑服")
            if msg_type != result_type:
                continue
            message = codec.decode(msg_type, body)
            if message is None:
                continue
            if getattr(message, "success", False):
                return
            reason = getattr(message, "error", "") or "未知原因"
            raise ModuleError("网关连接逻辑服失败: %s" % reason)

    async def _Login(self, ws, codec):
        """登录热更账号, 返回后续请求使用的 token"""
        request_type = codec.msg_type("MHT_LOGIN_CS")
        response_type = codec.msg_type("MHT_LOGIN_SC")
        if not request_type or not response_type:
            raise ModuleError("协议表缺少登录消息, 请先重新生成 protobuf")

        body = codec.new("P_LoginReq_CS", login_user_name=self.m_login_name)
        await ws.send(codec.pack(request_type, body, ""))
        while True:
            msg_type, _token, body_bytes = await self._Receive(ws, codec, REQUEST_TIMEOUT, "GM 账号登录")
            if msg_type != response_type:
                continue
            response = codec.decode(msg_type, body_bytes)
            if response is None or not response.token:
                reason = getattr(response, "error_message", "") if response else ""
                raise ModuleError("GM 账号登录失败: %s" % (reason or "没有返回 token"))
            return response.token

    async def _RequestGm(self, ws, codec, token, command):
        """发送一条 GM 指令并等待 P_GM_SC"""
        request_type = codec.msg_type("MHT_GM_CS")
        response_type = codec.msg_type("MHT_GM_SC")
        if not request_type or not response_type:
            raise ModuleError("协议表缺少 GM 消息, 请先重新生成 protobuf")

        body = codec.new("P_GM_CS", params=command)
        await ws.send(codec.pack(request_type, body, token))
        while True:
            msg_type, _token, body_bytes = await self._Receive(ws, codec, REQUEST_TIMEOUT, "GM 指令 %s" % command)
            if msg_type != response_type:
                continue
            return codec.decode(msg_type, body_bytes)

    async def _Receive(self, ws, codec, timeout, phase):
        """收一条消息并拆包, 超时直接报错"""
        try:
            data = await asyncio.wait_for(ws.recv(), timeout)
        except asyncio.TimeoutError as error:
            raise ModuleError("等待%s超时" % phase) from error
        unpacked = codec.unpack(data)
        if unpacked is None:
            return 0, "", b""
        return unpacked
