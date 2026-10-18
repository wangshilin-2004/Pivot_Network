<script setup lang="ts">
import { ref } from 'vue'

const toast = ref<{ message: string; visible: boolean }>({ message: '', visible: false })
let timer: ReturnType<typeof setTimeout> | null = null

function show(message: string) {
  toast.value = { message, visible: true }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    toast.value.visible = false
  }, 2600)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" role="status">
        <span class="toast-dot" aria-hidden="true" />
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  background: rgba(24, 24, 27, 0.92);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-md);
  color: var(--text);
  font-size: 0.875rem;
  z-index: 180;
  white-space: nowrap;
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 12px rgba(48, 209, 88, 0.8);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--dur-2) var(--ease), transform var(--dur-2) var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px) scale(0.97);
}
</style>
