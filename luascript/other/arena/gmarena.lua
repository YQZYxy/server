-- ====================================================================
-- 竞技场GM
-- ====================================================================

local GLO = GLO
local M = {}

local Gm = GLO.Gm

-- 注册所有GM指令
function M.RegisterCommands()
    Gm.RegisterCommand("arena", "竞技场", M.Cmd_Arena)
end

-- 重置竞技场每日数据
-- 用法: arena <req_type>  req_type=1 时重置挑战和刷新次数
function M.Cmd_Arena(args, role)
    if #args < 1 then
        return false, "用法:arena <req_type>"
    end

    local uid = role:GetUid()
    local user = GLO.ArenaManager.GetArenaUser(uid)
    local req_type = tonumber(args[1])
    if 1 == req_type and user then
        user.daily_challenge_count = 0
        user.daily_refresh_count = 0
    end

    return true, "成功"
end

M.RegisterCommands()

LOG_INFO(" GmArena 加载完成")

return M
