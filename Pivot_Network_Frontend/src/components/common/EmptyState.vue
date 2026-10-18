<script setup lang="ts">
defineProps<{ title: string; description?: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__mark" aria-hidden="true">∅</div>
    <strong class="h3">{{ title }}</strong>
    <p v-if="description" class="small">{{ description }}</p>
    <button v-if="actionLabel" class="btn btn--secondary btn--sm" type="button" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>
