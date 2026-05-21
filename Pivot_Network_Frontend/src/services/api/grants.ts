import { useMock } from './client'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface GrantItem {
  id: string
  grantId: string
  grantCode: string
  orderId: string
  status: string
}

export async function fetchActiveGrants(): Promise<GrantItem[]> {
  if (useMock) {
    await delay()
    return [{ id: 'g1', grantId: 'GRANT-240518-01', grantCode: 'GRANT-240518-01', orderId: 'order-01', status: 'active' }]
  }
  const res = await fetch('http://localhost:8000/me/access-grants/active')
  if (!res.ok) throw new Error(`GET /me/access-grants/active ${res.status}`)
  const json = await res.json()
  return json.items ?? json
}

export async function redeemGrant(grantId: string, wireguardPublicKey: string): Promise<any> {
  if (useMock) {
    await delay()
    return { id: `rt-session-${Date.now().toString().slice(-6)}`, status: 'ready' }
  }
  const res = await fetch('http://localhost:8000/access-grants/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_id: grantId, wireguard_public_key: wireguardPublicKey, network_mode: 'wireguard' }),
  })
  if (!res.ok) throw new Error(`POST /access-grants/redeem ${res.status}`)
  return res.json()
}
