<script setup lang="ts">
import { ref } from 'vue'

const toast = ref<{ message: string; visible: boolean }>({ message: '', visible: false })
let timer: ReturnType<typeof setTimeout> | null = null

function show(message: string) {
  toast.value = { message, visible: true }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { toast.value.visible = false }, 2200)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div class="toast" :class="{ hidden: !toast.visible }">{{ toast.message }}</div>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  padding: 0.95rem 1.2rem;
  border-radius: 999px;
  background: rgba(23, 50, 77, 0.92);
  color: white;
  box-shadow: 0 16px 34px rgba(31, 73, 125, 0.18);
  z-index: 40;
  transition: opacity 200ms ease;
}
.toast.hidden {
  opacity: 0;
  pointer-events: none;
}
</style>
