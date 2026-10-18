<script setup lang="ts">
import { computed } from 'vue'
import { useOfferStore } from '../stores/offers'
import { useSessionStore } from '../stores/session'
import { useMonitorStore } from '../stores/monitor'
import PageHeader from '../components/common/PageHeader.vue'

const offers = useOfferStore()
const session = useSessionStore()
const monitor = useMonitorStore()

const activeSessions = computed(() => (session.session.status === '运行中' ? 1 : 0))

const stats = computed(() => [
  { label: '在线节点', value: String(monitor.summary.onlineNodes), unit: '台', tone: 'ok' },
  { label: '可售资源', value: String(offers.offers.length), unit: '个', tone: 'blue' },
  { label: '活跃会话', value: String(activeSessions.value), unit: '个', tone: 'violet' },
  {
    label: '平均 GPU 利用率',
    value: `${monitor.summary.avgGpuUsage}`,
    unit: '%',
    tone: 'orange',
  },
])

const pipeline = computed(() => [
  { name: 'Seller', meta: '卖家接入', state: 'done' },
  { name: 'Verified Node', meta: '4 台验收通过', state: 'done' },
  { name: 'Offer', meta: `${offers.offers.length} 个资源在架`, state: 'done' },
  { name: 'Order', meta: '订单创建', state: 'done' },
  { name: 'AccessGrant', meta: session.session.grantCode, state: 'live' },
  { name: 'RuntimeSession', meta: session.session.status, state: 'live' },
  { name: 'WireGuard', meta: '隧道已建立', state: 'live' },
  { name: 'Shell', meta: session.session.shellStatus, state: 'ready' },
])

const activities = [
  { tag: 'Offer', title: '新资源上架', detail: '天津算力池新增 8 卡 A100 资源', time: '10 分钟前', tone: 'blue' },
  { tag: 'Order', title: '订单已创建', detail: '买家选择 RTX 4090 推理实例', time: '32 分钟前', tone: 'violet' },
  { tag: 'Grant', title: '授权已签发', detail: session.session.grantCode, time: '32 分钟前', tone: 'green' },
  { tag: 'Task', title: '样例推理任务运行中', detail: '当前批次 18/60，平均延时 43ms', time: '刚刚', tone: 'orange' },
]

const offerRows = computed(() => offers.offers.slice(0, 3))
</script>

<template>
  <div class="page">
    <div class="container">
      <PageHeader
        eyebrow="Overview"
        title="平台总览"
        description="一屏掌握资源供给、会话运行与集群负载。数据来自前端 Mock 服务，用于演示完整业务链路。"
      >
        <RouterLink to="/marketplace" class="btn btn--primary">选购资源</RouterLink>
        <RouterLink to="/session" class="btn btn--secondary">当前会话</RouterLink>
      </PageHeader>

      <section v-reveal class="stat-band panel">
        <div v-for="stat in stats" :key="stat.label" class="stat-band-item">
          <div class="stat-num">
            {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
          <span class="stat-glow" :class="`stat-glow--${stat.tone}`" aria-hidden="true" />
        </div>
      </section>

      <div class="overview-grid">
        <div class="col-main">
          <section v-reveal class="panel panel--pad pipeline-panel">
            <div class="panel-headline">
              <div>
                <div class="eyebrow">Pipeline</div>
                <h2 class="panel-heading">从接入到可交互，一条链路完成</h2>
              </div>
              <span class="badge badge--green">全链路就绪</span>
            </div>

            <ol class="pipeline">
              <li
                v-for="(step, index) in pipeline"
                :key="step.name"
                class="pipeline-step"
                :class="`is-${step.state}`"
              >
                <span class="pipeline-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="pipeline-dot" aria-hidden="true" />
                <span class="pipeline-name">{{ step.name }}</span>
                <span class="pipeline-meta">{{ step.meta }}</span>
              </li>
            </ol>
          </section>

          <section v-reveal="80" class="panel offers-panel">
            <div class="panel-head">
              <div>
                <div class="panel-title">在架资源</div>
                <div class="panel-meta">按小时计费，下单后自动编排运行会话</div>
              </div>
              <RouterLink to="/marketplace" class="btn--ghost">查看全部 →</RouterLink>
            </div>
            <div class="offer-list">
              <RouterLink
                v-for="offer in offerRows"
                :key="offer.id"
                :to="'/marketplace'"
                class="offer-row"
              >
                <div class="offer-row-main">
                  <span class="offer-row-title">{{ offer.title }}</span>
                  <span class="offer-row-meta">{{ offer.gpu }} · {{ offer.region }}</span>
                </div>
                <div class="offer-row-tags">
                  <span v-for="tag in offer.tags.slice(0, 2)" :key="tag" class="offer-tag">{{ tag }}</span>
                </div>
                <div class="offer-row-price">
                  ¥{{ offer.price }}<small>/时</small>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>

        <aside class="col-side">
          <section v-reveal="60" class="panel panel--pad session-card">
            <div class="panel-headline">
              <div>
                <div class="eyebrow">Runtime</div>
                <h2 class="panel-heading">当前运行会话</h2>
              </div>
              <span class="badge badge--green">{{ session.session.status }}</span>
            </div>

            <dl class="session-kv">
              <div>
                <dt>会话 ID</dt>
                <dd class="mono">{{ session.session.id }}</dd>
              </div>
              <div>
                <dt>算力实例</dt>
                <dd>{{ session.session.offerTitle }}</dd>
              </div>
              <div>
                <dt>算法模板</dt>
                <dd>{{ session.session.algorithmName }}</dd>
              </div>
              <div>
                <dt>授权码</dt>
                <dd class="mono">{{ session.session.grantCode }}</dd>
              </div>
            </dl>

            <RouterLink to="/session" class="btn btn--secondary btn--block">进入会话中心</RouterLink>
          </section>

          <section v-reveal="120" class="panel panel--pad activity-card">
            <div class="panel-headline">
              <div>
                <div class="eyebrow">Activity</div>
                <h2 class="panel-heading">近期动态</h2>
              </div>
            </div>
            <ol class="activity">
              <li v-for="item in activities" :key="item.title" class="activity-item">
                <span class="activity-dot" :class="`activity-dot--${item.tone}`" aria-hidden="true" />
                <div class="activity-main">
                  <div class="activity-title">{{ item.title }}</div>
                  <div class="activity-detail">{{ item.detail }}</div>
                </div>
                <span class="activity-time">{{ item.time }}</span>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- stat band ---------- */
.stat-band {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20px;
}

.stat-band-item {
  position: relative;
  padding: 26px 28px;
  border-left: 1px solid var(--line);
  overflow: hidden;
}

.stat-band-item:first-child {
  border-left: 0;
}

.stat-num {
  font-size: clamp(2.2rem, 3.4vw, 3rem);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-3);
  margin-left: 4px;
  letter-spacing: 0;
}

