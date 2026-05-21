<script setup lang="ts">
defineProps<{ tip: string }>()
</script>

<template>
  <button class="info-chip" type="button">
    ?
    <span class="info-popover">{{ tip }}</span>
  </button>
</template>
