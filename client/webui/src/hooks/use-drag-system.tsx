// ====================================================================
//  跨平台拖拽
// ====================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'

// ════════════════════════════════════════════════════════════════════
//  类型定义
// ════════════════════════════════════════════════════════════════════

type Vec2 = { x: number; y: number }

/** 碰撞策略: 接收所有 droppable 信息 + 指针位置,返回命中的 id */
export type CollisionStrategy = (args: {
  droppables: Array<{ id: string; rect: DOMRect }>
  point: Vec2
}) => string | null

/** 内置碰撞策略集合 */
export const CollisionStrategies = {
  /** 矩形包围盒 (默认) */
  rectHit: (({ droppables, point }) => {
    for (const d of droppables) {
      if (
        point.x >= d.rect.left &&
        point.x <= d.rect.right &&
        point.y >= d.rect.top &&
        point.y <= d.rect.bottom
      )
        return d.id
    }
    return null
  }) satisfies CollisionStrategy,

  /** 最近中心点 */
  closestCenter: (({ droppables, point }) => {
    let minDist = Infinity
    let closest: string | null = null
    for (const d of droppables) {
      const cx = d.rect.left + d.rect.width / 2
      const cy = d.rect.top + d.rect.height / 2
      const dist = (cx - point.x) ** 2 + (cy - point.y) ** 2
      if (dist < minDist) {
        minDist = dist
        closest = d.id
      }
    }
    return closest
  }) satisfies CollisionStrategy,
}

/** 拖拽约束 */
export interface DragConstraints {
  axis?: 'x' | 'y'
  bounds?: { left: number; top: number; right: number; bottom: number }
  grid?: [number, number]
}

/** 生命周期回调 */
export interface DragLifecycle {
  onDragStart?: (data: unknown) => boolean | void
  onDragEnd?: (data: unknown, targetId: string | null) => void
  onDragCancel?: (data: unknown) => void
}

/** 传感器配置 */
export interface DragSensorConfig {
  mouse?: boolean
  touch?: boolean
}

// 内部状态

interface DragState {
  isDragging: boolean
  dragData: unknown
}

interface DropZone {
  id: string
  element: HTMLElement
  onDrop: (data: unknown) => void
}

interface DragContextValue {
  state: DragState
  activeDropZoneId: string | null
  registerDraggable: (id: string, data: unknown) => void
  unregisterDraggable: (id: string) => void
  registerDropZone: (zone: DropZone) => void
  unregisterDropZone: (id: string) => void
}

// ════════════════════════════════════════════════════════════════════
//  Context
// ════════════════════════════════════════════════════════════════════

const DragContext = createContext<DragContextValue | null>(null)

// ════════════════════════════════════════════════════════════════════
//  Provider
// ════════════════════════════════════════════════════════════════════

const INITIAL_STATE: DragState = { isDragging: false, dragData: null }
const ATTR_DRAG_ID = 'data-drag-id'

export interface DragProviderProps {
  children: ReactNode
  collisionStrategy?: CollisionStrategy
  constraints?: DragConstraints
  lifecycle?: DragLifecycle
  sensors?: DragSensorConfig
}

