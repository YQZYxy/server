// ====================================================================
//  MMO 场景页
//  100x100 格子地图, 摄像机跟随玩家居中, 网络同步其他玩家
//  地图尺寸与格子类型来自配置, 这里用同规则程序化生成作默认值
// ====================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameStore } from '@/store/game-store'
import { gameSocket } from '@/services/socket'
import { enterCross, getMmoSocket, leaveCross } from '@/services/cross'
import { MHT } from '@/types'

// MMO 协议常量可能还没生成, 统一走 any 取值并在运行时判空
const MMO = MHT as any

/** 格子类型: 0障碍 1可走 2安全区 3NPC 4水 */
const Tile = {
  Block: 0,
  Walk: 1,
  Safe: 2,
  Npc: 3,
  Water: 4,
} as const

/** 地图尺寸(与服务端 mapconfig 的 map_id 一一对应) */
/** 本服场景: 小地图 */
const LOCAL_SCENE_ID = 2
const LOCAL_MAP_SIZE = 30
/** 跨服场景: 大地图 */
const CROSS_SCENE_ID = 1
const CROSS_MAP_SIZE = 100
const TILE_SIZE = 32
/** 视口大小, 摄像机跟随玩家 */
const VIEW_WIDTH = 900
const VIEW_HEIGHT = 600
/** 移动速度(格/秒) */
const MOVE_TILES_PER_SEC = 5
/** 移动上报间隔(毫秒), 20Hz 足够跟手 */
const MOVE_REPORT_INTERVAL_MS = 50
/** 远端玩家位置收敛速度(单位/秒), 与服务端推进速度一致 */
const REMOTE_LERP_SPEED = MOVE_TILES_PER_SEC * TILE_SIZE
/** 伤害飘字存活时长(毫秒) */
const DAMAGE_FLOAT_MS = 900

const TILE_COLORS: Record<number, string> = {
  [Tile.Block]: '#2b2b35',
  [Tile.Walk]: '#3f7d3a',
  [Tile.Safe]: '#3d6fa8',
  [Tile.Npc]: '#8a6d3b',
  [Tile.Water]: '#2f5f8f',
}

interface Cell {
  x: number
  y: number
}

/** 服务端同步过来的其他玩家 */
interface RemoteRole {
  objId: number
  ownerUid: number
  /** 服务端下发的角色名 */
  name: string
  level: number
  hp: number
  maxHp: number
  dead: boolean
  /** 服务端下发的目标位置(世界坐标) */
  tx: number
  ty: number
  /** 客户端插值后的渲染位置(世界坐标) */
  rx: number
  ry: number
}

/** 伤害飘字 */
interface DamageFloat {
  objId: number
  damage: number
  born: number
}

function IsBlocked(tile: number): boolean {
  return tile === Tile.Block || tile === Tile.Water
}

/** 程序化生成地图, 与服务端 mapconfig 的生成规则一致 */
function BuildGrid(width: number, height: number): number[][] {
  const grid: number[][] = []
  for (let y = 0; y < height; y += 1) {
    const row: number[] = []
    for (let x = 0; x < width; x += 1) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        row.push(Tile.Block)
        continue
      }
      const v = Math.abs(((x * 73856093) ^ (y * 19349663)) % 100)
      if (v < 8) row.push(Tile.Water)
      else if (v < 14) row.push(Tile.Block)
      else if (v < 20) row.push(Tile.Safe)
      else if (v < 21) row.push(Tile.Npc)
      else row.push(Tile.Walk)
    }
    grid.push(row)
  }
  return grid
}

/** BFS 寻路, 返回不含起点的路径 */
function FindPath(grid: number[][], from: Cell, to: Cell): Cell[] {
  if (from.x === to.x && from.y === to.y) return []
  const height = grid.length
  const width = grid[0]?.length ?? 0
  if (to.x < 0 || to.y < 0 || to.x >= width || to.y >= height) return []
  if (IsBlocked(grid[to.y][to.x])) return []

  const startKey = from.y * width + from.x
  const endKey = to.y * width + to.x
  const visited = new Set<number>([startKey])
  const prev = new Map<number, number>()
  const queue: number[] = [startKey]
  const dirs = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ]

  while (queue.length > 0) {
    const current = queue.shift() as number
    if (current === endKey) break
    const cx = current % width
    const cy = Math.floor(current / width)
    for (const [dx, dy] of dirs) {
      const nx = cx + dx
      const ny = cy + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      if (IsBlocked(grid[ny][nx])) continue
      const nextKey = ny * width + nx
      if (visited.has(nextKey)) continue
      visited.add(nextKey)
      prev.set(nextKey, current)
      queue.push(nextKey)
    }
  }

  if (!prev.has(endKey)) return []
  const path: Cell[] = []
  let cursor = endKey
  while (cursor !== startKey) {
    path.push({ x: cursor % width, y: Math.floor(cursor / width) })
    const parent = prev.get(cursor)
    if (parent === undefined) return []
    cursor = parent
  }
  return path.reverse()
}

