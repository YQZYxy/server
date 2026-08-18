// ====================================================================
//  断网提示覆盖层
// ====================================================================

import { gameStore } from '@/store/game-store'

export default function LoadingOverlay() {
  const loading = gameStore((s) => s.loading)
  const reconnecting = gameStore((s) => s.reconnecting)

  if (!loading && !reconnecting) return null

  return (
    <div id="loading-overlay" className="overlay">
      <div className="loading-spinner" />
      <p>{reconnecting ? '网络断开,正在重连...' : '连接中...'}</p>
    </div>
  )
}
