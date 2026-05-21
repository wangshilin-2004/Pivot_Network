<script setup lang="ts">
import type { Offer } from '../../types/domain'

defineProps<{ offer: Offer }>()
const emit = defineEmits<{ (e: 'buy', id: string): void }>()
</script>

<template>
  <article class="market-row">
    <div class="market-row-main">
      <div class="market-row-title">
        <div class="eyebrow">{{ offer.region }}</div>
        <h4>{{ offer.title }}</h4>
      </div>
      <div class="market-tags">
        <span v-for="tag in offer.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <div class="market-row-specs">
      <div class="market-stat"><span>GPU</span><strong>{{ offer.gpu }}</strong></div>
      <div class="market-stat"><span>CPU</span><strong>{{ offer.cpu }}</strong></div>
      <div class="market-stat"><span>内存</span><strong>{{ offer.memory }}</strong></div>
      <div class="market-stat"><span>状态</span><strong>{{ offer.status }}</strong></div>
    </div>
    <div class="market-row-action">
      <div class="offer-price market-price">{{ offer.price }}<small>{{ offer.unit }}</small></div>
      <button class="primary-button" @click="emit('buy', offer.id)">开通</button>
    </div>
  </article>
</template>
