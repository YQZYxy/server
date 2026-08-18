import { useEffect } from 'react'
import { gameStore } from '@/store/game-store'

export default function Toast() {
  const toast = gameStore((s) => s.toast)
  const hideToast = gameStore((s) => s.hideToast)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 2500)
      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  if (!toast) return null

  return (
    <div className={`toast ${toast.type} show`}>
      {toast.message}
    </div>
  )
}
