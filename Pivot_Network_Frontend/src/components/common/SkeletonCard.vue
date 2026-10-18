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
  padding: 18px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line);
  display: grid;
  gap: 10px;
}
.skeleton-line {
  height: 13px;
  border-radius: 7px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.11),
    rgba(255, 255, 255, 0.05)
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-title {
  width: 45%;
  height: 17px;
  margin-bottom: 4px;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
