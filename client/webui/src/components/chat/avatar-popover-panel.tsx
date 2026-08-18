// ====================================================================
//  头像弹出组件
// ====================================================================

import { useEffect, useRef } from 'react'
import type { PB_ChatData } from '@/types'

interface AvatarPopoverPanelProps {
  data: PB_ChatData
  onClose: () => void
}

export default function AvatarPopoverPanel({ data: sender, onClose }: AvatarPopoverPanelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div className="avatar-popover" ref={ref}>
      <div className="avatar-popover-header">
        <span className="avatar-popover-icon">🧙</span>
        <span className="avatar-popover-name">{sender.name || '未知'}</span>
      </div>
      <div className="avatar-popover-info">
        <div>UID: {sender.uid}</div>
        <div>用户名: {sender.user_name}</div>
      </div>
      <button className="avatar-popover-close" onClick={onClose}>关闭</button>
    </div>
  )
}