export function DragProvider({
  children,
  collisionStrategy = CollisionStrategies.rectHit,
  constraints,
  lifecycle,
  sensors = { mouse: true, touch: true },
}: DragProviderProps) {
  const [state, setState] = useState<DragState>(INITIAL_STATE)
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null)

  // refs (同步读写,不依赖异步 setState)
  const draggablesRef = useRef<Map<string, unknown>>(new Map())
  const dropZonesRef = useRef<Map<string, DropZone>>(new Map())
  const isDraggingRef = useRef(false)
  const dragDataRef = useRef<unknown>(null)
  const posRef = useRef<Vec2>({ x: 0, y: 0 })
  const touchMovedRef = useRef(false)
  const ignoreMouseUntilRef = useRef(0)

  // 直操作浮层
  const overlayRef = useRef<HTMLDivElement | null>(null)

  // 约束/lifecycle ref (闭包永不脏)
  const constraintsRef = useRef(constraints)
  constraintsRef.current = constraints
  const lifecycleRef = useRef(lifecycle)
  lifecycleRef.current = lifecycle
  const csRef = useRef(collisionStrategy)
  csRef.current = collisionStrategy

  // 注册
  const registerDraggable = useCallback((id: string, data: unknown) => {
    draggablesRef.current.set(id, data)
  }, [])
  const unregisterDraggable = useCallback((id: string) => {
    draggablesRef.current.delete(id)
  }, [])
  const registerDropZone = useCallback((zone: DropZone) => {
    dropZonesRef.current.set(zone.id, zone)
  }, [])
  const unregisterDropZone = useCallback((id: string) => {
    dropZonesRef.current.delete(id)
  }, [])

  // 碰撞检测 (可插拔策略)
  const detectDropZone = useCallback(
    (point: Vec2): string | null => {
      const droppables: Array<{ id: string; rect: DOMRect }> = []
      for (const [id, zone] of dropZonesRef.current) {
        droppables.push({ id, rect: zone.element.getBoundingClientRect() })
      }
      return csRef.current({ droppables, point })
    },
    [],
  )

  // 应用约束
  const applyConstraints = useCallback((x: number, y: number): Vec2 => {
    const c = constraintsRef.current
    if (!c) return { x, y }
    let rx = x, ry = y
    if (c.axis === 'x') ry = posRef.current.y
    if (c.axis === 'y') rx = posRef.current.x
    if (c.bounds) {
      rx = Math.max(c.bounds.left, Math.min(c.bounds.right, rx))
      ry = Math.max(c.bounds.top, Math.min(c.bounds.bottom, ry))
    }
    if (c.grid) {
      rx = Math.round(rx / c.grid[0]) * c.grid[0]
      ry = Math.round(ry / c.grid[1]) * c.grid[1]
    }
    return { x: rx, y: ry }
  }, [])

  // DOM 直操作浮层
  const posOverlay = useCallback((x: number, y: number) => {
    const el = overlayRef.current
    if (!el) return
    el.style.left = `${x - el.offsetWidth / 2}px`
    el.style.top = `${y - el.offsetHeight / 2}px`
  }, [])
  const createOverlay = useCallback((src: HTMLElement) => {
    overlayRef.current?.remove()
    const rect = src.getBoundingClientRect()
    const div = document.createElement('div')
    div.style.cssText = [
      'position:fixed;pointer-events:none;z-index:9999',
      `width:${rect.width}px;height:${rect.height}px`,
      'transform:scale(1.08);opacity:0.9;transition:transform 0.1s ease',
    ].join(';')
    div.append(src.cloneNode(true))
    document.body.append(div)
    overlayRef.current = div
  }, [])
  const destroyOverlay = useCallback(() => {
    overlayRef.current?.remove()
    overlayRef.current = null
  }, [])

  // 开始拖拽
  const startDrag = useCallback(
    (dragId: string, element: HTMLElement, clientX: number, clientY: number) => {
      const data = draggablesRef.current.get(dragId)
      if (data == null) return
      if (lifecycleRef.current?.onDragStart?.(data) === false) return

      const pos = applyConstraints(clientX, clientY)
      dragDataRef.current = data
      posRef.current = pos
      isDraggingRef.current = true
      createOverlay(element)
      posOverlay(pos.x, pos.y)
      setState({ isDragging: true, dragData: data })
    },
    [applyConstraints, createOverlay, posOverlay],
  )

  // 更新位置
  const updateDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return
      const pos = applyConstraints(clientX, clientY)
      posRef.current = pos
      posOverlay(pos.x, pos.y)
      setActiveDropZoneId(detectDropZone(pos))
    },
    [applyConstraints, detectDropZone, posOverlay],
  )

  // 结束拖拽
  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    destroyOverlay()

    const data = dragDataRef.current
    const pos = posRef.current
    const targetId = data != null ? detectDropZone(pos) : null

    if (data != null && targetId != null) {
      dropZonesRef.current.get(targetId)?.onDrop(data)
    }
    lifecycleRef.current?.onDragEnd?.(data, targetId)

    dragDataRef.current = null
    setState(INITIAL_STATE)
    setActiveDropZoneId(null)
  }, [detectDropZone, destroyOverlay])

  // 取消拖拽
  const cancelDrag = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const data = dragDataRef.current
    destroyOverlay()
    dragDataRef.current = null
    setState(INITIAL_STATE)
    setActiveDropZoneId(null)
    lifecycleRef.current?.onDragCancel?.(data)
  }, [destroyOverlay])

  // ══════════════════════════════════════════════════════════════════
  //  原生 DOM 事件
  // ══════════════════════════════════════════════════════════════════

  useEffect(() => {
    // 鼠标
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !sensors.mouse) return
      if (Date.now() < ignoreMouseUntilRef.current) return
      const el = (e.target as HTMLElement).closest(`[${ATTR_DRAG_ID}]`) as HTMLElement | null
      if (!el) return
      startDrag(el.getAttribute(ATTR_DRAG_ID)!, el, e.clientX, e.clientY)
    }
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) { e.preventDefault(); updateDrag(e.clientX, e.clientY) }
    }
    const onMouseUp = () => {
      if (Date.now() < ignoreMouseUntilRef.current) { isDraggingRef.current = false; return }
      endDrag()
    }

    // 触摸
    const onTouchStart = (e: TouchEvent) => {
      if (!sensors.touch) return
      const el = (e.target as HTMLElement).closest(`[${ATTR_DRAG_ID}]`) as HTMLElement | null
      if (!el) return
      touchMovedRef.current = false
      const t = e.touches[0]
      startDrag(el.getAttribute(ATTR_DRAG_ID)!, el, t.clientX, t.clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current) {
        touchMovedRef.current = true
        e.preventDefault()
        updateDrag(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      const wasDragging = isDraggingRef.current
      const wasTouchMoved = touchMovedRef.current
      touchMovedRef.current = false
      if (wasDragging) {
        if (wasTouchMoved) {
          const t = e.changedTouches[0]; updateDrag(t.clientX, t.clientY); endDrag()
        } else {
          isDraggingRef.current = false; dragDataRef.current = null
          setState(INITIAL_STATE); setActiveDropZoneId(null); destroyOverlay()
        }
        ignoreMouseUntilRef.current = Date.now() + 300
      }
    }

    // Esc 取消
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDraggingRef.current) cancelDrag()
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [sensors.mouse, sensors.touch, startDrag, updateDrag, endDrag, cancelDrag, destroyOverlay])

  // -context value-
  const value: DragContextValue = {
    state, activeDropZoneId,
    registerDraggable, unregisterDraggable,
    registerDropZone, unregisterDropZone,
  }
  return <DragContext.Provider value={value}>{children}</DragContext.Provider>
}

// ════════════════════════════════════════════════════════════════════
//  Hooks
// ════════════════════════════════════════════════════════════════════

export function useDraggable<T extends HTMLElement = HTMLDivElement>(id: string, data: unknown) {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDraggable 必须在 DragProvider 内使用')

  const isDragging = ctx.state.isDragging && ctx.state.dragData === data

  useEffect(() => {
    ctx.registerDraggable(id, data)
    return () => ctx.unregisterDraggable(id)
  }, [id, data, ctx])

  const ref = useCallback((el: T | null) => {
    if (el) el.setAttribute(ATTR_DRAG_ID, id)
  }, [id])

  return { ref, isDragging }
}

export function useDroppable<T extends HTMLElement = HTMLDivElement>(id: string, onDrop: (data: unknown) => void) {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDroppable 必须在 DragProvider 内使用')

  const ref = useRef<T>(null)
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop

  useEffect(() => {
    if (ref.current) {
      ctx.registerDropZone({
        id, element: ref.current as HTMLElement,
        onDrop: (data: unknown) => onDropRef.current(data),
      })
    }
    return () => ctx.unregisterDropZone(id)
  }, [id, ctx])

  const isOver = ctx.activeDropZoneId === id
  return { ref, isOver }
}
