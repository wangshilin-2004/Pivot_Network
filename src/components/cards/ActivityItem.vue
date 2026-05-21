<script setup lang="ts">
import Badge from '../common/Badge.vue'

defineProps<{ label: string; description?: string; badge: string }>()
</script>

<template>
  <div class="activity-item">
    <div>
      <strong>{{ label }}</strong>
      <div v-if="description" class="muted">{{ description }}</div>
    </div>
    <Badge :text="badge" />
  </div>
</template>
