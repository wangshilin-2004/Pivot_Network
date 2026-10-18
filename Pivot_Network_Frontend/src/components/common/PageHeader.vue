<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-head">
    <div class="page-head-copy">
      <div v-if="eyebrow" class="eyebrow">{{ eyebrow }}</div>
      <h1 class="h1">{{ title }}</h1>
      <p v-if="description" class="page-head-desc">{{ description }}</p>
    </div>
    <div v-if="$slots.default" class="page-head-actions">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 32px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--line);
}

.page-head-copy {
  display: grid;
  gap: 12px;
  max-width: 720px;
}

.page-head-desc {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-2);
  max-width: 60ch;
  text-wrap: pretty;
}

.page-head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding-bottom: 4px;
}

@media (max-width: 860px) {
  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .page-head-actions {
    padding-bottom: 0;
  }
}
</style>
