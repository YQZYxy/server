// ============================================================
//  此文件由 _generate_protobuf.py 自动生成 请勿手动修改
//  来源: share/protobuf/*.proto
// ============================================================

// ==================== MHT 协议号常量 ====================

export const MHT = {
  MHT_SERVER_CONNECT_RESULT: 1,  // 网关→前端: 服务器连接结果 / 断线通知
  MHT_HEARTBEAT: 100,  // 服务器心跳
  MHT_SERVER_GLOBAL_DATA_C: 101,  // 服务器基础数据请求
  MHT_SERVER_GLOBAL_DATA_S: 102,  // 服务器基础数据返回
  MHT_GLOBAL_DATA_DB_C: 103,  // lua全局数据请求
  MHT_GLOBAL_DATA_DB_S: 104,  // lua全局数据返回
  MHT_ARENA_DB_C: 105,  // 竞技场数据库请求
  MHT_ARENA_DB_S: 106,  // 竞技场数据库返回
  MHT_RANK_DB_C: 107,  // 排行榜数据库请求
  MHT_RANK_DB_S: 108,  // 排行榜数据库返回
  MHT_LLM_CHAT_REQ: 110,  // LLM 聊天请求 (Gateway → Global)
  MHT_LLM_CHAT_RESPONSE: 111,  // LLM 聊天流式响应 (Global → Gateway)
  MHT_LLM_CHAT_DONE: 112,  // LLM 聊天完成通知 (Global → Gateway)
  MHT_LLM_MODELS_REQ: 113,  // LLM 模型列表请求 (Gateway → Global)
  MHT_LLM_MODELS_RES: 114,  // LLM 模型列表响应 (Global → Gateway)
  MHT_LLM_HEALTH_REQ: 115,  // LLM 健康检查请求 (Gateway → Global)
  MHT_LLM_HEALTH_RES: 116,  // LLM 健康检查响应 (Global → Gateway)
  MHT_SAVE_ROLE_DATA_C: 1000,  // 保存角色信息请求
  MHT_SAVE_ROLE_DATA_S: 1001,  // 保存角色信息返回
  MHT_INIT_ROLE_DATA_C: 1002,  // 初始化角色信息请求
  MHT_INIT_ROLE_DATA_S: 1003,  // 初始化角色信息返回
  MHT_SAVE_MULTIPLE_ROLE_DATA_C: 1004,  // 保存角色信息请求 PSAVEROLEDATA_C
  MHT_SAVE_MULTIPLE_ROLE_DATA_S: 1005,  // 保存角色信息返回 PSAVEROLEDATA_C
  MHT_INIT_MULTIPLE_ROLE_DATA_C: 1006,  // 初始化角色信息请求 PINITROLEDATA_C
  MHT_INIT_MULTIPLE_ROLE_DATA_S: 1007,  // 初始化角色信息返回 PINITROLEDATA_C
  MHT_CHAT_DB_C: 1008,  // 聊天数据库请求
  MHT_CHAT_DB_S: 1009,  // 聊天数据库返回
  MHT_BATTLE_SERVER_REGISTER: 20001,  // 战斗服注册
  MHT_BATTLE_SERVER_HEARTBEAT: 20002,  // 战斗服心跳
  MHT_BATTLE_SERVER_COMMAND: 20003,  // 战斗服cmd
  MHT_BATTLE_SERVER_STATUS: 20004,  // 战斗服状态
  MHT_BATTLE_SERVER_REGISTER_TOKEN_AND_ROLE_DATA: 20005,  // 向战斗服注册角色信息
  MHT_BATTLE_SAVE_ROLE_DATA: 20006,  // 战斗服保存角色信息
  MHT_BATTLE_KICK_OUT_ROLE: 20007,  // 战斗服提出玩家
  MHT_LOGIN_CS: 30001,  // 角色登录请求
  MHT_LOGIN_SC: 30002,  // 角色登录返回
  MHT_GM_CS: 30003,  // GM指令请求
  MHT_GM_SC: 30004,  // GM指令返回
  MHT_BATTLE_SERVER_CS: 30005,  // ue战斗服请求
  MHT_BATTLE_SERVER_SC: 30006,  // ue战斗服返回
  MHT_USER_HEARTBEAT: 30007,  // 角色心跳
  MHT_SYNC_ROLE_INFO_REQ_CS: 30008,  // 角色数据请求
  MHT_SYNC_ROLE_INFO_RET_SC: 30009,  // 角色登录返回
  MHT_CHAT_CS: 30010,  // 聊天请求
  MHT_CHAT_SC: 30011,  // 聊天返回
  MHT_GAS_BATTLE_CS: 30012,  // gas战斗cmd请求
  MHT_GAS_BATTLE_SC: 30013,  // gas战斗cmd返回
  MHT_SYNC_INVENTORY_DATA_SC: 30014,  // 背包数据同步
  MHT_SYNC_ROLE_EXTRA_DATA_SC: 30015,  // 角色额外数据同步
  MHT_SYNC_QUEST_DATA_SC: 30016,  // 任务数据同步
  MHT_SYNC_HERO_DATA_SC: 30017,  // 英雄数据同步
  MHT_SYNC_LINEUP_DATA_SC: 30018,  // 阵容数据同步
  MHT_SYNC_LINEUP_UPDATE_CS: 30019,  // 阵容变更请求
  MHT_RANK_CS: 30020,  // 通用排行榜请求
  MHT_RANK_SC: 30021,  // 通用排行榜返回
  MHT_ARENA_CS: 30022,  // 竞技场请求
  MHT_ARENA_SC: 30023,  // 竞技场返回
  MHT_ARENA_BATTLE_LOG_SC: 30024,  // 竞技场战斗日志返回
  MHT_ARENA_RANK_SC: 30025,  // 竞技场排行榜返回
} as const

