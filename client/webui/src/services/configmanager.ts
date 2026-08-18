// ====================================================================
//  配置加载
// ====================================================================

const cache = new Map<string, any>()
const pending = new Map<string, Promise<any>>()
const BASE_PATH = '/config/logicconfig'

// 加载单个配置表，带缓存和并发去重
export async function loadConfig<T>(name: string): Promise<T> {
  const cached = cache.get(name)
  if (cached !== undefined) return cached

  const existing = pending.get(name)
  if (existing) return existing

  const promise = _fetch(name)
  pending.set(name, promise)
  const data = await promise
  pending.delete(name)
  cache.set(name, data)
  return data as T
}

// 获取已缓存的配置（同步） 
export function getCachedConfig<T>(name: string): T | undefined {
  return cache.get(name) as T | undefined
}

// 清空配置缓存 
export function clearConfigCache(): void {
  cache.clear()
  pending.clear()
}

async function _fetch(name: string): Promise<any> {
  const url = `${BASE_PATH}/${name}.json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`配置加载失败: ${url} (${res.status})`)
  }
  return res.json()
}


// 所有预加载配置表列表 
const ALL_CONFIGS = [
  'heroconfig', 'monsterconfig', 'abilityconfig', 'effectconfig',
  'itemconfig', 'itemglobalconfig', 'attrconfig',
  'questconfig', 'questglobalconfig', 'questobjconfig',
  'herolevelconfig', 'battlestageconfig', 'battlemonstergroupconfig',
]

let preloadPromise: Promise<void> | null = null

// 预加载所有配置 
export async function preloadAllConfigs(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = Promise.all([
      ...ALL_CONFIGS.map(name => loadConfig(name)),
    ]).then(() => {})
    .catch((err) => {
      console.warn('[Config] 预加载失败, 将在按需加载时重试:', err.message)
      preloadPromise = null
    })
  }
  return preloadPromise
}

