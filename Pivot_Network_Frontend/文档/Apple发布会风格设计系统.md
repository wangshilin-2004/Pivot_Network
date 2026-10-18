# Pivot Network · Apple 发布会风格设计系统

更新时间：`2026-10-18`
适用范围：`Pivot_Network_Frontend/`（Vue 3 + Vite + TypeScript）
状态：V2 重构基线（替代原"浅蓝仪表盘"视觉）

---

## 1. 设计定位

### 1.1 一句话

> 把算力交易平台当作一件产品来发布，而不是当作一套后台来堆砌。

### 1.2 三条设计原则

| 原则 | 含义 | 落地规则 |
|---|---|---|
| **舞台感 Stage** | 深色画布上，内容像被一束光照亮的产品 | 纯黑底 + 局部径向光晕；一屏只讲一件事 |
| **克制 Restraint** | 删除解释性噪音，只保留决策所需信息 | 去掉"查看说明"块；一个页面只有 1 个主按钮层级 |
| **尺度 Scale** | 用超大字号与数字建立视觉记忆点 | 首屏标题 56–102px；指标数字 40–72px |

### 1.3 与旧版的关键差异

| 维度 | V1（旧） | V2（本次重构） |
|---|---|---|
| 画布 | 浅蓝渐变 + 白卡片 | 纯黑舞台 + 玻璃面板 |
| 布局 | 左侧 332px 侧边栏 | 48px 玻璃顶部导航 + 全宽内容 |
| 首屏 | 右侧指标小卡 | 发布会式 Hero + 产品预览 |
| 信息密度 | 卡片套卡片 | 发丝线分隔 + 大留白 |
| 动效 | 仅 180ms 页面淡入 | 滚动驱动 + reveal + count-up + 转场 |
| 文案 | 说明文（"你可以在这里…"） | 发布会断言句（短、肯定、有节奏） |

---

## 2. 色彩

```css
--bg:          #000000;   /* 舞台 */
--bg-elev:     #0a0a0c;   /* 抬升面 */
--surface:     rgba(255,255,255,.045);
--surface-2:   rgba(255,255,255,.075);
--line:        rgba(255,255,255,.09);
--line-strong: rgba(255,255,255,.18);
--text:        #f5f5f7;
--text-2:      #a1a1a6;
--text-3:      #6e6e73;
--blue:        #2997ff;   /* 链接/强调 */
--blue-deep:   #0071e3;   /* 主按钮 */
--cyan:        #64d2ff;
--violet:      #bf5af2;
--green:       #30d158;
--orange:      #ff9f0a;
--red:         #ff453a;
```

**使用规则**

- 强调色面积 ≤ 页面 10%；渐变只用于：首屏标题关键词、主视觉光晕、进度/趋势线。
- 正文对比度必须 ≥ 4.5:1（`--text-2` 在 `#000` 上约 7.4:1，`--text-3` 仅用于非关键信息）。
- 数据色语义固定：绿=健康/完成，橙=警告/排队，红=异常，蓝=进行中。

---

## 3. 字体与排版

```css
--font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
        "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
--font-mono: "SF Mono", ui-monospace, "JetBrains Mono", Menlo, monospace;
```

| 层级 | 字号 | 字重 | 行高 | 字距 | 用途 |
|---|---|---|---|---|---|
| Display | `clamp(3.4rem, 7.4vw, 6.4rem)` | 650 | 1.04 | -0.035em | 发布会首屏 |
| H1 | `clamp(2.4rem, 4.2vw, 3.6rem)` | 650 | 1.1 | -0.03em | 页面标题 |
| H2 | `clamp(1.9rem, 3.4vw, 3rem)` | 650 | 1.15 | -0.025em | Landing 分幕标题 |
| H3 | `1.25rem` | 600 | 1.35 | -0.01em | 面板标题 |
| Body | `1.0625rem` | 400 | 1.65 | 0 | 正文 |
| Small | `.875rem` | 400 | 1.55 | 0 | 辅助 |
| Caption | `.6875rem` | 600 | 1.4 | +0.14em（大写） | 眉标/kicker |
| Stat | `clamp(2.5rem, 5vw, 4.5rem)` | 650 | 1 | -0.04em，tabular-nums | 指标数字 |

中文排版补充：中文标题字距不低于 `-0.02em`，避免挤压；长句使用 `text-wrap: pretty`。

---

## 4. 布局与栅格

- 内容最大宽度 `1180px`，桌面左右留白 ≥ 40px，移动端 20px。
- 顶部导航高 `48px`，固定；页面内容起始 padding-top `120px`。
- 间距刻度：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 140`（px）。
- 面板内边距 24–32px；面板之间 gap 20–24px。
- 断点：`1120px`（平板横屏）、`860px`（平板竖屏）、`640px`（手机）。
- 圆角：`12 / 18 / 24 / 32 / 999`。

---

## 5. 材质与组件

### 5.1 面板（Panel）

```css
background: rgba(255,255,255,.035);
border: 1px solid rgba(255,255,255,.09);
border-radius: 24px;
backdrop-filter: blur(20px);
```

- 面板内不再套面板；用 `.hairline` 发丝线分区。
- 悬停态：边框提亮至 `rgba(255,255,255,.18)`，禁止整卡放大（除 Landing 模块卡）。

### 5.2 按钮

| 类型 | 样式 | 用途 |
|---|---|---|
| Primary | `#0071e3` 底、白字、胶囊 | 每屏最多 1 个 |
| Secondary | 透明底 + 1px 描边 | 次级操作 |
| Ghost/Link | `#2997ff` 文字 + `›` | 跳转 |
| Icon | 36px 圆形玻璃底 | 关闭/菜单 |

