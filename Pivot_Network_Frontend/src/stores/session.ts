import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useMock } from '../services/api/client'
import { ensureAuth } from '../services/api/auth'
import { createDemoWireguardKey, fetchActiveGrants, redeemGrantByCode } from '../services/api/grants'
import { mapRuntimeSession, type SessionContext } from '../services/api/mappers'
import { activateOrder, createOrder as createOrderRequest } from '../services/api/orders'
import { fetchSession, heartbeatSession, stopSession as stopSessionRequest } from '../services/api/sessions'
import { sessionMock } from '../services/mock/platform.mock'
import type { AlgorithmTemplate, Offer, RuntimeSession } from '../types/domain'
import { useConnectionStore } from './connection'

const CONTEXT_STORAGE_KEY = 'pivot.session_context'

function createEmptySession(): RuntimeSession {
  return {
    id: '—',
    status: '未开始',
    offerTitle: '尚未创建运行会话',
    algorithmName: '—',
    duration: 0,
    grantCode: '—',
    networkMode: '—',
    runtimeBundleStatus: '未启动',
    workspace: '—',
    shellStatus: '离线',
    logs: [
      '当前没有运行中的会话。',
      '在资源市场选择一台算力实例并完成下单，平台会自动签发 AccessGrant 并为你编排 RuntimeSession。',
    ],
    tasks: [{ name: '等待会话创建', status: '待启动', output: '下单后这里展示任务执行状态' }],
    workspaceItems: [],
  }
}

function readStoredContext(sessionId: string): SessionContext {
  try {
    const raw = window.localStorage.getItem(CONTEXT_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { sessionId?: string; context?: SessionContext }
    return parsed.sessionId === sessionId ? (parsed.context ?? {}) : {}
  } catch {
    return {}
  }
}

function writeStoredContext(sessionId: string, context: SessionContext): void {
  try {
    window.localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify({ sessionId, context }))
  } catch {
    /* 忽略隐私模式下的存储失败，上下文只影响展示文案 */
  }
}

function createMockSession(offer: Offer, algorithm: AlgorithmTemplate, duration: number): RuntimeSession {
  const stamp = Date.now().toString().slice(-6)
  return {
    id: `rt-session-${stamp}`,
    status: '运行中',
    offerTitle: offer.title,
    algorithmName: algorithm.name,
    duration,
    grantCode: `GRANT-${stamp}-01`,
    networkMode: 'wireguard',
    runtimeBundleStatus: 'running',
    workspace: `/workspace/${algorithm.id.replace(/^algo-/, '')}`,
    shellStatus: '在线',
    logs: [
      `订单已创建，正在为 ${offer.gpu} 编排运行时会话。`,
      'AccessGrant 已签发，WireGuard 隧道建立完成。',
      `${algorithm.name} 模板已挂载到工作区，等待任务启动。`,
    ],
    tasks: [
      { name: '环境初始化', status: '完成', output: `已按 ${algorithm.name} 模板准备容器与依赖` },
      { name: '主任务执行', status: '待启动', output: '在会话中心启动任务后展示输出' },
    ],
    workspaceItems: [
      { name: 'datasets/', type: '数据目录', status: '已同步' },
      { name: 'models/', type: '模型目录', status: '已挂载' },
      { name: `runs/${algorithm.id.replace(/^algo-/, '')}/`, type: '输出目录', status: '可写入' },
    ],
  }
}

export const useSessionStore = defineStore('session', () => {
  const session = ref<RuntimeSession>(useMock ? structuredClone(sessionMock) : createEmptySession())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLive = computed(() => session.value.status === '运行中')
  const hasSession = computed(
    () => session.value.id !== '—' && ['运行中', '已暂停', '准备中', '运行异常'].includes(session.value.status),
  )

  /** 下单 → 激活订单 → 兑换授权码 → 得到 RuntimeSession（真实模式）；mock 模式只做本地编排 */
  async function createSession(offer: Offer, algorithm: AlgorithmTemplate, duration: number): Promise<RuntimeSession> {
    loading.value = true
    error.value = null
    try {
      if (useMock) {
        session.value = createMockSession(offer, algorithm, duration)
        return session.value
      }

      await ensureAuth()
      const order = await createOrderRequest({ offerId: offer.id, durationMinutes: duration })
      const activation = await activateOrder(order.id)
      const grant = activation.access_grant
      const context: SessionContext = {
        offerTitle: offer.title,
        algorithmName: algorithm.name,
        durationMinutes: duration,
        grantCode: grant.grant_code,
      }
      const payload = await redeemGrantByCode(grant.grant_code, createDemoWireguardKey())
      session.value = mapRuntimeSession(payload, context)
      writeStoredContext(session.value.id, context)
      useConnectionStore().markConnected()
      return session.value
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      useConnectionStore().markDegraded(cause)
      throw cause
    } finally {
      loading.value = false
    }
  }

  /** 刷新页面后恢复最近一次未结束的运行时会话（真实模式） */
  async function restoreActiveSession(): Promise<boolean> {
    if (useMock) return false
    await ensureAuth()
    const grants = await fetchActiveGrants()
    const grant = grants.find((item) => Boolean(item.runtime_session_id))
    if (!grant?.runtime_session_id) return false
    const payload = await fetchSession(grant.runtime_session_id)
    const stored = readStoredContext(payload.id)
    session.value = mapRuntimeSession(payload, { ...stored, grantCode: stored.grantCode ?? grant.grant_code })
    writeStoredContext(session.value.id, {
      offerTitle: session.value.offerTitle,
      algorithmName: session.value.algorithmName,
      durationMinutes: session.value.duration,
      grantCode: session.value.grantCode,
    })
    return true
  }

  /** 会话心跳：真实模式上报心跳并刷新状态，mock 模式往终端追加一条日志 */
  async function refreshSession(): Promise<boolean> {
    loading.value = true
    try {
      if (useMock) {
        session.value.logs.unshift(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] 会话状态刷新完成，Shell 保持在线。`)
        return true
      }
      const payload = await heartbeatSession(session.value.id)
      const stored = readStoredContext(payload.id)
      session.value = mapRuntimeSession(payload, stored)
      useConnectionStore().markConnected()
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      useConnectionStore().markDegraded(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 停止/结束会话：真实模式调用后端 stop 接口，mock 模式本地改状态 */
  async function stopSession(): Promise<boolean> {
    loading.value = true
    try {
      if (useMock) {
        session.value.status = '已暂停'
        session.value.runtimeBundleStatus = 'suspended'
        session.value.shellStatus = '离线'
        session.value.logs.unshift('会话已暂停，可随时恢复。')
        return true
      }
      const payload = await stopSessionRequest(session.value.id)
      session.value = mapRuntimeSession(payload, readStoredContext(payload.id))
      useConnectionStore().markConnected()
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      useConnectionStore().markDegraded(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  function startTask(): void {
    const task = session.value.tasks[1]
    if (!task) return
    task.status = '运行中'
    task.output = session.value.status === '运行中' ? '任务已提交，正在输出运行日志' : '会话未运行，请先恢复会话'
    session.value.logs.unshift(`[${new Date().toLocaleTimeString('zh-CN', { hour12: false })}] 已提交主任务，等待运行时返回输出。`)
  }

  return { session, loading, error, isLive, hasSession, createSession, restoreActiveSession, refreshSession, stopSession, startTask }
})
