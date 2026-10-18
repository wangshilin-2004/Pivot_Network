import { apiRequest, delay, useMock } from './client'
import type { OrderActivationPayload, OrderPayload } from './mappers'

export interface CreateOrderInput {
  offerId: string
  durationMinutes: number
}

export async function createOrder(input: CreateOrderInput): Promise<OrderPayload> {
  if (useMock) {
    await delay()
    const now = new Date().toISOString()
    return {
      id: `order-mock-${Date.now().toString().slice(-6)}`,
      buyer_user_id: 'user-01',
      offer_id: input.offerId,
      status: 'created',
      requested_duration_minutes: input.durationMinutes,
      price_snapshot: { currency: 'CNY', hourly_price: 0, unit: 'hour' },
      runtime_bundle_status: 'placeholder_pending',
      access_grant_id: null,
      created_at: now,
      updated_at: now,
    }
  }
  return apiRequest<OrderPayload>('/orders', {
    method: 'POST',
    body: { offer_id: input.offerId, requested_duration_minutes: input.durationMinutes },
  })
}

export async function activateOrder(orderId: string): Promise<OrderActivationPayload> {
  if (useMock) {
    await delay()
    const now = new Date().toISOString()
    const order = await createOrder({ offerId: 'mock-offer', durationMinutes: 180 })
    return {
      order,
      access_grant: {
        id: `grant-mock-${Date.now().toString().slice(-6)}`,
        grant_id: `grant-mock-${Date.now().toString().slice(-6)}`,
        grant_code: `GRANT-${Date.now().toString().slice(-6)}`,
        buyer_user_id: order.buyer_user_id,
        order_id: order.id,
        runtime_session_id: null,
        status: 'issued',
        grant_type: 'placeholder',
        connect_material_payload: {},
        issued_at: now,
        expires_at: now,
        activated_at: null,
        revoked_at: null,
      },
    }
  }
  return apiRequest<OrderActivationPayload>(`/orders/${encodeURIComponent(orderId)}/activate`, { method: 'POST' })
}
