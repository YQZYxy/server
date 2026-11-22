// ====================================================================
//  跨服场景服连接管理
// ====================================================================

import { gameSocket, createGameSocket } from './socket'
import type { GameSocket } from './socket'
import { MHT } from '@/types'

// 跨服进场票据, 由归属服下发
export interface CrossTicket
{
  success: boolean
  error: string
  sceneIp: string
  scenePort: number
  token: string
  crossType: number
}

// 当前跨服场景服连接, 为空表示仍在归属服
let crossSocket: GameSocket | null = null

// 申请进入跨服, 等待归属服回票据
export function applyCrossEnter(crossType: number, activityId: number, timeoutMs = 5000): Promise<CrossTicket>
{
  return new Promise((resolve) =>
  {
    let timer: number | null = null

    const onResult = (body: any) =>
    {
      gameSocket.offMsg(MHT.MHT_CROSS_ENTER_SC, onResult)
      if (timer) window.clearTimeout(timer)
      resolve({
        success: !!body?.success,
        error: body?.error || '',
        sceneIp: body?.scene_ip || '',
        scenePort: Number(body?.scene_port ?? 0),
        token: body?.token || '',
        crossType: Number(body?.cross_type ?? crossType),
      })
    }

    gameSocket.onMsg(MHT.MHT_CROSS_ENTER_SC, onResult)
    timer = window.setTimeout(() =>
    {
      gameSocket.offMsg(MHT.MHT_CROSS_ENTER_SC, onResult)
      resolve({ success: false, error: '跨服申请超时', sceneIp: '', scenePort: 0, token: '', crossType })
    }, timeoutMs)

    gameSocket.sendMsg(MHT.MHT_CROSS_ENTER_CS, { cross_type: crossType, activity_id: activityId })
  })
}

// 连接场景服并完成令牌认证
export function authCrossServer(ticket: CrossTicket, roleUid = 0, timeoutMs = 8000): Promise<GameSocket>
{
  return new Promise((resolve, reject) =>
  {
    const socket = createGameSocket(`ws://${ticket.sceneIp}:${ticket.scenePort}`, ticket.token)
    let timeoutTimer: number | null = null
    let retryTimer: number | null = null
    let retryCount = 0

    const cleanup = () =>
    {
      if (timeoutTimer) window.clearTimeout(timeoutTimer)
      if (retryTimer) window.clearInterval(retryTimer)
    }

    const onAuth = (body: any) =>
    {
      socket.offMsg(MHT.MHT_CROSS_AUTH_SC, onAuth)
      cleanup()
      if (body?.success)
      {
        crossSocket = socket
        resolve(socket)
        return
      }
      socket.disconnect()
      reject(new Error(body?.error || '跨服认证失败'))
    }

    socket.onMsg(MHT.MHT_CROSS_AUTH_SC, onAuth)
    // 网关与游戏服的 TCP 是异步建立的, 认证包要多发几次才不会丢
    socket.on('connected', () =>
    {
      const send_auth = () =>
      {
        socket.sendMsg(MHT.MHT_CROSS_AUTH_CS, { role_uid: roleUid, token: ticket.token })
      }
      send_auth()
      retryCount = 1
      retryTimer = window.setInterval(() =>
      {
        if (retryCount >= 8) return
        retryCount += 1
        send_auth()
      }, 400)
    })
    timeoutTimer = window.setTimeout(() =>
    {
      socket.offMsg(MHT.MHT_CROSS_AUTH_SC, onAuth)
      cleanup()
      socket.disconnect()
      reject(new Error('跨服认证超时'))
    }, timeoutMs)

    socket.connect()
  })
}

// MMO 使用的连接: 优先跨服场景服, 否则归属服
export function getMmoSocket(): GameSocket
{
  return crossSocket ?? gameSocket
}

// 是否处于跨服场景中
export function isInCross(): boolean
{
  return crossSocket !== null
}

// 退出跨服, 释放场景服连接
export function leaveCross(): void
{
  if (!crossSocket) return
  crossSocket.disconnect()
  crossSocket = null
}

// 一键进入跨服: 申请票据 + 连接场景服
export async function enterCross(crossType: number, activityId: number, roleUid = 0): Promise<GameSocket>
{
  const ticket = await applyCrossEnter(crossType, activityId)
  if (!ticket.success)
  {
    throw new Error(ticket.error || '跨服申请被拒绝')
  }
  leaveCross()
  return authCrossServer(ticket, roleUid)
}
