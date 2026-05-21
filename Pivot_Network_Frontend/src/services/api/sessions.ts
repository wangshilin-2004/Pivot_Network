import { useMock } from './client'
import { sessionMock } from '../mock/platform.mock'
import type { RuntimeSession } from '../../types/domain'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSession(id: string): Promise<RuntimeSession | null> {
  if (useMock) {
    await delay()
    return structuredClone(sessionMock)
  }
  const res = await fetch(`http://localhost:8000/runtime-sessions/${id}`)
  if (!res.ok) throw new Error(`GET /runtime-sessions/${id} ${res.status}`)
  return res.json()
}

export async function heartbeatSession(id: string): Promise<RuntimeSession | null> {
  if (useMock) {
    await delay()
    const s = structuredClone(sessionMock)
    s.logs.unshift('会话保活成功，运行状态已刷新。')
    return s
  }
  const res = await fetch(`http://localhost:8000/runtime-sessions/${id}/heartbeat`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /runtime-sessions/${id}/heartbeat ${res.status}`)
  return res.json()
}

export async function stopSession(id: string): Promise<RuntimeSession | null> {
  if (useMock) {
    await delay()
    const s = structuredClone(sessionMock)
    s.status = '已暂停'
    s.runtimeBundleStatus = 'suspended'
    return s
  }
  const res = await fetch(`http://localhost:8000/runtime-sessions/${id}/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /runtime-sessions/${id}/stop ${res.status}`)
  return res.json()
}
