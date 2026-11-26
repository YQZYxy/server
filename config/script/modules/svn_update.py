#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SVN 更新模块.

默认更新当前项目根路径, 也可以选择 SVN 工作副本根路径或自定义目录.
更新前打印工作副本信息, 更新后打印版本变化与冲突文件.
"""

import os
from xml.etree import ElementTree

from ..core.errors import ConfigError, ModuleError
from ..core.menu import Module, Option
from ..core.platform_utils import (
    IS_WINDOWS,
    IsInteractiveStdin,
    ResolveTool,
    RunCaptured,
    RunStreaming,
)
from ..core.settings import LoadLocalState, LocalStatePath, write_json

# 默认 svn 命令, 可在 config.json 的 svn.executable 覆盖
DEFAULT_SVN_EXECUTABLE = "svn"

# SVN 凭据环境变量, 避免把密码写进配置或命令行
SVN_USERNAME_ENV = "SVN_USERNAME"
SVN_PASSWORD_ENV = "SVN_PASSWORD"

# svn 1.10 起支持 --password-from-stdin, 老版本只能回退到 --password
PASSWORD_STDIN_MIN_VERSION = (1, 10)

# svn 1.5 起支持 --config-option 临时覆盖配置项
CONFIG_OPTION_MIN_VERSION = (1, 5)

# svn --version --verbose 中表示可用凭据缓存后端的关键字
AUTH_CACHE_MARKERS = (
    "plaintext",
    "gnome keyring",
    "kwallet",
    "gpg-agent",
    "credential manager",
    "wincrypt",
)

# local.json 中保存 svn 凭据的节点名, 仅在 svn 自身缓存不可用时使用
LOCAL_SVN_AUTH_KEY = "svn_auth"

# 认证/证书失败的关键字, 用于失败后给出对应处理提示
AUTH_ERROR_KEYWORDS = (
    "authentication failed",
    "could not authenticate",
    "authorization failed",
    "e170013",
    "e215004",
    "e230001",
    "certificate verification failed",
)

# 进程内凭据缓存: svn 未开启凭据保存时, 同一次运行里不用反复输入
# 键为仓库 URL, 值为 {"username": ..., "password": ...}
CREDENTIAL_CACHE = {}

# svn 是否支持 --password-from-stdin, 按可执行文件缓存, 避免每次重试都查版本
PASSWORD_STDIN_SUPPORT = {}

# svn 版本号缓存, 键为可执行文件路径, 值为 (major, minor)
SVN_VERSION_CACHE = {}

# svn --version --verbose 输出缓存, 用于判断可用的凭据缓存后端
AUTH_CACHE_DETAIL = {}

# Windows 常见 svn 命令行安装位置
WINDOWS_SVN_CANDIDATES = (
    r"C:\Program Files\TortoiseSVN\bin\svn.exe",
    r"C:\Program Files (x86)\TortoiseSVN\bin\svn.exe",
    r"C:\Program Files\SlikSvn\bin\svn.exe",
)

# Linux/macOS 常见 svn 命令行安装位置, PATH 找不到时兜底
POSIX_SVN_CANDIDATES = (
    "/usr/bin/svn",
    "/usr/local/bin/svn",
    "/opt/homebrew/bin/svn",
)

# 更新范围
SCOPE_PROJECT = "project"
SCOPE_WC_ROOT = "wc_root"
SCOPE_CUSTOM = "custom"

# 更新范围选项: (显示名, 标识)
SCOPE_CHOICES = (
    ("当前项目根路径", SCOPE_PROJECT),
    ("SVN 工作副本根路径", SCOPE_WC_ROOT),
    ("自定义路径", SCOPE_CUSTOM),
)

# 冲突状态: C=内容冲突, !=文件缺失
CONFLICT_STATUS = ("C", "!")

# 冲突列表最多打印多少行
MAX_CONFLICT_LINES = 20


def FindSvn(settings):
    """查找 svn 命令行: 配置优先, 其次 PATH, 再查各平台常见安装位置"""
    configured = ""
    section = settings.data.get("svn")
    if isinstance(section, dict):
        configured = str(section.get("executable") or "").strip()

    candidates = list(WINDOWS_SVN_CANDIDATES if IS_WINDOWS else POSIX_SVN_CANDIDATES)
    try:
        return ResolveTool(settings, configured or DEFAULT_SVN_EXECUTABLE, candidates)
    except ModuleError as error:
        raise ModuleError(
            "%s\n  请安装 SVN 命令行, 或在 config.json 里配置 svn.executable" % error
        ) from error


def SvnSetting(settings, key):
    """读取可选的配置项 svn.<key>, 缺省返回空字符串

    svn 节点是可选的, 老部署目录的配置副本里可能没有, 这里不做强制校验.
    """
    section = settings.data.get("svn")
    if not isinstance(section, dict) or key not in section:
        return ""
    value = section.get(key)
    return "" if value is None else str(value).strip()


def SvnVersion(svn):
    """解析 svn 版本号为 (major, minor), 解析失败返回空元组"""
    cached = SVN_VERSION_CACHE.get(svn)
    if cached is not None:
        return cached

    version = ()
    code, output = RunCaptured([svn, "--version", "--quiet"])
    if code == 0:
        for token in output.split():
            parts = token.strip().lstrip("vV").split(".")
            if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                version = (int(parts[0]), int(parts[1]))
                break
    SVN_VERSION_CACHE[svn] = version
    return version


def SupportsPasswordFromStdin(svn):
    """svn 1.10 起支持 --password-from-stdin, 密码不必出现在命令行里"""
    cached = PASSWORD_STDIN_SUPPORT.get(svn)
    if cached is not None:
        return cached

    supported = SvnVersion(svn) >= PASSWORD_STDIN_MIN_VERSION
    PASSWORD_STDIN_SUPPORT[svn] = supported
    return supported


def AuthCacheDetail(svn):
    """读取 svn --version --verbose 的输出, 判断具体可用的缓存后端"""
    cached = AUTH_CACHE_DETAIL.get(svn)
    if cached is not None:
        return cached

    # 固定输出, 避免本地化文案导致关键字匹配失效
    env = dict(os.environ)
    env["LC_ALL"] = "C"
    env["LANG"] = "C"
    code, output = RunCaptured([svn, "--version", "--verbose"], env=env)
    detail = output.lower() if code == 0 else ""
    AUTH_CACHE_DETAIL[svn] = detail
    return detail


def SupportsAuthCache(svn):
    """svn 是否具备可用的凭据缓存后端, 决定能否依赖 svn 自己保存密码"""
    if SvnVersion(svn) < CONFIG_OPTION_MIN_VERSION:
        return False
    detail = AuthCacheDetail(svn)
    return any(marker in detail for marker in AUTH_CACHE_MARKERS)


def AuthCacheOptions(svn):
    """返回让 svn 自己保存凭据的 --config-option 参数, 不支持时返回空列表"""
    if not SupportsAuthCache(svn):
        return []

    # --config-option 必须带配置文件名前缀, config 指 ~/.subversion/config
    args = ["--config-option", "config:auth:store-auth-creds=yes"]
    if "plaintext" not in AuthCacheDetail(svn):
        # 只有加密后端时不强行指定, 交给 svn 自己的默认配置
        return args

    # 非交互模式下 svn 不会询问是否保存明文密码, 必须显式允许
    args.extend([
        "--config-option", "config:auth:store-plaintext-passwords=yes",
        "--config-option", "config:auth:password-stores=plaintext",
    ])
    return args


def LocalAuthPath(settings):
    """local.json 路径, 固定跟随基础配置, 不落到部署目录副本里"""
    return LocalStatePath(settings.base_config_file)


def LoadLocalSvnAuth(settings, key):
    """读取 local.json 中缓存的 svn 凭据, 没有记录时返回空字典"""
    if not key:
        return {}
    try:
        state = LoadLocalState(settings.base_config_file)
    except ConfigError:
        return {}

    node = state.get(LOCAL_SVN_AUTH_KEY)
    if not isinstance(node, dict):
        return {}
    entry = node.get(key)
    return entry if isinstance(entry, dict) else {}


def SaveLocalSvnAuth(settings, key, username, password):
    """把凭据写入 local.json, 仅在 svn 自身缓存不可用时调用"""
    if not key or not username:
        return False

    try:
        state = LoadLocalState(settings.base_config_file)
        node = state.get(LOCAL_SVN_AUTH_KEY)
        if not isinstance(node, dict):
            node = {}

        entry = {"username": username, "password": password}
        if node.get(key) == entry:
            return True

        node[key] = entry
        state[LOCAL_SVN_AUTH_KEY] = node
        path = LocalAuthPath(settings)
        write_json(path, state)
        RestrictFileMode(path)
        return True
    except (ConfigError, OSError):
        return False


def RemoveLocalSvnAuth(settings, key):
    """删除 local.json 中的旧凭据, svn 缓存生效后不再需要这份副本"""
    if not key:
        return
    try:
        state = LoadLocalState(settings.base_config_file)
    except ConfigError:
        return

    node = state.get(LOCAL_SVN_AUTH_KEY)
    if not isinstance(node, dict) or key not in node:
        return

    node.pop(key, None)
    if node:
        state[LOCAL_SVN_AUTH_KEY] = node
    else:
        state.pop(LOCAL_SVN_AUTH_KEY, None)
    try:
        write_json(LocalAuthPath(settings), state)
    except OSError:
        pass


def RestrictFileMode(path):
    """local.json 可能含有明文密码, 类 Unix 下收紧到仅本人可读写"""
    if IS_WINDOWS:
        return
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass


def ParseInfoXml(output):
    """解析 svn info --xml 输出, 兼容不支持 --show-item 的旧版 svn"""
    try:
        root = ElementTree.fromstring(output)
    except ElementTree.ParseError:
        return {}

    entry = root.find("entry")
    if entry is None:
        return {}

    result = {"revision": entry.get("revision", "")}
    wc_info = entry.find("wc-info")
    if wc_info is not None:
        node = wc_info.find("wcroot-abspath")
        if node is not None and node.text:
            result["wc-root"] = node.text.strip()
    for item in ("relative-url", "url"):
        node = entry.find(item)
        if node is not None and node.text:
            result[item] = node.text.strip()
    return result


class SvnUpdateModule(Module):
    """更新 SVN 工作副本"""

    ID = "svn_update"
    TITLE = "SVN 更新"
    DESCRIPTION = "更新当前根路径或指定目录的 SVN 工作副本, 输出版本变化与冲突"

    OPTIONS = (
        Option("scope", "更新范围", "choice", default=SCOPE_PROJECT, items=SCOPE_CHOICES),
        Option(
            "path", "自定义路径", "string",
            default="",
            help_text="更新范围为自定义路径时生效, 相对路径按项目根解析",
        ),
        Option(
            "revision", "目标版本", "string",
            default="HEAD",
            help_text="HEAD 表示更新到最新, 也可填具体版本号",
        ),
        Option(
            "username", "SVN 用户名", "string",
            default="",
            help_text="留空则读环境变量 %s, 其次 config.json 的 svn.username" % SVN_USERNAME_ENV,
        ),
        Option(
            "password", "SVN 密码", "string",
            default="",
            persist=False,
            secret=True,
            help_text="留空则读环境变量 %s (存在即生效, 空值表示空密码), 不写入配置" % SVN_PASSWORD_ENV,
        ),
        Option(
            "interactive", "允许 svn 交互提示 (证书等)", "bool",
            default=False,
            help_text="仅命令行终端有效; 账号密码由工具询问, 这里用于接受自签证书等提示",
        ),
    )

    def Run(self, context, options):
        return SvnUpdateRunner(context, options).Run()


class SvnUpdateRunner(object):
    """执行 svn info / svn update / svn status"""

    def __init__(self, context, options):
        self.m_context = context
        self.m_settings = context.settings
        self.m_console = context.console
        self.m_options = options
        self.m_svn = ""
        self.m_info_cache = {}
        self.m_stdin_text = None
        self.m_interactive = False

    def Run(self):
        self.m_svn = FindSvn(self.m_settings)
        path = self.ResolveTarget()
        if not os.path.isdir(path):
            raise ModuleError("更新路径不存在: %s" % path)

        wc_root = self.WorkingCopyRoot(path)
        if not wc_root:
            raise ModuleError("该路径不是 SVN 工作副本: %s" % path)

        before_revision = self.QueryInfo("revision", path)
        relative_url = self.QueryInfo("relative-url", path)
        key = self.CredentialKey(path)

        self.m_console.Step("SVN 更新")
        self.m_console.Line("  更新路径: %s" % path)
        self.m_console.Line("  工作副本根: %s" % wc_root)
        if relative_url:
            self.m_console.Line("  相对地址: %s" % relative_url)
        self.m_console.Line("  当前版本: %s" % (before_revision or "未知"))
        self.m_console.Line()

        command = self.BuildCommand(path, key)
        output_lines = []
        code = self.RunUpdate(command, output_lines)
        # 认证失败时问一次账号密码, 密码不回显, 成功后本次运行内复用
        if code != 0 and self.IsAuthFailure(output_lines) and self.CanAskCredentials():
            if self.AskCredentials(key):
                self.m_console.Line()
                command = self.BuildCommand(path, key)
                code = self.RunUpdate(command, output_lines)
        if code != 0:
            if self.IsAuthFailure(output_lines):
                self.ReportAuthHint()
            raise ModuleError("svn update 失败, 退出码 %d" % code)

        after_revision = self.QueryInfo("revision", path)
        self.m_console.Line()
        self.m_console.Success(
            "SVN 更新完成: %s -> %s"
            % (before_revision or "未知", after_revision or "未知")
        )
        self.RememberCredentials(key, path)
        self.ReportConflicts(path)
        return 0

    def RememberCredentials(self, key, path):
        """认证成功后处理凭据: svn 自己能缓存就不落文件, 否则写 local.json"""
        username, password = self.ResolveCredentials(key)
        if not username or password is None:
            # 没有显式凭据, 说明仓库本身允许匿名访问, 不需要保存
            return

        saved = LoadLocalSvnAuth(self.m_settings, key)
        # 已有同样记录说明 svn 缓存不可用, 不必每次成功都重复探测
        if saved == {"username": username, "password": password}:
            return

        if self.AuthCacheVerified(path):
            # svn 缓存已生效, 清掉可能过期的 local.json 副本
            RemoveLocalSvnAuth(self.m_settings, key)
            return

        if SaveLocalSvnAuth(self.m_settings, key, username, password):
            self.m_console.Line(
                "  凭据已保存到 %s (svn 未启用有效的凭据缓存)"
                % LocalAuthPath(self.m_settings)
            )

    def AuthCacheVerified(self, path):
        """确认 svn 已经保存了本次账号

        工作副本上的 svn info 只读本地记录, 不访问仓库, 必须带 -r HEAD 才会
        真正连服务器; 不带凭据也能成功才说明缓存已经生效.
        """
        if not SupportsAuthCache(self.m_svn):
            return False
        code, _ = RunCaptured(
            [self.m_svn, "info", "--non-interactive", "-r", "HEAD", path],
            cwd=path,
        )
        return code == 0

    def RunUpdate(self, command, output_lines):
        """执行 svn update, 输出行同时写入 output_lines 便于失败后判断"""
        del output_lines[:]
        return RunStreaming(
            command,
            self.m_settings.project_root,
            self.m_console,
            stdin_text=self.m_stdin_text,
            interactive=self.m_interactive,
            capture_lines=output_lines,
        )

    def CanAskCredentials(self):
        """GUI 用掩码弹窗询问, 命令行必须在真实终端下才问, 避免脚本卡住"""
        if self.m_context.is_cli:
            return IsInteractiveStdin()
        return True

    def CredentialKey(self, path):
        """凭据按仓库 URL 缓存, 拿不到 URL 时退回工作副本根"""
        return self.QueryInfo("url", path) or self.WorkingCopyRoot(path) or path

    def AskCredentials(self, key):
        """询问账号密码, 密码不回显, 成功后本次运行内复用"""
        current = self.ResolveCredentials(key)[0]
        self.m_console.Warn("  需要 SVN 账号密码, 用户名为空则跳过本次重试")
        username = str(self.m_console.Ask("SVN 用户名", current) or "").strip()
        if not username:
            return False
        password = self.m_console.AskSecret("SVN 密码 (%s, 空密码直接回车)" % username)
        if password is None:
            return False
        CREDENTIAL_CACHE[key] = {"username": username, "password": password}
        return True

    def BuildCommand(self, path, key=""):
        """拼装 svn update 命令, 按凭据与交互设置决定认证参数"""
        username, password = self.ResolveCredentials(key)
        self.m_interactive = self.ResolveInteractive()
        command = [self.m_svn, "update"]
        if not self.m_interactive:
            command.append("--non-interactive")
            # 非交互下 svn 不会询问是否保存密码, 显式打开凭据缓存
            command.extend(AuthCacheOptions(self.m_svn))
        if username:
            command.extend(["--username", username])

        # 密码走标准输入, 不出现在命令行和日志里; 空密码或老版本 svn 直接传参
        self.m_stdin_text = None
        if password is not None:
            if password == "" or not SupportsPasswordFromStdin(self.m_svn):
                command.extend(["--password", password])
            else:
                command.append("--password-from-stdin")
                self.m_stdin_text = password

        revision = str(self.m_options.get("revision") or "").strip()
        if revision and revision.upper() != "HEAD":
            command.extend(["-r", revision])
        command.append(path)
        return command

    def ResolveCredentials(self, key=""):
        """参数优先, 其次环境变量与配置, 再用 local.json 兜底, 最后本次运行缓存

        password 为 None 表示没有提供, 空字符串表示显式使用空密码.
        """
        cached = CREDENTIAL_CACHE.get(key, {})
        local = LoadLocalSvnAuth(self.m_settings, key)
        username = str(self.m_options.get("username") or "").strip()
        if not username:
            username = str(os.environ.get(SVN_USERNAME_ENV) or "").strip()
        if not username:
            username = SvnSetting(self.m_settings, "username")
        if not username:
            username = str(local.get("username") or "").strip()
        if not username:
            username = cached.get("username", "")

        password = str(self.m_options.get("password") or "")
        if password:
            return username, password

        # 环境变量存在即视为显式提供, 允许空值表示空密码
        env_password = os.environ.get(SVN_PASSWORD_ENV)
        if env_password is not None:
            return username, env_password

        # local.json 记录的密码跟随其用户名, 换账号后不沿用旧密码
        if "password" in local and str(local.get("username") or "") == username:
            return username, str(local.get("password") or "")

        if cached.get("username", "") == username and "password" in cached:
            return username, cached["password"]
        return username, None

    def ResolveInteractive(self):
        """交互输入只在命令行终端下有效, GUI 里 svn 等不到输入"""
        if not self.m_options.get("interactive"):
            return False
        if not self.m_context.is_cli or not IsInteractiveStdin():
            self.m_console.Warn(
                "  当前环境无法交互输入账号密码, 已改用 --non-interactive"
            )
            return False
        return True

    def IsAuthFailure(self, lines):
        """从 svn 输出里识别认证或证书失败"""
        for line in lines:
            lowered = line.lower()
            for keyword in AUTH_ERROR_KEYWORDS:
                if keyword in lowered:
                    return True
        return False

    def ReportAuthHint(self):
        """认证失败时给出可操作的解决方式"""
        self.m_console.Warn("  认证/证书校验未通过, 可选处理方式:")
        self.m_console.Line("    1. 重跑时按提示输入账号密码, 本次运行内会记住")
        self.m_console.Line(
            "    2. 设置环境变量 %s / %s (存在即生效, 空值表示空密码)"
            % (SVN_USERNAME_ENV, SVN_PASSWORD_ENV)
        )
        self.m_console.Line(
            "    3. 认证成功后工具会自动保存凭据: 优先交给 svn 缓存 (~/.subversion),"
            " 不支持时写入 config/script/local.json"
        )
        self.m_console.Line("    4. 需要接受自签证书时, 命令行勾选“允许 svn 交互提示 (证书等)”")

    def ResolveTarget(self):
        """按更新范围解析出要更新的目录"""
        scope = str(self.m_options.get("scope") or SCOPE_PROJECT)
        if scope == SCOPE_PROJECT:
            return self.m_settings.project_root
        if scope == SCOPE_WC_ROOT:
            wc_root = self.WorkingCopyRoot(self.m_settings.project_root)
            if not wc_root:
                raise ModuleError(
                    "当前项目根路径不在 SVN 工作副本中: %s" % self.m_settings.project_root
                )
            return wc_root
        if scope != SCOPE_CUSTOM:
            raise ModuleError("未知的更新范围: %s" % scope)

        raw = str(self.m_options.get("path") or "").strip()
        if not raw:
            raise ModuleError("更新范围为自定义路径时, 必须填写 path")
        if not os.path.isabs(raw):
            raw = os.path.join(self.m_settings.project_root, raw)
        return os.path.normpath(raw)

    def WorkingCopyRoot(self, path):
        """读取工作副本根目录, 不是工作副本时返回空字符串"""
        value = self.QueryInfo("wc-root", path)
        return os.path.normpath(value) if value else ""

    def QueryInfo(self, item, path):
        """读取 svn info 的单个字段, 失败返回空字符串

        优先用 svn 1.9+ 的 --show-item, 老版本回退到 --xml,
        兼容 Linux 发行版自带的 svn 1.7/1.8.
        """
        code, output = RunCaptured(
            [self.m_svn, "info", "--show-item", item, path],
            cwd=path,
        )
        if code == 0:
            lines = [line.strip() for line in output.splitlines() if line.strip()]
            if lines:
                return lines[-1]
        return self.InfoFromXml(item, path)

    def InfoFromXml(self, item, path):
        """解析 svn info --xml 结果, 同一路径只查一次"""
        cached = self.m_info_cache.get(path)
        if cached is None:
            code, output = RunCaptured([self.m_svn, "info", "--xml", path], cwd=path)
            cached = ParseInfoXml(output) if code == 0 else {}
            self.m_info_cache[path] = cached
        return cached.get(item, "")

    def ReportConflicts(self, path):
        """更新后检查状态, 有冲突或缺失文件时提示用户处理"""
        code, output = RunCaptured([self.m_svn, "status", path], cwd=path)
        if code != 0:
            return

        conflicts = [
            line for line in output.splitlines()
            if line[:1] in CONFLICT_STATUS
        ]
        if not conflicts:
            return

        self.m_console.Warn("  以下文件存在冲突或缺失, 请手动处理:")
        for line in conflicts[:MAX_CONFLICT_LINES]:
            self.m_console.Line("    %s" % line)
        if len(conflicts) > MAX_CONFLICT_LINES:
            self.m_console.Warn("    ... 其余 %d 项省略" % (len(conflicts) - MAX_CONFLICT_LINES))
