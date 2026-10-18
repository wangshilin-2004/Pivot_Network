# Pivot Vue Frontend

基于 `Vue3 + Vite + Pinia + Vue Router + TypeScript` 实现的 Pivot 前端成品工程。

V2 已按 **Apple 发布会风格** 重构：纯黑舞台、玻璃面板、发布会式排版、滚动驱动动效、⌘K 命令面板，并新增发布会式首页 `/`。设计契约见 [Apple发布会风格设计系统.md](文档/Apple发布会风格设计系统.md)。

## 页面模块

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | 首页（发布会） | Hero、技术走马灯、痛点、主链 8 段、六模块、安全边界、结尾 CTA |
| `/overview` | 平台总览 | 指标带、主链状态、当前运行会话、近期动态 |
| `/marketplace` | 资源市场 | 标签 / GPU 筛选、价格与时延排序、资源面板、下单抽屉 |
| `/algorithms` | 算法工坊 | 算法模板库、任务类型筛选、绑定资源入口 |
| `/monitor` | 监控中心 | GPU 趋势曲线、节点健康、GPU/CPU 负载进度条 |
| `/seller` | 卖家控制台 | 资源上架表单（含校验）、发布记录 |
| `/session` | 会话中心 | 运行时会话信息、终端、工作区、任务队列 |

## 设计系统（V2）

- **Token 层** `src/assets/styles/tokens.css`：颜色（纯黑背景、`#f5f5f7` 文本、`#0071e3` 主色）、字号阶梯（Display 至 Caption）、间距刻度、圆角、缓动曲线、阴影与模糊
- **原子层** `src/assets/styles/base.css`：reset、`.container/.page/.section` 布局、`.display/.h1/.h2/.lead/.eyebrow` 排版、`.panel` 玻璃面板、`.btn` 按钮、`.chip`、`.badge`、表单控件、`.meter`、`.kv`、`.empty-state`、`.info-chip`、`.reveal` 滚动动效、路由转场
- **页面私有样式**：全部写在对应 `<style scoped>`，只依赖 token，不写全局选择器
- **语义**：每屏最多一个 Primary 按钮；状态色固定（绿色健康 / 橙色告警 / 红色异常 / 蓝色进行中）
- **动效可访问性**：`v-reveal` 使用 IntersectionObserver，`prefers-reduced-motion: reduce` 时关闭位移与循环动画

## 工程结构

