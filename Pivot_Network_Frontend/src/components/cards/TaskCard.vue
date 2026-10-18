<script setup lang="ts">
import { computed } from 'vue'
import type { SessionTask } from '../../types/domain'
import Badge from '../common/Badge.vue'

const props = defineProps<{ task: SessionTask }>()

const badgeMeta = computed(() => {
  if (props.task.status === '完成') return { tone: 'green' as const }
  if (props.task.status === '运行中') return { tone: 'blue' as const }
  if (props.task.status === '失败') return { tone: 'red' as const }
  return { tone: 'plain' as const }
})

const running = computed(() => props.task.status === '运行中')
</script>

<template>
  <article class="task-card">
    <div class="task-head">
      <h4 class="task-name">{{ task.name }}</h4>
      <Badge :text="task.status" :tone="badgeMeta.tone" />
    </div>

    <p class="task-output">{{ task.output }}</p>

    <div v-if="running" class="task-run" aria-hidden="true">
      <span class="task-run-bar" />
    </div>
  </article>
</template>

<style scoped>
.task-card {
  padding: 16px 0;
  border-top: 1px solid var(--line);
}

.task-card:first-child {
  border-top: 0;
  padding-top: 0;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-name {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-output {
  margin-top: 8px;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-3);
  text-wrap: pretty;
}

.task-run {
  margin-top: 12px;
  height: 2px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.task-run-bar {
  display: block;
  width: 36%;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--blue-deep), var(--cyan));
  animation: task-scan 1.8s var(--ease-out) infinite;
}

@keyframes task-scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(310%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .task-run-bar {
    animation: none;
    width: 60%;
  }
}
</style>
