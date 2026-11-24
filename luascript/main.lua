-- ====================================================================
-- 主入口 加载所有模块
-- ====================================================================

-- 先初始化全局表（在设置保护之前）
GLO = {}
math.randomseed(os.time())

-- 调试模式检测
function IsDebug()
    return true
end


-- 声明允许的全局函数名（其他全局变量必须通过 GLO 表访问）
local _allowed_globals = {
    OnBeforeScriptReload = true,
    OnAfterScriptReload = true,
    InitGlobal = true,
    UpdateGlobal = true,
    ShutdownGlobal = true,
    LoadGlobalForMysql = true,
    OnMsgCallLogic = true,
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

-- 常量定义
GLO.GmDef = require("other.gm.gmdef")
GLO.ItemDef = require("other.knapsack.itemdef")
GLO.PlayerDef = require("other.player.playerdef")
GLO.MonsterDef = require("other.player.monsterdef")
GLO.TaskDef = require("other.task.taskdef")
GLO.RoleDef = require("other.role.roledef")
GLO.BattleDef = require("other.battle.battledef")
GLO.RankDef = require("manager.rankdef")
GLO.MmoWorldDef = require("other.mmoworld.mmoworlddef")

-- 加载配置
GLO.ConfigManager = require("config.configmanager")

-- 加载核心工具库
GLO.Utils = require("core.utils")
GLO.DirtyTracker = require("core.dirtytracker")
GLO.Class = require("core.class")
GLO.Serializer = require("core.serializer")
-- 协议
GLO.Protobuf = require("protocol.protobuf")
GLO.MHT = require("proto.protobufmht")

-- 加载系统级别管理器
GLO.EventManager = require("manager.eventmanager")
GLO.TimerManager = require("manager.timermanager")
GLO.MsgManager = require("protocol.msgmanager")
GLO.GlobalDataManager = require("manager.globaldatamanager")
GLO.RoleData = require("other.role.roledata")
GLO.RoleManager = require("other.role.rolemanager")
GLO.BattleManager = require("other.battle.battlemanager")
GLO.RankManager = require("manager.rankmanager")

-- ========== 加载游戏模块 ==========
GLO.Gm = require("other.gm.gm")
GLO.Item = require("other.knapsack.item")
GLO.Knapsack = require("other.knapsack.knapsack")
GLO.AutoUseItem = require("other.knapsack.autouseitem")
GLO.Task = require("other.task.task")
GLO.TaskObj = require("other.task.taskobj")
GLO.TaskEvent = require("other.task.taskevent")
GLO.GmTask = require("other.task.gmtask")
GLO.Player = require("other.player.player")
GLO.Hero = require("other.player.hero")
GLO.HeroModule = require("other.role.heromodule")
GLO.Lineup = require("other.role.lineup")
GLO.Role = require("other.role.role")
GLO.Monster = require("other.player.monster")
GLO.BattleModule = require("other.battle.battlemodule")
GLO.MainBattleModule = require("other.battle.mainfb.mainbattle")
GLO.MainBattleRank = require("other.battle.mainfb.mainbattlerank")
-- 角色数据快照工具
GLO.RoleBattleSnapshot = require("other.role.rolebattlesnapshot")
-- 竞技场
GLO.ArenaUser = require("other.arena.arenauser")
GLO.ArenaManager = require("other.arena.arenamanager")
GLO.ArenaBattleModule = require("other.battle.arena.arenabattle")
GLO.GmArena = require("other.arena.gmarena")
-- MMO 世界
GLO.MmoWorldModule = require("other.mmoworld.mmoworld")
GLO.MmoWorldRole = require("other.mmoworld.mmoworldrole")
-- 活动
GLO.ActivityData = require("other.activity.activitydata")
GLO.ActivityManager = require("other.activity.activitymanager")





-- ============== 初始化 ==============

GLO.AutoUseItem.Init(GLO.Knapsack)
GLO.TaskObj.Init(GLO.Task)
GLO.TaskEvent.Init(GLO.Task)
GLO.Lineup.Init(GLO.HeroModule)
GLO.MmoWorldModule.Init()
GLO.MmoWorldRole.Init()
GLO.ActivityManager.Init()

-- ============== C++调用全局函数 ==============

-- 热重载前
function OnBeforeScriptReload()
    LOG_INFO("lua热更开始...")

    -- 保存全局数据
    GLO.SaveGlobal()

end

-- 热重载后
function OnAfterScriptReload()

    LoadGlobalForMysql() -- 重新向数据库获取数据

    LOG_INFO("lua热更完毕")
end

-- 全局初始化 只会在C++加载脚本完成后调用一次
function InitGlobal()
    LOG_INFO("GLO 初始化开始")

    LOG_INFO("GLO 初始化完成")
end

-- 全局更新
function UpdateGlobal(delta_time)
    GLO.GlobalDataManager.Update(delta_time)
    
end

-- 关闭全局
function ShutdownGlobal()
    LOG_INFO("GLO 关闭开始")

    -- 保存全局数据
    GLO.SaveGlobal()

    LOG_INFO("GLO 关闭完成")
end

-- 数据库连接完成 开始加载
function LoadGlobalForMysql()
    LOG_INFO("GLO 开始从数据库加载")

    GLO.GlobalDataManager.Load() -- 加载全局数据

    -- 注册各业务的排行榜类型
    GLO.MainBattleRank.RegisterRankType()
    -- 初始化竞技场
    GLO.ArenaManager.Init()

end

function GLO.SaveGlobal()
    
    GLO.RoleData.Update(true) -- 回写所有未保存的角色数据
    GLO.GlobalDataManager.SaveForce() -- 保存全局数据
    GLO.RankManager.SaveAll()
    GLO.ArenaManager.SaveAllToDB()

    LOG_INFO("GLO 全局数据保存完成")
end

-- ============ 服务器网络回调 ============

-- C++协议回调
function OnMsgCallLogic(netid, msg_type, msg_str, uid)
    GLO.MsgManager.OnRecv(netid, msg_type, msg_str, uid)
end
