-- ====================================================================
--  Role模块
-- ====================================================================

local GLO = GLO
local M = {}
local Utils = GLO.Utils
local EventManager = GLO.EventManager
local Const = GLO.Const
local ConfigManager = GLO.ConfigManager
local Inventory = GLO.Inventory
local Protobuf = GLO.Protobuf
local MHT = GLO.MHT
local HeroModule = GLO.HeroModule

local Role = GLO.Class:Extend("Role")
M.Role = Role

-- 获取角色基础数据
function Role:GetRoleBaseData()
    return GLO.RoleManager.GetRoleBaseData(self.uid)
end

-- 获取角色Lua数据
function Role:GetLuaRoleData()
    return GLO.RoleManager.GetLuaRoleData(self.uid)
end

-- 计算等级所需经验
-- Role的经验曲线单独配置,独立于英雄
function M.CalculateRoleExpForLevel(level)
    -- Role等级经验使用固定曲线,后续可配置化
    return math.floor(100 * (1.5 ^ (level - 1)))
end

-- 获取等级奖励
function M.GetLevelReward(level)
    local configs = ConfigManager.herolevelconfig
    return configs[level]
end

-- ==================Role类==================

function Role:Ctor(uid, netid)
    -- 保存uid(唯一标识)
    self.uid = uid
    self.netid = netid
    self.name = "Unknown"
    self.level = 1
    self.in_battle_start_time = nil  -- 战斗开始时间戳(nil=不在战斗, 非nil=战斗中, 超时自动解除)
end

function Role:Init(uid)
    local base_info = self:GetRoleBaseData()
    local data = self:GetLuaRoleData()

    if not base_info or not data then
        LOG_ERROR("无法获取角色数据 uid:" .. tostring(uid))
        return false
    end

    self.name = base_info.name
    self.level = data.level or 1

    -- 初始化背包
    GLO.Inventory.InitInventory(self)
    -- 初始化任务
    GLO.Quest.InitQuest(self)
    -- 初始化英雄模块
    HeroModule.Init(self)

    return true
end

function Role:GetNetid()
    return self.netid
end

function Role:SetNetid(netid)
    self.netid = netid
end

-- ==================== Role经验/等级 ====================

-- 获取升级所需经验
function Role:GetExpToNextLevel()
    local data = self:GetLuaRoleData()
    if not data then
        return 0
    end
    return M.CalculateRoleExpForLevel(data.level)
end

-- 添加经验
function Role:AddExp(amount)
    local base_info = self:GetRoleBaseData()
    local data = self:GetLuaRoleData()
    if not base_info or not data then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(self.uid))
        return
    end

    data.exp = (data.exp or 0) + amount

    LOG_INFO("💫 %s 获得 %d 经验(角色等级)", base_info.name, amount)

    -- 检查升级
    local exp_to_next_level = self:GetExpToNextLevel()
    while data.exp >= exp_to_next_level do
        self:LevelUp()
        exp_to_next_level = self:GetExpToNextLevel()
    end
end

-- 升级
function Role:LevelUp()
    local base_info = self:GetRoleBaseData()
    local data = self:GetLuaRoleData()
    if not base_info or not data then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(self.uid))
        return
    end

    local exp_to_next_level = self:GetExpToNextLevel()
    data.exp = data.exp - exp_to_next_level
    data.level = data.level + 1

    LOG_INFO("🌟 %s 角色等级提升到 Lv.%d!",
        base_info.name, data.level)

    -- 检查等级奖励
    local reward_config = M.GetLevelReward(data.level)
    if reward_config then
        for _, item_data in ipairs(reward_config.level_rewards) do
            local id = item_data.id
            local num = item_data.num
            GLO.Inventory.AddItem(self, id, num)

            local item_config = GLO.Item.GetItemConfig(id)
            if item_config then
                LOG_INFO("🎁 升级奖励物品: " .. item_config.name)
            end
        end
    end

    -- 触发升级事件
    EventManager.TriggerEvent(EventManager.lua_OnRoleLevelUp, {
        role = self,
        new_level = data.level
    })
