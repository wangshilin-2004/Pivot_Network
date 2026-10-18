<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMonitorStore } from '../stores/monitor'
import { useOfferStore } from '../stores/offers'
import PageHeader from '../components/common/PageHeader.vue'
import EmptyState from '../components/common/EmptyState.vue'
import SkeletonCard from '../components/common/SkeletonCard.vue'
import OfferCard from '../components/cards/OfferCard.vue'

const emit = defineEmits<{ (e: 'open-checkout', offerId: string): void }>()

const offers = useOfferStore()
const monitor = useMonitorStore()

type SortKey = 'recommended' | 'price' | 'latency'

const tagFilters = ['全部', '训练', '推理', '多模态']
const gpuFilters = computed(() => ['全部', ...new Set(offers.offers.map((offer) => offer.gpu))])
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: '推荐排序' },
  { value: 'price', label: '价格从低到高' },
  { value: 'latency', label: '时延最低' },
]

const activeTag = ref('全部')
const activeGpu = ref('全部')
const sortKey = ref<SortKey>('recommended')

function parseLatency(value: string): number | null {
  const matched = value.match(/[\d.]+/)
  return matched ? Number(matched[0]) : null
}

const hasFilter = computed(() => activeTag.value !== '全部' || activeGpu.value !== '全部')

const minPrice = computed(() =>
  offers.offers.length ? Math.min(...offers.offers.map((offer) => offer.price)) : null,
)

const avgLatency = computed(() => {
  const values = offers.offers
    .map((offer) => parseLatency(offer.latency))
    .filter((value): value is number => value !== null)
  if (values.length === 0) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
})

const statCells = computed(() => {
  const loading = offers.loading || monitor.loading
  return [
    { label: '可售资源', value: loading ? '—' : String(offers.offers.length), unit: '个', tone: 'blue' },
    { label: '最低价格', value: loading || minPrice.value === null ? '—' : String(minPrice.value), unit: '元/时起', tone: 'green' },
    { label: '在线节点', value: loading ? '—' : String(monitor.summary.onlineNodes), unit: '台', tone: 'violet' },
    { label: '平均时延', value: loading || avgLatency.value === null ? '—' : String(avgLatency.value), unit: 'ms', tone: 'orange' },
  ]
})

const filteredOffers = computed(() => {
  const list = offers.offers.filter((offer) => {
    const tagMatched = activeTag.value === '全部' || offer.tags.includes(activeTag.value)
    const gpuMatched = activeGpu.value === '全部' || offer.gpu === activeGpu.value
    return tagMatched && gpuMatched
  })

  if (sortKey.value === 'price') {
    return [...list].sort((left, right) => left.price - right.price)
  }

  if (sortKey.value === 'latency') {
    return [...list].sort((left, right) => {
      const leftLatency = parseLatency(left.latency)
      const rightLatency = parseLatency(right.latency)
      if (leftLatency === null) return rightLatency === null ? 0 : 1
      if (rightLatency === null) return -1
      return leftLatency - rightLatency
    })
  }

  return list
})

