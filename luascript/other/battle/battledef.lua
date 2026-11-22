-- ====================================================================
-- 战斗相关常量定义
-- ====================================================================

local M = {}

-- 战斗副本模式
M.BattleType = {
    NONE = 0,           -- 无战斗
    MAIN_BATTLE = 1,    -- 主线副本
    ARENA = 2,          -- 竞技场
}

-- 战斗结果类型
M.BattleResultType = {
    NONE = 0,           -- 无结果
    VICTORY = 1,        -- 胜利
    DEFEAT = 2,         -- 失败
    TIME_OUT = 3,       -- 超时
    DRAW = 4            -- 平局
}

-- 胜利条件
M.VictoryCondition = {
    VICTORY_COND_NONE           = 0;    -- 胜利条件
    VICTORY_COND_DEFENDER_DEATH = 1;    -- 防守方全灭
    VICTORY_COND_ATTACKER_DEATH = 2;    -- 进攻方全灭
    VICTORY_COND_ELIMINATE_ALL  = 3;    -- 只剩一方存活
    VICTORY_COND_SURVIVE_TIME   = 4;    -- 防守方存活到时间结束
    VICTORY_COND_KILL_TARGET    = 5;    -- 击杀指定目标
    VICTORY_COND_SCORE_LIMIT    = 6;    -- 分数达到上限
}

-- 战斗模式
M.BattleMode = {
    NONE        = 0;
    TURN_BASED  = 1;   -- 回合制
    REALTIME    = 2;   -- 实时
}

-- 阵营
M.TeamSide = {
    NONE      = 0;
    ATTACKER  = 1;
    DEFENDER  = 2;
    NEUTRAL   = 3;
}

return M
