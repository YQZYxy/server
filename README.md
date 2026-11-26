# 服务器框架

C++17 多进程游戏服务器框架: CMake 构建, Python 统一脚本入口, Lua 业务脚本, Protobuf 协议, 配套 Web 管理面板与 Python AI Agent.

## 部署环境

| 项 | 说明 |
|---|---|
| 语言 | C++17 (必须 64 位), Lua 5.4 |
| 构建 | CMake >= 3.16, MSVC / GCC / Clang / MinGW |
| 通信 | 自定义二进制包 + Protobuf, TCP / WebSocket |
| 存储 | MySQL, 统一由 dbserver 访问 |
| 工具 | Python 3, `auto.py` |
| 前端 | React + TypeScript + Vite |
| 第三方库 | protobuf, abseil, sol2, nlohmann/json, cpp-httplib, tinyxml, zlib |

## 进程架构

| 进程 | 职责 |
|---|---|
| `gatewayserver` | 客户端入口: HTTP/WebSocket, 静态页面与消息转发 |
| `logicserver` | 业务主服: 运行 Lua |
| `dbserver` | 数据服: MySQL 连接池, 数据缓存与落库 |
| `globalserver` | 全局服: 集群中心 hub, 跨服数据 |
| 跨服 | 独立 `logicserver` 实例, 按 `server_id` 分段识别, 可不连数据库 |

```
客户端 --HTTP/WS--> gatewayserver --内部协议--> logicserver --SQL--> dbserver --> MySQL
                                                  |
                                      集群(星型) --+--> globalserver(hub)
                                                  +--> 跨服 logicserver
```

- `server_id` 分段: `1~42000` 普通服, `42001~42500` 小跨服, `42501~42949` 大跨服.
- 集群为单向星型: 普通服/跨服只主动连 hub, hub 只接受连接.
- 一个实例目录可运行多个进程, 共用同一份配置.

## 目录结构

```text
CMakeLists.txt            根构建脚本
CMakePresets.json         由 auto.py 生成
auto.py                   统一脚本入口 (命令行/调试)

globalserver/             全局服
gatewayserver/            网关服
logicserver/              逻辑服 
dbserver/                 数据服 

share/
  module/                 基础设施: 模块/网络/日志/定时器/线程池/排行榜/WebSocket
  plugin/                 通用框架: 节点/集群/分区/跨服/场景AOI/活动
  proto/                  .proto 定义与 protoc
  protocol/               生成的 C++ 协议代码
  lua/                    Lua 运行时与 sol2 封装
  config/                 四服务器共用的 ServerConfig
  protobuf/ abseil/ ...   第三方库

luascript/                Lua 业务脚本
client/webui/             Web 管理面板 (React + TS + Vite)
client/agent/             Python AI Agent

config/                   baseconfig / crossconfig / logicconfig / 配置表
config/script/            自动化部署脚本
sql/                      数据库导SQL
lib/ include/             预编译库与第三方头文件
build/ debug/ release/    构建中间产物与部署目录
```

## 统一脚本入口

所有构建、部署、启停、协议生成、Lua 绑定、数据库表定义、配置表导出、SVN 更新与热更都走同一入口:

```bash
python auto.py              # Windows 打开 GUI, Linux/macOS 进入命令行
python auto.py --cli        # 强制命令行
python auto.py --gui        # 强制 GUI (仅 Windows)
python auto.py --list       # 列出全部模块
```

命令行执行单个模块:

```bash
python auto.py --cli --module build --option build_type=debug --option build_mode=incremental
python auto.py --cli --module deploy --option instances=s1 --option init_db=false
python auto.py --cli --module start --option instances=s1
python auto.py --cli --module protobuf
```

| 分类 | 模块 |
|---|---|
| 构建 | `build` |
| 部署运维 | `deploy_config` `deploy` `reset_db` `start` `start_all` `stop` `stop_all` `restart` `hot_update` `validate_config` `logs` `clean_logs` |
| 代码生成 | `protobuf` `lua_bindings` `mysql_def` `config_table` |
| 测试环境 | `stress` `doctor` `settings` |

配置文件为 [config/script/config.json](config/script/config.json), 主要节点:

| 节点 | 说明 |
|---|---|
| `project_root` | 仓库根目录, 相对 `config/script` 解析 |
| `paths.deploy_dir` | 部署目录(默认 `debug`), 存放基础配置副本 |
| `paths.*` | 实例清单、公共配置、SQL、逻辑配置、Lua、前端、运行库路径 |
| `build.*` | CMake 路径/生成器、构建根目录 (`build/<类型>`)、默认类型、并行任务、前端开关 |
| `deploy.*` | 实例列表、链接/覆盖策略、数据库初始化 |
| `service.*` | 启停列表、超时、日志、配置验证参数 |
| `protobuf.*` | protoc 路径与 C++/Lua/TS 输出路径 |
| `lua_bindings.*` `mysql_def.*` `config_table.*` | 各类代码生成路径 |
| `stress.*` | 压测协议、报告与界面状态文件 |
| `ui.*` | 主题与字体 |

- 扩展模块: 在 [config/script/modules](config/script/modules) 新建模块类, 注册到 `create_modules()` 即可.

## 构建

```bash
python auto.py --cli --module build --option build_type=debug --option build_mode=incremental
python auto.py --cli --module build --option build_type=release --option build_mode=clean
python auto.py --cli --module build --option webui_only=true   # 只构建前端
```

流程: CMake 配置 -> 编译 -> 打包可执行文件与运行库 -> 前端构建 -> 同步实例资源到 `debug/` 或 `release/`.

## 部署与启停

```bash
# 创建实例目录 + 配置 + 数据库
python auto.py --cli --module deploy
python auto.py --cli --module deploy --option instances=s2
python auto.py --cli --module deploy --option force=true          # 删除重建
python auto.py --cli --module deploy --option update_config=true  # 只更新配置

# 启停
python auto.py --cli --module start --option instances=s1
python auto.py --cli --module start_all
python auto.py --cli --module stop --option instances=s1
python auto.py --cli --module restart --option instances=s1
python auto.py --cli --module logs --option instance=s1 --option service=logicserver

# 数据库
python auto.py --cli --module reset_db --option instances=s2 --option assume_yes=true
```

实例目录结构 (以 s1 为例):

```text
<deploy_dir>/s1/
  gatewayserver.exe  logicserver.exe  dbserver.exe
  config/config.json          # 本实例差异, extends baseconfig.json
  config/baseconfig.json      # 公共骨架
  config/logicconfig/         # 逻辑服配置
  luascript/                  # Lua 脚本
  dist/                       # 网关前端资源
  runlog/                     # 进程日志与 pid
  log/                        # 按天轮转日志
```

- 实例清单: `s1` / `s2` (归属服+网关+数据服), `hub` (全局服), `cross` / `big_cross` (跨服).
- 已存在目录默认跳过; 数据库初始化只创建不存在的库, 清库使用 `reset_db`.
- 启动前自动同步可执行文件、`.pdb`、`lib/*.dll`、`config/logicconfig`、`luascript`、`client/webui/dist`.
- 普通服分区大小由 `service.zone_group_size` 控制, 默认 5.
- `stop` 默认同时关闭 Vite, 可用 `--option webui=false` 保留.
- 配置验证: `python auto.py --cli --module validate_config --option instance=s1`, 在 `<部署目录>/.validate/` 隔离启动一次 logicserver.
- 压测: `python auto.py --cli --module stress`, 场景在 [config/script/stress/scenarios.py](config/script/stress/scenarios.py) 注册.

## 开发工作流

### 协议 (Protobuf)

```
share/proto/*.proto
  -> python auto.py --cli --module protobuf
  -> share/protocol (C++) / luascript/proto (Lua) / client/webui/src/types/protobuf (TS)
```

改完 `.proto` 必须重新生成协议号常量与各语言代码.

存库数据,角色持久化数据,复用数据应尽量使用Protobuf结构.

### 配置表 (Luban)

```
config/配置表/*.xlsx
  -> python auto.py --cli --module config_table
  -> luascript/config (Lua) + config/logicconfig (JSON)
```

Luban 工具位于 [config/配置表/luban](config/配置表/luban), 配置为 `__luban__.conf`.

### 数据库