/** 格子绘制, 不同类型不同纹理 */
function DrawTile(ctx: CanvasRenderingContext2D, tile: number, sx: number, sy: number, size: number) {
  ctx.fillStyle = TILE_COLORS[tile] ?? TILE_COLORS[Tile.Walk]
  ctx.fillRect(sx, sy, size, size)

  if (tile === Tile.Block) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(sx, sy + size / 2)
    ctx.lineTo(sx + size, sy + size / 2)
    ctx.moveTo(sx + size / 2, sy)
    ctx.lineTo(sx + size / 2, sy + size / 2)
    ctx.moveTo(sx + size / 4, sy + size / 2)
    ctx.lineTo(sx + size / 4, sy + size)
    ctx.stroke()
  } else if (tile === Tile.Water) {
    ctx.strokeStyle = 'rgba(180,220,255,0.35)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 2; i += 1) {
      const wy = sy + (size * i) / 3
      ctx.beginPath()
      ctx.moveTo(sx + 2, wy)
      ctx.quadraticCurveTo(sx + size / 2, wy - 3, sx + size - 2, wy)
      ctx.stroke()
    }
  } else if (tile === Tile.Walk) {
    ctx.fillStyle = 'rgba(255,255,255,0.07)'
    const seed = (sx * 73856093) ^ (sy * 19349663)
    for (let i = 0; i < 3; i += 1) {
      const dx = ((seed >> (i * 3)) & 7) + 3
      const dy = ((seed >> (i * 3 + 2)) & 7) + 3
      ctx.fillRect(sx + dx, sy + dy, 2, 2)
    }
  } else if (tile === Tile.Safe) {
    ctx.strokeStyle = 'rgba(140,200,255,0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(sx + 1, sy + 1, size - 2, size - 2)
  } else if (tile === Tile.Npc) {
    ctx.fillStyle = 'rgba(255,220,140,0.9)'
    ctx.beginPath()
    ctx.arc(sx + size / 2, sy + size / 2 - 2, size * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(sx + size * 0.35, sy + size * 0.55, size * 0.3, size * 0.25)
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.1)'
  ctx.lineWidth = 1
  ctx.strokeRect(sx, sy, size, size)
}

/** 角色绘制接口, 后续换 2D/3D 模型只改这里 */
function DrawActor(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tileSize: number,
  label: string,
  color: string,
  attacking: boolean,
  hpRatio: number,
  dead: boolean,
) {
  const radius = tileSize * 0.34
  ctx.save()
  ctx.translate(px, py)
  if (attacking) ctx.rotate(0.25)
  ctx.globalAlpha = dead ? 0.45 : 1
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.lineWidth = Math.max(1, tileSize * 0.06)
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.font = `${Math.max(10, tileSize * 0.4)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label.slice(0, 1), 0, 0)
  ctx.restore()

  // 名字
  ctx.fillStyle = dead ? 'rgba(200,200,200,0.7)' : 'rgba(255,255,255,0.92)'
  ctx.font = `${Math.max(9, tileSize * 0.34)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(label, px, py - tileSize * 0.55)

  // 血条, hpRatio < 0 表示不画
  if (hpRatio >= 0)
  {
    const barWidth = tileSize * 1.1
    const barHeight = Math.max(3, tileSize * 0.11)
    const barX = px - barWidth / 2
    const barY = py - tileSize * 0.5
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(barX, barY, barWidth, barHeight)
    ctx.fillStyle = hpRatio > 0.5 ? '#54c46a' : hpRatio > 0.25 ? '#e0b040' : '#d05050'
    ctx.fillRect(barX, barY, barWidth * Math.max(0, Math.min(1, hpRatio)), barHeight)
  }
}

/** 伤害飘字绘制 */
function DrawFloats(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  damage: number,
  progress: number,
) {
  ctx.save()
  ctx.globalAlpha = 1 - progress
  ctx.fillStyle = '#ff6b5a'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`-${damage}`, px, py - 18 - progress * 26)
  ctx.restore()
}

