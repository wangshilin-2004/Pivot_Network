<script setup lang="ts">
withDefaults(
  defineProps<{
    text: string
    tone?: 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'plain'
  }>(),
  { tone: 'plain' },
)
</script>

<template>
  <span class="badge" :class="tone !== 'plain' ? `badge--${tone}` : ''">{{ text }}</span>
</template>
