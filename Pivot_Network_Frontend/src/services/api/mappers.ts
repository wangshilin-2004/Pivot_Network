/**
 * 后端 schema（snake_case）→ 前端领域模型 的映射层。
 *
 * 后端把算力规格放在 price_snapshot / capability_summary / inventory_state 三个
 * 自由 JSON 字段里，前端页面使用平铺字段（gpu/cpu/memory/price…），因此所有
 * 跨端字段差异都收敛在这里，页面/store 不直接读后端字段。
 */
import type { NodeStatus, Offer, RuntimeSession, TrendPoint } from '../../types/domain'

/* ---------------------------- 后端 payload 类型 ---------------------------- */

export interface OfferPayload {
  id: string
  title: string
  status: string
  seller_user_id: string
  seller_node_id: string
  compute_node_id?: string | null
  offer_profile_id: string
  runtime_image_ref: string
  price_snapshot: Record<string, unknown>
  capability_summary: Record<string, unknown>
  inventory_state: Record<string, unknown>
  published_at?: string | null
  updated_at?: string | null
}

export interface OfferListPayload {
  items: OfferPayload[]
  total: number
}

export interface NodePayload {
  id: string
  hostname?: string | null
  role?: string | null
  status?: string | null
  availability?: string | null
  node_addr?: string | null
  platform_role?: string | null
  compute_enabled?: boolean | null
  compute_node_id?: string | null
  seller_user_id?: string | null
  accelerator?: string | null
  running_tasks?: number | null
}

export interface NodeListPayload {
  items: NodePayload[]
}

export interface OrderPayload {
  id: string
  buyer_user_id: string
  offer_id: string
  status: string
  requested_duration_minutes: number
  price_snapshot: Record<string, unknown>
  runtime_bundle_status?: string | null
  access_grant_id?: string | null
  created_at: string
  updated_at: string
}

export interface AccessGrantPayload {
  id: string
  grant_id: string
  grant_code: string
  buyer_user_id: string
  order_id: string
  runtime_session_id?: string | null
  status: string
  grant_type: string
  connect_material_payload?: Record<string, unknown>
  issued_at: string
  expires_at: string
  activated_at?: string | null
  revoked_at?: string | null
}

export interface OrderActivationPayload {
  order: OrderPayload
  access_grant: AccessGrantPayload
}

export interface RuntimeSessionPayload {
  id: string
  access_grant_id: string
  order_id: string
  offer_id: string
  buyer_user_id: string
  seller_user_id?: string | null
  compute_node_id?: string | null
  status: string
  runtime_bundle_status: string
  network_mode: string
  runtime_service_name?: string | null
  gateway_service_name?: string | null
  network_name?: string | null
  connect_metadata?: Record<string, unknown>
  wireguard_lease_metadata?: Record<string, unknown>
  recent_error_summary?: string[]
  expires_at: string
  created_at: string
  updated_at: string
  last_heartbeat_at?: string | null
  closed_at?: string | null
}

/* ------------------------------- 取值工具 ------------------------------- */

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : []
}