```
sql/xygame.sql       最新完整表结构 (基准)
sql/sql_change.sql   表结构变更 (新增/修改表写这里)
  -> python auto.py --cli --module mysql_def
  -> dbserver/db/mysqltabledef.hpp
```

### Lua

- [share/lua](share/lua): 通用 Lua 框架与 sol2 封装.
- [luascript](luascript): 业务脚本, 入口 `main.lua`
- C++  sol2 封装新接口后执行 `python auto.py --cli --module lua_bindings` 更新绑定声明, C++绑定函数全局导出在 `cppbindings.lua`.

## 配置体系

- [config/baseconfig.json](config/baseconfig.json) 是公共骨架, [config/crossconfig.json](config/crossconfig.json) 是实例清单 (名称/进程/端口/数据库).
- 实例配置用 `extends` 继承骨架, 对象递归合并, 数组和标量整体覆盖, 支持 `"extends": ["a.json","b.json"]`.
- `plugin.service` 声明进程身份后, 平铺的 `node/cluster/zone` 即该服务配置; 与 `services` 同时存在时 `services` 优先.
- `ListenIP` 为本进程监听标识, `ConnectIP` 为其它进程连接本进程的地址, 单机部署两者一致.
- 部署配置可在 GUI 或 `--module deploy_config` 中编辑, 保存前校验端口、`server_id`、库名与必填字段.

```json
"plugin": {
  "node": { "zone_id": 1, "instance_id": 1 },
  "cluster": { "enabled": false, "listen_port": 0, "peers": [] },
  "zone": { "enabled": false, "zones": [] },
  "merged_server_ids": [2, 3],
  "services": {
    "logicserver": { "node_type": 2, "server_id": 1, "instance_id": 1 }
  }
}
```

启用集群时: 全局服作为中心 (`cluster.enabled=true` + `listen_port`), 逻辑服 `peers` 填全局服节点, 所有节点使用相同 `auth_token`.

## 客户端接入

- 生产: 浏览器打开 `http://<网关IP>:<网关端口>/`, s1 默认 `38001`, 页面与 `/config/*`、`/api/servers`、`/ws` 均由网关提供.
- 选服: 网关从 `crossconfig.json` 筛出 `name` 以 `s` 开头的对外服, 返回 `{servers:[{name, server_id, ip, port}]}`.
- 开发: `npm run dev` 默认代理 `http://127.0.0.1:38001`, 可用 `VITE_GATEWAY_URL` 覆盖; 启服模块会自动指向所选网关.

## 框架分层

```text
share/module       基础设施: 日志 / 配置 / 定时器 / 网络 / WebSocket / 线程池 / 排行榜 / 模块生命周期
share/plugin       通用框架: 节点身份 / 集群 / 分区 / 跨服 / 场景AOI / 活动
各服务器目录         业务实现: 网关 / 数据 / 全局 / 逻辑 / 战斗
```

扩展新能力的约定:

1. 在 `share/plugin` 下新增独立组件, 不反向依赖具体服务器.
2. 由 `PluginHost` 按配置创建和启停, 未启用时不实例化、不占端口.
3. 跨节点通信注册独立 `CLUSTER_CHANNEL_CUSTOM + n` 通道.
4. 需要持久化时使用独立状态, 支持断点恢复.
5. 纯计算能力放 `share/module`, 通过 `ModuleManager` 注册, 参考 `ComputeModule`.

## 集群与跨服

- 节点身份: `PluginNodeId{zone_id, server_id, node_type, instance_id}`, 全局角色 id 为 `zone(16) | server(16) | role(32)`.
- `ClusterManager` 负责连接、握手、心跳、路由转发与 RPC; `ClusterRouter` 负责直连/中心转发/按分区选节点; `ZoneManager` 负责分区拓扑与跨服节点选择.
- 跨服组件: `CrossManager` (归属服打包快照、申请进场、下发票据、结算)、`CrossSceneService` (跨服分配场景、保存只读快照、回传结算)、`CrossDataQuery` (按 uid 中的归属服 RPC 查询).

权威边界:

| 事项 | 执行方 | 权威方 |
|---|---|---|
| 客户端连接与转发 | 网关 | - |
| 角色持久数据 (等级/背包/装备/货币) | 归属服 | 归属服 |
| 进跨服校验、快照、票据 | 归属服 | 归属服 |
| 场景位置/移动/AOI/伤害/技能结算 | 跨服 | 跨服 |
| 掉落/奖励/扣道具落库 | 归属服 | 归属服 |