end

-- 检查是否可以装备
function Role:CanEquip(item_config)
    if not item_config then
        return false
    end

    local data = self:GetLuaRoleData()
    if not data then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(self.uid))
        return false
    end

    -- 检查等级需求
    if item_config.level and item_config.level > data.level then
        return false, "等级不足"
    end

    return true
end

-- ==================== 信息显示 ====================

-- 打印角色状态
function Role:PrintStatus()
    local base_info = self:GetRoleBaseData()
    local data = self:GetLuaRoleData()
    if not data or not base_info then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(self.uid))
        return
    end

    local exp_to_next_level = self:GetExpToNextLevel()

    LOG_INFO("=== %s (Lv.%d) ===", base_info.name, data.level)
    LOG_INFO("经验: %d/%d | 金币: %d",
        data.exp, exp_to_next_level, self:GetGold())

    -- 显示英雄信息
    local hero_count = HeroModule.GetHeroCount(self)
    LOG_INFO("拥有英雄数: %d", hero_count)

    -- 显示阵容信息
    local lineup_types = HeroModule.GetAllLineupTypes(self)
    for _, bt in ipairs(lineup_types) do
        local hero_ids = HeroModule.GetLineupHeroIds(self, bt)
        if hero_ids then
            LOG_INFO("阵容[%s]: %s", bt, table.concat(hero_ids, ","))
        end
    end

    -- 显示背包信息
    local used, max_slots = GLO.Inventory.GetCapacityInfo(self)
    LOG_INFO("背包: %d/%d", used, max_slots)

    -- 显示任务信息
    if GLO.Quest then
        local active_count = #GLO.Quest.GetActiveQuests(self)
        local quest_data = data.quest_data
        local completed_count = quest_data and #quest_data.completed_quests or 0
        LOG_INFO("任务: %d/%d (已完成: %d)",
            active_count,
            quest_data and quest_data.max_active or 0,
            completed_count)
    end
end

-- 便捷访问器(保持向后兼容)
function Role:GetUid()
    return self.uid
end

function Role:GetName()
    local base_info = self:GetRoleBaseData()
    return base_info and base_info.name or ""
end

function Role:GetUserName()
    local base_info = self:GetRoleBaseData()
    return base_info and base_info.user_name or ""
end

function Role:GetLevel()
    local data = self:GetLuaRoleData()
    return data and data.level or 1
end

function Role:GetExp()
    local data = self:GetLuaRoleData()
    return data and data.exp or 0
end

function Role:GetGold()
    return GLO.Inventory.GetItemCount(self, 1) or 0  -- 金币ID=1
end

-- ==================== 协议下发 ====================

function Role:SendRoleDataInfo()
    local base_info = self:GetRoleBaseData()
    local data = self:GetLuaRoleData()
    if not data or not base_info then
        LOG_ERROR("获取角色数据失败 uid:" .. tostring(self:GetUID()))
        return
    end

    -- 更新最后登录时间
    data.last_login_time = os.time()

    -- 发送登录返回(基础信息)
    Protobuf.SendMsg(self:GetNetid(), MHT.MHT_SYNC_ROLE_INFO_RET_SC,
    {
        role_base_info = base_info;
        server_id = 1;
    })

    LOG_INFO("玩家 %s 登录游戏"
        .. " last_login_time: %d"
        .. " netid: %d",
        base_info.name,
        data.last_login_time or 0,
        self:GetNetid())
end

-- ================= 注册事件监听器 ================

-- 角色登录事件(发送数据到客户端)
EventManager.RegisterListener(EventManager.cpp_OnRoleLogin, function(event_data)
    local uid = event_data.uid

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        return
    end

    role:SendRoleDataInfo()

end, EventManager.EVENT_PRIORITY_ROLE_LOGIN_BASE)

LOG_INFO("Role 加载完成")
return M