export default function MmoPage() {
  const navigate = useNavigate()
  const username = gameStore((s) => s.username)
  const roleInfo = gameStore((s) => s.roleInfo)
  const myUid = Number((roleInfo as any)?.role_base_info?.uid ?? 0)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // MMO 使用的连接, 进入跨服后切换为场景服连接
  const [socket, setSocket] = useState(() => getMmoSocket())
  const [crossBusy, setCrossBusy] = useState(false)
  const [remotes, setRemotes] = useState<Record<number, RemoteRole>>({})
  const [attacking, setAttacking] = useState(false)
  const [hoverCell, setHoverCell] = useState<Cell | null>(null)
  const [selfHp, setSelfHp] = useState(1000)
  const [selfMaxHp, setSelfMaxHp] = useState(1000)
  // 收到服务端下发的自身场景状态后才算真正进入场景
  const [inScene, setInScene] = useState(false)

  // 跨服连接使用大地图, 归属服连接使用小地图
  const inCrossScene = socket !== gameSocket
  const sceneId = inCrossScene ? CROSS_SCENE_ID : LOCAL_SCENE_ID
  const mapSize = inCrossScene ? CROSS_MAP_SIZE : LOCAL_MAP_SIZE
  const grid = useMemo(() => BuildGrid(mapSize, mapSize), [mapSize])
  const spawn = useMemo<Cell>(() => ({ x: Math.floor(mapSize / 2), y: Math.floor(mapSize / 2) }), [mapSize])

  // 渲染实时状态放 ref, 避免每帧 setState
  const posRef = useRef<{ x: number; y: number }>({ x: spawn.x + 0.5, y: spawn.y + 0.5 })
  const pathRef = useRef<Cell[]>([])
  const hoverRef = useRef<Cell | null>(null)
  const remotesRef = useRef<Record<number, RemoteRole>>({})
  const attackingRef = useRef(false)
  const floatsRef = useRef<DamageFloat[]>([])
  const selfObjIdRef = useRef(0)
  const lastReportRef = useRef(0)
  const lastReportedPosRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
  // myUid 可能晚于协议注册才就绪, 用 ref 保证事件里拿到最新值
  const myUidRef = useRef(myUid)
  myUidRef.current = myUid
  // 渲染循环里读自己的血量, state 在 rAF 闭包里是旧值
  const selfHpRef = useRef(selfHp)
  const selfMaxHpRef = useRef(selfMaxHp)
  selfHpRef.current = selfHp
  selfMaxHpRef.current = selfMaxHp

  // 实体表同时写 ref 和 state
  useEffect(() => {
    remotesRef.current = remotes
  }, [remotes])
  useEffect(() => {
    attackingRef.current = attacking
  }, [attacking])

  /** 发送上行协议, 常量缺失时直接跳过 */
  const sendMsg = useCallback((msgType: number | undefined, body: Record<string, any>) => {
    if (!msgType) return
    socket.sendMsg(msgType, body)
  }, [socket])

  /** 进入场景 + 注册同步协议 */
  useEffect(() => {
    // 重新进入时清掉上一轮(含断线重连)遗留的实体与飘字
    remotesRef.current = {}
    floatsRef.current = []
    selfObjIdRef.current = 0
    setRemotes({})
    // 未收到服务端场景状态前不显示场景界面
    setInScene(false)
    pathRef.current = []

    let enterRetry = 0
    let enterTimer: number | null = null

    const enterScene = () => {
      sendMsg(MMO.MHT_MMO_ENTER_SCENE_CS, {
        scene_id: sceneId,
        x: posRef.current.x * TILE_SIZE,
        y: posRef.current.y * TILE_SIZE,
        z: 0,
      })

      // 服务端成功进入会回自己的 ROLE_STATE, 拿不到就说明上行丢了, 补发几次
      if (enterTimer) window.clearTimeout(enterTimer)
      if (enterRetry >= 3) return
      enterTimer = window.setTimeout(() => {
        enterRetry += 1
        if (selfObjIdRef.current === 0) enterScene()
      }, 3000)
    }

    const clearRemotes = () => {
      remotesRef.current = {}
      floatsRef.current = []
      selfObjIdRef.current = 0
      setRemotes({})
    }

    // 断线重连后服务端已重建实体, 必须重新进入场景才拿得到视野列表
    const onSocketConnected = () => {
      clearRemotes()
      enterScene()
    }
    const onSocketDisconnected = () => {
      clearRemotes()
    }

    // 已连接时立刻进入, 未连接时会被 sendMsg 丢弃, 等 connected 事件再补
    enterScene()
    socket.on('connected', onSocketConnected)
    socket.on('disconnected', onSocketDisconnected)

    const onSyncEntity = (body: any) => {
      if (!body) return
      const objId = Number(body.obj_id ?? 0)
      if (!objId) return
      const ownerUid = Number(body.owner_uid ?? 0)
      // 自己的实体不放进远端表, 本地已经有一份
      if (ownerUid !== 0 && ownerUid === myUidRef.current) return

      const worldX = Number(body.x ?? 0)
      const worldY = Number(body.y ?? 0)
      setRemotes((prev) => {
        const exist = prev[objId]
        return {
          ...prev,
          [objId]: {
            objId,
            ownerUid,
            name: String(body.role_name || exist?.name || `玩家${ownerUid}`),
            level: Number(body.level ?? exist?.level ?? 1),
            hp: Number(body.hp ?? exist?.hp ?? 0),
            maxHp: Number(body.max_hp ?? exist?.maxHp ?? 0),
            dead: Boolean(body.dead ?? false),
            tx: worldX,
            ty: worldY,
            // 首次出现直接落到目标点, 避免从(0,0)滑过来
            rx: exist ? exist.rx : worldX,
            ry: exist ? exist.ry : worldY,
          },
        }
      })
    }

    const onLeaveEntity = (body: any) => {
      const objId = Number(body?.obj_id ?? 0)
      if (!objId) return
      setRemotes((prev) => {
        if (!prev[objId]) return prev
        const next = { ...prev }
        delete next[objId]
        return next
      })
    }

    const onSyncMove = (body: any) => {
      const objId = Number(body?.obj_id ?? 0)
      if (!objId) return
      const worldX = Number(body.x ?? 0)
      const worldY = Number(body.y ?? 0)
      setRemotes((prev) => {
        const role = prev[objId]
        if (!role) return prev
        return { ...prev, [objId]: { ...role, tx: worldX, ty: worldY } }
      })
    }

    // 受击: 更新血量并弹飘字
    const onDamage = (body: any) => {
      const objId = Number(body?.obj_id ?? 0)
      if (!objId) return
      const damage = Number(body.damage ?? 0)
      const hp = Number(body.hp ?? 0)
      const dead = Boolean(body.dead ?? false)

      if (damage > 0) {
        floatsRef.current.push({ objId, damage, born: performance.now() })
      }

      if (objId === selfObjIdRef.current) {
        setSelfHp(hp)
        return
      }
      setRemotes((prev) => {
        const role = prev[objId]
        if (!role) return prev
        return { ...prev, [objId]: { ...role, hp, dead } }
      })
    }

    const onRoleState = (body: any) => {
      if (!body) return
      const objId = Number(body.obj_id ?? 0)
      const ownerUid = Number(body.owner_uid ?? 0)
      const hp = Number(body.hp ?? 0)
      const maxHp = Number(body.max_hp ?? 0)
      const dead = Boolean(body.dead ?? false)

      // 用归属uid判定是不是自己, 只比 obj_id 会在收到别人状态时误判
      if (ownerUid !== 0 && ownerUid === myUidRef.current) {
        if (objId !== 0) selfObjIdRef.current = objId
        if (maxHp > 0) setSelfMaxHp(maxHp)
        setSelfHp(hp)
        // 服务端确认自己已在场景里, 这时才放开界面
        setInScene(true)
        return
      }
      setRemotes((prev) => {
        const role = prev[objId]
        if (!role) return prev
        return {
          ...prev,
          [objId]: {
            ...role,
            hp,
            maxHp: maxHp > 0 ? maxHp : role.maxHp,
            dead,
          },
        }
      })
    }

    const bindings: Array<[number | undefined, (body: any) => void]> = [
      [MMO.MHT_MMO_SYNC_ENTITY_SC, onSyncEntity],
      [MMO.MHT_MMO_SYNC_LEAVE_ENTITY_SC, onLeaveEntity],
      [MMO.MHT_MMO_SYNC_MOVE_SC, onSyncMove],
      [MMO.MHT_MMO_DAMAGE_SC, onDamage],
      [MMO.MHT_MMO_ROLE_STATE_SC, onRoleState],
    ]
    for (const [msgType, handler] of bindings) {
      if (msgType) socket.onMsg(msgType, handler)
    }

    return () => {
      for (const [msgType, handler] of bindings) {
        if (msgType) socket.offMsg(msgType, handler)
      }
      socket.off('connected', onSocketConnected)
      socket.off('disconnected', onSocketDisconnected)
      if (enterTimer) window.clearTimeout(enterTimer)
      setInScene(false)
      // 切换跨服连接时不通知归属服离场
      if (socket === gameSocket) {
        sendMsg(MMO.MHT_MMO_LEAVE_SCENE_CS, { scene_id: sceneId })
      }
    }
    // 仅连接变化时重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket])

  /** 视口坐标转世界坐标 */
  const ScreenToWorld = useCallback((event: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const camX = posRef.current.x * TILE_SIZE
    const camY = posRef.current.y * TILE_SIZE
    return {
      worldX: (event.clientX - rect.left) * scaleX + camX - VIEW_WIDTH / 2,
      worldY: (event.clientY - rect.top) * scaleY + camY - VIEW_HEIGHT / 2,
    }
  }, [])

  const HandleClick = useCallback(
    (event: ReactMouseEvent<HTMLCanvasElement>) => {
      const world = ScreenToWorld(event)
      if (!world) return
      const target: Cell = {
        x: Math.floor(world.worldX / TILE_SIZE),
        y: Math.floor(world.worldY / TILE_SIZE),
      }
      if (target.x < 0 || target.y < 0 || target.x >= mapSize || target.y >= mapSize) return
      if (IsBlocked(grid[target.y][target.x])) return

      const from: Cell = { x: Math.floor(posRef.current.x), y: Math.floor(posRef.current.y) }
      pathRef.current = FindPath(grid, from, target)
    },
    [ScreenToWorld, grid],
  )

  const HandleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLCanvasElement>) => {
      const world = ScreenToWorld(event)
      if (!world) return
      const cell: Cell = {
        x: Math.floor(world.worldX / TILE_SIZE),
        y: Math.floor(world.worldY / TILE_SIZE),
      }
      if (cell.x < 0 || cell.y < 0 || cell.x >= mapSize || cell.y >= mapSize) {
        hoverRef.current = null
        setHoverCell(null)
        return
      }
      hoverRef.current = cell
      setHoverCell(cell)
    },
    [ScreenToWorld],
  )

  /** 攻击最近的同步玩家 */
  const HandleAttack = useCallback(() => {
    let nearestObjId = 0
    let nearestDistance = Number.MAX_VALUE
    for (const role of Object.values(remotesRef.current)) {
      if (role.dead) continue
      const distance = Math.hypot(role.tx - posRef.current.x * TILE_SIZE, role.ty - posRef.current.y * TILE_SIZE)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestObjId = role.objId
      }
    }

    setAttacking(true)
    window.setTimeout(() => setAttacking(false), 180)
    if (nearestObjId > 0) {
      sendMsg(MMO.MHT_MMO_ATTACK_CS, { target_obj_id: nearestObjId })
    }
  }, [sendMsg])

  /** 主循环: 移动插值 + 摄像机跟随即时渲染 */
  useEffect(() => {
    let raf = 0
    let lastTime = performance.now()

    const loop = (now: number) => {
      const delta = Math.min(0.1, (now - lastTime) / 1000)
      lastTime = now

      const path = pathRef.current
      if (path.length > 0) {
        const target = path[0]
        const pos = posRef.current
        const centerX = target.x + 0.5
        const centerY = target.y + 0.5
        const dx = centerX - pos.x
        const dy = centerY - pos.y
        const distance = Math.hypot(dx, dy)
        const step = MOVE_TILES_PER_SEC * delta

        if (distance <= step) {
          posRef.current = { x: centerX, y: centerY }
          path.shift()
        } else {
          posRef.current = { x: pos.x + (dx / distance) * step, y: pos.y + (dy / distance) * step }
        }
      }

      // 位置上报: 按固定频率报真实坐标, 服务端按这个点推进, 到达终点时补发一次
      const selfPos = posRef.current
      const drifted = Math.abs(selfPos.x - lastReportedPosRef.current.x) > 0.001 ||
        Math.abs(selfPos.y - lastReportedPosRef.current.y) > 0.001
      if (drifted && (pathRef.current.length === 0 || now - lastReportRef.current >= MOVE_REPORT_INTERVAL_MS)) {
        lastReportRef.current = now
        lastReportedPosRef.current = { x: selfPos.x, y: selfPos.y }
        sendMsg(MMO.MHT_MMO_MOVE_CS, {
          x: selfPos.x * TILE_SIZE,
          y: selfPos.y * TILE_SIZE,
          z: 0,
          speed: MOVE_TILES_PER_SEC * TILE_SIZE,
        })
      }

      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        const camX = posRef.current.x * TILE_SIZE
        const camY = posRef.current.y * TILE_SIZE
        const startX = Math.max(0, Math.floor((camX - VIEW_WIDTH / 2) / TILE_SIZE))
        const endX = Math.min(mapSize - 1, Math.ceil((camX + VIEW_WIDTH / 2) / TILE_SIZE))
        const startY = Math.max(0, Math.floor((camY - VIEW_HEIGHT / 2) / TILE_SIZE))
        const endY = Math.min(mapSize - 1, Math.ceil((camY + VIEW_HEIGHT / 2) / TILE_SIZE))

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        for (let y = startY; y <= endY; y += 1) {
          for (let x = startX; x <= endX; x += 1) {
            const sx = x * TILE_SIZE - camX + VIEW_WIDTH / 2
            const sy = y * TILE_SIZE - camY + VIEW_HEIGHT / 2
            DrawTile(ctx, grid[y][x], sx, sy, TILE_SIZE)
          }
        }

        // 悬停高亮
        const hover = hoverRef.current
        if (hover) {
          const sx = hover.x * TILE_SIZE - camX + VIEW_WIDTH / 2
          const sy = hover.y * TILE_SIZE - camY + VIEW_HEIGHT / 2
          ctx.strokeStyle = 'rgba(255,255,255,0.6)'
          ctx.lineWidth = 2
          ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        }

        // 路径预览
        if (pathRef.current.length > 0) {
          ctx.strokeStyle = 'rgba(255,235,120,0.65)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(posRef.current.x * TILE_SIZE - camX + VIEW_WIDTH / 2,
            posRef.current.y * TILE_SIZE - camY + VIEW_HEIGHT / 2)
          for (const step of pathRef.current) {
            ctx.lineTo((step.x + 0.5) * TILE_SIZE - camX + VIEW_WIDTH / 2,
              (step.y + 0.5) * TILE_SIZE - camY + VIEW_HEIGHT / 2)
          }
          ctx.stroke()
        }

        // 其他玩家: 先向服务端位置插值, 再绘制
        for (const role of Object.values(remotesRef.current)) {
          const lerpDx = role.tx - role.rx
          const lerpDy = role.ty - role.ry
          const lerpDist = Math.hypot(lerpDx, lerpDy)
          if (lerpDist > 0.5) {
            // 距离大时加速收敛, 丢包补帧后不会出现慢慢爬的情况
            const lerpSpeed = Math.max(REMOTE_LERP_SPEED, lerpDist * 6)
            const lerpStep = Math.min(lerpDist, lerpSpeed * delta)
            role.rx += (lerpDx / lerpDist) * lerpStep
            role.ry += (lerpDy / lerpDist) * lerpStep
          } else {
            role.rx = role.tx
            role.ry = role.ty
          }

          const px = role.rx - camX + VIEW_WIDTH / 2
          const py = role.ry - camY + VIEW_HEIGHT / 2
          if (px < -TILE_SIZE || py < -TILE_SIZE || px > VIEW_WIDTH + TILE_SIZE || py > VIEW_HEIGHT + TILE_SIZE) {
            continue
          }

          const label = role.name || `玩家${role.ownerUid}`
          const hpRatio = role.maxHp > 0 ? role.hp / role.maxHp : 1
          DrawActor(ctx, px, py, TILE_SIZE, label, '#c96a5a', false, hpRatio, role.dead)
        }

        // 伤害飘字
        floatsRef.current = floatsRef.current.filter((item) => now - item.born < DAMAGE_FLOAT_MS)
        for (const item of floatsRef.current) {
          let worldX = 0
          let worldY = 0
          if (item.objId === selfObjIdRef.current) {
            worldX = posRef.current.x * TILE_SIZE
            worldY = posRef.current.y * TILE_SIZE
          } else {
            const role = remotesRef.current[item.objId]
            if (!role) continue
            worldX = role.rx
            worldY = role.ry
          }
          const px = worldX - camX + VIEW_WIDTH / 2
          const py = worldY - camY + VIEW_HEIGHT / 2
          DrawFloats(ctx, px, py, item.damage, (now - item.born) / DAMAGE_FLOAT_MS)
        }

        // 自己
        const selfRatio = selfMaxHpRef.current > 0
          ? selfHpRef.current / selfMaxHpRef.current
          : 1
        DrawActor(
          ctx,
          posRef.current.x * TILE_SIZE - camX + VIEW_WIDTH / 2,
          posRef.current.y * TILE_SIZE - camY + VIEW_HEIGHT / 2,
          TILE_SIZE,
          username || '我',
          attackingRef.current ? '#ff9a5a' : '#f0c060',
          attackingRef.current,
          selfRatio,
          selfRatio <= 0,
        )
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [grid, sendMsg, username])

  /** 进入跨服场景(类型 1 为 MMO), 成功后 MMO 改用场景服连接 */
  const HandleCrossEnter = useCallback(async () => {
    if (crossBusy) return
    setCrossBusy(true)
    try {
      const cross_socket = await enterCross(1, CROSS_SCENE_ID)
      setSocket(cross_socket)
      gameStore.getState().showToast('已进入跨服场景', 'success')
    } catch (e: any) {
      gameStore.getState().showToast(e?.message || '进入跨服失败', 'error')
    } finally {
      setCrossBusy(false)
    }
  }, [crossBusy])

  /** 退出跨服, 连接切回归属服 */
  const HandleCrossLeave = useCallback(() => {
    leaveCross()
    setSocket(getMmoSocket())
  }, [])

  return (
    <div className="mmo-page" style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn-top" onClick={() => navigate('/hall')}>返回大厅</button>
        <button className="btn-top" onClick={HandleCrossEnter} disabled={crossBusy}>
          {crossBusy ? '进入中...' : '进入跨服'}
        </button>
        {socket !== gameSocket && (
          <button className="btn-top" onClick={HandleCrossLeave}>退出跨服</button>
        )}
        <strong>新手村</strong>
        <span style={{ opacity: 0.7 }}>
          格子 ({Math.floor(posRef.current.x)}, {Math.floor(posRef.current.y)}) / 地图 {mapSize}×{mapSize}
        </span>
        <span style={{ color: '#f0c060' }}>HP {selfHp}/{selfMaxHp}</span>
        <span style={{ opacity: 0.7 }}>在线玩家 {Object.keys(remotes).length + 1}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={VIEW_WIDTH}
          height={VIEW_HEIGHT}
          onClick={HandleClick}
          onMouseMove={HandleMouseMove}
          style={{
            display: 'block',
            cursor: 'crosshair',
            borderRadius: 8,
            maxWidth: '100%',
            // 未收到服务端场景状态前不显示场景
            visibility: inScene ? 'visible' : 'hidden',
          }}
        />
        {!inScene && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#12131a',
              color: '#c8c8d0',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            正在进入场景...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn-top"
          onClick={HandleAttack}
          style={{ background: attacking ? '#c0552f' : undefined }}
        >
          攻击最近玩家
        </button>
        <span style={{ opacity: 0.65 }}>
          点击格子移动(灰色障碍/蓝色水不可走), 摄像机跟随玩家居中
        </span>
        {hoverCell && (
          <span style={{ opacity: 0.5 }}>
            悬停 ({hoverCell.x}, {hoverCell.y}) 类型 {grid[hoverCell.y][hoverCell.x]}
          </span>
        )}
      </div>
    </div>
  )
}
