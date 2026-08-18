-- ====================================================================
--  Player基类
--  属性/能力直接用表存储
-- ====================================================================

local GLO = GLO 
local M = {}
local Utils = GLO.Utils
local Const = GLO.Const
local ConfigManager = GLO.ConfigManager

local Player = GLO.Class:Extend('Player')
M.Player = Player

-- 属性ID列表(不含 NONE=0,用于迭代)
local s_attr_id_list = {}
do
    for key, val in pairs(Const.Attr) do
        if type(val) == 'number' and val ~= 0 then
            s_attr_id_list[#s_attr_id_list + 1] = val
        end
    end
end

function Player:Ctor()
    self.player_id = 0
    self.player_type = Const.PlayerType.NONE
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
        local base = tonumber(base_map[attr_id]) or 0
        local growth = tonumber(growth_map[attr_id]) or 0
        attrs[attr_id] = base + (level - 1) * growth
    end
    return attrs
end

function Player:SetAttr(attr_id, value)
    self.attrs[attr_id] = value
end

function Player:GetAttr(attr_id)
    return self.attrs[attr_id] or 0
end

function Player:AddAbility(ability_id, level)
    self.abilities[ability_id] = {id = ability_id, level = level or 1}
end

function Player:GetAbilities()
    return self.abilities
end

function Player:GetHealth()
    return self.attrs[Const.Attr.HEALTH] or 0
end

function Player:GetMaxHealth()
    return self.attrs[Const.Attr.MAX_HEALTH] or 0
end

function Player:GetMana()
    return self.attrs[Const.Attr.MANA] or 0
end

function Player:GetMaxMana()
    return self.attrs[Const.Attr.MAX_MANA] or 0
end

function Player:IsAlive()
    return self:GetHealth() > 0
end

LOG_INFO(' Player 加载完成')
return M
