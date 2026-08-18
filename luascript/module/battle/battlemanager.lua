local GLO = GLO
local M = {}
local L ={}
local Const = GLO.Const
local Utils = GLO.Utils
local MsgManager = GLO.MsgManager
local MHT = GLO.MHT
local EventManager = GLO.EventManager
local Protobuf = GLO.Protobuf

-- 注册表: battle_type → 模块类
local s_module_class_map = {}

-- 实例缓存
local s_module_inst_map = {}

-- ==================== 注册与反注册 ====================

-- 注册战斗模块类
-- @param battle_type: Const.BattleType.xxx
-- @param module_class: 继承自BattleModule的类
function M.RegisterBattleModule(battle_type, module_class)
    if not battle_type or not module_class then
        LOG_ERROR("注册战斗模块失败 参数无效")
        return false
    end

    if s_module_class_map[battle_type] then
        LOG_WARN("战斗类型 %d 已被注册", battle_type)
        return false
    end

    s_module_class_map[battle_type] = module_class

    LOG_INFO("注册战斗模块: battle_type=%d, module=%s",
        battle_type, module_class.__class_name or "unknown")
    return true
end

-- 注销战斗模块类
function M.UnregisterBattleModule(battle_type)
    if s_module_class_map[battle_type] then
        s_module_class_map[battle_type] = nil
        s_module_inst_map[battle_type] = nil
        LOG_INFO("注销战斗模块: battle_type=%d", battle_type)
        return true
    end
    return false
end

-- ==================== 模块实例管理 ====================

-- 获取模块类
function M.GetModuleClass(battle_type)
    return s_module_class_map[battle_type]
end

-- 获取模块实例
function M.GetModuleInstance(battle_type)
    local module_inst = s_module_inst_map[battle_type]
    if not module_inst then
        local module_class = s_module_class_map[battle_type]
        if not module_class then
            LOG_ERROR("未注册的战斗类型: %d", battle_type)
            return nil
        end
        module_inst = module_class:New()
        s_module_inst_map[battle_type] = module_inst
    end
    return module_inst
end

-- 获取所有已注册的战斗类型列表
function M.GetRegisteredBattleTypes()
    local types = {}
    for id, cls in pairs(s_module_class_map) do
        table.insert(types, {id = id, name = cls.__class_name or "unknown"})
    end
    return types
end

-- ==================== 消息分发 ====================

L.REQ_TYPE_BATTLE = 0  -- 战斗
L.REQ_TYPE_REPLAY = 1  -- 战报

-- 处理战斗请求
function M.HandleBattleReq(netid, msg_data, role)
    if not role then
        LOG_ERROR("处理战斗请求失败: 无角色")
        return
    end
    if not msg_data then
        LOG_ERROR("战斗请求数据为空")
        return
    end

    if L.REQ_TYPE_BATTLE == msg_data.req_type then
        M.HandleBattleStart(role, msg_data)
        return
    end

    if L.REQ_TYPE_REPLAY == msg_data.req_type then
        M.HandleReplayQuery(netid, role, msg_data)
        return
    end

end

-- 查询历史战报
function M.HandleReplayQuery(netid, role, msg_data)
    local report_key = msg_data.battle_report_key or ""
    if report_key == "" then
        LOG_ERROR("历史战报查询缺少 report_key")
        return
    end
    Protobuf.SendBattleMsg(netid, MHT.MHT_BATTLE_EXECUTE_REQ, {
        uid = role.uid,
        report_key = report_key,
    })
end

-- 回合战斗状态超时(秒): 超过该时长未收到战斗结果, 视为战斗丢失, 解除占用
L.BATTLE_TIMEOUT = 3

-- 开始战斗
function M.HandleBattleStart(role, msg_data)
    local battle_type = msg_data.battle_type or 0
    local module_inst = M.GetModuleInstance(battle_type)
    if not module_inst then
        LOG_ERROR("战斗模块实例不存在或未注册: battle_type=%d", battle_type)
        return
    end

    -- 检查角色是否已在战斗中
    local start_time = role.in_battle_start_time
    if start_time then
        local now = Utils.GetServerTime()
        if now - start_time < L.BATTLE_TIMEOUT then
            LOG_WARN("角色已在战斗中,无法开始新战斗: uid=%d, name=%s", role:GetUid(), role:GetName())
            return
        end
        -- 旧战斗超时未回结果 解除占用
        LOG_WARN("战斗状态超时解除: uid=%d, name=%s", role:GetUid(), role:GetName())
        role.in_battle_start_time = nil
    end

    LOG_INFO("BattleManager分发战斗请求: uid=%s, name=%s, battle_type=%d, module=%s",
        role:GetUid(),role:GetName(), battle_type, module_inst.module_name or "未知战斗类型")

    -- 请求发送成功才标记进入战斗
    if module_inst:OnBattleReq(role, msg_data) then
        role.in_battle_start_time = Utils.GetServerTime()
    end
end


-- 注册协议处理器
MsgManager.RegisterMsg(MHT.MHT_GAS_BATTLE_CS, M.HandleBattleReq)

-- ==================== 战斗结果 ====================
EventManager.RegisterListener(EventManager.cpp_OnBattleResult, function(event)
    local uid = event.uid
    local battle_type = event.battle_type

    local role = GLO.RoleManager.GetRole(uid)
    if not role then
        LOG_WARN("角色不在线 uid=%d", uid)
        return
    end

    -- 解除角色战斗状态
    role.in_battle_start_time = nil

    local module_inst = M.GetModuleInstance(battle_type)
    if not module_inst then
        LOG_ERROR("模块实例不存在或未注册 type=%d", battle_type)
        return
    end

    LOG_INFO("BattleManager分发战斗结果: uid=%s, name=%s, battle_type=%d, module=%s",
        role:GetUid(),role:GetName(), battle_type, module_inst.module_name or "未知战斗类型")

    module_inst:OnBattleResult(role, event)
end)

LOG_INFO(" BattleManager 加载完成")
return M
