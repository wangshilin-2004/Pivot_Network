<script setup lang="ts">
import { useOfferStore } from '../stores/offers'
import PanelHeader from '../components/common/PanelHeader.vue'
import AlgorithmCard from '../components/cards/AlgorithmCard.vue'
import InlineExplainer from '../components/common/InlineExplainer.vue'
import EmptyState from '../components/common/EmptyState.vue'

const offers = useOfferStore()
</script>

<template>
  <section class="content-panel">
    <PanelHeader
      eyebrow="算法工坊" title="算法模板"
      tip="如果你已经有任务目标，可以先在这里看推荐算法，再倒推适合的算力配置。"
    />
    <InlineExplainer summary="查看使用说明" description="你可以根据任务类型、推荐资源、预计时长和输出结果，快速判断该选择哪种算法模板。" />

    <EmptyState
      v-if="offers.algorithms.length === 0"
      title="暂无算法模板"
      description="平台尚未配置算法模板，敬请期待。"
    />

    <div v-else class="algorithm-list section-space">
      <AlgorithmCard
        v-for="algo in offers.algorithms"
        :key="algo.id"
        :algorithm="algo"
      />
    </div>
  </section>
</template>
