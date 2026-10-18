<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOfferStore } from '../stores/offers'
import PageHeader from '../components/common/PageHeader.vue'
import EmptyState from '../components/common/EmptyState.vue'
import AlgorithmCard from '../components/cards/AlgorithmCard.vue'

const offers = useOfferStore()

const activeType = ref('全部')
const typeFilters = computed(() => ['全部', ...new Set(offers.algorithms.map((algorithm) => algorithm.type))])

const filteredAlgorithms = computed(() => {
  if (activeType.value === '全部') return offers.algorithms
  return offers.algorithms.filter((algorithm) => algorithm.type === activeType.value)
})
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="stage-glow" aria-hidden="true" />

      <PageHeader
        eyebrow="Algorithms"
        title="算法工坊"
        description="覆盖视觉推理、大模型微调与遥感分析的模板库，选定模板后去资源市场绑定一台实例即可开始运行。"
      >
        <RouterLink to="/marketplace" class="btn btn--primary">
          去选资源
          <span aria-hidden="true">→</span>
        </RouterLink>
      </PageHeader>

      <section v-reveal class="filter-panel panel">
        <div class="filter-row">
          <span class="filter-label">任务类型</span>
          <div class="chip-row">
            <button
              v-for="type in typeFilters"
              :key="type"
              class="chip"
              :class="{ 'chip--on': activeType === type }"
              :aria-pressed="activeType === type"
              type="button"
              @click="activeType = type"
            >
              {{ type }}
            </button>
          </div>
          <span class="filter-count mono">{{ filteredAlgorithms.length }} 个模板</span>
        </div>
      </section>

      <EmptyState
        v-if="offers.algorithms.length === 0"
        title="暂无算法模板"
        description="平台尚未配置可用的算法模板，敬请期待。"
      />

      <EmptyState
        v-else-if="filteredAlgorithms.length === 0"
        title="该类型暂无模板"
        description="换个任务类型看看，或者查看全部可用的算法模板。"
        action-label="查看全部"
        @action="activeType = '全部'"
      />

      <div v-else class="grid grid--2 algo-grid">
        <AlgorithmCard
          v-for="(algorithm, index) in filteredAlgorithms"
          :key="algorithm.id"
          v-reveal="Math.min(index, 7) * 70"
          :algorithm="algorithm"
        />
      </div>

      <p class="algo-note small">
        选定模板后前往资源市场按需挑选实例；下单时模板会自动绑定到运行会话，镜像开箱即用。
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

/* ---------- filter bar ---------- */
.filter-panel {
  margin-bottom: 20px;
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
}

.filter-label {
  flex: none;
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-3);
}

.filter-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-3);
  white-space: nowrap;
}

/* ---------- template grid ---------- */
.algo-grid {
  margin-top: 4px;
}

.algo-note {
  margin-top: 32px;
  text-align: center;
  color: var(--text-3);
}

@media (max-width: 1120px) {
  .algo-grid {
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .filter-panel {
    padding: 18px 20px;
  }

  .filter-row {
    gap: 10px 14px;
  }

  .filter-count {
    margin-left: 0;
    width: 100%;
  }

  .algo-note {
    margin-top: 24px;
    text-align: left;
  }
}
</style>
