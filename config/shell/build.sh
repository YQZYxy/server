#!/bin/sh

# 用法: ./build.sh [debug|release] [clean|incremental]
# 执行编译,输出可直接部署的 debug|release 目录
#   ./build.sh debug          # 增量编译 debug
#   ./build.sh release clean  # 完全编译 release
#   ./build.sh debug clean    # 完全编译 debug
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 解析构建参数
BUILD_TYPE="${1:-debug}"
BUILD_MODE="${2:-incremental}"

# 非合法模式时回退为增量
if [ "$BUILD_MODE" != "incremental" ] && [ "$BUILD_MODE" != "clean" ]; then
    BUILD_MODE="incremental"
fi

# ============================================================================
# 构建主逻辑
# 参数: $1 = build_mode (incremental|clean)
#       $2 = build_type (debug|release)
# ============================================================================
build_project()
{
    local BUILD_MODE="${1:-incremental}"
    local BUILD_TYPE="${2:-debug}"
    local SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

    # ========== 配置路径 ==========
    # 子项目列表 (提取可执行文件)
    local SUB_PROJECTS="globalserver gatewayserver logicserver dbserver"

    # 同步的资源路径 (源路径 -> 目标路径)
    # 配置文件
    local CONFIG_SRC="config/config.json"
    local CONFIG_DST="config/config.json"
    local LOGICCONFIG_SRC="config/logicconfig"
    local LOGICCONFIG_DST="config/logicconfig"

    # Lua 脚本
    local LUA_SRC="luascript"
    local LUA_DST="luascript"

    # 启动脚本列表
    local STARTUP_SCRIPTS="start.sh stop.sh restart.sh"

    # 前端构建
    local WEBUI_SRC="client/webui"
    local WEBUI_DIST="client/webui/dist"
    local WEBUI_DST="dist"
    # =====================================

    # 验证参数有效性
    if [ "$BUILD_TYPE" != "debug" ] && [ "$BUILD_TYPE" != "release" ]; then
        printf "\033[31m错误: 无效的构建类型 '%s',仅支持 debug 或 release\033[0m\n" "$BUILD_TYPE"
        exit 1
    fi
    if [ "$BUILD_MODE" != "incremental" ] && [ "$BUILD_MODE" != "clean" ]; then
        printf "\033[31m错误: 无效的构建模式 '%s'\033[0m\n" "$BUILD_MODE"
        exit 1
    fi

    # 构建目录和输出目录
    local BUILD_DIR="${SCRIPT_DIR}/build/${BUILD_TYPE}"
    local OUTPUT_DIR="${SCRIPT_DIR}/${BUILD_TYPE}"

    # 转换为 CMake 标准格式
    local CMAKE_BUILD_TYPE=""
    case "$BUILD_TYPE" in
        debug)   CMAKE_BUILD_TYPE="Debug" ;;
        release) CMAKE_BUILD_TYPE="Release" ;;
    esac

    local MODE_LABEL=""
    case "$BUILD_MODE" in
        incremental) MODE_LABEL="增量" ;;
        clean)       MODE_LABEL="完全" ;;
    esac

    print_footer "开始${MODE_LABEL}编译 ($BUILD_TYPE)"

    # 准备构建目录
    print_step "准备构建目录"
    if [ -d "$BUILD_DIR" ]; then
        if [ "$BUILD_MODE" = "clean" ]; then
            echo "  -> 完全删除构建目录: ${BUILD_DIR}"
            rm -rf "$BUILD_DIR"
            print_ok "构建目录已完全清理"
        else
            print_ok "构建目录已存在,保留现有文件 (增量编译)"
        fi
    else
        echo "  → 未找到 ${BUILD_DIR},将创建新目录"
    fi
    mkdir -p "$BUILD_DIR"
    cd "$BUILD_DIR"
    printf "  \033[32m 工作目录: \033[33m%s\033[0m\n" "$(pwd)"

    # CMake 配置
    print_step "配置项目"
    echo "  -> 运行 CMake 配置 (构建类型: $CMAKE_BUILD_TYPE)"
    printf "\033[90m---------------------------------------\033[0m\n"
    cmake -DCMAKE_BUILD_TYPE="$CMAKE_BUILD_TYPE" "$SCRIPT_DIR"
    local CMAKE_STATUS=$?
    printf "\033[90m---------------------------------------\033[0m\n"

    if [ "$CMAKE_STATUS" -eq 0 ]; then
        print_ok "CMake 配置成功"
    else
        printf "\033[31m   CMake 配置失败 (退出码: %d)\033[0m\n" "$CMAKE_STATUS"
        exit "$CMAKE_STATUS"
    fi

    # 编译
    print_step "编译项目"
    local CPU_CORES
    CPU_CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
    echo "  -> 开始编译 (使用 ${CPU_CORES} 个CPU核心)"
    echo "  -> 执行: cmake --build . -- -j${CPU_CORES}"
    printf "\033[90m---------------------------------------\033[0m\n"

    local START_TIME
    START_TIME=$(date +%s)
    cmake --build . -- -j"$CPU_CORES"
    local BUILD_STATUS=$?
    local END_TIME
    END_TIME=$(date +%s)
    local ELAPSED_TIME=$((END_TIME - START_TIME))

    printf "\033[90m---------------------------------------\033[0m\n"

    if [ "$BUILD_STATUS" -eq 0 ]; then
        print_ok "编译成功"
        echo "  → 总耗时: ${ELAPSED_TIME} 秒"
    else
        printf "\033[31m   编译失败 (退出码: %d)\033[0m\n" "$BUILD_STATUS"
        exit "$BUILD_STATUS"
    fi

    # 打包
    printf "\n\033[32m 打包可执行文件和资源...\033[0m\n"
    echo "  -> 输出目录: ${OUTPUT_DIR}"
    if ! mkdir -p "$OUTPUT_DIR"; then
        printf "\033[31m   创建输出目录失败: %s\033[0m\n" "$OUTPUT_DIR"
        exit 1
    fi
    local TARGET_ABS_PATH
    if ! TARGET_ABS_PATH="$(cd "$OUTPUT_DIR" 2>/dev/null && pwd)"; then
        printf "\033[31m   无法进入输出目录 (请检查目录权限): %s\033[0m\n" "$OUTPUT_DIR"
        exit 1
    fi

    # 提取可执行文件到根目录
    for proj in $SUB_PROJECTS; do
        local copied=""
        for candidate in \
            "${TARGET_ABS_PATH}/${proj}/${proj}" \
            "${TARGET_ABS_PATH}/${proj}/${proj}.exe" \
            "${TARGET_ABS_PATH}/${proj}" \
            "${TARGET_ABS_PATH}/${proj}.exe"; do
            [ -f "$candidate" ] || continue
            if [ "$candidate" = "${TARGET_ABS_PATH}/${proj}" ] || [ "$candidate" = "${TARGET_ABS_PATH}/${proj}.exe" ]; then
                print_ok "$(basename "$candidate")"
            else
                cp "$candidate" "${TARGET_ABS_PATH}/" && print_ok "$(basename "$candidate")"
            fi
            copied="1"
            break
        done
        if [ -z "$copied" ]; then
            print_warn "未找到可执行文件: ${proj}"
        fi
    done

    # 同步配置文件
    sync_file "${SCRIPT_DIR}/${CONFIG_SRC}" "${TARGET_ABS_PATH}/${CONFIG_DST}" "${CONFIG_SRC}"
    sync_dir "${SCRIPT_DIR}/${LOGICCONFIG_SRC}" "${TARGET_ABS_PATH}/${LOGICCONFIG_DST}" "${LOGICCONFIG_SRC}/"

    # 同步 Lua 脚本
    sync_dir "${SCRIPT_DIR}/${LUA_SRC}" "${TARGET_ABS_PATH}/${LUA_DST}" "${LUA_DST}/"

    # 同步启动脚本
    for script in $STARTUP_SCRIPTS; do
        if [ -f "${SCRIPT_DIR}/${script}" ]; then
            rm -f "${TARGET_ABS_PATH}/${script}"
            cp "${SCRIPT_DIR}/${script}" "${TARGET_ABS_PATH}/"
        fi
    done

    # 构建前端并同步
    if [ -d "${SCRIPT_DIR}/${WEBUI_SRC}" ]; then
        local WEBUI_LOG="${BUILD_DIR}/webui_build.log"
        local WEBUI_NEED_INSTALL=0

        # 全量编译必须重装依赖; 增量编译仅在 node_modules 缺失时补装
        if [ "$BUILD_MODE" = "clean" ]; then
            WEBUI_NEED_INSTALL=1
        elif [ ! -d "${SCRIPT_DIR}/${WEBUI_SRC}/node_modules" ]; then
            echo "  -> 未找到 node_modules, 将自动安装前端依赖"
            WEBUI_NEED_INSTALL=1
        fi

        if [ "$WEBUI_NEED_INSTALL" = "1" ]; then
            printf "  -> 安装前端依赖...\n"
            if (cd "${SCRIPT_DIR}/${WEBUI_SRC}" && npm install > "$WEBUI_LOG" 2>&1); then
                sed 's/^/    /' "$WEBUI_LOG"
            else
                sed 's/^/    /' "$WEBUI_LOG"
                printf "\033[31m   前端依赖安装失败 (请检查 node/npm 版本与网络)\033[0m\n"
                exit 1
            fi
        fi
        printf "  -> 构建前端...\n"
        if (cd "${SCRIPT_DIR}/${WEBUI_SRC}" && npm run build > "$WEBUI_LOG" 2>&1); then
            sed 's/^/    /' "$WEBUI_LOG"
        else
            sed 's/^/    /' "$WEBUI_LOG"
            printf "\033[31m   前端构建失败 (若提示 tsc/vite 缺失, 请先执行 npm install)\033[0m\n"
            exit 1
        fi
        sync_dir "${SCRIPT_DIR}/${WEBUI_DIST}" "${TARGET_ABS_PATH}/${WEBUI_DST}" "${WEBUI_DST}/"
    fi

    # 设置部署目录权限
    chmod -R u+rwX "${TARGET_ABS_PATH}/" 2>/dev/null || true
    print_ok "部署目录权限已设置"

    # 统计输出
    local deploy_size
    deploy_size=$(du -sh "$TARGET_ABS_PATH" 2>/dev/null | cut -f1)
    local deploy_count
    deploy_count=$(find "$TARGET_ABS_PATH" -type f 2>/dev/null | wc -l)

    print_footer "构建成功 ($BUILD_TYPE)" \
        "输出目录: ${TARGET_ABS_PATH}" \
        "总大小:   ${deploy_size:-未知}" \
        "文件数:   ${deploy_count}"
}


