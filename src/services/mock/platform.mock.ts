import type {
  AlgorithmTemplate,
  NodeStatus,
  Offer,
  RuntimeSession,
  SellerDraft,
  TrendPoint,
} from '../../types/domain'

export const navItems = [
  { id: 'overview', title: '平台总览', subtitle: '指标与状态' },
  { id: 'marketplace', title: '资源市场', subtitle: '资源选购' },
  { id: 'algorithms', title: '算法工坊', subtitle: '模板推荐' },
  { id: 'monitor', title: '监控中心', subtitle: '节点监控' },
  { id: 'seller', title: '卖家控制台', subtitle: '资源上架' },
  { id: 'session', title: '会话中心', subtitle: '任务工作区' },
] as const

export const offersMock: Offer[] = [
  {
    id: 'offer-a100-01',
    title: 'A100 80GB 训练实例',
    region: '天津算力池',
    seller: 'seller_tianjin_01',
    price: 42,
    unit: '元/小时',
    gpu: 'A100 80GB',
    cpu: '64 vCPU',
    memory: '256 GB',
    status: '立即可用',
    runtimeImage: 'pytorch:2.3-cuda12',
    inventory: '8 卡资源池',
    latency: '14 ms',
    tags: ['训练', '大模型', '高带宽'],
  },
  {
    id: 'offer-4090-03',
    title: 'RTX 4090 推理实例',
    region: '北京边缘节点',
    seller: 'seller_beijing_03',
    price: 18,
    unit: '元/小时',
    gpu: 'RTX 4090',
    cpu: '32 vCPU',
    memory: '128 GB',
    status: '库存充足',
    runtimeImage: 'llm-infer:latest',
    inventory: '4 卡共享池',
    latency: '9 ms',
    tags: ['推理', '低时延', '视觉模型'],
  },
  {
    id: 'offer-l40-02',
    title: 'L40S 多模态实例',
    region: '上海协同节点',
    seller: 'seller_shanghai_02',
    price: 26,
    unit: '元/小时',
    gpu: 'L40S',
    cpu: '48 vCPU',
    memory: '192 GB',
    status: '排队中',
    runtimeImage: 'multimodal-runtime:v1',
    inventory: '2 卡整租',
    latency: '18 ms',
    tags: ['多模态', '训练', '推理一体'],
  },
]

export const algorithmsMock: AlgorithmTemplate[] = [
  {
    id: 'algo-detect',
    name: '目标检测 YOLOv11',
    type: '视觉推理',
    recommendation: 'RTX 4090 / L40S',
    duration: '15-40 分钟',
    priceHint: '推荐低时延实例',
    description: '适合工业巡检、视频流分析和图像批处理任务。',
    outputs: ['检测结果图', '置信度报告', '运行日志'],
  },
  {
    id: 'algo-llm',
    name: '大模型微调 LoRA',
    type: '训练任务',
    recommendation: 'A100 80GB',
    duration: '2-6 小时',
    priceHint: '推荐高显存实例',
    description: '适合参数高效微调、领域数据训练和实验迭代。',
    outputs: ['Checkpoint', 'Loss 曲线', '训练日志'],
  },
  {
    id: 'algo-seg',
    name: '遥感图像分割',
    type: '遥感分析',
    recommendation: 'L40S / A100',
    duration: '40-90 分钟',
    priceHint: '推荐多模态实例',
    description: '适合地表识别、目标提取和批量图像分析。',
    outputs: ['分割掩码', '统计结果', '任务报告'],
  },
]

export const nodesMock: NodeStatus[] = [
  { name: 'tj-swarm-worker-01', role: 'GPU Worker', gpuUsage: 82, cpuUsage: 61, status: 'healthy' },
  { name: 'tj-swarm-worker-02', role: 'GPU Worker', gpuUsage: 73, cpuUsage: 54, status: 'healthy' },
  { name: 'bj-edge-node-03', role: 'Edge Gateway', gpuUsage: 47, cpuUsage: 36, status: 'warning' },
  { name: 'sh-runtime-node-04', role: 'Runtime Host', gpuUsage: 65, cpuUsage: 48, status: 'healthy' },
]

export const trendMock: TrendPoint[] = [
  { label: '10:00', value: 52 },
  { label: '11:00', value: 58 },
  { label: '12:00', value: 61 },
  { label: '13:00', value: 57 },
  { label: '14:00', value: 68 },
  { label: '15:00', value: 74 },
  { label: '16:00', value: 71 },
  { label: '17:00', value: 66 },
]

export const sellerDraftsMock: SellerDraft[] = [
  { title: '边缘视频分析实例', status: '待审核', gpu: 'RTX 4080', price: '16 元/小时' },
  { title: 'A800 训练资源池', status: '已发布', gpu: 'A800', price: '35 元/小时' },
]

export const sessionMock: RuntimeSession = {
  id: 'rt-session-240518',
  status: '运行中',
  offerTitle: 'RTX 4090 推理实例',
  algorithmName: '目标检测 YOLOv11',
  duration: 180,
  grantCode: 'GRANT-240518-01',
  networkMode: 'secure-access',
  runtimeBundleStatus: 'ready',
  workspace: '/workspace/vision-detect',
  shellStatus: '在线',
  logs: ['运行时资源已分配完成。', '算法模板与数据集已挂载到工作区。', '当前会话已进入可执行状态。'],
  tasks: [
    { name: '环境初始化', status: '完成', output: '容器、依赖与数据目录已准备完毕' },
    { name: '样例推理任务', status: '运行中', output: '当前批次 18/60，平均延时 43ms' },
  ],
  workspaceItems: [
    { name: 'datasets/', type: '数据目录', status: '已同步' },
    { name: 'models/', type: '模型目录', status: '已挂载' },
    { name: 'runs/output/', type: '输出目录', status: '可写入' },
  ],
}
