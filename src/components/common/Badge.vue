<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <span class="badge">{{ text }}</span>
</template>