交互：hover 提亮 6%，active `scale(.97)`，focus-visible 2px `#2997ff` 外圈。

### 5.3 状态与标签

- `.badge`：左侧 6px 圆点 + 文本，语义色半透明底。
- `.chip`：胶囊筛选，选中态蓝底 18% + 蓝字。

### 5.4 表单

- 输入框：深色底 `rgba(255,255,255,.04)`，1px 发丝线，圆角 12px，聚焦蓝色描边。
- 标签在输入框上方，12.5px，`--text-2`。

---

## 6. 动效系统

| 名称 | 参数 | 用途 |
|---|---|---|
| Ease | `cubic-bezier(.16, 1, .3, 1)` | 所有入场 |
| Reveal | `opacity 0→1, translateY(28px)→0, 720ms` | 区块/卡片入场 |
| Stagger | 每项 +70ms，最多 8 项 | 卡片列表 |
| Page | `opacity + translateY(10px) + blur(6px)→0, 320ms` | 路由切换 |
| Hover | `transform/background 200ms` | 按钮/卡片 |
| Count-up | 900ms，`easeOutExpo` | 指标数字 |
| Float | 6–10s 无限缓动 | 主视觉光晕 |

**硬性约束**

- `prefers-reduced-motion: reduce` 时：关闭 reveal 位移、count-up、无限浮动、滚动缩放，仅保留透明度切换。
- 首屏关键内容不得依赖动画才可见（无 JS 时内容依然可读）。
- 滚动监听使用 `IntersectionObserver`，不得在 scroll 事件里做布局读取。

---

## 7. 页面规范

### 7.1 Landing（`/`，新增）

发布会式长页，共 7 幕，每幕只讲一件事：

1. **Hero**：品牌 + 断言式主张 + 双 CTA + 产品预览（随滚动轻微放大）
2. **技术带**：Docker Swarm / WireGuard / FastAPI / PostgreSQL / Vue 3 / Vite 走马灯
3. **为什么**：三个行业痛点 → 三张对照卡
4. **主链**：Seller → Verified → Offer → Order → Grant → Session → WireGuard → Shell，横向时间轴逐段点亮
5. **六个模块**：2×3 大卡片，点击进入对应功能页
6. **安全边界**：买家永不直连卖家宿主机的链路示意
7. **One more thing**：超大收束句 + 进入控制台 CTA

### 7.2 应用页（`/overview` … `/session`）

统一结构：

```
PageHeader（眉标 + H1 + 一句话说明 + 右侧操作）
├─ 主面板（核心数据/交互）
└─ 辅面板（解释性/次要数据）
```

- 每页只保留一个 Primary 按钮。
- 面板标题右下角允许一个 `InfoChip` 提示，不再使用大段"查看说明"。
- 空态、加载态、异常态必须有明确文案与动作。

### 7.3 全局交互

- `⌘K / Ctrl+K` 打开命令面板：搜索页面、资源、算法模板。
- 顶部导航滚动后加发丝线 + 背景加深。
- 顶部 2px 渐变滚动进度条。

---

## 8. 可访问性与性能

- 所有交互元素可键盘到达，focus-visible 可见。
- 图标按钮必须有 `aria-label`；图表提供文本摘要。
- 首屏关键 CSS 与字体不做外链阻塞；无第三方 UI 库。
- 图片/图形优先 CSS 绘制，避免大图资源。
- 构建体积目标：JS ≤ 200KB gzip，CSS ≤ 40KB gzip。

---

## 9. 组件契约（给并行开发）

| 组件 | 路径 | 责任 |
|---|---|---|
| SiteNav | `src/components/shell/SiteNav.vue` | 顶部玻璃导航 + 滚动进度 + 移动端菜单 |
| CommandPalette | `src/components/shell/CommandPalette.vue` | ⌘K 全局跳转 |
| SiteFooter | `src/components/shell/SiteFooter.vue` | 极简页脚 |
| PageHeader | `src/components/common/PageHeader.vue` | 应用页统一头 |
| PanelHeader | `src/components/common/PanelHeader.vue` | 面板内标题（保留旧 props） |
| Badge / InfoChip / EmptyState / SkeletonCard | `src/components/common/` | 状态与反馈 |
| Landing 分幕 | `src/components/landing/*.vue` | 发布会各幕 |

样式分层：`tokens.css`（变量）→ `base.css`（reset + 原子类 + 基础组件）→ 各 `.vue` 内 `<style scoped>`（页面私有）。
**并行开发时不得修改他人 scoped 样式文件；全局原子类只由 Lead 维护。**
