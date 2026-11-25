cmake_minimum_required(VERSION 3.16)

# MSVC 不应被当作 ASM 语言的编译器来处理
if(MSVC)
    cmake_policy(SET CMP0194 NEW)
endif()

project(Server LANGUAGES C CXX)

# 默认编译类型
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()

# 打印编译器信息
message(STATUS "CXX=${CMAKE_CXX_COMPILER}")
message(STATUS "CXX_COMPILER_ID=${CMAKE_CXX_COMPILER_ID}")

# 64 位构建检查
if(CMAKE_SIZEOF_VOID_P EQUAL 4)
    message(FATAL_ERROR "64位构建是必须的,当前是32位。请重新配置CMake时使用 -A x64 参数")
endif()

# 指定C/C++标准
set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 编译器检测和通用编译选项
if(MSVC)
    # MSVC (Visual Studio)
    add_compile_options(
        $<$<COMPILE_LANGUAGE:CXX>:/MP>
        $<$<COMPILE_LANGUAGE:CXX>:/W3>
        $<$<COMPILE_LANGUAGE:CXX>:/WX->
        $<$<COMPILE_LANGUAGE:CXX>:/utf-8>
        $<$<COMPILE_LANGUAGE:C>:/utf-8>
        $<$<COMPILE_LANGUAGE:CXX>:/bigobj>
        $<$<COMPILE_LANGUAGE:CXX>:/Qpar>
        $<$<COMPILE_LANGUAGE:CXX>:/GR>
        $<$<COMPILE_LANGUAGE:CXX>:/openmp>
    )
    # MSVC 屏蔽特定警告
    add_compile_options(
       $<$<COMPILE_LANGUAGE:CXX>:/wd4996>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4819>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4267>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4244>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4828>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4100>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4005>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4305>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4566>
       $<$<COMPILE_LANGUAGE:CXX>:/wd4702>
    )
    set(CMAKE_C_FLAGS_DEBUG   "${CMAKE_C_FLAGS_DEBUG} /Od /Zi")
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /Od /Zi")
    set(CMAKE_C_FLAGS_RELEASE   "${CMAKE_C_FLAGS_RELEASE} /O2")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /O2")

elseif(APPLE)
    add_compile_options(
        -Wall -Wextra
        -Wno-unused-parameter -Wno-unused-function
    )

