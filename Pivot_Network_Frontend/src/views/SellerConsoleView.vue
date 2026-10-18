<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useOfferStore } from '../stores/offers'
import { useMonitorStore } from '../stores/monitor'
import { useSessionStore } from '../stores/session'
import PageHeader from '../components/common/PageHeader.vue'
import PanelHeader from '../components/common/PanelHeader.vue'
import SellerOfferForm from '../components/SellerOfferForm.vue'
import ActivityItem from '../components/cards/ActivityItem.vue'

const offers = useOfferStore()
const monitor = useMonitorStore()
const session = useSessionStore()

const formRef = ref<HTMLElement | null>(null)
const formFlash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined

const activeSessions = computed(() => (session.session.status === '运行中' ? 1 : 0))
const onlineRate = computed(() => {
  const total = monitor.nodes.length
  if (!total) return 0
  const healthy = monitor.nodes.filter((node) => node.status === 'healthy').length
  return Math.round((healthy / total) * 100)
})

const stats = computed(() => [
  { label: '已接入节点', value: String(monitor.nodes.length), unit: '台', tone: 'ok' },
  { label: '运行中', value: String(activeSessions.value), unit: '个会话', tone: 'blue' },
  { label: '在线率', value: String(onlineRate.value), unit: '%', tone: 'violet' },
])

function handlePublish(payload: {
  title: string
  region: string
  gpu: string
  cpu: string
  memory: string
  price: number
  image: string
}) {
  offers.publishOffer(payload)
}

function focusForm() {
  formFlash.value = false
  window.requestAnimationFrame(() => {
    formFlash.value = true
  })
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    formFlash.value = false
  }, 1600)

  void nextTick(() => {
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    formRef.value?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
  })
}

onBeforeUnmount(() => {
  if (flashTimer) clearTimeout(flashTimer)
})
</script>

<template>
  <div class="page">
    <div class="container">
      <PageHeader
        eyebrow="Seller"
        title="卖家控制台"
        description="把闲置算力接入 Pivot，填写规格与定价即可进入审核队列。"
      >
        <button class="btn btn--primary" type="button" @click="focusForm">发布新资源</button>
      </PageHeader>

      <section v-reveal class="stat-band panel">
        <div v-for="stat in stats" :key="stat.label" class="stat-band-item">
          <div class="stat">
            <div class="stat-num">
              {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <span class="stat-glow" :class="`stat-glow--${stat.tone}`" aria-hidden="true" />
        </div>
      </section>

      <div class="seller-grid">
        <section
          id="publish-form"
          ref="formRef"
          v-reveal="60"
          class="panel panel--pad form-panel"
          :class="{ 'is-flash': formFlash }"
        >
          <PanelHeader
            eyebrow="New Offer"
            title="上架新资源"
            tip="填写实例规格、区域与单价，提交后进入平台审核队列；审核通过即出现在算力市场。"
          />
          <SellerOfferForm @publish="handlePublish" />
        </section>

        <aside v-reveal="120" class="panel panel--pad draft-panel">
          <PanelHeader
            eyebrow="Drafts"
            title="发布记录"
            tip="这里显示最近提交或已经发布的资源，审核状态会随平台处理实时更新。"
          >
            <span class="badge badge--blue">{{ offers.sellerDrafts.length }} 条</span>
          </PanelHeader>

          <div v-if="offers.sellerDrafts.length" class="list">
            <ActivityItem
              v-for="draft in offers.sellerDrafts"
              :key="draft.title + draft.price"
              :label="draft.title"
              :description="`${draft.gpu} · ${draft.price}`"
              :badge="draft.status"
            />
          </div>
          <p v-else class="draft-empty">还没有发布记录，提交第一份资源后会显示在这里。</p>

          <div class="hairline draft-divider" />

          <div class="draft-note">
            <span class="draft-note-mark" aria-hidden="true">›</span>
            <p class="draft-note-text">
              审核通常在 10 分钟内完成。通过后资源自动上架，按小时计费结算。
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ---------- stat band ---------- */
.stat-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 20px;
}

.stat-band-item {
  position: relative;
  padding: 26px 28px;
  border-left: 1px solid var(--line);
  overflow: hidden;
}

.stat-band-item:first-child {
  border-left: 0;
}

.stat-num {
  font-size: clamp(2.2rem, 3.4vw, 3rem);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.stat-unit {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-3);
  margin-left: 4px;
  letter-spacing: 0;
}

.stat-label {
  margin-top: 10px;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  text-transform: none;
  color: var(--text-3);
}

.stat-glow {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
  pointer-events: none;
}

.stat-glow--ok {
  background: rgba(48, 209, 88, 0.4);
}
.stat-glow--blue {
  background: rgba(41, 151, 255, 0.4);
}
.stat-glow--violet {
  background: rgba(191, 90, 242, 0.4);
}

/* ---------- layout ---------- */
.seller-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.form-panel {
  scroll-margin-top: calc(var(--nav-h) + 24px);
  transition: border-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);
}

.form-panel.is-flash {
  border-color: rgba(41, 151, 255, 0.55);
  box-shadow: 0 0 0 3px rgba(41, 151, 255, 0.12);
}

/* ---------- draft panel ---------- */
.draft-panel {
  position: sticky;
  top: calc(var(--nav-h) + 24px);
}

.draft-empty {
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--text-3);
  text-wrap: pretty;
}

.draft-divider {
  margin: 20px 0;
}

.draft-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.draft-note-mark {
  color: var(--blue);
  line-height: 1.5;
  flex: none;
}

.draft-note-text {
  font-size: var(--fs-xs);
  line-height: 1.65;
  color: var(--text-3);
  text-wrap: pretty;
}

/* ---------- responsive ---------- */
@media (max-width: 1120px) {
  .seller-grid {
    grid-template-columns: 1fr;
  }

  .draft-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .stat-band {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stat-band-item {
    padding: 18px 16px;
  }

  .stat-num {
    font-size: 1.75rem;
  }

  .stat-unit {
    display: block;
    margin-left: 0;
    margin-top: 4px;
    font-size: 0.75rem;
  }
}
</style>
