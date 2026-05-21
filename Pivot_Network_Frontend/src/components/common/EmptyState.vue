<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">—</div>
    <strong>{{ title }}</strong>
    <p v-if="description" class="muted">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  text-align: center;
}
.empty-icon {
  font-size: 1.5rem;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
}
</style>
