<script setup lang="ts">
import { useOfferStore } from '../stores/offers'
import PanelHeader from '../components/common/PanelHeader.vue'
import OfferCard from '../components/cards/OfferCard.vue'
import InlineExplainer from '../components/common/InlineExplainer.vue'
import EmptyState from '../components/common/EmptyState.vue'
import SkeletonCard from '../components/common/SkeletonCard.vue'

const emit = defineEmits<{ (e: 'open-checkout', offerId: string): void }>()
const offers = useOfferStore()
</script>

<template>
  <div class="market-grid single-focus-grid">
    <section class="content-panel market-surface">
      <PanelHeader
        eyebrow="资源市场" title="可用算力资源"
        tip="如果你准备启动任务，可以先在这里比较资源配置、可用状态和价格，再选择合适的实例。"
        :badge="offers.loading ? '加载中...' : `${offers.offers.length} 个资源`"
      />
      <InlineExplainer summary="查看选购说明" description="建议先根据任务类型确定所需 GPU，再结合资源状态、区域位置和使用成本选择更合适的算力资源。" />

      <div v-if="offers.loading" class="market-list-table section-space">
        <SkeletonCard v-for="i in 3" :key="i" :lines="4" />
      </div>

      <template v-else>
        <EmptyState
          v-if="offers.offers.length === 0"
          title="暂无可用资源"
          description="当前卖家尚未发布任何算力资源，请稍后再来。"
        />
        <div v-else class="market-list-table section-space">
          <OfferCard
            v-for="offer in offers.offers"
            :key="offer.id"
            :offer="offer"
            @buy="emit('open-checkout', $event)"
          />
        </div>
      </template>
    </section>
  </div>
</template>
