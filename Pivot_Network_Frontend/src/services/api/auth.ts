/**
 * 认证 API：演示环境没有登录页，前端启动时用种子账号自动登录，
 * 之后的订单/授权/会话请求都带 Authorization: Bearer <token>。
 */
import { apiRequest, getToken, setToken, useMock } from './client'

export interface BackendUser {
  id: string
  email: string
  display_name: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export interface AuthSessionPayload {
  access_token: string
  token_type: string
  expires_at: string
  user: BackendUser
}

export const demoCredentials = {
  email: (import.meta.env.VITE_DEMO_EMAIL as string | undefined) ?? 'demo@pivot.local',
  password: (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) ?? 'demo1234',
}

let currentUser: BackendUser | null = null

export function getCurrentUser(): BackendUser | null {
  return currentUser
}

function applyAuthSession(payload: AuthSessionPayload): AuthSessionPayload {
  setToken(payload.access_token)
  currentUser = payload.user
  return payload
}

export async function login(email: string, password: string): Promise<AuthSessionPayload> {
  const payload = await apiRequest<AuthSessionPayload>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  return applyAuthSession(payload)
}

export async function register(
  email: string,
  displayName: string,
  password: string,
  role = 'buyer',
): Promise<AuthSessionPayload> {
  const payload = await apiRequest<AuthSessionPayload>('/auth/register', {
    method: 'POST',
    body: { email, display_name: displayName, password, role },
    auth: false,
  })
  return applyAuthSession(payload)
}

export async function fetchCurrentUser(): Promise<BackendUser | null> {
  if (!getToken()) return null
  try {
    const user = await apiRequest<BackendUser>('/auth/me')
    currentUser = user
    return user
  } catch {
    setToken(null)
    currentUser = null
    return null
  }
}

let ensurePromise: Promise<BackendUser | null> | null = null

/**
 * 确保处于已登录状态（真实后端模式）。
 * - 优先复用 localStorage 中的 token；
 * - 失效时用演示账号登录；
 * - 演示账号不存在时自动注册。
 * mock 模式直接返回 null。
 */
export function ensureAuth(): Promise<BackendUser | null> {
  if (useMock) return Promise.resolve(null)
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const existing = await fetchCurrentUser()
      if (existing) return existing
      try {
        const session = await login(demoCredentials.email, demoCredentials.password)
        return session.user
      } catch (loginError) {
        try {
          const session = await register(demoCredentials.email, '演示买家', demoCredentials.password)
          return session.user
        } catch {
          throw loginError
        }
      }
    })().finally(() => {
      ensurePromise = null
    })
  }
  return ensurePromise
}
