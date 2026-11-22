-- ====================================================================
--  Player基类
--  属性/能力直接用表存储
-- ====================================================================

local GLO = GLO 
local M = {}
local Utils = GLO.Utils
local PlayerDef = GLO.PlayerDef
local ConfigManager = GLO.ConfigManager

local Player = GLO.Class:Extend('Player')
M.Player = Player

-- 属性ID列表
local s_attr_id_list = {}
for attr_id = 0, PlayerDef.ATTR_MAX - 1 do
    s_attr_id_list[#s_attr_id_list + 1] = attr_id
end

function Player:Ctor()
    self.obj_id = 0
    self.obj_type = PlayerDef.ObjType.NONE
    self.name = 'Unknown'
    self.level = 1
    self.attrs = {}
    self.abilities = {}
    self.tags = {}
end

-- 计算属性(基类空实现,子类重写)
function Player:CalculateAttr()
    self.attrs = {}
end

-- 获取战力(属性值求和)
function Player:GetPower()
    local power = 0
    for _, val in pairs(self.attrs or {}) do
        power = power + math.floor(val)
    end
    return power
end

-- 静态工具: 从基值和成长计算最终属性
-- @param base_map: {[attr_id]=base_value}
-- @param growth_map: {[attr_id]=growth_value} 可为nil
-- @param level: 等级
-- @return attrs: {[attr_id]=final_value}
function M.CalculateAttrsFromConfig(base_map, growth_map, level)
    growth_map = growth_map or {}
    local attrs = {}
    for _, attr_id in ipairs(s_attr_id_list) do
        local base = tonumber(base_map[attr_id] or 0)
        local growth = tonumber(growth_map[attr_id] or 0)
        if base and growth then
            attrs[attr_id] = base + (level - 1) * growth
        end
    end
    return attrs
end

function Player:SetAttr(attr_id, value)
    self.attrs[attr_id] = value
end

function Player:GetAttr(attr_id)
    local value = self.attrs[attr_id]
    if value == nil then
        return 0
    end
    return value
end

function Player:AddAbility(ability_id, level)
    if not level or level <= 0 then
        LOG_ERROR("技能等级无效 ability_id=" .. tostring(ability_id))
    else
        self.abilities[ability_id] = {ability_id = ability_id, level = level}
    end
end

function Player:GetAbilities()
    return self.abilities
end

function Player:GetHealth()
    return self:GetAttr(PlayerDef.Attr.HEALTH)
end

function Player:GetMaxHealth()
    return self:GetAttr(PlayerDef.Attr.MAX_HEALTH)
end

function Player:GetMana()
    return self:GetAttr(PlayerDef.Attr.MANA)
end

function Player:GetMaxMana()
    return self:GetAttr(PlayerDef.Attr.MAX_MANA)
end

function Player:IsAlive()
    return self:GetHealth() > 0
end

LOG_INFO(' Player 加载完成')
return M
