<script setup lang="ts">
import { useOfferStore } from '../stores/offers'
import PanelHeader from '../components/common/PanelHeader.vue'
import SellerOfferForm from '../components/SellerOfferForm.vue'
import ActivityItem from '../components/cards/ActivityItem.vue'

const offers = useOfferStore()

function handlePublish(payload: { title: string; region: string; gpu: string; cpu: string; memory: string; price: number; image: string }) {
  offers.publishOffer(payload)
}
</script>

<template>
  <div class="seller-grid">
    <section class="content-panel">
      <PanelHeader
        eyebrow="卖家控制台" title="资源发布"
        tip="如果你想把自己的算力资源接入平台，可以在这里填写配置、价格和运行镜像后提交发布。"
      />
      <SellerOfferForm @publish="handlePublish" />
    </section>

    <section class="content-panel">
      <PanelHeader
        eyebrow="资源记录" title="发布记录"
        tip="这里会显示你最近提交或已经发布的资源，方便你查看当前状态。"
      />
      <div class="activity-list">
        <ActivityItem
          v-for="draft in offers.sellerDrafts"
          :key="draft.title + draft.price"
          :label="draft.title"
          :description="`${draft.gpu} · ${draft.price}`"
          :badge="draft.status"
        />
      </div>
    </section>
  </div>
</template>
