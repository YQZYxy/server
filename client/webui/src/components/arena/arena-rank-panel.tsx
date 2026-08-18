//  竞技场排行榜面板

import { MHT, RankType } from '@/types'
import RankPanel from '@/components/rank/rank-panel'
import type { P_ArenaRank_SC, PB_ArenaRankNode } from '@/types'

interface ArenaRankPanelProps {
  onClose: () => void
}

export default function ArenaRankPanel({ onClose }: ArenaRankPanelProps) {
  return (
    <RankPanel<PB_ArenaRankNode>
      title="竞技场排行榜"
      rankType={RankType.ARENA}
      responseMsgId={MHT.MHT_ARENA_RANK_SC}
      transformResponse={(data: P_ArenaRank_SC) => ({
        list: data.rank_list ?? [],
        hasMore: data.has_more ?? false,
        total: data.total ?? 0,
      })}
      renderItem={({ item }) => {
        const base = item.base
        return (
          <>
            <div className="rank-avatar">🎭</div>
            <div className="rank-info">
              <div className="rank-name">{base?.name || '未知'}</div>
              <div className="rank-uid">UID: {base?.uid}</div>
            </div>
            <div className="rank-value">
              <span className="rank-value-num">{base?.value ?? 0}</span>
              <span className="rank-value-label">分</span>
            </div>
            <div className="arena-rank-power">
              战力: {base?.power?.toLocaleString() || 0}
            </div>
          </>
        )
      }}
      getHeroes={(item) => item.base?.heroes ?? undefined}
      onClose={onClose}
    />
  )
}
