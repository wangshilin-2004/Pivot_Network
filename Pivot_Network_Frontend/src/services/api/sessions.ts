import { apiRequest, delay, useMock } from './client'
import type { RuntimeSessionPayload } from './mappers'

export async function fetchSession(id: string): Promise<RuntimeSessionPayload> {
  if (useMock) {
    await delay()
    throw new Error('mock 模式下不调用运行时接口')
  }
  return apiRequest<RuntimeSessionPayload>(`/runtime-sessions/${encodeURIComponent(id)}`)
}

export async function heartbeatSession(id: string): Promise<RuntimeSessionPayload> {
  if (useMock) {
    await delay()
    throw new Error('mock 模式下不调用运行时接口')
  }
  return apiRequest<RuntimeSessionPayload>(`/runtime-sessions/${encodeURIComponent(id)}/heartbeat`, { method: 'POST' })
}

export async function stopSession(id: string): Promise<RuntimeSessionPayload> {
  if (useMock) {
    await delay()
    throw new Error('mock 模式下不调用运行时接口')
  }
  return apiRequest<RuntimeSessionPayload>(`/runtime-sessions/${encodeURIComponent(id)}/stop`, { method: 'POST' })
}
