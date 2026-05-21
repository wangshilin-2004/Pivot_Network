import { useMock } from './client'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface UserInfo {
  id: string
  email: string
  displayName: string
  role: 'buyer' | 'seller' | 'admin'
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresAt: string
  user: UserInfo
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (useMock) {
    await delay()
    return {
      accessToken: 'mock-token-' + Date.now(),
      tokenType: 'bearer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user: { id: 'user-01', email, displayName: '演示用户', role: 'buyer' },
    }
  }
  const res = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`POST /auth/login ${res.status}`)
  return res.json()
}

export async function register(email: string, displayName: string, password: string, role = 'buyer'): Promise<AuthResponse> {
  if (useMock) {
    await delay()
    return {
      accessToken: 'mock-token-' + Date.now(),
      tokenType: 'bearer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      user: { id: 'user-01', email, displayName, role: role as 'buyer' | 'seller' },
    }
  }
  const res = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, display_name: displayName, password, role }),
  })
  if (!res.ok) throw new Error(`POST /auth/register ${res.status}`)
  return res.json()
}

export async function fetchCurrentUser(): Promise<UserInfo | null> {
  if (useMock) {
    await delay()
    return { id: 'user-01', email: 'demo@example.com', displayName: '演示用户', role: 'buyer' }
  }
  const res = await fetch('http://localhost:8000/auth/me')
  if (!res.ok) throw new Error(`GET /auth/me ${res.status}`)
  return res.json()
}
