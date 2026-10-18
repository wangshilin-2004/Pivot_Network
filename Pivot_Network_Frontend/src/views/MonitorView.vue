<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMonitorStore } from '../stores/monitor'
import PageHeader from '../components/common/PageHeader.vue'
import PanelHeader from '../components/common/PanelHeader.vue'
import NodeRow from '../components/cards/NodeRow.vue'
import GpuTrendChart from '../components/GpuTrendChart.vue'
import EmptyState from '../components/common/EmptyState.vue'
import SkeletonCard from '../components/common/SkeletonCard.vue'

const monitor = useMonitorStore()
const refreshing = ref(false)

const trendPeak = computed(() =>
  monitor.trend.length ? Math.max(...monitor.trend.map((point) => point.value)) : 0,
)
const trendAvg = computed(() =>
  monitor.trend.length
    ? Math.round(monitor.trend.reduce((sum, point) => sum + point.value, 0) / monitor.trend.length)
    : 0,
)
const avgCpu = computed(() =>
  monitor.nodes.length
    ? Math.round(monitor.nodes.reduce((sum, node) => sum + node.cpuUsage, 0) / monitor.nodes.length)
    : 0,
)
const alertNodes = computed(() => monitor.nodes.filter((node) => node.status !== 'healthy'))
const healthyNodes = computed(() => monitor.nodes.filter((node) => node.status === 'healthy'))
const totalNodes = computed(() => monitor.nodes.length)

const stats = computed(() => [
  { label: '在线节点', value: String(monitor.summary.onlineNodes), unit: '台', tone: 'ok' },
  { label: '平均 GPU 利用率', value: String(monitor.summary.avgGpuUsage), unit: '%', tone: 'blue' },
  { label: '平均 CPU 负载', value: String(avgCpu.value), unit: '%', tone: 'violet' },
  { label: '告警节点', value: String(alertNodes.value.length), unit: '台', tone: 'orange' },
])

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([monitor.loadMonitorData(), sleep(600)])
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageHeader
        eyebrow="Monitor"
        title="监控中心"
        description="集群的每一次呼吸都被实时记录：节点负载、GPU 曲线与健康状态，一屏读完。"
      >
        <button class="btn btn--primary" type="button" :disabled="refreshing" @click="refresh">
          <svg
            class="refresh-icon"
            :class="{ 'is-spinning': refreshing }"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13.4 8A5.4 5.4 0 1 1 11.8 4.2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M13.6 2.6v2.8h-2.8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ refreshing ? '刷新中' : '刷新状态' }}
        </button>
      </PageHeader>

      <section v-reveal class="stat-band panel">
        <div v-for="stat in stats" :key="stat.label" class="stat-band-item">
          <div class="stat">
            <div class="stat-num">
              {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <span class="stat-glow" :class="`stat-glow--${stat.tone}`" aria-hidden="true" />
        </div>
      </section>

      <div class="monitor-grid">
        <section v-reveal="60" class="panel panel--pad trend-panel">
          <PanelHeader
            eyebrow="Cluster Load"
            title="集群负载"
            tip="每两小时采样一次，展示集群整体 GPU 利用率走势。"
            badge="实时"
          />
          <GpuTrendChart
            v-if="!monitor.loading"
            :points="monitor.trend"
            :peak="trendPeak"
            :avg="trendAvg"
          />
          <SkeletonCard v-else :lines="6" />
        </section>

        <aside v-reveal="120" class="panel panel--pad health-panel">
          <PanelHeader
            eyebrow="Health"
            title="节点健康"
            tip="状态由心跳检测生成，告警节点仍在提供服务。"
          />

          <template v-if="!monitor.loading">
            <div class="health-total">
              <span class="health-big">{{ healthyNodes.length }}</span>
              <span class="health-of">/ {{ totalNodes }} 台节点健康</span>
            </div>

            <div class="health-list">
              <div v-for="node in alertNodes" :key="node.name" class="health-alert">
                <span class="alert-dot" aria-hidden="true" />
                <div class="health-alert-copy">
                  <span class="mono health-alert-name">{{ node.name }}</span>
                  <span class="health-alert-role">{{ node.role }}</span>
                </div>
                <span class="health-alert-tag">告警</span>
              </div>
              <p v-if="!alertNodes.length" class="health-ok">所有节点运行正常，暂无告警。</p>
            </div>

            <div class="hairline health-divider" />

            <div class="health-metrics">
              <div class="health-metric">
                <div class="health-metric-head">
                  <span class="health-metric-label">集群平均 GPU</span>
                  <span class="num">{{ monitor.summary.avgGpuUsage }}%</span>
                </div>
                <div class="meter">
                  <div
                    class="meter-fill meter-fill--ok"
                    :style="{ width: `${monitor.summary.avgGpuUsage}%` }"
                  />
                </div>
              </div>
              <div class="health-metric">
                <div class="health-metric-head">
                  <span class="health-metric-label">集群平均 CPU</span>
                  <span class="num">{{ avgCpu }}%</span>
                </div>
                <div class="meter">
                  <div class="meter-fill health-cpu-fill" :style="{ width: `${avgCpu}%` }" />
                </div>
              </div>
            </div>
          </template>
          <SkeletonCard v-else :lines="4" />
        </aside>
      </div>

      <section v-reveal="80" class="panel node-panel">
        <div class="panel-head">
          <div>
            <div class="eyebrow">Nodes</div>
            <h2 class="panel-title">在线节点</h2>
          </div>
          <span class="badge badge--blue">{{ totalNodes }} 台在线</span>
        </div>

        <div class="node-table">
          <div class="node-table-head" aria-hidden="true">
            <span>节点</span>
            <span>角色</span>
            <span>GPU 使用率</span>
            <span>CPU 负载</span>
            <span class="node-head-status">状态</span>
          </div>

          <template v-if="monitor.loading">
            <div class="node-skeleton">
              <SkeletonCard :lines="4" />
            </div>
          </template>
          <template v-else-if="monitor.nodes.length">
            <NodeRow v-for="node in monitor.nodes" :key="node.name" :node="node" />
          </template>
          <EmptyState
            v-else
            class="node-empty"
            title="暂无在线节点"
            description="节点接入并完成验收后，会在这里实时显示负载。"
          />
        </div>
      </section>
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
  letter-spacing: 0.02em;
  text-transform: none;
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
.monitor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

/* ---------- health panel ---------- */
.health-panel {
  display: flex;
  flex-direction: column;
}

.health-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 18px;
}

