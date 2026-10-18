/**
 * API 客户端基础层（V2）
 *
 * 两种运行模式：
 * - mock（默认，`npm run dev` / `npm run build`）：不依赖后端即可展示完整页面；
 * - 真实后端（`npm run dev:real`，读取 .env.demo）：切换 VITE_USE_MOCK=false，
 *   所有请求走 http://127.0.0.1:8000/api/v1，并携带演示账号的 Bearer Token。
 *
 * 约定：真实模式下所有响应都是后端 schema（snake_case），由 mappers.ts 转换成
 * 前端领域模型，页面与 store 不直接依赖后端字段。
 */

const env = import.meta.env
const API_BASE_URL = ((env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')
const API_PREFIX = '/api/v1'
const REQUEST_TIMEOUT_MS = 15000
const MOCK_DELAY_MS = 200
const TOKEN_STORAGE_KEY = 'pivot.access_token'

/** true = 使用本地 mock 数据；false = 请求真实后端 */
export const useMock = (env.VITE_USE_MOCK as string | undefined) !== 'false'

/** 当前模式实际请求的后端地址（用于页脚/控制台提示） */
export const apiBaseUrl = `${API_BASE_URL}${API_PREFIX}`

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* 隐私模式下 localStorage 不可用时忽略，token 只保留在内存里 */
  }
  if (token) memoryToken = token
  else memoryToken = null
}

let memoryToken: string | null = null

function resolveToken(): string | null {
  return getToken() ?? memoryToken
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** 是否附带 Bearer Token，默认 true（登录/注册接口传 false） */
  auth?: boolean
  timeoutMs?: number
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, timeoutMs = REQUEST_TIMEOUT_MS } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? resolveToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (error) {
      const detail =
        error instanceof DOMException && error.name === 'AbortError'
          ? `请求超时（${timeoutMs}ms）`
          : (error as Error).message
      throw new ApiError(0, `无法连接后端 ${API_BASE_URL}：${detail}`)
    }

    if (!response.ok) throw new ApiError(response.status, await readErrorDetail(response, path))
    if (response.status === 204) return undefined as T
    return (await response.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

async function readErrorDetail(response: Response, path: string): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown }
    const detail = payload.detail
    if (typeof detail === 'string' && detail) return `${detail}（${path}）`
    if (detail) return `${JSON.stringify(detail)}（${path}）`
  } catch {
    /* 响应体不是 JSON 时忽略 */
  }
  return `请求失败 ${response.status}（${path}）`
}
