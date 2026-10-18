<script setup lang="ts">
import InfoChip from './InfoChip.vue'

defineProps<{ eyebrow: string; title: string; tip?: string; badge?: string }>()
</script>

<template>
  <div class="panel-header">
    <div class="panel-header-main">
      <div class="eyebrow">{{ eyebrow }}</div>
      <div class="title-row">
        <h3 class="panel-title">{{ title }}</h3>
        <InfoChip v-if="tip" :tip="tip" />
      </div>
    </div>
    <span v-if="badge" class="badge badge--green">{{ badge }}</span>
    <span v-else-if="$slots.default" class="panel-header-slot"><slot /></span>
  </div>
</template>

<style scoped>
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
}

.panel-header-main {
  display: grid;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-header-slot {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
