## 项目结构

 CMakeLists.txt               # 根 CMake 构建脚本
 build.sh / rebuild.sh        # Linux 构建/打包脚本
 start.sh / stop.sh / restart.sh

 globalserver/                # 全局服务器 — 跨服数据与心跳
 gatewayserver/               # 网关服务器 — 客户端连接入口，消息转发
 logicserver/                 # 逻辑服务器 — 主业务服
 dbserver/                    # 数据库服务器
 share/                       # 共享库 — protobuf/module
 share/protobuf/              # protobuf 36.1 
 share/abseil/                # abseil
 share/proto/                 # .proto 定义

 client/webui/                # Web 管理面板 (React + TypeScript + Vite)
 client/agent/                # Python AI Agent (FastAPI + LLM Factory)

 config/                      # 服务器配置 — config.json / logicconfig / Luban 配置表
 config/shell                 # linux部署拷贝根目录 执行编译和启动关闭
 config/stress                # 简单压测
 sql/                         # 数据库表结构(SQL)

 lib/                         # 第三方预编译库
 include/                     # 第三方头文件
 luban-4.5.0/                 # Luban 配置表导出工具
 build/                       # CMake 构建输出目录


## 构建指南

### Windows (Visual Studio)

项目使用 CMake 或者 Visual Studio, 构建 build 目录

### Linux

config/shell 目录拷贝shell脚本到根目录

```bash
# Debug 增量构建
./build.sh debug

# Release 增量构建
./build.sh release

# 完全构建
./rebuild.sh debug

# 或直接指定构建模式
./build.sh debug clean
```

构建脚本会自动执行：CMake 配置 → 编译 → 打包可执行文件 + 资源配置到 `debug/` 或 `release/` 目录。


## 开发工作流

### 数据库 (dbserver)

```
sql/xygame.sql                   ← 最新完整表结构 (以此为基准)
sql/sql_change.sql               ← 表结构变更 SQL (新增/修改表时加这里)
     ↓
python generate_mysql_def.py      ← 自动生成 C++ 表字段映射
     ↓
dbserver/db/mysqltabledef.hpp  ← 生成的字段映射头文件
```

### 协议 (Protobuf)

```
share/proto/*.proto               ← 定义协议结构和协议号
     ↓
python generate_protobuf.py      ← 生成对应语言协议代码
```

### 配置表 (Luban)

```
config/配置表/*.xlsx              ← 编辑 Excel 配置表
     ↓
python config/配置表/_gen.py      ← 导出配置
```

### Lua 框架

```
share/lua/                        ← 通用 Lua 框架
share/lua/lua-5.5/                ← Lua 引擎源码
share/lua/lua-protobuf/           ← lua-protobuf
luascript/                        ← Lua 脚本
```

## 编码规范

- **函数名/类名**: 驼峰命名 `MysqlConnectionPool`
- **参数命名**: snake_case `mysql_connection_pool`
- **类成员变量**: `m_` + 驼峰 `m_conn`
- **宏/全局常量**: 全大写加下划线 `MYSQL_HEARTBEAT_OUT_TIME`
- **大括号**: 新行独立 (Allman 风格)
- **注释**: 统一使用 `//` 行注释
- **标点**: 中文注释也使用英文标点符号