进场流程: 归属服校验资格 -> RPC 向跨服申请名额 -> 跨服分配实例并返回票据 -> 归属服推送只读快照并冻结本地写入 -> 客户端带 token 直连跨服 -> 离场结算回归属服落库.

合服:

- 流程: 停服 -> 外部工具把源服数据导入目标库 -> 把旧服 id 写入 `plugin.merged_server_ids` -> 启动目标服.
- `PluginHost::Init` 自动装载重定向, 路由与分区查询遇到旧服 id 自动指向主服.
- 本进程 `node.server_id` 就是主服 id, `merged_server_ids` 只写被合掉的旧服 id.
- 保留源服 uid: `uid = server_id * 100000 + role_id`, 创角取最大值时按本服 uid 区间查询.
- 登录查库与账号列落库统一按 `用户名_s服务器id` 拼接(如 `abc_s1`), `role_data.username` / `role_login.user_name` 存带后缀的名字, `base_info.user_name` 与业务逻辑仍用原始账号名.

## 活动

`share/plugin/activity` 只负责活动开关, 具体玩法由继承 `IActivity` 实现.

- 状态机: `CLOSED -> PREPARE -> RUNNING -> SETTLE -> FINISHED`.
- 时间模式: `MANUAL` / `ABSOLUTE` / `OPEN_DAY` / `DAILY` / `WEEKLY` / `MONTHLY` / `WEEKDAY_RANGE`, 跨服活动只允许 `ABSOLUTE` 或循环模式.
- 持久化: 状态存 `activity_state` 表 (`server_id + config_id` 唯一), 变化后按间隔批量落库, 重启按 `config_id` 恢复.
- 配置表: `config/配置表/活动开关.xlsx` 导出 `activityconfig.json` 与 `activitytimeconfig.json`.
- 个人进度挂在 `PB_RoleData.growth.activity`, C++ 侧管理全局表与状态, Lua 侧 `GLO.ActivityData` 读写个人数据.

## 场景 / MMO / 战斗

- `SceneManager` / `Scene` / `AoiGrid`: 场景创建、实体归属、移动推进、九宫格视野, 不含玩法.
- `MmoWorld`: 场景内角色状态、移动推进、攻击与技能流程、死亡判定, 不写库; 数据以 `RoleModule` 为准.
- `GasBattleBridge`: 伤害计算交给 GAS (`AbilityManager` + `abilityconfig.json`), MMO 只负责扣血、死亡与广播.
- `ComputeModule`: 独立工作线程, 提供 A* 寻路、AOI 范围查询、AI 预算; 输入必须是只读快照, 结果通过 `PostMsg` 回主线程.
- 回合制按 `lineup` 出战, MMO 按 `base_info.hero_id` 出战

## 启动流程

```text
启动: main -> ModuleManager 注册 (Log/Timer/Network/Compute/ServerModule) -> Init -> Start -> RunMainLoop
初始化: ConfigManager -> PluginHost (装载合服重定向, 创建 Cluster/Zone/Scene) -> Lua 与数据库准备 -> Listen -> 连接 DB/Global
网络: IO 线程按 endpoint_id 分发 -> 客户端走 Server/MsgManager, 集群走 ClusterManager (握手/心跳/RPC)
关闭: Server.Stop -> ServerDataManager 落库 -> PluginHost.Stop -> Cluster.Stop -> LuaRuntime 关闭 -> ModuleManager 停止工作线程
```

## 编码规范

- 函数名/类名: 大驼峰 `MysqlConnectionPool`; 参数: snake_case `mysql_connection_pool`; 成员: `m_` + 名字 `m_conn`.
- 全局常量/宏/枚举成员: 全大写加下划线 `SERVER_ID_MAX`.
- 枚举使用裸 `enum`, 不用 `enum class`, 成员名自带类型前缀.
- 大括号另起新行 (Allman 风格), 注释统一 `//`.
- 中文注释使用英文标点.
- 存库数据,角色持久化数据,复用数据,协议结构应尽量使用Protobuf结构.
