-- ====================================================================
-- battleserver 战斗服 Lua 主入口
-- ====================================================================

LOG_INFO("========== Battleserver Lua 主入口加载开始 =========")

-- 先初始化全局表(在设置保护之前)
GLO = {}
math.randomseed(os.time())

-- 调试模式检测
function IsDebug()
    return true
end

-- 声明允许的全局函数名(其他全局变量必须通过 GLO 表访问)
local _allowed_globals = {
    OnBeforeScriptReload = true,
    OnAfterScriptReload = true,
    InitGlobal = true,
    UpdateGlobal = true,
    ShutdownGlobal = true,
}

-- 全局环境保护
do
    local __g = _G

    setmetatable(_G, {
        __newindex = function(_, name, value)
            -- 允许声明特定的全局函数
            if _allowed_globals[name] then
                rawset(__g, name, value)
                return
            end

            if debug and debug.traceback then
                LOG_ERROR(debug.traceback())
            end
            error(string.format("禁止设置全局变量，请使用 'GLO.%s' 或 'local'", name), 2)
        end,

        __index = function(_, name)
            local info = debug.getinfo(2, "S")
            if info and info.what ~= "main" and info.what ~= "C" then
                if debug and debug.traceback then
                    LOG_WARN(debug.traceback())
                end
                LOG_WARN("访问不存在的全局变量：" .. name)
            end
            return rawget(__g, name)
        end
    })
end

-- ===========全局命名空间==============

-- 加载核心工具库
GLO.Utils = require("core.utils")
GLO.DirtyTracker = require("core.dirtytracker")
GLO.Class = require("core.class")
GLO.Const = require("core.const")
GLO.Serializer = require("core.serializer")

-- 协议
GLO.Protobuf = require("protocol.protobuf")
GLO.MHT = require("proto.protobufmht")

-- 加载系统级别管理器
GLO.EventManager = require("manager.eventmanager")
GLO.TimerManager = require("manager.timermanager")
GLO.MsgManager = require("protocol.msgmanager")

-- 加载战斗核心模块(后续 battleserver 战斗逻辑在此扩展)
-- GLO.BattleManager = require("module.battle.battlemanager")

-- ============== C++调用全局函数 ==============

-- 热重载前
function OnBeforeScriptReload()
    LOG_INFO("battleserver lua热更开始...")
end

-- 热重载后
function OnAfterScriptReload()
    LOG_INFO("battleserver lua热更完毕")
end

-- 全局初始化 只会在C++加载脚本完成后调用一次
function InitGlobal()
    LOG_INFO("battleserver GLO 初始化开始")
    LOG_INFO("battleserver GLO 初始化完成")
end

-- 全局更新
function UpdateGlobal(delta_time)
    -- 战斗服全局更新逻辑(后续扩展)
end

-- 关闭全局
function ShutdownGlobal()
    LOG_INFO("battleserver GLO 关闭开始")
    LOG_INFO("battleserver GLO 关闭完成")
end

LOG_INFO("========== Battleserver Lua 主入口加载结束 =========")
