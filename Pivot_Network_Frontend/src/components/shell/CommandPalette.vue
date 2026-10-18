<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { navItems } from '../../router/nav'
import { useOfferStore } from '../../stores/offers'

interface Entry {
  id: string
  group: string
  label: string
  hint: string
  to: string
}

const open = defineModel<boolean>('open', { default: false })
const router = useRouter()
const offers = useOfferStore()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)
let restoreFocus: HTMLElement | null = null

const entries = computed<Entry[]>(() => [
  ...navItems.map((item) => ({
    id: `page-${item.to}`,
    group: '页面',
    label: item.label,
    hint: item.kicker,
    to: item.to,
  })),
  ...offers.offers.map((offer) => ({
    id: `offer-${offer.id}`,
    group: '资源',
    label: offer.title,
    hint: `${offer.gpu} · ${offer.price} ${offer.unit} · ${offer.region}`,
    to: '/marketplace',
  })),
  ...offers.algorithms.map((algo) => ({
    id: `algo-${algo.id}`,
    group: '算法',
    label: algo.name,
    hint: `${algo.type} · ${algo.duration}`,
    to: '/algorithms',
  })),
])

const filtered = computed<Entry[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return entries.value.slice(0, 9)
  return entries.value
    .filter((entry) => `${entry.label} ${entry.hint} ${entry.group}`.toLowerCase().includes(q))
    .slice(0, 12)
})

watch(filtered, () => {
  activeIndex.value = 0
})

watch(open, async (value) => {
  if (value) {
    restoreFocus = document.activeElement as HTMLElement | null
    query.value = ''
    activeIndex.value = 0
    document.body.style.overflow = 'hidden'
    await nextTick()
    inputRef.value?.focus()
  } else {
    document.body.style.overflow = ''
    restoreFocus?.focus?.()
    restoreFocus = null
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function close() {
  open.value = false
}

function choose(entry?: Entry) {
  const target = entry ?? filtered.value[activeIndex.value]
  if (!target) return
  close()
  if (router.currentRoute.value.path !== target.to) router.push(target.to)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'Tab') {
    const focusables = Array.from(
      panelRef.value?.querySelectorAll<HTMLElement>('input, button') ?? [],
    ).filter((el) => !el.hasAttribute('disabled'))
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % Math.max(1, filtered.value.length)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      (activeIndex.value - 1 + filtered.value.length) % Math.max(1, filtered.value.length)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    choose()
  }
}

function isGroupStart(index: number) {
  return index === 0 || filtered.value[index].group !== filtered.value[index - 1].group
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="open" class="palette-root" role="dialog" aria-modal="true" aria-label="全局搜索">
        <div class="palette-backdrop" @click="close" />
        <div ref="panelRef" class="palette" @keydown="onKeydown">
          <div class="palette-search">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.4" />
              <path d="M10.6 10.6 14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              class="palette-input"
              type="text"
              placeholder="搜索页面、资源或算法模板…"
              aria-label="搜索关键词"
            />
            <button class="palette-esc" type="button" @click="close">ESC</button>
          </div>

          <div class="palette-results" role="listbox">
            <template v-for="(entry, index) in filtered" :key="entry.id">
              <div v-if="isGroupStart(index)" class="palette-group">{{ entry.group }}</div>
              <button
                class="palette-item"
                :class="{ 'is-active': index === activeIndex }"
                type="button"
                role="option"
                :aria-selected="index === activeIndex"
                @mouseenter="activeIndex = index"
                @click="choose(entry)"
              >
                <span class="palette-label">{{ entry.label }}</span>
                <span class="palette-hint">{{ entry.hint }}</span>
                <span class="palette-arrow" aria-hidden="true">↵</span>
              </button>
            </template>
            <div v-if="!filtered.length" class="palette-empty">
              没有找到匹配结果，试试「市场」「YOLO」「A100」。
            </div>
          </div>

          <div class="palette-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>↵</kbd> 打开</span>
            <span><kbd>esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-root {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh var(--gutter) 0;
}

.palette-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.62);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

.palette {
  position: relative;
  width: min(620px, 100%);
  max-height: 68vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid var(--line-2);
  background: rgba(20, 20, 23, 0.92);
  -webkit-backdrop-filter: saturate(160%) blur(28px);
  backdrop-filter: saturate(160%) blur(28px);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.palette-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  color: var(--text-3);
}

.palette-input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: none;
  outline: none;
  color: var(--text);
  font-size: 1rem;
}

.palette-input::placeholder {
  color: var(--text-3);
}

.palette-esc {
  padding: 3px 7px;
  border-radius: 6px;
  border: 1px solid var(--line-2);
  font-size: 0.625rem;
  letter-spacing: 0.06em;
  color: var(--text-3);
}

.palette-results {
  overflow-y: auto;
  padding: 8px;
}

.palette-group {
  padding: 10px 12px 6px;
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-3);
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 10px;
  text-align: left;
  color: var(--text);
}

.palette-item.is-active {
  background: var(--surface-2);
}

.palette-label {
  font-size: 0.9375rem;
  white-space: nowrap;
}

.palette-hint {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-arrow {
  width: 16px;
  text-align: right;
  color: var(--text-3);
  opacity: 0;
}

.palette-item.is-active .palette-arrow {
  opacity: 1;
}

.palette-empty {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-3);
  font-size: 0.875rem;
}

.palette-foot {
  display: flex;
  gap: 18px;
  padding: 10px 20px;
  border-top: 1px solid var(--line);
  color: var(--text-3);
  font-size: 0.6875rem;
}

.palette-foot kbd {
  display: inline-block;
  min-width: 16px;
  margin-right: 4px;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid var(--line-2);
  font-family: var(--font);
  text-align: center;
  color: var(--text-2);
}

.palette-enter-active,
.palette-leave-active {
  transition: opacity var(--dur-1) var(--ease);
}

.palette-enter-active .palette,
.palette-leave-active .palette {
  transition: transform var(--dur-2) var(--ease), opacity var(--dur-2) var(--ease);
}

.palette-enter-from,
.palette-leave-to {
  opacity: 0;
}

.palette-enter-from .palette,
.palette-leave-to .palette {
  transform: translateY(-12px) scale(0.98);
  opacity: 0;
}

@media (max-width: 640px) {
  .palette-root {
    padding-top: 10vh;
  }
  .palette-hint {
    display: none;
  }
}
</style>