elseif(MINGW OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    # MinGW / Clang (Windows / Linux)
    add_compile_options(
        -Wall -Wextra
        -Wno-unused-parameter -Wno-unused-function
        $<$<COMPILE_LANGUAGE:CXX>:-fopenmp>
    )

elseif(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    # GCC (Linux)
    add_compile_options(
        -Wall -Wextra -pedantic
        -Wno-error
        -Wno-unused-local-typedefs
        -Wno-unused-function
        -Wno-unused-parameter
        $<$<COMPILE_LANGUAGE:CXX>:-fopenmp>
    )
endif()

# 非 MSVC 平台的 Debug/Release 通用优化选项 (GCC/Clang/MinGW 一致)
if(NOT MSVC)
    set(CMAKE_C_FLAGS_DEBUG   "${CMAKE_C_FLAGS_DEBUG} -g -O0")
    set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -g -O0")
    set(CMAKE_C_FLAGS_RELEASE   "${CMAKE_C_FLAGS_RELEASE} -O2 -DNDEBUG")
    set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 -DNDEBUG")
endif()

# 第三方头文件目录
include_directories(
    ${PROJECT_SOURCE_DIR}
    ${PROJECT_SOURCE_DIR}/include
    ${PROJECT_SOURCE_DIR}/include/db
)

# 第三方库目录
link_directories(
    ${PROJECT_SOURCE_DIR}/lib
)

# 动态/静态链接选项
option(BUILD_SHARED_LIBS "使用动态链接库 (DLL)，OFF 则为静态链接" OFF)

# 可执行文件输出目录: 留空时输出到 <构建目录>/bin, 由脚本打包复制到部署目录
set(SERVER_OUTPUT_DIR "" CACHE PATH "可执行文件输出目录, 留空使用 <构建目录>/bin")
# 服务器运行目录: 留空时 Debug/Release 分别使用源码目录下的 debug/release
set(SERVER_DEPLOY_DIR "" CACHE PATH "服务器运行目录(VS 调试工作目录), 留空按配置使用 debug/release")

# 随程序分发的运行库
file(GLOB SERVER_RUNTIME_LIBS CONFIGURE_DEPENDS
    "${CMAKE_SOURCE_DIR}/lib/*.dll"
    "${CMAKE_SOURCE_DIR}/lib/*.so"
    "${CMAKE_SOURCE_DIR}/lib/*.dylib"
)

# 设置可执行文件输出目录
function(set_output_directory target_name)
    if(SERVER_OUTPUT_DIR)
        set(output_dir "${SERVER_OUTPUT_DIR}")
    else()
        set(output_dir "${CMAKE_BINARY_DIR}/bin")
    endif()
    # 各配置统一输出到同一目录, 避免多配置生成器再追加 Debug/Release 子目录
    set_target_properties(${target_name} PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${output_dir}"
        RUNTIME_OUTPUT_DIRECTORY_DEBUG "${output_dir}"
        RUNTIME_OUTPUT_DIRECTORY_RELEASE "${output_dir}"
    )
    if(SERVER_RUNTIME_LIBS)
        add_custom_command(TARGET ${target_name} POST_BUILD
            COMMAND ${CMAKE_COMMAND} -E copy_if_different
                ${SERVER_RUNTIME_LIBS}
                "$<TARGET_FILE_DIR:${target_name}>"
        )
    endif()
    if(MSVC)
        if(SERVER_DEPLOY_DIR)
            set(debugger_dir "${SERVER_DEPLOY_DIR}")
        else()
            set(debugger_dir "$<IF:$<CONFIG:Debug>,${CMAKE_SOURCE_DIR}/debug,${CMAKE_SOURCE_DIR}/release>")
        endif()
        set_target_properties(${target_name} PROPERTIES
            VS_DEBUGGER_WORKING_DIRECTORY "${debugger_dir}"
        )
    endif()
endfunction()

# Windows 通用编译配置
function(setup_windows_target target_name)
    target_compile_definitions(${target_name} PRIVATE
        WIN32 _WINDOWS _CONSOLE
        $<$<CONFIG:Release>:NDEBUG>
        _SCL_SECURE_NO_WARNINGS _CRT_SECURE_NO_WARNINGS
    )
    if(MSVC)
        target_link_options(${target_name} PRIVATE /STACK:16777216)
    endif()
endfunction()

# 链接基础库 (share + Threads + 平台系统库)
function(link_base_libs target_name)
    find_package(Threads REQUIRED)
    if(WIN32)
        target_link_libraries(${target_name}
            share
            Threads::Threads
        )
    elseif(UNIX AND NOT APPLE)
        target_compile_definitions(${target_name} PRIVATE __linux__)
        target_link_libraries(${target_name}
            share
            Threads::Threads
            rt
            dl
            m
        )
    elseif(APPLE)
        # macOS 没有独立的 rt 库, dl/m 已在系统 libSystem 中, 只需 share 与线程库
        target_link_libraries(${target_name}
            share
            Threads::Threads
        )
    endif()
endfunction()

# 收集源码并按代码目录生成 VS 文件夹树
macro(glob_sources VAR)
    file(GLOB_RECURSE ${VAR} CONFIGURE_DEPENDS "*.cpp" "*.c" "*.hpp" "*.h")
    source_group(TREE ${CMAKE_CURRENT_SOURCE_DIR} PREFIX "" FILES ${${VAR}})
endmacro()

# 服务器通用配置 (输出目录 + Windows 配置 + 基础库链接)
function(configure_server target_name)
    set_output_directory(${target_name})
    if(WIN32)
        setup_windows_target(${target_name})
    endif()
    link_base_libs(${target_name})
endfunction()

# 编译共享库
add_subdirectory(share EXCLUDE_FROM_ALL)

# 编译子项目
add_subdirectory(dbserver)
add_subdirectory(globalserver)
add_subdirectory(logicserver)
add_subdirectory(gatewayserver)

# 启用解决方案文件夹, CMake 标准目标 (ALL_BUILD/ZERO_CHECK/INSTALL) 自动收进 CMakePredefinedTargets
set_property(GLOBAL PROPERTY USE_FOLDERS ON)