```text
src/
├── main.ts                              # 应用入口 + v-reveal 指令
├── App.vue                              # 外壳：SiteNav / RouterView / SiteFooter / 抽屉 / Toast
├── router/
│   ├── index.ts                         # 7 条路由、滚动行为、页面标题
│   └── nav.ts                           # 导航项（to / label / kicker / desc）
├── types/domain.ts                      # 领域类型定义
├── assets/styles/
│   ├── tokens.css                       # 设计 token
│   ├── base.css                         # 基础原子类与动效
│   └── main.css                         # 样式入口（@import tokens + base）
│
├── components/
│   ├── shell/                           # 站点外壳
│   │   ├── SiteNav.vue                  #   玻璃导航 + 滚动进度 + 移动端菜单
│   │   ├── CommandPalette.vue           #   ⌘K 命令面板
│   │   └── SiteFooter.vue               #   页脚
│   ├── landing/                         # 发布会首页分幕
│   │   ├── ChainTimeline.vue            #   主链 8 段时间轴
│   │   ├── ModuleGrid.vue               #   六模块卡片
│   │   └── SecurityBoundary.vue         #   安全边界与隧道图示
│   ├── common/                          # 通用 UI 组件
│   │   ├── PageHeader.vue               #   页面标题区（eyebrow / h1 / 描述 / 操作区）
│   │   ├── PanelHeader.vue              #   面板标题栏（含提示气泡）
│   │   ├── Badge.vue                    #   状态标签
│   │   ├── InfoChip.vue                 #   "?" 气泡提示
│   │   ├── EmptyState.vue               #   空数据占位
│   │   └── SkeletonCard.vue             #   加载骨架屏
│   ├── cards/                           # 业务卡片组件
│   │   ├── OfferCard.vue                #   资源市场横向面板
│   │   ├── AlgorithmCard.vue            #   算法模板大卡片
│   │   ├── NodeRow.vue                  #   节点状态行
│   │   ├── TaskCard.vue                 #   任务卡片
│   │   └── ActivityItem.vue             #   发布记录条目
│   ├── CheckoutDrawer.vue               # 下单抽屉（算法/时长/预估费用）
│   ├── GpuTrendChart.vue                # GPU 趋势面积图（SVG）
│   ├── SellerOfferForm.vue              # 卖家资源发布表单（含校验）
│   └── ToastNotification.vue            # 全局 Toast 提示
│
├── stores/
│   ├── offers.ts                        # 资源 / 算法 / 卖家草稿 / 下单
│   ├── session.ts                       # 运行时会话 / 刷新 / 暂停 / 任务
│   └── monitor.ts                       # 节点 / GPU 趋势 / 汇总
│
├── services/
│   ├── mock/platform.mock.ts            # Mock 数据层
│   └── api/                             # API Service 层（mock/real 可切换）
│       ├── client.ts                    #   基础客户端（useMock 开关）
│       ├── auth.ts                      #   登录 / 注册 / 当前用户
│       ├── offers.ts                    #   资源列表 / 资源详情
│       ├── orders.ts                    #   创建订单 / 激活订单
│       ├── grants.ts                    #   有效授权 / 兑换授权
│       ├── sessions.ts                  #   会话查询 / 心跳 / 停止
│       └── nodes.ts                     #   节点列表 / GPU 趋势
│
└── views/
    ├── LandingView.vue                  # 发布会首页
    ├── OverviewView.vue
    ├── MarketplaceView.vue
    ├── AlgorithmsView.vue
    ├── MonitorView.vue
    ├── SellerConsoleView.vue
    └── SessionCenterView.vue
```

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
npm run build     # vue-tsc 严格模式 + vite build
npm run preview   # 本地预览产物
```

## 更新日志

### 2026-10-18 — V2 视觉重构（Apple 发布会风格）

- **设计底座**：新增 `tokens.css`（深色 token / 字号 / 间距 / 缓动 / 阴影）与 `base.css`（原子类、面板、按钮、表单、reveal、路由转场），`main.css` 收敛为样式入口
- **发布会首页**：新增 `/` Landing，含 Hero、技术走马灯、痛点、主链 8 段、六模块、安全边界、One more thing；拆分为 `landing/*` 三个分幕组件
- **站点外壳**：`SiteNav`（48px 玻璃导航、滚动进度、移动端全屏菜单）、`CommandPalette`（⌘K 搜索页面/资源/算法）、`SiteFooter`；`App.vue` 改为 Nav + RouterView + Footer 结构
- **六页迁移**：总览、资源市场、算法工坊、监控中心、卖家控制台、会话中心全部重写，统一 `PageHeader + 玻璃面板` 结构，移除"查看说明"式噪音
- **组件重写**：`PageHeader`、`PanelHeader`、`Badge`、`InfoChip`、`EmptyState`、`SkeletonCard`、`OfferCard`、`AlgorithmCard`、`NodeRow`、`TaskCard`、`ActivityItem`、`SellerOfferForm`、`CheckoutDrawer`、`GpuTrendChart`、`ToastNotification`
- **工程清理**：删除 V1 遗留 `MetricCard.vue`、`InlineExplainer.vue`；新增 `v-reveal` 指令；路由补 404 兜底、滚动行为与页面标题
- **验收**：7 路由 × 2 视口构建/截图/控制台/溢出检查通过，报告见 [重构验收报告.md](文档/重构验收报告.md)

### 2026-05-21 — API Service 层搭建

- 新增 `services/api/` 目录：7 个文件，覆盖认证、资源、订单、授权、会话、节点 6 个领域
- mock/real 切换：`client.ts` 中 `useMock = true` 控制全局模式，改为 `false` 即切到 `localhost:8000` 真实后端
- 接口对齐后端规格；Store 通过异步 `loadOffers()` / `loadMonitorData()` 加载数据

### 2026-05-21 — 骨架屏与过渡动画

- MarketplaceView、MonitorView 接入 SkeletonCard 加载占位；RouterView 页面过渡；`loading` 初始值改为 `true`

### 2026-05-19 — UI 细节打磨与工程化

- 从 6 个单体 View 中提取 16 个可复用组件；Store 拆分为 offers / session / monitor
- 边界状态：EmptyState 空态、SkeletonCard 骨架屏、SellerOfferForm 校验、ToastNotification 提示

### 此前版本

- 前端工程化搭建、页面路由拆分、mock 数据与状态管理、买卖闭环展示、监控与卖家发布展示
