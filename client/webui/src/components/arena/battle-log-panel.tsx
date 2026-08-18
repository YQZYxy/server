//  竞技场战斗日志面板
//  显示最近的战斗记录,可回放战报

import { useCallback, useEffect, useRef } from 'react'
import { arenaStore } from '@/store/arena/arena-store'
import gameSocket from '@/services/socket'
import { MHT, BattleType } from '@/types'
import PanelShell from '@/components/panel-shell'
import { sendBattle } from '@/services/battle'
import type { P_ArenaBattleLog_SC } from '@/types'

interface BattleLogPanelProps {
  onClose: () => void
}

export default function BattleLogPanel({ onClose }: BattleLogPanelProps) {
  const battleLogs = arenaStore(s => s.battleLogs)
  const setBattleLogsData = arenaStore(s => s.setBattleLogsData)
  const mountedRef = useRef(false)

  // 挂载时请求战斗日志
  useEffect(() => {
    const handler = (data: P_ArenaBattleLog_SC) => {
      if (data.ret === 1) {
        setBattleLogsData(data)
      }
    }

    gameSocket.onMsg(MHT.MHT_ARENA_BATTLE_LOG_SC, handler)
    if (!mountedRef.current) {
      mountedRef.current = true
      gameSocket.sendMsg(MHT.MHT_ARENA_CS, { req_type: 3 })
    }

    return () => {
      gameSocket.offMsg(MHT.MHT_ARENA_BATTLE_LOG_SC, handler)
    }
  }, [setBattleLogsData])
  const scrollRef = useRef<HTMLDivElement>(null)

  // 回放战斗
  const handleReplay = useCallback((reportKey: string) => {
    sendBattle(BattleType.ARENA, 0, '', reportKey)
  }, [])

  // 倒序排列(最新在前)
  const sortedLogs = [...battleLogs].reverse()

  const formatTime = (timestamp: number): string => {
    const d = new Date(timestamp * 1000)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <PanelShell title="战斗记录" onClose={onClose}>
      <div className="arena-log-scroll" ref={scrollRef}>
        {sortedLogs.length === 0 ? (
          <div className="arena-empty-hint">暂无战斗记录</div>
        ) : (
          sortedLogs.map((log, idx) => (
            <div key={idx} className={`arena-log-item ${log.is_win ? 'arena-log-win' : 'arena-log-lose'}`}>
              <div className="arena-log-header">
                <span className="arena-log-time">{formatTime(log.time ?? 0)}</span>
                <span className={`arena-log-result ${log.is_win ? 'win' : 'lose'}`}>
                  {log.is_win ? '胜利' : '失败'}
                </span>
              </div>
              <div className="arena-log-body">
                <span className="arena-log-opponent">
                  对手: {log.opponent_name || `UID:${log.opponent_uid}`}
                </span>
                <span className={`arena-log-score ${(log.score_change || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(log.score_change ?? 0) >= 0 ? '+' : ''}{log.score_change ?? 0}分
                  <span className="arena-log-score-after"> ({log.score_after}分)</span>
                </span>
                <button
                  className="arena-log-replay-btn"
                  onClick={() => log.report_key && handleReplay(log.report_key)}
                  title="回放战斗"
                >
                  ▶ 回放
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PanelShell>
  )
}
