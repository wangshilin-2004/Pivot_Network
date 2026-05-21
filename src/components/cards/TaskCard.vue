<script setup lang="ts">
import type { SessionTask } from '../../types/domain'

defineProps<{ task: SessionTask }>()
</script>

<template>
  <article class="task-card compact-card">
    <h4>{{ task.name }}</h4>
    <span class="task-status" :class="{ running: task.status === '运行中' }">{{ task.status }}</span>
    <p class="muted task-output">{{ task.output }}</p>
  </article>
</template>

<style scoped>
.task-status {
  display: inline-block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--green);
  margin: 0.25rem 0 0.5rem;
}
.task-status.running {
  color: var(--accent);
}
.task-output {
  margin-top: 0.4rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--line);
  font-size: 0.88rem;
  line-height: 1.6;
}
</style>
