-- ============================================================
--  此文件由 _generate_protobuf.py 自动生成 请勿手动修改
-- ============================================================

local M = {}

M.MHT_SERVER_CONNECT_RESULT = 1 -- P_ServerConnectResult 网关→前端: 服务器连接结果 / 断线通知
M.MHT_HEARTBEAT = 100 -- P_DBHeartbeat 服务器心跳
M.MHT_SERVER_GLOBAL_DATA_C = 101 -- P_ServerlDataDb_C 服务器基础数据请求
M.MHT_SERVER_GLOBAL_DATA_S = 102 -- P_ServerlDataDb_S 服务器基础数据返回
M.MHT_GLOBAL_DATA_DB_C = 103 -- P_GlobalDataDb_C lua全局数据请求
M.MHT_GLOBAL_DATA_DB_S = 104 -- P_GlobalDataDb_S lua全局数据返回
M.MHT_ARENA_DB_C = 105 -- P_ArenaDb_C 竞技场数据库请求
M.MHT_ARENA_DB_S = 106 -- P_ArenaDb_S 竞技场数据库返回
M.MHT_RANK_DB_C = 107 -- P_RankDb_C 排行榜数据库请求
M.MHT_RANK_DB_S = 108 -- P_RankDb_S 排行榜数据库返回
M.MHT_LLM_CHAT_REQ = 110 -- P_LlmChatReq LLM 聊天请求 (Gateway → Global)
M.MHT_LLM_CHAT_RESPONSE = 111 -- P_LlmChatResponse LLM 聊天流式响应 (Global → Gateway)
M.MHT_LLM_CHAT_DONE = 112 -- P_LlmChatDone LLM 聊天完成通知 (Global → Gateway)
M.MHT_LLM_MODELS_REQ = 113 -- P_LlmModelsReq LLM 模型列表请求 (Gateway → Global)
M.MHT_LLM_MODELS_RES = 114 -- P_LlmModelsRes LLM 模型列表响应 (Global → Gateway)
M.MHT_LLM_HEALTH_REQ = 115 -- P_LlmHealthReq LLM 健康检查请求 (Gateway → Global)
M.MHT_LLM_HEALTH_RES = 116 -- P_LlmHealthRes LLM 健康检查响应 (Global → Gateway)
M.MHT_SAVE_ROLE_DATA_C = 1000 -- P_SaveRoleData_C 保存角色信息请求
M.MHT_SAVE_ROLE_DATA_S = 1001 -- P_SaveRoleData_S 保存角色信息返回
M.MHT_INIT_ROLE_DATA_C = 1002 -- P_InitRoleData_C 初始化角色信息请求
M.MHT_INIT_ROLE_DATA_S = 1003 -- P_InitRoleData_S 初始化角色信息返回
M.MHT_SAVE_MULTIPLE_ROLE_DATA_C = 1004 -- P_SaveMultipleRoleData_C 保存角色信息请求 PSAVEROLEDATA_C
M.MHT_SAVE_MULTIPLE_ROLE_DATA_S = 1005 -- P_SaveMultipleRoleData_S 保存角色信息返回 PSAVEROLEDATA_C
M.MHT_INIT_MULTIPLE_ROLE_DATA_C = 1006 -- P_InitMultipleRoleData_C 初始化角色信息请求 PINITROLEDATA_C
M.MHT_INIT_MULTIPLE_ROLE_DATA_S = 1007 -- P_InitMultipleRoleData_S 初始化角色信息返回 PINITROLEDATA_C
M.MHT_CHAT_DB_C = 1008 -- P_ChatDb_C 聊天数据库请求
M.MHT_CHAT_DB_S = 1009 -- P_ChatDb_S 聊天数据库返回
M.MHT_BATTLE_SERVER_REGISTER = 20001 -- P_BattleServerRegister 战斗服注册
M.MHT_BATTLE_SERVER_HEARTBEAT = 20002 -- P_BattleServerHeartbeat 战斗服心跳
M.MHT_BATTLE_SERVER_COMMAND = 20003 -- P_BattleServerCommand 战斗服cmd
M.MHT_BATTLE_SERVER_STATUS = 20004 -- P_BattleServerStatus 战斗服状态
M.MHT_BATTLE_SERVER_REGISTER_TOKEN_AND_ROLE_DATA = 20005 -- P_BattleServerRegisterTokenAndRoleData 向战斗服注册角色信息
M.MHT_BATTLE_SAVE_ROLE_DATA = 20006 -- P_BattleServerSaveRoleData 战斗服保存角色信息
M.MHT_BATTLE_KICK_OUT_ROLE = 20007 -- P_BattleServerKickOutRole 战斗服提出玩家
M.MHT_LOGIN_CS = 30001 -- P_LoginReq_CS 角色登录请求
M.MHT_LOGIN_SC = 30002 -- P_LoginReq_SC 角色登录返回
M.MHT_GM_CS = 30003 -- P_GM_CS GM指令请求
M.MHT_GM_SC = 30004 -- P_GM_SC GM指令返回
M.MHT_BATTLE_SERVER_CS = 30005 -- P_BattleServer_CS ue战斗服请求
M.MHT_BATTLE_SERVER_SC = 30006 -- P_BattleServer_SC ue战斗服返回
M.MHT_USER_HEARTBEAT = 30007 -- P_UserHeartbeat 角色心跳
M.MHT_SYNC_ROLE_INFO_REQ_CS = 30008 -- P_SyncRoleInfoReq_CS 角色数据请求
M.MHT_SYNC_ROLE_INFO_RET_SC = 30009 -- P_SyncRoleInfoRet_SC 角色登录返回
M.MHT_CHAT_CS = 30010 -- P_Chat_CS 聊天请求
M.MHT_CHAT_SC = 30011 -- P_Chat_SC 聊天返回
M.MHT_GAS_BATTLE_CS = 30012 -- P_GasBattle_CS gas战斗cmd请求
M.MHT_GAS_BATTLE_SC = 30013 -- P_GasBattle_SC gas战斗cmd返回
M.MHT_SYNC_INVENTORY_DATA_SC = 30014 -- P_SyncInventoryData_SC 背包数据同步
M.MHT_SYNC_ROLE_EXTRA_DATA_SC = 30015 -- P_SyncRoleExtraData_SC 角色额外数据同步
M.MHT_SYNC_QUEST_DATA_SC = 30016 -- P_SyncQuestData_SC 任务数据同步
M.MHT_SYNC_HERO_DATA_SC = 30017 -- P_SyncHeroData_SC 英雄数据同步
M.MHT_SYNC_LINEUP_DATA_SC = 30018 -- P_SyncLineupData_SC 阵容数据同步
M.MHT_SYNC_LINEUP_UPDATE_CS = 30019 -- P_SyncLineupUpdate_CS 阵容变更请求
M.MHT_RANK_CS = 30020 -- P_Rank_CS 通用排行榜请求
M.MHT_RANK_SC = 30021 -- P_Rank_SC 通用排行榜返回
M.MHT_ARENA_CS = 30022 -- P_Arena_CS 竞技场请求
M.MHT_ARENA_SC = 30023 -- P_Arena_SC 竞技场返回
M.MHT_ARENA_BATTLE_LOG_SC = 30024 -- P_ArenaBattleLog_SC 竞技场战斗日志返回
M.MHT_ARENA_RANK_SC = 30025 -- P_ArenaRank_SC 竞技场排行榜返回
M.MHT_BATTLE_MSG_TYPE_MAX = 30000		-- 战斗服与外部协议分界

return M
