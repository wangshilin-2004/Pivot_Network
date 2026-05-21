export interface Offer {
  id: string
  title: string
  region: string
  seller: string
  price: number
  unit: string
  gpu: string
  cpu: string
  memory: string
  status: string
  runtimeImage: string
  inventory: string
  latency: string
  tags: string[]
}

export interface AlgorithmTemplate {
  id: string
  name: string
  type: string
  recommendation: string
  duration: string
  priceHint: string
  description: string
  outputs: string[]
}

export interface NodeStatus {
  name: string
  role: string
  gpuUsage: number
  cpuUsage: number
  status: string
}

export interface TrendPoint {
  label: string
  value: number
}

export interface SellerDraft {
  title: string
  status: string
  gpu: string
  price: string
}

export interface SessionTask {
  name: string
  status: string
  output: string
}

export interface WorkspaceItem {
  name: string
  type: string
  status: string
}

export interface RuntimeSession {
  id: string
  status: string
  offerTitle: string
  algorithmName: string
  duration: number
  grantCode: string
  networkMode: string
  runtimeBundleStatus: string
  workspace: string
  shellStatus: string
  logs: string[]
  tasks: SessionTask[]
  workspaceItems: WorkspaceItem[]
}

export interface PlatformSummary {
  onlineNodes: number
  offerCount: number
  sessionCount: number
  avgGpuUsage: number
}
