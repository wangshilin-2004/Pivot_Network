import type { NodeStatus } from '../../types/domain'
import { useMock } from './client'
import { nodesMock, trendMock } from '../mock/platform.mock'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchNodes(): Promise<NodeStatus[]> {
  if (useMock) {
    await delay()
    return structuredClone(nodesMock)
  }
  const res = await fetch('http://localhost:8000/platform/nodes')
  if (!res.ok) throw new Error(`GET /platform/nodes ${res.status}`)
  const json = await res.json()
  return json.items ?? json
}

export async function fetchTrend(): Promise<{ label: string; value: number }[]> {
  if (useMock) {
    await delay()
    return structuredClone(trendMock)
  }
  // 后续对接真实监控接口
  return structuredClone(trendMock)
}
