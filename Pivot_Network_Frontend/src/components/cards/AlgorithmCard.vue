<script setup lang="ts">
import type { AlgorithmTemplate } from '../../types/domain'

defineProps<{ algorithm: AlgorithmTemplate }>()
</script>

<template>
  <article class="algorithm-card compact-card">
    <div class="algorithm-card-top">
      <div>
        <div class="eyebrow">{{ algorithm.type }}</div>
        <h4>{{ algorithm.name }}</h4>
      </div>
      <span class="badge">{{ algorithm.duration }}</span>
    </div>
    <div class="spec-grid compact-spec-grid">
      <div class="spec"><span>推荐资源</span><strong>{{ algorithm.recommendation }}</strong></div>
      <div class="spec"><span>成本提示</span><strong>{{ algorithm.priceHint }}</strong></div>
      <div class="spec"><span>主要输出</span><strong>{{ algorithm.outputs[0] }}</strong></div>
    </div>
  </article>
</template>
