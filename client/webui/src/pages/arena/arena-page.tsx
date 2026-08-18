// ====================================================================
//  竞技场页面
// ====================================================================

import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import { arenaStore } from '@/store/arena/arena-store'
import gameSocket from '@/services/socket'
import { MHT, BattleType } from '@/types'
import type { P_Arena_SC } from '@/types'
import OpponentCardPanel from '@/components/arena/opponent-card-panel'
import OpponentDetailPanel from '@/components/arena/opponent-detail-panel'
import ArenaRankPanel from '@/components/arena/arena-rank-panel'
import BattleLogPanel from '@/components/arena/battle-log-panel'
import { onBattleResult, sendBattle } from '@/services/battle'

export default function ArenaPage() {
  const navigate = useNavigate()
  const score = arenaStore(s => s.score)
  const dailyChallengeCount = arenaStore(s => s.dailyChallengeCount)
  const dailyRefreshCount = arenaStore(s => s.dailyRefreshCount)
  const opponents = arenaStore(s => s.opponents)
  const showRank = arenaStore(s => s.showRank)
  const showOpponentDetail = arenaStore(s => s.showOpponentDetail)

  const setArenaInfo = arenaStore(s => s.setArenaInfo)
  const setOpponents = arenaStore(s => s.setOpponents)
  const setShowArena = arenaStore(s => s.setShowArena)
  const setShowRank = arenaStore(s => s.setShowRank)
  const setShowOpponentDetail = arenaStore(s => s.setShowOpponentDetail)

  const showBattleLog = arenaStore(s => s.showBattleLog)
  const setShowBattleLog = arenaStore(s => s.setShowBattleLog)
  const enterDoneRef = useRef(false)

  // 注册协议处理器 + 进入竞技场
  useEffect(() => {
    const arenaHandler = (body: P_Arena_SC) => {
      if (body.req_type === 1 && body.ret === 1) {
        setArenaInfo(body)
      } else if (body.req_type === 2 && body.ret === 1) {
        setOpponents(body.opponents || [])
        arenaStore.setState({ dailyRefreshCount: body.daily_refresh_count ?? 0 })
      }
    }

    gameSocket.onMsg(MHT.MHT_ARENA_SC, arenaHandler)

    // 注册竞技场战报回调
    const unsub = onBattleResult((body) => {
      if (body.battle_type !== BattleType.ARENA) return

      if (body.score_after !== undefined) {
        arenaStore.setState({ score: body.score_after! })
      }
      arenaStore.setState(s => ({
        dailyChallengeCount: (s as any).dailyChallengeCount + 1,
      }))
      arenaStore.setState({ showOpponentDetail: false })
    })

    // 首次挂载进入竞技场
    if (!enterDoneRef.current) {
      enterDoneRef.current = true
      gameSocket.sendMsg(MHT.MHT_ARENA_CS, { req_type: 1 })
    }

    return () => {
      gameSocket.offMsg(MHT.MHT_ARENA_SC, arenaHandler)
      unsub()
    }
  }, [setArenaInfo, setOpponents])

  // 计算剩余次数
  const maxChallenge = 5
  const maxRefresh = 3
  const remainingChallenges = Math.max(0, maxChallenge - dailyChallengeCount)
  const remainingRefresh = Math.max(0, maxRefresh - dailyRefreshCount)
  const maxDailyChallenge = 5

  // 刷新对手
  const handleRefresh = useCallback(() => {
    if (remainingRefresh <= 0) {
      gameStore.getState().showToast('免费刷新次数已用完', 'error')
      return
    }
    gameSocket.sendMsg(MHT.MHT_ARENA_CS, { req_type: 2 })
  }, [remainingRefresh])

  // 挑战对手
  const handleChallenge = useCallback((targetUid: number) => {
    if (remainingChallenges <= 0) {
      gameStore.getState().showToast('今日挑战次数已用完', 'error')
      return
    }
    sendBattle(BattleType.ARENA, targetUid)
  }, [remainingChallenges])

  // 返回战斗页面
  const handleBack = useCallback(() => {
    setShowArena(false)
    navigate('/battle')
  }, [navigate, setShowArena])

  return (
    <div className="arena-page">
      {/* ---- 顶部栏 ---- */}
      <div className="arena-topbar">
        <div className="arena-topbar-left">
          <button className="arena-back-btn" onClick={handleBack}>
            ← 返回
          </button>
        </div>
        <div className="arena-topbar-center">
          <h2>⚔️ 竞技场</h2>
        </div>
        <div className="arena-topbar-right">
          <div className="arena-score-display">
            <span className="arena-score-icon">🏆</span>
            <span className="arena-score-value">{score}</span>
          </div>
        </div>
      </div>

      {/* ---- 主体区域 ---- */}
      <div className="arena-body">
        {/* 左侧按钮区 */}
        <div className="arena-side left">
          <button
            className="arena-side-btn"
            onClick={() => setShowRank(true)}
          >
            <span className="arena-side-btn-icon">🏆</span>
            <span className="arena-side-btn-label">排行榜</span>
          </button>
          <button
            className="arena-side-btn"
            onClick={() => setShowBattleLog(true)}
          >
            <span className="arena-side-btn-icon">📜</span>
            <span className="arena-side-btn-label">记录</span>
          </button>
        </div>

        {/* 中间-对手列表 */}
        <div className="arena-center-area">
          <div className="arena-opponents-title">可挑战对手</div>
          <div className="arena-opponents-list">
            {Array.from({ length: 5 }, (_, i) => {
              const opp = opponents[i]
              return opp ? (
                <OpponentCardPanel
                  key={opp.uid}
                  opponent={opp}
                  onClick={(o) => arenaStore.getState().setShowOpponentDetail(o)}
                />
              ) : (
                <div key={`empty-${i}`} className="arena-opponent-card arena-opponent-empty">
                  <div className="arena-opponent-avatar">
                    <span className="arena-opponent-hero-icon">❓</span>
                  </div>
                  <div className="arena-opponent-info">
                    <div className="arena-opponent-name">无</div>
                    <div className="arena-opponent-detail">
                      <span>---</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 刷新按钮(固定在底部) */}
          <div className="arena-refresh-area">
            <div className="arena-refresh-count">剩余免费刷新: {remainingRefresh}次</div>
            <button
              className="arena-refresh-btn"
              onClick={handleRefresh}
              disabled={remainingRefresh <= 0}
            >
              🔄 刷新对手
            </button>
          </div>
        </div>

        {/* 右侧按钮区 */}
        <div className="arena-side right">
          <div className="arena-info-display">
            <div className="arena-info-item">
              <span>挑战次数</span>
              <span className="arena-info-value">{remainingChallenges}/{maxDailyChallenge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- 弹窗 ---- */}
      {showRank && <ArenaRankPanel onClose={() => setShowRank(false)} />}
      {showOpponentDetail && <OpponentDetailPanel onChallenge={handleChallenge} />}
      {showBattleLog && <BattleLogPanel onClose={() => setShowBattleLog(false)} />}
    </div>
  )
}
