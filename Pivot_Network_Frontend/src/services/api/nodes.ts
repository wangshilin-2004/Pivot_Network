import type { NodeStatus, TrendPoint } from '../../types/domain'
import { apiRequest, delay, useMock } from './client'
import { buildTrendFromNodes, mapNodes, type NodeListPayload } from './mappers'
import { nodesMock, trendMock } from '../mock/platform.mock'

export interface SwarmSummary {
  state: string
  nodeCount: number
}

export async function fetchNodes(): Promise<NodeStatus[]> {
  if (useMock) {
    await delay()
    return structuredClone(nodesMock)
  }
  const payload = await apiRequest<NodeListPayload>('/platform/nodes')
  return mapNodes(payload.items)
}

/**
 * 趋势图数据：后端暂无历史监控接口（真实数据来自 adapter 的时序采集），
 * 本机演示时按当前节点平均负载派生 8 个时间点，标注为演示派生值。
 */
export async function fetchTrend(nodes?: NodeStatus[]): Promise<TrendPoint[]> {
  if (useMock) {
    await delay()
    return structuredClone(trendMock)
  }
  const resolved = nodes ?? (await fetchNodes())
  return buildTrendFromNodes(resolved)
}

export async function fetchSwarmSummary(): Promise<SwarmSummary> {
  if (useMock) {
    return { state: 'active', nodeCount: nodesMock.length }
  }
  const payload = await apiRequest<{ swarm?: { state?: string; nodes?: number } }>('/platform/swarm/overview')
  return {
    state: String(payload.swarm?.state ?? 'unknown'),
    nodeCount: Number(payload.swarm?.nodes ?? 0),
  }
}
