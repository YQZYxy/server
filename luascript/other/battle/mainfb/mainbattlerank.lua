-- ====================================================================
--  MainBattleRank 主线阵容战力排行榜
-- ====================================================================

local GLO = GLO
local M = {}
local BattleDef = GLO.BattleDef
local RankDef = GLO.RankDef

-- 注册主线战力排行榜类型
function M.RegisterRankType()
    GLO.RankManager.RegisterRankType(RankDef.RankType.MAIN_BATTLE, {
        page_size = 100,
        battle_type = BattleDef.BattleType.MAIN_BATTLE,
    })
end

-- 更新角色主线战力排行榜
-- @param role: 角色实例
function M.Update(role)
    if not role or not role.uid then
        return
    end

    -- 只读快照, 不深拷贝
    local snapshot = GLO.RoleBattleSnapshot.SnapshotRef(role)
    local total_power = GLO.RoleBattleSnapshot.CalcTeamPower(snapshot, BattleDef.BattleType.MAIN_BATTLE)

    local extra_data = {}
    if snapshot then
        extra_data.power = total_power
        extra_data.heroes = GLO.RoleBattleSnapshot.BuildProtoHeroDataList(snapshot, BattleDef.BattleType.MAIN_BATTLE)
    end

    GLO.RankManager.UpdateValue(RankDef.RankType.MAIN_BATTLE, role.uid, role:GetName() or "",
        total_power, nil, extra_data)
end

LOG_INFO(" MainBattleRank 加载完成")

return M
