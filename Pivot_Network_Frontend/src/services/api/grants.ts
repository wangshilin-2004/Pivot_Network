import { apiRequest, delay, useMock } from './client'
import type { AccessGrantPayload, RuntimeSessionPayload } from './mappers'

interface AccessGrantListPayload {
  items: AccessGrantPayload[]
  total: number
}

/** 生成演示用 WireGuard 公钥（base64 32 字节，满足后端 8..1024 长度校验） */
export function createDemoWireguardKey(): string {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  }
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export async function fetchActiveGrants(): Promise<AccessGrantPayload[]> {
  if (useMock) {
    await delay()
    return []
  }
  const payload = await apiRequest<AccessGrantListPayload>('/me/access-grants/active')
  return payload.items
}

export async function redeemGrantByCode(
  grantCode: string,
  wireguardPublicKey: string,
  networkMode = 'wireguard',
): Promise<RuntimeSessionPayload> {
  if (useMock) {
    await delay()
    throw new Error('mock 模式下不调用授权兑换接口')
  }
  return apiRequest<RuntimeSessionPayload>('/access-grants/redeem-by-code', {
    method: 'POST',
    body: {
      grant_code: grantCode,
      wireguard_public_key: wireguardPublicKey,
      network_mode: networkMode,
    },
  })
}

export async function redeemGrant(
  grantId: string,
  wireguardPublicKey: string,
  networkMode = 'wireguard',
): Promise<RuntimeSessionPayload> {
  if (useMock) {
    await delay()
    throw new Error('mock 模式下不调用授权兑换接口')
  }
  return apiRequest<RuntimeSessionPayload>('/access-grants/redeem', {
    method: 'POST',
    body: {
      grant_id: grantId,
      wireguard_public_key: wireguardPublicKey,
      network_mode: networkMode,
    },
  })
}
