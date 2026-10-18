<script setup lang="ts">
defineProps<{ tip: string }>()
</script>

<template>
  <button class="info-chip" type="button" :aria-label="`说明：${tip}`">
    ?
    <span class="info-popover">{{ tip }}</span>
  </button>
</template>
