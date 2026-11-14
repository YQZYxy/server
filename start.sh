#!/bin/sh

# 默认构建配置
CONFIG="debug"

# 检查是否有参数传入
if [ $# -gt 0 ]; then
    CONFIG="$1"
fi

# 验证配置参数
if [ "$CONFIG" != "debug" ] && [ "$CONFIG" != "release" ]; then
    echo "错误：配置必须是 'debug' 或 'release'，得到: $CONFIG"
    exit 1
fi

echo "使用构建配置: $CONFIG"

# 提升文件描述符上限 Linux 默认软限制 1024
FD_LIMIT=65535
ulimit -n "$FD_LIMIT" 2>/dev/null || ulimit -n "$(ulimit -Hn)" 2>/dev/null || true
echo "文件描述符上限: $(ulimit -n)"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "SCRIPT_DIR: $SCRIPT_DIR"

# 确定可执行文件目录
if [ -d "$SCRIPT_DIR/$CONFIG" ]; then
    # 项目根目录: 有 debug/release 子目录
    BUILD_DIR="$SCRIPT_DIR/$CONFIG"
else
    # 部署目录: 可执行文件直接在脚本同目录
    BUILD_DIR="$SCRIPT_DIR"
fi

# 切换到构建目录
cd "$BUILD_DIR" || { echo "cd到失败 $BUILD_DIR"; exit 1; }
echo "可执行文件路径: $(pwd)"

LOCK_FILE="server.lock"

# 创建锁文件防止并行启动
if [ -f "$LOCK_FILE" ]; then
    echo "错误：另一个启动操作已经在进行中"
    exit 1
fi
touch "$LOCK_FILE" || { echo "日志含义创建锁文件失败"; exit 1; }

# 清理函数
cleanup() {
    rm -f "$LOCK_FILE"
    exit $1
}

# 检查服务是否已运行
is_running() {
    local exe_path="$1"
    pgrep -f "$exe_path" >/dev/null
}

# 删除启动日志
rm -rf "runlog/"
mkdir -p "runlog/"

# 启动服务的函数
start_service() {
	local service_name="$1"
	local service_args="$2"
	local service_path="$(pwd)/$service_name"

	if is_running "$service_path"; then
		local pid=$(pgrep -f "$service_path")
		echo "$service_name 已在运行 (PID: $pid)"
	else
		echo "启动 $service_name..."
		if [ -n "$service_args" ]; then
			nohup "$service_path" "$service_args" >> "runlog/$service_name.log" 2>&1 &
		else
			nohup "$service_path" >> "runlog/$service_name.log" 2>&1 &
		fi
		echo "$service_name start (PID: $!)"
	fi
}


# 等待2秒确保依赖服启动完成
start_service "dbserver"

sleep 2
start_service "globalserver"

sleep 2
start_service "logicserver"

sleep 2
start_service "gatewayserver"

echo "所有服务启动成功."
# 删除锁文件
cleanup 0