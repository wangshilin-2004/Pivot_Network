<script setup lang="ts">
import type { NodeStatus } from '../../types/domain'
import Badge from '../common/Badge.vue'

defineProps<{ node: NodeStatus }>()
</script>

<template>
  <div class="node-row">
    <div><strong>{{ node.name }}</strong><div class="muted">{{ node.role }}</div></div>
    <div><div class="muted">GPU</div><div class="progress-track"><div class="progress-fill" :style="{ width: `${node.gpuUsage}%` }"></div></div></div>
    <div><div class="muted">CPU</div><div class="progress-track"><div class="progress-fill" :style="{ width: `${node.cpuUsage}%` }"></div></div></div>
    <div><Badge :text="node.status" /></div>
  </div>
</template>
