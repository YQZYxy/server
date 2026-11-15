"""机器人客户端

一个机器人 = 一条 WebSocket 连接 + 一个场景实例。
协议细节: [2B headLen 小端][PB_MessageHead][body], 详见 stress/protocol.py
"""

import asyncio
import random
import time
from collections import defaultdict, deque

import websockets

# 场景异常采样节流, 避免刷屏
MAX_ERROR_LOG_PER_BOT = 5
# 连接结果告警的全局节流(1000 个机器人不能各打一条)
MAX_CONNECT_WARN_LOGS = 5
CONNECT_WARN_COUNT = 0
# 停止请求的轮询粒度(秒), 决定按下"停止"后多久生效
STOP_POLL_INTERVAL = 0.1


class BotClient:
    """单个压测机器人"""

    def __init__(self, index, name, scenario, cfg, codec, metrics, log=None):
        self.index = index
        self.name = name
        self.scenario = scenario
        self.cfg = cfg
        self.codec = codec
        self.metrics = metrics
        self.log = log or (lambda level, message: None)

        self.uid = 0
        self.token = ""
        self.interval = getattr(scenario, "interval",
                                getattr(scenario, "default_interval", 1.0))
        self.stop_requested = False

        self._ws = None
        self._send_lock = None
        self._pending = defaultdict(deque)     # resp_msg_type -> deque[Future]
        self._tasks = []
        self._error_count = 0

    # ---------------- 对外动作(供场景调用) ----------------

    async def send(self, msg_type, body=None, with_token=True):
        """发一条消息"""
        if self._ws is None:
            return False
        token = self.token if with_token else ""
        packet = self.codec.pack(msg_type, body, token)
        async with self._send_lock:
            await self._ws.send(packet)
        self.metrics.inc("send_msgs")
        self.metrics.inc("send_bytes", len(packet))
        return True

    async def request(self, msg_type, body, resp_msg_type, timeout=5.0):
        """发请求并等指定类型的响应, 返回解码后的消息(超时返回 None), 成功时统计 RTT"""
        future = asyncio.get_running_loop().create_future()
        self._pending[resp_msg_type].append(future)
        start = time.perf_counter()
        try:
            await self.send(msg_type, body)
            response = await asyncio.wait_for(future, timeout)
            self.metrics.observe("rtt_ms", (time.perf_counter() - start) * 1000)
            return response
        except asyncio.TimeoutError:
            if not self.stop_requested:
                self.metrics.inc("timeout")
                # 按场景分别计数, 便于定位是哪个业务超时
                self.metrics.inc("timeout:%s" % getattr(self.scenario, "name", "unknown"))
            return None
        finally:
            queue = self._pending.get(resp_msg_type)
            if queue and future in queue:
                queue.remove(future)

    async def delay(self, seconds):
        """可被打断的等待"""
        await self._sleep_interruptible(seconds)

    async def _sleep_interruptible(self, seconds):
        """分片等待: 收到停止请求立刻返回, 不必等满整个场景间隔"""
        deadline = time.perf_counter() + seconds
        while not self.stop_requested:
            remaining = deadline - time.perf_counter()
            if remaining <= 0:
                return
            await asyncio.sleep(min(remaining, STOP_POLL_INTERVAL))

    def fail(self, message):
        """场景内记录一次错误(带采样, 避免刷屏)"""
        self.metrics.inc("scenario_error")
        self._error_count += 1
        if self._error_count <= MAX_ERROR_LOG_PER_BOT:
            self.log("WARN", "[%s] %s" % (self.name, message))

    # ---------------- 生命周期 ----------------

    async def run(self):
        self._send_lock = asyncio.Lock()
        uri = "ws://%s:%d%s" % (self.cfg.host, self.cfg.port, self.cfg.path)
        self.metrics.inc("bots_started")
        start = time.perf_counter()
        try:
            # 网关不处理 WebSocket ping 帧, 关闭库自带 keepalive, 保活走业务心跳
            async with websockets.connect(
                uri,
                max_size=None,
                ping_interval=None,
                open_timeout=self.cfg.connect_timeout,
                close_timeout=2.0,      # 停止时收尾要快, 否则几百条连接会拖很久
            ) as ws:
                self._ws = ws
                self.metrics.inc("connect_ok")

                # 网关在 WS 握手后才异步连游戏服, 连上之前的上行数据会被直接丢弃,
                # 所以必须等 P_ServerConnectResult(前端也是这么做的)再发登录
                if not await self._wait_game_connect():
                    self.metrics.inc("game_connect_failed")
                    return
                self.metrics.observe("connect_ms", (time.perf_counter() - start) * 1000)

                if not await self._login():
                    self.metrics.inc("login_failed")
                    return
                self.metrics.inc("login_ok")

                self._tasks = [
                    asyncio.create_task(self._reader()),
                    asyncio.create_task(self._heartbeat()),
                ]
                self.metrics.inc("online")
                try:
                    await self._run_scenario()
                finally:
                    self.metrics.dec("online")
                    try:
                        await self.scenario.on_logout(self)
                    except Exception as error:
                        self.log("WARN", "[%s] 场景 on_logout 异常: %r" % (self.name, error))
                    for task in self._tasks:
                        task.cancel()
        except asyncio.CancelledError:
            raise
        except Exception as error:
            self.metrics.inc("connect_failed")
            self.metrics.inc("bots_failed")
            self.log("ERROR", "[%s] 连接异常: %r" % (self.name, error))
        finally:
            self.metrics.dec("bots_started")

    async def _run_scenario(self):
        await self.scenario.on_login(self)
        while not self.stop_requested:
            step_start = time.perf_counter()
            try:
                await self.scenario.on_step(self)
            except asyncio.CancelledError:
                raise
            except Exception as error:
                self.fail("场景 on_step 异常: %r" % (error,))

            # 间隔按固定节奏扣掉执行耗时, 避免慢场景越跑越偏
            interval = getattr(self.scenario, "interval", self.interval)
            sleep_time = interval - (time.perf_counter() - step_start)
            await self._sleep_interruptible(max(0.0, sleep_time))

    async def _wait_game_connect(self):
        """等网关回 P_ServerConnectResult(到游戏服的 TCP 打通), 再发登录

        返回 False 表示确定连不上游戏服, 机器人直接放弃
        """
        result_type = self.codec.msg_type("MHT_SERVER_CONNECT_RESULT")
        if not result_type:
            return True     # 协议表里没有该消息, 保持旧行为

        deadline = time.perf_counter() + self.cfg.connect_timeout
        while True:
            remaining = deadline - time.perf_counter()
            if remaining <= 0:
                # 老网关可能不发这条消息, 告警后照常登录, 避免整套用例失效
                self._warn_connect("等不到游戏服连接结果, 直接尝试登录")
                return True
            try:
                data = await asyncio.wait_for(self._ws.recv(), remaining)
            except asyncio.TimeoutError:
                self._warn_connect("等不到游戏服连接结果, 直接尝试登录")
                return True

            self.metrics.inc("recv_msgs")
            self.metrics.inc("recv_bytes", len(data))
            unpacked = self.codec.unpack(data)
            if unpacked is None:
                continue
            msg_type, _token, body_bytes = unpacked
            if msg_type != result_type:
                continue

            response = self.codec.decode(msg_type, body_bytes)
            if response is not None and getattr(response, "success", False):
                return True

            reason = getattr(response, "error", "") if response else "解码失败"
            self.log("ERROR", "[%s] 连接游戏服失败: %s" % (self.name, reason))
            return False

    def _warn_connect(self, message):
        """连接结果相关告警, 全局只打前几条"""
        global CONNECT_WARN_COUNT
        CONNECT_WARN_COUNT += 1
        if CONNECT_WARN_COUNT <= MAX_CONNECT_WARN_LOGS:
            self.log("WARN", "[%s] %s" % (self.name, message))

    async def _login(self):
        """登录并取 token, token 在 P_LoginReq_SC 包体里"""
        start = time.perf_counter()
        login_msg_type = self.codec.msg_type("MHT_LOGIN_CS")
        login_res_type = self.codec.msg_type("MHT_LOGIN_SC")
        body = self.codec.new("P_LoginReq_CS", login_user_name=self.name)
        await self.send(login_msg_type, body, with_token=False)
        # 登录包的发出时刻(相对整轮压测开始), 用来区分"请求到达是否扎堆"
        self.metrics.observe("login_send_ms", (time.time() - self.metrics.start_time) * 1000)

        deadline = start + self.cfg.login_timeout
        while True:
            remaining = deadline - time.perf_counter()
            if remaining <= 0:
                self.log("ERROR", "[%s] 登录超时" % self.name)
                return False
            try:
                data = await asyncio.wait_for(self._ws.recv(), remaining)
            except asyncio.TimeoutError:
                self.log("ERROR", "[%s] 登录超时" % self.name)
                return False

            self.metrics.inc("recv_msgs")
            self.metrics.inc("recv_bytes", len(data))
            unpacked = self.codec.unpack(data)
            if unpacked is None:
                continue
            msg_type, _token, body_bytes = unpacked
            if msg_type != login_res_type:
                continue        # 登录前会推一批同步包, 丢弃

            response = self.codec.decode(msg_type, body_bytes)
            if response is None or not response.token:
                reason = getattr(response, "error_message", "无 token") if response else "解码失败"
                self.log("ERROR", "[%s] 登录失败: %s" % (self.name, reason))
                return False

            self.token = response.token
            self.uid = int(response.uid) if hasattr(response, "uid") else 0
            self.metrics.observe("login_ms", (time.perf_counter() - start) * 1000)
            return True

    async def _heartbeat(self):
        msg_type = self.codec.msg_type("MHT_USER_HEARTBEAT")
        body = self.codec.new("P_UserHeartbeat")
        try:
            # 首次随机延后, 避免所有机器人同一秒齐发心跳(会伪造出周期性尖峰)
            await asyncio.sleep(random.uniform(0.0, self.cfg.heartbeat_interval))
            while True:
                body.time = int(time.time())
                await self.send(msg_type, body)
                # 每次再加 ±10% 抖动, 让心跳彻底散开
                await asyncio.sleep(self.cfg.heartbeat_interval * random.uniform(0.9, 1.1))
        except asyncio.CancelledError:
            pass
        except Exception:
            pass        # 连接已断, 由主流程处理

    async def _reader(self):
        """持续接收, 唤醒等待中的 request"""
        try:
            while True:
                data = await self._ws.recv()
                self.metrics.inc("recv_msgs")
                self.metrics.inc("recv_bytes", len(data))
                unpacked = self.codec.unpack(data)
                if unpacked is None:
                    self.metrics.inc("bad_packet")
                    continue
                msg_type, _token, body_bytes = unpacked
                message = self.codec.decode(msg_type, body_bytes)
                queue = self._pending.get(msg_type)
                if queue:
                    future = queue.popleft()
                    if not future.done():
                        future.set_result(message)
        except asyncio.CancelledError:
            pass
        except Exception:
            pass
