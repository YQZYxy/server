#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""编译打包模块.
Windows / Linux / macOS 
CMake 配置 -> 编译 -> 打包可执行文件与运行库 -> 构建前端 -> 同步实例资源
"""

import os
import shutil

from ..core.errors import ModuleError
from ..core.menu import Module, Option
from ..core.platform_utils import (
    EXE_SUFFIX,
    FindCMake,
    IS_WINDOWS,
    ProcessorCount,
    RemovePath,
    ResolveTool,
    RunStreaming,
)


class BuildModule(Module):
    """编译并打包服务器"""

    ID = "build"
    TITLE = "编译打包"
    DESCRIPTION = "CMake 配置/编译, 打包可执行文件, 运行库与前端资源"

    OPTIONS = (
        Option("build_type", "构建类型 (debug/release)", "choice",
               default_from="build.default_type",
               items=[("Debug", "debug"), ("Release", "release")]),
        Option("build_mode", "构建模式", "choice",
               default_from="build.default_mode",
               items=[("增量编译", "incremental"), ("完全重编", "clean")]),
        Option("webui_only", "只构建前端 (跳过服务端编译)", "bool", default=False),
        Option("jobs", "并行任务数 (0=自动)", "int",
               default_from="build.jobs"),
    )

    def Run(self, context, options):
        return BuildRunner(context, options).Run()


class BuildRunner(object):
    """编译打包流程"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options
        self.m_root = context.project_root
        self.m_build_type = options["build_type"]
        self.m_build_mode = options["build_mode"]

    def Run(self):
        console = self.m_console
        if self.m_build_type not in ("debug", "release"):
            raise ModuleError("构建类型只能是 debug 或 release: %s" % self.m_build_type)

        build_root = self.m_settings.Path("build.build_root")
        build_dir = os.path.join(build_root, self.m_build_type)
        output_root = self.m_settings.Path("build.output_root")
        output_dir = os.path.join(output_root, self.m_build_type)

        console.Line("  部署目录: %s" % output_dir)

        if bool(self.m_options["webui_only"]):
            self.BuildWebuiOnly(output_dir)
            return 0

        console.Line("  构建目录: %s" % build_dir)
        self.PrepareBuildDir(build_dir)
        self.Configure(build_dir)
        self.Compile(build_dir)
        self.Package(output_dir)

        # 完整构建默认包含前端, 只有 webui_only 才跳过服务端编译
        self.BuildWebui(output_dir)

        if self.m_settings.Require("build.sync_instances"):
            self.SyncInstances(output_dir)

        console.Success("  构建完成: %s (%s)" % (self.m_build_type, self.m_build_mode))
        return 0

    def BuildWebuiOnly(self, output_dir):
        """只构建前端, 跳过 CMake 配置, 编译和服务端打包"""
        self.m_console.Step("只构建前端")
        self.m_console.Line("  已跳过服务端编译与打包")
        os.makedirs(output_dir, exist_ok=True)
        self.BuildWebui(output_dir)

        if self.m_settings.Require("build.sync_instances"):
            self.SyncInstances(output_dir, webui_only=True)

        self.m_console.Success("  前端构建完成: %s" % output_dir)
        return 0

    def PrepareBuildDir(self, build_dir):
        """按构建模式准备目录"""
        if self.m_build_mode == "clean" and os.path.isdir(build_dir):
            self.m_console.Line("  清理构建目录: %s" % build_dir)
            RemovePath(build_dir)
        os.makedirs(build_dir, exist_ok=True)

    def Configure(self, build_dir):
        """执行 CMake 配置"""
        self.m_console.Step("配置项目")
        cmake = FindCMake(
            self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
        )
        build_type = "Debug" if self.m_build_type == "debug" else "Release"

        command = [
            cmake,
            "-S", self.m_root,
            "-B", build_dir,
            "-DCMAKE_BUILD_TYPE=%s" % build_type,
        ]

        generator = str(self.m_settings.Require("build.cmake_generator") or "").strip()
        env_generator = os.environ.get("CMAKE_GENERATOR", "").strip()
        if generator:
            command.extend(["-G", generator])
        if IS_WINDOWS:
            # Visual Studio 生成器需要指定架构; 其它生成器由环境自行决定
            effective_generator = generator or env_generator
            if effective_generator == "" or "Visual Studio" in effective_generator:
                command.extend(["-A", self.m_settings.Require("build.windows_arch")])

        code = RunStreaming(command, self.m_root, self.m_console)
        if code != 0:
            raise ModuleError("CMake 配置失败 (退出码 %d)" % code)

    def Compile(self, build_dir):
        """执行编译"""
        self.m_console.Step("编译项目")
        cmake = FindCMake(
            self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
        )
        jobs = ProcessorCount(self.m_options["jobs"])
        build_type = "Debug" if self.m_build_type == "debug" else "Release"
        command = [
            cmake,
            "--build", build_dir,
            "--config", build_type,
            "--parallel", str(jobs),
        ]
        self.m_console.Line("  使用 %d 个并行任务" % jobs)
        code = RunStreaming(command, self.m_root, self.m_console)
        if code != 0:
            raise ModuleError("编译失败 (退出码 %d)" % code)

    def Package(self, output_dir):
        """复制可执行文件与运行库到部署目录"""
        self.m_console.Step("打包可执行文件")
        os.makedirs(output_dir, exist_ok=True)

        sub_projects = self.m_settings.Get("build.sub_projects", list)
        if not sub_projects:
            raise ModuleError("build.sub_projects 必须是非空数组")

        copy_pdb = bool(self.m_settings.Require("deploy.copy_pdb"))
        copied = 0
        missing = []
        for project in sub_projects:
            source = self.FindExecutable(output_dir, str(project))
            if source is None:
                missing.append(str(project))
                continue
            target = os.path.join(output_dir, os.path.basename(source))
            if os.path.abspath(source) != os.path.abspath(target):
                shutil.copy2(source, target)
                self.m_console.Line("  %-24s copy" % os.path.basename(source))
                copied += 1
            else:
                self.m_console.Line("  %-24s ok" % os.path.basename(source))

            if copy_pdb:
                pdb_source = os.path.splitext(source)[0] + ".pdb"
                if os.path.isfile(pdb_source):
                    pdb_target = os.path.join(output_dir, os.path.basename(pdb_source))
                    if os.path.abspath(pdb_source) != os.path.abspath(pdb_target):
                        shutil.copy2(pdb_source, pdb_target)

        if missing:
            self.m_console.Warn("  警告: 未找到可执行文件: %s" % ", ".join(missing))

        self.CopyRuntimeLibs(output_dir)
        self.m_console.Success("  已处理 %d 个可执行文件" % copied)

    def FindExecutable(self, output_dir, project):
        """兼容 CMake 输出到子目录或根目录两种情况"""
        candidates = [
            os.path.join(output_dir, project, project + EXE_SUFFIX),
            os.path.join(output_dir, project, project),
            os.path.join(output_dir, project + EXE_SUFFIX),
            os.path.join(output_dir, project),
        ]
        for candidate in candidates:
            if os.path.isfile(candidate):
                return candidate
        return None

    def CopyRuntimeLibs(self, output_dir):
        """复制 lib 下的动态库"""
        lib_dir = self.m_settings.Path("paths.runtime_lib_dir", must_exist=True)
        if not os.path.isdir(lib_dir):
            return
        for name in sorted(os.listdir(lib_dir)):
            source = os.path.join(lib_dir, name)
            if not os.path.isfile(source):
                continue
            lower = name.lower()
            if not (
                lower.endswith(".dll")
                or lower.endswith(".so")
                or lower.endswith(".dylib")
                or ".so." in lower
            ):
                continue
            target = os.path.join(output_dir, name)
            if os.path.abspath(source) != os.path.abspath(target):
                shutil.copy2(source, target)
                self.m_console.Line("  %-24s copy" % name)

    def BuildWebui(self, output_dir):
        """构建前端并同步到实例目录"""
        webui_dir = self.m_settings.Path("paths.webui_dir", must_exist=True)
        dist_dir = self.m_settings.Path("paths.webui_dist")
        if not os.path.isdir(webui_dir):
            raise ModuleError("前端目录不存在: %s" % webui_dir)

        self.m_console.Step("构建前端")
        npm = ResolveTool(self.m_settings, "npm")
        need_install = False
        if self.m_build_mode == "clean" and self.m_settings.Require("build.webui_install_on_clean"):
            need_install = True
        if not os.path.isdir(os.path.join(webui_dir, "node_modules")):
            need_install = True

        if need_install:
            self.m_console.Line("  安装前端依赖 ...")
            code = RunStreaming([npm, "install"], webui_dir, self.m_console)
            if code != 0:
                raise ModuleError("前端依赖安装失败 (退出码 %d)" % code)

        self.m_console.Line("  构建前端 ...")
        code = RunStreaming([npm, "run", "build"], webui_dir, self.m_console)
        if code != 0:
            raise ModuleError("前端构建失败 (退出码 %d)" % code)

        if not os.path.isdir(dist_dir):
            raise ModuleError("前端构建完成但未找到产物目录: %s" % dist_dir)
        self.MirrorDirectory(dist_dir, os.path.join(output_dir, "dist"))
        self.m_console.Success("  前端产物已同步: %s" % output_dir)

    def SyncInstances(self, output_dir, webui_only=False):
        """把逻辑配置与前端产物同步到所有实例目录"""
        self.m_console.Step("同步实例资源")
        logic_dir = self.m_settings.Path("paths.logic_config_dir", must_exist=True)
        dist_dir = self.m_settings.Path("paths.webui_dist")

        count = 0
        for name in sorted(os.listdir(output_dir)):
            instance_dir = os.path.join(output_dir, name)
            if not os.path.isdir(instance_dir):
                continue
            if not os.path.isfile(os.path.join(instance_dir, "config", "config.json")):
                continue

            if not webui_only and os.path.isdir(logic_dir):
                self.MirrorDirectory(logic_dir, os.path.join(instance_dir, "config", "logicconfig"))
            if os.path.isdir(dist_dir):
                self.MirrorDirectory(dist_dir, os.path.join(instance_dir, "dist"))
            count += 1

        if count:
            self.m_console.Success("  实例资源已同步: %d 个" % count)
        else:
            self.m_console.Warn("  警告: 未发现实例目录, 请先运行创建服务器模块")

    def MirrorDirectory(self, source, target):
        """先删除目标再复制, 与源目录保持一致"""
        if not os.path.isdir(source):
            return
        RemovePath(target)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copytree(source, target)
