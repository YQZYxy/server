-- ====================================================================
--  Monster - 怪物实体
-- ====================================================================

local GLO = GLO
local M = {}
local PlayerDef = GLO.PlayerDef
local MonsterDef = GLO.MonsterDef
local Player = GLO.Player
local ConfigManager = GLO.ConfigManager

local Monster = Player.Player:Extend('Monster')
M.Monster = Monster

function M.GetMonsterConfig(monster_id)
    return ConfigManager.monsterconfig[monster_id]
end

-- 怪物: 纯 base_attr,无成长
function Monster:CalculateAttr()
    local config = M.GetMonsterConfig(self.monster_id)
    local base_map = {}
    if config and config.base_attr then
        for attr_id, val in pairs(config.base_attr) do
            base_map[tonumber(attr_id)] = tonumber(val) or 0
        end
    end
    self.attrs = Player.CalculateAttrsFromConfig(base_map, nil, 1)
    -- 满血满蓝
    self.attrs[PlayerDef.Attr.MAX_HEALTH] = self.attrs[PlayerDef.Attr.HEALTH]
    self.attrs[PlayerDef.Attr.MAX_MANA] = self.attrs[PlayerDef.Attr.MANA]
end

function M.CreateMonster(monster_id)
    return Monster:New(monster_id)
end

function Monster:Ctor(monster_id)
    self:CallSuper('Ctor')
    local config = M.GetMonsterConfig(monster_id)
    if not config then return end

    self.obj_id = monster_id
    self.obj_type = PlayerDef.ObjType.MONSTER

    self.monster_id = config.monster_id
    self.name = config.name
    self.level = config.level
    self.monster_type = config.monster_type

    self:CalculateAttr()

    if config.abilities then
        for _, aid in ipairs(config.abilities) do self:AddAbility(aid, 1) end
    end

    if self.monster_type == MonsterDef.MonsterType.BOSS then
        self.tags['Monster.Boss'] = true
    end

end

function Monster:ScaleAttributes(scale)
    for attr_id, val in pairs(self.attrs or {}) do
        self.attrs[attr_id] = val * scale
    end
    -- 重新同步当前值
    self.attrs[PlayerDef.Attr.MAX_HEALTH] = self.attrs[PlayerDef.Attr.HEALTH]
    self.attrs[PlayerDef.Attr.MAX_MANA] = self.attrs[PlayerDef.Attr.MANA]
end

function Monster:SetLevel(level)
    self.level = level
    self:CalculateAttr()
end

LOG_INFO(' Monster 加载完成')
return M