.stat-label {
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--text-3);
}

.stat-glow {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
  pointer-events: none;
}

.stat-glow--ok {
  background: rgba(48, 209, 88, 0.4);
}
.stat-glow--blue {
  background: rgba(41, 151, 255, 0.4);
}
.stat-glow--violet {
  background: rgba(191, 90, 242, 0.4);
}
.stat-glow--orange {
  background: rgba(255, 159, 10, 0.35);
}

/* ---------- layout ---------- */
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 20px;
}

.col-main,
.col-side {
  display: grid;
  gap: 20px;
  align-content: start;
}

.panel-headline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.panel-heading {
  margin-top: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.015em;
}

/* ---------- pipeline ---------- */
.pipeline {
  display: grid;
  gap: 2px;
}

.pipeline-step {
  position: relative;
  display: grid;
  grid-template-columns: 28px 12px minmax(120px, 1fr) minmax(0, 1.2fr);
  align-items: center;
  gap: 12px;
  padding: 13px 4px 13px 0;
  border-top: 1px solid var(--line);
}

.pipeline-step:first-child {
  border-top: 0;
}

.pipeline-index {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-4);
}

.pipeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-4);
  position: relative;
}

.pipeline-step.is-done .pipeline-dot {
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(48, 209, 88, 0.12);
}

.pipeline-step.is-live .pipeline-dot {
  background: var(--blue);
  box-shadow: 0 0 0 4px rgba(41, 151, 255, 0.16);
  animation: pulse 2.4s var(--ease) infinite;
}

.pipeline-step.is-ready .pipeline-dot {
  background: var(--cyan);
  box-shadow: 0 0 0 4px rgba(100, 210, 255, 0.14);
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(41, 151, 255, 0.16);
  }
  50% {
    box-shadow: 0 0 0 7px rgba(41, 151, 255, 0.06);
  }
}

.pipeline-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text);
}

.pipeline-meta {
  font-size: 0.8125rem;
  color: var(--text-3);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- offers ---------- */
.offers-panel {
  padding: 0;
}

.offer-list {
  display: grid;
}

.offer-row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto auto;
  align-items: center;
  gap: 20px;
  padding: 18px 24px;
  border-top: 1px solid var(--line);
  color: var(--text);
  text-decoration: none;
  transition: background var(--dur-1) var(--ease);
}

.offer-row:hover {
  background: var(--surface);
  text-decoration: none;
}

.offer-row-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.offer-row-title {
  font-size: 0.9375rem;
  font-weight: 500;
}

.offer-row-meta {
  font-size: 0.8125rem;
  color: var(--text-3);
}

.offer-row-tags {
  display: flex;
  gap: 6px;
}

.offer-tag {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--line);
  font-size: 0.6875rem;
  color: var(--text-3);
}

.offer-row-price {
  font-size: 1.125rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.offer-row-price small {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-3);
}

/* ---------- session card ---------- */
.session-kv {
  display: grid;
  gap: 14px;
  margin: 0 0 22px;
}

.session-kv > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.session-kv > div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.session-kv dt {
  font-size: 0.75rem;
  color: var(--text-3);
}

.session-kv dd {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text);
  text-align: right;
}

/* ---------- activity ---------- */
.activity {
  display: grid;
}

.activity-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--line);
  align-items: start;
}

.activity-item:first-child {
  border-top: 0;
}

.activity-dot {
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
}

.activity-dot--blue {
  background: var(--blue);
}
.activity-dot--violet {
  background: var(--violet);
}
.activity-dot--green {
  background: var(--green);
}
.activity-dot--orange {
  background: var(--orange);
}

.activity-main {
  min-width: 0;
}

.activity-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.activity-detail {
  margin-top: 3px;
  font-size: 0.75rem;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: 0.6875rem;
  color: var(--text-4);
  white-space: nowrap;
}

/* ---------- responsive ---------- */
@media (max-width: 1120px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
  .stat-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat-band-item:nth-child(3) {
    border-left: 0;
  }
  .stat-band-item:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
}

@media (max-width: 640px) {
  .stat-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat-band-item {
    padding: 20px;
  }
  .pipeline-step {
    grid-template-columns: 22px 10px minmax(0, 1fr);
  }
  .pipeline-meta {
    grid-column: 3;
    text-align: left;
    font-size: 0.75rem;
  }
  .offer-row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 16px 20px;
  }
  .offer-row-tags {
    display: none;
  }
}
</style>
