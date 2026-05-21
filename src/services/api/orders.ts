import { useMock } from './client'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface CreateOrderPayload {
  offerId: string
  duration: number
}

export interface OrderResponse {
  id: string
  offerId: string
  status: string
  duration: number
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  if (useMock) {
    await delay()
    return {
      id: `order-${Date.now().toString().slice(-6)}`,
      offerId: payload.offerId,
      status: 'active',
      duration: payload.duration,
    }
  }
  const res = await fetch('http://localhost:8000/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer_id: payload.offerId, requested_duration_minutes: payload.duration }),
  })
  if (!res.ok) throw new Error(`POST /orders ${res.status}`)
  return res.json()
}

export async function activateOrder(orderId: string): Promise<{ grantId: string; grantCode: string }> {
  if (useMock) {
    await delay()
    return { grantId: `grant-${Date.now().toString().slice(-6)}`, grantCode: `GRANT-${Date.now().toString().slice(-6)}` }
  }
  const res = await fetch(`http://localhost:8000/orders/${orderId}/activate`, { method: 'POST' })
  if (!res.ok) throw new Error(`POST /orders/${orderId}/activate ${res.status}`)
  const json = await res.json()
  return json.access_grant ?? json
}