function resetFilters() {
  activeTag.value = '全部'
  activeGpu.value = '全部'
}
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="stage-glow" aria-hidden="true" />

      <PageHeader
        eyebrow="Marketplace"
        title="资源市场"
        description="按任务标签、GPU 型号与价格比较在架实例；选中即可按小时开通，运行环境与镜像自动绑定。"
      >
        <RouterLink to="/algorithms" class="btn btn--primary">
          按算法选资源
          <span aria-hidden="true">→</span>
        </RouterLink>
      </PageHeader>

      <section v-reveal class="stat-band panel">
        <div v-for="stat in statCells" :key="stat.label" class="stat-cell">
          <div class="stat-num">
            {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
          <span class="stat-glow" :class="`stat-glow--${stat.tone}`" aria-hidden="true" />
        </div>
      </section>

      <section v-reveal="60" class="filter-panel panel">
        <div class="filter-row">
          <div class="filter-group">
            <span class="filter-label">标签</span>
            <div class="chip-row">
              <button
                v-for="tag in tagFilters"
                :key="tag"
                class="chip"
                :class="{ 'chip--on': activeTag === tag }"
                :aria-pressed="activeTag === tag"
                type="button"
                @click="activeTag = tag"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <div class="filter-group">
            <span class="filter-label">GPU 型号</span>
            <div class="chip-row">
              <button
                v-for="gpu in gpuFilters"
                :key="gpu"
                class="chip"
                :class="{ 'chip--on': activeGpu === gpu }"
                :aria-pressed="activeGpu === gpu"
                type="button"
                @click="activeGpu = gpu"
              >
                {{ gpu }}
              </button>
            </div>
          </div>

          <div class="filter-group filter-sort">
            <label class="filter-label" for="market-sort">排序</label>
            <select
              id="market-sort"
              class="select filter-select"
              :value="sortKey"
              @change="sortKey = ($event.target as HTMLSelectElement).value as SortKey"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <div class="list-head">
        <span class="caption">
          {{ hasFilter ? '筛选结果' : '在架资源' }} ·
          {{ offers.loading ? '加载中' : `${filteredOffers.length} 个` }}
        </span>
        <button v-if="hasFilter" class="btn btn--ghost" type="button" @click="resetFilters">
          清除筛选
        </button>
      </div>

      <div v-if="offers.loading" class="market-list">
        <SkeletonCard v-for="index in 3" :key="index" :lines="3" />
      </div>

      <EmptyState
        v-else-if="offers.offers.length === 0"
        title="暂无可用资源"
        description="当前卖家尚未发布任何算力资源，请稍后再来。"
      />

      <EmptyState
        v-else-if="filteredOffers.length === 0"
        title="没有符合条件的资源"
        description="试着切换标签或 GPU 型号，或者清除全部筛选条件。"
        action-label="清除筛选"
        @action="resetFilters"
      />

      <div v-else class="market-list">
        <OfferCard
          v-for="(offer, index) in filteredOffers"
          :key="offer.id"
          v-reveal="Math.min(index, 7) * 70"
          :offer="offer"
          @buy="emit('open-checkout', $event)"
        />
      </div>

      <p class="market-note small">
        演示环境使用 Mock 示例数据，按小时计费；下单后将自动签发访问授权并编排运行会话。
      </p>
    </div>
  </div>
</template>

<style scoped>
.stage-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 560px;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(58% 66% at 50% 0%, rgba(41, 151, 255, 0.14), transparent 72%),
    radial-gradient(34% 46% at 88% 8%, rgba(191, 90, 242, 0.08), transparent 74%);
}

/* ---------- stat band ---------- */
.stat-band {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20px;
}

.stat-cell {
  position: relative;
  overflow: hidden;
  padding: 26px 28px;
  border-left: 1px solid var(--line);
}

.stat-cell:first-child {
  border-left: 0;
}

.stat-num {
  font-size: clamp(2.2rem, 3.4vw, 3rem);
  font-weight: 650;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.stat-unit {
  margin-left: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--text-3);
}

.stat-label {
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--text-3);
}

.stat-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
  pointer-events: none;
}

.stat-glow--blue {
  background: rgba(41, 151, 255, 0.4);
}

.stat-glow--green {
  background: rgba(48, 209, 88, 0.4);
}

.stat-glow--violet {
  background: rgba(191, 90, 242, 0.4);
}

.stat-glow--orange {
  background: rgba(255, 159, 10, 0.35);
}

/* ---------- filter bar ---------- */
.filter-panel {
  margin-bottom: 20px;
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 32px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.filter-label {
  flex: none;
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
}

.filter-sort {
  margin-left: auto;
}

.filter-select {
  width: auto;
  min-width: 168px;
  height: 34px;
  min-height: 34px;
  padding: 0 34px 0 14px;
  font-size: 0.8125rem;
  border-radius: var(--radius-pill);
}

/* ---------- list ---------- */
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 34px;
  margin-bottom: 14px;
}

.market-list {
  display: grid;
  gap: 14px;
}

.market-note {
  margin-top: 28px;
  text-align: center;
  color: var(--text-3);
}

/* ---------- responsive ---------- */
@media (max-width: 1120px) {
  .stat-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat-cell {
    border-top: 1px solid var(--line);
  }

  .stat-cell:nth-child(-n + 2) {
    border-top: 0;
  }

  .stat-cell:nth-child(odd) {
    border-left: 0;
  }

  .filter-sort {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .filter-panel {
    padding: 18px 20px;
  }

  .filter-row {
    gap: 14px;
  }

  .filter-group {
    flex-wrap: wrap;
    gap: 8px 12px;
    width: 100%;
  }

  .filter-sort {
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }

  .stat-cell {
    padding: 20px;
  }

  .list-head {
    flex-wrap: wrap;
    gap: 10px;
  }

  .market-note {
    margin-top: 24px;
    text-align: left;
  }
}
</style>
