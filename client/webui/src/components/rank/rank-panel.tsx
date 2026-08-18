// ====================================================================
//  通用排行榜面板
// ====================================================================

import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { MHT, RANK_PAGE_SIZE, RankType } from '@/types'
import PanelShell from '@/components/panel-shell'
import HeroDetailPanel from '@/components/hero/hero-detail-panel'
import { LineupSlotListPanel } from '@/components/lineup/lineup-slot-list-panel'
import gameSocket from '@/services/socket'
import type { PB_HeroData } from '@/types'

export interface RankItemProps<T> {
  item: T
  rank: number
}

interface RankPanelProps<T> {
  /** 弹窗标题 */
  title: string
  /** 排行榜类型 */
  rankType: RankType
  /** 响应协议MHT号(默认MHT_RANK_SC,竞技场用MHT_ARENA_RANK_SC) */
  responseMsgId?: number
  /** 响应数据转换: 将协议响应转为标准数据结构 */
  transformResponse: (data: any) => { list: T[]; hasMore: boolean; total: number }
  /** 自定义渲染每一项 */
  renderItem: (props: RankItemProps<T>) => ReactNode
  /** 从排行项中提取阵容英雄(可选,有则支持点击查看阵容) */
  getHeroes?: (item: T) => PB_HeroData[] | undefined
  /** 关闭回调 */
  onClose?: () => void
  /** 为true时跳过PanelShell包裹(用于嵌入其他面板) */
  noShell?: boolean
}

export default function RankPanel<T>({
  title,
  rankType,
  responseMsgId,
  transformResponse,
  renderItem,
  getHeroes,
  onClose,
  noShell,
}: RankPanelProps<T>) {
  const [list, setList] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [displayCount, setDisplayCount] = useState(RANK_PAGE_SIZE)
  const scrollRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const initialDoneRef = useRef(false)

  // 阵容弹窗状态
  const [lineupItem, setLineupItem] = useState<T | null>(null)
  const [detailHero, setDetailHero] = useState<PB_HeroData | null>(null)

  // 可见列表
  const visibleList = list.slice(0, displayCount)
  const hasLocalMore = displayCount < list.length

  // 发送请求
  const fetchPage = useCallback((offset: number) => {
    setLoading(true)
    gameSocket.sendMsg(MHT.MHT_RANK_CS, { rank_type: rankType, rank_offset: offset })
  }, [rankType])

  // 监听响应 + 首次请求
  const msgId = responseMsgId ?? MHT.MHT_RANK_SC
  useEffect(() => {
    const handler = (data: any) => {
      const { list: newList, hasMore: more, total: t } = transformResponse(data)
      if (offsetRef.current === 0) {
        setList(newList)
      } else {
        setList(prev => [...prev, ...newList])
      }
      setHasMore(more)
      setTotal(t)
      offsetRef.current += newList.length
      setLoading(false)
    }

    gameSocket.onMsg(msgId, handler)

    if (!initialDoneRef.current) {
      initialDoneRef.current = true
      offsetRef.current = 0
      fetchPage(0)
    }

    return () => {
      gameSocket.offMsg(msgId, handler)
    }
  }, [msgId, fetchPage, transformResponse])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (loading) return
    fetchPage(offsetRef.current)
  }, [loading, fetchPage])

  // 滚动加载
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (!nearBottom) return

    if (hasLocalMore) {
      setDisplayCount(prev => Math.min(prev + RANK_PAGE_SIZE, list.length))
      return
    }

    if (!loading && hasMore) {
      handleLoadMore()
    }
  }, [hasLocalMore, hasMore, list.length, loading, handleLoadMore])

  // 获取排名字段
  const getItemRank = useCallback((item: T): number => {
    return (item as any).rank ?? (item as any).base?.rank ?? 0
  }, [])

  // 获取名字字段
  const getItemName = useCallback((item: T): string => {
    return (item as any).name || (item as any).base?.name || ''
  }, [])

  // 格式化排名
  const getRankDisplay = (rank: number): string => {
    if (rank <= 3) return ['🥇', '🥈', '🥉'][rank - 1]
    return `#${rank}`
  }

  // 英雄详情面板
  if (detailHero) {
    return <HeroDetailPanel hero={detailHero} onBack={() => setDetailHero(null)} />
  }

  // 阵容弹窗
  if (lineupItem && getHeroes) {
    const heroes = getHeroes(lineupItem)?.filter(h => h.hero_id) || []
    const totalPower = heroes.reduce((sum, h) => sum + (h.combat_power || 0), 0)
    const name = getItemName(lineupItem)
    return (
      <PanelShell title={`${name} - 阵容`} onClose={() => setLineupItem(null)}>
        <div className="arena-detail-content">
          <div className="arena-detail-header">
            <div className="arena-detail-avatar">🎭</div>
            <div className="arena-detail-basic">
              <div className="arena-detail-name">{name}</div>
              <div className="arena-detail-power">战力: {totalPower.toLocaleString()}</div>
            </div>
          </div>
          <div className="arena-detail-section">
            <h4>阵容英雄 ({heroes.length})</h4>
            <LineupSlotListPanel heroes={heroes} onHeroClick={(h) => setDetailHero(h)} />
          </div>
        </div>
      </PanelShell>
    )
  }

  const panelTitle = `${title} (共${total}人)`

  const content = (
    <div
      className="rank-scroll"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {list.length === 0 ? (
        <div className="rank-empty-hint">暂无排行榜数据</div>
      ) : (
        <div className="rank-list">
          {visibleList.map((item, idx) => {
            const itemRank = getItemRank(item)
            return (
              <div
                key={idx}
                className={`rank-item ${itemRank <= 3 ? 'rank-top' : ''}`}
                style={getHeroes ? { cursor: 'pointer' } : undefined}
                onClick={() => getHeroes && setLineupItem(item)}
                title={getHeroes ? '点击查看阵容' : undefined}
              >
                <div className="rank-position">{getRankDisplay(itemRank)}</div>
                {renderItem({ item, rank: itemRank })}
              </div>
            )
          })}
          {loading && (
            <div className="rank-loading">加载中...</div>
          )}
          {!hasMore && list.length > 0 && !hasLocalMore && (
            <div className="rank-end">— 已显示全部 —</div>
          )}
        </div>
      )}
    </div>
  )

  if (noShell) {
    return content
  }

  return (
    <PanelShell title={panelTitle} onClose={onClose}>
      {content}
    </PanelShell>
  )
}