function hashSeed(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

/* -------------------------------- Offer -------------------------------- */

export function mapOffer(payload: OfferPayload): Offer {
  const price = asRecord(payload.price_snapshot)
  const capability = asRecord(payload.capability_summary)
  const inventory = asRecord(payload.inventory_state)
  const available = inventory.available !== false
  const stock = asNumber(inventory.stock, 0)
  const latency = asNumber(inventory.latency_ms, 0)
  const tags = asStringArray(inventory.tags)
  const gpuModel = asString(capability.gpu_model, asString(capability.accelerator, 'GPU'))
  const region = asString(inventory.region, '其他区域')
  const sellerName = asString(inventory.seller_name, '平台认证卖家')

  return {
    id: payload.id,
    title: payload.title,
    region,
    seller: sellerName,
    price: asNumber(price.hourly_price, 0),
    unit: '元/小时',
    gpu: gpuModel,
    cpu: `${asNumber(capability.cpu_limit, 0)} vCPU`,
    memory: `${asNumber(capability.memory_limit_gb, 0)} GB`,
    status: payload.status === 'listed' ? (available ? '立即可用' : '资源维护中') : '已下架',
    runtimeImage: payload.runtime_image_ref,
    inventory: stock > 0 ? `库存 ${stock} 台` : available ? '库存充足' : '暂不可用',
    latency: latency > 0 ? `${latency} ms` : '待探测',
    tags: tags.length ? tags : [gpuModel, region],
  }
}

export function mapOffers(payload: OfferListPayload): Offer[] {
  return payload.items.map(mapOffer)
}

/* --------------------------------- Node --------------------------------- */

/**
 * 后端节点接口只给出调度层状态（ready/warning/availability/running_tasks），
 * 真实 GPU/CPU 利用率来自 Docker_Swarm_Adapter 的监控数据。本机演示时 adapter
 * 未接入，这里用节点 id 的稳定哈希派生演示用负载值，保证视觉可演示，
 * 并在文档中标注为「演示派生值」。
 */
export function mapNodes(payloads: NodePayload[]): NodeStatus[] {
  return payloads.map((node) => {
    const seed = hashSeed(node.id || node.hostname || 'node')
    const degraded = node.status === 'warning' || node.availability === 'degraded' || node.availability === 'drain'
    const offline = node.status === 'down' || node.status === 'unknown'
    const runningTasks = asNumber(node.running_tasks, 0)
    const gpuUsage = degraded ? 76 + (seed % 17) : offline ? 0 : 34 + (seed % 42)
    const cpuUsage = degraded ? 68 + (seed % 22) : offline ? 0 : 28 + ((seed >> 3) % 38)
    const role =
      node.accelerator === 'nvidia-a100'
        ? 'GPU Worker'
        : node.platform_role === 'compute'
          ? 'Compute Worker'
          : asString(node.role, 'Runtime Host')

    return {
      name: asString(node.hostname, node.id),
      role: runningTasks > 0 ? `${role} · ${runningTasks} 任务` : role,
      gpuUsage,
      cpuUsage,
      status: degraded ? 'warning' : offline ? 'offline' : 'healthy',
    }
  })
}

export function buildTrendFromNodes(nodes: NodeStatus[]): TrendPoint[] {
  const average = nodes.length
    ? Math.round(nodes.reduce((sum, node) => sum + node.gpuUsage, 0) / nodes.length)
    : 0
  const offsets = [-16, -11, -14, -7, -3, 5, 1, -5]
  const now = Date.now()
  return offsets.map((offset, index) => {
    const point = new Date(now - (offsets.length - 1 - index) * 60 * 60 * 1000)
    const label = `${String(point.getHours()).padStart(2, '0')}:00`
    return { label, value: Math.max(0, Math.min(100, average + offset)) }
  })
}

/* ---------------------------- Runtime session ---------------------------- */

const SESSION_STATUS_LABELS: Record<string, string> = {
  ready: '运行中',
  running: '运行中',
  active: '运行中',
  provisioning: '准备中',
  pending: '准备中',
  created: '准备中',
  stopped: '已暂停',
  suspended: '已暂停',
  closed: '已结束',
  failed: '运行异常',
}

export interface SessionContext {
  offerTitle?: string
  algorithmName?: string
  durationMinutes?: number
  grantCode?: string
}

export function mapRuntimeSession(payload: RuntimeSessionPayload, context: SessionContext = {}): RuntimeSession {
  const connect = asRecord(payload.connect_metadata)
  const lease = asRecord(payload.wireguard_lease_metadata)
  const closed = Boolean(payload.closed_at)
  const status = closed ? '已结束' : (SESSION_STATUS_LABELS[payload.status] ?? payload.status)
  const live = status === '运行中'
  const shortId = payload.id.slice(-6)
  const workspace = asString(connect.workspace_path, `/workspace/${shortId}`)
  const errors = asStringArray(payload.recent_error_summary)
  const runtimeImage = asString(connect.runtime_image_ref, payload.runtime_service_name ?? 'runtime')
  const endpoint = lease.endpoint_host
    ? `${asString(lease.endpoint_host)}:${asNumber(lease.endpoint_port, 51820)}`
    : '—'

  const logs = [
    `运行时会话 ${payload.id} 已就绪（${status}）。`,
    `计算节点 ${asString(payload.compute_node_id, '平台调度节点')} · 运行镜像 ${runtimeImage}`,
    `网络模式 ${payload.network_mode} · 隧道端点 ${endpoint}`,
    ...(errors.length ? [`最近错误：${errors.join('；')}`] : ['暂无错误，会话保持稳定。']),
  ]

  const tasks = [
    {
      name: '环境初始化',
      status: '完成',
      output: `容器与运行时 Bundle 状态：${payload.runtime_bundle_status}`,
    },
    {
      name: asString(context.algorithmName, '主任务执行'),
      status: live ? '运行中' : '待启动',
      output: live ? '会话在线，可在工作区启动任务' : '会话未运行，启动后展示任务输出',
    },
  ]

  const workspaceItems = [
    { name: 'datasets/', type: '数据目录', status: '已同步' },
    { name: 'models/', type: '模型目录', status: '已挂载' },
    { name: 'runs/output/', type: '输出目录', status: live ? '可写入' : '待激活' },
  ]

  return {
    id: payload.id,
    status,
    offerTitle: context.offerTitle ?? '平台运行实例',
    algorithmName: context.algorithmName ?? '自定义运行环境',
    duration: context.durationMinutes ?? 180,
    grantCode: context.grantCode ?? asString(asRecord(payload.connect_metadata).grant_code, '—'),
    networkMode: payload.network_mode,
    runtimeBundleStatus: payload.runtime_bundle_status,
    workspace,
    shellStatus: live ? '在线' : '离线',
    logs,
    tasks,
    workspaceItems,
  }
}
