/**
 * API 客户端基础层
 * - 当前阶段 useMock = true，所有接口返回模拟数据
 * - 后续改为 false 即可切换到真实后端调用
 */

const BASE_URL = 'http://localhost:8000'
const MOCK_DELAY_MS = 200

export const useMock = true

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function get(path: string): Promise<any> {
  if (useMock) {
    await delay(MOCK_DELAY_MS)
    return mockData(path)
  }
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`)
  return res.json()
}

export async function post(path: string, body?: unknown): Promise<any> {
  if (useMock) {
    await delay(MOCK_DELAY_MS)
    return mockData(path)
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`)
  return res.json()
}

// 各接口的 mock 返回值，模拟后端回包格式
function mockData(_path: string) {
  // 由各 domain service 自行处理，这里只做路由分发占位
  return null
}