// ==================== 消息类型映射 ====================

/** msg_type → 消息体类型名 */
export const PROTO_BODY_TYPE: Record<number, string> = {
  1: 'P_ServerConnectResult',
  100: 'P_DBHeartbeat',
  101: 'P_ServerlDataDb_C',
  102: 'P_ServerlDataDb_S',
  103: 'P_GlobalDataDb_C',
  104: 'P_GlobalDataDb_S',
  105: 'P_ArenaDb_C',
  106: 'P_ArenaDb_S',
  107: 'P_RankDb_C',
  108: 'P_RankDb_S',
  110: 'P_LlmChatReq',
  111: 'P_LlmChatResponse',
  112: 'P_LlmChatDone',
  113: 'P_LlmModelsReq',
  114: 'P_LlmModelsRes',
  115: 'P_LlmHealthReq',
  116: 'P_LlmHealthRes',
  1000: 'P_SaveRoleData_C',
  1001: 'P_SaveRoleData_S',
  1002: 'P_InitRoleData_C',
  1003: 'P_InitRoleData_S',
  1004: 'P_SaveMultipleRoleData_C',
  1005: 'P_SaveMultipleRoleData_S',
  1006: 'P_InitMultipleRoleData_C',
  1007: 'P_InitMultipleRoleData_S',
  1008: 'P_ChatDb_C',
  1009: 'P_ChatDb_S',
  20001: 'P_BattleServerRegister',
  20002: 'P_BattleServerHeartbeat',
  20003: 'P_BattleServerCommand',
  20004: 'P_BattleServerStatus',
  20005: 'P_BattleServerRegisterTokenAndRoleData',
  20006: 'P_BattleServerSaveRoleData',
  20007: 'P_BattleServerKickOutRole',
  30001: 'P_LoginReq_CS',
  30002: 'P_LoginReq_SC',
  30003: 'P_GM_CS',
  30004: 'P_GM_SC',
  30005: 'P_BattleServer_CS',
  30006: 'P_BattleServer_SC',
  30007: 'P_UserHeartbeat',
  30008: 'P_SyncRoleInfoReq_CS',
  30009: 'P_SyncRoleInfoRet_SC',
  30010: 'P_Chat_CS',
  30011: 'P_Chat_SC',
  30012: 'P_GasBattle_CS',
  30013: 'P_GasBattle_SC',
  30014: 'P_SyncInventoryData_SC',
  30015: 'P_SyncRoleExtraData_SC',
  30016: 'P_SyncQuestData_SC',
  30017: 'P_SyncHeroData_SC',
  30018: 'P_SyncLineupData_SC',
  30019: 'P_SyncLineupUpdate_CS',
  30020: 'P_Rank_CS',
  30021: 'P_Rank_SC',
  30022: 'P_Arena_CS',
  30023: 'P_Arena_SC',
  30024: 'P_ArenaBattleLog_SC',
  30025: 'P_ArenaRank_SC',
}

