<script setup lang="ts">
import type { AlgorithmTemplate } from '../../types/domain'

defineProps<{ algorithm: AlgorithmTemplate }>()
</script>

<template>
  <article class="panel panel--pad panel--hover algo-card">
    <header class="algo-head">
      <div class="algo-ident">
        <div class="eyebrow">{{ algorithm.type }}</div>
        <h3 class="algo-name">{{ algorithm.name }}</h3>
      </div>
      <span class="badge badge--blue algo-duration">{{ algorithm.duration }}</span>
    </header>

    <p class="algo-desc">{{ algorithm.description }}</p>

    <dl class="algo-specs">
      <div class="algo-spec">
        <dt class="kv-label">推荐资源</dt>
        <dd class="algo-spec-value">{{ algorithm.recommendation }}</dd>
      </div>
      <div class="algo-spec">
        <dt class="kv-label">成本提示</dt>
        <dd class="algo-spec-value">{{ algorithm.priceHint }}</dd>
      </div>
    </dl>

    <div class="algo-outputs">
      <span class="kv-label">输出物</span>
      <div class="chip-row">
        <span v-for="output in algorithm.outputs" :key="output" class="chip chip--static">
          {{ output }}
        </span>
      </div>
    </div>

    <footer class="algo-foot">
      <RouterLink to="/marketplace" class="btn btn--ghost">
        用这个模板开始
        <span aria-hidden="true">›</span>
      </RouterLink>
      <span class="algo-hint">在资源市场选择实例后绑定</span>
    </footer>
  </article>
</template>

<style scoped>
.algo-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* ---------- head ---------- */
.algo-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.algo-ident {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.algo-name {
  font-size: 1.375rem;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--text);
}

.algo-duration {
  flex: none;
}

.algo-desc {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--text-2);
  text-wrap: pretty;
}

/* ---------- specs ---------- */
.algo-specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.algo-spec {
  display: grid;
  gap: 4px;
  margin: 0;
  min-width: 0;
}

.algo-spec-value {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text);
}

/* ---------- outputs ---------- */
.algo-outputs {
  display: grid;
  gap: 10px;
}

.chip--static {
  height: 26px;
  pointer-events: none;
}

/* ---------- footer ---------- */
.algo-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin-top: auto;
  padding-top: 4px;
}

.algo-hint {
  font-size: 0.75rem;
  color: var(--text-3);
}

@media (max-width: 640px) {
  .algo-foot {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
