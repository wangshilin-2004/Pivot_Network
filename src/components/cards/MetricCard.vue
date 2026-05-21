<script setup lang="ts">
defineProps<{ label: string; value: string | number; accent?: boolean }>()
</script>

<template>
  <div class="metric-card" :class="{ 'highlight-card': accent === true }">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
  </div>
</template>
