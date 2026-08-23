// ====================================================================
//  战斗模块
// ====================================================================

import { logParsedReport } from './replay-parser'
import gameSocket from '@/services/socket'
import { MHT } from '@/types'
import { gameStore } from '@/store/game-store'
import type { P_GasBattle_SC, PB_BattleMatchResult } from '@/types'

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

// 系列战斗聚合结果
export interface BattleSeriesResult {
  sc: P_GasBattle_SC       // 合并下发的 SC
  total: number            // 总场次
  win: number              // 已获胜场数
  seriesResult: number     // 总结果: PB_BattleResultType(1=胜 2=负 4=平)
}

// 将 SC.matches[] 中各场战报字节串转字符串
function stringifyMatches(sc: P_GasBattle_SC): P_GasBattle_SC {
  const matches = ((sc as any).matches ?? []).map((m: any) => {
    logParsedReport(bytesToString(m.battle_report), '战报解析')
    return {
      ...m,
      battle_report: bytesToString(m.battle_report),
      battle_report_key: bytesToString(m.battle_report_key) || '',
    }
  })
  return { ...sc, matches } as P_GasBattle_SC
}

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

  // 1 战报回放不回调外部 0是战斗
  if (body.ret_type == 0) _battleCallbacks.forEach(cb => cb(body))

  // 战报统一从 matches 数组取(单场1个, 系列N个, 战报查询1个), 战报字节转字符串
  const sc = stringifyMatches(body)
  const matches = ((sc as any).matches ?? []) as PB_BattleMatchResult[]
  const total = sc.total_matches ?? matches.length

  // ---- 战报回放 / 单场: 只有 1 场----
  if (sc.ret_type == 1 || matches.length <= 1) {
    const single = matches.length > 0 ? matches[0] : null
    _navigate?.('/battle-field', { state: { battleResult: single } })
    return
  }

  // ---- 系列战斗总结果 ----
  const series: BattleSeriesResult = {
    sc,
    total,
    win: sc.win_matches ?? 0,
    seriesResult: sc.series_result ?? 0,
  }
  console.log(`[Battle] 系列战斗结果: total=${series.total}, win=${series.win}, result=${series.seriesResult}`)
  _navigate?.('/battle-field', { state: { battleSeries: series } })
})
