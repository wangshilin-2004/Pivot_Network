# Pivot Vue Frontend

基于 `Vue3 + Vite + Pinia + Vue Router + TypeScript` 实现的 Pivot 前端成品工程。

## 页面模块

- 平台总览
- 资源市场
- 算法工坊
- 监控中心
- 卖家控制台
- 会话中心

## 工程结构

```
src/
├── main.ts
├── App.vue
├── router/index.ts
├── types/domain.ts                      # 8 个 TypeScript 接口定义
├── assets/styles/main.css
│
├── components/
│   ├── common/                          # 通用 UI 组件
│   │   ├── Badge.vue                    #   状态标签
│   │   ├── EmptyState.vue               #   空数据占位
│   │   ├── InfoChip.vue                 #   "?" 气泡提示
│   │   ├── InlineExplainer.vue          #   可折叠说明区域
│   │   ├── PanelHeader.vue             #   面板标题栏
│   │   └── SkeletonCard.vue            #   加载骨架屏
│   ├── cards/                           # 业务卡片组件
│   │   ├── ActivityItem.vue            #   活动流条目
│   │   ├── AlgorithmCard.vue           #   算法模板卡片
│   │   ├── MetricCard.vue              #   指标卡片
│   │   ├── NodeRow.vue                 #   节点状态行
│   │   ├── OfferCard.vue               #   资源市场行
│   │   └── TaskCard.vue                #   任务卡片
│   ├── CheckoutDrawer.vue              #   下单抽屉
│   ├── GpuTrendChart.vue              #    GPU 趋势柱状图
│   ├── SellerOfferForm.vue            #    卖家资源发布表单（含校验）
│   └── ToastNotification.vue          #   全局 Toast 提示
│
├── stores/
│   ├── offers.ts                        # 资源 / 算法 / 卖家草稿 / 下单
│   ├── session.ts                       # 运行时会话 / 刷新 / 暂停 / 任务
│   └── monitor.ts                       # 节点 / GPU 趋势 / 汇总
│
├── services/
│   ├── mock/platform.mock.ts            # Mock 数据层（6 类模拟数据）
│   └── api/                             # API Service 层（mock/real 可切换）
│       ├── client.ts                    #   基础客户端（useMock 开关）
│       ├── auth.ts                      #   登录 / 注册 / 当前用户
│       ├── offers.ts                    #   资源列表 / 资源详情
│       ├── orders.ts                    #   创建订单 / 激活订单
│       ├── grants.ts                    #   有效授权 / 兑换授权
│       ├── sessions.ts                  #   会话查询 / 心跳 / 停止
│       └── nodes.ts                     #   节点列表 / GPU 趋势
│
└── views/                               # 6 个页面视图
    ├── OverviewView.vue
    ├── MarketplaceView.vue
    ├── AlgorithmsView.vue
    ├── MonitorView.vue
    ├── SellerConsoleView.vue
    └── SessionCenterView.vue
```

## 更新日志

### 2026-05-21 — API Service 层搭建

- **新增 `services/api/` 目录**：7 个文件，覆盖认证、资源、订单、授权、会话、节点 6 个领域
- **mock/real 切换**：`client.ts` 中 `useMock = true` 控制全局模式，改为 `false` 即切到 `localhost:8000` 真实后端
- **接口对齐后端规格**：路径和参数匹配 `Pivot_Network_Backend-main` 的 API 定义
- **Store 接入 API**：`offers` 和 `monitor` Store 通过异步 `loadOffers()` / `loadMonitorData()` 加载数据

### 2026-05-21 — 骨架屏与过渡动画

- **骨架屏**：MarketplaceView 资源列表、MonitorView 集群趋势和节点列表均接入 SkeletonCard 加载占位
- **页面过渡**：RouterView 添加 `fade` 过渡动画（180ms opacity），切换页面时淡入淡出
- **Store 优化**：`loading` 初始值改为 `true`，确保首屏先展示骨架屏再显示数据

### 2026-05-19 — UI 细节打磨

- **Hero 区域**：删除冗余的"智能算力平台"标签；描述文字移入 `▸ 查看说明` 折叠区域
- **Topbar**：删除无意义的"资源交易与运行调度"文字
- **任务卡片**：状态字体调大（0.8→0.9rem），"完成"绿色/"运行中"蓝色区分，输出内容加分隔线
- **总览页面**：指标卡片与说明区域增加间距
- **卖家表单**："运行镜像"与"发布资源"按钮增加间距

### 2026-05-19 — 工程化打磨

- **组件拆分**：从 6 个单体 View 中提取 16 个可复用组件（common × 6 / cards × 6 / functional × 4）
- **Store 拆分**：单一 `platform.ts` 拆为 `offers` / `session` / `monitor` 三个领域 Store
- **边界状态**：增加 EmptyState 空态、SkeletonCard 骨架屏、SellerOfferForm 表单校验、ToastNotification 全局提示

### 此前版本

- 前端工程化搭建、页面路由拆分
- mock 数据与状态管理
- 买卖闭环展示、监控展示、卖家资源发布展示、会话中心展示

## 安装依赖

```bash
npm install
```

## 本地启动

```bash
npm run dev
```

访问 `http://127.0.0.1:5173`

## 生产构建

```bash
npm run build
```
