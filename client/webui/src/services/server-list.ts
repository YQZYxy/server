// ====================================================================
//  选服列表与归属服地址
// ====================================================================

// 服务器条目, 由默认服 /api/servers 下发
export interface ServerInfo
{
  name: string
  server_id: number
  ip: string
  port: number
}

// 已选服务器在 sessionStorage 的键
const SELECTED_SERVER_KEY = 'selected_server_target'

// 请求默认服的选服列表, 失败直接抛错
export async function fetchServerList(): Promise<ServerInfo[]>
{
  const res = await fetch('/api/servers')
  if (!res.ok)
  {
    throw new Error(`选服列表加载失败 (${res.status})`)
  }

  const data = await res.json()
  if (!Array.isArray(data?.servers))
  {
    throw new Error('选服列表格式错误')
  }
  return data.servers as ServerInfo[]
}

// 网关地址, 选服后 WebSocket 直连该网关
export function serverBaseUrl(server: ServerInfo): string
{
  return `http://${server.ip}:${server.port}`
}

// 保存选中的服务器, 页面刷新后仍连回同一台服
export function selectServer(server: ServerInfo): void
{
  sessionStorage.setItem(SELECTED_SERVER_KEY, JSON.stringify(server))
}

// 读取已选服务器, 未选服时返回 null
export function getSelectedServer(): ServerInfo | null
{
  const raw = sessionStorage.getItem(SELECTED_SERVER_KEY)
  return raw ? (JSON.parse(raw) as ServerInfo) : null
}
