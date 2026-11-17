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

// 读取节点的uid
function readRankUid(item: any): number
{
  const uid = item?.uid ?? item?.base?.uid ?? 0
  return typeof uid === 'number' ? uid : 0
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
  // 已经接收的数据条数,也就是下一页请求的offset
  const offsetRef = useRef(0)
  // 未收到响应的请求 offset 队列: 响应按 FIFO 与请求一一对应
  const pendingOffsetsRef = useRef<number[]>([])
  // 同步在途标记: setLoading 是异步的, 同一帧内多次触发会重复发请求
  const inFlightRef = useRef(false)
  // 已接收节点的 uid, 用于追加去重
  const loadedUidsRef = useRef<Set<number>>(new Set())
  const initialDoneRef = useRef(false)

  // 拖拽滚动状态
  const dragRef = useRef({ active: false, startY: 0, startTop: 0, moved: false })
  // 拖拽结束后抑制这一次点击, 避免误触打开阵容
  const suppressClickRef = useRef(false)

  // 阵容弹窗状态
  const [lineupItem, setLineupItem] = useState<T | null>(null)
  const [detailHero, setDetailHero] = useState<PB_HeroData | null>(null)

  // 可见列表
  const visibleList = list.slice(0, displayCount)
  const hasLocalMore = displayCount < list.length

  // 发送分页请求
  // 同步在途锁保证同一时刻只有一个请求, 避免滚动/滚轮/拖拽同时触发重复请求
  const fetchPage = useCallback((offset: number) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    pendingOffsetsRef.current.push(offset)
    setLoading(true)
    gameSocket.sendMsg(MHT.MHT_RANK_CS, { rank_type: rankType, rank_offset: offset })
  }, [rankType])

  // 监听响应 + 首次请求
  const msgId = responseMsgId ?? MHT.MHT_RANK_SC
  useEffect(() => {
    const handler = (data: any) => {
      // 与请求队列一一对应: 有请求才处理, 迟到的重复响应直接丢弃
      const request_offset = pendingOffsetsRef.current.shift()
      inFlightRef.current = false
      setLoading(false)
      if (request_offset === undefined) return

      const { list: newList, hasMore: more, total: t } = transformResponse(data)

      if (request_offset === 0) {
        // 首屏: 整表替换
        loadedUidsRef.current = new Set()
        for (const item of newList) {
          loadedUidsRef.current.add(readRankUid(item))
        }
        offsetRef.current = newList.length
        setList(newList)
        setDisplayCount(RANK_PAGE_SIZE)
      } else {
        // 空页说明服务端已经没有更多数据了
        if (newList.length === 0) {
          setHasMore(false)
          setTotal(t)
          return
        }

        // 按 uid 去重后追加, 避免重复请求导致同一条数据出现两次
        const added: T[] = []
        for (const item of newList) {
          const uid = readRankUid(item)
          if (uid !== 0 && loadedUidsRef.current.has(uid)) continue
          if (uid !== 0) loadedUidsRef.current.add(uid)
          added.push(item)
        }

        if (added.length > 0) {
          offsetRef.current += added.length
          setList(prev => [...prev, ...added])
          // 新一页直接展示出来, 不用用户再点一次
          setDisplayCount(prev => prev + added.length)
        }
      }

      setHasMore(more)
      setTotal(t)
    }

    gameSocket.onMsg(msgId, handler)

    if (!initialDoneRef.current) {
      initialDoneRef.current = true
      offsetRef.current = 0
      pendingOffsetsRef.current = []
      inFlightRef.current = false
      loadedUidsRef.current = new Set()
      fetchPage(0)
    }

    return () => {
      gameSocket.offMsg(msgId, handler)
    }
  }, [msgId, fetchPage, transformResponse])

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (inFlightRef.current) return
    fetchPage(offsetRef.current)
  }, [fetchPage])

  // 加载更多: 先把已取回的数据全部展开, 再看服务端还有没有下一页
  // 四种触发方式(滚动 / 滚轮 / 拖拽 / 布局测量)都走这里, 统一做并发保护
  const tryLoadMore = useCallback(() => {
    if (inFlightRef.current) return

    if (hasLocalMore) {
      setDisplayCount(prev => Math.min(prev + RANK_PAGE_SIZE, list.length))
      return
    }

    if (!hasMore) return

    // 已取到的条数达到服务端总数时不再请求
    if (total > 0 && offsetRef.current >= total) {
      setHasMore(false)
      return
    }

    handleLoadMore()
  }, [hasLocalMore, hasMore, total, list.length, handleLoadMore])

  // 用 ref 保存最新实现, 让滚轮监听等只注册一次
  const tryLoadMoreRef = useRef(tryLoadMore)
  useEffect(() => {
    tryLoadMoreRef.current = tryLoadMore
  }, [tryLoadMore])

  // 滚动加载
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (!nearBottom) return

    tryLoadMore()
  }, [tryLoadMore])

  // 内容不足以填满容器时主动补数据
  const [layoutTick, setLayoutTick] = useState(0)
  useEffect(() => {
    const handleResize = () => setLayoutTick(prev => prev + 1)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || loading) return

    // 还有内容没显示完(本地未展开或服务端还有下一页)且容器已经装满了就不再补
    if (el.scrollHeight > el.clientHeight + 1) return

    tryLoadMoreRef.current()
  }, [list, displayCount, loading, layoutTick])

  // 鼠标滚轮: 在列表底部继续下滚时补数据, 不依赖滚动条是否可滚
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
      if (atBottom) {
        tryLoadMoreRef.current()
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: true })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // 鼠标拖拽滚动
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = scrollRef.current
    if (!el) return

    dragRef.current = { active: true, startY: e.clientY, startTop: el.scrollTop, moved: false }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const el = scrollRef.current
    if (!drag.active || !el) return

    const delta_y = e.clientY - drag.startY
    if (!drag.moved && Math.abs(delta_y) < 6) return

    drag.moved = true
    el.scrollTop = drag.startTop - delta_y
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      tryLoadMoreRef.current()
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (dragRef.current.moved) {
      suppressClickRef.current = true
    }
    dragRef.current.active = false
    // click 事件在 pointerup 之后同步触发, 下一轮事件循环再复位
    setTimeout(() => {
      suppressClickRef.current = false
    }, 0)
  }, [])

  // 获取排名字段
  const getItemRank = useCallback((item: T): number => {
    return (item as any).rank ?? (item as any).base?.rank ?? 0
  }, [])

  // 获取名字字段
  const getItemName = useCallback((item: T): string => {
    return (item as any).name || (item as any).base?.name || ''
  }, [])

  // 获取 uid 字段(用作列表 key)
  const getItemUid = useCallback((item: T): number => readRankUid(item), [])

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {list.length === 0 ? (
        <div className="rank-empty-hint">暂无排行榜数据</div>
      ) : (
        <div className="rank-list">
          {visibleList.map((item, idx) => {
            const itemRank = getItemRank(item)
            return (
              <div
                key={`${getItemUid(item)}-${idx}`}
                className={`rank-item ${itemRank <= 3 ? 'rank-top' : ''}`}
                style={getHeroes ? { cursor: 'pointer' } : undefined}
                onClick={() => {
                  // 拖拽滚动结束后不要误触
                  if (suppressClickRef.current) return
                  if (getHeroes) setLineupItem(item)
                }}
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
          {(hasMore || hasLocalMore) && !loading && (
            <button className="rank-load-more" onClick={tryLoadMore}>加载更多</button>
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
