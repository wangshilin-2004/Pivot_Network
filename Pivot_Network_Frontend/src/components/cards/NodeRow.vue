<script setup lang="ts">
import { computed } from 'vue'
import type { NodeStatus } from '../../types/domain'
import Badge from '../common/Badge.vue'

const props = defineProps<{ node: NodeStatus }>()

const statusMeta = computed(() => {
  if (props.node.status === 'healthy') return { text: '健康', tone: 'green' as const }
  if (props.node.status === 'warning') return { text: '告警', tone: 'orange' as const }
  return { text: props.node.status, tone: 'plain' as const }
})

const gpuTone = computed(() => (props.node.gpuUsage >= 85 ? 'warn' : 'ok'))
const cpuTone = computed(() => (props.node.cpuUsage >= 85 ? 'warn' : 'ok'))
</script>

<template>
  <div class="node-row">
    <div class="cell-name">
      <span class="node-name mono">{{ node.name }}</span>
      <span class="node-status-mobile">
        <Badge :text="statusMeta.text" :tone="statusMeta.tone" />
      </span>
    </div>

    <div class="cell-role">
      <span class="role-text">{{ node.role }}</span>
    </div>

    <div class="cell-metric cell-gpu">
      <div class="metric-head">
        <span class="metric-label">GPU</span>
        <span class="metric-value num">{{ node.gpuUsage }}<i>%</i></span>
      </div>
      <div class="meter">
        <div class="meter-fill gpu-fill" :class="`gpu-fill--${gpuTone}`" :style="{ width: `${node.gpuUsage}%` }" />
      </div>
    </div>

    <div class="cell-metric cell-cpu">
      <div class="metric-head">
        <span class="metric-label">CPU</span>
        <span class="metric-value num">{{ node.cpuUsage }}<i>%</i></span>
      </div>
      <div class="meter">
        <div class="meter-fill cpu-fill" :class="`cpu-fill--${cpuTone}`" :style="{ width: `${node.cpuUsage}%` }" />
      </div>
    </div>

    <div class="cell-status">
      <Badge :text="statusMeta.text" :tone="statusMeta.tone" />
    </div>
  </div>
</template>

<style scoped>
.node-row {
  display: grid;
  grid-template-columns:
    minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(140px, 1fr) minmax(140px, 1fr)
    84px;
  align-items: center;
  gap: 24px;
  padding: 18px 32px;
  border-top: 1px solid var(--line);
  transition: background var(--dur-1) var(--ease);
}

.node-row:first-child {
  border-top: 0;
}

.node-row:hover {
  background: var(--surface);
}

.node-name {
  display: block;
  font-size: 0.9375rem;
  color: var(--text);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-status-mobile {
  display: none;
}

.role-text {
  font-size: var(--fs-xs);
  color: var(--text-3);
}

.metric-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.metric-label {
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-3);
}

.metric-value {
  font-size: 0.875rem;
  color: var(--text-2);
}

.metric-value i {
  font-style: normal;
  font-size: 0.6875rem;
  color: var(--text-3);
  margin-left: 1px;
}

.gpu-fill {
  background: linear-gradient(90deg, var(--blue-deep), var(--blue) 62%, var(--cyan));
}

.cpu-fill {
  background: linear-gradient(90deg, var(--violet), var(--blue));
}

.gpu-fill--warn,
.cpu-fill--warn {
  background: linear-gradient(90deg, rgba(255, 159, 10, 0.5), var(--orange));
}

.cell-status {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 860px) {
  .node-row {
    grid-template-columns: minmax(0, 1fr) minmax(120px, 0.8fr) minmax(120px, 1fr) minmax(120px, 1fr) 76px;
    gap: 16px;
    padding: 16px 24px;
  }
}

@media (max-width: 640px) {
  .node-row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'name status'
      'role role'
      'gpu gpu'
      'cpu cpu';
    gap: 12px 16px;
    padding: 20px;
    border-top: 1px solid var(--line);
  }

  .cell-name {
    grid-area: name;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .cell-role {
    grid-area: role;
  }

  .cell-gpu {
    grid-area: gpu;
  }

  .cell-cpu {
    grid-area: cpu;
  }

  .cell-status {
    grid-area: status;
    display: none;
  }

  .node-status-mobile {
    display: inline-flex;
    flex: none;
  }

  .node-name {
    font-size: var(--fs-sm);
  }
}
</style>
