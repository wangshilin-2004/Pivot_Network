<script setup lang="ts">
defineProps<{ summary: string; description: string }>()
</script>

<template>
  <details class="inline-explainer">
    <summary>{{ summary }}</summary>
    <p>{{ description }}</p>
  </details>
</template>
