import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useMock } from '../services/api/client'
import { fetchNodes, fetchSwarmSummary, fetchTrend } from '../services/api/nodes'
import { nodesMock, trendMock } from '../services/mock/platform.mock'
import type { NodeStatus, TrendPoint } from '../types/domain'
import { useConnectionStore } from './connection'

export const useMonitorStore = defineStore('monitor', () => {
  const nodes = ref<NodeStatus[]>([])
  const trend = ref<TrendPoint[]>([])
  const swarmState = ref<string>('unknown')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const summary = computed(() => ({
    onlineNodes: nodes.value.length,
    avgGpuUsage: nodes.value.length
      ? Math.round(nodes.value.reduce((total, node) => total + node.gpuUsage, 0) / nodes.value.length)
      : 0,
  }))

  const warnedNodes = computed(() => nodes.value.filter((node) => node.status !== 'healthy'))

  async function loadMonitorData(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const loadedNodes = await fetchNodes()
      nodes.value = loadedNodes
      const [loadedTrend, swarm] = await Promise.all([fetchTrend(loadedNodes), fetchSwarmSummary()])
      trend.value = loadedTrend
      swarmState.value = swarm.state
      if (!useMock) useConnectionStore().markConnected()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      useConnectionStore().markDegraded(cause)
      nodes.value = structuredClone(nodesMock)
      trend.value = structuredClone(trendMock)
    } finally {
      loading.value = false
    }
  }

  loadMonitorData()

  return { nodes, trend, swarmState, loading, error, summary, warnedNodes, loadMonitorData }
})
