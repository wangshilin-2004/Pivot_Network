# Pivot 前端成品设计方案（Vue3 版）

更新时间：`2026-05-18`

## 1. 文档目的

本文用于明确 `Pivot` 主线项目的前端成品形态，给出基于 `Vue3` 的页面结构、模块拆分、数据组织、接口接入方式与实施路线，作为后续前端开发与老师汇报的统一依据。

本文面向两个目标：

- 面向老师：说明前端系统最终要呈现什么形态
- 面向开发：说明前端工程后续应如何组织与迭代

## 2. 前端建设目标

前端不再停留于静态演示页，而应建设为一个可持续迭代、可逐步接入真实后端接口的正式工程。其目标包括：

- 展示完整的算力交易产品形态
- 支撑买卖闭环的核心交互流程
- 支撑算力监控与平台状态展示
- 支撑卖家资源管理与买家会话使用
- 预留与 `Pivot_Network_Backend-main` 后端接口对接能力

因此，前端应采用工程化方案，而不是继续使用纯静态页面结构。

## 3. 前端产品定位

### 3.1 一句话定位

前端系统应定位为：

> 一个面向算力资源交易、运行时访问与平台管理的综合前端平台。

### 3.2 前端服务对象

前端主要服务以下三类用户：

- 买家：浏览资源、选择算法、创建订单、进入会话
- 卖家：发布资源、查看上架状态、管理资源
- 平台管理人员：查看节点状态、资源状态与会话状态

### 3.3 前端当前阶段定位

当前阶段前端的主要任务是：

- 先形成完整产品界面
- 先打通前端内部状态和交互逻辑
- 后续逐步将 mock 数据替换为真实接口数据

## 4. 前端成品页面结构

建议前端最终交付形态包含以下 6 个一级页面：

### 4.1 平台总览页

作用：

- 展示平台核心指标
- 体现资源供给、资源消费与运行状态
- 作为进入各业务模块的总入口

建议展示内容：

- 在线节点数量
- 可售资源数量
- 活跃会话数量
- GPU 平均利用率
- 平台近期动态
- 核心业务路径摘要

### 4.2 资源市场页

作用：

- 面向买家展示可购买算力资源
- 形成买家交易入口

建议展示内容：

- 资源卡片列表
- GPU / CPU / 内存规格
- 区域、时延、库存、镜像
- 价格信息
- 标签分类
- 下单入口

### 4.3 算法工坊页

作用：

- 展示算法模板与资源匹配关系
- 将“买算力”进一步转化为“按任务选资源”

建议展示内容：

- 算法模板列表
- 算法类型
- 推荐资源规格
- 预计运行时长
- 输出物说明
- 推荐成本提示

### 4.4 监控中心页

作用：

- 展示平台节点与算力状态
- 体现管理侧与运维侧能力

建议展示内容：

- GPU 利用率趋势
- 节点列表
- 节点角色与健康状态
- CPU/GPU 负载条
- 异常节点提示

### 4.5 卖家控制台页

作用：

- 面向卖家展示资源发布与管理入口

建议展示内容：

- 新资源发布表单
- 已发布资源列表
- 待审核/已发布状态
- 上架价格与规格摘要

### 4.6 会话中心页

作用：

- 面向买家展示开通后的运行时使用界面

建议展示内容：

- 当前 `RuntimeSession` 状态
- 授权码或授权状态
- 工作区路径
- shell 状态
- 当前任务列表
- 日志列表
- 会话刷新、暂停、启动任务操作

## 5. 买卖闭环的前端交互设计

前端应至少支撑以下闭环：

### 5.1 买家闭环

1. 进入资源市场页
2. 选择资源
3. 选择算法模板与时长
4. 创建订单
5. 生成授权
6. 自动进入会话中心
7. 查看日志、工作区和任务状态

### 5.2 卖家闭环

1. 进入卖家控制台
2. 提交资源规格
3. 查看资源状态
4. 资源进入平台市场

### 5.3 管理闭环

1. 进入监控中心
2. 查看节点状态
3. 查看资源数量与会话数量
4. 对平台整体运行情况形成观察

## 6. Vue3 工程结构设计

建议使用如下目录结构：

```text
src/
  assets/
    images/
    icons/
    styles/

  components/
    layout/
      AppSidebar.vue
      AppTopbar.vue
      PageSection.vue
    cards/
      MetricCard.vue
      OfferCard.vue
      AlgorithmCard.vue
      NodeCard.vue
      TaskCard.vue
    charts/
      GpuTrendChart.vue
    forms/
      OfferCreateForm.vue
      CheckoutDrawer.vue

  views/
    OverviewView.vue
    MarketplaceView.vue
    AlgorithmsView.vue
    MonitorView.vue
    SellerConsoleView.vue
    SessionCenterView.vue

  router/
    index.ts

  stores/
    app.ts
    offers.ts
    session.ts
    monitor.ts

  services/
    api/
      auth.ts
      offers.ts
      orders.ts
      grants.ts
      runtimeSessions.ts
      nodes.ts
      seller.ts
    mock/
      overview.mock.ts
      offers.mock.ts
      algorithms.mock.ts
      session.mock.ts
      nodes.mock.ts
    adapters/
      responseMappers.ts

  types/
    auth.ts
    offers.ts
    orders.ts
    grants.ts
    runtime.ts
    nodes.ts

  composables/
    useCheckout.ts
    useSessionActions.ts
    useMonitorSummary.ts

  App.vue
  main.ts
```

