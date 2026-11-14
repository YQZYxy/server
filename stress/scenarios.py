"""压测场景

扩展方式: 继承 Scenario, 用 @register_scenario 装饰, GUI 和 CLI 会自动识别。

    @register_scenario
    class MyScenario(Scenario):
        name = "my"
        description = "自定义场景"
        default_interval = 1.0
        async def on_step(self, bot):
            await bot.send(30019, bot.codec.new("P_SyncLineupUpdate_CS", battle_type=1))

钩子说明:
    on_login(bot)  登录成功、心跳已启动后调用一次
    on_step(bot)   按 default_interval 循环调用
    on_logout(bot) 断开前调用
"""

import random

# 场景注册表: name -> class
REGISTRY = {}


def register_scenario(cls):
    """场景注册装饰器"""
    if not getattr(cls, "name", ""):
        raise ValueError("场景必须有 name: %r" % cls)
    if cls.name in REGISTRY:
        raise ValueError("场景重名: %s" % cls.name)
    REGISTRY[cls.name] = cls
    return cls


def create_scenario(name, params=None):
    """按名字创建场景实例, 未注册返回 None"""
    cls = REGISTRY.get(name)
    if cls is None:
        return None
    return cls(params)


def all_scenarios():
    """按注册顺序返回所有场景类"""
    return list(REGISTRY.values())


class Scenario:
    """场景基类"""

    name = ""
    description = ""
    default_interval = 1.0
    # 参数默认值, GUI 里可以改
    default_params = {}

    def __init__(self, params=None):
        self.params = dict(self.default_params)
        if params:
            self.params.update(params)
        self.interval = self.default_interval

    async def on_login(self, bot):
        pass

    async def on_step(self, bot):
        pass

    async def on_logout(self, bot):
        pass


# ==================== 内置场景 ====================

@register_scenario
class IdleScenario(Scenario):
    """只登录挂机, 只有业务心跳。用来测"挂机玩家"的基线开销"""

    name = "idle"
    description = "登录挂机(仅心跳)"
    default_interval = 5.0

    async def on_step(self, bot):
        pass        # 心跳由 bot 内部维持


@register_scenario
class LineupScenario(Scenario):
    """阵容变更: 走 角色数据读 -> 修改 -> 回写 C++ 全链路"""

    name = "lineup"
    description = "阵容变更(读角色数据+回写)"
    default_interval = 1.0
    default_params = {"battle_type": 1, "slot": 0, "hero_id": 1}

    async def on_login(self, bot):
        self._msg_type = bot.codec.msg_type("MHT_SYNC_LINEUP_UPDATE_CS")
        self._req_class = bot.codec.message_class("P_SyncLineupUpdate_CS")

    async def on_step(self, bot):
        body = self._req_class(
            battle_type=int(self.params["battle_type"]),
            slot=int(self.params["slot"]),
            hero_ids=[int(self.params["hero_id"])],
        )
        await bot.send(self._msg_type, body)


@register_scenario
class RankScenario(Scenario):
    """排行榜查询: 请求-响应, 能测 RTT

    注意 rank_type=1(竞技场) 由 ArenaManager 接管, 返回的是 MHT_ARENA_RANK_SC,
    所以这里默认用 rank_type=2(主线战力), 返回 MHT_RANK_SC
    """

    name = "rank"
    description = "排行榜查询(请求-响应)"
    default_interval = 2.0
    default_params = {"rank_type": 2, "rank_offset": 0, "resp": "MHT_RANK_SC"}

    async def on_login(self, bot):
        self._msg_type = bot.codec.msg_type("MHT_RANK_CS")
        self._resp_type = bot.codec.msg_type(str(self.params["resp"]))
        self._req_class = bot.codec.message_class("P_Rank_CS")

    async def on_step(self, bot):
        body = self._req_class(
            rank_type=int(self.params["rank_type"]),
            rank_offset=int(self.params["rank_offset"]),
        )
        response = await bot.request(self._msg_type, body, self._resp_type)
        if response is None:
            bot.fail("排行榜查询无响应")


@register_scenario
class ArenaScenario(Scenario):
    """竞技场刷新对手"""

    name = "arena"
    description = "竞技场刷新对手"
    default_interval = 3.0
    default_params = {"req_type": 2}

    async def on_login(self, bot):
        self._msg_type = bot.codec.msg_type("MHT_ARENA_CS")
        self._resp_type = bot.codec.msg_type("MHT_ARENA_SC")
        self._req_class = bot.codec.message_class("P_Arena_CS")

    async def on_step(self, bot):
        body = self._req_class(req_type=int(self.params["req_type"]))
        response = await bot.request(self._msg_type, body, self._resp_type)
        if response is None:
            bot.fail("竞技场请求无响应")


@register_scenario
class ChatScenario(Scenario):
    """聊天: 默认拉取历史消息(req_type=1), 请求与响应一一对应, RTT 才有意义

    req_type=0 是发消息, 走世界频道广播, 会让所有在线玩家都收到包
    """

    name = "chat"
    description = "聊天(默认拉取历史)"
    default_interval = 2.0
    default_params = {"type": 0, "req_type": 1, "message": "stress test"}

    async def on_login(self, bot):
        self._msg_type = bot.codec.msg_type("MHT_CHAT_CS")
        self._resp_type = bot.codec.msg_type("MHT_CHAT_SC")
        self._req_class = bot.codec.message_class("P_Chat_CS")

    async def on_step(self, bot):
        body = self._req_class(
            req_type=int(self.params["req_type"]),
            type=int(self.params["type"]),
            chat_msg=str(self.params["message"]),
        )
        await bot.request(self._msg_type, body, self._resp_type)


@register_scenario
class GmScenario(Scenario):
    """GM 指令, 适合压管理接口"""

    name = "gm"
    description = "GM 指令"
    default_interval = 3.0
    default_params = {"command": "help"}

    async def on_login(self, bot):
        self._msg_type = bot.codec.msg_type("MHT_GM_CS")
        self._resp_type = bot.codec.msg_type("MHT_GM_SC")
        self._req_class = bot.codec.message_class("P_GM_CS")

    async def on_step(self, bot):
        body = self._req_class(params=str(self.params["command"]))
        await bot.request(self._msg_type, body, self._resp_type)


@register_scenario
class MixedScenario(Scenario):
    """混合业务: 每个机器人从 mix 列表里随机挑一个场景执行"""

    name = "mixed"
    description = "混合业务(随机挑选)"
    default_interval = 1.0
    default_params = {"mix": "lineup,rank,arena,chat"}

    def __init__(self, params=None):
        super().__init__(params)
        self._inner = None

    async def on_login(self, bot):
        names = [item.strip() for item in str(self.params["mix"]).split(",") if item.strip()]
        names = [item for item in names if item != self.name and item in REGISTRY]
        if not names:
            bot.fail("mixed 场景没有可用的子场景")
            return
        self._inner = create_scenario(random.choice(names))
        self.interval = self._inner.default_interval
        await self._inner.on_login(bot)

    async def on_step(self, bot):
        if self._inner is not None:
            await self._inner.on_step(bot)

    async def on_logout(self, bot):
        if self._inner is not None:
            await self._inner.on_logout(bot)
