#!/bin/bash


echo "用法: $0 <server_type> [search_pattern] [date_pattern]"
echo "server_type: global | logic | lua | db "
echo "search_pattern: 可选，搜索模式，默认显示所有内容"
echo "date_pattern: 可选，日志文件日期部分，默认今天($(date +%Y%m%d)) \n"


# 处理服务器类型简写
server_type=$1
search_pattern=$2
date_pattern=${3:-$(date +%Y%m%d)}

case $server_type in
    db)
        server_type="dbserver"
        ;;
	global)
        server_type="globalserver"
        ;;
	logic)
        server_type="logicserver"
        ;;
    gateway)
        server_type="gatewayserver"
        ;;
    *)
		# 默认打印逻辑服
		server_type="logicserver"
        ;;
esac

# 构建日志文件路径和模式
# 实例根目录, 默认 debug, 可用 CONFIG 环境变量覆盖(支持相对仓库根或绝对路径)
instance_root="${CONFIG:-debug}"
if [ -d "./log/${server_type}" ]; then
    log_dir="./log/${server_type}"
else
    log_dir="${instance_root}/log/${server_type}"
fi
log_pattern="server${date_pattern}.log"

# 查找匹配的日志文件
log_files=$(find "$log_dir" -name "$log_pattern" 2>/dev/null)
if [ -z "$log_files" ]; then
    echo "错误: 未找到匹配的日志文件: $log_dir/$log_pattern"
    exit 1
fi

# 处理多个文件的情况
file_count=$(echo "$log_files" | wc -l)

if [ "$file_count" -gt 1 ]; then
    echo "找到多个日志文件:"
    i=1
    echo "$log_files" | while IFS= read -r file; do
        echo "  $i) $file"
        i=$((i+1))
    done
    read -p "请选择要监控的文件编号: " choice
    selected_file=$(echo "$log_files" | sed -n "${choice}p")
    if [ -z "$selected_file" ]; then
        echo "错误: 无效的选择"
        exit 1
    fi
else
    selected_file=$(echo "$log_files" | head -1)
fi

echo "开始监控: $selected_file \n"

# 处理搜索模式中的通配符
if [ -n "$search_pattern" ]; then
    # 如果搜索模式是"*"，则显示所有内容（不使用grep过滤）
    if [ "$search_pattern" = "*" ]; then
        tail -f -n 1000 "$selected_file"
    else
        tail -f -n 1000 "$selected_file" | grep --line-buffered -n -E -i "$search_pattern"
    fi
else
    tail -f -n 1000 "$selected_file"
fi