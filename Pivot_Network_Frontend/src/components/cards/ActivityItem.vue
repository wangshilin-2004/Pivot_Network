<script setup lang="ts">
import { computed } from 'vue'
import Badge from '../common/Badge.vue'

const props = defineProps<{ label: string; description?: string; badge: string }>()

const badgeMeta = computed(() => {
  if (props.badge === '已发布') return { tone: 'green' as const }
  if (props.badge === '待审核') return { tone: 'orange' as const }
  if (props.badge === '已暂停' || props.badge === '已结束') return { tone: 'red' as const }
  return { tone: 'plain' as const }
})
</script>

<template>
  <div class="list-item activity-item">
    <div class="activity-main">
      <div class="activity-label">{{ label }}</div>
      <div v-if="description" class="activity-desc">{{ description }}</div>
    </div>
    <Badge :text="badge" :tone="badgeMeta.tone" />
  </div>
</template>

<style scoped>
.activity-item {
  align-items: center;
}

.activity-main {
  min-width: 0;
}

.activity-label {
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-desc {
  margin-top: 4px;
  font-size: 0.8125rem;
  color: var(--text-3);
}
</style>
