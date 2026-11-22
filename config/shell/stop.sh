#!/bin/sh

# 默认构建配置
CONFIG="debug"

# 检查是否有参数传入
if [ $# -gt 0 ]; then
    CONFIG="$1"
fi

# 验证配置参数(支持相对路径与绝对路径)
if [ ! -d "$CONFIG" ] && [ ! -d "$(dirname "$0")/$CONFIG" ]; then
    echo "提示：目录不存在，按部署目录处理: $CONFIG"
fi

echo "使用构建配置: $CONFIG"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "SCRIPT_DIR: $SCRIPT_DIR"

# 确定可执行文件目录
case "$CONFIG" in
    /*) CONFIG_DIR="$CONFIG" ;;
    *)  CONFIG_DIR="$SCRIPT_DIR/$CONFIG" ;;
esac
if [ -d "$CONFIG_DIR" ]; then
    # 项目根目录
    BUILD_DIR="$CONFIG_DIR"
else
    # 部署目录
    BUILD_DIR="$SCRIPT_DIR"
fi

# 切换到构建目录
cd "$BUILD_DIR" || { echo "cd到 $BUILD_DIR 失败"; exit 1; }
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
# 停止服务的函数
stop_service() {
	local service_name="$1"
	local service_path

	service_path="$(pwd)/$service_name"

	local pids=$(pgrep -f "$service_path")
	if [ -z "$pids" ]; then
		echo "$service_name 没有运行"
		return
	fi

	# 发信号停止
	for pid in $pids; do
		if kill -0 "$pid" 2>/dev/null; then
			kill "$pid"
			echo "$service_name 停止开始 (PID: $pid)"
		fi
	done

	# 等待进程实际退出 (最多 60 秒)
	local waited=0
	while [ $waited -lt 60 ]; do
		local alive=""
		for pid in $pids; do
			if kill -0 "$pid" 2>/dev/null; then
				alive="$alive $pid"
			fi
		done
		if [ -z "$alive" ]; then
			echo "$service_name 停止"
			return
		fi
		sleep 1
		waited=$((waited + 1))
	done

	# 超时未退出则强杀
	for pid in $pids; do
		if kill -0 "$pid" 2>/dev/null; then
			kill -9 "$pid" 2>/dev/null
			echo "$service_name 强制 killed (PID: $pid)"
		fi
	done
}


# 等待2秒确保依赖服保存完成
stop_service "gatewayserver"

stop_service "globalserver"

stop_service "logicserver"

stop_service "dbserver"
echo "所有服务停止成功."
# 删除锁文件
cleanup 0