.health-big {
  font-size: 2.5rem;
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.health-of {
  font-size: var(--fs-sm);
  color: var(--text-3);
}

.health-list {
  display: grid;
  gap: 10px;
}

.health-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: rgba(255, 159, 10, 0.06);
}

.alert-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 0 4px rgba(255, 159, 10, 0.14);
  flex: none;
}

.health-alert-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.health-alert-name {
  font-size: 0.8125rem;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.health-alert-role {
  font-size: 0.75rem;
  color: var(--text-3);
}

.health-alert-tag {
  font-size: var(--fs-xs);
  color: var(--orange);
  flex: none;
}

.health-ok {
  font-size: var(--fs-sm);
  color: var(--text-3);
  line-height: 1.6;
}

.health-divider {
  margin: 20px 0;
}

.health-metrics {
  display: grid;
  gap: 16px;
  margin-top: auto;
}

.health-metric-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: var(--fs-sm);
}

.health-metric-label {
  color: var(--text-3);
}

.health-metric-head .num {
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}

.health-cpu-fill {
  background: linear-gradient(90deg, var(--violet), var(--blue));
}

/* ---------- node table ---------- */
.node-panel {
  margin-bottom: 20px;
}

.node-table-head {
  display: grid;
  grid-template-columns:
    minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(140px, 1fr) minmax(140px, 1fr)
    84px;
  align-items: center;
  gap: 24px;
  padding: 12px 32px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-4);
}

.node-head-status {
  text-align: right;
}

.node-skeleton {
  padding: 24px 32px;
}

.node-empty {
  padding: 36px 32px;
}

/* ---------- refresh icon ---------- */
.refresh-icon {
  flex: none;
}

.refresh-icon.is-spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- responsive ---------- */
@media (max-width: 1120px) {
  .monitor-grid {
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

@media (max-width: 860px) {
  .node-table-head {
    grid-template-columns:
      minmax(0, 1fr) minmax(120px, 0.8fr) minmax(120px, 1fr) minmax(120px, 1fr)
      76px;
    gap: 16px;
    padding: 12px 24px;
  }
}

@media (max-width: 640px) {
  .stat-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat-band-item {
    padding: 20px;
  }

  .node-table-head {
    display: none;
  }

  .node-skeleton {
    padding: 20px;
  }

  .node-empty {
    padding: 28px 20px;
  }

  .panel-head {
    padding: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .refresh-icon.is-spinning {
    animation: none;
  }
}
</style>
