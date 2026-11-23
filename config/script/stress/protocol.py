"""协议编解码

直接从 luascript/proto/*.pb (protoc 生成的 descriptor_set) 动态加载,
机器人不需要编译 proto, 协议改了只需要重新生成 .pb 即可。

msg_type 与 protobuf 类型名的映射从 luascript/proto/protobufmht.lua 解析,
所以协议表变动会自动跟上。
"""

import glob
import os
import re
import struct

from google.protobuf import descriptor_pb2, descriptor_pool
from google.protobuf.message_factory import GetMessageClass

from .paths import StressStartupError, load_config

# protobufmht.lua 里每个常量形如: M.MHT_LOGIN_CS = 30001 -- P_LoginReq_CS 角色登录请求
MHT_PATTERN = re.compile(r"M\.(MHT_\w+)\s*=\s*(\d+)\s*--\s*(\w+)")


class ProtocolCodec:
    """proto 描述符加载与消息打包"""

    def __init__(self, proto_dir=None, mht_lua_path=None):
        config = load_config()
        if proto_dir:
            self.proto_dir = proto_dir
        else:
            # 协议目录统一以 config/script/config.json 的 stress.proto_dir 为准
            self.proto_dir = config["proto_dir"]
        self.mht_lua_path = mht_lua_path or os.path.join(self.proto_dir, "protobufmht.lua")

        self.pool = descriptor_pool.DescriptorPool()
        self._template_cache = {}

        # MHT 常量: 名字 -> id, id -> protobuf 消息名
        self.mht_id = {}
        self.mht_name = {}
        self.msg_type_to_proto = {}

        self._load_descriptors()
        self._load_mht()

    # ---------------- 加载 ----------------

    def _load_descriptors(self):
        pending = {}
        files = sorted(glob.glob(os.path.join(self.proto_dir, "*.pb")))
        if not files:
            raise FileNotFoundError("未找到 .pb 描述符文件: %s" % self.proto_dir)

        for path in files:
            file_set = descriptor_pb2.FileDescriptorSet()
            with open(path, "rb") as handler:
                file_set.ParseFromString(handler.read())
            for file_desc in file_set.file:
                pending[file_desc.name] = file_desc

        # .pb 之间有依赖(protocol 依赖 data/roledata/battledata), 必须按依赖顺序加载
        while pending:
            progressed = False
            for name in list(pending):
                try:
                    self.pool.Add(pending[name])
                except Exception:
                    continue        # 依赖还没加载, 下一轮再试
                del pending[name]
                progressed = True
            if not progressed:
                raise RuntimeError("proto 依赖无法解析: %s" % list(pending))

    def _load_mht(self):
        if not os.path.isfile(self.mht_lua_path):
            return
        with open(self.mht_lua_path, "r", encoding="utf-8", errors="ignore") as handler:
            content = handler.read()

        for name, value, proto_name in MHT_PATTERN.findall(content):
            msg_type = int(value)
            self.mht_id[name] = msg_type
            self.mht_name[msg_type] = proto_name
            try:
                self.pool.FindMessageTypeByName(proto_name)
                self.msg_type_to_proto[msg_type] = proto_name
            except KeyError:
                pass        # 该常量没有对应的 protobuf 消息

    # ---------------- 消息 ----------------

    def message_class(self, proto_name):
        """取 protobuf 消息类, 结果缓存"""
        cls = self._template_cache.get(proto_name)
        if cls is None:
            cls = GetMessageClass(self.pool.FindMessageTypeByName(proto_name))
            self._template_cache[proto_name] = cls
        return cls

    def new(self, proto_name, **fields):
        """构造消息, fields 直接作为字段初值"""
        return self.message_class(proto_name)(**fields)

    def msg_type(self, mht_name, default=0):
        """按 MHT 常量名取 msg_type"""
        return self.mht_id.get(mht_name, default)

    def proto_name(self, msg_type):
        return self.msg_type_to_proto.get(msg_type)

    # ---------------- 打包 ----------------

    def pack(self, msg_type, body=None, token=""):
        """组装 [2B headLen 小端][PB_MessageHead][body]"""
        head = self.new("PB_MessageHead")
        head.msg_type = msg_type
        if token:
            head.token = token
        head_bytes = head.SerializeToString()
        body_bytes = body.SerializeToString() if body is not None else b""
        return struct.pack("<H", len(head_bytes)) + head_bytes + body_bytes

    def unpack(self, data):
        """拆包, 返回 (msg_type, token, body_bytes), 数据非法时返回 None"""
        if not data or len(data) < 2:
            return None
        head_len = struct.unpack("<H", data[:2])[0]
        if head_len <= 0 or 2 + head_len > len(data):
            return None
        head = self.new("PB_MessageHead")
        head.ParseFromString(data[2:2 + head_len])
        return head.msg_type, head.token, data[2 + head_len:]

    def decode(self, msg_type, body_bytes):
        """按 msg_type 解码包体, 未知类型或解析失败返回 None"""
        proto_name = self.proto_name(msg_type)
        if not proto_name:
            return None
        message = self.new(proto_name)
        try:
            message.ParseFromString(body_bytes)
        except Exception:
            return None
        return message


def load_codec():
    """加载失败时抛出 StressStartupError, 由入口统一展示(命令行打印或弹窗)"""
    try:
        return ProtocolCodec()
    except StressStartupError:
        raise
    except Exception as error:
        raise StressStartupError("加载协议失败: %s" % error) from error
