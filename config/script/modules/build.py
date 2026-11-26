#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""编译打包模块.
Windows / Linux / macOS 
CMake 配置 -> 编译 -> 校验部署目录产物 -> 构建前端 -> 同步实例资源
"""

import filecmp
import json
import os
import shutil

from ..core.diagnostics import GccDiagnosticFilter
from ..core.errors import ModuleError
from ..core.menu import Module, Option
from ..core.platform_utils import (
    DetectDefaultGenerator,
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
    DESCRIPTION = "CMake 配置/编译, 校验部署目录产物, 构建前端资源"

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
        output_dir = self.m_settings.deploy_dir
        if not output_dir:
            raise ModuleError("尚未选择部署目录, 请先运行 python auto.py 选择")

        console.Line("  项目根目录: %s" % self.m_root)
        console.Line("  部署目录: %s" % output_dir)

        if bool(self.m_options["webui_only"]):
            self.BuildWebuiOnly(output_dir)
            return 0

        console.Line("  构建目录: %s" % build_dir)
        self.SyncPresets()
        self.PrepareBuildDir(build_dir)
        self.Configure(output_dir)
        self.Compile()
        self.Package(output_dir, build_dir)

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

    def SyncPresets(self):
        """按当前配置生成 CMakePresets.json

        presets 是派生文件, 唯一来源是 config.json 里的构建配置与 local.json 里的
        部署目录; 生成后 VS / VS Code / 脚本共用同一份, 保证构建目录与输出目录一致.
        """
        cmake = FindCMake(
            self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
        )
        generator = str(
            self.m_settings.Require("build.cmake_generator") or ""
        ).strip()
        if not generator:
            generator = DetectDefaultGenerator(cmake)
        if not generator:
            raise ModuleError(
                "无法确定 CMake 生成器, 请在 config.json 的 build.cmake_generator 中指定"
            )

        build_root = self.m_settings.Path("build.build_root")
        output_dir = self.m_settings.deploy_dir

        base = {
            "name": "base",
            "hidden": True,
            "description": "由 auto.py 生成, 请勿手工修改",
            "generator": generator,
            "cacheVariables": {
                "CMAKE_CXX_STANDARD": "17",
                "CMAKE_CXX_STANDARD_REQUIRED": "ON",
                "CMAKE_C_STANDARD": "11",
                "CMAKE_C_STANDARD_REQUIRED": "ON",
            },
        }
        # Visual Studio 生成器需要显式指定架构, 其它生成器由工具自行决定
        if IS_WINDOWS and "Visual Studio" in generator:
            base["architecture"] = self.m_settings.Require("build.windows_arch")

        # 全量构建目标的名字随生成器不同: Visual Studio / Xcode 是 ALL_BUILD, 其它是 all;
        # 显式写进 build preset, 避免 CMake Tools 的生成任务在未记录构建目标时回落到 all,
        all_target_name = None
        if "Visual Studio" in generator or "Xcode" in generator:
            all_target_name = "ALL_BUILD"

        configure_presets = [base]
        build_presets = []
        for build_type, configuration in (("debug", "Debug"), ("release", "Release")):
            configure_presets.append(
                {
                    "name": build_type,
                    "displayName": "%s 配置" % configuration,
                    "inherits": "base",
                    "binaryDir": self.PresetPath(os.path.join(build_root, build_type)),
                    "cacheVariables": {
                        "CMAKE_BUILD_TYPE": configuration,
                        # 可执行文件直接输出到部署目录
                        "SERVER_OUTPUT_DIR": self.PresetPath(output_dir),
                        "SERVER_DEPLOY_DIR": self.PresetPath(output_dir),
                    },
                }
            )
            build_preset = {
                "name": build_type,
                "displayName": "构建 %s" % configuration,
                "configurePreset": build_type,
                "configuration": configuration,
            }
            if all_target_name:
                build_preset["targets"] = [all_target_name]
            build_presets.append(build_preset)

        presets = {
            "version": 3,
            "cmakeMinimumRequired": {"major": 3, "minor": 16, "patch": 0},
            "configurePresets": configure_presets,
            "buildPresets": build_presets,
        }
        self.WriteFileIfChanged(
            os.path.join(self.m_root, "CMakePresets.json"),
            json.dumps(presets, indent=2, ensure_ascii=False) + "\n",
        )

    def PresetPath(self, path):
        """把路径转成 presets 里的写法, 项目内用 sourceDir 相对路径"""
        path = os.path.abspath(path)
        root = os.path.abspath(self.m_root)
        try:
            relative = os.path.relpath(path, root)
        except ValueError:
            relative = ""
        if relative and not relative.startswith(".."):
            return "${sourceDir}/" + relative.replace("\\", "/")
        return path.replace("\\", "/")

    def WriteFileIfChanged(self, path, text):
        """内容有变化才写文件, 避免每次构建都刷新时间戳"""
        old = ""
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as handle:
                old = handle.read()
        if old == text:
            return
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
        self.m_console.Line("  已更新 %s" % os.path.basename(path))

    def PrepareBuildDir(self, build_dir):
        """按构建模式准备目录"""
        if self.m_build_mode == "clean" and os.path.isdir(build_dir):
            self.m_console.Line("  清理构建目录: %s" % build_dir)
            RemovePath(build_dir)
        os.makedirs(build_dir, exist_ok=True)

    def Configure(self, output_dir):
        """执行 CMake 配置

        走脚本生成的 CMakePresets.json, 与 VS Code / VS 共用同一份生成器, 架构与
        构建目录; 部署目录再传一次, 保证 cache 始终跟随当前选择.
        """
        self.m_console.Step("配置项目")
        cmake = FindCMake(
            self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
        )

        command = [
            cmake,
            "--preset", self.m_build_type,
            "-DSERVER_OUTPUT_DIR=%s" % output_dir,
            # VS 调试工作目录跟随部署目录
            "-DSERVER_DEPLOY_DIR=%s" % output_dir,
        ]

        code = RunStreaming(command, self.m_root, self.m_console)
        if code != 0:
            raise ModuleError("CMake 配置失败 (退出码 %d)" % code)

    def Compile(self):
        """执行编译"""
        self.m_console.Step("编译项目")
        cmake = FindCMake(
            self.m_settings, str(self.m_settings.Require("build.cmake_executable"))
        )
        jobs = ProcessorCount(self.m_options["jobs"])
        command = [
            cmake,
            "--build", "--preset", self.m_build_type,
            "--parallel", str(jobs),
        ]
        self.m_console.Line("  使用 %d 个并行任务" % jobs)
        # 非 Windows 平台是 GCC / Clang, 一条警告会展开成十几行, 这里压缩
        line_filter = None if IS_WINDOWS else GccDiagnosticFilter()
        code = RunStreaming(
            command, self.m_root, self.m_console, line_filter=line_filter
        )
        if code != 0:
            raise ModuleError("编译失败 (退出码 %d)" % code)

    def Package(self, output_dir, build_dir):
        """校验部署目录里的可执行文件与运行库

        可执行文件由 CMake 直接输出到部署目录 (SERVER_OUTPUT_DIR), 正常情况下这里
        只做校验; 遇到未设置输出目录的旧构建则回退为从构建目录复制一次.
        """
        self.m_console.Step("检查打包产物")
        os.makedirs(output_dir, exist_ok=True)

        sub_projects = self.m_settings.Get("build.sub_projects", list)
        if not sub_projects:
            raise ModuleError("build.sub_projects 必须是非空数组")

        copy_pdb = bool(self.m_settings.Require("deploy.copy_pdb"))
        ready = 0
        missing = []
        for project in sub_projects:
            name = str(project)
            target = os.path.join(output_dir, name + EXE_SUFFIX)
            if os.path.isfile(target):
                self.m_console.Line("  %-24s ok" % os.path.basename(target))
                ready += 1
                continue

            # 兜底: 构建目录里还有产物时补拷一次, 兼容未走 CMakePresets 的旧构建
            source = self.FindExecutable(build_dir, name)
            if source is None:
                missing.append(name)
                continue
            self.m_console.Warn(
                "  %s 不在输出目录, 从构建目录补拷 (请检查 SERVER_OUTPUT_DIR)"
                % os.path.basename(target)
            )
            shutil.copy2(source, target)
            if copy_pdb:
                pdb_source = os.path.splitext(source)[0] + ".pdb"
                if os.path.isfile(pdb_source):
                    shutil.copy2(pdb_source, os.path.splitext(target)[0] + ".pdb")
            ready += 1

        if missing:
            self.m_console.Warn("  警告: 未找到可执行文件: %s" % ", ".join(missing))

        self.CopyRuntimeLibs(output_dir)
        self.WarnLegacyOutput(build_dir)
        self.m_console.Success("  已就绪 %d 个可执行文件" % ready)

    def WarnLegacyOutput(self, build_dir):
        """提示旧的输出目录 (build/<类型>/bin) 仍有可执行文件副本"""
        legacy_dir = os.path.join(build_dir, "bin")
        if not os.path.isdir(legacy_dir):
            return
        sub_projects = self.m_settings.Get("build.sub_projects", list) or []
        left = [
            str(name) for name in sub_projects
            if os.path.isfile(os.path.join(legacy_dir, str(name) + EXE_SUFFIX))
        ]
        if left:
            self.m_console.Warn(
                "  提示: 旧输出目录仍有产物 (%s), 可删除: %s"
                % (", ".join(left), legacy_dir)
            )

    def FindExecutable(self, build_dir, project):
        """在构建目录里查找可执行文件, 兼容多配置与自定义输出目录"""
        build_type = "Debug" if self.m_build_type == "debug" else "Release"
        names = (project + EXE_SUFFIX, project)
        candidates = []
        for root in (os.path.join(build_dir, "bin", build_type), os.path.join(build_dir, "bin")):
            for name in names:
                candidates.append(os.path.join(root, name))
        for candidate in candidates:
            if os.path.isfile(candidate):
                return candidate

        # 兜底: 递归查找, 兼容 CMake 默认的多配置输出布局
        found = []
        for root, _dirs, files in os.walk(build_dir):
            for name in names:
                if name in files:
                    found.append(os.path.join(root, name))
        if not found:
            return None
        found.sort(key=lambda path: os.path.getmtime(path), reverse=True)
        return found[0]

    def CopyRuntimeLibs(self, output_dir):
        """补齐 lib 下的动态库

        CMake 编译后会通过 POST_BUILD 复制到输出目录, 这里是兜底, 内容一致就跳过.
        """
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
            if os.path.abspath(source) == os.path.abspath(target):
                continue
            if os.path.isfile(target) and filecmp.cmp(source, target, shallow=True):
                continue
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
            self.m_console.Warn(
                "  提示: 未发现实例目录, 首次部署请在打包后运行创建服务器模块"
            )

    def MirrorDirectory(self, source, target):
        """先删除目标再复制, 与源目录保持一致"""
        if not os.path.isdir(source):
            return
        RemovePath(target)
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copytree(source, target)