## 7. 路由设计

建议路由如下：

```text
/
/overview
/marketplace
/algorithms
/monitor
/seller
/session
```

说明：

- `/overview`：平台总览
- `/marketplace`：资源市场
- `/algorithms`：算法工坊
- `/monitor`：监控中心
- `/seller`：卖家控制台
- `/session`：会话中心

## 8. 状态管理设计

建议使用 `Pinia` 做状态管理，并按领域拆分 store。

### 8.1 `app` store

用于管理：

- 当前页面
- 全局 loading
- 全局通知
- 用户身份占位信息

### 8.2 `offers` store

用于管理：

- 资源列表
- 当前选中资源
- 当前算法模板
- 当前下单时长

### 8.3 `session` store

用于管理：

- 当前 `RuntimeSession`
- 日志列表
- 任务状态
- 工作区状态

### 8.4 `monitor` store

用于管理：

- 节点列表
- GPU 趋势
- 监控摘要指标

## 9. 数据流设计

建议采用以下数据流：

1. 页面不直接写死业务数据
2. 页面通过 store 获取数据
3. store 优先调用 service
4. service 当前先返回 mock 数据
5. 后续逐步替换为真实接口

这样可以保证：

- 当前前端有完整展示能力
- 后续接入真实接口时只需替换 service 层
- 页面层和组件层不需要大范围改动

## 10. 接口接入设计

前端应按 `Pivot_Network_Backend-main` 的实际接口准备以下 service：

### 10.1 认证相关

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### 10.2 资源与交易相关

- `GET /offers`
- `GET /offers/{offer_id}`
- `POST /orders`
- `POST /orders/{order_id}/activate`
- `GET /me/access-grants/active`

### 10.3 会话相关

- `POST /access-grants/redeem`
- `GET /runtime-sessions/{runtime_session_id}`
- `POST /runtime-sessions/{runtime_session_id}/heartbeat`
- `POST /runtime-sessions/{runtime_session_id}/stop`

### 10.4 平台状态相关

- `GET /platform/swarm/overview`
- `GET /platform/nodes`
- `GET /platform/nodes/{node_ref}`

### 10.5 卖家资源接入相关

- `POST /seller/onboarding/sessions`
- `GET /seller/onboarding/sessions/{session_id}`
- `POST /seller/onboarding/sessions/{session_id}/join-complete`

## 11. mock 与真实接口切换策略

建议采用如下方式：

### 11.1 第一阶段

- 所有页面使用 mock 数据
- 先保证 UI 和交互完整

### 11.2 第二阶段

- 先替换读接口
- 优先接入：
  - 资源列表
  - 资源详情
  - 节点列表
  - 会话查询

### 11.3 第三阶段

- 接入交易相关写接口
- 包括：
  - 创建订单
  - 激活订单
  - 兑换授权

### 11.4 第四阶段

- 接入卖家接入链路与更复杂状态流

## 12. 老师可交付的前端成品标准

对于老师汇报，前端成品应满足以下标准：

### 12.1 页面标准

- 页面结构完整
- 模块边界清晰
- 主流程可演示
- 没有“说明页感”
- 没有明显的临时拼接痕迹

### 12.2 交互标准

- 可从资源市场进入下单流程
- 可从下单流程进入会话中心
- 可在监控中心看到平台状态
- 可在卖家控制台完成资源发布动作

### 12.3 工程标准

- 基于 `Vue3`
- 页面已拆分
- mock 与 API 层已分离
- 后续可直接接入真实接口

## 13. 推荐的开发顺序

### 第一步：搭建框架

- 初始化 `Vue3 + Vite`
- 配置路由
- 配置 `Pinia`
- 配置基础布局

### 第二步：完成页面层

- 先完成 6 个一级页面
- 再完成核心卡片组件

### 第三步：抽离 mock 数据

- 所有页面数据进入 `services/mock`
- 页面不再直接写对象常量

### 第四步：接入真实接口

- 先接资源与状态读接口
- 再接订单与会话写接口

## 14. 汇报口径建议

给老师汇报时，前端可以这样定义：

> 当前前端已采用 Vue3 重构，目的不是停留在演示页，而是直接搭建后续正式版本可持续迭代的前端工程。当前先完成完整产品形态与交互闭环，后续将逐步把 `Pivot` 现有接口接入进来。

## 15. 结论

前端下一步不应继续沿用静态页面方式补丁式扩展，而应以 `Vue3` 工程为基础，建设一套真正可持续迭代的前端系统。当前最合理的策略是：

- 先把产品形态工程化
- 先把页面与数据层解耦
- 再逐步接入 `Pivot` 现有接口

这样既能满足当前老师展示的交付要求，也能直接衔接后续正式开发。