# 打印步骤标题: print_step "步骤号" "描述"
print_step() { printf "\n\033[32m[%s] %s...\033[0m\n" "$1" "$2"; }

# 打印成功项: print_ok "内容"
print_ok() { printf "  \033[32m\033[0m %s\n" "$1"; }

# 打印警告: print_warn "内容"
print_warn() { printf "  \033[33m⚠ %s\033[0m\n" "$1"; }

# 打印页脚: print_footer "标题" "行1" "行2" ...
print_footer()
{
    local title="$1"
    shift
    printf "\n\033[34m========================================\033[0m\n"
    printf "\033[34m%s\033[0m\n" "$title"
    for line in "$@"; do
        printf "\033[34m%s\033[0m\n" "$line"
    done
    printf "\033[34m========================================\033[0m\n"
}

# 同步目录: 先删目标目录再复制, 保证与源一致
# sync_dir <源目录> <目标目录> [显示标签]
sync_dir()
{
    local src="$1"
    local dst="$2"
    local label="${3:-}"
    if [ ! -d "$src" ]; then
        print_warn "跳过同步 源目录不存在: ${label:-$src}"
        return 0
    fi
    rm -rf "$dst"
    mkdir -p "$dst"
    cp -r "${src}/"* "$dst/" 2>/dev/null
    [ -n "$label" ] && print_ok "$label"
    return 0
}

# 同步文件: 先删目标文件再复制
# sync_file <源文件> <目标文件> [显示标签]
sync_file()
{
    local src="$1"
    local dst="$2"
    local label="${3:-}"
    if [ ! -f "$src" ]; then
        print_warn "跳过同步 源文件不存在: ${label:-$src}"
        return 0
    fi
    mkdir -p "$(dirname "$dst")"
    rm -f "$dst"
    cp "$src" "$dst"
    [ -n "$label" ] && print_ok "$label"
    return 0
}

# 执行编译 打包
build_project "$BUILD_MODE" "$BUILD_TYPE"