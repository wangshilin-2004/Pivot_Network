<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { AlgorithmTemplate, Offer } from '../types/domain'

const props = defineProps<{
  visible: boolean
  offer: Offer | null
  algorithms: AlgorithmTemplate[]
  algorithmId: string
  duration: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:algorithmId', v: string): void
  (e: 'update:duration', v: number): void
  (e: 'submit'): void
}>()

const estimatedCost = computed(() => {
  if (!props.offer) return 0
  return Math.round((props.offer.price * props.duration) / 60)
})

const selectedAlgorithm = computed(() =>
  props.algorithms.find((item) => item.id === props.algorithmId),
)

const drawerRef = ref<HTMLElement | null>(null)
let restoreFocus: HTMLElement | null = null

function focusables(): HTMLElement[] {
  return Array.from(
    drawerRef.value?.querySelectorAll<HTMLElement>(
      'button, select, input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
    ) ?? [],
  ).filter((el) => !el.hasAttribute('disabled'))
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab') return
  const list = focusables()
  if (!list.length) return
  const first = list[0]
  const last = list[list.length - 1]
  if (event.shiftKey && (document.activeElement === first || document.activeElement === drawerRef.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      restoreFocus = document.activeElement as HTMLElement | null
      window.addEventListener('keydown', onKeydown)
      await nextTick()
      drawerRef.value?.focus()
    } else {
      window.removeEventListener('keydown', onKeydown)
      restoreFocus?.focus?.()
      restoreFocus = null
    }
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible" class="drawer-root">
        <div class="drawer-backdrop" @click="emit('close')" />
        <aside
          ref="drawerRef"
          class="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="创建资源订单"
          tabindex="-1"
        >
          <header class="drawer-header">
            <div>
              <div class="eyebrow">Checkout</div>
              <h2 class="drawer-title">确认运行配置</h2>
            </div>
            <button class="btn-icon" type="button" aria-label="关闭" @click="emit('close')">✕</button>
          </header>

          <div v-if="offer" class="drawer-body">
            <div class="offer-summary">
              <div class="offer-summary-top">
                <span class="offer-name">{{ offer.title }}</span>
                <span class="offer-price">{{ offer.price }} <small>{{ offer.unit }}</small></span>
              </div>
              <div class="offer-meta">
                <span>{{ offer.gpu }}</span>
                <span>{{ offer.cpu }}</span>
                <span>{{ offer.region }}</span>
              </div>
            </div>

            <label class="field">
              <span class="field-label">算法模板</span>
              <select
                class="select"
                :value="algorithmId"
                @change="emit('update:algorithmId', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="item in algorithms" :key="item.id" :value="item.id">
                  {{ item.name }} · {{ item.recommendation }}
                </option>
              </select>
            </label>
            <p v-if="selectedAlgorithm" class="hint">{{ selectedAlgorithm.description }}</p>

            <label class="field">
              <span class="field-label">使用时长</span>
              <select
                class="select"
                :value="duration"
                @change="emit('update:duration', Number(($event.target as HTMLSelectElement).value))"
              >
                <option :value="60">60 分钟</option>
                <option :value="180">180 分钟</option>
                <option :value="360">360 分钟</option>
                <option :value="720">720 分钟</option>
              </select>
            </label>

            <div class="cost-box">
              <div>
                <div class="cost-label">预估费用</div>
                <div class="cost-note">按实际运行时长计费，结束即停止</div>
              </div>
              <div class="cost-value">¥{{ estimatedCost }}</div>
            </div>

            <ul class="checkout-points">
              <li>下单后自动签发 AccessGrant，并编排隔离的 RuntimeSession</li>
              <li>运行环境通过 WireGuard 隧道访问，不暴露卖家宿主机</li>
              <li>会话结束后工作区与日志保留，可随时回看</li>
            </ul>
          </div>

          <footer class="drawer-footer">
            <button class="btn btn--secondary" type="button" @click="emit('close')">取消</button>
            <button class="btn btn--primary" type="button" @click="emit('submit')">确认下单</button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  justify-content: flex-end;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.drawer {
  position: relative;
  width: min(440px, 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a0a0c;
  border-left: 1px solid var(--line-2);
  box-shadow: -40px 0 120px rgba(0, 0, 0, 0.7);
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 20px;
  border-bottom: 1px solid var(--line);
}

.drawer-title {
  margin-top: 8px;
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: -0.025em;
}

.drawer-body {
  display: grid;
  gap: 20px;
  padding: 24px 28px;
  flex: 1;
}

.offer-summary {
  padding: 18px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--surface);
}

.offer-summary-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.offer-name {
  font-size: 1.0625rem;
  font-weight: 600;
}

.offer-price {
  font-size: 1.25rem;
  font-weight: 650;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.offer-price small {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-3);
}

.offer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 10px;
  font-size: 0.8125rem;
  color: var(--text-3);
}

.cost-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: var(--radius);
  border: 1px solid rgba(41, 151, 255, 0.3);
  background: rgba(41, 151, 255, 0.08);
}

.cost-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-2);
}

.cost-note {
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-3);
}

.cost-value {
  font-size: 2rem;
  font-weight: 650;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.checkout-points {
  display: grid;
  gap: 10px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--text-3);
}

.checkout-points li {
  position: relative;
  padding-left: 18px;
}

.checkout-points li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--green);
  font-size: 0.75rem;
}

.drawer-footer {
  display: flex;
  gap: 10px;
  padding: 20px 28px 28px;
  border-top: 1px solid var(--line);
  position: sticky;
  bottom: 0;
  background: #0a0a0c;
}

.drawer-footer .btn {
  flex: 1;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--dur-2) var(--ease);
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform var(--dur-3) var(--ease);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .drawer {
    width: 100%;
  }
}
</style>
