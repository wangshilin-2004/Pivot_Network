import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { NodeStatus, TrendPoint } from '../types/domain'
import { fetchNodes, fetchTrend } from '../services/api/nodes'

export const useMonitorStore = defineStore('monitor', () => {
  const nodes = ref<NodeStatus[]>([])
  const trend = ref<TrendPoint[]>([])
  const loading = ref(true)

  const summary = computed(() => ({
    onlineNodes: nodes.value.length,
    avgGpuUsage: nodes.value.length ? Math.round(nodes.value.reduce((s, n) => s + n.gpuUsage, 0) / nodes.value.length) : 0,
  }))

  async function loadMonitorData() {
    loading.value = true
    try {
      const [n, t] = await Promise.all([fetchNodes(), fetchTrend()])
      nodes.value = n
      trend.value = t
    } finally {
      loading.value = false
    }
  }

  // 初始化加载
  loadMonitorData()

  return { nodes, trend, summary, loading, loadMonitorData }
})
