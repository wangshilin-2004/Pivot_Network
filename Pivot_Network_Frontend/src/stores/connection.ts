/**
 * 后端连接状态（真实模式）：页面顶部/页脚用它告诉演示者当前数据来自哪里。
 * - mock：前端内置演示数据；
 * - connected：真实后端请求成功；
 * - degraded：后端不可用，已自动回退 mock 数据并展示错误原因。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiBaseUrl, useMock } from '../services/api/client'

export type BackendState = 'mock' | 'connecting' | 'connected' | 'degraded'

export const useConnectionStore = defineStore('connection', () => {
  const state = ref<BackendState>(useMock ? 'mock' : 'connecting')
  const lastError = ref<string | null>(null)
  const userEmail = ref<string | null>(null)

  const modeLabel = computed(() => {
    switch (state.value) {
      case 'mock':
        return '前端演示数据'
      case 'connecting':
        return '连接真实后端…'
      case 'connected':
        return '真实后端已连接'
      default:
        return '后端异常 · 已回退演示数据'
    }
  })

  const apiLabel = computed(() => (useMock ? '本地 Mock' : apiBaseUrl))

  function markConnected(email?: string | null) {
    state.value = 'connected'
    lastError.value = null
    if (email) userEmail.value = email
  }

  function markDegraded(error: unknown) {
    state.value = 'degraded'
    lastError.value = error instanceof Error ? error.message : String(error)
  }

  return { state, lastError, userEmail, modeLabel, apiLabel, markConnected, markDegraded }
})
