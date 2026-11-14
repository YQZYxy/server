#!/bin/sh

# 用法: ./rebuild.sh [debug|release]
# 清理旧构建缓存
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

BUILD_TYPE="${1:-debug}"

# 清理旧构建缓存
BUILD_DIR="${SCRIPT_DIR}/build/${BUILD_TYPE}"
if [ -d "$BUILD_DIR" ]; then
    echo "清理旧构建缓存: ${BUILD_DIR}"
    rm -rf "$BUILD_DIR"
fi

# 调用 build.sh 执行完全编译 
"${SCRIPT_DIR}/build.sh" "$BUILD_TYPE" clean