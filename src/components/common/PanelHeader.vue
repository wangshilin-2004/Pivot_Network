<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; tip: string; badge?: string }>()
</script>

<template>
  <div class="panel-header compact-header">
    <div>
      <div class="eyebrow">{{ eyebrow }}</div>
      <div class="title-row">
        <h3>{{ title }}</h3>
        <button class="info-chip" type="button">
          ?
          <span class="info-popover">{{ tip }}</span>
        </button>
      </div>
    </div>
    <span v-if="badge" class="badge">{{ badge }}</span>
  </div>
</template>
