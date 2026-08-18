import { useRef, useCallback, useEffect } from 'react'

/**
 * 拖拽缩放面板宽度
 * @param handleId resize-handle 元素的 id（用于查找）
 * @param panelRef 要缩放的 panel 元素 ref
 * @param minWidth 最小宽度（px）
 * @param maxWidth 最大宽度（px）
 * @param onWidthChange 宽度变化回调（可选，用于保存）
 */
export function useDragResize(
  handleId: string,
  panelRef: React.RefObject<HTMLElement | null>,
  minWidth = 160,
  maxWidth = 600,
  onWidthChange?: (width: number) => void
) {
  const draggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    draggingRef.current = true
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    startXRef.current = clientX
    startWidthRef.current = panelRef.current?.offsetWidth || minWidth
  }, [panelRef, minWidth])

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingRef.current || !panelRef.current) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const delta = clientX - startXRef.current
    let newWidth = startWidthRef.current + delta
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    panelRef.current.style.width = `${newWidth}px`
    panelRef.current.style.transition = 'none'
    if (onWidthChange) onWidthChange(newWidth)
  }, [panelRef, minWidth, maxWidth, onWidthChange])

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    // 恢复 transition
    if (panelRef.current) {
      panelRef.current.style.transition = ''
    }
  }, [panelRef])

  // 挂载/卸载事件
  useEffect(() => {
    const handle = document.getElementById(handleId)
    if (!handle) return

    handle.addEventListener('mousedown', handleMouseDown)
    handle.addEventListener('touchstart', handleMouseDown, { passive: false })
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchend', handleMouseUp)

    return () => {
      handle.removeEventListener('mousedown', handleMouseDown)
      handle.removeEventListener('touchstart', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleId, handleMouseDown, handleMouseMove, handleMouseUp])
}
