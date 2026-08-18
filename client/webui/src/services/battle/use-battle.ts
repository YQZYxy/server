// ====================================================================
//  战斗模块
// ====================================================================

import { logParsedReport } from './replay-parser'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { gameStore } from '@/store/game-store'
import type { P_GasBattle_SC } from '@/types'

function bytesToString(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  const u8 = val instanceof Uint8Array ? val : new Uint8Array(val as number[])
  return new TextDecoder('utf-8').decode(u8)
}

// 外部模块回调 (模块在此注册,收到战报后回调)
const _battleCallbacks = new Set<(body: P_GasBattle_SC) => void>()

/** 注册战报回调(收到战报协议后调用,此时 body.battle_report 已转字符串) */
export function onBattleResult(cb: (body: P_GasBattle_SC) => void): () => void {
  _battleCallbacks.add(cb)
  return () => { _battleCallbacks.delete(cb) }
}

export function offBattleResult(cb: (body: P_GasBattle_SC) => void): void {
  _battleCallbacks.delete(cb)
}

// 路由跳转(收到战报后自动跳到 /battle-field)
let _navigate: ((path: string, options?: { state?: any }) => void) | null = null

// 注册导航函数(在 App 挂载时调用)
export function setBattleNavigate(fn: (path: string, options?: { state?: any }) => void) {
  _navigate = fn
}

// 最近一次战斗请求发送时刻, 计算响应耗时
let _battleSendTime = 0

// 向服务器发送战斗请求,统一入口
export function sendBattle(battleType: number, id: number, params = '', reportKey = '') {
  const isReplay = reportKey !== ''
  _battleSendTime = performance.now()
  console.log(`[Battle] 发送战斗请求: battle_type=${battleType}, id=${id}, t=${_battleSendTime.toFixed(2)}ms`)
  gameSocket.sendMsg(MHT.MHT_GAS_BATTLE_CS, {
    req_type: isReplay ? 1 : 0,
    battle_type: isReplay ? 0 : battleType,
    id,
    params,
    ...(isReplay ? { battle_report_key: reportKey } : {}),
  })
}

// 模块加载时直接注册,确保任何战斗响应都能被收到
gameSocket.onMsg(MHT.MHT_GAS_BATTLE_SC, (body: P_GasBattle_SC) => {
  const recvTime = performance.now()
  const costMs = _battleSendTime > 0 ? (recvTime - _battleSendTime).toFixed(2) : '?'
  console.log(`[Battle] 收到战报响应: t=${recvTime.toFixed(2)}ms, 距发送=${costMs}ms`)

  gameStore.getState().setLoading(false)

  const rawText = bytesToString(body.battle_report)
  ;(body as any).battle_report = rawText

  logParsedReport(rawText, '战报解析')

  // 先通知外部模块回调
  if(body.ret_type == 0)  // 1 战报回放不回调外部 0是战斗
  {
    _battleCallbacks.forEach(cb => cb(body))
  }

  // 跳转到战斗场景,通过route state传递战报数据
  _navigate?.('/battle-field', { state: { battleResult: body } })
})
