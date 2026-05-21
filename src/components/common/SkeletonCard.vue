<script setup lang="ts">
defineProps<{ lines?: number }>()
</script>

<template>
  <div class="skeleton-card">
    <div class="skeleton-line skeleton-title"></div>
    <div v-for="i in (lines ?? 3)" :key="i" class="skeleton-line" :style="{ width: `${65 + i * 8}%` }"></div>
  </div>
</template>

<style scoped>
.skeleton-card {
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--line);
  display: grid;
  gap: 0.6rem;
}
.skeleton-line {
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(23, 50, 77, 0.06), rgba(23, 50, 77, 0.1), rgba(23, 50, 77, 0.06));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-title {
  width: 45%;
  height: 18px;
  margin-bottom: 0.3rem;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
